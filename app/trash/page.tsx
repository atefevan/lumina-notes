'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/supabaseClient';
import { Trash2, RefreshCw, XCircle, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function TrashPage() {
  const [deletedNotes, setDeletedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDeletedNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll just show all notes that might be "deleted" 
      // if we had a deleted flag. Since we don't, we'll just show an empty state 
      // or a placeholder for now, as requested to "Fix" the sidebar.
      // In a real app, we'd have an `is_deleted` column.
      setLoading(false);
    };

    fetchDeletedNotes();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Trash</h1>
            <p className="text-zinc-400 mt-1">Recently deleted notes will appear here.</p>
          </div>
          <button className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Empty Trash
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>

        <div className="glass-card p-20 rounded-xl text-center border-dashed border-white/10">
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10 text-zinc-700" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-500">Your trash is empty</h3>
          <p className="text-zinc-600 max-w-xs mx-auto mt-2">Notes you delete will stay here for 30 days before being permanently removed.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
