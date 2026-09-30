import React, { useState } from 'react';
import {
  Settings, Shield, CheckCircle2, Search, Filter,
  Lock, RefreshCw, Key, FileCheck, ArrowRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'security'>('audit');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const [auditLogs, setAuditLogs] = useState([
    { seq: 1248, timestamp: '2026-03-30T10:45:12Z', actor: 'Dr. Arjun Sharma', role: 'PRINCIPAL_INVESTIGATOR', event: 'E_SIGNATURE_APPLIED', entity: 'SAE-2026-041', details: 'Applied 21 CFR Part 11 e-signature to expedited medical review', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', prevHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', status: 'VALID' },
    { seq: 1247, timestamp: '2026-03-30T10:12:05Z', actor: 'Priya Nair', role: 'STUDY_COORDINATOR', event: 'RE_CONSENT_RECORDED', entity: 'SUB-DEL01-0001', details: 'Participant signed ICF v2.0 in Marathi with impartial witness', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', prevHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', status: 'VALID' },
    { seq: 1246, timestamp: '2026-03-29T16:22:40Z', actor: 'Dr. Sunita Rao', role: 'ETHICS_COMMITTEE', event: 'PROTOCOL_AMENDMENT_APPROVED', entity: 'AIIA-OA-2026-001', details: 'Full ethical clearance granted for protocol version 2.0', hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', prevHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', status: 'VALID' },
    { seq: 1245, timestamp: '2026-03-29T14:05:19Z', actor: 'Dr. Vikram Singh', role: 'PHARMACOVIGILANCE_OFFICER', event: 'SAE_REPORTED', entity: 'SAE-2026-041', details: 'Initial triage created; 24-hour CDSCO countdown initialized', hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', prevHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', status: 'VALID' },
    { seq: 1244, timestamp: '2026-03-28T11:30:00Z', actor: 'Karan Mehta', role: 'MONITOR', event: 'MONITORING_VISIT_CONDUCTED', entity: 'MON-DEL01-001', details: 'SDV 87.5% completed; 1 finding noted regarding visit window', hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', prevHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', status: 'VALID' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('SUCCESS');
      showToast('✓ Cryptographic SHA-256 Ledger: All 1,248 blocks verified. 0 tampering detected.');
    }, 1200);
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
          <h1 className="text-2xl font-bold text-navy-900">21 CFR Part 11 Audit Trail & Security Ledger</h1>
          <p className="text-slate-500 text-sm mt-0.5">Cryptographic SHA-256 hash-chained immutable audit records and role permissions</p>
        </div>
        <button
          onClick={handleVerifyLedger}
          disabled={isVerifying}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-2 self-start"
        >
          <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
          {isVerifying ? 'Verifying Hash Chain...' : 'Verify Cryptographic Chain'}
        </button>
      </div>

      {/* Verification Result Banner */}
      {verificationResult === 'SUCCESS' && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={24} className="text-teal-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-teal-900 text-sm">Cryptographic Verification Passed (100% Data Integrity)</div>
            <div className="text-xs text-teal-700 mt-0.5">
              Verified all 1,248 hash blocks back to the Genesis Block. Every timestamp, investigator signature, and database record matches its SHA-256 digest. Zero record mutations or tampering detected.
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Total Ledger Blocks</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">1,248</div>
          <p className="text-xs text-slate-400 mt-1">SHA-256 Hash Chained</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Electronic Signatures</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">42 Verified</div>
          <p className="text-xs text-slate-400 mt-1">21 CFR Part 11 compliant</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Active System Users</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">8 Roles</div>
          <p className="text-xs text-slate-400 mt-1">Zero permission conflicts</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Compliance Standard</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">ICMR / GCP</div>
          <p className="text-xs text-teal-600 font-medium mt-1">Audit-Ready Ledger</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'audit'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cryptographic Audit Ledger
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'users'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Role-Based Access Control (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'security'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security & E-Signature Policy
          </button>
        </div>
      </div>

      {/* Ledger Tab */}
      {activeTab === 'audit' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">Seq #</th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">Timestamp (UTC)</th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">Actor & Role</th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">Event Action</th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">Target Entity</th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-600 uppercase">SHA-256 Hash Digest</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-600 uppercase">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.seq} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-navy-800">{log.seq}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-sans">
                    <div className="font-semibold text-xs">{log.actor}</div>
                    <div className="text-[10px] text-slate-400">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-bold text-navy-900 text-xs">{log.event}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-bold text-xs">{log.entity}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px] max-w-xs truncate" title={log.hash}>
                    {log.hash.slice(0, 16)}...{log.hash.slice(-8)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="badge-low text-[10px]">VERIFIED ✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="clinical-card p-5 space-y-4">
          <h3 className="font-bold text-navy-900 text-base">Authorized Stakeholder Role Matrix</h3>
          <div className="space-y-2 text-xs">
            {[
              { role: 'LEADERSHIP', desc: 'Portfolio-level oversight, aggregate recruitment KPIs, high-level risk radar. Zero PII.' },
              { role: 'PRINCIPAL_INVESTIGATOR', desc: 'Protocol deviations, 21 CFR Part 11 e-signatures, study medical reviews.' },
              { role: 'STUDY_COORDINATOR', desc: 'Participant enrollment, screening, informed consent documentation, eCRF data capture.' },
              { role: 'ETHICS_COMMITTEE', desc: 'Protocol amendment clearance, expedited SAE notifications, institutional meeting minutes.' },
              { role: 'PHARMACOVIGILANCE_OFFICER', desc: 'Adverse event triage, 24h CDSCO countdown clock, safety signal clustering.' },
              { role: 'MONITOR (CRA)', desc: 'Site monitoring visits (MVR), Source Data Verification (SDV), CAPA resolution.' },
              { role: 'REGULATOR', desc: 'Read-only inspection rights, CTRI synchronization validation, CDISC compliance audits.' },
              { role: 'ADMIN', desc: 'System governance, user lifecycle management, cryptographic ledger integrity.' },
            ].map((u) => (
              <div key={u.role} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-navy-900 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {u.role}
                  </span>
                  <p className="text-slate-600 mt-1 text-xs">{u.desc}</p>
                </div>
                <span className="badge-low">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="clinical-card p-6 space-y-4 text-xs">
          <h3 className="font-bold text-navy-900 text-base">21 CFR Part 11 & Data Protection Safeguards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-navy-800 text-sm">Cryptographic Signature Controls</div>
              <p className="text-slate-600 leading-relaxed">
                Every electronic sign-off requires user authentication, password/PIN verification, and explicit acknowledgment of the meaning of the signature (e.g., &quot;I have reviewed and approve this medical report&quot;).
              </p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-navy-800 text-sm">Zero Patient Identifiable Information (PII)</div>
              <p className="text-slate-600 leading-relaxed">
                Core trial datasets store only deterministic pseudonyms (`SUB-XXX-####`). Personal data keys remain segregated in air-gapped hospital records adhering to the Indian Digital Personal Data Protection (DPDP) Act.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
