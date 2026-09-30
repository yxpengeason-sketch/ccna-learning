import React, { useState, useEffect } from 'react';
import { Question, RuntimeQuestion, WrongBookStore } from '../types';
import { MODULE_META } from '../data/ccnaData';
import {
  prepareRuntimeQuestion,
  shuffleArray,
  getOptionLetter,
  formatOptionsText,
  recordWrong,
  resolveWrong,
  getUnresolvedWrongQuizList
} from '../utils/quizUtils';
import { CheckCircle2, XCircle, RotateCcw, Filter, BookOpen } from 'lucide-react';

interface QuizDrillProps {
  allQuestions: Question[];
  wrongbook: WrongBookStore;
  onUpdateWrongbook: () => void;
  initialMode?: string | number;
}

export const QuizDrill: React.FC<QuizDrillProps> = ({
  allQuestions,
  wrongbook,
  onUpdateWrongbook,
  initialMode = 'all'
}) => {
  const [filterMode, setFilterMode] = useState<string | number>(initialMode);
  const [runtimeQuestions, setRuntimeQuestions] = useState<RuntimeQuestion[]>([]);
  const [userPicks, setUserPicks] = useState<Record<number, number[]>>({});
  const [submittedCards, setSubmittedCards] = useState<Record<number, boolean>>({});
  const [multiDraftPicks, setMultiDraftPicks] = useState<Record<number, number[]>>({});

  const unresolvedCount = getUnresolvedWrongQuizList(allQuestions).length;

  const initQuiz = (mode: string | number) => {
    setFilterMode(mode);
    let pool: Question[] = [];

    if (mode === 'wrongbook') {
      pool = getUnresolvedWrongQuizList(allQuestions);
    } else if (mode === 'all') {
      pool = allQuestions;
    } else {
      pool = allQuestions.filter(q => q.m === mode);
    }

    const shuffled = shuffleArray(pool);
    const prepared = shuffled.map(prepareRuntimeQuestion);

    setRuntimeQuestions(prepared);
    setUserPicks({});
    setSubmittedCards({});
    setMultiDraftPicks({});
  };

  useEffect(() => {
    initQuiz(filterMode);
  }, []);

  const handleSelectSingle = (qIdx: number, optIdx: number) => {
    if (submittedCards[qIdx]) return;
    const q = runtimeQuestions[qIdx];
    if (!q) return;

    setUserPicks(prev => ({ ...prev, [qIdx]: [optIdx] }));
    setSubmittedCards(prev => ({ ...prev, [qIdx]: true }));

    const isCorrect = optIdx === q.a;
    if (isCorrect) {
      resolveWrong(q.raw);
    } else {
      recordWrong(q, optIdx);
    }
    onUpdateWrongbook();
  };

  const handleToggleMulti = (qIdx: number, optIdx: number) => {
    if (submittedCards[qIdx]) return;
    const q = runtimeQuestions[qIdx];
    if (!q) return;

    const draft = multiDraftPicks[qIdx] || [];
    let nextDraft: number[];

    if (draft.includes(optIdx)) {
      nextDraft = draft.filter(x => x !== optIdx);
    } else {
      if (draft.length < q.requiredCount) {
        nextDraft = [...draft, optIdx].sort((a, b) => a - b);
      } else {
        nextDraft = draft;
      }
    }
    setMultiDraftPicks(prev => ({ ...prev, [qIdx]: nextDraft }));
  };

  const handleSubmitMulti = (qIdx: number) => {
    if (submittedCards[qIdx]) return;
    const q = runtimeQuestions[qIdx];
    const draft = multiDraftPicks[qIdx] || [];
    if (!q || draft.length !== q.requiredCount) return;

    setUserPicks(prev => ({ ...prev, [qIdx]: draft }));
    setSubmittedCards(prev => ({ ...prev, [qIdx]: true }));

    const correctSorted = (q.a as number[]).slice().sort((a, b) => a - b);
    const userSorted = draft.slice().sort((a, b) => a - b);
    const isCorrect =
      correctSorted.length === userSorted.length &&
      correctSorted.every((v, i) => v === userSorted[i]);

    if (isCorrect) {
      resolveWrong(q.raw);
    } else {
      recordWrong(q, draft);
    }
    onUpdateWrongbook();
  };

  // Metrics
  const answeredTotal = Object.keys(submittedCards).length;
  let correctTotal = 0;
  runtimeQuestions.forEach((q, idx) => {
    if (submittedCards[idx]) {
      const picks = userPicks[idx] || [];
      if (q.isMulti) {
        const correctPicks = (q.a as number[]).slice().sort((a, b) => a - b);
        const userSorted = picks.slice().sort((a, b) => a - b);
        if (
          correctPicks.length === userSorted.length &&
          correctPicks.every((v, i) => v === userSorted[i])
        ) {
          correctTotal++;
        }
      } else {
        if (picks.length === 1 && picks[0] === q.a) {
          correctTotal++;
        }
      }
    }
  });

  const accuracy = answeredTotal > 0 ? Math.round((correctTotal / answeredTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="h-4 w-4 text-sky-400" />
            <span>選擇練習題庫範圍：</span>
          </div>

          <button
            onClick={() => initQuiz(filterMode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重新隨機洗牌</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => initQuiz('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-sky-500 text-white font-semibold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📚 全題庫 ({allQuestions.length})
          </button>

          {MODULE_META.map(m => (
            <button
              key={m.id}
              onClick={() => initQuiz(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterMode === m.id
                  ? 'bg-sky-500 text-white font-semibold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m.fullName}
            </button>
          ))}

          <button
            onClick={() => initQuiz('wrongbook')}
            disabled={unresolvedCount === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'wrongbook'
                ? 'bg-rose-600 text-white font-semibold shadow'
                : unresolvedCount === 0
                ? 'opacity-40 border border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            📕 錯題專項重練 ({unresolvedCount})
          </button>
        </div>
      </div>

      {/* Score Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-xs text-slate-400">總題數</div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {runtimeQuestions.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-xs text-slate-400">已作答</div>
          <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
            {answeredTotal}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-xs text-slate-400">答對題數</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {correctTotal}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-xs text-slate-400">當前正確率</div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {answeredTotal > 0 ? `${accuracy}%` : '—'}
          </div>
        </div>
      </div>

      {/* Zero State */}
      {runtimeQuestions.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">
            太棒了！目前沒有待克服的錯題！
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            你的錯題本目前無未攻克項目。請切換回全真題庫測驗或發起隨機抽題考試。
          </p>
          <button
            onClick={() => initQuiz('all')}
            className="px-4 py-2 rounded-lg bg-sky-600 text-xs font-semibold text-white hover:bg-sky-500 cursor-pointer"
          >
            返回全題庫測驗
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {runtimeQuestions.map((q, qIdx) => {
          const isDone = submittedCards[qIdx];
          const picks = userPicks[qIdx] || [];
          const draft = multiDraftPicks[qIdx] || [];

          return (
            <div
              key={qIdx}
              className={`rounded-xl border p-5 transition-all shadow-md ${
                isDone
                  ? (q.isMulti
                      ? (q.a as number[]).slice().sort().join('') === picks.slice().sort().join('')
                      : picks[0] === q.a)
                    ? 'border-emerald-500/25 bg-slate-900/80'
                    : 'border-rose-500/30 bg-slate-900/80'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    Q{qIdx + 1}.
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                    {MODULE_META[q.m]?.name || '考綱'}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400">
                    {q.isMulti ? `複選題 (需選擇 ${q.requiredCount} 項)` : '單選題'}
                  </span>
                </div>

                {isDone && (
                  <div>
                    {(q.isMulti
                      ? (q.a as number[]).slice().sort().join('') === picks.slice().sort().join('')
                      : picks[0] === q.a) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> 答對了
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                        <XCircle className="h-4 w-4" /> 答錯了
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-200 leading-relaxed mb-4">
                {q.q}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.o.map((optText, optIdx) => {
                  const isAnswer = q.isMulti
                    ? (q.a as number[]).includes(optIdx)
                    : optIdx === q.a;
                  const isPicked = picks.includes(optIdx);
                  const isDraft = draft.includes(optIdx);

                  let optClass = 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300';

                  if (isDone) {
                    if (isAnswer) {
                      optClass = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
                    } else if (isPicked && !isAnswer) {
                      optClass = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
                    } else {
                      optClass = 'border-slate-800/80 bg-slate-950/40 text-slate-500';
                    }
                  } else if (q.isMulti && isDraft) {
                    optClass = 'border-sky-500 bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/40';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isDone}
                      onClick={() =>
                        q.isMulti ? handleToggleMulti(qIdx, optIdx) : handleSelectSingle(qIdx, optIdx)
                      }
                      className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left text-xs leading-normal transition-all cursor-pointer ${optClass}`}
                    >
                      <div className="font-mono font-bold shrink-0 pt-0.5">
                        {getOptionLetter(optIdx)}.
                      </div>
                      <div className="flex-1">{optText}</div>
                    </button>
                  );
                })}
              </div>

              {/* Multi-Select Submit Button */}
              {q.isMulti && !isDone && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleSubmitMulti(qIdx)}
                    disabled={draft.length !== q.requiredCount}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer ${
                      draft.length === q.requiredCount
                        ? 'bg-sky-600 hover:bg-sky-500'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    ✔ 確認送出 ({draft.length}/{q.requiredCount})
                  </button>
                </div>
              )}

              {/* Explanation Box */}
              {isDone && (
                <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 p-3.5 text-xs leading-relaxed">
                  <div className="font-semibold text-slate-400 mb-1">
                    正確解答：{formatOptionsText(q, q.a)}
                  </div>
                  <div className="text-slate-300">{q.e}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
