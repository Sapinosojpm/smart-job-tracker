'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ChevronRight,
  ClipboardList,
  ChevronDown,
  Trash2,
  Pencil,
  Globe
} from 'lucide-react';
import DeleteModal from '@/components/DeleteModal';
import EditApplicationModal from '@/components/EditApplicationModal';
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
  notes: string;
  yearsOfExperience: string;
  requiredSkills: string[];
  skillsMet: boolean;
  remarks: string;
}

const STATUS_OPTIONS = ['Pending', 'Applied', 'Interview', 'Technical Test', 'Offered', 'Rejected', 'Withdrawn'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingWorkModeId, setUpdatingWorkModeId] = useState<string | null>(null);
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Application | null>(null);
  const [selectedAppForDelete, setSelectedAppForDelete] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load cache on mount
  useEffect(() => {
    const cachedAppsStr = localStorage.getItem("jobTracker_cachedApplications");
    if (cachedAppsStr) {
      try {
        setApplications(JSON.parse(cachedAppsStr));
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cached applications", e);
      }
    }
  }, []);

  const fetchApplications = async (showSkeleton: any = false) => {
    const shouldShow = showSkeleton === true;
    try {
      if (shouldShow) {
        setLoading(true);
      }
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
        localStorage.setItem("jobTracker_cachedApplications", JSON.stringify(data.data));
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedAppsStr = localStorage.getItem("jobTracker_cachedApplications");
    fetchApplications(!cachedAppsStr);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateWorkMode = async (id: string, newWorkMode: string) => {
    setUpdatingWorkModeId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workMode: newWorkMode }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(apps => apps.map(app => app.id === id ? { ...app, workMode: newWorkMode } : app));
        toast.success(`Work mode updated to ${newWorkMode}`);
      }
    } catch (err) {
      console.error('Update work mode error:', err);
      toast.error('Failed to update work mode');
    } finally {
      setUpdatingWorkModeId(null);
    }
  };

  const deleteApplication = async () => {
    if (!selectedAppForDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/applications/${selectedAppForDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setApplications(apps => apps.filter(app => app.id !== selectedAppForDelete.id));
        toast.success('Application removed');
        setSelectedAppForDelete(null);
      }
    } catch (err) {
      toast.error('Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredApps = applications.filter(app => 
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Applied': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Interview': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Offered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Technical Test': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-in">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-semibold text-indigo-800 uppercase tracking-wide">
            Tracker
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          <span className="gradient-text">Application Log</span>
        </h1>
        <p className="text-slate-600 max-w-xl text-sm md:text-base">
          Monitor your progress and track every application detail in one central dashboard.
        </p>
      </div>

      <div className="glass mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/90 p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            suppressHydrationWarning={true}
            className="w-full rounded-xl border border-transparent bg-white/80 py-3 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company & Platform</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Work Mode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exp / Skills</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remarks</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-slate-500">Loading your history...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                        <ClipboardList className="text-slate-300" size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">No applications tracked yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{app.jobTitle}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-black uppercase tracking-wider ${
                            app.workMode === 'Hybrid' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            app.workMode === 'Onsite' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {app.workMode || 'Remote'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-medium text-slate-400">
                          <Calendar size={12} />
                          {new Date(app.applicationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">{app.companyName}</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase mt-0.5">{app.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center relative">
                        {updatingWorkModeId === app.id ? (
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <div className="relative group/workmode">
                            <select
                              value={app.workMode || 'Remote'}
                              onChange={(e) => updateWorkMode(app.id, e.target.value)}
                              className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-[10px] font-bold uppercase border shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                                app.workMode === 'Hybrid' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                app.workMode === 'Onsite' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}
                            >
                              {['Remote', 'Hybrid', 'Onsite'].map(mode => (
                                <option key={mode} value={mode} className="bg-white text-slate-900">{mode}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-slate-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center relative">
                        {updatingId === app.id ? (
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <div className="relative group/status">
                            <select
                              value={app.status}
                              onChange={(e) => updateStatus(app.id, e.target.value)}
                              className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-[10px] font-bold uppercase border shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${getStatusColor(app.status)}`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Exp:</span>
                          <span className="text-[11px] font-medium text-slate-700">{app.yearsOfExperience || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Met?</span>
                          {app.skillsMet ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[200px]">
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          {app.remarks || 'No remarks added...'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForEdit(app)}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <a 
                          href={app.jobLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedAppForDelete(app)}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
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

      {selectedAppForEdit && (
        <EditApplicationModal
          application={selectedAppForEdit}
          onClose={() => setSelectedAppForEdit(null)}
          onSuccess={fetchApplications}
        />
      )}

      {selectedAppForDelete && (
        <DeleteModal
          isOpen={!!selectedAppForDelete}
          onClose={() => setSelectedAppForDelete(null)}
          onConfirm={deleteApplication}
          title={selectedAppForDelete.jobTitle}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
