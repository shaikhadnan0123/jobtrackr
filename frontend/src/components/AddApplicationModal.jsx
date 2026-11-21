import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  MapPin, 
  UserCheck, 
  FileCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { api } from '../services/api';

export default function AddApplicationModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for +7 days
  const getPlus7Days = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: 'Hyderabad',
    job_type: 'ML',
    employment_type: 'Intern',
    portal_name: 'LinkedIn',
    portal_link: '',
    apply_link: '',
    salary_text: '',
    date_applied: todayStr,
    deadline: '',
    follow_up_date: getPlus7Days(),
    status: 'Applied',
    response_status: 'No Response',
    is_active: true,
    screenshot_jd_url: '',
    screenshot_applied_url: '',
    resume_version: 'ML Intern CV v2',
    referral: '',
    notes: '',
  });

  const [uploadingJd, setUploadingJd] = useState(false);
  const [uploadingApplied, setUploadingApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fieldName === 'screenshot_jd_url') setUploadingJd(true);
    else setUploadingApplied(true);

    try {
      const res = await api.uploadFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: res.url }));
    } catch (err) {
      alert(`Failed to upload screenshot: ${err.response?.data?.detail || err.message}`);
    } finally {
      if (fieldName === 'screenshot_jd_url') setUploadingJd(false);
      else setUploadingApplied(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      setError('Please provide company name and role.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        deadline: formData.deadline || null,
        follow_up_date: formData.follow_up_date || null,
      };
      await api.createApplication(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating application:', err);
      let errorMsg = 'Failed to create application.';
      if (typeof err.response?.data?.detail === 'string') {
        errorMsg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail)) {
        errorMsg = err.response.data.detail.map(d => `${d.loc?.slice(1).join('.') || 'field'}: ${d.msg}`).join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-sky-400" />
              Add Job Application
            </h2>
            <p className="text-xs text-slate-400">Save proof, links, and track follow-ups without anything getting lost</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Swiggy, PhonePe, Zepto"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Machine Learning Intern"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Location, Job Type & Employment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Pune">Pune</option>
                <option value="Noida">Noida</option>
                <option value="Remote">Remote</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Type</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ML">ML (Machine Learning)</option>
                <option value="GenAI">GenAI / LLMs</option>
                <option value="Data">Data Science / Analytics</option>
                <option value="SDE">SDE / Backend</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Intern">Intern</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Section 2: Portal & Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Portal Name</label>
              <select
                name="portal_name"
                value={formData.portal_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Cutshort">Cutshort</option>
                <option value="Internshala">Internshala</option>
                <option value="Company Career Page">Company Career Page</option>
                <option value="Naukri">Naukri</option>
                <option value="Instahyre">Instahyre</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Portal Link (Job Post URL)</label>
              <input
                type="url"
                name="portal_link"
                value={formData.portal_link}
                onChange={handleChange}
                placeholder="https://linkedin.com/jobs/view/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Apply Link (Direct application URL)</label>
              <input
                type="url"
                name="apply_link"
                value={formData.apply_link}
                onChange={handleChange}
                placeholder="https://careers.company.com/apply"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Salary / Stipend</label>
              <input
                type="text"
                name="salary_text"
                value={formData.salary_text}
                onChange={handleChange}
                placeholder="e.g. ₹40,000 / month or 12-15 LPA"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Section 3: Dates & Follow-up */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Tracking Dates & Follow-Up</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date Applied</label>
                <input
                  type="date"
                  name="date_applied"
                  value={formData.date_applied}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Follow-up Date</label>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, follow_up_date: getPlus7Days() }))}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    +7 Days
                  </button>
                </div>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Status & Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="OA/Test">OA / Test</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Ghosted">Ghosted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Response Status</label>
              <select
                name="response_status"
                value={formData.response_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="No Response">No Response</option>
                <option value="Replied">Replied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Resume & Referral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resume Version Used</label>
              <input
                type="text"
                name="resume_version"
                value={formData.resume_version}
                onChange={handleChange}
                placeholder="e.g. ML Intern CV v2"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Referral Contact (Optional)</label>
              <input
                type="text"
                name="referral"
                value={formData.referral}
                onChange={handleChange}
                placeholder="e.g. Rohan (Senior MLE)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Screenshots Upload (JD + Applied Proof) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
            {/* JD Screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                JD Screenshot Proof
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'screenshot_jd_url')}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20"
                />
                {uploadingJd && <span className="text-[11px] text-sky-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Uploading JD screenshot...</span>}
                {formData.screenshot_jd_url && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Uploaded successfully
                  </span>
                )}
              </div>
            </div>

            {/* Applied Confirmation Screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Applied Confirmation Screenshot
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'screenshot_applied_url')}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20"
                />
                {uploadingApplied && <span className="text-[11px] text-sky-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Uploading proof...</span>}
                {formData.screenshot_applied_url && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Uploaded successfully
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Cover Letter angle</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Highlighted LangChain and RAG project; applied via alumni referral..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
              <span>Save Application</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
