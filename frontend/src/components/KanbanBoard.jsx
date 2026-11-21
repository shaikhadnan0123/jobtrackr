import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ExternalLink, 
  AlertCircle, 
  Image as ImageIcon,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

const COLUMNS = [
  { id: 'Wishlist', title: 'Wishlist', color: 'border-slate-700 bg-slate-800/30 text-slate-300' },
  { id: 'Applied', title: 'Applied', color: 'border-sky-500/40 bg-sky-500/5 text-sky-300' },
  { id: 'OA/Test', title: 'OA / Test', color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-300' },
  { id: 'Interview', title: 'Interview', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300' },
  { id: 'Offer', title: 'Offer 🎉', color: 'border-amber-500/40 bg-amber-500/5 text-amber-300' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-500/40 bg-rose-500/5 text-rose-300' },
  { id: 'Ghosted', title: 'Ghosted', color: 'border-slate-700/60 bg-slate-900/60 text-slate-400' },
];

export default function KanbanBoard({ applications, onSelectApplication, onStatusChange }) {
  const getJobTypeBadgeColor = (type) => {
    switch (type) {
      case 'ML': return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'GenAI': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Data': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'SDE': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 pb-12 overflow-x-auto min-w-[1100px] xl:min-w-0">
      {COLUMNS.map((col) => {
        const items = applications.filter((app) => app.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${col.color}`}>
                  {col.title}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {items.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5">
              {items.length === 0 ? (
                <div className="flex items-center justify-center flex-1 rounded-xl border border-dashed border-slate-800/60 text-xs text-slate-600 p-4 text-center">
                  No applications
                </div>
              ) : (
                items.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 shadow-md transition-all cursor-pointer group relative flex flex-col gap-2.5"
                  >
                    {/* Header: Company & Portal */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                          {app.company}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-1">
                          {app.role}
                        </p>
                      </div>

                      {/* Quick Move Select */}
                      <select
                        value={app.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onStatusChange(app.id, e.target.value)}
                        className="text-[11px] bg-slate-900/90 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 cursor-pointer outline-none focus:border-sky-500"
                        title="Move to stage"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            → {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags: Job Type, Location, Employment */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getJobTypeBadgeColor(app.job_type)}`}>
                        {app.job_type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-slate-400" />
                        {app.location}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/20 text-slate-400 border border-slate-700/50">
                        {app.portal_name}
                      </span>
                    </div>

                    {/* Proof Icons (Screenshots) */}
                    {(app.screenshot_jd_url || app.screenshot_applied_url) && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-sky-400 font-medium">
                          <ImageIcon className="h-3 w-3" />
                          Proof Attached
                        </span>
                      </div>
                    )}

                    {/* Alerts & Follow-up Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {app.is_overdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-rose-400" />
                          Overdue Follow-up
                        </span>
                      )}

                      {app.is_stale && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                          Stale (14d+)
                        </span>
                      )}

                      {!app.is_overdue && app.follow_up_date && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-800 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-slate-500" />
                          F/U: {app.follow_up_date}
                        </span>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
