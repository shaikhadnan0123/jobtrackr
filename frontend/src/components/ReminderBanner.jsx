import React from 'react';
import { AlertCircle, Clock, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ReminderBanner({ digest, onSelectApplication }) {
  if (!digest) return null;

  const dueCount = digest.due_today?.length || 0;
  const staleCount = digest.stale_applications?.length || 0;
  const deadlinesCount = digest.upcoming_deadlines?.length || 0;

  if (dueCount === 0 && staleCount === 0 && deadlinesCount === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-amber-200">
                Daily 9:00 AM Follow-Up Digest
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {digest.today_date}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {digest.message}
            </p>
          </div>
        </div>

        {/* Quick action chips */}
        <div className="flex flex-wrap items-center gap-2">
          {dueCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5 text-rose-400" />
              <span>{dueCount} Overdue / Due</span>
            </div>
          )}
          {staleCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>{staleCount} Stale (14d+)</span>
            </div>
          )}
          {deadlinesCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              <span>{deadlinesCount} Deadline Soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Items Quick Peek */}
      {digest.due_today && digest.due_today.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400">Action required:</span>
          {digest.due_today.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelectApplication(app)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors group"
            >
              <span className="font-semibold text-white">{app.company}</span>
              <span className="text-slate-400">({app.role})</span>
              <ArrowRight className="h-3 w-3 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
