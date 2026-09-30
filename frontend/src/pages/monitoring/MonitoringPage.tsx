import React, { useState } from 'react';
import {
  Eye, CheckCircle2, AlertTriangle, Clock, FileText,
  Building2, Search, ArrowRight, CheckSquare, Plus
} from 'lucide-react';
import Modal from '@/components/Modal';

export default function MonitoringPage() {
  const [toast, setToast] = useState('');
  const [capaModal, setCapaModal] = useState<any>(null);

  const [capas, setCapas] = useState([
    { id: 'CAPA-2026-001', site: 'DEL-02 Dwarka', finding: 'Routine monitoring visit overdue by 9 days due to CRA reallocation.', action: 'Interim CRA dispatched. Site visit scheduled for April 2, 2026.', status: 'IN_PROGRESS', owner: 'Karan Mehta (Lead CRA)', deadline: '2026-04-05' },
    { id: 'CAPA-2026-002', site: 'DEL-01 AIIA Main', finding: '1 subject enrolled with borderline fasting glucose (126 mg/dL vs 125 protocol limit).', action: 'Re-training of site screening coordinator completed. Protocol adherence log filed.', status: 'RESOLVED', owner: 'Dr. Arjun Sharma (PI)', deadline: '2026-03-20' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleResolveCapa = (id: string) => {
    setCapas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'RESOLVED' } : c))
    );
    setCapaModal(null);
    showToast(`✓ CAPA ${id} verified and marked as resolved`);
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
          <h1 className="text-2xl font-bold text-navy-900">Clinical Trial Monitoring & Site Oversight</h1>
          <p className="text-slate-500 text-sm mt-0.5">Risk-based monitoring (RBM), Source Data Verification, and CAPA resolution</p>
        </div>
        <button
          onClick={() => showToast('Initiating Risk-Based Monitoring algorithm scan...')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2 self-start"
        >
          <Eye size={16} /> Run Automated Risk Scan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Monitoring Visits YTD</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">18 Visits</div>
          <p className="text-xs text-slate-400 mt-1">Across 6 hospital sites</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">SDV Coverage Target</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">94.8%</div>
          <p className="text-xs text-teal-600 font-medium mt-1">Primary efficacy & safety 100%</p>
        </div>

        <div className="clinical-card p-4 border-l-4 border-l-maroon-500">
          <div className="text-xs text-slate-500 font-medium">Overdue Site Audits</div>
          <div className="text-2xl font-bold text-maroon-700 mt-1">1 Site</div>
          <p className="text-xs text-maroon-600 font-medium mt-1">Dwarka site overdue</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Active CAPA Plans</div>
          <div className="text-2xl font-bold text-ochre-700 mt-1">
            {capas.filter((c) => c.status === 'IN_PROGRESS').length} Pending
          </div>
          <p className="text-xs text-slate-400 mt-1">Action plans under execution</p>
        </div>
      </div>

      {/* SDV Metrics by Site */}
      <div className="clinical-card p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-4">Source Data Verification (SDV) Rate by Trial Site</h2>
        <div className="space-y-4">
          {[
            { site: 'DEL-01: AIIA Main Campus, New Delhi', sdv: 98, count: '38/38 Participants', status: 'Optimal' },
            { site: 'MUM-01: KEM Hospital, Mumbai', sdv: 96, count: '215/215 Participants', status: 'Optimal' },
            { site: 'PUN-01: Bharati Vidyapeeth, Pune', sdv: 94, count: '195/195 Participants', status: 'Optimal' },
            { site: 'JAI-01: National Institute of Ayurveda, Jaipur', sdv: 88, count: '22/25 Participants', status: 'Acceptable' },
            { site: 'DEL-02: AIIA Extension, Dwarka', sdv: 72, count: '14/19 Participants', status: 'Requires Attention' },
          ].map((item) => (
            <div key={item.site} className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>{item.site}</span>
                <span className="font-bold text-navy-800">{item.sdv}% SDV ({item.count})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${item.sdv >= 90 ? 'bg-teal-500' : item.sdv >= 80 ? 'bg-ochre-500' : 'bg-maroon-500'}`}
                  style={{ width: `${item.sdv}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPA Tracking */}
      <div className="clinical-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-900">Corrective & Preventive Actions (CAPA)</h2>
          <span className="text-xs text-slate-400">Quality Management System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">CAPA ID</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Site</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Audit Finding</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Remedial Action Plan</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Owner</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {capas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-navy-800">{c.id}</td>
                  <td className="py-3 px-3 text-slate-700 text-xs font-medium">{c.site}</td>
                  <td className="py-3 px-3 text-slate-800 text-xs max-w-xs">{c.finding}</td>
                  <td className="py-3 px-3 text-slate-600 text-xs max-w-xs">{c.action}</td>
                  <td className="py-3 px-3 text-slate-600 text-xs">{c.owner}</td>
                  <td className="py-3 px-3">
                    <span className={c.status === 'RESOLVED' ? 'badge-low' : 'badge-medium'}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {c.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => setCapaModal(c)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700"
                      >
                        Verify & Close
                      </button>
                    ) : (
                      <span className="text-xs text-teal-600 font-bold">Closed ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAPA Modal */}
      {capaModal && (
        <Modal
          title={`Verify & Close CAPA: ${capaModal.id}`}
          onClose={() => setCapaModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCapaModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveCapa(capaModal.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Close CAPA with Digital Signature
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Site: <strong>{capaModal.site}</strong></div>
              <div>Finding: <strong className="text-navy-900">{capaModal.finding}</strong></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">CRA Verification Assessment</label>
              <textarea
                rows={3}
                defaultValue="Interim site monitoring visit conducted on April 2. All source records audited. Backlog cleared and secondary CRA allocated to site."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
