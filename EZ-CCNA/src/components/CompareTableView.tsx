import React, { useState } from 'react';
import { COMPARE_MODULES } from '../data/compareData';
import { Layers, Search, ChevronDown } from 'lucide-react';

interface CompareTableViewProps {
  initialKeyword?: string;
}

export const CompareTableView: React.FC<CompareTableViewProps> = ({ initialKeyword = '' }) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState<string | number>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialKeyword);

  const totalTables = COMPARE_MODULES.reduce((sum, m) => sum + m.tables.length, 0);

  const filterTables = (tables: typeof COMPARE_MODULES[0]['tables']) => {
    if (!searchTerm.trim()) return tables;
    const kw = searchTerm.toLowerCase();
    return tables.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(kw);
      const matchContent = t.rows.some(r =>
        r.some(c => c.toLowerCase().includes(kw))
      );
      return matchTitle || matchContent;
    });
  };

  const filteredModules = COMPARE_MODULES.map((m, idx) => ({
    ...m,
    idx,
    tables: filterTables(m.tables)
  })).filter(m => {
    if (activeModuleIdx !== 'all' && activeModuleIdx !== m.idx) return false;
    return m.tables.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Tool */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <Layers className="h-4 w-4" />
              <span>38 條官方考綱核心概念對照表</span>
            </div>
            <h2 className="text-xl font-bold text-white">易混淆概念深度對照表</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋 OSPF, VLAN, LACP, NAT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveModuleIdx('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeModuleIdx === 'all'
                ? 'bg-sky-500 text-white font-semibold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            全部 ({totalTables})
          </button>

          {COMPARE_MODULES.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModuleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeModuleIdx === idx
                  ? 'bg-sky-500 text-white font-semibold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {idx + 1}. {m.moduleName} ({m.tables.length})
            </button>
          ))}
        </div>
      </div>

      {/* Tables List */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 text-xs">
          🔍 找不到與「<b className="text-sky-400">{searchTerm}</b>」相關的對照表，請嘗試簡短關鍵字（如 STP、NAT、SSH）。
        </div>
      ) : (
        <div className="space-y-8">
          {filteredModules.map(mGroup => (
            <div key={mGroup.moduleName} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-sky-400">
                  {mGroup.moduleName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {mGroup.tables.length} 表
                </span>
              </div>

              <div className="space-y-3">
                {mGroup.tables.map((tbl, tIdx) => (
                  <details
                    key={tIdx}
                    open={Boolean(searchTerm) || activeModuleIdx !== 'all'}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all shadow-sm open:border-sky-500/40"
                  >
                    <summary className="px-5 py-3.5 font-bold text-xs sm:text-sm text-sky-300 hover:bg-slate-800/40 cursor-pointer list-none flex items-center justify-between">
                      <span>{tbl.title}</span>
                      <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                    </summary>

                    <div className="p-4 pt-1 border-t border-slate-800/80 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <tbody>
                          {tbl.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={
                                rIdx === 0
                                  ? 'bg-slate-950 font-semibold text-slate-200 border-b border-slate-800'
                                  : 'border-b border-slate-800/60 hover:bg-slate-800/30 text-slate-300'
                              }
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2.5 px-3 align-top leading-relaxed ${
                                    cIdx === 0 ? 'font-semibold text-slate-200 w-32 shrink-0' : ''
                                  }`}
                                  dangerouslySetInnerHTML={{ __html: cell }}
                                />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
