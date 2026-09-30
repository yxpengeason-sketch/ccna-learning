import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExamSimulator } from './components/ExamSimulator';
import { QuizDrill } from './components/QuizDrill';
import { WrongBookView } from './components/WrongBookView';
import { ScheduleView } from './components/ScheduleView';
import { TakeawaysView } from './components/TakeawaysView';
import { CompareTableView } from './components/CompareTableView';
import { IosLabsView } from './components/IosLabsView';
import { PitfallsView } from './components/PitfallsView';
import { SubnetCalculatorView } from './components/SubnetCalculatorView';
import { WeaknessRadarView } from './components/WeaknessRadarView';
import { ExamGuideView } from './components/ExamGuideView';
import { CCNA_FULL_QUIZ } from './data/quizBank';
import { loadWB, getUnresolvedWrongQuizList } from './utils/quizUtils';
import { WrongBookStore } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [wrongbook, setWrongbook] = useState<WrongBookStore>({});
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Sync wrongbook from LocalStorage
  const refreshWrongbook = useCallback(() => {
    setWrongbook(loadWB());
  }, []);

  useEffect(() => {
    refreshWrongbook();
  }, [refreshWrongbook]);

  const unresolvedCount = getUnresolvedWrongQuizList(CCNA_FULL_QUIZ).length;

  const handleGoToTabWithKeyword = (tab: ActiveTab, keyword: string) => {
    setSearchKeyword(keyword);
    setActiveTab(tab);
  };

  const handleStartExamFromStrategy = () => {
    setActiveTab('exam');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unresolvedCount={unresolvedCount}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-5 sm:py-8">
        {activeTab === 'exam' && (
          <ExamSimulator
            allQuestions={CCNA_FULL_QUIZ}
            wrongbook={wrongbook}
            onUpdateWrongbook={refreshWrongbook}
            onGoToWrongbook={() => setActiveTab('wrongbook')}
            onGoToRadar={() => setActiveTab('radar')}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizDrill
            allQuestions={CCNA_FULL_QUIZ}
            wrongbook={wrongbook}
            onUpdateWrongbook={refreshWrongbook}
          />
        )}

        {activeTab === 'wrongbook' && (
          <WrongBookView
            wrongbook={wrongbook}
            onUpdateWrongbook={refreshWrongbook}
            onStartRequiz={() => setActiveTab('exam')}
          />
        )}

        {activeTab === 'schedule' && <ScheduleView />}

        {activeTab === 'takeaways' && <TakeawaysView />}

        {activeTab === 'tables' && <CompareTableView initialKeyword={searchKeyword} />}

        {activeTab === 'labs' && <IosLabsView initialKeyword={searchKeyword} />}

        {activeTab === 'pitfalls' && <PitfallsView initialKeyword={searchKeyword} />}

        {activeTab === 'calc' && <SubnetCalculatorView />}

        {activeTab === 'radar' && (
          <WeaknessRadarView
            wrongbook={wrongbook}
            onGoToTab={handleGoToTabWithKeyword}
            onStartExamWithStrategy={handleStartExamFromStrategy}
          />
        )}

        {activeTab === 'final' && <ExamGuideView />}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CCNA 200-301 全真考場衝刺系統</span>
            <span>·</span>
            <span>離線互動完整版</span>
          </div>
          <div>
            <span>配速表 · 翻卡記憶 · 對照表 · IOS指令 · 陷阱避坑 · 模擬測驗 · 隨機抽題考</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
