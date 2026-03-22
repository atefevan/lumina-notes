'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/src/supabaseClient';
import { 
  StickyNote, 
  Bell, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { gsap } from 'gsap';
import UserAvatar from '@/components/UserAvatar';

export default function DashboardPage() {
  const [latestNotes, setLatestNotes] = useState<any[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalNotes: 0, totalReminders: 0, daysActive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch latest notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      // Fetch total notes count
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch total reminders count
      const { count: remindersCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate days active
      const createdDate = new Date(user.created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setStats({
        totalNotes: notesCount || 0,
        totalReminders: remindersCount || 0,
        daysActive: diffDays || 1
      });

      if (notesError) {
        console.error('Error fetching dashboard notes:', notesError.message || notesError);
        if (notesError.message?.includes('schema cache')) {
          alert('Supabase schema cache error: The "notes" table was not found. If you just created it, please run "NOTIFY pgrst, \'reload schema\';" in your Supabase SQL Editor or wait a few minutes for the cache to refresh.');
        }
      }

      // Fetch upcoming reminders
      console.log('Fetching upcoming reminders for user:', user.id);
      const { data: reminders, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .gte('reminder_date', new Date().toISOString())
        .order('reminder_date', { ascending: true })
        .limit(2);
      
      if (remindersError) {
        console.error('Error fetching dashboard reminders:', remindersError.message || remindersError);
        if (remindersError.message?.includes('schema cache')) {
          alert('Supabase schema cache error: The "reminders" table was not found. If you just created it, please run "NOTIFY pgrst, \'reload schema\';" in your Supabase SQL Editor or wait a few minutes for the cache to refresh.');
        }
      } else {
        console.log('Dashboard reminders fetched:', reminders);
        setUpcomingReminders(reminders || []);
      }
      
      setLatestNotes(notes || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      tl.from('.dashboard-header > *', {
        y: 10,
        opacity: 0,
        filter: 'brightness(0.7)',
        stagger: 0.05,
        duration: 0.5,
        ease: 'power2.out'
      })
      .from('.stat-card', {
        scale: 0.98,
        opacity: 0,
        filter: 'brightness(0.5)',
        stagger: 0.05,
        duration: 0.4,
        ease: 'back.out(1.2)'
      }, '-=0.3')
      .from('.dashboard-section', {
        y: 20,
        opacity: 0,
        filter: 'brightness(0.7)',
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2');
    }
  }, [loading]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-display font-bold mb-2 tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 text-lg font-medium">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="flex items-center gap-6">
            <UserAvatar />
            <Link 
              href="/notes"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Note
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="Total Notes" 
            value={stats.totalNotes.toString()} 
            change="All time" 
            icon={<StickyNote className="w-5 h-5 text-emerald-400" />} 
          />
          <StatCard 
            title="Active Reminders" 
            value={stats.totalReminders.toString()} 
            change="Total" 
            icon={<Bell className="w-5 h-5 text-emerald-400" />} 
          />
          <StatCard 
            title="Days Active" 
            value={stats.daysActive.toString()} 
            change="Keep it up!" 
            icon={<CalendarIcon className="w-5 h-5 text-emerald-400" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Latest Notes */}
          <section className="dashboard-section space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <StickyNote className="w-5 h-5 text-emerald-500" />
                </div>
                Latest Notes
              </h2>
              <Link 
                href="/notes"
                className="group px-3 py-1.5 glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-2"
              >
                View All <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-5">
              {latestNotes.length > 0 ? latestNotes.map((note) => (
                <Link key={note.id} href="/notes" className="block list-item glass-card p-6 rounded-xl group cursor-pointer hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">{note.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black bg-white/5 px-2 py-1 rounded-lg">
                      {format(new Date(note.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 leading-relaxed text-sm">
                    {note.content}
                  </p>
                </Link>
              )) : (
                <div className="glass-card p-12 rounded-2xl text-center text-zinc-500 border-dashed border-white/5">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <StickyNote className="w-8 h-8 text-zinc-800" />
                  </div>
                  <p className="font-medium">No notes yet. Start writing!</p>
                </div>
              )}
            </div>
          </section>

          {/* Reminders */}
          <section className="dashboard-section space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-500" />
                </div>
                Reminders
              </h2>
              <Link 
                href="/reminders"
                className="group px-3 py-1.5 glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-2"
              >
                View All <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-5">
              {upcomingReminders.length > 0 ? upcomingReminders.map((reminder) => (
                <Link key={reminder.id} href="/reminders" className="block list-item glass-card p-6 rounded-xl group cursor-pointer hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">{reminder.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black bg-white/5 px-2 py-1 rounded-lg">
                      {format(new Date(reminder.reminder_date), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(reminder.reminder_date), 'h:mm a')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${reminder.priority === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {reminder.priority}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${reminder.priority === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="glass-card p-12 rounded-2xl text-center text-zinc-500 border-dashed border-white/5">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-zinc-800" />
                  </div>
                  <p className="font-medium">All caught up! No reminders.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="stat-card glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
          {change}
        </span>
      </div>
      <p className="text-zinc-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-display font-bold mt-1">{value}</h3>
    </div>
  );
}
