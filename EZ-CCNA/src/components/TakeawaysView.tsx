import React, { useState } from 'react';
import { TAKEAWAYS_DATA } from '../data/takeawaysData';
import { Sparkles, Layers, RotateCcw } from 'lucide-react';

export const TakeawaysView: React.FC = () => {
  const [activeModuleIdx, setActiveModuleIdx] = useState<string | number>('all');
  const [flippedSet, setFlippedSet] = useState<Set<string>>(new Set());

  const toggleFlip = (cardKey: string) => {
    setFlippedSet(prev => {
      const next = new Set(prev);
      if (next.has(cardKey)) {
        next.delete(cardKey);
      } else {
        next.add(cardKey);
      }
      return next;
    });
  };

  const handleResetFlips = () => {
    setFlippedSet(new Set());
  };

  const totalCards = TAKEAWAYS_DATA.reduce((sum, m) => sum + m.cards.length, 0);

  const filteredModules =
    activeModuleIdx === 'all'
      ? TAKEAWAYS_DATA
      : [TAKEAWAYS_DATA[Number(activeModuleIdx)]].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>CCNA 6 大模組重點翻卡 (Key Takeaways)</span>
            </div>
            <h2 className="text-xl font-bold text-white">考點速記翻卡記憶庫</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              已翻看：<b className="font-mono text-sky-400 font-bold">{flippedSet.size}</b> / {totalCards} 張
            </span>
            <button
              onClick={handleResetFlips}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>重置卡片</span>
            </button>
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
            全部 ({totalCards})
          </button>

          {TAKEAWAYS_DATA.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModuleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeModuleIdx === idx
                  ? 'bg-sky-500 text-white font-semibold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {idx + 1}. {m.moduleName} ({m.cards.length})
            </button>
          ))}
        </div>
      </div>

      {/* Cards Sections */}
      <div className="space-y-8">
        {filteredModules.map((mGroup, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>{mGroup.moduleName}</span>
                <span className="text-xs px-2 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  權重 {mGroup.weight}
                </span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {mGroup.cards.length} 張卡片
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mGroup.cards.map((card, cIdx) => {
                const key = `${mGroup.moduleName}_${cIdx}`;
                const isFlipped = flippedSet.has(key);

                return (
                  <div
                    key={cIdx}
                    onClick={() => toggleFlip(key)}
                    className="min-h-[220px] rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-sky-500/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {!isFlipped ? (
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                            #{cIdx + 1}
                          </span>
                          <div className="mt-3 text-sm font-semibold text-slate-100 leading-relaxed">
                            {card.question}
                          </div>
                        </div>
                        <div className="text-[11px] text-sky-400/80 pt-3 border-t border-slate-800/80 text-center">
                          👆 點擊翻面查看考點速記
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between bg-emerald-950/20 -m-5 p-5 rounded-xl border border-emerald-500/30">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            #{cIdx + 1} 答案速解
                          </span>
                          <div
                            className="mt-3 text-xs leading-relaxed text-emerald-100/90"
                            dangerouslySetInnerHTML={{ __html: card.answer }}
                          />
                        </div>
                        <div className="text-[11px] text-emerald-400/80 pt-3 border-t border-emerald-500/20 text-center">
                          👆 點擊再次翻面
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
