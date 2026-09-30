import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, CheckCircle2, Clock, AlertTriangle, FileText,
  Calendar, Building2, UploadCloud, Search, CheckSquare
} from 'lucide-react';
import { MOCK_MONITOR_DASHBOARD } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function MonitorDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [reportModal, setReportModal] = useState<any>(null);
  const [visits, setVisits] = useState(MOCK_MONITOR_DASHBOARD.monitoring_visits);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleCompleteVisit = (id: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: 'COMPLETED', actual_date: new Date().toISOString().split('T')[0], sdv_percentage: 94.0 }
          : v
      )
    );
    setSelectedVisit(null);
    setReportModal(null);
    showToast('✓ Monitoring Visit Report (MVR) generated & signed');
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
          <h1 className="text-2xl font-bold text-navy-900">Clinical Research Associate (CRA) Workspace</h1>
          <p className="text-slate-500 text-sm mt-0.5">Site oversight, Source Data Verification (SDV), and regulatory compliance audits</p>
        </div>
        <button
          onClick={() => showToast('Opening SDV Verification batch run...')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2 self-start"
        >
          <CheckSquare size={16} /> Batch SDV Verification
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Routine Visits</span>
            <Eye size={18} className="text-clinical-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2">3</div>
          <p className="text-xs text-slate-400 mt-1">Across 3 active trial sites</p>
        </div>

        <div className="clinical-card p-4 border-l-4 border-l-maroon-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Overdue Site Visit</span>
            <AlertTriangle size={18} className="text-maroon-600" />
          </div>
          <div className="text-2xl font-bold text-maroon-700 mt-2">1 Site</div>
          <p className="text-xs text-maroon-600 font-medium mt-1">DEL-02 overdue by 9 days</p>
        </div>

        <div className="clinical-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg SDV Progress</span>
            <CheckCircle2 size={18} className="text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-600 mt-2">87.5%</div>
          <p className="text-xs text-slate-400 mt-1">Target: 100% critical data</p>
        </div>

        <div className="clinical-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Open Findings</span>
            <Clock size={18} className="text-ochre-600" />
          </div>
          <div className="text-2xl font-bold text-ochre-700 mt-2">1 Finding</div>
          <p className="text-xs text-slate-400 mt-1">Requires site CAPA response</p>
        </div>
      </div>

      {/* Monitoring Visits Table */}
      <div className="clinical-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-900">Site Monitoring Visits Worklist</h2>
          <span className="text-xs text-slate-400">ICH-GCP E6(R2) Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Visit ID</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Planned Date</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Actual Date</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">SDV Verified</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Findings</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-navy-800">{v.visit_id}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{v.visit_type}</td>
                  <td className="py-3 px-3 text-slate-600">{formatDate(v.planned_date)}</td>
                  <td className="py-3 px-3 text-slate-600">{v.actual_date ? formatDate(v.actual_date) : '—'}</td>
                  <td className="py-3 px-3">
                    {v.sdv_percentage !== null ? (
                      <span className="font-bold text-teal-600">{v.sdv_percentage}%</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {v.open_findings_count > 0 ? (
                      <span className="badge-medium">{v.open_findings_count} Open</span>
                    ) : (
                      <span className="badge-low">0 Findings</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={v.status === 'COMPLETED' ? 'badge-low' : v.status === 'OVERDUE' ? 'badge-high' : 'badge-info'}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {v.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => setReportModal(v)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-clinical-600 text-white hover:bg-clinical-700 transition-colors"
                      >
                        Conduct Visit
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast('Opening signed Monitoring Visit Report (MVR)...')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View MVR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conduct Visit Modal */}
      {reportModal && (
        <Modal
          title={`Conduct Monitoring Visit: ${reportModal.visit_id}`}
          onClose={() => setReportModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteVisit(reportModal.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Sign & Finalize MVR
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Site: <strong className="text-navy-900">{reportModal.visit_id.includes('DEL02') ? 'AIIA Extension, Dwarka' : 'AIIA Main Campus'}</strong></div>
              <div>Scope: Protocol Conformance, IP Accounting, Informed Consent Verification</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Source Data Verification (SDV) Status</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded">
                  <input type="checkbox" defaultChecked /> 100% Informed Consent verified
                </label>
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded">
                  <input type="checkbox" defaultChecked /> Primary Endpoint verified
                </label>
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded">
                  <input type="checkbox" defaultChecked /> Adverse Events reconciled
                </label>
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded">
                  <input type="checkbox" defaultChecked /> Drug accountability reconciled
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Monitor Summary & Action Items</label>
              <textarea
                rows={3}
                defaultValue="Source data verified against medical records. All trial participant consent forms verified. Site facilities and drug storage temperature logs within acceptable parameters."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
