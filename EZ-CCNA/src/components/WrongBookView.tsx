import React, { useState } from 'react';
import { WrongBookStore } from '../types';
import { MODULE_META } from '../data/ccnaData';
import { clearWrongBookStorage } from '../utils/quizUtils';
import { BookmarkCheck, Trash2, Search, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface WrongBookViewProps {
  wrongbook: WrongBookStore;
  onUpdateWrongbook: () => void;
  onStartRequiz: () => void;
}

export const WrongBookView: React.FC<WrongBookViewProps> = ({
  wrongbook,
  onUpdateWrongbook,
  onStartRequiz
}) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [search, setSearch] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const entries = Object.entries(wrongbook);
  const totalCount = entries.length;
  const unresolvedCount = entries.filter(([, it]) => !it.resolved).length;
  const resolvedCount = totalCount - unresolvedCount;

  const filteredEntries = entries.filter(([, it]) => {
    if (filter === 'unresolved' && it.resolved) return false;
    if (filter === 'resolved' && !it.resolved) return false;
    if (search.trim()) {
      const qText = (it.q || '').toLowerCase();
      const expText = (it.e || '').toLowerCase();
      const s = search.toLowerCase();
      if (!qText.includes(s) && !expText.includes(s)) return false;
    }
    return true;
  });

  const handleClear = () => {
    clearWrongBookStorage();
    onUpdateWrongbook();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
              <BookmarkCheck className="h-4 w-4" />
              <span>錯題攻克與持久化管理</span>
            </div>
            <h2 className="text-xl font-bold text-white">智慧錯題本 (Wrongbook)</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onStartRequiz}
              disabled={unresolvedCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow transition-all cursor-pointer ${
                unresolvedCount > 0
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white hover:from-amber-500 hover:to-rose-500'
                  : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>錯題專項抽題重測 ({unresolvedCount} 題)</span>
            </button>

            {totalCount > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>清空</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全部 ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'unresolved'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              未攻克 ({unresolvedCount})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'resolved'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              已攻克 ({resolvedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋錯題關鍵字..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="text-base font-bold text-slate-200 mb-1">
            {totalCount === 0 ? '目前錯題本尚無任何紀錄！' : '無符合篩選條件的錯題'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {totalCount === 0
              ? '隨機抽題考試或題庫練習答錯時，系統會自動將錯題納入此處供精準複習。'
              : '可清除搜尋關鍵字或切換篩選標籤查看其他項目。'}
          </p>
        </div>
      )}

      {/* Wrong Items List */}
      <div className="space-y-4">
        {filteredEntries.map(([key, it]) => {
          const modName = MODULE_META[it.m]?.name || '考綱單元';

          return (
            <div
              key={key}
              className={`rounded-xl border p-5 transition-all shadow ${
                it.resolved
                  ? 'border-emerald-500/20 bg-slate-900/60 opacity-80'
                  : 'border-rose-500/30 bg-slate-900/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {modName}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400 font-mono">
                    累計答錯 {it.count} 次
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-500">最近作答：{it.last}</span>
                </div>

                <div>
                  {it.resolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> 已攻克
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                      待加強複習
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-200 leading-relaxed mb-3">
                {it.q}
              </p>

              {/* Comparison */}
              <div className="space-y-1.5 mb-3 text-xs">
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-rose-300">
                  <span className="font-semibold text-rose-400">✗ 你的作答：</span> {it.yourAns}
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-300">
                  <span className="font-semibold text-emerald-400">✓ 正確解答：</span> {it.correct}
                </div>
              </div>

              {/* Explanation */}
              <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3 text-xs leading-relaxed text-slate-400">
                <span className="font-semibold text-slate-300">💡 官方詳解速記：</span> {it.e}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">確定清空所有錯題？</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              此操作將清除全部 <b>{totalCount}</b> 筆錯題紀錄與歷史統計資料，確定要清空嗎？
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                確定清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
