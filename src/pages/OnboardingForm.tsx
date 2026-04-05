import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Upload, Briefcase, Heart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TAG_OPTIONS, COLLABORATION_OPTIONS } from '@/constants';
import { Tag } from '@/types';
import { Link } from 'react-router-dom';

import { useAuth } from '@/lib/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export default function OnboardingForm() {
  const { user, signIn } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    description: '',
    timeInBali: '',
    referralSource: '',
    whatsapp: '',
    offers: [] as Tag[],
    needs: [] as Tag[],
    perks: [{ title: '', value: '' }],
    collaborationHours: '1-2',
    publicVisibility: true,
  });

  const totalSteps = 4;

  const handleSubmit = async () => {
    if (!user) {
      await signIn();
      return;
    }

    setIsSubmitting(true);
    try {
      const memberData = {
        uid: user.uid,
        name: formData.name || user.displayName || '',
        email: user.email || '',
        photo: user.photoURL || '',
        businessName: formData.businessName,
        description: formData.description,
        timeInBali: formData.timeInBali,
        referralSource: formData.referralSource,
        socialLinks: {
          whatsapp: formData.whatsapp,
        },
        offers: formData.offers,
        needs: formData.needs,
        perks: formData.perks.map((p, i) => ({ ...p, id: `perk_${i}` })),
        collaborationHours: formData.collaborationHours,
        isApproved: false,
        role: 'member',
        publicVisibility: formData.publicVisibility,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'members', user.uid), memberData);
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `members/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const toggleTag = (type: 'offers' | 'needs', tag: Tag) => {
    setFormData((prev) => {
      const current = prev[type];
      if (current.includes(tag)) {
        return { ...prev, [type]: current.filter((t) => t !== tag) };
      }
      if (current.length < 3) {
        return { ...prev, [type]: [...current, tag] };
      }
      return prev;
    });
  };

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-3xl max-w-md w-full space-y-8"
        >
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-gold-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-serif">Application Received</h1>
            <p className="text-neutral-400 font-light leading-relaxed">
              Thank you for applying to the Bali Black Business collective. Our village elders will review your application and reach out via WhatsApp within 48 hours.
            </p>
          </div>
          <Link 
            to="/" 
            className="block w-full py-4 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all"
          >
            Return to Village
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-neutral-900 z-50">
        <motion.div 
          className="h-full bg-gold-500"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Step 01</span>
                <h1 className="text-4xl font-serif">The Foundation</h1>
                <p className="text-neutral-400 font-light">Tell us about you and your vision in Bali.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-500">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-500">Business Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                    placeholder="What are you building?"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-500">One-line Description</label>
                  <textarea 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors h-24 resize-none"
                    placeholder="Describe your business in one sentence..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-neutral-500">Time in Bali</label>
                    <select 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors appearance-none"
                      value={formData.timeInBali}
                      onChange={(e) => setFormData({ ...formData, timeInBali: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="less-than-1">Less than 1 year</option>
                      <option value="1-2">1-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-plus">5+ years</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-neutral-500">Referral (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                      placeholder="Who sent you?"
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-neutral-500">WhatsApp Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                      placeholder="e.g. +62 812..."
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Step 02</span>
                <h1 className="text-4xl font-serif">Offers & Needs</h1>
                <p className="text-neutral-400 font-light">Select up to 3 tags for each category.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm text-neutral-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    What do you offer the community?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag('offers', tag)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm border transition-all",
                          formData.offers.includes(tag)
                            ? "bg-gold-600 border-gold-600 text-neutral-950 font-medium"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm text-neutral-500 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gold-500" />
                    What do you need help with right now?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag('needs', tag)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm border transition-all",
                          formData.needs.includes(tag)
                            ? "bg-gold-600 border-gold-600 text-neutral-950 font-medium"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Step 03</span>
                <h1 className="text-4xl font-serif">Community Perks</h1>
                <p className="text-neutral-400 font-light">Offer up to 3 perks to fellow BBB members ($25-50 value).</p>
              </div>

              <div className="space-y-6">
                {formData.perks.map((perk, idx) => (
                  <div key={idx} className="glass-card p-6 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Perk {idx + 1} Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                        placeholder="e.g., 1 Free Hour Consulting"
                        value={perk.title}
                        onChange={(e) => {
                          const newPerks = [...formData.perks];
                          newPerks[idx].title = e.target.value;
                          setFormData({ ...formData, perks: newPerks });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Value</label>
                      <input 
                        type="text" 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                        placeholder="e.g., $50"
                        value={perk.value}
                        onChange={(e) => {
                          const newPerks = [...formData.perks];
                          newPerks[idx].value = e.target.value;
                          setFormData({ ...formData, perks: newPerks });
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {formData.perks.length < 3 && (
                  <button 
                    onClick={() => setFormData({ ...formData, perks: [...formData.perks, { title: '', value: '' }] })}
                    className="w-full py-4 border-2 border-dashed border-neutral-800 rounded-2xl text-neutral-500 hover:border-gold-500/50 hover:text-gold-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Add Another Perk
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Step 04</span>
                <h1 className="text-4xl font-serif">Preferences</h1>
                <p className="text-neutral-400 font-light">Finalize your membership settings.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm text-neutral-500">How many hours per month are you open to collaborating?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLLABORATION_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFormData({ ...formData, collaborationHours: opt })}
                        className={cn(
                          "py-4 rounded-xl border transition-all text-center",
                          formData.collaborationHours === opt
                            ? "bg-gold-600 border-gold-600 text-neutral-950 font-bold"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gold-500" />
                      <div>
                        <div className="font-medium">Public Visibility</div>
                        <div className="text-xs text-neutral-500">Show your profile on the landing page</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, publicVisibility: !formData.publicVisibility })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        formData.publicVisibility ? "bg-gold-600" : "bg-neutral-800"
                      )}
                    >
                      <motion.div 
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                        animate={{ x: formData.publicVisibility ? 24 : 0 }}
                      />
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-4 pt-8">
                  <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-gold-500" />
                  </div>
                  <h2 className="text-2xl font-serif">Ready to Join?</h2>
                  <p className="text-neutral-500 text-sm">Your application will be reviewed by the village elders.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link to="/" className="text-neutral-500 hover:text-white transition-colors">Cancel</Link>
          )}

          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="px-8 py-3 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              disabled={isSubmitting}
              className="px-12 py-4 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submitting...' : (user ? 'Submit Application' : 'Sign in to Submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
