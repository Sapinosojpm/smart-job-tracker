'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Sparkles, HelpCircle } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  selector: string;
  position?: 'top' | 'bottom' | 'center';
}

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS: Step[] = [
  {
    title: "👋 Welcome to JobScoutAI!",
    description: "This is your intelligent dashboard for searching remote jobs quickly. We'll give you a quick 1-minute guide on how to use it.",
    selector: "",
    position: 'center',
  },
  {
    title: "🔍 Search Now",
    description: "Click this to tell our AI crawlers to search for the latest jobs on We Work Remotely, Wellfound, Remote.co, and more. It will automatically update your board.",
    selector: "#tour-search-btn-wrapper",
    position: 'bottom',
  },
  {
    title: "⚡ Searches Left",
    description: "Here you can see how many searches are left for your account today. On the Free tier, you get 50 searches per day. Upgrade to PRO for unlimited searches!",
    selector: "#tour-quota-badge",
    position: 'bottom',
  },
  {
    title: "🎯 Filters",
    description: "Filter your list! Click 'ALL' to see everything, 'NEW' for new listings you haven't read yet, and 'APPLIED' for jobs you have marked as applied.",
    selector: "#tour-filters",
    position: 'top',
  },
  {
    title: "⌨️ Search Bar (Keyword Filter)",
    description: "Looking for a specific tech stack or position? Type keywords like 'React', 'Node', or a company name to instantly filter the list on the screen.",
    selector: "#tour-search-bar",
    position: 'bottom',
  },
  {
    title: "💼 Job Actions",
    description: "On each job card, you can click the check circle icon to mark it as 'Applied' (to track your progress) or click 'Apply' to go to the original job posting website.",
    selector: "#tour-job-card",
    position: 'top',
  },
  {
    title: "⚙️ Other Control Buttons",
    description: "Here you can configure your job notification settings, download your list as a CSV, or clear your job board.",
    selector: "#tour-secondary-actions",
    position: 'bottom',
  }
];

export default function TutorialTour({ isOpen, onClose }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!step.selector) {
        // Welcome step / Centered step
        setHighlightStyle({
          opacity: 0,
          pointerEvents: 'none',
        });
        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 500,
        });
        return;
      }

      const element = document.querySelector(step.selector);
      if (!element) {
        // Fallback to center if element is not rendered
        setHighlightStyle({
          opacity: 0,
          pointerEvents: 'none',
        });
        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 500,
        });
        return;
      }

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Get element bounds
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      const top = rect.top + window.scrollY - padding;
      const left = rect.left + window.scrollX - padding;
      const width = rect.width + padding * 2;
      const height = rect.height + padding * 2;

      setHighlightStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 450,
      });

      // Calculate tooltip position
      setTimeout(() => {
        if (!tooltipRef.current) return;
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let tTop = 0;
        let tLeft = 0;

        // Default position logic based on step preferences and space
        const pref = step.position || 'bottom';

        if (pref === 'bottom') {
          tTop = rect.bottom + window.scrollY + 12;
          tLeft = rect.left + window.scrollX + rect.width / 2 - tooltipRect.width / 2;
        } else if (pref === 'top') {
          tTop = rect.top + window.scrollY - tooltipRect.height - 12;
          tLeft = rect.left + window.scrollX + rect.width / 2 - tooltipRect.width / 2;
        }

        // Bound check horizontal limits
        const margin = 16;
        if (tLeft < margin) tLeft = margin;
        if (tLeft + tooltipRect.width > window.innerWidth - margin) {
          tLeft = window.innerWidth - tooltipRect.width - margin;
        }

        // Bound check vertical limits
        if (tTop < window.scrollY + margin) {
          tTop = rect.bottom + window.scrollY + 12; // Flip to bottom if it goes off top
        }

        setTooltipStyle({
          position: 'absolute',
          top: `${tTop}px`,
          left: `${tLeft}px`,
          zIndex: 500,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }, 50);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    // Add small delay to handle transitions or dom rendering differences
    const timeout = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timeout);
    };
  }, [isOpen, currentStep, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('jobscoutai_tour_completed', 'true');
      onClose();
      setCurrentStep(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('jobscoutai_tour_completed', 'true');
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[400] overflow-y-auto">
      {/* Semi-transparent backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Pulsing spotlight container */}
      {step.selector && (
        <div 
          style={highlightStyle}
          className="rounded-2xl border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.65),_0_0_15px_3px_rgba(59,130,246,0.5)] animate-pulse-subtle pointer-events-none"
        />
      )}

      {/* Custom Tooltip Dialog */}
      <div 
        ref={tooltipRef}
        style={tooltipStyle}
        className="w-full max-w-[360px] bg-white rounded-[28px] border border-slate-100 shadow-2xl p-6 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Sparkles size={16} className="fill-blue-600/10" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              User Guide
            </span>
          </div>
          <button 
            onClick={handleSkip}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2.5">
            {step.title}
          </h3>
          <p className="text-slate-600 text-xs font-semibold leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Progress Indicator */}
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep 
                    ? 'w-4 bg-blue-600' 
                    : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-colors"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <span>
                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </span>
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
