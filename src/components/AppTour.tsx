import React, { useEffect, useCallback } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
  Camera,
  LayoutDashboard,
  Heart,
  GraduationCap,
  Calendar,
  Users,
  Megaphone,
  Scroll,
  Scale,
  Settings,
  Bot
} from 'lucide-react';
import { TourStep } from '../types';

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onNavigateToTool: (toolId: string) => void;
  activeToolId: string;
}

export const AppTour: React.FC<AppTourProps> = ({
  isOpen,
  onClose,
  steps,
  currentStepIndex,
  onStepChange,
  onNavigateToTool,
  activeToolId
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      onStepChange(nextIndex);
      if (steps[nextIndex]?.targetToolId) {
        onNavigateToTool(steps[nextIndex].targetToolId);
      }
    } else {
      localStorage.setItem('church_tour_completed', 'true');
      onClose();
    }
  }, [currentStepIndex, steps, onStepChange, onNavigateToTool, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      onStepChange(prevIndex);
      if (steps[prevIndex]?.targetToolId) {
        onNavigateToTool(steps[prevIndex].targetToolId);
      }
    }
  }, [currentStepIndex, steps, onStepChange, onNavigateToTool]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('church_tour_completed', 'true');
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen || !currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  // Icon mapping
  const renderStepIcon = (name?: string) => {
    switch (name) {
      case 'Camera':
        return <Camera className="w-5 h-5 text-amber-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-500" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-sky-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-emerald-500" />;
      case 'Megaphone':
        return <Megaphone className="w-5 h-5 text-amber-600" />;
      case 'Scroll':
        return <Scroll className="w-5 h-5 text-orange-500" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-blue-600" />;
      case 'Settings':
        return <Settings className="w-5 h-5 text-slate-500" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-[#D4AF37]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="app-tour-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        className="relative w-full max-w-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-900/60 rounded-2xl shadow-2xl overflow-hidden transition-all"
      >
        {/* Top Decorative Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#D4AF37]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {renderStepIcon(currentStep.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7D3AC1]/10 dark:bg-[#D4AF37]/20 text-[#7D3AC1] dark:text-[#D4AF37] border border-[#7D3AC1]/20 dark:border-[#D4AF37]/30">
                    {currentStep.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <h2
                  id="tour-step-title"
                  className="font-serif-cinzel font-bold text-lg sm:text-xl text-slate-900 dark:text-white mt-1 leading-tight"
                >
                  {currentStep.title}
                </h2>
              </div>
            </div>

            <button
              id="tour-skip-close-btn"
              onClick={handleSkip}
              aria-label="Exit tour"
              title="Exit tour (Esc)"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs font-medium text-[#7D3AC1] dark:text-[#D4AF37] mt-2">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Feature Highlights */}
          {currentStep.highlights && currentStep.highlights.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Key Capabilities:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                {currentStep.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practical Tip */}
          {currentStep.tips && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Pro-Tip: </strong>
                <span>{currentStep.tips}</span>
              </div>
            </div>
          )}

          {/* Current view status indicator */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Background view: <strong className="text-slate-800 dark:text-slate-200 capitalize">{activeToolId}</strong>
            </span>
            {currentStep.targetToolId && currentStep.targetToolId !== activeToolId && (
              <button
                type="button"
                onClick={() => onNavigateToTool(currentStep.targetToolId)}
                className="text-[11px] font-bold text-[#7D3AC1] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>Jump to {currentStep.targetToolId} view</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[140px] sm:max-w-xs py-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onStepChange(idx);
                  if (steps[idx]?.targetToolId) {
                    onNavigateToTool(steps[idx].targetToolId);
                  }
                }}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#7D3AC1] dark:bg-[#D4AF37]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-emerald-500/70'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="tour-skip-text-btn"
              type="button"
              onClick={handleSkip}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Skip
            </button>

            {currentStepIndex > 0 && (
              <button
                id="tour-prev-btn"
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}

            <button
              id="tour-next-btn"
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
              {isLastStep && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
