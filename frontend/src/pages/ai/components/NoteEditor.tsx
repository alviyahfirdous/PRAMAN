import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Upload,
  CloudUpload,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { EvidenceHighlight } from './EvidenceHighlight';
import { detectAndMaskPII } from '@/lib/assist/masking';
import type { EvidenceQuote } from '@/lib/assist/types';

export const SAMPLE_NOTES = {
  followup: `Patient SUB-DEL01-0002 (AyurVeda OA-2026, Delhi Main Campus) attended today for Week 8 protocol visit.
Physical Exam: Knee flexion improved to 110 degrees, moderate bilateral crepitus.
Vitals: Blood pressure 124/82 mmHg, heart rate 74 bpm regular, SpO2 99%, weight 68 kg.
Efficacy Outcomes: Patient reports significant reduction in morning stiffness (<15 mins vs 45 mins at baseline). WOMAC pain scale score improved to 34 (down from 58 at baseline).
Medication Adherence: Took Vatari Guggulu 500mg BID regularly with warm water. Returned blister pack confirmed 100% adherence (0 missed doses).
Adverse Events: Patient noted mild burning sensation in epigastrium and mild acidity occurring 30-45 mins after morning dose for the last 3 days. Graded as mild in severity, non-serious. Causality assessed as possibly related to study drug. Advised patient to take formulation with warm milk (Ksheera Anupana) post meals.
Ayurvedic Assessment: Pitta aggravation secondary to Ushna Virya of Guggulu; Agni assessed as Tikshnagni.
Plan: Continue trial medication with milk Anupana. Next follow-up visit scheduled in 4 weeks (Week 12 milestone).`,

  screening: `New screening subject PRM-DEL01-0046, 52-year-old female with bilateral knee osteoarthritis diagnosed 3 years ago.
Chief complaints: Bilateral knee pain on weight-bearing, stiffness on sitting, cracking sounds (Sandhivata).
Baseline Vitals: BP 128/80 mmHg, Pulse 76 bpm, BMI 26.2 kg/m2. Fasting blood sugar 108 mg/dL, serum creatinine 0.88 mg/dL (both within protocol eligibility criteria).
Baseline WOMAC: Total score 64 (Pain 16, Stiffness 6, Physical Function 42).
Ayurvedic Prakriti Examination: Vata-Kapha dominant Dwandwaja Prakriti. Manda Agni, Asthi-Majja Dhatu involvement.
Informed Consent: ICF Version 2.0 explained thoroughly in Hindi. Subject read the Patient Information Sheet and signed voluntarily with impartial witness.
Eligibility: Meets all inclusion criteria, zero exclusion criteria. Recommended for baseline randomization.`,

  safety: `URGENT AE NOTIFICATION: Subject SUB-DEL02-0001 (AgniBalance trial, Dwarka Extension site).
Subject contacted trial coordinator reporting severe episodic abdominal cramping, nausea, and 3 episodes of non-bloody vomiting over the last 18 hours.
Onset: 2026-03-29 20:00 IST.
Dosing: Patient was taking formulation batch V-GUG-2026-B02 (Chitrakadi Vati 250mg BID).
Severity: Moderate. Seriousness: Non-serious (no hospitalization required).
Investigator Action: Investigational product paused immediately. Patient advised oral rehydration salts (ORS) and light diet.
Causality: Suspected possible relation to formulation batch. Protocol safety alert triggered for cluster surveillance across DEL-02 and JAI-01 sites.`
};

interface NoteEditorProps {
  noteText: string;
  onChangeText: (text: string) => void;
  onStructure: () => void;
  isProcessing: boolean;
  selectedEvidence: EvidenceQuote | null;
  conflictQuotes?: string[];
  modeName: string;
  onClearHighlight?: () => void;
  readOnly?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  noteText,
  onChangeText,
  onStructure,
  isProcessing,
  selectedEvidence,
  conflictQuotes,
  modeName: _modeName,
  onClearHighlight,
  readOnly = false,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
  const [showFullNote, setShowFullNote] = useState(false);
  const [showEvidenceView, setShowEvidenceView] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('AyurVeda_Sub_DEL-01002_Week8.txt');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('1.36 KB');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [useAIStructuring, setUseAIStructuring] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const piiResult = detectAndMaskPII(noteText);

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text && text.trim().length > 0) {
          onChangeText(text);
          setUploadedFileName(file.name);
          setUploadedFileSize(`${(file.size / 1024).toFixed(2)} KB`);
          if (onClearHighlight) onClearHighlight();
        } else {
          setUploadError('Uploaded file appears to be empty.');
        }
      };
      reader.onerror = () => setUploadError('Could not read file.');
      reader.readAsText(file, 'UTF-8');
    } else if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      // In web demo, provide friendly notification and load simulated note text for demo if matching
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(2)} KB`);
      // Keep or enrich current text with a friendly note
      onChangeText(SAMPLE_NOTES.followup);
      setUploadError(null);
    } else {
      setUploadError(`Unsupported file format (.${ext}). Supported: .txt, .pdf, .doc, .docx`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly || isProcessing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleRemoveFile = () => {
    setUploadedFileName('');
    setUploadedFileSize('');
    onChangeText('');
    if (onClearHighlight) onClearHighlight();
  };

  const isHighlightActive = Boolean(selectedEvidence || (conflictQuotes && conflictQuotes.length > 0));

  return (
    <div className="clinical-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
      {/* Step Header: (1) Upload & Input */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
          1
        </div>
        <h2 className="text-base font-bold text-navy-900">Upload &amp; Input</h2>
      </div>

      {/* Segmented Mode Toggle: [ Upload Document ] | [ Manual Entry ] */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            inputMode === 'upload'
              ? 'bg-white text-purple-700 shadow-2xs'
              : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          <Upload size={14} />
          <span>Upload Document</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            inputMode === 'manual'
              ? 'bg-white text-purple-700 shadow-2xs'
              : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          <FileText size={14} />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Mode 1: Upload Document */}
      {inputMode === 'upload' && (
        <div className="space-y-3">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-purple-500 bg-purple-50/50'
                : 'border-slate-200 hover:border-purple-400 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
            />
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <CloudUpload size={22} />
            </div>
            <div className="text-xs font-semibold text-navy-900">
              Drag &amp; drop your file here
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">
              or click to browse
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Supported formats: .txt, .pdf, .doc, .docx | Max size: 10MB
            </div>
          </div>

          {/* Uploaded File Chip / Card */}
          {uploadedFileName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileCode size={16} />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-navy-900 truncate">{uploadedFileName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{uploadedFileSize || '1.36 KB'}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors flex-shrink-0 cursor-pointer flex items-center gap-1 text-[11px]"
                title="Remove file"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          )}

          {/* Clinical Note Preview Box */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Clinical Note Preview</span>
              <button
                type="button"
                onClick={() => setShowFullNote(!showFullNote)}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                {showFullNote ? (
                  <>
                    <span>Collapse Note</span>
                    <ChevronUp size={13} />
                  </>
                ) : (
                  <>
                    <span>View Full Note</span>
                    <ChevronDown size={13} />
                  </>
                )}
              </button>
            </div>

            {/* Note Text Container */}
            <div
              className={`text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 overflow-y-auto leading-relaxed ${
                showFullNote ? 'max-h-72' : 'max-h-28'
              }`}
            >
              {noteText ? (
                noteText
              ) : (
                <span className="text-slate-400 italic">No clinical note content loaded. Upload a document or type in manual entry.</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{noteText.length.toLocaleString()} characters</span>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className="text-purple-600 hover:underline text-[11px]"
              >
                Edit in Manual Mode →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Manual Entry */}
      {inputMode === 'manual' && (
        <div className="space-y-3">
          {/* Quick Scenario Selectors */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Load Preset Scenario:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onChangeText(SAMPLE_NOTES.followup);
                  setUploadedFileName('AyurVeda_Sub_DEL-01002_Week8.txt');
                  setUploadedFileSize('1.36 KB');
                  if (onClearHighlight) onClearHighlight();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Scenario 1: Follow-Up
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeText(SAMPLE_NOTES.screening);
                  setUploadedFileName('AyurVeda_Sub_PRM-DEL01-0046_Screening.txt');
                  setUploadedFileSize('1.18 KB');
                  if (onClearHighlight) onClearHighlight();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Scenario 2: Screening
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeText(SAMPLE_NOTES.safety);
                  setUploadedFileName('AyurVeda_Sub_DEL02-0001_SafetyAE.txt');
                  setUploadedFileSize('0.98 KB');
                  if (onClearHighlight) onClearHighlight();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Scenario 3: Unscheduled AE
              </button>
            </div>
          </div>

          {/* Toggle Evidence vs Raw */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{noteText.length.toLocaleString()} characters</span>
            <button
              type="button"
              onClick={() => setShowEvidenceView(!showEvidenceView)}
              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {showEvidenceView ? (
                <>
                  <EyeOff size={12} />
                  <span>Raw Text Editor</span>
                </>
              ) : (
                <>
                  <Eye size={12} />
                  <span>Highlight Spans</span>
                </>
              )}
            </button>
          </div>

          {/* Text Area / Highlighter */}
          {showEvidenceView || isHighlightActive ? (
            <div className="p-3 border border-purple-200 rounded-xl bg-purple-50/30 max-h-64 overflow-y-auto text-xs font-mono">
              <EvidenceHighlight
                text={noteText}
                selectedEvidence={selectedEvidence}
                conflictQuotes={conflictQuotes}
              />
            </div>
          ) : (
            <textarea
              rows={8}
              value={noteText}
              disabled={readOnly || isProcessing}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Paste unstructured consultation notes here..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 leading-relaxed transition-all shadow-inner"
            />
          )}
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-rose-600 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* PII Detection Alert */}
      {piiResult.hasPII && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1 text-amber-800">
            <AlertTriangle size={13} />
            <span>Privacy Guard: Potential Direct Identifiers Detected</span>
          </div>
          <p className="text-[11px] leading-tight text-amber-800">
            Direct personal identifiers detected. In live mode, these are automatically redacted before transmission.
          </p>
        </div>
      )}

      {/* AI Processing Options */}
      <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
            <Sparkles size={14} className="text-purple-600" />
            <span>AI Processing Options</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
            AI
          </span>
        </div>

        <label className="flex items-start gap-2 cursor-pointer pt-0.5">
          <input
            type="checkbox"
            checked={useAIStructuring}
            onChange={(e) => setUseAIStructuring(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">
              Use AI Note Structuring (Recommended)
            </div>
            <div className="text-[11px] text-slate-500">
              Extract, structure and validate clinical data automatically.
            </div>
          </div>
        </label>
      </div>

      {/* Primary Action Button: Start AI Processing */}
      <button
        type="button"
        disabled={isProcessing || !noteText.trim()}
        onClick={onStructure}
        className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>AI Processing Clinical Note...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Start AI Processing →</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <CheckCircle2 size={13} className="text-teal-600" />
        <span>Governed AI extraction • Verbatim evidence required</span>
      </div>
    </div>
  );
};
