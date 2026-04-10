import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Member, Event } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Shield, User, Search, Filter, ShieldAlert, Calendar, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { member: currentMember } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [activeTab, setActiveTab] = useState<'members' | 'events'>('members');
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    area: '',
    description: '',
    isPublic: true
  });

  useEffect(() => {
    if (currentMember?.role !== 'admin') return;

    // Members Subscription
    const membersQuery = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
      setLoading(false);
    });

    // Events Subscription
    const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    return () => {
      unsubscribeMembers();
      unsubscribeEvents();
    };
  }, [currentMember]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        createdAt: new Date().toISOString()
      });
      setIsAddingEvent(false);
      setNewEvent({ title: '', date: '', area: '', description: '', isPublic: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  };

  const toggleApproval = async (memberId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'members', memberId), {
        isApproved: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
    }
  };

  const toggleRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await updateDoc(doc(db, 'members', memberId), {
        role: newRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'pending' ? !m.isApproved : m.isApproved;
    return matchesSearch && matchesFilter;
  });

  if (currentMember?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-serif">Access Denied</h1>
          <p className="text-neutral-500">You do not have the necessary keys to enter this chamber.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Village Council</h1>
            <p className="text-neutral-500 font-light">Manage member access and community events for the BBB collective.</p>
          </div>
          
          <div className="flex bg-neutral-900 rounded-full p-1 border border-neutral-800">
            {(['members', 'events'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium capitalize transition-all",
                  activeTab === tab ? "bg-gold-600 text-neutral-950" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'members' ? (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search members..."
                    className="bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2 text-sm focus:border-gold-500 outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex bg-neutral-900 rounded-full p-1 border border-neutral-800">
                  {(['all', 'pending', 'approved'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-4 py-1 rounded-full text-xs font-medium capitalize transition-all",
                        filter === f ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-700">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-full h-full p-3 text-neutral-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{m.name}</h3>
                      {m.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[10px] font-bold uppercase tracking-wider rounded border border-gold-500/20">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{m.businessName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2 mr-4">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      m.isApproved ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                    )} />
                    <span className="text-xs text-neutral-400 font-medium">
                      {m.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleApproval(m.id, m.isApproved)}
                    className={cn(
                      "p-2 rounded-xl border transition-all",
                      m.isApproved 
                        ? "border-red-500/20 text-red-500 hover:bg-red-500/10" 
                        : "border-green-500/20 text-green-500 hover:bg-green-500/10"
                    )}
                    title={m.isApproved ? "Revoke Access" : "Approve Member"}
                  >
                    {m.isApproved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => toggleRole(m.id, m.role)}
                    className={cn(
                      "p-2 rounded-xl border transition-all",
                      m.role === 'admin' 
                        ? "border-gold-500 text-gold-500 bg-gold-500/10" 
                        : "border-neutral-800 text-neutral-500 hover:border-gold-500/50 hover:text-gold-500"
                    )}
                    title={m.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

                {filteredMembers.length === 0 && !loading && (
                  <div className="py-20 text-center glass-card rounded-3xl">
                    <p className="text-neutral-500">No members found matching your search.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif">Community Events</h2>
                <button 
                  onClick={() => setIsAddingEvent(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all text-sm shadow-lg shadow-gold-600/20"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              {isAddingEvent && (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleAddEvent}
                  className="glass-card p-8 rounded-3xl space-y-6 border border-gold-500/30"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-500">Event Title</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-500">Date & Time</label>
                      <input 
                        required
                        type="datetime-local" 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-500">Area (e.g. Canggu, Uluwatu)</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none"
                        value={newEvent.area}
                        onChange={(e) => setNewEvent({ ...newEvent, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-500">Visibility</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, isPublic: true })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                            newEvent.isPublic ? "bg-gold-500/10 border-gold-500 text-gold-500" : "bg-neutral-950 border-neutral-800 text-neutral-500"
                          )}
                        >
                          <Globe className="w-4 h-4" /> Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, isPublic: false })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                            !newEvent.isPublic ? "bg-gold-500/10 border-gold-500 text-gold-500" : "bg-neutral-950 border-neutral-800 text-neutral-500"
                          )}
                        >
                          <Lock className="w-4 h-4" /> Members Only
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-neutral-500">Description</label>
                    <textarea 
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-gold-500 outline-none h-32"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsAddingEvent(false)}
                      className="px-6 py-2 text-neutral-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-2 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all"
                    >
                      Create Event
                    </button>
                  </div>
                </motion.form>
              )}

              <div className="grid gap-4">
                {events.map((event) => (
                  <div key={event.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
                        <span className="text-gold-500 font-serif text-lg">
                          {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{event.title}</h3>
                          {event.isPublic ? <Globe className="w-3 h-3 text-neutral-500" /> : <Lock className="w-3 h-3 text-gold-500" />}
                        </div>
                        <div className="text-xs text-neutral-500">{event.area} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-3 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
