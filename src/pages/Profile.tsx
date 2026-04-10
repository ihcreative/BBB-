import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Briefcase, Clock, ShieldCheck, Edit3, ExternalLink, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { user, member, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !member) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-8">
          <User className="w-10 h-10 text-neutral-700" />
        </div>
        <h1 className="text-3xl font-serif mb-4">Profile Not Found</h1>
        <p className="text-neutral-500 max-w-sm font-light">
          You must be a member to view this page. If you haven't applied yet, please head to the application page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header/Cover */}
        <div className="relative h-48 rounded-3xl overflow-hidden mb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.05)_0%,transparent_50%)]" />
          
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-neutral-800 border-4 border-neutral-950 overflow-hidden shadow-2xl">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-full h-full p-8 text-neutral-600" />
              )}
            </div>
            <div className="pb-4">
              <h1 className="text-3xl font-serif text-white mb-1">{member.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-gold-500 text-sm font-medium tracking-wider uppercase">{member.businessName}</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                  member.isApproved ? "bg-green-500/10 text-green-500" : "bg-gold-500/10 text-gold-500"
                )}>
                  {member.isApproved ? "Approved Member" : "Under Review"}
                </span>
              </div>
            </div>
          </div>

          <button className="absolute bottom-4 right-8 px-4 py-2 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-xl text-xs text-neutral-400 hover:text-white transition-all flex items-center gap-2">
            <Edit3 className="w-3 h-3" /> Edit Profile
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neutral-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{member.timeInBali} in Bali</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{member.collaborationHours} hrs/week</span>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800">
                <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-4">Social Links</div>
                <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/${member.socialLinks?.whatsapp?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-500 hover:text-gold-500 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-4">Membership Status</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Role</span>
                  <span className="text-sm text-white capitalize">{member.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Joined</span>
                  <span className="text-sm text-white">
                    {member.createdAt?.toDate ? new Date(member.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-xl font-serif mb-6">About the Business</h2>
              <p className="text-neutral-400 font-light leading-relaxed">
                {member.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  Offers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.offers.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-500" />
                  Needs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.needs.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {member.perks && member.perks.length > 0 && (
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-xl font-serif mb-6">Community Perks</h2>
                <div className="space-y-4">
                  {member.perks.map((perk: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                      <div>
                        <div className="text-sm font-medium text-white">{perk.title}</div>
                        <div className="text-xs text-neutral-500">Available to all approved members</div>
                      </div>
                      <div className="text-lg font-serif text-gold-500">{perk.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
