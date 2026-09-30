import React from 'react';
import { WrongBookStore } from '../types';
import { CCNA_TAXONOMY, REMEDIATION_GUIDE, MODULE_META } from '../data/ccnaData';
import { detectConcept } from '../utils/quizUtils';
import { BarChart3, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface WeaknessRadarViewProps {
  wrongbook: WrongBookStore;
  onGoToTab: (tab: any, keyword: string) => void;
  onStartExamWithStrategy: (strategy: 'weakness' | 'module', moduleId?: number) => void;
}

export const WeaknessRadarView: React.FC<WeaknessRadarViewProps> = ({
  wrongbook,
  onGoToTab,
  onStartExamWithStrategy
}) => {
  const conceptStats: Record<string, { totalWrongs: number; unresolved: number; m: number }> = {};

  CCNA_TAXONOMY.forEach(tax => {
    conceptStats[tax.name] = { totalWrongs: 0, unresolved: 0, m: tax.m };
  });

  Object.values(wrongbook).forEach(item => {
    const concept = detectConcept(item, item.m);
    if (!conceptStats[concept]) {
      conceptStats[concept] = { totalWrongs: 0, unresolved: 0, m: item.m };
    }
    conceptStats[concept].totalWrongs += item.count || 1;
    if (!item.resolved) {
      conceptStats[concept].unresolved++;
    }
  });

  const sortedConcepts = Object.entries(conceptStats)
    .map(([name, data]) => ({
      name,
      ...data
    }))
    .sort((a, b) => b.unresolved - a.unresolved || b.totalWrongs - a.totalWrongs);

  const totalUnresolved = Object.values(wrongbook).filter(v => !v.resolved).length;
  const highRiskConcepts = sortedConcepts.filter(c => c.unresolved > 0 || c.totalWrongs > 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <BarChart3 className="h-4 w-4" />
              <span>官方考綱 22 大細粒度次領域 (Weighted Taxonomy)</span>
            </div>
            <h2 className="text-xl font-bold text-white">弱點考點診斷雷達</h2>
            <p className="text-xs text-slate-400 mt-1">
              系統根據你的作答歷史與錯題本記錄，即時計算失分考點加權，提供精準補強處方與專項抽題。
            </p>
          </div>

          <button
            onClick={() => onStartExamWithStrategy('weakness')}
            disabled={totalUnresolved === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold shadow transition-all cursor-pointer ${
              totalUnresolved > 0
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white hover:from-amber-500 hover:to-rose-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>發起弱點優先隨機抽題考</span>
          </button>
        </div>
      </div>

      {/* High-Risk Actionable Diagnosis Cards */}
      {highRiskConcepts.length > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>高頻失分領域與官方考綱補強建議：</span>
          </div>

          <div className="space-y-3">
            {highRiskConcepts.slice(0, 5).map(concept => {
              const guide = REMEDIATION_GUIDE[concept.name] || {
                day: '考綱核心單元複習',
                tab: 'tables',
                kw: '',
                summary: '建議重溫該單元核心概念，並加強實作演練。'
              };

              return (
                <div
                  key={concept.name}
                  className="rounded-lg border border-slate-800 bg-slate-900/90 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-white">{concept.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      待克服：{concept.unresolved} 題 · 累計錯 {concept.totalWrongs} 次
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {guide.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">
                      建議排程：<b className="text-sky-400">{guide.day}</b>
                    </span>

                    <div className="flex items-center gap-2">
                      {guide.kw && (
                        <button
                          onClick={() => onGoToTab(guide.tab || 'tables', guide.kw)}
                          className="px-2.5 py-1 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-colors cursor-pointer"
                        >
                          🔍 查對照/指令
                        </button>
                      )}
                      <button
                        onClick={() => onStartExamWithStrategy('module', concept.m)}
                        className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                      >
                        🎯 抽此模組隨機考
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 text-center text-xs text-emerald-300">
          ✅ 目前無嚴重失分考點，概念掌握度優良！請持續透過全真隨機抽題維持考前手感。
        </div>
      )}

      {/* Full 22 Taxonomy Concepts List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          全部 22 大考綱次領域總覽
        </h3>

        <div className="space-y-3">
          {sortedConcepts.map(c => {
            const hasError = c.unresolved > 0 || c.totalWrongs > 0;
            const modLabel = MODULE_META[c.m]?.name || `M${c.m}`;

            return (
              <div
                key={c.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                    {modLabel}
                  </span>
                  <span className="text-xs font-medium text-slate-200">{c.name}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {hasError ? (
                    <span className="font-mono text-xs font-semibold text-rose-400 tabular-nums">
                      待克服 {c.unresolved} / 累計 {c.totalWrongs}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">良好 0 錯題</span>
                  )}

                  <button
                    onClick={() => onStartExamWithStrategy('module', c.m)}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    <span>模組抽考</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
