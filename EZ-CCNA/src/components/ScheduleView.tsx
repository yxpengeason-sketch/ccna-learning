import React, { useState, useEffect, useMemo } from 'react';
import { SCHEDULE_DATA } from '../data/scheduleData';
import { TAKEAWAYS_DATA } from '../data/takeawaysData';
import {
  Calendar,
  RotateCcw,
  Target,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  CalendarDays,
  Columns,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  BookOpen,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

interface StageGroup {
  name: string;
  startDay: number;
  endDay: number;
  desc: string;
}

const STAGES: StageGroup[] = [
  { name: '打地基', startDay: 1, endDay: 7, desc: '網路架構、實體層、OSI/TCP模型與 IPv4/IPv6' },
  { name: '路由深潛', startDay: 8, endDay: 14, desc: 'OSPF 鄰居狀態、路由仲裁、ACL 與 NAT 實測' },
  { name: '存取層與安全', startDay: 15, endDay: 21, desc: 'STP 根橋選舉、EtherChannel、WLAN 與 L2 安全' },
  { name: '衝刺收尾', startDay: 22, endDay: 30, desc: 'IP 服務 (DHCP/QoS)、自動化 SDN、全真模考與考前總驗收' },
];

export const ScheduleView: React.FC = () => {
  // ── Local Storage States ──
  const [checkedDays, setCheckedDays] = useState<Record<number, boolean>>({});
  const [targetDate, setTargetDate] = useState<string>(() => {
    try {
      return localStorage.getItem('ccna-target-exam-date') || '';
    } catch {
      return '';
    }
  });

  // ── Collapsible States ──
  // Stage collapse state: record of stageName -> boolean (true = collapsed)
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  
  // Column collapse states (欄位收合)
  const [hideStageCol, setHideStageCol] = useState<boolean>(false);
  const [hideRatioCol, setHideRatioCol] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ccna-prog');
      if (saved) {
        setCheckedDays(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load schedule progress', e);
    }
  }, []);

  const toggleDay = (day: number) => {
    const next = { ...checkedDays, [day]: !checkedDays[day] };
    setCheckedDays(next);
    try {
      localStorage.setItem('ccna-prog', JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save schedule progress', e);
    }
  };

  const handleReset = () => {
    if (confirm('確定要重設 30 天複習進度嗎？')) {
      setCheckedDays({});
      localStorage.removeItem('ccna-prog');
    }
  };

  // ── Target Date Functions ──
  const handleSaveTargetDate = (newDate: string) => {
    setTargetDate(newDate);
    try {
      if (newDate) {
        localStorage.setItem('ccna-target-exam-date', newDate);
      } else {
        localStorage.removeItem('ccna-target-exam-date');
      }
    } catch (e) {
      console.warn('Failed to save target date', e);
    }
  };

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    handleSaveTargetDate(formatLocalDate(d));
  };

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  const daysRemaining = useMemo(() => {
    if (!targetDate) return null;
    const parts = targetDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }, [targetDate]);

  const recommendedStudyDay = useMemo(() => {
    if (daysRemaining === null) return null;
    if (daysRemaining <= 0) return 30;
    if (daysRemaining > 30) return 1;
    return 31 - daysRemaining;
  }, [daysRemaining]);

  // ── Random Concept Question Logic ──
  const allConceptCards = useMemo(() => {
    return TAKEAWAYS_DATA.flatMap((m, mIdx) =>
      m.cards.map((c, cIdx) => ({
        id: `${mIdx}-${cIdx}`,
        moduleName: m.moduleName,
        weight: m.weight,
        question: c.question,
        answer: c.answer
      }))
    );
  }, []);

  const [conceptIdx, setConceptIdx] = useState<number>(() => {
    const total = TAKEAWAYS_DATA.reduce((acc, m) => acc + m.cards.length, 0);
    return Math.floor(Math.random() * (total || 1));
  });
  const [showConceptAnswer, setShowConceptAnswer] = useState<boolean>(false);

  const handleNextConcept = () => {
    setShowConceptAnswer(false);
    setConceptIdx(prev => {
      if (allConceptCards.length <= 1) return 0;
      let next = Math.floor(Math.random() * allConceptCards.length);
      if (next === prev) {
        next = (next + 1) % allConceptCards.length;
      }
      return next;
    });
  };

  const currentConcept = allConceptCards[conceptIdx] || allConceptCards[0];

  // Overall progress
  const completedCount = Object.values(checkedDays).filter(Boolean).length;
  const progressPct = Math.round((completedCount / SCHEDULE_DATA.length) * 100);

  // ── Stage Collapsing ──
  const toggleStage = (stageName: string) => {
    setCollapsedStages(prev => ({
      ...prev,
      [stageName]: !prev[stageName]
    }));
  };

  const areAllStagesCollapsed = useMemo(() => {
    return STAGES.every(s => !!collapsedStages[s.name]);
  }, [collapsedStages]);

  const toggleAllStages = () => {
    if (areAllStagesCollapsed) {
      setCollapsedStages({});
    } else {
      const all: Record<string, boolean> = {};
      STAGES.forEach(s => {
        all[s.name] = true;
      });
      setCollapsedStages(all);
    }
  };

  return (
    <div className="space-y-6">
      {/* ══════════ TOP: 考試倒數提醒 & 概念理解隨機小問題 ══════════ */}
      <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
        {/* Row 1: 單純考試倒數提醒 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Clock className="h-4 w-4" />
              <span>考試倒數提醒</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {targetDate ? (
                  <span>
                    目標考期：<span className="font-mono text-sky-300">{targetDate}</span>
                  </span>
                ) : (
                  <span>自選目標考試日期</span>
                )}
              </h2>

              {daysRemaining !== null && (
                <div className="flex items-center gap-2">
                  {daysRemaining > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                      <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      倒數 <b className="font-mono text-sm text-white">{daysRemaining}</b> 天
                    </span>
                  ) : daysRemaining === 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      🎉 就是今天！考場加油！
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-300">
                      考期已過 {Math.abs(daysRemaining)} 天
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={targetDate}
              min={todayStr}
              onChange={e => handleSaveTargetDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono font-medium text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            />
            <button
              onClick={() => setPresetDays(14)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                daysRemaining === 14
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm font-semibold ring-1 ring-sky-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              14天
            </button>
            <button
              onClick={() => setPresetDays(30)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                daysRemaining === 30
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm font-semibold ring-1 ring-sky-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              30天
            </button>
            <button
              onClick={() => setPresetDays(60)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                daysRemaining === 60
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm font-semibold ring-1 ring-sky-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              60天
            </button>
            {targetDate && (
              <button
                onClick={() => handleSaveTargetDate('')}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="清除日期"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* Row 2: 隨機小問題詢問概念理解 */}
        {currentConcept && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>概念隨機小抽問</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
                  {currentConcept.moduleName}
                </span>
              </div>

              <button
                onClick={handleNextConcept}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>換一題抽問</span>
              </button>
            </div>

            {/* Question Stem */}
            <div className="text-sm font-semibold text-slate-100 leading-relaxed mb-3">
              ❓ {currentConcept.question}
            </div>

            {/* Toggle / Answer Box */}
            {!showConceptAnswer ? (
              <button
                onClick={() => setShowConceptAnswer(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-dashed border-slate-700 text-sky-400 hover:bg-slate-800 hover:border-sky-500 transition-all cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>思考完成，點擊揭曉概念理解解答</span>
              </button>
            ) : (
              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3.5 text-xs text-emerald-100/90 leading-relaxed space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 概念重點解析：
                  </span>
                  <button
                    onClick={() => setShowConceptAnswer(false)}
                    className="text-[11px] text-emerald-400/80 hover:text-emerald-300 cursor-pointer"
                  >
                    收合解答
                  </button>
                </div>
                <div
                  className="pt-1 text-slate-200"
                  dangerouslySetInnerHTML={{ __html: currentConcept.answer }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ PROGRESS & DASHBOARD HEADER ══════════ */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span>30 天全科衝刺配速表</span>
            </div>
            <h2 className="text-xl font-bold text-white">考前衝刺排程管理自評</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>重設進度</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">總體完成進度：</span>
            <span className="font-mono font-bold text-sky-400 tabular-nums">
              {completedCount} / {SCHEDULE_DATA.length} 天 ({progressPct}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ══════════ TABLE CONTROLS & COLLAPSIBLE SETTINGS ══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Stage Collapse Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAllStages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            {areAllStagesCollapsed ? (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-sky-400" />
                <span>展開所有階段</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-sky-400" />
                <span>收合所有階段</span>
              </>
            )}
          </button>

          <span className="text-xs text-slate-500 hidden sm:inline">
            （可點擊下方各階段標題單獨收合 / 展開）
          </span>
        </div>

        {/* Column Visibility Controls (欄位收合) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Columns className="h-3.5 w-3.5 text-slate-500" />
            <span>欄位收合：</span>
          </span>

          <button
            onClick={() => setHideStageCol(!hideStageCol)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
              hideStageCol
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="點擊收合或顯示「階段」欄位"
          >
            {hideStageCol ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>階段欄位 {hideStageCol ? '(已收合)' : ''}</span>
          </button>

          <button
            onClick={() => setHideRatioCol(!hideRatioCol)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
              hideRatioCol
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="點擊收合或顯示「理論 : 實作」欄位"
          >
            {hideRatioCol ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>理論:實作欄位 {hideRatioCol ? '(已收合)' : ''}</span>
          </button>
        </div>
      </div>

      {/* ══════════ MAIN SCHEDULE TABLE (With Stage Accordion & Collapsible Columns) ══════════ */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-semibold select-none">
                {/* Column 1: Day */}
                <th className="py-3 px-4 w-20">Day</th>

                {/* Column 2: 階段 */}
                {!hideStageCol && (
                  <th className="py-3 px-4 w-32 transition-all">
                    階段
                  </th>
                )}

                {/* Column 3: 核心複習重點 */}
                <th className="py-3 px-4">核心複習重點</th>

                {/* Column 4: 理論 : 實作 */}
                {!hideRatioCol && (
                  <th className="py-3 px-4 w-28 transition-all">
                    理論 : 實作
                  </th>
                )}

                {/* Column 5: 完成 */}
                <th className="py-3 px-4 w-16 text-center">完成</th>
              </tr>
            </thead>

            <tbody>
              {STAGES.map(stage => {
                const stageDays = SCHEDULE_DATA.filter(
                  d => d.day >= stage.startDay && d.day <= stage.endDay
                );
                const stageCompleted = stageDays.filter(d => !!checkedDays[d.day]).length;
                const stagePct = Math.round((stageCompleted / stageDays.length) * 100);
                const isCollapsed = !!collapsedStages[stage.name];

                return (
                  <React.Fragment key={stage.name}>
                    {/* Stage Group Header Row (Collapsible Click Target) */}
                    <tr
                      onClick={() => toggleStage(stage.name)}
                      className="bg-slate-950/90 border-t border-b border-slate-800/90 hover:bg-slate-800/60 transition-colors cursor-pointer select-none group"
                    >
                      <td
                        colSpan={5 - (hideStageCol ? 1 : 0) - (hideRatioCol ? 1 : 0)}
                        className="py-2.5 px-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="p-0.5 rounded text-sky-400 group-hover:text-sky-300 transition-colors">
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                            <span className="font-bold text-slate-100 text-xs tracking-wide">
                              {stage.name} (Day {stage.startDay} ~ Day {stage.endDay})
                            </span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              · {stage.desc}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-slate-400">
                              {stageCompleted} / {stageDays.length} 天完成 ({stagePct}%)
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Stage Days Rows (Hidden if Collapsed) */}
                    {!isCollapsed &&
                      stageDays.map(item => {
                        const isChecked = !!checkedDays[item.day];
                        const isTodayRecommended = item.day === recommendedStudyDay;

                        return (
                          <tr
                            key={item.day}
                            onClick={() => toggleDay(item.day)}
                            className={`border-b border-slate-800/50 transition-colors cursor-pointer ${
                              isTodayRecommended
                                ? 'bg-sky-950/20 text-slate-100 ring-1 ring-inset ring-sky-500/30'
                                : isChecked
                                ? 'bg-emerald-950/20 text-slate-200'
                                : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            {/* Day */}
                            <td className="py-3 px-4 font-mono font-bold text-sky-400 flex items-center gap-1.5">
                              <span>Day {item.day}</span>
                              {isTodayRecommended && (
                                <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-sans font-semibold">
                                  今日
                                </span>
                              )}
                            </td>

                            {/* 階段 (Optional Column) */}
                            {!hideStageCol && (
                              <td className="py-3 px-4 font-medium transition-all">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                                  {item.stage}
                                </span>
                              </td>
                            )}

                            {/* 核心複習重點 */}
                            <td className="py-3 px-4 font-medium leading-relaxed">
                              <span className={isChecked ? 'line-through opacity-70' : ''}>
                                {item.focus}
                              </span>
                            </td>

                            {/* 理論 : 實作 (Optional Column) */}
                            {!hideRatioCol && (
                              <td className="py-3 px-4 font-mono text-slate-400 transition-all">
                                {item.ratio}
                              </td>
                            )}

                            {/* 完成 Checkbox */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDay(item.day)}
                                onClick={e => e.stopPropagation()}
                                className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-sky-500 cursor-pointer"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
