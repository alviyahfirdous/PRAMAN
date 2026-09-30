import React, { useState } from 'react';
import {
  Shield, AlertTriangle, Clock, CheckCircle2, FileText,
  Plus, Search, ArrowRight, Eye, AlertCircle
} from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuthStore } from '@/lib/authStore';
import type { UserRole } from '@/types';

export default function SafetyPage() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState('');

  const { user } = useAuthStore();
  const role = user?.role as UserRole;
  const can = (roles: UserRole[]) => roles.includes(role);

  const [cases, setCases] = useState([
    { id: 'SAE-2026-041', category: 'SAE', term: 'Severe Hepatotoxicity (ALT/AST > 5x ULN)', subject: 'SUB-DEL01-0001', study: 'AyurVeda OA-2026', site: 'DEL-01', seriousness: 'HOSPITALISATION', status: 'MEDICAL_REVIEW', hoursRemaining: 3, severity: 'SEVERE', causality: 'PROBABLE' },
    { id: 'AE-2026-101', category: 'AE', term: 'Severe abdominal pain and recurrent vomiting', subject: 'SUB-DEL02-0001', study: 'AgniBalance', site: 'DEL-02', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hoursRemaining: 72, severity: 'MODERATE', causality: 'POSSIBLE' },
    { id: 'AE-2026-102', category: 'AE', term: 'Nausea, abdominal cramps, loose stools', subject: 'SUB-DEL02-0002', study: 'AgniBalance', site: 'DEL-02', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hoursRemaining: 120, severity: 'MODERATE', causality: 'POSSIBLE' },
    { id: 'AE-2026-103', category: 'AE', term: 'Severe epigastric pain and nausea', subject: 'SUB-JAI01-0001', study: 'AyurVeda OA-2026', site: 'JAI-01', seriousness: 'NOT_SERIOUS', status: 'INVESTIGATION', hoursRemaining: 192, severity: 'MODERATE', causality: 'POSSIBLE' },
    { id: 'AE-2026-104', category: 'AE', term: 'Generalized pruritus and mild urticaria', subject: 'SUB-DEL01-0004', study: 'AyurVeda OA-2026', site: 'DEL-01', seriousness: 'NOT_SERIOUS', status: 'RESOLVED', hoursRemaining: 0, severity: 'MILD', causality: 'UNLIKELY' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleResolveCase = (id: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'EXPEDITED_REPORT_SUBMITTED', hoursRemaining: 0 } : c
      )
    );
    setSelectedCase(null);
    showToast(`✓ Expedited CDSCO Safety Report transmitted for ${id}`);
  };

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSev = filterSeverity === 'ALL' || c.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Pharmacovigilance & Safety Surveillance</h1>
          <p className="text-slate-500 text-sm mt-0.5">Adverse event monitoring, CDSCO 24-hour regulatory compliance, and signal clustering</p>
        </div>
        {can(['PHARMACOVIGILANCE_OFFICER', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'ADMIN']) && (
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors flex items-center gap-2 self-start"
          >
            <Plus size={16} /> Report Adverse Event (AE / SAE)
          </button>
        )}
      </div>

      {/* Regulatory 24-Hour Clock Alert */}
      <div className="bg-maroon-50 border border-maroon-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
            <Clock size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-high">URGENT REGULATORY DEADLINE</span>
              <span className="font-mono text-xs font-bold text-maroon-900">SAE-2026-041</span>
            </div>
            <h4 className="text-sm font-bold text-maroon-900 mt-1">
              Severe Hepatotoxicity in SUB-DEL01-0001 (AyurVeda OA-2026)
            </h4>
            <p className="text-xs text-maroon-700 mt-0.5">
              CDSCO / Ethics Committee mandates initial reporting within 24 hours of investigator awareness. <strong>3 hours 14 mins remaining.</strong>
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedCase(cases[0])}
          className="px-4 py-2 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0 shadow"
        >
          Review & Expedite CDSCO Filing →
        </button>
      </div>

      {/* Safety Signal Detection Box */}
      <div className="clinical-card p-5 border-l-4 border-l-ochre-500">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-ochre-100 text-ochre-800">
                STATISTICAL SIGNAL DETECTED
              </span>
              <span className="text-xs text-slate-400">PRAMAN Algorithmic Clustering</span>
            </div>
            <h3 className="font-bold text-navy-900 text-sm mt-1">
              Gastrointestinal Disorder Clustering (DEL-02 Dwarka & JAI-01 Jaipur)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              4 adverse events (nausea, abdominal distension, vomiting) reported within 14 days across 2 independent trial sites, both receiving formulation batch <strong>V-GUG-2026-B02</strong>. Recommended action: Independent DSMB review.
            </p>
          </div>
          {can(['PHARMACOVIGILANCE_OFFICER', 'PRINCIPAL_INVESTIGATOR', 'LEADERSHIP', 'ADMIN']) && (
            <button
              onClick={() => showToast('Dispatched safety signal advisory to DSMB and PI')}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-50 flex-shrink-0"
            >
              Dispatch DSMB Advisory
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Case ID, Subject, MedDRA term..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Severity:</span>
          {['ALL', 'SEVERE', 'MODERATE', 'MILD'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterSeverity === sev
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Adverse Events Worklist Table */}
      <div className="clinical-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Case ID</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Subject & Site</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Reported Event (MedDRA PT)</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Seriousness</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Causality</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Reporting Clock</th>
              <th className="py-3 px-4 text-right font-semibold text-slate-500 text-xs uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-navy-800">
                  <span className={c.category === 'SAE' ? 'text-maroon-700' : 'text-slate-700'}>{c.id}</span>
                </td>
                <td className="py-3 px-4 text-xs">
                  <div className="font-mono font-semibold text-slate-800">{c.subject}</div>
                  <div className="text-slate-400">{c.site} ({c.study})</div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800 text-xs max-w-xs">{c.term}</td>
                <td className="py-3 px-4">
                  <span className={c.seriousness !== 'NOT_SERIOUS' ? 'badge-high' : 'badge-low'}>
                    {c.seriousness.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-slate-700">{c.causality}</td>
                <td className="py-3 px-4 text-xs">
                  {c.hoursRemaining > 0 ? (
                    <span className="font-mono font-bold text-maroon-700 flex items-center gap-1">
                      <Clock size={12} /> {c.hoursRemaining}h remaining
                    </span>
                  ) : (
                    <span className="text-teal-600 font-medium">Submitted ✓</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedCase(c)}
                    className="px-3 py-1 text-xs font-semibold rounded bg-navy-600 text-white hover:bg-navy-700"
                  >
                    Triage & Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Case Review Modal */}
      {selectedCase && (
        <Modal
          title={`Safety Triage & Regulatory Filing: ${selectedCase.id}`}
          onClose={() => setSelectedCase(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => handleResolveCase(selectedCase.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-maroon-700 text-white hover:bg-maroon-800"
              >
                Transmit CDSCO Regulatory Notice
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Event: <strong className="text-navy-900">{selectedCase.term}</strong></div>
              <div>Subject: <strong className="font-mono text-navy-900">{selectedCase.subject}</strong> • Site: <strong>{selectedCase.site}</strong></div>
              <div>Study: <strong>{selectedCase.study}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Causality Assessment (WHO-UMC)</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                  <option>Probable / Likely</option>
                  <option>Possible</option>
                  <option>Unlikely</option>
                  <option>Certain</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Seriousness Criteria</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                  <option>Results in Hospitalization</option>
                  <option>Life Threatening</option>
                  <option>Persistent Disability</option>
                  <option>Other Medically Significant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Medical Reviewer Assessment</label>
              <textarea
                rows={3}
                defaultValue="Patient presented with acute transaminase elevation. Investigational formulation discontinued immediately. Concomitant hepatotoxic medications ruled out. Supportive therapy initiated. Re-challenge contraindicated."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>

            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800">
              ✓ Automated CDSCO Form 44 / CIOMS-I format XML generated and validated for transmission.
            </div>
          </div>
        </Modal>
      )}

      {/* Report Adverse Event Modal */}
      {showReportModal && (
        <Modal
          title="Report New Adverse Event (AE / SAE)"
          onClose={() => setShowReportModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newId = `AE-2026-${cases.length + 105}`;
                  setCases((prev) => [
                    {
                      id: newId,
                      category: 'AE',
                      term: 'Mild transient headache post-dose',
                      subject: 'SUB-DEL01-0005',
                      study: 'AyurVeda OA-2026',
                      site: 'DEL-01',
                      seriousness: 'NOT_SERIOUS',
                      status: 'TRIAGE',
                      hoursRemaining: 120,
                      severity: 'MILD',
                      causality: 'POSSIBLE',
                    },
                    ...prev,
                  ]);
                  setShowReportModal(false);
                  showToast(`✓ Case ${newId} logged and entered into safety triage`);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta-600 text-white hover:bg-terracotta-700"
              >
                Submit Safety Report
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Pseudonym ID</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs">
                <option>SUB-DEL01-0005 (AyurVeda OA-2026)</option>
                <option>SUB-DEL01-0006 (AyurVeda OA-2026)</option>
                <option>SUB-DEL02-0002 (AgniBalance)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Adverse Event Verbatim Term</label>
              <input
                type="text"
                defaultValue="Mild transient frontal headache post-dose"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Onset Date & Time</label>
                <input
                  type="date"
                  defaultValue="2026-03-30"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Is Serious? (SAE)</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold">
                  <option>No (Non-serious Adverse Event)</option>
                  <option>Yes (Triggers 24-hour CDSCO countdown)</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
