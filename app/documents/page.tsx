'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PlanModal from '@/components/PlanModal';
import type { DocType, LetterData, ResumeData } from '@/lib/document-types';
import { 
  PenTool, 
  Download, 
  Sparkles, 
  Layout,
  Printer,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2,
  Lock,
  User,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  Wrench,
  GraduationCap
} from 'lucide-react';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocType>('resume');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'TEAM'>('FREE');
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.plan) {
          setUserPlan(data.data.plan);
        }
      })
      .catch(() => {});
  }, []);

  // Resume State
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: 'ALEX J. DOE',
    location: 'Manila, Philippines',
    email: 'alex.doe@example.com',
    phone: '+63 000 000 0000',
    github: 'github.com/alexdoe',
    linkedin: 'linkedin.com/in/alexdoe',
    summary: 'Full-Stack Software Engineer with 2+ years of experience building and deploying scalable web applications using the MERN stack. Proven ability to develop end-to-end features, integrate APIs, and deliver responsive, production-ready systems. Strong foundation in system design and component-driven architecture.',
    skills: {
      languages: 'JavaScript, TypeScript, HTML5, CSS3',
      frontend: 'React, Next.js, Tailwind CSS',
      backend: 'Node.js, Express.js, REST APIs',
      databases: 'PostgreSQL, MongoDB',
      tools: 'Git, Docker, Vercel, AWS',
      other: 'Figma, Adobe Photoshop',
      concepts: 'CRUD systems, API integration, Responsive Design'
    },
    experience: [
      {
        title: 'Software Developer',
        company: 'TechNova Solutions',
        date: 'Jan 2023 — Present',
        bullets: [
          'Developed and maintained full-stack web applications using React and Node.js',
          'Collaborated with cross-functional teams to define and ship new features',
          'Optimized application performance and resolved critical bugs',
          'Implemented responsive UI designs and improved user engagement metrics'
        ]
      }
    ],
    projects: [
      {
        name: 'E-commerce Platform',
        link: 'https://demo-ecommerce.vercel.app/',
        bullets: [
          'Built a full-featured online store with payment gateway integration',
          'Developed a dynamic inventory management system',
          'Designed a mobile-first user interface using Tailwind CSS'
        ]
      }
    ],
    education: [
      {
        degree: 'BACHELOR OF SCIENCE IN COMPUTER SCIENCE',
        school: 'University of Technology',
        date: '2019 — 2023'
      }
    ]
  });

  // Cover Letter State
  const [letterData, setLetterData] = useState<LetterData>({
    recipient: 'Hiring Manager',
    company: 'Tech Solutions Inc.',
    role: 'Senior React Developer',
    jobDescription: '',
    content: ''
  });

  // Helper Functions for Dynamic Fields
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { title: '', company: '', date: '', bullets: [''] }]
    });
  };

  const removeExperience = (index: number) => {
    const newExp = [...resumeData.experience];
    newExp.splice(index, 1);
    setResumeData({ ...resumeData, experience: newExp });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { name: '', link: '', bullets: [''] }]
    });
  };

  const removeProject = (index: number) => {
    const newProj = [...resumeData.projects];
    newProj.splice(index, 1);
    setResumeData({ ...resumeData, projects: newProj });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', school: '', date: '' }]
    });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...resumeData.education];
    newEdu.splice(index, 1);
    setResumeData({ ...resumeData, education: newEdu });
  };

  const handleGenerateAI = async () => {
    if (userPlan !== 'TEAM') {
      toast.warning('AI Cover Letter & Resume Tailoring require the ELITE Plan. Upgrade now to unlock!');
      setShowPlanModal(true);
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/documents/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          resumeData,
          letterData
        })
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate content');

      if (activeTab === 'resume') {
        setResumeData(data.data);
        toast.success('Your resume has been successfully polished by Gemini AI!');
      } else {
        setLetterData({
          ...letterData,
          content: data.data
        });
        toast.success('Your cover letter has been tailored perfectly by Gemini AI!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'An error occurred while calling Gemini AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const [{ pdf }, { JobDocumentPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/documents/JobDocumentPdf'),
      ]);

      const filename =
        activeTab === 'resume'
          ? `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`
          : `${resumeData.fullName.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
      const generatedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const blob = await pdf(
        <JobDocumentPdf
          activeTab={activeTab}
          generatedDate={generatedDate}
          letterData={letterData}
          resumeData={resumeData}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success('PDF exported successfully.');
    } catch (err) {
      console.error('PDF Export failed:', err);
      toast.error('Failed to export PDF file. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 print:p-0 print:m-0">
      {/* Native Premium Print CSS overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide scrollbars during print */
          ::-webkit-scrollbar {
            display: none !important;
          }
          /* Set page margins to none to allow full page utilization */
          @page {
            size: letter;
            margin: 0 !important;
          }
          /* Ensure the preview container spans the whole printed page perfectly */
          #resume-preview {
            border: none !important;
            box-shadow: none !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 0.75in !important; /* Perfect executive margin on paper */
            margin: 0 !important;
            overflow: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            background: white !important;
            z-index: 9999999 !important;
          }
        }
      ` }} />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Suite</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">Career Builder</h1>
        </div>

        <div className="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[24px] border border-slate-200/80 shadow-inner">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-white text-blue-600 shadow-md border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout size={14} />
            Tech Resume
          </button>
          <button
            onClick={() => setActiveTab('cover-letter')}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'cover-letter'
                ? 'bg-white text-blue-600 shadow-md border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PenTool size={14} />
            Cover Letter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
        {/* Editor Side */}
        <div className="space-y-8 animate-in slide-in-from-left duration-700 print:hidden">
          <div className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-10 shadow-xl shadow-slate-100/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 shrink-0">
                  {activeTab === 'resume' ? <Layout size={26} className="stroke-[1.5]" /> : <PenTool size={26} className="stroke-[1.5]" />}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{activeTab === 'resume' ? 'Resume Editor' : 'Letter Composer'}</h3>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Customize your details</p>
                </div>
              </div>

              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 min-w-[130px] self-start sm:self-center"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : userPlan !== 'TEAM' ? (
                  <>
                    <Lock size={12} className="text-amber-300 mr-0.5" />
                    <span>AI Polish</span>
                    <span className="text-[7px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase ml-1 shadow-sm">Elite</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>AI Polish</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-10 h-[700px] overflow-y-auto pr-4 custom-scrollbar pb-10">
              {activeTab === 'resume' ? (
                <div className="space-y-12">
                   {/* 1. Personal Info */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                          01
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Contact Information</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">How recruiters can reach you</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <User size={12} className="text-slate-400" />
                             Full Name
                           </label>
                           <input 
                             value={resumeData.fullName} 
                             onChange={e => setResumeData({...resumeData, fullName: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <MapPin size={12} className="text-slate-400" />
                             Location
                           </label>
                           <input 
                             value={resumeData.location} 
                             onChange={e => setResumeData({...resumeData, location: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <Mail size={12} className="text-slate-400" />
                             Email Address
                           </label>
                           <input 
                             value={resumeData.email} 
                             onChange={e => setResumeData({...resumeData, email: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <Phone size={12} className="text-slate-400" />
                             Phone Number
                           </label>
                           <input 
                             value={resumeData.phone} 
                             onChange={e => setResumeData({...resumeData, phone: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                             GitHub URL
                           </label>
                           <input 
                             value={resumeData.github} 
                             onChange={e => setResumeData({...resumeData, github: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                             <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                             LinkedIn URL
                           </label>
                           <input 
                             value={resumeData.linkedin} 
                             onChange={e => setResumeData({...resumeData, linkedin: e.target.value})} 
                             className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                           />
                        </div>
                      </div>
                   </div>

                   {/* 2. Technical Summary */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                          02
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Technical Summary</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">A brief description of your expertise</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                         <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                           <BookOpen size={12} className="text-slate-400" />
                           Summary Statement
                         </label>
                         <textarea 
                           rows={5} 
                           value={resumeData.summary} 
                           onChange={e => setResumeData({...resumeData, summary: e.target.value})} 
                           className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm resize-none" 
                         />
                      </div>
                   </div>

                   {/* 3. Technical Skills */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                          03
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Technical Skills</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Technologies, frameworks, and tools</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        {Object.entries(resumeData.skills).map(([key, val]) => (
                          <div key={key} className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 capitalize">
                               <Wrench size={12} className="text-slate-400" />
                               {key}
                             </label>
                             <input 
                               value={val} 
                               onChange={e => setResumeData({...resumeData, skills: {...resumeData.skills, [key]: e.target.value}})} 
                               className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                             />
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 4. Experience */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                            04
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Experience</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your professional work history</p>
                          </div>
                        </div>
                        <button 
                          onClick={addExperience}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all border border-blue-100/50 cursor-pointer shadow-sm active:scale-95 duration-200"
                        >
                          <Plus size={14} className="stroke-[2.5]" /> Add Role
                        </button>
                      </div>

                      <div className="space-y-8">
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="p-6 rounded-[28px] border-2 border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100/55 transition-all duration-350 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeExperience(i)}
                               className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 transition-all opacity-0 group-hover/item:opacity-100 shadow-sm cursor-pointer"
                             >
                               <Trash2 size={14} />
                             </button>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <Briefcase size={10} className="text-slate-400" /> Title
                                   </label>
                                   <input 
                                     value={exp.title} 
                                     onChange={e => {
                                        const newExp = [...resumeData.experience];
                                        newExp[i].title = e.target.value;
                                        setResumeData({...resumeData, experience: newExp});
                                     }} 
                                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                   />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      Dates
                                   </label>
                                   <input 
                                     value={exp.date} 
                                     onChange={e => {
                                        const newExp = [...resumeData.experience];
                                        newExp[i].date = e.target.value;
                                        setResumeData({...resumeData, experience: newExp});
                                     }} 
                                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                   />
                                </div>
                             </div>
                             
                             <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  Company
                                </label>
                                <input 
                                  value={exp.company} 
                                  onChange={e => {
                                     const newExp = [...resumeData.experience];
                                     newExp[i].company = e.target.value;
                                     setResumeData({...resumeData, experience: newExp});
                                  }} 
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                />
                             </div>
                             
                             <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  Responsibilities (One per line)
                                </label>
                                <textarea 
                                  rows={4} 
                                  value={exp.bullets.join('\n')} 
                                  onChange={e => {
                                     const newExp = [...resumeData.experience];
                                     newExp[i].bullets = e.target.value.split('\n');
                                     setResumeData({...resumeData, experience: newExp});
                                  }} 
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all resize-none" 
                                />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 5. Projects */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                            05
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Projects</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Key engineering creations</p>
                          </div>
                        </div>
                        <button 
                          onClick={addProject}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all border border-blue-100/50 cursor-pointer shadow-sm active:scale-95 duration-200"
                        >
                          <Plus size={14} className="stroke-[2.5]" /> Add Project
                        </button>
                      </div>

                      <div className="space-y-8">
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="p-6 rounded-[28px] border-2 border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100/55 transition-all duration-350 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeProject(i)}
                               className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 transition-all opacity-0 group-hover/item:opacity-100 shadow-sm cursor-pointer"
                             >
                               <Trash2 size={14} />
                             </button>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Project Name</label>
                                   <input 
                                     value={proj.name} 
                                     onChange={e => {
                                        const newProj = [...resumeData.projects];
                                        newProj[i].name = e.target.value;
                                        setResumeData({...resumeData, projects: newProj});
                                     }} 
                                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                   />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Link</label>
                                   <input 
                                     value={proj.link} 
                                     onChange={e => {
                                        const newProj = [...resumeData.projects];
                                        newProj[i].link = e.target.value;
                                        setResumeData({...resumeData, projects: newProj});
                                     }} 
                                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                   />
                                </div>
                             </div>
                             
                             <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Key Features (One per line)</label>
                                <textarea 
                                  rows={3} 
                                  value={proj.bullets.join('\n')} 
                                  onChange={e => {
                                     const newProj = [...resumeData.projects];
                                     newProj[i].bullets = e.target.value.split('\n');
                                     setResumeData({...resumeData, projects: newProj});
                                  }} 
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all resize-none" 
                                />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 6. Education */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                            06
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Education</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Academic credentials</p>
                          </div>
                        </div>
                        <button 
                          onClick={addEducation}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all border border-blue-100/50 cursor-pointer shadow-sm active:scale-95 duration-200"
                        >
                          <Plus size={14} className="stroke-[2.5]" /> Add School
                        </button>
                      </div>

                      <div className="space-y-6">
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="p-6 rounded-[28px] border-2 border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100/55 transition-all duration-350 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeEducation(i)}
                               className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 transition-all opacity-0 group-hover/item:opacity-100 shadow-sm cursor-pointer"
                             >
                               <Trash2 size={14} />
                             </button>
                             
                             <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <GraduationCap size={11} className="text-slate-400" /> Degree
                                   </label>
                                   <input 
                                     value={edu.degree} 
                                     onChange={e => {
                                        const newEdu = [...resumeData.education];
                                        newEdu[i].degree = e.target.value;
                                        setResumeData({...resumeData, education: newEdu});
                                     }} 
                                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                   />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">School</label>
                                      <input 
                                        value={edu.school} 
                                        onChange={e => {
                                           const newEdu = [...resumeData.education];
                                           newEdu[i].school = e.target.value;
                                           setResumeData({...resumeData, education: newEdu});
                                        }} 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Dates</label>
                                      <input 
                                        value={edu.date} 
                                        onChange={e => {
                                           const newEdu = [...resumeData.education];
                                           newEdu[i].date = e.target.value;
                                           setResumeData({...resumeData, education: newEdu});
                                        }} 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-slate-800 transition-all" 
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 shadow-sm border border-blue-100/50">
                      01
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Letter Details</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target information for the recipient</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-slate-400" />
                        Target Company
                      </label>
                      <input 
                        value={letterData.company} 
                        onChange={e => setLetterData({...letterData, company: e.target.value})} 
                        className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        Job Role
                      </label>
                      <input 
                        value={letterData.role} 
                        onChange={e => setLetterData({...letterData, role: e.target.value})} 
                        className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Job Description / Post Details
                    </label>
                    <textarea 
                      rows={5} 
                      value={letterData.jobDescription} 
                      onChange={e => setLetterData({...letterData, jobDescription: e.target.value})} 
                      placeholder="Paste the full job post details here (description, qualifications, requirements) so Gemini AI can tailor your cover letter perfectly..."
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm resize-none" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      Letter Content
                    </label>
                    <textarea 
                      rows={10} 
                      value={letterData.content} 
                      onChange={e => setLetterData({...letterData, content: e.target.value})} 
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 transition-all text-sm shadow-sm resize-none" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="sticky top-10 animate-in slide-in-from-right duration-700 delay-150 print:static print:w-full">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 print:hidden">
             <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Document Preview</span>
             </div>
             
             <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  onClick={handleCopy}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm cursor-pointer active:scale-95 duration-200"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm cursor-pointer active:scale-95 duration-200" 
                  title="Print to PDF"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/15 transition-all cursor-pointer active:scale-95 duration-200 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span>{isGenerating ? 'Generating...' : 'Export PDF'}</span>
                </button>
             </div>
          </div>

          <div id="resume-preview" className="aspect-[1/1.41] w-full bg-white rounded-3xl shadow-2xl shadow-slate-300/40 p-10 md:p-12 relative overflow-hidden group/paper text-black overflow-y-auto print:shadow-none print:p-0 print:m-0 print:w-full print:h-full print:rounded-none border border-slate-100/50">
            {/* Real Professional Layout */}
            {activeTab === 'resume' ? (
              <div className="space-y-6 text-[11px] leading-[1.3] font-serif">
                {/* Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">{resumeData.fullName}</h1>
                  <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-slate-600 font-medium">
                    <span>{resumeData.location}</span>
                    <span className="text-slate-300">|</span>
                    <span>{resumeData.email}</span>
                    <span className="text-slate-300">|</span>
                    <span>{resumeData.phone}</span>
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-slate-600 font-medium">
                    <span>{resumeData.github}</span>
                    <span className="text-slate-300">|</span>
                    <span>{resumeData.linkedin}</span>
                  </div>
                </div>

                {/* Section: Technical Summary */}
                <div className="space-y-2">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5">Technical Summary</h2>
                  <p className="text-justify font-medium text-slate-800">
                    {resumeData.summary}
                  </p>
                </div>

                {/* Section: Technical Skills */}
                <div className="space-y-2">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5">Technical Skills</h2>
                  <div className="space-y-1">
                    {Object.entries(resumeData.skills).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-bold min-w-[80px] capitalize">{key}:</span>
                        <span className="text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Experience */}
                <div className="space-y-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5">Experience</h2>
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-[12px]">{exp.title}</div>
                        <div className="font-bold italic">{exp.date}</div>
                      </div>
                      <div className="font-medium">{exp.company}</div>
                      <ul className="list-disc pl-5 space-y-1 text-slate-800">
                        {exp.bullets.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Section: Projects */}
                <div className="space-y-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5">Projects (Selected)</h2>
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="space-y-1">
                      <div className="font-bold text-[11px]">{proj.name}</div>
                      <div className="text-black text-[10px]">{proj.link}</div>
                      <ul className="list-disc pl-5 space-y-0.5 text-slate-800">
                        {proj.bullets.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Section: Education */}
                <div className="space-y-3">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5">Education</h2>
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{edu.degree}</div>
                        <div className="font-medium text-slate-700">{edu.school}</div>
                      </div>
                      <div className="font-bold italic">{edu.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10 font-serif leading-[1.6] text-slate-800 text-[11px] h-full flex flex-col">
                {/* Sender Header (Matches Resume) */}
                <div className="text-right space-y-0.5 border-b border-slate-100 pb-6 mb-10">
                   <p className="font-bold text-lg text-slate-900 tracking-tight">{resumeData.fullName}</p>
                   <p className="text-slate-500 font-medium">{resumeData.location}</p>
                   <p className="text-slate-500 font-medium">{resumeData.email}</p>
                   <p className="text-slate-500 font-medium">{resumeData.phone}</p>
                   <p className="text-slate-400 font-bold mt-2">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                {/* Recipient Block */}
                <div className="space-y-1 mb-8">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient Details</p>
                   <p className="font-bold text-slate-900 text-sm">{letterData.recipient}</p>
                   <p className="font-bold text-slate-700 italic">{letterData.role}</p>
                   <p className="font-bold text-slate-900">{letterData.company}</p>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-justify leading-relaxed">
                    {letterData.content || 'Your personalized cover letter will appear here after clicking "AI Polish" or typing in the composer...'}
                  </p>
                </div>

                {/* Signature Block */}
                <div className="pt-12 mt-auto">
                   <p className="text-slate-500 mb-8 font-medium">Best Regards,</p>
                   <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-900">{resumeData.fullName}</p>
                      <p className="text-slate-500 font-medium italic">Enclosure: Resume</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </div>
  );
}
