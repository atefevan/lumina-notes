'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { format } from 'date-fns';
import { 
  Bell, 
  Plus, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Circle,
  X,
  Calendar as CalendarIcon,
  AlertCircle,
  Pencil,
  Save,
  ChevronDown
} from 'lucide-react';
import { gsap } from 'gsap';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('12:00');
  const [priority, setPriority] = useState('medium');
  const [reminderToDelete, setReminderToDelete] = useState<any>(null);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log('Fetching reminders for user:', user.id);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('Supabase error fetching reminders:', error.message || error);
        if (error.message?.includes('schema cache')) {
          alert('Supabase schema cache error: The "reminders" table was not found. If you just created it, please run "NOTIFY pgrst, \'reload schema\';" in your Supabase SQL Editor or wait a few minutes for the cache to refresh.');
        }
        throw error;
      }
      
      console.log('Fetched reminders:', data);
      setReminders(data || []);
    } catch (err: any) {
      console.error('Error fetching reminders:', err.message || err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [fetchReminders, user]);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title.trim()) return;

    try {
      setIsSaving(true);
      if (!user) throw new Error('User not authenticated');

      // Combine date and time
      const [hours, minutes] = time.split(':');
      const reminderDate = new Date(date!);
      reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update({
            title,
            reminder_date: reminderDate.toISOString(),
            priority,
          })
          .eq('id', editingReminder.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert([{
            title,
            reminder_date: reminderDate.toISOString(),
            priority,
            user_id: user.id,
            completed: false
          }]);

        if (error) throw error;
      }

      setTitle('');
      setDate(new Date());
      setTime('12:00');
      setPriority('medium');
      setEditingReminder(null);
      await fetchReminders();
    } catch (err: any) {
      console.error('Error saving reminder:', err.message || err);
      alert(`Failed to save reminder: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    const d = new Date(reminder.reminder_date);
    setDate(d);
    setTime(format(d, 'HH:mm'));
    setPriority(reminder.priority);
  };

  const cancelEdit = () => {
    setEditingReminder(null);
    setTitle('');
    setDate(new Date());
    setTime('12:00');
    setPriority('medium');
  };

  const toggleComplete = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: !current })
        .eq('id', id);
      
      if (error) throw error;
      fetchReminders();
    } catch (err) {
      console.error('Error toggling reminder:', err);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      await fetchReminders();
      setReminderToDelete(null);
    } catch (err: any) {
      console.error('Error deleting reminder:', err.message || err);
      alert(`Failed to delete reminder: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(reminders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReminders = reminders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto relative min-h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-12">
          {/* Header with Avatar */}
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-display font-bold tracking-tight">Reminders</h1>
            <UserAvatar />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content: List Section */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  All Reminders <span className="text-zinc-500 font-medium text-xl">({reminders.length})</span>
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1E1F1E] shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0C0B] text-xs uppercase tracking-widest text-zinc-500 font-bold">
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Title</th>
                      <th className="px-8 py-5">Due Date</th>
                      <th className="px-8 py-5">Priority</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/5 h-[81px]">
                          <td className="px-8 py-5"><Skeleton className="h-6 w-6 rounded-full" /></td>
                          <td className="px-8 py-5"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-2">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </td>
                          <td className="px-8 py-5"><Skeleton className="h-6 w-16 rounded-lg" /></td>
                          <td className="px-8 py-5"><div className="flex justify-end gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-10 w-10 rounded-xl" /></div></td>
                        </tr>
                      ))
                    ) : paginatedReminders.length > 0 ? paginatedReminders.map((reminder, index) => (
                      <tr 
                        key={reminder.id} 
                        className={`group hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'} ${reminder.completed ? 'opacity-50' : ''}`}
                      >
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => toggleComplete(reminder.id, reminder.completed)}
                            className="text-emerald-500 hover:scale-110 transition-transform"
                          >
                            {reminder.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                          </button>
                        </td>
                        <td className={`px-8 py-5 font-bold text-zinc-200 truncate max-w-[200px] ${reminder.completed ? 'line-through' : ''}`}>
                          {reminder.title}
                        </td>
                        <td className="px-8 py-5 text-zinc-500">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-2 text-xs opacity-70">
                              <Clock className="w-4 h-4" />
                              {format(new Date(reminder.reminder_date), 'h:mm a')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${
                            reminder.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
                            reminder.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {reminder.priority}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => startEdit(reminder)}
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setReminderToDelete(reminder)}
                              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-zinc-500">
                          No reminders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-all"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                  <span className="text-sm font-bold text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-all"
                  >
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Quick Add */}
            <aside className="w-full xl:w-96">
              <div className="bg-[#0B0C0B] p-8 rounded-2xl border border-white/5 space-y-8 shadow-2xl sticky top-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    {editingReminder ? (
                      <>
                        <Pencil className="w-6 h-6 text-emerald-500" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-emerald-500" />
                        Quick Add
                      </>
                    )}
                  </h2>
                  {editingReminder && (
                    <button 
                      onClick={cancelEdit}
                      className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleAddReminder} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What to remind?"
                      className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-3 px-5 text-sm focus:outline-none focus:border-[#10B981]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-[#1E1F1E] border-white/5 rounded-xl py-6 px-5 hover:bg-white/5 hover:text-white transition-all",
                            !date && "text-zinc-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#0B0C0B] border-white/10" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="rounded-xl border-none"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 z-10" />
                      <input 
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-3 pl-12 pr-5 text-sm focus:outline-none focus:border-[#10B981]/50 transition-all [color-scheme:dark] appearance-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            priority === p 
                              ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                              : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-4 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : editingReminder ? (
                        <Save className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {editingReminder ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {reminderToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setReminderToDelete(null)} />
          <div className="relative w-full max-w-sm bg-[#0B0C0B] border border-white/10 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Delete Reminder?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Are you sure you want to delete &quot;<span className="text-white font-medium">{reminderToDelete.title}</span>&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  disabled={isDeleting}
                  onClick={() => setReminderToDelete(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={() => deleteReminder(reminderToDelete.id)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
