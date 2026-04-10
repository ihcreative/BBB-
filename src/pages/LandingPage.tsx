import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Sparkles, ArrowRight, Lock, Heart, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import { useAuth } from '@/lib/AuthContext';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Member, Event } from '@/types';

export default function LandingPage() {
  const { user, member, signIn } = useAuth();
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fetch approved members for showcase
    const membersQuery = query(
      collection(db, 'members'),
      where('isApproved', '==', true),
      where('publicVisibility', '==', true),
      limit(10)
    );
    
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
    });

    // Fetch upcoming events
    const eventsQuery = query(
      collection(db, 'events'),
      where('isPublic', '==', true),
      orderBy('date', 'asc'),
      limit(3)
    );

    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });

    return () => {
      unsubscribeMembers();
      unsubscribeEvents();
    };
  }, []);

  useEffect(() => {
    if (members.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMemberIndex((prev) => (prev + 1) % members.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [members]);

  return (
    <div className="min-h-screen bg-neutral-950 selection:bg-gold-500/30">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <span className="text-gold-500 font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
            Bali Black Business
          </span>
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
            Excellence in the <br />
            <span className="gold-text-gradient italic">Island of Gods</span>
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto text-lg mb-10 font-light leading-relaxed">
            A private sanctuary for Black creators, founders, and visionaries building the future in Bali. 
            <span className="block mt-2 text-gold-500/80 text-sm italic tracking-wide">By invitation. By excellence. By community.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {member ? (
              <Link
                to="/directory"
                className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-semibold rounded-full transition-all flex items-center justify-center gap-2 group"
              >
                Enter the Village
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/apply"
                className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-semibold rounded-full transition-all flex items-center justify-center gap-2 group"
              >
                Apply to Join
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {!user && (
              <button 
                onClick={signIn}
                className="px-8 py-4 bg-neutral-900 border border-neutral-800 hover:border-gold-500/50 text-neutral-100 font-semibold rounded-full transition-all flex items-center justify-center gap-2"
              >
                Member Sign In
                <LogIn className="w-4 h-4 text-gold-500" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Member Count Scarcity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-neutral-500 text-sm"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Member" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <span>84 Members • 16 Spots Remaining</span>
        </motion.div>
      </section>

      {/* Vision & Vibe */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-snug">
              More than a directory. <br />
              <span className="text-gold-500 italic">An Adventure in Excellence.</span>
            </h2>
            <div className="space-y-6 text-neutral-400 font-light leading-relaxed">
              <p>
                BBB is a curated ecosystem for the Black diaspora in Bali. We are a "secret society" of sorts—not the scary kind, but the kind that feels like a shared adventure.
              </p>
              <p>
                We travel together, mentor one another, host exclusive talks, and self-promote with pride. When one of us wins, the entire village ascends.
              </p>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-2xl overflow-hidden glass-card p-1">
            <img 
              src="https://images.unsplash.com/photo-1530419248307-be80b9468e77?auto=format&fit=crop&q=80&w=1000" 
              alt="Bali Vibe" 
              className="w-full h-full object-cover rounded-xl opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Criteria Section */}
      <section className="py-24 px-6 bg-neutral-900/20 border-y border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-12">The Keys to the Village</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-gold-500 font-serif text-4xl">1yr+</div>
              <p className="text-neutral-400 text-sm font-light">Established in Bali for at least one year.</p>
            </div>
            <div className="space-y-4">
              <div className="text-gold-500 font-serif text-4xl">Active</div>
              <p className="text-neutral-400 text-sm font-light">Actively contributing to the community's growth.</p>
            </div>
            <div className="space-y-4">
              <div className="text-gold-500 font-serif text-4xl">Referral</div>
              <p className="text-neutral-400 text-sm font-light">Ideally referred by an existing member of the circle.</p>
            </div>
          </div>
          <p className="mt-12 text-neutral-500 text-sm italic">
            "If we don't know you yet, let this be the bridge."
          </p>
        </div>
      </section>

      {/* Rotating Member Showcase */}
      <section className="py-24 bg-neutral-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-8 h-8 text-gold-500 mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-serif mb-12 text-neutral-300">The Faces of BBB</h3>
          
          <div className="h-32 relative flex items-center justify-center">
            {members.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMemberIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="absolute"
                >
                  <div className="text-3xl md:text-4xl font-serif text-white mb-2">
                    {members[currentMemberIndex].name}
                  </div>
                  <div className="text-gold-500 tracking-widest uppercase text-xs font-medium">
                    {members[currentMemberIndex].businessName}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-neutral-600 font-serif italic">Excellence is arriving...</div>
            )}
          </div>
        </div>
      </section>

      {/* Events Calendar */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-serif">Upcoming Gatherings</h2>
          <Calendar className="text-gold-500 w-6 h-6" />
        </div>
        
        <div className="space-y-4">
          {events.length > 0 ? events.map((event, idx) => (
            <div 
              key={idx}
              className="glass-card p-6 rounded-2xl flex items-center justify-between hover:border-gold-500/30 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div className="text-gold-500 font-serif text-xl w-16">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </div>
                <div>
                  <div className="text-white font-medium mb-1 group-hover:text-gold-200 transition-colors">
                    {event.title}
                  </div>
                  <div className="text-neutral-500 text-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {event.area}
                  </div>
                </div>
              </div>
              <Lock className="w-4 h-4 text-neutral-700" />
            </div>
          )) : (
            <div className="text-center py-12 glass-card rounded-2xl text-neutral-500 font-light italic">
              Gatherings are being prepared. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* AI Matcher Preview */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden glass-card p-12 text-center">
          <div className="absolute inset-0 bg-gold-500/5" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-8 h-8 text-gold-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-6">AI Collaboration Matcher</h2>
            <p className="text-neutral-400 max-w-lg mx-auto mb-12 font-light">
              Our proprietary AI analyzes your business needs and offers to find your perfect strategic partners within the community.
            </p>
            
            <div className="relative max-w-2xl mx-auto opacity-40 blur-md pointer-events-none select-none mb-12">
              <div className="glass-card p-6 rounded-xl flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-1/3" />
                  <div className="h-3 bg-neutral-800 rounded w-2/3" />
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/40 backdrop-blur-[2px]">
              <div className="bg-neutral-900/90 border border-gold-500/30 px-6 py-3 rounded-full flex items-center gap-3 text-gold-500 font-medium">
                <Lock className="w-4 h-4" />
                Members Only Feature
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-900 text-center">
        <div className="text-gold-500 font-serif text-2xl mb-4">BBB</div>
        <p className="text-neutral-600 text-sm font-light">
          Bali Black Business © 2024 • Excellence is our standard.
        </p>
      </footer>
    </div>
  );
}
