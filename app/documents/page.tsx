'use client';

import { useState } from 'react';
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
  Trash2
} from 'lucide-react';

type DocType = 'resume' | 'cover-letter';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocType>('resume');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resume State
  const [resumeData, setResumeData] = useState({
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
  const [letterData, setLetterData] = useState({
    recipient: 'Hiring Manager',
    company: 'Tech Solutions Inc.',
    role: 'Senior React Developer',
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

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (activeTab === 'resume') {
        // AI Logic would go here
      } else {
        setLetterData({
          ...letterData,
          content: `Dear ${letterData.recipient},\n\nI am writing to express my strong interest in the ${letterData.role} position at ${letterData.company}. With my background in software development and my passion for building user-centric applications, I am confident that I would be a valuable asset to your team.\n\nThroughout my career, I have demonstrated a commitment to technical excellence and continuous learning. My experience at previous roles has equipped me with the skills necessary to excel in a fast-paced environment like yours.\n\nThank you for your time and consideration. I look forward to the possibility of discussing how my skills and experience align with the needs of your team.\n\nSincerely,\n${resumeData.fullName}`
        });
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('resume-preview');
      if (!element) return;
      
      const opt = {
        margin:       0,
        filename:     `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 3, // Higher scale for crisp text
          useCORS: true,
          letterRendering: true
        },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed:', err);
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Suite</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Career Builder</h1>
        </div>

        <div className="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[24px] border border-slate-200">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'resume'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout size={14} />
            Tech Resume
          </button>
          <button
            onClick={() => setActiveTab('cover-letter')}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'cover-letter'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
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
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  {activeTab === 'resume' ? <Layout size={24} /> : <PenTool size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activeTab === 'resume' ? 'Resume Editor' : 'Letter Composer'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Customize your details</p>
                </div>
              </div>

              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                AI Polish
              </button>
            </div>

            <div className="space-y-10 h-[750px] overflow-y-auto pr-4 custom-scrollbar pb-20">
              {activeTab === 'resume' ? (
                <div className="space-y-12">
                   {/* 1. Personal Info */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-blue-600 rounded-full" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">1. Contact Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                           <input value={resumeData.fullName} onChange={e => setResumeData({...resumeData, fullName: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                           <input value={resumeData.location} onChange={e => setResumeData({...resumeData, location: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                           <input value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                           <input value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GitHub</label>
                           <input value={resumeData.github} onChange={e => setResumeData({...resumeData, github: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">LinkedIn</label>
                           <input value={resumeData.linkedin} onChange={e => setResumeData({...resumeData, linkedin: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                        </div>
                      </div>
                   </div>

                   {/* 2. Technical Summary */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-blue-600 rounded-full" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">2. Technical Summary</h4>
                      </div>
                      <textarea rows={5} value={resumeData.summary} onChange={e => setResumeData({...resumeData, summary: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all resize-none" />
                   </div>

                   {/* 3. Technical Skills */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-blue-600 rounded-full" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">3. Technical Skills</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {Object.entries(resumeData.skills).map(([key, val]) => (
                          <div key={key} className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 capitalize">{key}</label>
                             <input value={val} onChange={e => setResumeData({...resumeData, skills: {...resumeData.skills, [key]: e.target.value}})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 4. Experience */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-600 rounded-full" />
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">4. Experience</h4>
                        </div>
                        <button 
                          onClick={addExperience}
                          className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Role
                        </button>
                      </div>
                      <div className="space-y-8">
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeExperience(i)}
                               className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                             >
                               <Trash2 size={16} />
                             </button>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                                   <input value={exp.title} onChange={e => {
                                      const newExp = [...resumeData.experience];
                                      newExp[i].title = e.target.value;
                                      setResumeData({...resumeData, experience: newExp});
                                   }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</label>
                                   <input value={exp.date} onChange={e => {
                                      const newExp = [...resumeData.experience];
                                      newExp[i].date = e.target.value;
                                      setResumeData({...resumeData, experience: newExp});
                                   }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                                <input value={exp.company} onChange={e => {
                                   const newExp = [...resumeData.experience];
                                   newExp[i].company = e.target.value;
                                   setResumeData({...resumeData, experience: newExp});
                                }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsibilities (One per line)</label>
                                <textarea rows={4} value={exp.bullets.join('\n')} onChange={e => {
                                   const newExp = [...resumeData.experience];
                                   newExp[i].bullets = e.target.value.split('\n');
                                   setResumeData({...resumeData, experience: newExp});
                                }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold resize-none" />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 5. Projects */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-600 rounded-full" />
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">5. Projects</h4>
                        </div>
                        <button 
                          onClick={addProject}
                          className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Project
                        </button>
                      </div>
                      <div className="space-y-8">
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeProject(i)}
                               className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                             >
                               <Trash2 size={16} />
                             </button>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Name</label>
                                   <input value={proj.name} onChange={e => {
                                      const newProj = [...resumeData.projects];
                                      newProj[i].name = e.target.value;
                                      setResumeData({...resumeData, projects: newProj});
                                   }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link</label>
                                   <input value={proj.link} onChange={e => {
                                      const newProj = [...resumeData.projects];
                                      newProj[i].link = e.target.value;
                                      setResumeData({...resumeData, projects: newProj});
                                   }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Features (One per line)</label>
                                <textarea rows={3} value={proj.bullets.join('\n')} onChange={e => {
                                   const newProj = [...resumeData.projects];
                                   newProj[i].bullets = e.target.value.split('\n');
                                   setResumeData({...resumeData, projects: newProj});
                                }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold resize-none" />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-600 rounded-full" />
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">6. Education</h4>
                        </div>
                        <button 
                          onClick={addEducation}
                          className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1"
                        >
                          <Plus size={14} /> Add School
                        </button>
                      </div>
                      <div className="space-y-6">
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 relative group/item">
                             <button 
                               onClick={() => removeEducation(i)}
                               className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                             >
                               <Trash2 size={16} />
                             </button>
                             <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Degree</label>
                                   <input value={edu.degree} onChange={e => {
                                      const newEdu = [...resumeData.education];
                                      newEdu[i].degree = e.target.value;
                                      setResumeData({...resumeData, education: newEdu});
                                   }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School</label>
                                      <input value={edu.school} onChange={e => {
                                         const newEdu = [...resumeData.education];
                                         newEdu[i].school = e.target.value;
                                         setResumeData({...resumeData, education: newEdu});
                                      }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</label>
                                      <input value={edu.date} onChange={e => {
                                         const newEdu = [...resumeData.education];
                                         newEdu[i].date = e.target.value;
                                         setResumeData({...resumeData, education: newEdu});
                                      }} className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-white focus:border-blue-400 outline-none text-sm font-semibold" />
                                   </div>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Company</label>
                      <input value={letterData.company} onChange={e => setLetterData({...letterData, company: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                      <input value={letterData.role} onChange={e => setLetterData({...letterData, role: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Letter Content</label>
                    <textarea rows={15} value={letterData.content} onChange={e => setLetterData({...letterData, content: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none font-semibold text-slate-800 transition-all resize-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="sticky top-10 animate-in slide-in-from-right duration-700 delay-150 print:static print:w-full">
          <div className="mb-6 flex items-center justify-between px-4 print:hidden">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Document Preview</span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
                <button className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Print to PDF">
                  <Printer size={18} />
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {isGenerating ? 'Generating...' : 'Export PDF'}
                </button>
             </div>
          </div>

          <div id="resume-preview" className="aspect-[1/1.41] w-full bg-white rounded-[4px] shadow-2xl shadow-blue-900/10 p-10 md:p-12 relative overflow-hidden group/paper text-black overflow-y-auto print:shadow-none print:p-0 print:m-0 print:w-full print:h-full print:rounded-none">
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
                      <div className="text-blue-700 underline text-[10px]">{proj.link}</div>
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
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Recipient Details</p>
                   <p className="font-bold text-slate-900 text-sm">{letterData.recipient}</p>
                   <p className="font-bold text-slate-700 italic">{letterData.role}</p>
                   <p className="font-black text-blue-600 underline decoration-blue-200 underline-offset-4">{letterData.company}</p>
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
                      <p className="font-bold text-sm text-slate-900 border-t border-slate-200 pt-4 inline-block min-w-[200px]">{resumeData.fullName}</p>
                      <p className="text-slate-500 font-medium italic">Enclosure: Resume</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
