'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  Trash2, 
  Edit2,
  X,
  Check,
  FileText,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { gsap } from 'gsap';
import { formatDistanceToNow, isBefore, startOfToday } from 'date-fns';
import 'react-day-picker/style.css';
import UserAvatar from '@/components/UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [user, setUser] = useState<any>(null);

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

  const fetchNotes = useCallback(async () => {
    if (!user) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error.message || error);
      if (error.message?.includes('schema cache')) {
        alert('Supabase schema cache error: The "notes" table was not found. If you just created it, please run "NOTIFY pgrst, \'reload schema\';" in your Supabase SQL Editor or wait a few minutes for the cache to refresh.');
      }
    } else {
      setNotes(data || []);
    }
    setLoading(false);
    setIsCalendarLoading(false);
  }, [selectedDate, user]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [fetchNotes, user]);

  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      tl.fromTo('.notes-header > *', 
        {
          y: 20,
          opacity: 0,
          filter: 'brightness(0.5)',
        },
        {
          y: 0,
          opacity: 1,
          filter: 'brightness(1)',
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        }
      )
      .fromTo('.note-card', 
        {
          y: 20,
          opacity: 0,
          filter: 'brightness(0.5)',
        },
        {
          y: 0,
          opacity: 1,
          filter: 'brightness(1)',
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out'
        }, 
        '-=0.4'
      );
    }
  }, [loading]);

  const handleSaveNote = async () => {
    if (!user) return;

    // Past date restriction
    if (isBefore(selectedDate, startOfToday()) && !editingNote) {
      alert("You cannot add notes on a past date.");
      return;
    }

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', editingNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ 
            title, 
            content, 
            user_id: user.id,
            created_at: selectedDate.toISOString() 
          }]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingNote(null);
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err: any) {
      console.error('Error saving note:', err.message || err);
      alert(`Failed to save note: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      await fetchNotes();
      setNoteToDelete(null);
    } catch (err: any) {
      console.error('Error deleting note:', err.message || err);
      alert(`Failed to delete note: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto relative min-h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-12">
          {/* Header with Avatar */}
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-display font-bold tracking-tight">My Notes</h1>
            <UserAvatar />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content: Table Area */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  All Notes <span className="text-zinc-500 font-medium text-lg">({notes.length})</span>
                </h2>
                <button 
                  onClick={() => {
                    if (isBefore(selectedDate, startOfToday())) {
                      alert("You cannot add notes on a past date.");
                      return;
                    }
                    setEditingNote(null);
                    setTitle('');
                    setContent('');
                    setIsModalOpen(true);
                  }}
                  className="bg-[#10B981] text-[#0B0C0B] px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add New Note
                </button>
              </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1F1E] border border-white/5 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#10B981]/50 transition-all"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/5 bg-[#1E1F1E]">
              <div className="max-h-[418px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#0B0C0B]">
                    <tr className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                      <th className="px-6 py-4">Serial</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Preview</th>
                      <th className="px-6 py-4">Date Created</th>
                      <th className="px-6 py-4">Updated</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                  {isCalendarLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5 h-[61px]">
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredNotes.length > 0 ? filteredNotes.map((note, index) => (
                    <tr 
                      key={note.id} 
                      className={`group hover:bg-white/5 transition-colors h-[61px] ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                    >
                      <td className="px-6 py-4 text-zinc-500 font-mono">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-zinc-200 truncate max-w-[150px]">{note.title}</td>
                      <td className="px-6 py-4 text-zinc-500 truncate max-w-[250px]">{note.content}</td>
                      <td className="px-6 py-4 text-zinc-500">{format(new Date(note.created_at), 'yyyy-MM-dd')}</td>
                      <td className="px-6 py-4 text-zinc-500">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingNote(note);
                              setTitle(note.title);
                              setContent(note.content);
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg hover:bg-[#10B981] hover:text-[#0B0C0B] transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setNoteToDelete(note)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-zinc-500">
                        No notes found for this day.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* Right Sidebar: Calendar & Quick Add */}
          <aside className="w-full xl:w-80 space-y-6">
            <div className="bg-[#0B0C0B] p-6 rounded-xl border border-white/5">
              <div className="flex justify-center lumina-calendar-compact">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setIsCalendarLoading(true);
                      setSelectedDate(date);
                      // GSAP animation for table content
                      gsap.to('.note-card', {
                        opacity: 0,
                        y: 10,
                        duration: 0.2,
                        stagger: 0.05
                      });
                    }
                  }}
                  month={selectedDate}
                  onMonthChange={setSelectedDate}
                  components={{
                    Chevron: ({ orientation }) => {
                      const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                      return <Icon className="h-4 w-4" />;
                    },
                  }}
                  styles={{
                    weekday: { color: '#71717a', fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' },
                    selected: { backgroundColor: '#10B981', color: '#0B0C0B', borderRadius: '8px' },
                    today: { color: '#10B981', fontWeight: 'bold' },
                    day: { width: '32px', height: '32px', fontSize: '12px' }
                  }}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Sparkle Icon */}
        <div className="fixed bottom-10 right-10 pointer-events-none opacity-50">
          <Sparkles className="w-12 h-12 text-zinc-700" />
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0B0C0B] border border-white/5 p-8 rounded-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full bg-[#1E1F1E] border border-white/5 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#10B981]/50 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing..."
                  rows={8}
                  className="w-full bg-[#1E1F1E] border border-white/5 rounded-lg py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-[#10B981]/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 rounded-lg font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNote}
                  className="flex-1 py-3 bg-[#10B981] text-[#0B0C0B] rounded-lg text-sm font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setNoteToDelete(null)} />
          <div className="relative w-full max-w-sm bg-[#0B0C0B] border border-white/10 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Delete Note?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Are you sure you want to delete &quot;<span className="text-white font-medium">{noteToDelete.title}</span>&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  disabled={isDeleting}
                  onClick={() => setNoteToDelete(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={() => handleDeleteNote(noteToDelete.id)}
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
