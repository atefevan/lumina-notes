'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Calendar</h1>
            <p className="text-zinc-400 mt-1">Manage your schedule and notes by date.</p>
          </div>
          <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 glass-card p-8 rounded-xl">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl border-none w-full"
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-lg font-bold text-emerald-400",
                nav: "space-x-1 flex items-center",
                nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full justify-between",
                head_cell: "text-zinc-500 rounded-md w-12 font-bold text-[10px] uppercase tracking-widest",
                row: "flex w-full mt-2 justify-between",
                cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-12 w-12 p-0 font-bold aria-selected:opacity-100 hover:bg-white/5 rounded-xl transition-all",
                day_selected: "bg-emerald-500 text-[#0B0C0B] hover:bg-emerald-500 hover:text-[#0B0C0B] focus:bg-emerald-500 focus:text-[#0B0C0B]",
                day_today: "text-emerald-400 border border-emerald-500/30",
                day_outside: "text-zinc-600 opacity-50",
                day_disabled: "text-zinc-600 opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Schedule for {date ? format(date, 'MMMM do') : 'Today'}
            </h2>
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">10:00 AM</p>
                <h3 className="font-bold">Team Sync Meeting</h3>
                <p className="text-sm text-zinc-400 mt-1">Discuss weekly goals and progress.</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-l-4 border-zinc-700">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">02:30 PM</p>
                <h3 className="font-bold">Project Review</h3>
                <p className="text-sm text-zinc-400 mt-1">Review the latest design iterations.</p>
              </div>
              <div className="p-10 text-center glass-card rounded-xl border-dashed border-white/5">
                <p className="text-zinc-500 text-sm italic">No more events scheduled for this day.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
