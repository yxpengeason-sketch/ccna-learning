import React, { useState } from 'react';
import { LAB_MODULES } from '../data/labsData';
import { Code, Search, ChevronDown, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';

interface IosLabsViewProps {
  initialKeyword?: string;
}

export const IosLabsView: React.FC<IosLabsViewProps> = ({ initialKeyword = '' }) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState<string | number>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialKeyword);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalLabs = LAB_MODULES.reduce((sum, m) => sum + m.items.length, 0);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filterLabs = (items: typeof LAB_MODULES[0]['items']) => {
    if (!searchTerm.trim()) return items;
    const kw = searchTerm.toLowerCase();
    return items.filter(
      l =>
        l.title.toLowerCase().includes(kw) ||
        l.cfg.toLowerCase().includes(kw) ||
        l.verify.toLowerCase().includes(kw)
    );
  };

  const filteredModules = LAB_MODULES.map((m, idx) => ({
    ...m,
    idx,
    items: filterLabs(m.items)
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
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Code className="h-4 w-4" />
              <span>38 個 Cisco IOS-XE 實作指令與排錯 Lab</span>
            </div>
            <h2 className="text-xl font-bold text-white">IOS 實作指令與排錯演練</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋 ospf, vlan, helper, rsa, standby..."
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
            全部 ({totalLabs})
          </button>

          {LAB_MODULES.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModuleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeModuleIdx === idx
                  ? 'bg-sky-500 text-white font-semibold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m.moduleName} ({m.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* Labs List */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 text-xs">
          🔍 找不到與「<b className="text-sky-400">{searchTerm}</b>」相關的 Lab 指令。
        </div>
      ) : (
        <div className="space-y-8">
          {filteredModules.map(mGroup => (
            <div key={mGroup.moduleName} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-emerald-400">
                  {mGroup.moduleName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {mGroup.items.length} Labs
                </span>
              </div>

              <div className="space-y-3">
                {mGroup.items.map((lab, lIdx) => {
                  const labKey = `${mGroup.moduleName}_${lIdx}`;
                  return (
                    <details
                      key={lIdx}
                      open={Boolean(searchTerm) || activeModuleIdx !== 'all'}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all shadow-sm open:border-emerald-500/40"
                    >
                      <summary className="px-5 py-3.5 font-bold text-xs sm:text-sm text-slate-200 hover:bg-slate-800/40 cursor-pointer list-none flex items-center justify-between">
                        <span className="text-sky-300">{lab.title}</span>
                        <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                      </summary>

                      <div className="p-4 pt-2 border-t border-slate-800/80 space-y-3">
                        {/* Terminal 1: Configuration */}
                        <div className="rounded-lg border border-sky-500/30 overflow-hidden bg-slate-950">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-sky-950/40 border-b border-sky-500/20 text-[11px] font-mono text-sky-400">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Terminal className="h-3 w-3" /> Cisco IOS 配置指令 (Configuration)
                            </span>
                            <button
                              onClick={e => handleCopy(lab.cfg, `cfg_${labKey}`, e)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                            >
                              {copiedId === `cfg_${labKey}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>複製指令</span>
                            </button>
                          </div>
                          <pre className="p-3 text-xs font-mono text-sky-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                            {lab.cfg}
                          </pre>
                        </div>

                        {/* Terminal 2: Verification */}
                        <div className="rounded-lg border border-emerald-500/30 overflow-hidden bg-slate-950">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/40 border-b border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> 驗證指令與排錯要點 (Verification & Troubleshooting)
                            </span>
                            <button
                              onClick={e => handleCopy(lab.verify, `ver_${labKey}`, e)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                            >
                              {copiedId === `ver_${labKey}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>複製要點</span>
                            </button>
                          </div>
                          <pre className="p-3 text-xs font-mono text-emerald-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                            {lab.verify}
                          </pre>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
