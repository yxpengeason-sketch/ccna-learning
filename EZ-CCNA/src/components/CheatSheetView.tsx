import React, { useState } from 'react';
import { COMPARISON_TABLES, CLI_LABS, COMMON_PITFALLS, CheatItem } from '../data/ccnaData';
import { FileText, Search, Code, AlertTriangle, Layers } from 'lucide-react';

interface CheatSheetViewProps {
  initialKeyword?: string;
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({ initialKeyword = '' }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'labs' | 'pitfalls'>('tables');
  const [searchTerm, setSearchTerm] = useState<string>(initialKeyword);

  const filterItems = (items: CheatItem[]) => {
    if (!searchTerm.trim()) return items;
    const s = searchTerm.toLowerCase();
    return items.filter(
      it =>
        it.title.toLowerCase().includes(s) ||
        it.content.toLowerCase().includes(s) ||
        it.badge.toLowerCase().includes(s) ||
        it.category.toLowerCase().includes(s)
    );
  };

  const currentItems =
    activeTab === 'tables'
      ? filterItems(COMPARISON_TABLES)
      : activeTab === 'labs'
      ? filterItems(CLI_LABS)
      : filterItems(COMMON_PITFALLS);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <FileText className="h-4 w-4" />
              <span>CCNA 200-301 必考重點記憶庫</span>
            </div>
            <h2 className="text-xl font-bold text-white">考點速查對照與避坑卡</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋考點、指令或關鍵字..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>核心觀念對照表</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'labs'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>必備 IOS 指令與實作 Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('pitfalls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pitfalls'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>考場經典高頻避坑陷阱</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentItems.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-sky-400">
                {item.category}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {item.badge}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 mb-2">{item.title}</h3>

            <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3 text-xs leading-relaxed text-slate-300 whitespace-pre-line font-mono">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
