import React, { useState } from 'react';
import {
  Users, Search, Plus, Filter, AlertCircle, CheckCircle2,
  FileCheck, Calendar, Shield, ArrowRight, Eye
} from 'lucide-react';
import Modal from '@/components/Modal';
import { formatDate } from '@/lib/utils';

export default function ParticipantsPage() {
  const [search, setSearch] = useState('');
  const [consentFilter, setConsentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reConsentModal, setReConsentModal] = useState<any>(null);
  const [viewModal, setViewModal] = useState<any>(null);
  const [toast, setToast] = useState('');

  const [participants, setParticipants] = useState([
    { id: 'p1', subId: 'SUB-DEL01-0001', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'RE_CONSENT_REQUIRED', consentVersion: 'v1.0 (Needs v2.0)', enrolledDate: '2026-01-15', nextVisit: '2026-04-10', visitName: 'Week 12 Follow-up' },
    { id: 'p2', subId: 'SUB-DEL01-0002', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'RE_CONSENT_REQUIRED', consentVersion: 'v1.0 (Needs v2.0)', enrolledDate: '2026-01-18', nextVisit: '2026-04-12', visitName: 'Week 12 Follow-up' },
    { id: 'p3', subId: 'SUB-DEL01-0003', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'RE_CONSENT_REQUIRED', consentVersion: 'v1.0 (Needs v2.0)', enrolledDate: '2026-01-20', nextVisit: '2026-04-15', visitName: 'Week 12 Follow-up' },
    { id: 'p4', subId: 'SUB-DEL01-0004', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'RE_CONSENT_REQUIRED', consentVersion: 'v1.0 (Needs v2.0)', enrolledDate: '2026-01-25', nextVisit: '2026-04-20', visitName: 'Week 12 Follow-up' },
    { id: 'p5', subId: 'SUB-DEL01-0005', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'OBTAINED', consentVersion: 'v2.0 (Verified)', enrolledDate: '2026-02-01', nextVisit: '2026-04-25', visitName: 'Week 8 Review' },
    { id: 'p6', subId: 'SUB-DEL01-0006', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'ACTIVE', consent: 'OBTAINED', consentVersion: 'v2.0 (Verified)', enrolledDate: '2026-02-05', nextVisit: '2026-04-28', visitName: 'Week 8 Review' },
    { id: 'p7', subId: 'SUB-DEL02-0001', study: 'AgniBalance', site: 'DEL-02 Dwarka', status: 'ACTIVE', consent: 'RE_CONSENT_REQUIRED', consentVersion: 'v1.0 (Needs v2.0)', enrolledDate: '2026-02-10', nextVisit: '2026-04-05', visitName: 'Week 4 Assessment' },
    { id: 'p8', subId: 'SUB-DEL02-0002', study: 'AgniBalance', site: 'DEL-02 Dwarka', status: 'ACTIVE', consent: 'OBTAINED', consentVersion: 'v2.0 (Verified)', enrolledDate: '2026-02-12', nextVisit: '2026-04-08', visitName: 'Week 4 Assessment' },
    { id: 'p9', subId: 'SUB-JAI01-0001', study: 'PramehaCare', site: 'JAI-01 NIA Jaipur', status: 'ACTIVE', consent: 'OBTAINED', consentVersion: 'v1.0 (Verified)', enrolledDate: '2025-11-20', nextVisit: '2026-04-18', visitName: 'Week 20 Review' },
    { id: 'p10', subId: 'SUB-MUM01-0001', study: 'PramehaCare', site: 'MUM-01 KEM Hospital', status: 'ACTIVE', consent: 'OBTAINED', consentVersion: 'v1.0 (Verified)', enrolledDate: '2025-10-14', nextVisit: '2026-04-22', visitName: 'Week 24 Final' },
    { id: 'p11', subId: 'SUB-DEL01-0045', study: 'AyurVeda OA-2026', site: 'DEL-01 AIIA Main', status: 'SCREENED', consent: 'NOT_OBTAINED', consentVersion: 'Pending Informed Consent', enrolledDate: '—', nextVisit: '2026-04-02', visitName: 'Consent & Baseline' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleRecordReConsent = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, consent: 'OBTAINED', consentVersion: 'v2.0 (Verified)' }
          : p
      )
    );
    setReConsentModal(null);
    showToast(`✓ Re-Consent recorded & verified for ${reConsentModal.subId}`);
  };

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.subId.toLowerCase().includes(search.toLowerCase()) ||
      p.study.toLowerCase().includes(search.toLowerCase()) ||
      p.site.toLowerCase().includes(search.toLowerCase());
    const matchesConsent = consentFilter === 'ALL' || p.consent === consentFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesConsent && matchesStatus;
  });

  const reConsentCount = participants.filter((p) => p.consent === 'RE_CONSENT_REQUIRED').length;

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
          <h1 className="text-2xl font-bold text-navy-900">Master Participant Registry</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pseudonymized subject records, e-consent versions, and clinical visit schedules</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2 self-start"
        >
          <Plus size={16} /> Register & Screen Participant
        </button>
      </div>

      {/* Re-consent Alert Banner */}
      {reConsentCount > 0 && (
        <div className="bg-terracotta-50 border border-terracotta-200 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600 flex-shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-terracotta-800">
                {reConsentCount} Active Participants Require Re-Consent
              </h4>
              <p className="text-xs text-terracotta-700 mt-0.5">
                Protocol amendment v2.0 approved by Ethics Committee. ICMR/GCP requires re-consent before next intervention dose.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConsentFilter('RE_CONSENT_REQUIRED')}
            className="px-3 py-1.5 bg-terracotta-600 text-white text-xs font-semibold rounded-lg hover:bg-terracotta-700 flex-shrink-0"
          >
            Filter Pending Re-Consent
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Subject ID (e.g. SUB-DEL01), study..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Consent:</span>
          {['ALL', 'OBTAINED', 'RE_CONSENT_REQUIRED', 'NOT_OBTAINED'].map((cf) => (
            <button
              key={cf}
              onClick={() => setConsentFilter(cf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                consentFilter === cf
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cf.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Table */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Pseudonym ID</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Study & Protocol</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Trial Site</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Consent Status</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Next Visit Due</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-800 flex items-center gap-2">
                    <Shield size={14} className="text-clinical-600" />
                    {p.subId}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 text-xs">{p.study}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{p.site}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.consent === 'RE_CONSENT_REQUIRED' ? (
                        <span className="badge-high flex items-center gap-1">
                          <AlertCircle size={11} /> Re-consent Due
                        </span>
                      ) : p.consent === 'OBTAINED' ? (
                        <span className="badge-low flex items-center gap-1">
                          <CheckCircle2 size={11} /> Obtained (v2.0)
                        </span>
                      ) : (
                        <span className="badge-medium">Pending</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-medium text-slate-700">{p.nextVisit}</div>
                    <div className="text-[11px] text-slate-400">{p.visitName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={p.status === 'ACTIVE' ? 'badge-low' : 'badge-info'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.consent === 'RE_CONSENT_REQUIRED' ? (
                        <button
                          onClick={() => setReConsentModal(p)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors"
                        >
                          Record Re-consent
                        </button>
                      ) : (
                        <button
                          onClick={() => setViewModal(p)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} /> View eCRF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-Consent Modal */}
      {reConsentModal && (
        <Modal
          title={`Record Verified Re-Consent: ${reConsentModal.subId}`}
          onClose={() => setReConsentModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReConsentModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordReConsent(reConsentModal.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Confirm Verified Re-Consent
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
              <div>Subject: <strong className="font-mono text-navy-900">{reConsentModal.subId}</strong></div>
              <div>Study: <strong>{reConsentModal.study}</strong></div>
              <div className="text-amber-800">Trigger: Protocol v2.0 updated safety information regarding GI adverse events.</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Informed Consent Form Version</label>
              <input
                type="text"
                disabled
                value="ICF_V2.0_ENGLISH_HINDI_MARATHI (Approved by IEC)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Re-Consent Administered By</label>
              <input
                type="text"
                defaultValue="Priya Nair (Study Coordinator)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" defaultChecked /> Patient was provided updated patient information sheet (PIS)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" defaultChecked /> Re-consent signed freely in presence of impartial witness
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" defaultChecked /> Physical copy archived in Site Master File (SMF)
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* View eCRF Modal */}
      {viewModal && (
        <Modal
          title={`Participant Dossier: ${viewModal.subId}`}
          onClose={() => setViewModal(null)}
          footer={
            <button
              onClick={() => setViewModal(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white"
            >
              Close Dossier
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>Pseudonym ID: <strong className="font-mono text-navy-900">{viewModal.subId}</strong></div>
              <div>Trial Site: <strong>{viewModal.site}</strong></div>
              <div>Enrolled Date: <strong>{viewModal.enrolledDate}</strong></div>
              <div>Consent Status: <strong className="text-teal-600">v2.0 Verified</strong></div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Completed Visits & Case Report Forms</h4>
              <div className="space-y-2">
                <div className="p-2.5 border border-slate-200 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">Visit 1: Screening & Baseline</div>
                    <div className="text-slate-400 text-[11px]">Vitals, WOMAC Baseline, Fasting Labs</div>
                  </div>
                  <span className="badge-low">Verified (SDV 100%)</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">Visit 2: Week 4 On-Treatment Review</div>
                    <div className="text-slate-400 text-[11px]">Drug Accountability, AE check, Vitals</div>
                  </div>
                  <span className="badge-low">Verified (SDV 100%)</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">Visit 3: Week 8 Evaluation</div>
                    <div className="text-slate-400 text-[11px]">WOMAC Pain score: 38 (improved from 62)</div>
                  </div>
                  <span className="badge-low">Submitted</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Participant Modal */}
      {showAddModal && (
        <Modal
          title="Register & Screen New Participant"
          onClose={() => setShowAddModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newId = `SUB-DEL01-00${participants.length + 1}`;
                  setParticipants((prev) => [
                    {
                      id: `p${prev.length + 1}`,
                      subId: newId,
                      study: 'AyurVeda OA-2026',
                      site: 'DEL-01 AIIA Main',
                      status: 'SCREENED',
                      consent: 'OBTAINED',
                      consentVersion: 'v2.0 (Verified)',
                      enrolledDate: new Date().toISOString().split('T')[0],
                      nextVisit: '2026-04-14',
                      visitName: 'Day 0 Baseline',
                    },
                    ...prev,
                  ]);
                  setShowAddModal(false);
                  showToast(`✓ Participant ${newId} registered and assigned to AyurVeda OA-2026`);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700"
              >
                Register & Generate ID
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs">
              <div className="font-semibold text-navy-800">Automated Pseudonym Generator</div>
              <p className="text-slate-500 mt-0.5">Under DPDP Act and HIPAA, personal identifiers are never stored. The system assigns a deterministic cryptographic subject code.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Study Protocol</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs">
                <option>AIIA-OA-2026-001 (AyurVeda OA-2026)</option>
                <option>AIIA-DM-2025-002 (PramehaCare)</option>
                <option>AIIA-GI-2026-003 (AgniBalance)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Site</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs">
                <option>DEL-01 - AIIA Main Campus</option>
                <option>DEL-02 - Dwarka Extension</option>
                <option>JAI-01 - NIA Jaipur</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Age (Years)</label>
                <input type="number" defaultValue={54} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Biological Sex</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs">
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" defaultChecked /> Informed Consent Form v2.0 signed and documented
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
