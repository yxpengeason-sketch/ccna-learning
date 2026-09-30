import React, { useState } from 'react';
import { PITFALL_MODULES } from '../data/pitfallsData';
import { AlertTriangle, Search, ChevronDown, CheckCircle2, Lightbulb } from 'lucide-react';

interface PitfallsViewProps {
  initialKeyword?: string;
}

export const PitfallsView: React.FC<PitfallsViewProps> = ({ initialKeyword = '' }) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState<string | number>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialKeyword);

  const totalPitfalls = PITFALL_MODULES.reduce((sum, m) => sum + m.items.length, 0);

  const filterItems = (items: typeof PITFALL_MODULES[0]['items']) => {
    if (!searchTerm.trim()) return items;
    const kw = searchTerm.toLowerCase();
    return items.filter(
      p =>
        p.title.toLowerCase().includes(kw) ||
        p.scenario.toLowerCase().includes(kw) ||
        p.solution.toLowerCase().includes(kw) ||
        p.mnemonic.toLowerCase().includes(kw)
    );
  };

  const filteredModules = PITFALL_MODULES.map((m, idx) => ({
    ...m,
    idx,
    items: filterItems(m.items)
  })).filter(m => {
    if (activeModuleIdx !== 'all' && activeModuleIdx !== m.idx) return false;
    return m.items.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Tool */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>CCNA 官方 6 大考綱高頻混淆陷阱</span>
            </div>
            <h2 className="text-xl font-bold text-white">高頻觀念陷阱與破解速記</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋 OSPF, ExStart, Sticky, 401..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveModuleIdx('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeModuleIdx === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            全部 ({totalPitfalls})
          </button>

          {PITFALL_MODULES.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModuleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeModuleIdx === idx
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m.moduleName} ({m.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* Pitfalls List */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 text-xs">
          🔍 找不到與「<b className="text-amber-400">{searchTerm}</b>」相關的觀念陷阱。
        </div>
      ) : (
        <div className="space-y-8">
          {filteredModules.map(mGroup => (
            <div key={mGroup.moduleName} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-amber-400">
                  {mGroup.moduleName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {mGroup.items.length} 陷阱
                </span>
              </div>

              <div className="space-y-3">
                {mGroup.items.map((pit, pIdx) => (
                  <details
                    key={pIdx}
                    open={Boolean(searchTerm) || activeModuleIdx !== 'all'}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all shadow-sm open:border-amber-500/40"
                  >
                    <summary className="px-5 py-3.5 font-bold text-xs sm:text-sm text-amber-300 hover:bg-slate-800/40 cursor-pointer list-none flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{pit.title}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                    </summary>

                    <div className="p-4 pt-2 border-t border-slate-800/80 space-y-3 text-xs">
                      {/* Danger Box */}
                      <div className="rounded-lg bg-rose-950/20 border border-rose-500/30 p-3.5 text-rose-200 leading-relaxed">
                        <div className="font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                          <span>❌【高頻混淆陷阱】</span>
                        </div>
                        <div>{pit.scenario}</div>
                      </div>

                      {/* Solution Box */}
                      <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3.5 text-emerald-200 leading-relaxed">
                        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>✅【官方破解邏輯】</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: pit.solution }} />
                      </div>

                      {/* Mnemonic Bar */}
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-center gap-2 text-amber-300 font-semibold text-xs">
                        <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>觀念秒殺口訣：{pit.mnemonic}</span>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
