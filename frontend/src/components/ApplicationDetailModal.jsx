import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Calendar, 
  MapPin, 
  Briefcase, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  Image as ImageIcon,
  Loader2,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';

export default function ApplicationDetailModal({ application, onClose, onUpdate, onDelete }) {
  if (!application) return null;

  const [currentApp, setCurrentApp] = useState(application);
  const [timelineNote, setTimelineNote] = useState('');
  const [timelineStatus, setTimelineStatus] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Sync when prop updates
  useEffect(() => {
    setCurrentApp(application);
  }, [application]);

  // Refresh application data
  const refreshCurrentApp = async () => {
    try {
      const refreshed = await api.getApplication(currentApp.id);
      setCurrentApp(refreshed);
      onUpdate(refreshed);
    } catch (err) {
      console.error('Failed to reload application:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const updated = await api.updateApplication(currentApp.id, {
        status: newStatus,
        timeline_note: `Status updated to ${newStatus}`
      });
      setCurrentApp(updated);
      onUpdate(updated);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setUpdating(true);
      const updated = await api.updateApplication(currentApp.id, {
        is_active: !currentApp.is_active,
        timeline_note: !currentApp.is_active ? 'Marked as active application.' : 'Application closed / marked inactive.'
      });
      setCurrentApp(updated);
      onUpdate(updated);
    } catch (err) {
      alert(`Error toggling active state: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetFollowup = async (daysAhead) => {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const dateStr = targetDate.toISOString().split('T')[0];

      const updated = await api.updateApplication(currentApp.id, {
        follow_up_date: dateStr,
        timeline_note: `Follow-up scheduled for ${dateStr}`
      });
      setCurrentApp(updated);
      onUpdate(updated);
    } catch (err) {
      alert(`Error setting follow-up: ${err.message}`);
    }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!timelineNote.trim()) return;

    setAddingNote(true);
    try {
      await api.addTimeline(
        currentApp.id, 
        timelineNote.trim(), 
        timelineStatus || null
      );
      setTimelineNote('');
      setTimelineStatus('');
      await refreshCurrentApp();
    } catch (err) {
      alert(`Failed to add timeline entry: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentApp.company}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                currentApp.is_active 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {currentApp.is_active ? 'Active Hunt' : 'Archived / Closed'}
              </span>
              {currentApp.is_overdue && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-sky-400">
              {currentApp.role}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentApp.is_active 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {currentApp.is_active ? 'Mark as Inactive' : 'Reactivate Job'}
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete application for ${currentApp.company}?`)) {
                  onDelete(currentApp.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete Application"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Quick Action Bar: Portal links & Status switcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
            {/* Stage Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Current Pipeline Stage
              </label>
              <select
                value={currentApp.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="OA/Test">OA / Test Stage</option>
                <option value="Interview">Interview Stage</option>
                <option value="Offer">Offer Received 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Ghosted">Ghosted</option>
              </select>
            </div>

            {/* Quick 1-Click External Links */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                External Action Links
              </label>
              <div className="flex flex-wrap gap-2">
                {currentApp.portal_link ? (
                  <a
                    href={currentApp.portal_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Job Post ({currentApp.portal_name})</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic py-2">No portal link saved</span>
                )}

                {currentApp.apply_link && (
                  <a
                    href={currentApp.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Career Page / Apply</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400">Location</span>
              <p className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {currentApp.location}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400">Job Type</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {currentApp.job_type} ({currentApp.employment_type})
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400">Salary / Stipend</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {currentApp.salary_text || 'Not specified'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400">Date Applied</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {currentApp.date_applied || '—'}
              </p>
            </div>
          </div>

          {/* Follow-up & Deadlines Quick Controller */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Next Follow-Up Date:</span>
                <span className="text-xs font-mono font-semibold text-sky-300">
                  {currentApp.follow_up_date || 'No follow-up set'}
                </span>
              </div>
              {currentApp.deadline && (
                <div className="text-[11px] text-slate-400 mt-1">
                  Application Deadline: <span className="text-slate-200 font-mono">{currentApp.deadline}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quick set:</span>
              <button
                onClick={() => handleSetFollowup(0)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handleSetFollowup(3)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                +3 Days
              </button>
              <button
                onClick={() => handleSetFollowup(7)}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-500/30 transition-colors"
              >
                +7 Days
              </button>
            </div>
          </div>

          {/* Proof Screenshots (JD & Applied confirmation) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-sky-400" />
              Proof Vault (Screenshots)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* JD Screenshot */}
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Job Description (JD) Proof</span>
                  {currentApp.screenshot_jd_url && (
                    <a
                      href={api.resolveMediaUrl(currentApp.screenshot_jd_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Full View
                    </a>
                  )}
                </div>

                {currentApp.screenshot_jd_url ? (
                  <div 
                    onClick={() => setPreviewImage(api.resolveMediaUrl(currentApp.screenshot_jd_url))}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-black/40 h-44 cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={api.resolveMediaUrl(currentApp.screenshot_jd_url)}
                      alt="JD Screenshot"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Maximize2 className="h-4 w-4" /> Click to zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    No JD screenshot uploaded
                  </div>
                )}
              </div>

              {/* Applied Confirmation Screenshot */}
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Applied Confirmation Proof</span>
                  {currentApp.screenshot_applied_url && (
                    <a
                      href={api.resolveMediaUrl(currentApp.screenshot_applied_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Full View
                    </a>
                  )}
                </div>

                {currentApp.screenshot_applied_url ? (
                  <div 
                    onClick={() => setPreviewImage(api.resolveMediaUrl(currentApp.screenshot_applied_url))}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-black/40 h-44 cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={api.resolveMediaUrl(currentApp.screenshot_applied_url)}
                      alt="Applied Confirmation"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Maximize2 className="h-4 w-4" /> Click to zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    No applied confirmation proof uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Resume Version</span>
              <p className="text-xs sm:text-sm font-mono text-slate-200">
                {currentApp.resume_version || 'Default CV'}
              </p>
              {currentApp.referral && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  Referral: <span className="text-slate-200 font-semibold">{currentApp.referral}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Application Notes</span>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
                {currentApp.notes || 'No custom notes provided.'}
              </p>
            </div>
          </div>

          {/* Interactive Timeline History */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-400" />
              Timeline & Interaction History
            </h3>

            {/* Add Timeline Entry Form */}
            <form onSubmit={handleAddTimeline} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <textarea
                value={timelineNote}
                onChange={(e) => setTimelineNote(e.target.value)}
                placeholder="Add an update... (e.g. 'Received screening email', 'Completed technical round 1', 'Sent follow-up on LinkedIn')"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Update stage to:</span>
                  <select
                    value={timelineStatus}
                    onChange={(e) => setTimelineStatus(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 outline-none"
                  >
                    <option value="">Keep current ({currentApp.status})</option>
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="OA/Test">OA/Test</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Ghosted">Ghosted</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addingNote || !timelineNote.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-md shadow-sky-500/20"
                >
                  {addingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                  <span>Post Update</span>
                </button>
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {currentApp.timeline && currentApp.timeline.length > 0 ? (
                currentApp.timeline.map((entry) => (
                  <div key={entry.id} className="relative group">
                    <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-slate-900" />
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-mono">{formatDateTime(entry.created_at)}</span>
                        {entry.status_changed_to && (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                            Stage: {entry.status_changed_to}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200">
                        {entry.note}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No timeline entries recorded.</div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img src={previewImage} alt="Enlarged screenshot" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
