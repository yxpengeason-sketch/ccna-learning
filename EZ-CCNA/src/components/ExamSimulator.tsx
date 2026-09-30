import React, { useState, useEffect, useRef } from 'react';
import { Question, RuntimeQuestion, ExamConfig, ExamResult, WrongBookStore } from '../types';
import { MODULE_META } from '../data/ccnaData';
import {
  drawRandomExam,
  isMultiSelect,
  getOptionLetter,
  formatOptionsText,
  detectConcept,
  recordWrong,
  resolveWrong
} from '../utils/quizUtils';
import {
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  AlertTriangle,
  Send,
  Pause,
  Play
} from 'lucide-react';

interface ExamSimulatorProps {
  allQuestions: Question[];
  wrongbook: WrongBookStore;
  onUpdateWrongbook: () => void;
  onGoToWrongbook: () => void;
  onGoToRadar: () => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  allQuestions,
  wrongbook,
  onUpdateWrongbook,
  onGoToWrongbook
}) => {
  // Config state
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [strategy, setStrategy] = useState<ExamConfig['strategy']>('weighted');
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [examStyle, setExamStyle] = useState<ExamConfig['style']>('simulation');
  const [timed, setTimed] = useState<boolean>(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);

  // Active exam session state
  const [examActive, setExamActive] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<RuntimeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number[]>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<number, boolean>>({});

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showNavigatorDrawer, setShowNavigatorDrawer] = useState<boolean>(false);

  // Result state
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'flagged'>('all');

  // Update default time limit when question count changes
  useEffect(() => {
    setTimeLimitMinutes(Math.max(10, Math.round(questionCount * 1.5)));
  }, [questionCount]);

  // Timer effect
  useEffect(() => {
    if (!examActive || isPaused || !timed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examActive, isPaused, timed]);

  const handleStartExam = () => {
    const config: ExamConfig = {
      questionCount,
      strategy,
      selectedModule,
      style: examStyle,
      timed,
      timeLimitMinutes
    };

    const drawn = drawRandomExam(allQuestions, config, wrongbook);
    if (!drawn.length) {
      alert('無符合條件之題庫，請調整抽題設定！');
      return;
    }

    setExamQuestions(drawn);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIndices(new Set());
    setPracticeSubmitted({});
    setRemainingSeconds(timeLimitMinutes * 60);
    setTimeSpentSeconds(0);
    setIsPaused(false);
    setExamResult(null);
    setExamActive(true);
  };

  const handleOptionClick = (optIdx: number) => {
    const currentQ = examQuestions[currentIndex];
    if (!currentQ) return;

    if (examStyle === 'practice' && practiceSubmitted[currentIndex]) {
      return; // already finalized in practice mode
    }

    const currentPicks = userAnswers[currentIndex] || [];

    if (!currentQ.isMulti) {
      // Single choice
      setUserAnswers({
        ...userAnswers,
        [currentIndex]: [optIdx]
      });

      // In practice mode, evaluate instantly
      if (examStyle === 'practice') {
        setPracticeSubmitted(prev => ({ ...prev, [currentIndex]: true }));
        const isCorrect = optIdx === currentQ.a;
        if (isCorrect) {
          resolveWrong(currentQ.raw);
        } else {
          recordWrong(currentQ, optIdx);
        }
        onUpdateWrongbook();
      }
    } else {
      // Multiple choice toggle
      let nextPicks: number[];
      if (currentPicks.includes(optIdx)) {
        nextPicks = currentPicks.filter(i => i !== optIdx);
      } else {
        if (currentPicks.length < currentQ.requiredCount) {
          nextPicks = [...currentPicks, optIdx].sort((a, b) => a - b);
        } else {
          nextPicks = currentPicks;
        }
      }
      setUserAnswers({
        ...userAnswers,
        [currentIndex]: nextPicks
      });
    }
  };

  const handlePracticeMultiSubmit = () => {
    const currentQ = examQuestions[currentIndex];
    const picks = userAnswers[currentIndex] || [];
    if (!currentQ || picks.length !== currentQ.requiredCount) return;

    setPracticeSubmitted(prev => ({ ...prev, [currentIndex]: true }));
    const correctSorted = (currentQ.a as number[]).slice().sort((a, b) => a - b);
    const userSorted = picks.slice().sort((a, b) => a - b);
    const isCorrect =
      correctSorted.length === userSorted.length &&
      correctSorted.every((v, i) => v === userSorted[i]);

    if (isCorrect) {
      resolveWrong(currentQ.raw);
    } else {
      recordWrong(currentQ, picks);
    }
    onUpdateWrongbook();
  };

  const handleToggleFlag = () => {
    setFlaggedIndices(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleAutoSubmit = () => {
    calculateAndShowResult();
  };

  const calculateAndShowResult = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const moduleStats: Record<number, { total: number; correct: number }> = {
      0: { total: 0, correct: 0 },
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
      4: { total: 0, correct: 0 },
      5: { total: 0, correct: 0 }
    };

    examQuestions.forEach((q, idx) => {
      const picks = userAnswers[idx] || [];
      const isMulti = q.isMulti;
      let isCorrect = false;

      if (isMulti) {
        const correctPicks = (q.a as number[]).slice().sort((a, b) => a - b);
        const userSorted = picks.slice().sort((a, b) => a - b);
        isCorrect =
          correctPicks.length === userSorted.length &&
          correctPicks.every((val, i) => val === userSorted[i]);
      } else {
        isCorrect = picks.length === 1 && picks[0] === q.a;
      }

      if (isCorrect) {
        correctCount++;
        resolveWrong(q.raw);
      } else {
        // Record into wrongbook if in simulation mode
        if (examStyle === 'simulation') {
          recordWrong(q, picks.length === 1 ? picks[0] : picks);
        }
      }

      if (moduleStats[q.m]) {
        moduleStats[q.m].total++;
        if (isCorrect) moduleStats[q.m].correct++;
      }
    });

    onUpdateWrongbook();

    const total = examQuestions.length;
    const pct = total > 0 ? correctCount / total : 0;
    // CCNA Score: 300 base score + 700 * accuracy = 1000 scale
    const score = Math.round(300 + 700 * pct);
    const isPass = score >= 825; // standard CCNA pass score

    const result: ExamResult = {
      totalQuestions: total,
      correctCount,
      score,
      isPass,
      timeSpentSeconds,
      moduleStats,
      questions: examQuestions,
      userAnswers,
      flaggedSet: Array.from(flaggedIndices),
      date: new Date().toLocaleString('zh-TW')
    };

    setExamResult(result);
    setExamActive(false);
    setShowSubmitModal(false);
  };

  // Format time display
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Re-quiz with only wrong questions from this exam
  const handleRequizWrongFromExam = () => {
    if (!examResult) return;
    const wrongQs = examResult.questions.filter((q, idx) => {
      const picks = examResult.userAnswers[idx] || [];
      if (q.isMulti) {
        const correctPicks = (q.a as number[]).slice().sort((a, b) => a - b);
        const userSorted = picks.slice().sort((a, b) => a - b);
        return !(
          correctPicks.length === userSorted.length &&
          correctPicks.every((v, i) => v === userSorted[i])
        );
      } else {
        return !(picks.length === 1 && picks[0] === q.a);
      }
    });

    if (!wrongQs.length) {
      alert('太強了！本次測驗沒有任何錯題！🎉');
      return;
    }

    setExamQuestions(wrongQs);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIndices(new Set());
    setPracticeSubmitted({});
    setRemainingSeconds(Math.max(5, wrongQs.length * 90));
    setTimeSpentSeconds(0);
    setIsPaused(false);
    setExamResult(null);
    setExamActive(true);
  };

  /* ================= RENDER 1: POST-EXAM REPORT ================= */
  if (examResult) {
    const accuracy = Math.round((examResult.correctCount / examResult.totalQuestions) * 100);
    const wrongQuestionsCount = examResult.totalQuestions - examResult.correctCount;

    const filteredReviewQuestions = examResult.questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => {
        if (reviewFilter === 'flagged') return examResult.flaggedSet.includes(idx);
        if (reviewFilter === 'wrong') {
          const picks = examResult.userAnswers[idx] || [];
          if (q.isMulti) {
            const correctPicks = (q.a as number[]).slice().sort((a, b) => a - b);
            const userSorted = picks.slice().sort((a, b) => a - b);
            return !(
              correctPicks.length === userSorted.length &&
              correctPicks.every((v, i) => v === userSorted[i])
            );
          } else {
            return !(picks.length === 1 && picks[0] === q.a);
          }
        }
        return true;
      });

    return (
      <div className="space-y-6">
        {/* Scorecard Hero */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${
                examResult.isPass
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              }`}
            >
              <Award className="h-8 w-8" />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <span>CCNA 200-301 認證全真模擬結算</span>
              <span>·</span>
              <span>及格標準 825 分 (滿分 1000)</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              成績：
              <span
                className={`font-mono text-4xl tabular-nums ${
                  examResult.isPass ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {examResult.score}
              </span>
              <span className="text-xl text-slate-400 font-normal"> / 1000</span>
            </h2>

            <div className="mb-4">
              {examResult.isPass ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4" />
                  PASS · 恭喜達到 CCNA 模擬認證通過標準！
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <XCircle className="h-4 w-4" />
                  FAIL · 未達及格門檻（建議加強弱點考綱單元）
                </span>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-2 text-left">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">答對率</div>
                <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                  {accuracy}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {examResult.correctCount} / {examResult.totalQuestions} 題
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">作答耗時</div>
                <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                  {formatTime(examResult.timeSpentSeconds)}
                </div>
                <div className="text-[11px] text-slate-500">
                  平均每題 ~
                  {Math.round(examResult.timeSpentSeconds / examResult.totalQuestions)} 秒
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">待攻克錯題</div>
                <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                  {wrongQuestionsCount}
                </div>
                <div className="text-[11px] text-slate-500">已自動納入錯題本</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">複查標記題</div>
                <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                  {examResult.flaggedSet.length}
                </div>
                <div className="text-[11px] text-slate-500">作答中已標記</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {wrongQuestionsCount > 0 && (
                <button
                  onClick={handleRequizWrongFromExam}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-amber-500 hover:to-rose-500 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>立即針對本次錯題重新衝刺 ({wrongQuestionsCount} 題)</span>
                </button>
              )}

              <button
                onClick={() => setExamResult(null)}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-sky-500 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>重新隨機抽題測驗</span>
              </button>

              <button
                onClick={onGoToWrongbook}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <span>前往錯題本</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6 Modules Domain Performance Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span>官方考綱 6 大模組得分率診斷</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODULE_META.map(m => {
              const stat = examResult.moduleStats[m.id] || { total: 0, correct: 0 };
              const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100;
              const isLow = stat.total > 0 && rate < 75;

              return (
                <div
                  key={m.id}
                  className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300 truncate">{m.name}</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        stat.total === 0
                          ? 'text-slate-500'
                          : isLow
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {stat.total === 0 ? '無題' : `${rate}% (${stat.correct}/${stat.total})`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        stat.total === 0
                          ? 'bg-slate-700'
                          : isLow
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stat.total === 0 ? 0 : rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Review Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100">逐題覆盤與官方詳解</h3>
              <p className="text-xs text-slate-400">
                點擊檢視各題目答題情況、選項比對與考點解析
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  reviewFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                全部 ({examResult.totalQuestions})
              </button>
              <button
                onClick={() => setReviewFilter('wrong')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  reviewFilter === 'wrong'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                僅看錯題 ({wrongQuestionsCount})
              </button>
              <button
                onClick={() => setReviewFilter('flagged')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  reviewFilter === 'flagged'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                僅看標記題 ({examResult.flaggedSet.length})
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {filteredReviewQuestions.map(({ q, idx }) => {
              const picks = examResult.userAnswers[idx] || [];
              const isMulti = q.isMulti;
              let isCorrect = false;

              if (isMulti) {
                const correctPicks = (q.a as number[]).slice().sort((a, b) => a - b);
                const userSorted = picks.slice().sort((a, b) => a - b);
                isCorrect =
                  correctPicks.length === userSorted.length &&
                  correctPicks.every((val, i) => val === userSorted[i]);
              } else {
                isCorrect = picks.length === 1 && picks[0] === q.a;
              }

              const isFlagged = examResult.flaggedSet.includes(idx);
              const concept = detectConcept(q, q.m);

              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 transition-all ${
                    isCorrect
                      ? 'border-emerald-500/20 bg-slate-950/70'
                      : 'border-rose-500/30 bg-rose-950/10'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        Q{idx + 1}.
                      </span>
                      <span className="text-xs text-sky-400 font-medium">
                        {MODULE_META[q.m]?.name || '考綱'}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">
                        {isMulti ? `複選題 (應選 ${q.requiredCount} 項)` : '單選題'}
                      </span>
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          <Flag className="h-3 w-3" /> 已標記複查
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> 答對
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                          <XCircle className="h-4 w-4" /> 答錯
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-medium text-slate-200 leading-relaxed mb-3">
                    {q.q}
                  </p>

                  {/* Options List */}
                  <div className="space-y-1.5 mb-3">
                    {q.o.map((optText, optIdx) => {
                      const isOptionAnswer = isMulti
                        ? (q.a as number[]).includes(optIdx)
                        : optIdx === q.a;
                      const isOptionPicked = picks.includes(optIdx);

                      let borderClass = 'border-slate-800 bg-slate-900/50 text-slate-300';
                      if (isOptionAnswer) {
                        borderClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
                      } else if (isOptionPicked && !isOptionAnswer) {
                        borderClass = 'border-rose-500/50 bg-rose-500/10 text-rose-200';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs leading-normal ${borderClass}`}
                        >
                          <span className="font-mono font-bold shrink-0">
                            {getOptionLetter(optIdx)}.
                          </span>
                          <span className="flex-1">{optText}</span>
                          {isOptionAnswer && (
                            <span className="text-[11px] font-semibold text-emerald-400 shrink-0">
                              ✓ 正解
                            </span>
                          )}
                          {isOptionPicked && !isOptionAnswer && (
                            <span className="text-[11px] font-semibold text-rose-400 shrink-0">
                              ✗ 你的選取
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs leading-relaxed text-slate-300">
                    <div className="flex items-center justify-between text-slate-400 font-semibold mb-1 text-[11px]">
                      <span>考點歸屬：{concept}</span>
                      <span>
                        正確解答：{formatOptionsText(q, q.a)}
                      </span>
                    </div>
                    <div className="text-slate-300">{q.e}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDER 2: EXAM IN PROGRESS ================= */
  if (examActive && examQuestions.length > 0) {
    const currentQ = examQuestions[currentIndex];
    const userPicks = userAnswers[currentIndex] || [];
    const isCurrentFlagged = flaggedIndices.has(currentIndex);
    const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[Number(k)] || []).length > 0).length;
    const isPracticeDone = examStyle === 'practice' && practiceSubmitted[currentIndex];

    return (
      <div className="space-y-4">
        {/* Exam Header Controller */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg sticky top-16 z-30 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">
                題目進度：
                <span className="font-mono text-sm text-sky-400 font-bold tabular-nums">
                  {currentIndex + 1}
                </span>
                <span className="text-slate-500"> / {examQuestions.length}</span>
              </span>

              <span className="text-xs text-slate-500">·</span>

              <span className="text-xs text-slate-400">
                已答：
                <span className="font-mono text-slate-200 tabular-nums font-semibold">
                  {answeredCount}
                </span>
                <span className="text-slate-500">
                  {' '}(剩餘 {examQuestions.length - answeredCount})
                </span>
              </span>

              {flaggedIndices.size > 0 && (
                <>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Flag className="h-3.5 w-3.5" /> {flaggedIndices.size} 題已標記
                  </span>
                </>
              )}
            </div>

            {/* Timer and Controls */}
            <div className="flex items-center gap-2">
              {timed && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-sm font-bold tabular-nums ${
                    remainingSeconds < 300
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-sky-400'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(remainingSeconds)}</span>
                </div>
              )}

              {timed && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? '繼續計時' : '暫停計時'}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              )}

              <button
                onClick={() => setShowNavigatorDrawer(!showNavigatorDrawer)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ListOrdered className="h-4 w-4" />
                <span>題號矩陣</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>交卷結算</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Navigator Drawer */}
          {showNavigatorDrawer && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>點擊題號快速跳轉：</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-slate-800" /> 未作答
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-sky-500" /> 已作答
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> 已標記
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-1.5 max-h-48 overflow-y-auto p-1">
                {examQuestions.map((_, idx) => {
                  const isAnswered = (userAnswers[idx] || []).length > 0;
                  const isFlag = flaggedIndices.has(idx);
                  const isCur = idx === currentIndex;

                  let bgClass = 'bg-slate-950 text-slate-400 border-slate-800';
                  if (isAnswered) bgClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  if (isFlag) bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
                  if (isCur) bgClass += ' ring-2 ring-sky-400 font-bold';

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowNavigatorDrawer(false);
                      }}
                      className={`h-8 rounded text-xs font-mono border transition-all cursor-pointer ${bgClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Question Body Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          {/* Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                {MODULE_META[currentQ.m]?.name || `Module ${currentQ.m}`}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  currentQ.isMulti
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {currentQ.isMulti ? `複選題 (需選擇 ${currentQ.requiredCount} 項)` : '單選題'}
              </span>
            </div>

            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCurrentFlagged
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{isCurrentFlagged ? '已標記複查' : '標記此題 (Flag)'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed mb-6">
            <span className="font-mono text-sky-400 mr-2">Q{currentIndex + 1}.</span>
            {currentQ.q}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.o.map((optText, optIdx) => {
              const isSelected = userPicks.includes(optIdx);

              // In practice mode after answer, reveal colors
              let optionStyle = 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-200';

              if (examStyle === 'practice' && isPracticeDone) {
                const isCorrectAns = currentQ.isMulti
                  ? (currentQ.a as number[]).includes(optIdx)
                  : optIdx === currentQ.a;

                if (isCorrectAns) {
                  optionStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200';
                } else if (isSelected && !isCorrectAns) {
                  optionStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-200';
                } else {
                  optionStyle = 'border-slate-800/80 bg-slate-950/40 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'border-sky-500 bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/40';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleOptionClick(optIdx)}
                  disabled={examStyle === 'practice' && isPracticeDone}
                  className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left text-sm leading-relaxed transition-all cursor-pointer ${optionStyle}`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {getOptionLetter(optIdx)}
                  </div>
                  <div className="flex-1 pt-0.5">{optText}</div>
                </button>
              );
            })}
          </div>

          {/* Practice mode multi-select submit button */}
          {examStyle === 'practice' && currentQ.isMulti && !isPracticeDone && (
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={handlePracticeMultiSubmit}
                disabled={userPicks.length !== currentQ.requiredCount}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer ${
                  userPicks.length === currentQ.requiredCount
                    ? 'bg-sky-600 hover:bg-sky-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                確認送出 (已選 {userPicks.length}/{currentQ.requiredCount} 項)
              </button>
            </div>
          )}

          {/* Practice Mode Explanation Box */}
          {examStyle === 'practice' && isPracticeDone && (
            <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs leading-relaxed">
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                {(currentQ.isMulti
                  ? (currentQ.a as number[]).slice().sort().join('') === userPicks.slice().sort().join('')
                  : userPicks[0] === currentQ.a) ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> 答對了！
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> 答錯了！正解為：{formatOptionsText(currentQ, currentQ.a)}
                  </span>
                )}
              </div>
              <div className="text-slate-300">{currentQ.e}</div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                currentIndex === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>上一題</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {examQuestions.length}
            </span>

            {currentIndex < examQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition-all cursor-pointer"
              >
                <span>下一題</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>完成作答，交卷結算</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400 mb-3">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-base font-bold text-white">確認提早交卷？</h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300 mb-5 leading-relaxed">
                <p>
                  本次考試共 <b>{examQuestions.length}</b> 題，你目前已作答{' '}
                  <b className="text-sky-400">{answeredCount}</b> 題。
                </p>
                {examQuestions.length - answeredCount > 0 && (
                  <p className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-rose-300">
                    ⚠️ 尚有 <b>{examQuestions.length - answeredCount}</b> 題未作答！未作答題目將視同錯誤計算分數。
                  </p>
                )}
                {flaggedIndices.size > 0 && (
                  <p className="text-amber-300">
                    📌 尚有 <b>{flaggedIndices.size}</b> 題標記為待複查。
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  繼續作答
                </button>
                <button
                  onClick={calculateAndShowResult}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow"
                >
                  確認交卷評分
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= RENDER 3: EXAM SETUP / LAUNCHER ================= */
  const unresolvedWrongCount = Object.values(wrongbook).filter(v => !v.resolved).length;

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>CCNA 200-301 考試選擇題模擬考場</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            隨機抽考題系統
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            支援 Cisco 官方考綱權重配比抽題、隨機洗牌、考場倒數計時與防窺交卷機制。<br />
            考後即時產出 1000 分制成績單、模組能力診斷與全真逐題覆盤。<br />
            此單元僅為知識點測驗，還是記得要刷考古題喔！
          </p>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exam Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: Question Count */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-sm font-semibold text-slate-200 block mb-3">
              1. 抽題數量 (Question Count)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { count: 10, label: '10 題', desc: '快速速測 (~15m)' },
                { count: 20, label: '20 題', desc: '標準測驗 (~30m)' },
                { count: 30, label: '30 題', desc: '單元衝刺 (~45m)' },
                { count: 50, label: '50 題', desc: '半程模擬 (~75m)' }
              ].map(item => (
                <button
                  key={item.count}
                  onClick={() => setQuestionCount(item.count)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    questionCount === item.count
                      ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono text-base font-bold">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>自訂題數：</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max={Math.min(60, allQuestions.length)}
                  step="5"
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-36 accent-sky-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-sky-400 tabular-nums">
                  {questionCount} 題
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Drawing Strategy */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-sm font-semibold text-slate-200 block mb-3">
              2. 抽題策略 (Drawing Strategy)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStrategy('weighted')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  strategy === 'weighted'
                    ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>⚖️ 官方考綱權重加權抽題</span>
                </div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  依 CCNA 200-301 官方領域比例精準抽題（20% 網路基礎、20% 網路存取、25% IP 路由連接性、10% IP 服務、15% 安全基礎、10% 自動化），進行抽題。
                </div>
              </button>

              <button
                onClick={() => setStrategy('uniform')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  strategy === 'uniform'
                    ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>🎲 全題庫無偏隨機洗牌</span>
                </div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  將整個題庫所有題目混洗後隨機抽取，不限領域分布，全面檢驗盲點。
                </div>
              </button>

              <button
                onClick={() => setStrategy('weakness')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  strategy === 'weakness'
                    ? 'border-rose-500 bg-rose-500/15 text-white ring-1 ring-rose-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>🚨 錯題弱點優先衝刺</span>
                  {unresolvedWrongCount > 0 && (
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded">
                      {unresolvedWrongCount} 題未克服
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  優先從錯題本中抽取尚未克服的題目，不足額時再隨機補充其他題庫。
                </div>
              </button>

              <button
                onClick={() => setStrategy('module')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  strategy === 'module'
                    ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>🎯 指定模組單元抽題</span>
                </div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  針對 6 大模組中的特定單元進行專項抽題測試。
                </div>
              </button>
            </div>

            {/* Sub-selection for module strategy */}
            {strategy === 'module' && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  選擇目標模組：
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODULE_META.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModule(m.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                        selectedModule === m.id
                          ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Exam Style & Timer */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-sm font-semibold text-slate-200 block mb-3">
              3. 考試環境與模式 (Exam Environment)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setExamStyle('simulation')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  examStyle === 'simulation'
                    ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-sm">⏱️ 全真考場模式 (Strict Simulation)</div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  全程不洩漏答案或詳解，支援標記複查、任意題目跳轉、考後統一結算 1000 分成績單。
                </div>
              </button>

              <button
                onClick={() => setExamStyle('practice')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  examStyle === 'practice'
                    ? 'border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-sm">⚡ 即時解析練習模式 (Practice Mode)</div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  每題點選後立即公佈正確答案與官方考綱解析，答錯即時納入錯題本，適合每日刷題。
                </div>
              </button>
            </div>

            {/* Timer Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">倒數計時器 (Timer)</div>
                <div className="text-[11px] text-slate-400">
                  {timed
                    ? `已啟用：限時 ${timeLimitMinutes} 分鐘（平均每題 ${(timeLimitMinutes / questionCount).toFixed(1)} 分鐘）`
                    : '已關閉計時'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimed(!timed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    timed
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {timed ? '計時開啟' : '無限制時間'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Launch Summary & Official Specs */}
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-sky-400" />
              <span>測驗規格預覽</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">目標抽題：</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {questionCount} 題
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">抽題策略：</span>
                <span className="font-semibold text-sky-400">
                  {strategy === 'weighted'
                    ? '考綱比例加權 (20/20/25/10/15/10)'
                    : strategy === 'uniform'
                    ? '全題庫均勻隨機'
                    : strategy === 'weakness'
                    ? '錯題弱點優先'
                    : `指定 Module ${selectedModule}`}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">測驗模式：</span>
                <span className="font-semibold text-slate-200">
                  {examStyle === 'simulation' ? '全真考場 (考後交卷)' : '即時練習 (答完看解析)'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">考試時間：</span>
                <span className="font-mono text-slate-200 tabular-nums font-semibold">
                  {timed ? `${timeLimitMinutes} 分鐘` : '不限時間'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">及格門檻：</span>
                <span className="font-mono font-bold text-emerald-400">825 / 1000 (82.5%)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">防死記機制：</span>
                <span className="font-semibold text-amber-300">題目與選項雙層洗牌</span>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:from-sky-500 hover:to-cyan-400 transition-all cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              <span>開始隨機抽題考試 🚀</span>
            </button>
          </div>

          {/* Quick Notice */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-400 leading-relaxed">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
              <span>真實考場建議</span>
            </div>
            CCNA 200-301 真時考試總題數通常為 80 到 100 題（限時 120 分鐘 + 非英語母語加時 30 分鐘），其實時間相當足夠。平時建議以約 20 題隨機抽題維持每日手感；考前一週建議以 50 題以上考古題計時模擬以適應考場壓力。考試當週刷錯題回顧錯誤概念。
          </div>
        </div>
      </div>
    </div>
  );
};
