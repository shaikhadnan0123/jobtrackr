import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Clock, 
  AlertCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import { api } from '../services/api';

export default function ApplicationTable({ 
  applications, 
  onSelectApplication, 
  onDeleteApplication, 
  onStatusChange,
  filters,
  setFilters
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'All',
      job_type: 'All',
      portal_name: 'All',
      location: 'All',
      is_active: true,
      search: ''
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Wishlist': return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'Applied': return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'OA/Test': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Interview': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Offer': return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'Rejected': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Ghosted': return 'bg-slate-800 text-slate-500 border-slate-700';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, role, notes, referral..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filters.status || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200 outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Applied">Applied</option>
            <option value="OA/Test">OA/Test</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted">Ghosted</option>
          </select>

          {/* Job Type Filter */}
          <select
            value={filters.job_type || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, job_type: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200 outline-none focus:border-sky-500"
          >
            <option value="All">All Roles (ML/Data/SDE)</option>
            <option value="ML">ML</option>
            <option value="GenAI">GenAI</option>
            <option value="Data">Data</option>
            <option value="SDE">SDE</option>
            <option value="Full Stack">Full Stack</option>
          </select>

          {/* Location Filter */}
          <select
            value={filters.location || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200 outline-none focus:border-sky-500"
          >
            <option value="All">All Locations</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Gurgaon">Gurgaon</option>
            <option value="Pune">Pune</option>
            <option value="Noida">Noida</option>
            <option value="Remote">Remote</option>
          </select>

          {/* Active / Inactive switch */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, is_active: !prev.is_active }))}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              filters.is_active 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {filters.is_active ? 'Active Only' : 'Including Inactive'}
          </button>

          {/* Reset Filters */}
          <button
            onClick={clearFilters}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Filters"
          >
            Reset
          </button>

          {/* Export to CSV Button */}
          <a
            href={api.getExportCsvUrl(filters)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Export CSV</span>
          </a>
        </div>

      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Company & Role</th>
                <th className="py-3.5 px-3">Location & Type</th>
                <th className="py-3.5 px-3">Portal</th>
                <th className="py-3.5 px-3">Applied</th>
                <th className="py-3.5 px-3">Follow-up</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-center">Proof</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No job applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectApplication(app)}
                  >
                    {/* Company & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {app.company}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-1">{app.role}</span>
                      </div>
                    </td>

                    {/* Location & Type */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-300">{app.location}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{app.employment_type} • {app.job_type}</span>
                      </div>
                    </td>

                    {/* Portal */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300 text-xs">
                        {app.portal_name}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-3 text-xs font-mono text-slate-400">
                      {app.date_applied || '—'}
                    </td>

                    {/* Follow-up Date & Alerts */}
                    <td className="py-3.5 px-3">
                      {app.is_overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                          <Clock className="h-3 w-3" />
                          {app.follow_up_date || 'Overdue'}
                        </span>
                      ) : app.is_stale ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                          <AlertCircle className="h-3 w-3" />
                          Stale (14d+)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          {app.follow_up_date || '—'}
                        </span>
                      )}
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${getStatusBadge(app.status)}`}
                      >
                        <option value="Wishlist">Wishlist</option>
                        <option value="Applied">Applied</option>
                        <option value="OA/Test">OA/Test</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Ghosted">Ghosted</option>
                      </select>
                    </td>

                    {/* Proof Icons */}
                    <td className="py-3.5 px-3 text-center">
                      {(app.screenshot_jd_url || app.screenshot_applied_url) ? (
                        <span className="inline-flex p-1 rounded-md bg-sky-500/15 text-sky-400" title="Proof Attached">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete application for ${app.company}?`)) {
                              onDeleteApplication(app.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
