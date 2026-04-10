import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Sparkles, MessageCircle, ExternalLink, ChevronRight, User, ShieldCheck, Heart, Briefcase } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Member, Tag } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

export default function Directory() {
  const { member: currentMember, user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'perks' | 'matcher'>('all');
  const [selectedTag, setSelectedTag] = useState<Tag | 'all'>('all');

  // AI Matcher State
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (!currentMember?.isApproved) return;

    const q = query(
      collection(db, 'members'), 
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
      setLoading(false);
    });

    return unsubscribe;
  }, [currentMember]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           m.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'all' || m.offers.includes(selectedTag) || m.needs.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [members, searchTerm, selectedTag]);

  const runAiMatcher = async () => {
    if (!currentMember) return;
    setIsMatching(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare context for Gemini
      const otherMembers = members.filter(m => m.id !== currentMember.id);
      const context = otherMembers.map(m => ({
        id: m.id,
        name: m.name,
        business: m.businessName,
        offers: m.offers.join(', '),
        needs: m.needs.join(', ')
      }));

      const prompt = `
        You are the "Village Elder AI" for BBB (Bali Black Business). 
        Your goal is to find the best strategic matches for ${currentMember.name} (${currentMember.businessName}).
        
        ${currentMember.name}'s Offers: ${currentMember.offers.join(', ')}
        ${currentMember.name}'s Needs: ${currentMember.needs.join(', ')}
        
        Available Members:
        ${JSON.stringify(context)}
        
        Analyze the needs and offers of everyone. Find 3 members who would be the best collaborators for ${currentMember.name}.
        Return a JSON array of objects with:
        - memberId: string
        - reason: string (why they are a good match, be specific and encouraging)
        - synergyType: string (e.g., "Strategic Growth", "Creative Synergy", "Operational Support")
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                memberId: { type: Type.STRING },
                reason: { type: Type.STRING },
                synergyType: { type: Type.STRING }
              },
              required: ["memberId", "reason", "synergyType"]
            }
          }
        }
      });

      const matches = JSON.parse(response.text);
      setAiMatches(matches);
    } catch (error) {
      console.error("AI Matcher Error:", error);
    } finally {
      setIsMatching(false);
    }
  };

  if (!currentMember?.isApproved) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto blur-sm">
            <ShieldCheck className="w-10 h-10 text-gold-500" />
          </div>
          <h1 className="text-3xl font-serif">The Gates are Closed</h1>
          <p className="text-neutral-500 font-light">
            Your application is currently being reviewed by the village elders. 
            Access to the directory and AI matcher is granted only to approved members.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-gold-500 font-medium">
              <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
              Review in Progress
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif">The Village</h1>
            <p className="text-neutral-500 font-light">Connect with excellence. Build with the collective.</p>
          </div>
          
          <div className="flex bg-neutral-900 p-1 rounded-full border border-neutral-800">
            {(['all', 'perks', 'matcher'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium capitalize transition-all",
                  activeTab === tab ? "bg-gold-600 text-neutral-950" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {tab === 'all' ? 'Directory' : tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'all' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search by name, business, or expertise..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-12 pr-6 py-3 text-sm focus:border-gold-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                  <Filter className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                  {['all', 'design', 'development', 'marketing', 'wellness', 'events'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                        selectedTag === tag 
                          ? "bg-gold-500/10 border-gold-500 text-gold-500" 
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                      )}
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    className="glass-card rounded-2xl p-6 flex flex-col group hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-800 overflow-hidden border border-neutral-700 group-hover:border-gold-500/50 transition-colors">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-full h-full p-4 text-neutral-600" />
                        )}
                      </div>
                      <a 
                        href={`https://wa.me/${m.socialLinks?.whatsapp?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-500 hover:text-gold-500 hover:border-gold-500/50 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-serif text-white">{m.name}</h3>
                      <div className="text-gold-500 text-xs font-medium tracking-wider uppercase">{m.businessName}</div>
                      <p className="text-neutral-400 text-sm font-light line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="space-y-2">
                        <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> Offers
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.offers.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Heart className="w-3 h-3" /> Needs
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.needs.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'perks' && (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {members.flatMap(m => m.perks.map(p => ({ ...p, member: m }))).map((perk, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -mr-16 -mt-16" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                      <div className="text-gold-500 text-xs font-bold uppercase tracking-widest">Community Perk</div>
                      <h3 className="text-2xl font-serif text-white">{perk.title}</h3>
                    </div>
                    <div className="text-2xl font-serif text-gold-500">{perk.value}</div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-neutral-800">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                      <img src={perk.member.photo} alt={perk.member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{perk.member.name}</div>
                      <div className="text-xs text-neutral-500">{perk.member.businessName}</div>
                    </div>
                    <a 
                      href={`https://wa.me/${perk.member.socialLinks?.whatsapp?.replace(/\D/g, '')}?text=Hi ${perk.member.name}, I'm interested in your BBB perk: ${perk.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-gold-500 hover:text-gold-400 transition-colors"
                    >
                      Redeem <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'matcher' && (
            <motion.div
              key="matcher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-gold-500" />
                </div>
                <h2 className="text-3xl font-serif">Village Elder AI</h2>
                <p className="text-neutral-400 font-light max-w-lg mx-auto">
                  Our AI analyzes the collective's expertise and needs to find your most strategic collaborators.
                </p>
                <button
                  onClick={runAiMatcher}
                  disabled={isMatching}
                  className="px-10 py-4 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all disabled:opacity-50 shadow-xl shadow-gold-600/20"
                >
                  {isMatching ? 'Consulting the Elders...' : 'Find My Matches'}
                </button>
              </div>

              <div className="space-y-6">
                {aiMatches.map((match, idx) => {
                  const matchedMember = members.find(m => m.id === match.memberId);
                  if (!matchedMember) return null;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                      className="glass-card p-8 rounded-3xl border-l-4 border-l-gold-500"
                    >
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gold-500/10 text-gold-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold-500/20">
                              {match.synergyType}
                            </span>
                          </div>
                          <p className="text-neutral-300 font-light leading-relaxed italic">
                            "{match.reason}"
                          </p>
                        </div>
                        
                        <div className="w-full md:w-64 flex items-center gap-4 p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                          <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                            <img src={matchedMember.photo} alt={matchedMember.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{matchedMember.name}</div>
                            <div className="text-xs text-neutral-500 truncate">{matchedMember.businessName}</div>
                          </div>
                          <a 
                            href={`https://wa.me/${matchedMember.socialLinks?.whatsapp?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-500 hover:text-gold-400"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
