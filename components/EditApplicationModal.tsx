'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  X, 
  Save, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  Zap, 
  Building2,
  Clock,
  Link,
  Laptop,
  Briefcase,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Application {
  id: string;
  applicationDate: string;
  platform: string;
  companyName: string;
  jobTitle: string;
  jobLink: string;
  status: string;
  workMode: string;
  yearsOfExperience: string;
  requiredSkills: string[];
  skillsMet: boolean;
  remarks: string;
}

interface EditApplicationModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditApplicationModal({ application, onClose, onSuccess }: EditApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: application.jobTitle,
    companyName: application.companyName,
    platform: application.platform,
    jobLink: application.jobLink,
    applicationDate: new Date(application.applicationDate).toISOString().split('T')[0],
    status: application.status,
    workMode: application.workMode || 'Remote',
    yearsOfExperience: application.yearsOfExperience || '',
    requiredSkills: application.requiredSkills ? application.requiredSkills.join(', ') : '',
    skillsMet: application.skillsMet || false,
    remarks: application.remarks || '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(backdropRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(modalRef.current, 
      { opacity: 0, scale: 0.95, y: 30 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.05 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Application updated successfully!');
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to update application');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-blue-100 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <Zap size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Edit Application</h2>
              <p className="text-blue-100 text-sm font-medium mt-1">
                Modify any tracking details for this application entry.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Briefcase size={14} className="text-blue-500" />
                  Job Title
                </label>
                <input 
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Building2 size={14} className="text-blue-500" />
                  Company Name
                </label>
                <input 
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Laptop size={14} className="text-blue-500" />
                  Platform
                </label>
                <input 
                  type="text"
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  placeholder="e.g. LinkedIn"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Link size={14} className="text-blue-500" />
                  Job Link
                </label>
                <input 
                  type="url"
                  required
                  value={formData.jobLink}
                  onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  placeholder="e.g. https://linkedin.com/jobs/..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Calendar size={14} className="text-blue-500" />
                  Application Date
                </label>
                <input 
                  type="date"
                  required
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    Current Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {['Pending', 'Applied', 'Interview', 'Technical Test', 'Offered', 'Rejected', 'Withdrawn'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    Work Mode
                  </label>
                  <select 
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {['Remote', 'Hybrid', 'Onsite'].map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Clock size={14} className="text-blue-500" />
                  Experience Needed
                </label>
                <input 
                  type="text"
                  placeholder="e.g. 2-3 years"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  Required Skills
                </label>
                <textarea 
                  placeholder="React, Tailwind, Node.js..."
                  rows={2}
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-center">
            <div className="md:col-span-1">
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${formData.skillsMet ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className={formData.skillsMet ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className={`text-[12px] font-bold ${formData.skillsMet ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Skills Met?
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.skillsMet}
                      onChange={(e) => setFormData({ ...formData, skillsMet: e.target.checked })}
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <FileText size={14} className="text-blue-500" />
                Remarks & Notes
              </label>
              <textarea 
                placeholder="Interview date or custom remarks..."
                rows={2}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-base hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
