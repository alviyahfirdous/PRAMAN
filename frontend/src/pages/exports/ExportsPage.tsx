import React, { useState } from 'react';
import {
  Database, Download, FileText, CheckCircle2, Copy,
  ArrowRight, Shield, RefreshCw
} from 'lucide-react';

export default function ExportsPage() {
  const [activeTab, setActiveTab] = useState<'cdisc' | 'fhir' | 'validation'>('cdisc');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const CDISC_DM = [
    { STUDYID: 'AIIA-OA-2026', DOMAIN: 'DM', USUBJID: 'PRM-001-0001', SUBJID: '0001', RFSTDTC: '2026-01-15', AGE: 54, AGEU: 'YEARS', SEX: 'F', RACE: 'ASIAN', ETHNIC: 'NOT HISPANIC', COUNTRY: 'IND', ARMCD: 'VATARI500', ACTARM: 'Vatari Guggulu 500mg TID' },
    { STUDYID: 'AIIA-OA-2026', DOMAIN: 'DM', USUBJID: 'PRM-001-0002', SUBJID: '0002', RFSTDTC: '2026-01-18', AGE: 61, AGEU: 'YEARS', SEX: 'M', RACE: 'ASIAN', ETHNIC: 'NOT HISPANIC', COUNTRY: 'IND', ARMCD: 'VATARI500', ACTARM: 'Vatari Guggulu 500mg TID' },
    { STUDYID: 'AIIA-OA-2026', DOMAIN: 'DM', USUBJID: 'PRM-001-0003', SUBJID: '0003', RFSTDTC: '2026-01-20', AGE: 48, AGEU: 'YEARS', SEX: 'F', RACE: 'ASIAN', ETHNIC: 'NOT HISPANIC', COUNTRY: 'IND', ARMCD: 'PLACEBO', ACTARM: 'Placebo Control' },
  ];

  const FHIR_SAMPLE = {
    resourceType: 'ResearchStudy',
    id: 'praman-aiia-oa-2026',
    meta: { versionId: '2.0', lastUpdated: '2026-03-30T10:00:00Z' },
    identifier: [
      { system: 'http://ctri.nic.in', value: 'CTRI/2026/01/000001' },
      { system: 'urn:ietf:rfc:3986', value: 'AIIA-OA-2026-001' }
    ],
    title: 'Efficacy and Safety of Ayurvedic Formulation in Osteoarthritis',
    status: 'active',
    phase: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/research-study-phase', code: 'phase-3', display: 'Phase III' }] },
    category: [{ coding: [{ system: 'http://snomed.info/sct', code: '399269003', display: 'Osteoarthritis' }] }],
    focus: [{ coding: [{ display: 'Vatari Guggulu 500mg TID' }] }],
    sponsor: { display: 'All India Institute of Ayurveda (AIIA)' },
    principalInvestigator: { display: 'Dr. Arjun Sharma, MD' },
    enrollment: [{ display: 'Target: 150, Actual: 82' }]
  };

  const downloadFile = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ Downloaded ${filename}`);
  };

  const handleDownloadCDISC = () => {
    const header = Object.keys(CDISC_DM[0]).join(',');
    const rows = CDISC_DM.map((r) => Object.values(r).join(',')).join('\n');
    downloadFile('PRAMAN_SDTM_DM.csv', `${header}\n${rows}`, 'text/csv');
  };

  const handleDownloadFHIR = () => {
    downloadFile('PRAMAN_FHIR_ResearchStudy.json', JSON.stringify(FHIR_SAMPLE, null, 2), 'application/json');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(FHIR_SAMPLE, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('✓ FHIR JSON copied to clipboard');
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
          <h1 className="text-2xl font-bold text-navy-900">Regulatory Data Standards & Interoperability Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">Automated CDISC SDTM, HL7 FHIR R4, and CDSCO submission package generation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadCDISC}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-1.5"
          >
            <Download size={14} /> Download SDTM Package (CSV)
          </button>
        </div>
      </div>

      {/* Standards Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clinical-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 font-bold text-xs flex-shrink-0">
            CDISC
          </div>
          <div>
            <div className="font-semibold text-navy-900 text-sm">CDISC SDTM v3.4 Conformance</div>
            <div className="text-xs text-teal-600 font-bold mt-0.5">✓ 98.4% Validation Score (Pinnacle 21 Compliant)</div>
          </div>
        </div>

        <div className="clinical-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
            FHIR
          </div>
          <div>
            <div className="font-semibold text-navy-900 text-sm">HL7 FHIR Release 4 (R4)</div>
            <div className="text-xs text-slate-500 mt-0.5">Bi-directional EHR & Registry interoperability</div>
          </div>
        </div>

        <div className="clinical-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
            ICMR
          </div>
          <div>
            <div className="font-semibold text-navy-900 text-sm">CDSCO / ICMR NDCT Rules 2019</div>
            <div className="text-xs text-teal-600 font-bold mt-0.5">✓ Ready for SUGAM Portal upload</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('cdisc')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'cdisc'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            CDISC SDTM Datasets (DM, AE, VS, DS)
          </button>
          <button
            onClick={() => setActiveTab('fhir')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'fhir'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            HL7 FHIR R4 Bundle
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'validation'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pinnacle 21 Conformance Report
          </button>
        </div>
      </div>

      {/* CDISC Tab */}
      {activeTab === 'cdisc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Domain: <strong>Demographics (DM.xpt / DM.csv)</strong></span>
            <button
              onClick={handleDownloadCDISC}
              className="text-xs text-clinical-600 hover:text-clinical-800 font-semibold flex items-center gap-1"
            >
              <Download size={13} /> Download DM.csv
            </button>
          </div>

          <div className="clinical-card overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {Object.keys(CDISC_DM[0]).map((h) => (
                    <th key={h} className="py-2 px-3 text-left font-bold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CDISC_DM.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="py-2 px-3 whitespace-nowrap text-slate-700">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FHIR Tab */}
      {activeTab === 'fhir' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Resource: <strong>ResearchStudy (HL7 FHIR Release 4)</strong></span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              >
                <Copy size={12} /> {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleDownloadFHIR}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-navy-600 text-white hover:bg-navy-700 flex items-center gap-1"
              >
                <Download size={12} /> Download FHIR JSON
              </button>
            </div>
          </div>

          <div className="clinical-card p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-xs">
            <pre>{JSON.stringify(FHIR_SAMPLE, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="clinical-card p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <CheckCircle2 size={24} className="text-teal-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-teal-900 text-sm">Regulatory Conformance Audit Passed</div>
              <div className="text-xs text-teal-700 mt-0.5">
                0 Critical Errors, 0 Serious Warnings. Conforms to FDA Study Data Technical Conformance Guide and CDSCO Electronic Data Guidelines.
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 border border-slate-100 rounded">
              <span>Rule SD0001: Required variables in Demographics domain</span>
              <span className="text-teal-600 font-bold">PASS (100%)</span>
            </div>
            <div className="flex justify-between p-2.5 border border-slate-100 rounded">
              <span>Rule SD0008: ISO 8601 date formatting across all events</span>
              <span className="text-teal-600 font-bold">PASS (100%)</span>
            </div>
            <div className="flex justify-between p-2.5 border border-slate-100 rounded">
              <span>Rule SD0034: MedDRA dictionary version consistency (v26.1)</span>
              <span className="text-teal-600 font-bold">PASS (100%)</span>
            </div>
            <div className="flex justify-between p-2.5 border border-slate-100 rounded">
              <span>Rule SD0045: Subject pseudonym consistency with consent record</span>
              <span className="text-teal-600 font-bold">PASS (100%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
