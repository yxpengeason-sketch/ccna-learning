import React from 'react';
import {
  Award,
  BookOpen,
  BookmarkCheck,
  Calendar,
  Sparkles,
  Layers,
  Code,
  AlertTriangle,
  BarChart3,
  Calculator,
  ShieldCheck
} from 'lucide-react';

export type ActiveTab =
  | 'exam'
  | 'quiz'
  | 'wrongbook'
  | 'schedule'
  | 'takeaways'
  | 'tables'
  | 'labs'
  | 'pitfalls'
  | 'calc'
  | 'radar'
  | 'final';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unresolvedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, unresolvedCount }) => {
  const navItems = [
    { id: 'schedule' as ActiveTab, label: '30天配速', icon: Calendar },
    { id: 'takeaways' as ActiveTab, label: '翻卡記憶', icon: Sparkles },
    { id: 'tables' as ActiveTab, label: '易混淆對照', icon: Layers },
    { id: 'labs' as ActiveTab, label: 'IOS指令', icon: Code },
    { id: 'pitfalls' as ActiveTab, label: '陷阱避坑', icon: AlertTriangle },
    { id: 'calc' as ActiveTab, label: '子網計算機', icon: Calculator },
    { id: 'quiz' as ActiveTab, label: '知識點測驗', icon: BookOpen },
    { id: 'exam' as ActiveTab, label: '隨機抽考題', icon: Award, highlight: true },
    { id: 'radar' as ActiveTab, label: '弱點診斷', icon: BarChart3 },
    { id: 'wrongbook' as ActiveTab, label: '錯題攻克本', icon: BookmarkCheck, badge: unresolvedCount },
    { id: 'final' as ActiveTab, label: '考前提醒', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
            CCNA 200-301 <span className="hidden xs:inline sm:inline">考前衝刺儀表板</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeTab !== 'exam' ? (
            <button
              onClick={() => setActiveTab('exam')}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-sky-500 hover:to-cyan-400 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <Award className="h-3.5 w-3.5 flex-shrink-0" />
              <span>進入隨機抽考題</span>
            </button>
          ) : (
            <span className="text-xs text-sky-400/80 font-mono font-medium whitespace-nowrap">
              考綱 v1.1 全題庫
            </span>
          )}
        </div>
      </div>

      {/* Navigation Bar (Desktop + Mobile Horizontal Scroll) */}
      <nav className="w-full border-t border-slate-800/80 bg-slate-950 px-2 sm:px-6 flex overflow-x-auto gap-1 scrollbar-none py-1.5">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? item.id === 'wrongbook'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
