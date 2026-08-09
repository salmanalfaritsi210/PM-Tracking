import React, { useState } from 'react';
import { EquipmentItem } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  equipment,
}) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalUnits = equipment.length;
  const okUnits = equipment.filter((e) => e.status === 'OK').length;
  const dueSoonUnits = equipment.filter((e) => e.status === 'Due Soon').length;
  const overdueUnits = equipment.filter((e) => e.status === 'Overdue').length;

  const complianceRate = totalUnits > 0 ? Math.round((okUnits / totalUnits) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAiSummary = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentList: equipment }),
      });
      if (!res.ok) throw new Error('AI report summary failed');
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (err: any) {
      setAiError(err.message || 'Error generating AI summary');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#001d32]/40 backdrop-blur-xs z-50 transition-opacity"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#c3c6d5]/30 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-[#edf4ff] flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#094cb2] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">summarize</span>
              </div>
              <div>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#001d32]">
                  PM Logistics Summary Report
                </h2>
                <p className="font-body text-xs text-[#434653]">
                  Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#434653] hover:text-[#001d32] p-2 rounded-full hover:bg-[#edf4ff]"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Report Body */}
          <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 space-y-6 print:p-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#edf4ff] rounded-xl border border-[#094cb2]/20 text-center">
                <span className="font-label text-[10px] uppercase font-bold text-[#434653] block">
                  Total Managed Units
                </span>
                <span className="font-headline text-2xl font-bold text-[#094cb2]">{totalUnits}</span>
              </div>

              <div className="p-3.5 bg-[#cde5ff] rounded-xl border border-[#094cb2]/20 text-center">
                <span className="font-label text-[10px] uppercase font-bold text-[#434653] block">
                  Up to Date (OK)
                </span>
                <span className="font-headline text-2xl font-bold text-[#094cb2]">{okUnits}</span>
              </div>

              <div className="p-3.5 bg-[#bfab49]/20 rounded-xl border border-[#bfab49]/30 text-center">
                <span className="font-label text-[10px] uppercase font-bold text-[#6d5e00] block">
                  Due Soon
                </span>
                <span className="font-headline text-2xl font-bold text-[#6d5e00]">{dueSoonUnits}</span>
              </div>

              <div className="p-3.5 bg-[#ffdad6] rounded-xl border border-[#ba1a1a]/30 text-center">
                <span className="font-label text-[10px] uppercase font-bold text-[#93000a] block">
                  Overdue Units
                </span>
                <span className="font-headline text-2xl font-bold text-[#ba1a1a]">{overdueUnits}</span>
              </div>
            </div>

            {/* Gemini AI Executive Summary Box */}
            <div className="p-4 bg-[#edf4ff] rounded-2xl border border-[#094cb2]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#094cb2] text-xl">auto_awesome</span>
                  <h3 className="font-headline font-bold text-sm text-[#001d32]">
                    Gemini AI Executive Summary
                  </h3>
                </div>
                <button
                  onClick={handleGenerateAiSummary}
                  disabled={isAiLoading}
                  className="bg-[#094cb2] hover:bg-[#073988] text-white font-label text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isAiLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      <span>{aiSummary ? 'Regenerate' : 'Generate AI Summary'}</span>
                    </>
                  )}
                </button>
              </div>

              {aiSummary ? (
                <div className="bg-white p-3.5 rounded-xl border border-[#c3c6d5]/20 text-xs font-body text-[#001d32] whitespace-pre-line leading-relaxed">
                  {aiSummary}
                </div>
              ) : (
                <p className="text-xs text-[#434653] italic">
                  Click 'Generate AI Summary' to compile an automated executive PM narrative and resource allocation advisory.
                </p>
              )}

              {aiError && (
                <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/60 p-2 rounded-lg font-label">{aiError}</p>
              )}
            </div>

            {/* Compliance Rate Gauge */}
            <div className="p-4 bg-[#f7f9ff] rounded-2xl border border-[#c3c6d5]/20 flex items-center justify-between">
              <div>
                <h3 className="font-label text-sm font-bold text-[#001d32]">
                  Calibration Compliance Rate
                </h3>
                <p className="font-body text-xs text-[#434653] mt-0.5">
                  Percentage of equipment within valid certification window.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-headline text-3xl font-bold text-[#094cb2]">
                  {complianceRate}%
                </span>
              </div>
            </div>

            {/* Critical Action Items Table */}
            <div>
              <h3 className="font-label text-xs uppercase font-bold text-[#094cb2] tracking-wider mb-3">
                Action Items (Overdue & Due Soon)
              </h3>
              <div className="border border-[#c3c6d5]/20 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#edf4ff]">
                    <tr>
                      <th className="p-2.5 font-label font-bold text-[#434653]">Status</th>
                      <th className="p-2.5 font-label font-bold text-[#434653]">Equipment</th>
                      <th className="p-2.5 font-label font-bold text-[#434653]">Area/Line</th>
                      <th className="p-2.5 font-label font-bold text-[#434653]">Next Due</th>
                      <th className="p-2.5 font-label font-bold text-[#434653]">WO / PTW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c6d5]/20">
                    {equipment
                      .filter((e) => e.status !== 'OK')
                      .map((e) => (
                        <tr key={e.id} className="hover:bg-[#edf4ff]/50">
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-label ${
                                e.status === 'Overdue'
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#bfab49]/20 text-[#6d5e00]'
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-[#001d32]">{e.name}</td>
                          <td className="p-2.5 text-[#434653]">
                            {e.area} ({e.line})
                          </td>
                          <td className="p-2.5 font-bold">{e.nextDueDate}</td>
                          <td className="p-2.5 font-mono">{e.lastWoPtw}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 sm:px-8 py-4 bg-[#f7f9ff] flex items-center justify-end space-x-3 border-t border-[#edf4ff] sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="font-label text-xs sm:text-sm font-bold text-[#434653] hover:text-[#001d32] px-5 py-2.5 rounded-xl hover:bg-[#edf4ff]"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="font-label text-xs sm:text-sm font-bold text-white btn-primary px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
