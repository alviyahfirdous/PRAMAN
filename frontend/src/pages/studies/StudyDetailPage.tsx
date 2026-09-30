import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Building2, Users, Shield, FileText, CheckCircle2,
  AlertTriangle, Calendar, Download, ExternalLink, Activity, Plus
} from 'lucide-react';
import { MOCK_STUDIES } from '@/lib/mockData';
import { getRiskBadgeClass, getEnrolmentPct, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import { useAuthStore } from '@/lib/authStore';
import type { UserRole } from '@/types';

export default function StudyDetailPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role as UserRole;
  const can = (roles: UserRole[]) => roles.includes(role);

  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'deviations' | 'regulatory'>('overview');
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  const [toast, setToast] = useState('');

  const study = MOCK_STUDIES.find((s) => s.id === studyId) || MOCK_STUDIES[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const SITES = [
    { code: 'DEL-01', name: 'AIIA Main Campus, New Delhi', pi: 'Dr. Arjun Sharma', target: 50, enrolled: 38, compliance: 92, status: 'ACTIVE' },
    { code: 'DEL-02', name: 'AIIA Extension, Dwarka', pi: 'Dr. Priya Roy', target: 50, enrolled: 19, compliance: 74, status: 'ACTIVE' },
    { code: 'JAI-01', name: 'National Institute of Ayurveda, Jaipur', pi: 'Dr. Rajesh Bhardwaj', target: 50, enrolled: 25, compliance: 86, status: 'ACTIVE' },
  ];

  const DEVIATIONS = [
    { id: 'DEV-2026-001', site: 'DEL-01', type: 'Visit Window', desc: 'Visit 3 conducted outside +/- 2 day allowable protocol window.', date: '2026-02-14', severity: 'MINOR', status: 'RESOLVED' },
    { id: 'DEV-2026-002', site: 'DEL-02', type: 'Eligibility Criteria', desc: 'Subject enrolled with fasting blood glucose borderline at 126 mg/dL (limit 125).', date: '2026-02-28', severity: 'MAJOR', status: 'CAPA_PENDING' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Back Button & Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/studies')}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-900 transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back to Studies
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {study.protocol_id}
              </span>
              <span className="badge-info">{study.phase.replace(/_/g, ' ')}</span>
              <span className={getRiskBadgeClass(study.risk_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}>
                {study.risk_level} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">CTRI: {study.ctri_number || 'CTRI/2026/01/000001'}</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-navy-900 leading-snug">{study.title}</h1>
            <p className="text-sm text-slate-500 mt-1">Therapeutic Area: <strong className="text-slate-700">{study.therapeutic_area}</strong> • Intervention: <strong className="text-slate-700">{study.intervention}</strong></p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {can(['STUDY_COORDINATOR', 'PRINCIPAL_INVESTIGATOR', 'ADMIN', 'MONITOR']) && (
              <button
                onClick={() => setShowDeviationModal(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle size={14} className="text-ochre-600" /> Log Deviation
              </button>
            )}
            {can(['LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'REGULATOR', 'ADMIN']) && (
              <button
                onClick={() => {
                  showToast('✓ CDISC SDTM Dataset Package exported (DM, AE, VS, DS)');
                  navigate('/exports');
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-1.5"
              >
                <Download size={14} /> Export CDISC SDTM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Recruitment Progress</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">
            {study.actual_enrolment} <span className="text-sm font-normal text-slate-500">/ {study.target_enrolment}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-clinical-600 h-2 rounded-full"
              style={{ width: `${getEnrolmentPct(study.actual_enrolment, study.target_enrolment)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
            <span>{getEnrolmentPct(study.actual_enrolment, study.target_enrolment)}% target</span>
            <span>{study.screen_failure_count || 12} screen failures</span>
          </div>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Compliance Score</div>
          <div className={`text-2xl font-bold mt-1 ${(study.compliance_score ?? 85) >= 85 ? 'text-teal-600' : 'text-ochre-600'}`}>
            {study.compliance_score ?? 85}%
          </div>
          <p className="text-xs text-slate-400 mt-2">GCP & Protocol Conformance</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">IEC Renewal Due</div>
          <div className="text-2xl font-bold text-navy-900 mt-1 flex items-center gap-1.5">
            <Calendar size={18} className="text-clinical-600" />
            {study.iec_renewal_due ? formatDate(study.iec_renewal_due) : 'In 45 days'}
          </div>
          <p className="text-xs text-ochre-600 font-medium mt-2">Institutional Ethics Board</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">CTRI Mandatory Update</div>
          <div className="text-2xl font-bold text-navy-900 mt-1 flex items-center gap-1.5">
            <CheckCircle2 size={18} className="text-teal-600" />
            {study.ctri_update_due ? formatDate(study.ctri_update_due) : 'In 20 days'}
          </div>
          <p className="text-xs text-slate-400 mt-2">6-Month Registry Sync</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Protocol Summary' },
            { id: 'sites', label: `Enrolled Sites (${SITES.length})` },
            { id: 'deviations', label: `Protocol Deviations (${DEVIATIONS.length})` },
            { id: 'regulatory', label: 'Regulatory & CTRI Dossier' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'border-clinical-600 text-clinical-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 clinical-card p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-navy-900 mb-2">Protocol Objective</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To evaluate the therapeutic efficacy, safety profile, and impact on functional mobility of {study.intervention} 
                in patient cohorts suffering from {(study.therapeutic_area || 'Musculoskeletal').toLowerCase()}, assessed via standardized clinical endpoints,
                biomarkers, and Patient-Reported Outcome Measures (PROMs).
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="text-base font-semibold text-navy-900 mb-3">Key Study Parameters</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase font-medium">Design</div>
                  <div className="font-semibold text-navy-800 mt-0.5">Randomized, Double-Blind, Parallel Group</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase font-medium">Follow-Up Duration</div>
                  <div className="font-semibold text-navy-800 mt-0.5">24 Weeks active + 4 weeks safety monitoring</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase font-medium">Primary Endpoint</div>
                  <div className="font-semibold text-navy-800 mt-0.5">Reduction in WOMAC pain scale from baseline to week 12</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase font-medium">Safety Oversight</div>
                  <div className="font-semibold text-navy-800 mt-0.5">Independent Data Safety Monitoring Board (DSMB)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="clinical-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Regulatory Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Ethics Approval</span>
                <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded text-xs">Approved (v2.0)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">CDSCO Permission</span>
                <span className="text-slate-700 font-medium text-xs font-mono">CT/AYUSH/2026/04</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">21 CFR Part 11 Audit</span>
                <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded text-xs">Verified (SHA-256)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">E-Signature Policy</span>
                <span className="text-slate-700 font-medium text-xs">Multi-Factor PIN</span>
              </div>
            </div>

            {can(['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'REGULATOR', 'ETHICS_COMMITTEE']) && (
              <div className="pt-2">
                <Link
                  to="/audit"
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-clinical-600 bg-clinical-50 hover:bg-clinical-100 rounded-lg block transition-colors"
                >
                  Inspect Trial Audit Trail →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sites' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Site Code</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Site Name</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Principal Investigator</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Enrolled / Target</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Compliance</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SITES.map((site) => (
                <tr key={site.code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-navy-800">{site.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{site.name}</td>
                  <td className="py-3 px-4 text-slate-600">{site.pi}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-medium text-slate-700">{site.enrolled}/{site.target}</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-clinical-600 h-1.5 rounded-full" style={{ width: `${(site.enrolled/site.target)*100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-teal-600">{site.compliance}%</td>
                  <td className="py-3 px-4"><span className="badge-low">{site.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'deviations' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Deviation ID</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Site</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Category</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Severity</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEVIATIONS.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-navy-800">{dev.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{dev.site}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{dev.type}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs max-w-xs">{dev.desc}</td>
                  <td className="py-3 px-4">
                    <span className={dev.severity === 'MAJOR' ? 'badge-high' : 'badge-low'}>{dev.severity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={dev.status === 'RESOLVED' ? 'badge-low' : 'badge-medium'}>{dev.status.replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'regulatory' && (
        <div className="clinical-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-navy-900">Regulatory Dossier & Registration Filings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <div className="font-semibold text-navy-800">CTRI Registration Certificate</div>
                <div className="text-xs text-slate-500 mt-1">Registration No: {study.ctri_number}</div>
                <div className="text-xs text-teal-600 font-medium mt-1">✓ Status: Enrolling participants</div>
              </div>
              <button
                onClick={() => showToast('Opening CTRI public registration page...')}
                className="p-2 text-slate-400 hover:text-navy-900 transition-colors"
                title="View CTRI Record"
              >
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <div className="font-semibold text-navy-800">IEC Ethical Approval Package</div>
                <div className="text-xs text-slate-500 mt-1">Ref: IEC/AIIA/2026/APPROVAL-089</div>
                <div className="text-xs text-slate-500 mt-1">Valid until: {study.iec_renewal_due ? formatDate(study.iec_renewal_due) : '2026-12-31'}</div>
              </div>
              <button
                onClick={() => showToast('Downloading IEC Approval Certificate PDF...')}
                className="p-2 text-slate-400 hover:text-navy-900 transition-colors"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Deviation Modal */}
      {showDeviationModal && (
        <Modal
          title="Log Protocol Deviation"
          onClose={() => setShowDeviationModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeviationModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeviationModal(false);
                  showToast('✓ Protocol Deviation logged & assigned to PI review queue');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700"
              >
                Submit Deviation
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Site</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm">
                <option>DEL-01 - AIIA Main Campus</option>
                <option>DEL-02 - AIIA Dwarka Extension</option>
                <option>JAI-01 - NIA Jaipur</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deviation Category</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm">
                <option>Informed Consent Procedure</option>
                <option>Inclusion / Exclusion Criteria</option>
                <option>Visit Schedule / Window</option>
                <option>Investigational Product Dosing</option>
                <option>Safety Reporting Window</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input type="radio" name="severity" defaultChecked /> Minor
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input type="radio" name="severity" /> Major (Requires CAPA)
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description & Immediate Action Taken</label>
              <textarea
                rows={3}
                placeholder="Describe details of the deviation..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
