import React, { useState } from 'react';
import { EquipmentItem } from '../types';

interface SmartAiInsightsProps {
  equipment: EquipmentItem;
}

interface AIAnalysis {
  healthScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  healthSummary?: string;
  recommendedActions?: string[];
  failureModeRisk?: string;
  isoCalibrationAdvice?: string;
}

export const SmartAiInsights: React.FC<SmartAiInsightsProps> = ({ equipment }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment }),
      });
      if (!res.ok) {
        throw new Error('AI analysis service returned an error');
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#edf4ff] rounded-2xl p-4 border border-[#094cb2]/20 space-y-3 font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#094cb2] text-white flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-[#001d32] leading-tight">
              Gemini AI Predictive Maintenance Assistant
            </h4>
            <p className="font-label text-[11px] text-[#434653]">
              Automated root-cause prediction & ISO compliance insights
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiAnalysis}
          disabled={loading}
          className="bg-[#094cb2] hover:bg-[#073988] text-white font-label text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>{analysis ? 'Re-Analyze' : 'Analyze with AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Initial Callout State */}
      {!analysis && !loading && !error && (
        <p className="text-xs text-[#434653] italic">
          Click "Analyze with AI" to generate Gemini-powered predictive failure analysis, recommended technician steps, and ISO calibration advice for <strong>{equipment.name}</strong>.
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="text-xs text-[#ba1a1a] bg-[#ffdad6]/60 p-3 rounded-xl border border-[#ba1a1a]/30">
          <strong>AI Analysis Notice:</strong> {error}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysis && (
        <div className="space-y-3 pt-1 text-xs text-[#001d32] animate-fade-in">
          {/* Summary & Risk Badge */}
          <div className="flex items-start justify-between gap-2 bg-white p-3 rounded-xl border border-[#c3c6d5]/20">
            <div>
              <span className="text-[10px] font-label font-bold text-[#434653] uppercase block mb-1">
                Expert Condition Assessment
              </span>
              <p className="font-medium text-xs leading-relaxed text-[#001d32]">
                {analysis.healthSummary}
              </p>
            </div>
            {analysis.riskLevel && (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-label font-bold shrink-0 ${
                  analysis.riskLevel === 'Critical'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : analysis.riskLevel === 'High'
                    ? 'bg-[#fef3c7] text-[#b45309]'
                    : 'bg-[#dcfce7] text-[#15803d]'
                }`}
              >
                {analysis.riskLevel} Risk
              </span>
            )}
          </div>

          {/* Recommended Actions */}
          {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-[#c3c6d5]/20">
              <span className="text-[10px] font-label font-bold text-[#094cb2] uppercase block mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">checklist</span>
                Recommended Technician Actions
              </span>
              <ul className="list-disc list-inside space-y-1 font-medium text-[#001d32]">
                {analysis.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Failure Mode & ISO Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.failureModeRisk && (
              <div className="bg-white p-2.5 rounded-xl border border-[#c3c6d5]/20">
                <span className="text-[10px] font-label font-bold text-[#ba1a1a] uppercase block mb-1">
                  Potential Failure Mode
                </span>
                <p className="text-[11px] text-[#434653] font-medium">{analysis.failureModeRisk}</p>
              </div>
            )}
            {analysis.isoCalibrationAdvice && (
              <div className="bg-white p-2.5 rounded-xl border border-[#c3c6d5]/20">
                <span className="text-[10px] font-label font-bold text-[#094cb2] uppercase block mb-1">
                  ISO / GAMP Calibration Advice
                </span>
                <p className="text-[11px] text-[#434653] font-medium">{analysis.isoCalibrationAdvice}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
