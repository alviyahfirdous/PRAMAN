import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Info,
  Lock,
  ArrowRight,
  Brain
} from 'lucide-react';
import type { Draft } from '@/lib/assist/types';

interface ProcessingPipelineProps {
  isProcessing: boolean;
  draft: Draft | null;
  onProceedToReview: () => void;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  isProcessing,
  draft,
  onProceedToReview,
}) => {
  // Compute checkpoint statistics from draft
  let totalFields = 0;
  let validatedFields = 0;
  let requireReviewFields = 0;
  const aeCount = draft?.aeEvents.length || 0;

  if (draft) {
    Object.values(draft.groups).forEach((fields) => {
      fields.forEach((f) => {
        totalFields++;
        if (f.status === 'Extracted') {
          validatedFields++;
        } else if (f.status === 'Uncertain' || f.status === 'Missing' || f.status === 'HumanAssessmentRequired') {
          requireReviewFields++;
        }
      });
    });

    draft.aeEvents.forEach((ev) => {
      ev.fields.forEach((f) => {
        totalFields++;
        if (f.status === 'Extracted') {
          validatedFields++;
        } else if (f.status === 'Uncertain' || f.status === 'Missing' || f.status === 'HumanAssessmentRequired') {
          requireReviewFields++;
        }
      });
    });
  } else {
    // Default placeholder metrics matching the design mockup when previewing
    totalFields = 42;
    validatedFields = 39;
    requireReviewFields = 3;
  }

  // Stages configuration
  const stages = [
    {
      id: 1,
      title: '1. Document Analysis',
      description: 'Reading and understanding the clinical note...',
      status: isProcessing ? 'Completed' : draft ? 'Completed' : 'Pending',
      progress: isProcessing ? 100 : draft ? 100 : 0,
    },
    {
      id: 2,
      title: '2. AI Prompting & Extraction',
      description: 'Extracting key clinical information using AI...',
      status: isProcessing ? 'Completed' : draft ? 'Completed' : 'Pending',
      progress: isProcessing ? 100 : draft ? 100 : 0,
    },
    {
      id: 3,
      title: '3. Converting to Structured Data',
      description: 'Mapping to CDASH/SDTM format and validating fields...',
      status: isProcessing ? 'In Progress' : draft ? 'Completed' : 'Pending',
      progress: isProcessing ? 75 : draft ? 100 : 0,
    },
    {
      id: 4,
      title: '4. Validation & Consistency Check',
      description: 'Checking for missing values, conflicts and clinical rules...',
      status: isProcessing ? 'Pending' : draft ? 'Completed' : 'Pending',
      progress: isProcessing ? 20 : draft ? 100 : 0,
    },
    {
      id: 5,
      title: '5. Generate Summary & Flags',
      description: 'Identifying review items, adverse events and exceptions...',
      status: isProcessing ? 'Pending' : draft ? 'Completed' : 'Pending',
      progress: isProcessing ? 0 : draft ? 100 : 0,
    },
    {
      id: 6,
      title: '6. Human Review & Approval',
      description: 'Your review is required for final submission.',
      status: draft ? 'Ready' : 'Pending',
      progress: draft ? 100 : 0,
    },
  ];

  const isCompleted = !isProcessing && draft !== null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top AI Status Card */}
      <div className="clinical-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
              <Brain size={26} className={isProcessing ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <span>{isProcessing ? 'AI Processing in Progress' : isCompleted ? 'AI Processing Completed' : 'Ready for AI Processing'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isProcessing
                  ? 'Our AI is reading, extracting and structuring your clinical data. This may take a few moments.'
                  : isCompleted
                  ? 'Clinical entities extracted, validated against verbatim spans, and mapped to SDTM datasets.'
                  : 'Upload a note or select a preset on the left, then click Start AI Processing.'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ${
              isProcessing
                ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                : isCompleted
                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isProcessing ? 'bg-purple-600' : isCompleted ? 'bg-teal-600' : 'bg-slate-400'
              }`}
            />
            <span>{isProcessing ? 'In Progress...' : isCompleted ? 'Completed' : 'Pending'}</span>
          </span>
        </div>

        {/* 6-Stage Progress List */}
        <div className="space-y-3.5 pt-2">
          {stages.map((stage) => {
            const isStageDone = stage.status === 'Completed' || stage.status === 'Ready';
            const isStageActive = stage.status === 'In Progress';

            return (
              <div key={stage.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isStageDone ? (
                      <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                    ) : isStageActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100 flex-shrink-0" />
                    )}
                    <span className={`font-semibold ${isStageDone || isStageActive ? 'text-navy-900' : 'text-slate-500'}`}>
                      {stage.title}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">— {stage.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold ${
                        isStageDone
                          ? 'text-teal-700'
                          : isStageActive
                          ? 'text-purple-700 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 w-8 text-right">
                      {stage.progress}%
                    </span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isStageDone
                        ? 'bg-teal-500'
                        : isStageActive
                        ? 'bg-purple-600 animate-pulse'
                        : 'bg-slate-200'
                    }`}
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Checkpoints Card */}
      <div className="clinical-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
          <Sparkles size={14} className="text-purple-600" />
          <span>Processing Checkpoints</span>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Fields Extracted */}
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Fields</div>
              <div className="text-base font-extrabold text-teal-950 font-mono">
                {totalFields} <span className="text-[11px] font-normal text-teal-800">Extracted</span>
              </div>
            </div>
          </div>

          {/* Card 2: Validated */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Validated</div>
              <div className="text-base font-extrabold text-blue-950 font-mono">
                {validatedFields}
              </div>
            </div>
          </div>

          {/* Card 3: Require Review */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Require Review</div>
              <div className="text-base font-extrabold text-amber-950 font-mono">
                {requireReviewFields}
              </div>
            </div>
          </div>

          {/* Card 4: Adverse Event */}
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <HeartPulse size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Adverse Event</div>
              <div className="text-base font-extrabold text-rose-950 font-mono">
                {aeCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
        <Info size={16} className="text-blue-600 flex-shrink-0" />
        <span>
          AI has extracted and structured the data. Final review and approval is required before submission to CTMS.
        </span>
      </div>

      {/* Review & Approve Action Button */}
      <button
        type="button"
        disabled={isProcessing || !draft}
        onClick={onProceedToReview}
        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Lock size={15} />
        <span>Review &amp; Approve Structured Data</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
};
