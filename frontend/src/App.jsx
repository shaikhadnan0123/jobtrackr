import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import ReminderBanner from './components/ReminderBanner';
import KanbanBoard from './components/KanbanBoard';
import ApplicationTable from './components/ApplicationTable';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import AddApplicationModal from './components/AddApplicationModal';
import { api } from './services/api';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  PlusCircle, 
  Loader2 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for table and queries
  const [filters, setFilters] = useState({
    status: 'All',
    job_type: 'All',
    portal_name: 'All',
    location: 'All',
    is_active: true,
    search: '',
  });

  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [appsData, statsData, digestData] = await Promise.all([
        api.getApplications(filters),
        api.getStats(),
        api.getReminderDigest(),
      ]);
      setApplications(appsData);
      setStats(statsData);
      setDigest(digestData);
    } catch (err) {
      console.error('Failed to load JobTrackr data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const updated = await api.updateApplication(appId, {
        status: newStatus,
        timeline_note: `Stage changed to ${newStatus}`
      });
      // Update in memory and refresh stats
      setApplications(prev => prev.map(a => a.id === appId ? updated : a));
      const [newStats, newDigest] = await Promise.all([
        api.getStats(),
        api.getReminderDigest(),
      ]);
      setStats(newStats);
      setDigest(newDigest);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      await api.deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      const [newStats, newDigest] = await Promise.all([
        api.getStats(),
        api.getReminderDigest(),
      ]);
      setStats(newStats);
      setDigest(newDigest);
    } catch (err) {
      alert(`Failed to delete application: ${err.message}`);
    }
  };

  const handleAppUpdated = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    api.getStats().then(setStats);
    api.getReminderDigest().then(setDigest);
  };

  const reminderCount = (digest?.due_today?.length || 0) + (digest?.stale_applications?.length || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        reminderCount={reminderCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-sky-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-semibold">Connecting to JobTrackr database...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Hero Digest Banner */}
                <ReminderBanner
                  digest={digest}
                  onSelectApplication={(app) => setSelectedApp(app)}
                />

                {/* Top Metrics Cards */}
                <StatsOverview stats={stats} />

                {/* Overdue Follow-ups & Deadlines Focus Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Card 1: Overdue & Due Today */}
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-rose-400" />
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          Action Required: Overdue Follow-Ups
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {digest?.due_today?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {(!digest?.due_today || digest.due_today.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mb-2" />
                          <p className="text-xs">No overdue follow-ups! You're completely up to date.</p>
                        </div>
                      ) : (
                        digest.due_today.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                                  {app.company}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{app.role} • {app.location}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-rose-400">
                                Due: {app.follow_up_date || 'Today'}
                              </span>
                              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Card 2: Upcoming Deadlines & Stale Alerts */}
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-400" />
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          Approaching Deadlines & Stale Jobs
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {(digest?.upcoming_deadlines?.length || 0) + (digest?.stale_applications?.length || 0)}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {(!digest?.upcoming_deadlines?.length && !digest?.stale_applications?.length) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                          <CheckCircle2 className="h-8 w-8 text-sky-500/60 mb-2" />
                          <p className="text-xs">No imminent deadlines or stale applications.</p>
                        </div>
                      ) : (
                        <>
                          {digest?.upcoming_deadlines?.map((app) => (
                            <div
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div>
                                <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                                  {app.company}
                                </span>
                                <p className="text-xs text-slate-400">{app.role}</p>
                              </div>
                              <span className="text-xs font-mono font-semibold text-sky-300 px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
                                Deadline: {app.deadline}
                              </span>
                            </div>
                          ))}

                          {digest?.stale_applications?.map((app) => (
                            <div
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className="p-3 rounded-2xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div>
                                <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                                  {app.company}
                                </span>
                                <p className="text-xs text-slate-400">{app.role}</p>
                              </div>
                              <span className="text-xs font-semibold text-amber-300 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                                Stale (14d+ no update)
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Quick Kanban preview strip */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-400" />
                      Active Pipeline Board Preview
                    </h3>
                    <button
                      onClick={() => setActiveTab('board')}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <span>Full Kanban View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <KanbanBoard
                    applications={applications}
                    onSelectApplication={(app) => setSelectedApp(app)}
                    onStatusChange={handleStatusChange}
                  />
                </div>

              </div>
            )}

            {/* VIEW 2: KANBAN BOARD */}
            {activeTab === 'board' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">Pipeline Kanban Board</h2>
                    <p className="text-xs text-slate-400">Track and move jobs across stages with proof and follow-ups intact</p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-colors w-fit"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Job Card</span>
                  </button>
                </div>

                <KanbanBoard
                  applications={applications}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}

            {/* VIEW 3: TABLE */}
            {activeTab === 'table' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">All Applications Table</h2>
                    <p className="text-xs text-slate-400">Filter, search, review details, and export to CSV</p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-colors w-fit"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add New Job</span>
                  </button>
                </div>

                <ApplicationTable
                  applications={applications}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onDeleteApplication={handleDeleteApplication}
                  onStatusChange={handleStatusChange}
                  filters={filters}
                  setFilters={setFilters}
                />
              </div>
            )}

          </>
        )}

      </main>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdate={handleAppUpdated}
        onDelete={handleDeleteApplication}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>JobTrackr • Built for Adnan • FastAPI + Supabase + React • Zero cost portfolio project</p>
      </footer>

    </div>
  );
}
