import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  Send,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  FileText,
  BarChart3,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import type { UserRole } from '@/types';
import { NoteEditor, SAMPLE_NOTES } from './components/NoteEditor';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { FieldReviewTable } from './components/FieldReviewTable';
import { SdtmPreview } from './components/SdtmPreview';
import { AuditPanel } from './components/AuditPanel';
import { ReauthModal } from './components/ReauthModal';
import { useDraft } from './hooks/useDraft';
import { getLLMProvider } from '@/lib/assist/provider';

export default function AINoteStructuringPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) || 'STUDY_COORDINATOR';
  const provider = getLLMProvider();

  const [noteText, setNoteText] = useState(SAMPLE_NOTES.followup);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReauthOpen, setIsReauthOpen] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    draft,
    auditEntries,
    isProcessing,
    selectedEvidence,
    setSelectedEvidence,
    conflictQuotes,
    setConflictQuotes,
    activeTab,
    setActiveTab,
    unresolvedCount,
    structureNote,
    updateField,
    confirmNotReported,
    submitForReview,
    approveDraft,
    tamperAuditEntry,
  } = useDraft();

  // Clear toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Role permissions
  const isRegulator = role === 'REGULATOR';
  const isReadOnlyRole = role === 'MONITOR' || role === 'LEADERSHIP' || role === 'ADMIN';

  const canSubmit =
    !isReadOnlyRole &&
    (role === 'STUDY_COORDINATOR' ||
      role === 'PRINCIPAL_INVESTIGATOR' ||
      role === 'PHARMACOVIGILANCE_OFFICER');

  const canApprove =
    role === 'PRINCIPAL_INVESTIGATOR' || role === 'PHARMACOVIGILANCE_OFFICER';

  // 1. Regulatory Restriction
  if (isRegulator) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 clinical-card text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-navy-900">Access Restricted for Regulatory Authority</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Regulatory users have read-only audit inspection rights over locked and submitted clinical trials.
          Direct drafting, structuring, and preliminary review workspaces are restricted to institutional site staff.
        </p>
        <button
          onClick={() => navigate('/studies')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
        >
          Return to Studies Console →
        </button>
      </div>
    );
  }

  // Handle Structure Note
  const handleStructure = async () => {
    setActiveTab('processing');
    const d = await structureNote(noteText, {
      fullName: user?.full_name || 'Coordinator Staff',
      role,
    });
    if (d) {
      showToast('✓ AI Note successfully parsed into governed draft fields');
    }
  };

  // Separation of duties condition
  const isSubmitter = Boolean(
    draft?.submittedBy?.id && user?.id && draft.submittedBy.id === user.id
  );

  // Derive metadata values from draft or note text
  const subjectId =
    draft?.groups['Subject & Visit']?.find((f) => f.key === 'subject_id')?.value ||
    (noteText.includes('SUB-DEL01-0002')
      ? 'SUB-DEL-01002'
      : noteText.includes('PRM-DEL01-0046')
      ? 'PRM-DEL01-0046'
      : noteText.includes('SUB-DEL02-0001')
      ? 'SUB-DEL02-0001'
      : 'SUB-DEL-01002');

  const studyName =
    draft?.groups['Subject & Visit']?.find((f) => f.key === 'study_id')?.value ||
    (noteText.includes('AgniBalance') ? 'AgniBalance trial' : 'AyurVeda OA-2026');

  const visitName =
    draft?.groups['Subject & Visit']?.find((f) => f.key === 'visit_id')?.value ||
    (noteText.includes('Screening') ? 'Screening' : 'Week 8');

  const draftState = draft?.state || 'Draft';

  // Stepper tabs definition
  const stepperTabs: Array<{ id: 'processing' | 'results' | 'review' | 'approval'; label: string; icon: React.ReactNode }> = [
    { id: 'processing', label: 'Processing', icon: <Sparkles size={14} /> },
    { id: 'results', label: 'Results', icon: <BarChart3 size={14} /> },
    { id: 'review', label: 'Review', icon: <Search size={14} /> },
    { id: 'approval', label: 'Approval', icon: <Lock size={14} /> },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Toast Notification with aria-live */}
      <div aria-live="polite" aria-atomic="true" className="fixed top-4 right-4 z-50">
        {toastMessage && (
          <div className="bg-teal-800 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-teal-600 animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Mandatory Persistent Banner: Synthetic Demo Data */}
      <div
        role="region"
        aria-label="Synthetic Demo Data Disclaimer"
        className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs shadow-2xs"
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle size={15} className="text-amber-700 flex-shrink-0" />
          <span>
            <strong>Synthetic demo data. Not for real participants.</strong> Governed AI drafting — human approval required before submission.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Demo Sandbox
        </span>
      </div>

      {/* Top Header & Horizontal Stepper Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Left: Back Link & Page Title */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/visits')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Subject List</span>
          </button>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">AI Note Structuring</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload clinical notes and let AI extract, structure and validate the data.
          </p>
        </div>

        {/* Right: Stepper Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          {stepperTabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {idx > 0 && <div className="w-4 h-px bg-slate-300 mx-0.5" />}
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-navy-900'
                  }`}
                >
                  <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Horizontal Metadata Summary Card */}
      <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subject ID</div>
            <div className="font-mono font-bold text-navy-900 text-sm">{subjectId}</div>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Study</div>
            <div className="font-semibold text-slate-800">{studyName}</div>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Visit</div>
            <div className="font-semibold text-slate-800">{visitName}</div>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              draftState === 'Approved'
                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                : draftState === 'InReview'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-purple-100 text-purple-800 border border-purple-300'
            }`}
          >
            {draftState === 'Approved' ? (
              <FileCheck size={13} />
            ) : draftState === 'InReview' ? (
              <Clock size={13} />
            ) : (
              <Sparkles size={13} />
            )}
            <span>{draftState}</span>
          </span>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Step 1 (Upload & Input / Note Editor) */}
        <div>
          <NoteEditor
            noteText={noteText}
            onChangeText={setNoteText}
            onStructure={handleStructure}
            isProcessing={isProcessing}
            selectedEvidence={selectedEvidence}
            conflictQuotes={conflictQuotes}
            modeName={provider.name}
            onClearHighlight={() => {
              setSelectedEvidence(null);
              setConflictQuotes([]);
              setSelectedFieldKey(null);
            }}
            readOnly={draft?.state === 'Approved'}
          />
        </div>

        {/* Right Column: Workflow Step Tabs (Processing | Results | Review | Approval) */}
        <div className="space-y-4">
          {/* TAB 1: PROCESSING */}
          {activeTab === 'processing' && (
            <ProcessingPipeline
              isProcessing={isProcessing}
              draft={draft}
              onProceedToReview={() => setActiveTab('review')}
            />
          )}

          {/* TAB 2: RESULTS (SDTM-style draft preview) */}
          {activeTab === 'results' && (
            <div className="space-y-4 animate-fade-in">
              {!draft ? (
                <div className="clinical-card p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <BarChart3 size={24} className="text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-navy-900">No Structured Results Yet</div>
                  <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Click &ldquo;Start AI Processing&rdquo; on the left to extract clinical entities and generate SDTM datasets.
                  </div>
                </div>
              ) : (
                <SdtmPreview draft={draft} onToast={showToast} />
              )}
            </div>
          )}

          {/* TAB 3: REVIEW (Field review table & inline edits) */}
          {activeTab === 'review' && (
            <div className="space-y-4 animate-fade-in">
              {!draft ? (
                <div className="clinical-card p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <Search size={24} className="text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-navy-900">No Extracted Data to Review</div>
                  <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Run AI processing on the note first to review and verify verbatim evidence.
                  </div>
                </div>
              ) : (
                <>
                  <FieldReviewTable
                    draft={draft}
                    userRole={role}
                    onUpdateField={(group, key, newValue, reason) => {
                      updateField(group, key, newValue, reason, {
                        fullName: user?.full_name || 'Staff User',
                        role,
                      });
                      showToast(`✓ Field '${key}' updated`);
                    }}
                    onConfirmNotReported={(group, key) => {
                      confirmNotReported(group, key, {
                        fullName: user?.full_name || 'Staff User',
                        role,
                      });
                      showToast(`✓ Field '${key}' confirmed as Not Reported`);
                    }}
                    onSelectField={(ev, conflicts) => {
                      setSelectedEvidence(ev);
                      if (conflicts) setConflictQuotes(conflicts);
                    }}
                    selectedKey={selectedFieldKey}
                    readOnly={draft.state === 'Approved'}
                  />

                  {/* Submission Gating Card */}
                  {draft.state === 'Draft' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-900">Submit for Clinical Investigator Review</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {unresolvedCount > 0 ? `${unresolvedCount} Missing/Uncertain fields` : 'All fields ready'}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={unresolvedCount > 0 || !canSubmit}
                        onClick={() => {
                          submitForReview({
                            id: user?.id || 'usr-1',
                            fullName: user?.full_name || 'Staff User',
                            role,
                          });
                          setActiveTab('approval');
                          showToast('✓ Draft submitted for clinical investigator review');
                        }}
                        title={
                          isReadOnlyRole
                            ? 'Read-only access: MONITOR, LEADERSHIP, and ADMIN cannot submit drafts.'
                            : unresolvedCount > 0
                            ? `Cannot submit: ${unresolvedCount} field(s) require review or 'Not reported' confirmation.`
                            : 'Submit draft for clinical investigator review'
                        }
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send size={14} />
                        <span>Submit for Review{unresolvedCount > 0 ? ` (${unresolvedCount} to resolve)` : ' ✓'}</span>
                      </button>

                      {unresolvedCount > 0 && (
                        <div className="text-[10px] text-amber-700 text-center flex items-center justify-center gap-1">
                          <HelpCircle size={11} />
                          <span>Resolve any Missing or Uncertain fields above before submitting.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {draft.state !== 'Draft' && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-teal-600" />
                        <span>Draft status is <strong>{draft.state}</strong>. Proceed to the Approval tab.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('approval')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Go to Approval →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: APPROVAL (Electronic signature & immutable audit trail) */}
          {activeTab === 'approval' && (
            <div className="space-y-4 animate-fade-in">
              {!draft ? (
                <div className="clinical-card p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <Lock size={24} className="text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-navy-900">Awaiting Clinical Draft</div>
                  <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Draft must be extracted, reviewed, and submitted before electronic signature approval.
                  </div>
                </div>
              ) : (
                <>
                  {/* Approval Actions Gating Bar */}
                  <div className="clinical-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-900 text-sm">Formal Approval &amp; Electronic Signature</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Progress: {draft.state === 'Draft' ? 'Step 1: Drafting' : draft.state === 'InReview' ? 'Step 2: Formal Review' : 'Step 3: Approved'}
                      </span>
                    </div>

                    {/* If Draft: Notice to submit first */}
                    {draft.state === 'Draft' && (
                      <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs space-y-2 text-purple-950">
                        <div className="font-semibold text-purple-900 flex items-center gap-1.5">
                          <FileText size={14} />
                          <span>Draft is currently in preparation</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Please review the extracted values under the <strong>Review</strong> tab and click &ldquo;Submit for Review&rdquo; to unlock investigator signature approval.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('review')}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Go to Field Review →
                        </button>
                      </div>
                    )}

                    {/* If InReview: Authorised Approval Button */}
                    {draft.state === 'InReview' && (
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div>
                            Draft submitted by <strong className="text-navy-900">{draft.submittedBy?.name}</strong> (
                            {draft.submittedBy?.role}) at {draft.submittedBy?.timestamp?.substring(0, 16)}.
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Current logged-in user: <strong>{user?.full_name}</strong> ({role})
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!canApprove || isSubmitter}
                          onClick={() => setIsReauthOpen(true)}
                          title={
                            !canApprove
                              ? 'Approval requires PRINCIPAL_INVESTIGATOR or PHARMACOVIGILANCE_OFFICER role.'
                              : isSubmitter
                              ? 'Separation of duties: Approver cannot be the same person who submitted.'
                              : 'Sign and authorize this structured clinical draft'
                          }
                          className="w-full py-3 px-4 bg-terracotta-600 hover:bg-terracotta-700 active:bg-terracotta-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock size={15} />
                          <span>Authorise Electronic Signature &amp; Approval</span>
                        </button>

                        {isSubmitter && (
                          <div className="text-[11px] text-maroon-700 text-center font-medium bg-maroon-50 p-2.5 rounded-lg border border-maroon-200">
                            Separation of Duties: Submitter ({draft.submittedBy?.name}) cannot approve their own submission. An independent investigator must log in to approve.
                          </div>
                        )}
                      </div>
                    )}

                    {/* If Approved: Routing Destinations */}
                    {draft.state === 'Approved' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck size={18} className="text-teal-600" />
                            <span>
                              Approved by <strong>{draft.approvedBy?.name}</strong> ({draft.approvedBy?.role})
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-teal-700 font-bold uppercase">Locked / Read-Only</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              showToast('✓ Approved draft routed to Visits and eCRF');
                              navigate('/visits', { state: { approvedDraft: draft } });
                            }}
                            className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Send approved draft to Visits and eCRF</span>
                            <ArrowRight size={13} />
                          </button>

                          {draft.aeEvents.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                showToast('✓ AE draft routed to Safety Console (pending triage)');
                                navigate('/safety', { state: { approvedAEDraft: draft } });
                              }}
                              className="w-full py-2.5 px-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>File AE draft to Safety console</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audit Trail Panel */}
                  <AuditPanel
                    entries={auditEntries}
                    onTamperForTest={tamperAuditEntry}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Re-Authentication Modal */}
      <ReauthModal
        isOpen={isReauthOpen}
        onClose={() => setIsReauthOpen(false)}
        onApprove={() => {
          approveDraft({
            id: user?.id || 'pi-1',
            fullName: user?.full_name || 'Principal Investigator',
            role,
          });
          setIsReauthOpen(false);
          showToast('✓ Draft formally approved and electronically signed with immutable audit record');
        }}
        approverName={user?.full_name || 'Principal Investigator'}
        approverRole={role}
        approverId={user?.id || 'pi-1'}
        submitterId={draft?.submittedBy?.id}
        submitterName={draft?.submittedBy?.name}
      />
    </div>
  );
}
