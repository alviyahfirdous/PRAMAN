import React, { useState } from 'react';
import type { Draft } from '@/lib/assist/types';
import { generateSdtmFromDraft, sdtmToCsv } from '@/lib/assist/sdtm';
import { Copy, Download, Check, AlertCircle } from 'lucide-react';

interface SdtmPreviewProps {
  draft: Draft;
  onToast: (msg: string) => void;
}

export const SdtmPreview: React.FC<SdtmPreviewProps> = ({ draft, onToast }) => {
  const [activeDomain, setActiveDomain] = useState<'ALL' | 'DM' | 'VS' | 'QS' | 'AE'>('ALL');
  const [copied, setCopied] = useState(false);

  const payload = generateSdtmFromDraft(draft);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    onToast('✓ SDTM-style draft payload copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCsv = () => {
    const csvContent = sdtmToCsv(payload);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SDTM_${payload.metadata.subjectId}_draft.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('✓ SDTM draft CSV downloaded successfully');
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Disclaimer Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <span className="font-semibold text-xs">
            SDTM-Style Draft — Synthetic demo output, not submission-ready
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1 shadow-2xs"
          >
            {copied ? <Check size={12} className="text-teal-600" /> : <Copy size={12} />}
            <span>Copy JSON</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1 shadow-2xs"
          >
            <Download size={12} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Domain Selectors */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(['ALL', 'DM', 'VS', 'QS', 'AE'] as const).map((dom) => (
          <button
            key={dom}
            type="button"
            onClick={() => setActiveDomain(dom)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              activeDomain === dom
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {dom === 'ALL' ? 'All Domains' : `${dom} (${payload[dom].length})`}
          </button>
        ))}
      </div>

      {/* Tables Display */}
      {(activeDomain === 'ALL' || activeDomain === 'DM') && (
        <div className="clinical-card overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-navy-900 text-xs flex justify-between">
            <span>Demographics (DM)</span>
            <span className="font-mono text-[11px] text-slate-500">Records: {payload.DM.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2">STUDYID</th>
                  <th className="p-2">DOMAIN</th>
                  <th className="p-2">USUBJID</th>
                  <th className="p-2">SUBJID</th>
                  <th className="p-2">SITEID</th>
                  <th className="p-2">ARMCD</th>
                  <th className="p-2">COUNTRY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payload.DM.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2">{r.STUDYID}</td>
                    <td className="p-2">{r.DOMAIN}</td>
                    <td className="p-2 font-bold text-purple-700">{r.USUBJID}</td>
                    <td className="p-2">{r.SUBJID}</td>
                    <td className="p-2">{r.SITEID}</td>
                    <td className="p-2">{r.ARMCD}</td>
                    <td className="p-2">{r.COUNTRY}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeDomain === 'ALL' || activeDomain === 'VS') && (
        <div className="clinical-card overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-navy-900 text-xs flex justify-between">
            <span>Vital Signs (VS) — One Record Per Test</span>
            <span className="font-mono text-[11px] text-slate-500">Records: {payload.VS.length}</span>
          </div>
          {payload.VS.length === 0 ? (
            <div className="p-4 text-center text-slate-400 italic">No vitals recorded in draft</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">VSTESTCD</th>
                    <th className="p-2">VSTEST</th>
                    <th className="p-2">VSORRES</th>
                    <th className="p-2">VSORRESU</th>
                    <th className="p-2">VSSTRESN</th>
                    <th className="p-2">VSSTRESU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.VS.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-navy-900">{r.VSTESTCD}</td>
                      <td className="p-2">{r.VSTEST}</td>
                      <td className="p-2 font-semibold text-purple-700">{r.VSORRES}</td>
                      <td className="p-2">{r.VSORRESU}</td>
                      <td className="p-2">{r.VSSTRESN}</td>
                      <td className="p-2">{r.VSSTRESU}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(activeDomain === 'ALL' || activeDomain === 'QS') && (
        <div className="clinical-card overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-navy-900 text-xs flex justify-between">
            <span>Questionnaires (QS) — Validated QSTESTCD / QSORRES / QSSTRESN</span>
            <span className="font-mono text-[11px] text-slate-500">Records: {payload.QS.length}</span>
          </div>
          {payload.QS.length === 0 ? (
            <div className="p-4 text-center text-slate-400 italic">No questionnaires reported</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">QSCAT</th>
                    <th className="p-2">QSTESTCD</th>
                    <th className="p-2">QSTEST</th>
                    <th className="p-2">QSORRES</th>
                    <th className="p-2">QSSTRESN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.QS.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2">{r.QSCAT}</td>
                      <td className="p-2 font-bold text-navy-900">{r.QSTESTCD}</td>
                      <td className="p-2">{r.QSTEST}</td>
                      <td className="p-2 font-semibold text-purple-700">{r.QSORRES}</td>
                      <td className="p-2">{r.QSSTRESN}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(activeDomain === 'ALL' || activeDomain === 'AE') && (
        <div className="clinical-card overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-navy-900 text-xs flex justify-between">
            <span>Adverse Events (AE) — One Record Per Event</span>
            <span className="font-mono text-[11px] text-slate-500">Records: {payload.AE.length}</span>
          </div>
          {payload.AE.length === 0 ? (
            <div className="p-4 text-center text-slate-400 italic">No adverse events reported</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">AESEQ</th>
                    <th className="p-2">AETERM</th>
                    <th className="p-2">AESEV</th>
                    <th className="p-2">AESER</th>
                    <th className="p-2">AEREL</th>
                    <th className="p-2">AESTDTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.AE.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2">{r.AESEQ}</td>
                      <td className="p-2 font-bold text-navy-900">{r.AETERM}</td>
                      <td className="p-2">{r.AESEV}</td>
                      <td className="p-2">{r.AESER}</td>
                      <td className="p-2">{r.AEREL}</td>
                      <td className="p-2">{r.AESTDTC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON viewer */}
      <details className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px]">
        <summary className="cursor-pointer text-slate-300 font-semibold mb-2">
          View Complete JSON Payload ({Object.keys(payload).length} keys)
        </summary>
        <pre className="overflow-x-auto max-h-64 p-2">{JSON.stringify(payload, null, 2)}</pre>
      </details>
    </div>
  );
};
