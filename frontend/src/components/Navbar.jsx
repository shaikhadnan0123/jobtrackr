import React from 'react';
import { 
  Briefcase, 
  LayoutDashboard, 
  Kanban, 
  Table, 
  PlusCircle, 
  Bell, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, reminderCount = 0 }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">JobTrackr</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Personal Application & Proof Vault</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'board'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'table'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Table className="h-4 w-4" />
              <span>Table</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {reminderCount > 0 && (
              <div 
                title={`${reminderCount} follow-ups or alerts pending`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium cursor-pointer"
                onClick={() => setActiveTab('dashboard')}
              >
                <Bell className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                <span>{reminderCount} due</span>
              </div>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Application</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
