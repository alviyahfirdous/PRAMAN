import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Search, Plus, CheckCircle2, Clock,
  AlertTriangle, FileText, Calendar, CheckSquare, Sparkles
} from 'lucide-react';
import Modal from '@/components/Modal';

export default function VisitsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'schedule' | 'queries'>('schedule');
  const [showCrfModal, setShowCrfModal] = useState<any>(null);
  const [resolveQueryModal, setResolveQueryModal] = useState<any>(null);
  const [toast, setToast] = useState('');

  const [visits, setVisits] = useState([
    { id: 'v1', subId: 'SUB-DEL01-0001', study: 'AyurVeda OA-2026', visit: 'Week 8 Clinical Review', date: '2026-03-28', status: 'COMPLETED', dqScore: 98, vitals: 'BP 124/80, HR 72, WOMAC 42' },
    { id: 'v2', subId: 'SUB-DEL01-0002', study: 'AyurVeda OA-2026', visit: 'Week 8 Clinical Review', date: '2026-03-30', status: 'COMPLETED', dqScore: 95, vitals: 'BP 130/84, HR 76, WOMAC 38' },
    { id: 'v3', subId: 'SUB-DEL01-0005', study: 'AyurVeda OA-2026', visit: 'Week 4 Assessment', date: '2026-04-01', status: 'SCHEDULED', dqScore: null, vitals: 'Pending visit' },
    { id: 'v4', subId: 'SUB-DEL02-0001', study: 'AgniBalance', visit: 'Week 4 Assessment', date: '2026-04-05', status: 'SCHEDULED', dqScore: null, vitals: 'Pending visit' },
    { id: 'v5', subId: 'SUB-DEL01-0003', study: 'AyurVeda OA-2026', visit: 'Week 8 Clinical Review', date: '2026-03-24', status: 'OVERDUE', dqScore: null, vitals: 'Patient delayed due to travel' },
  ]);

  const [queries, setQueries] = useState([
    { id: 'QRY-2026-012', subId: 'SUB-DEL01-0002', visit: 'Visit 2 (Week 4)', field: 'Serum Creatinine', queryText: 'Value 1.4 mg/dL flagged as out of normal baseline range (0.6 - 1.2). Clinically significant?', status: 'OPEN', raisedBy: 'Karan Mehta (CRA)' },
    { id: 'QRY-2026-013', subId: 'SUB-DEL02-0001', visit: 'Visit 1 (Baseline)', field: 'Concomitant Meds', queryText: 'Subject reported taking Metformin 500mg. Please record exact start date and indication.', status: 'OPEN', raisedBy: 'Data Management' },
    { id: 'QRY-2026-011', subId: 'SUB-JAI01-0001', visit: 'Visit 3 (Week 8)', field: 'Drug Accountability', queryText: 'Returned capsule count 14 does not match prescribed calculation of 12.', status: 'RESOLVED', raisedBy: 'Karan Mehta (CRA)' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSaveCRF = () => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === showCrfModal.id
          ? { ...v, status: 'COMPLETED', dqScore: 100, vitals: 'BP 122/78, HR 74, Score 32' }
          : v
      )
    );
    setShowCrfModal(null);
    showToast(`✓ eCRF submitted and verified for ${showCrfModal.subId}`);
  };

  const handleResolveQuery = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'RESOLVED' } : q))
    );
    setResolveQueryModal(null);
    showToast(`✓ Query ${id} resolved with audit log entry`);
  };

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
          <h1 className="text-2xl font-bold text-navy-900">Visits & Electronic Case Report Forms (eCRF)</h1>
          <p className="text-slate-500 text-sm mt-0.5">Clinical visit scheduling, real-time data capture, and discrepancy query resolution</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => navigate('/ai-structuring')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} /> AI Note Structuring
          </button>
          <button
            onClick={() => setShowCrfModal(visits[2])}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Enter eCRF Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Scheduled Visits This Week</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">12 Visits</div>
          <p className="text-xs text-slate-400 mt-1">Across 3 trial protocols</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Completed Visits</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">142 Visits</div>
          <p className="text-xs text-teal-600 font-medium mt-1">98.2% on-window completion</p>
        </div>

        <div className="clinical-card p-4 border-l-4 border-l-ochre-500">
          <div className="text-xs text-slate-500 font-medium">Open Data Queries</div>
          <div className="text-2xl font-bold text-ochre-700 mt-1">
            {queries.filter((q) => q.status === 'OPEN').length} Queries
          </div>
          <p className="text-xs text-slate-400 mt-1">Average resolution: 2.1 days</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Average Data Quality Score</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">96.4%</div>
          <p className="text-xs text-slate-400 mt-1">Zero critical GCP deviations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'schedule'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visit Schedule & CRF Status
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'queries'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Discrepancies & Queries
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-ochre-100 text-ochre-800">
              {queries.filter((q) => q.status === 'OPEN').length}
            </span>
          </button>
        </div>
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Subject ID</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Study</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Visit Milestone</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Target Date</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Data Captured</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-800">{v.subId}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 text-xs">{v.study}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium text-xs">{v.visit}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{v.date}</td>
                  <td className="py-3 px-4">
                    <span className={v.status === 'COMPLETED' ? 'badge-low' : v.status === 'OVERDUE' ? 'badge-high' : 'badge-info'}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{v.vitals}</td>
                  <td className="py-3 px-4 text-right">
                    {v.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => setShowCrfModal(v)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-clinical-600 text-white hover:bg-clinical-700"
                      >
                        Enter eCRF
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast('Opening completed eCRF form PDF...')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        View CRF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Query ID</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Subject</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Field</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Query Description</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Raised By</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queries.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-800">{q.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{q.subId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-xs">{q.field}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs max-w-sm">{q.queryText}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{q.raisedBy}</td>
                  <td className="py-3 px-4">
                    <span className={q.status === 'OPEN' ? 'badge-medium' : 'badge-low'}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {q.status === 'OPEN' ? (
                      <button
                        onClick={() => setResolveQueryModal(q)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-ochre-600 text-white hover:bg-ochre-700"
                      >
                        Respond & Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-teal-600 font-bold">Resolved ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enter eCRF Modal */}
      {showCrfModal && (
        <Modal
          title={`Electronic Case Report Form: ${showCrfModal.subId} - ${showCrfModal.visit}`}
          onClose={() => setShowCrfModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCrfModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCRF}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Save & Digitally Sign eCRF
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Subject: <strong className="font-mono text-navy-900">{showCrfModal.subId}</strong></div>
              <div>Visit: <strong>{showCrfModal.visit}</strong></div>
              <div className="text-teal-700 font-medium">✓ Re-Consent v2.0 verified for this subject.</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Systolic BP (mmHg)</label>
                <input type="number" defaultValue={124} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diastolic BP (mmHg)</label>
                <input type="number" defaultValue={80} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Heart Rate (bpm)</label>
                <input type="number" defaultValue={72} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">WOMAC Pain Score (0 - 100)</label>
                <input type="number" defaultValue={34} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Investigational Product Adherence</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs">
                <option>100% (All doses taken as prescribed)</option>
                <option>&gt;90% (Acceptable compliance)</option>
                <option>&lt;80% (Non-compliant, CAPA required)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" defaultChecked /> Any new Adverse Events reported since last visit? (If yes, triggers PV form)
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Query Modal */}
      {resolveQueryModal && (
        <Modal
          title={`Resolve Data Query: ${resolveQueryModal.id}`}
          onClose={() => setResolveQueryModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setResolveQueryModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveQuery(resolveQueryModal.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Submit Resolution
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-amber-50 rounded-lg text-xs">
              <div className="font-semibold text-amber-900">{resolveQueryModal.queryText}</div>
              <div className="text-amber-700 mt-1">Field: <strong>{resolveQueryModal.field}</strong> • Subject: <strong>{resolveQueryModal.subId}</strong></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Investigator / Coordinator Clarification</label>
              <textarea
                rows={3}
                defaultValue="Subject has documented history of mild baseline elevation. Repeat renal panel verified normal eGFR > 60 mL/min. PI assessed as not clinically significant for continuation."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
