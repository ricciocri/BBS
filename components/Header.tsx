
import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, Player, View, RankingPeriod } from '../types';

interface HeaderProps {
  user: Player | null;
  currentView: View;
  rankingPeriod: RankingPeriod;
  userRank?: number;
  userScore?: number;
  onHomeClick: () => void;
  onProposalsClick: () => void;
  onStatsClick: () => void;
  onMembersClick: () => void;
  onAdminClick: () => void;
  onAuthClick: () => void;
  onNotificationsClick: () => void;
  onLogout: () => void;
  onProfileClick: (userId: string) => void;
  notifications: AppNotification[];
  upcomingCount?: number;
  proposalsCount?: number;
  memberCount?: number;
  isSyncing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  user,
  currentView,
  userRank,
  userScore = 0,
  onHomeClick, 
  onProposalsClick,
  onStatsClick,
  onMembersClick,
  onAdminClick,
  onAuthClick,
  onNotificationsClick,
  onLogout,
  onProfileClick,
  notifications, 
  isSyncing = false
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      if (isPinned) { setVisible(true); } 
      else {
        const scrollingDown = currentScrollY > lastScrollY.current;
        if (showProfileMenu || currentScrollY < 50) setVisible(true);
        else if (scrollingDown && currentScrollY > 150) setVisible(false);
        else if (!scrollingDown && Math.abs(currentScrollY - lastScrollY.current) > 10) setVisible(true);
      }
      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };
    const handleScroll = () => { if (!ticking.current) { window.requestAnimationFrame(updateHeaderVisibility); ticking.current = true; } };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showProfileMenu, isPinned]);

  const isActive = (views: View | View[]) => {
    if (Array.isArray(views)) return views.includes(currentView);
    return currentView === views;
  };

  const getBtnClass = (active: boolean, color: 'indigo' | 'amber' | 'emerald' | 'gradient' = 'indigo') => {
    const base = "px-2 sm:px-4 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shrink-0 border duration-200";
    if (active) {
      if (color === 'gradient') return `${base} bg-gradient-to-r from-indigo-600/40 to-emerald-600/40 text-white border-indigo-400/50 shadow-inner shadow-indigo-500/10`;
      const colors = { indigo: "bg-indigo-600/30 text-indigo-400 border-indigo-500/40 shadow-inner shadow-indigo-500/10", amber: "bg-amber-500/30 text-amber-500 border-amber-500/40 shadow-inner shadow-indigo-500/10", emerald: "bg-emerald-500/30 text-emerald-400 border-emerald-500/40 shadow-inner shadow-amber-500/10" };
      return `${base} ${colors[color as keyof typeof colors]}`;
    }
    return `${base} text-slate-400 hover:text-white hover:bg-white/5 border-transparent`;
  };

  return (
    <header 
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-110%)', opacity: visible ? 1 : 0 }}
      className="sticky top-4 z-50 px-4 max-w-7xl mx-auto transition-all duration-300 ease-out will-change-transform"
    >
      <div className="glass shadow-2xl border border-white/10 flex flex-col rounded-[2rem] transform-gpu overflow-visible">
        <div className="flex items-center justify-center py-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 relative overflow-hidden rounded-t-[2rem]">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group px-4" onClick={onHomeClick}>
            <h1 className="text-base sm:text-xl md:text-2xl font-fantasy font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-white to-emerald-400 bg-clip-text text-transparent uppercase leading-none drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-500 whitespace-nowrap overflow-hidden">
              Bologna Boardgame Society
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-800/20 backdrop-blur-xl border-b border-white/5 gap-2 md:gap-4">
          <nav className="flex items-center gap-1 flex-1 overflow-x-hidden no-scrollbar">
            <button onClick={onHomeClick} className={getBtnClass(isActive(['home', 'table-detail']), 'gradient')}>
              <i className="fa-solid fa-dice-six text-[10px] md:text-sm"></i>
              <span className="inline">Tavoli</span>
            </button>
            <button onClick={onProposalsClick} className={getBtnClass(isActive(['proposals', 'proposal-detail']), 'amber')}>
              <i className="fa-solid fa-lightbulb text-[10px] md:text-sm"></i>
              <span className="inline">Proposte</span>
            </button>
            <button onClick={onMembersClick} className={getBtnClass(isActive('members'), 'emerald')}>
              <i className="fa-solid fa-users text-[10px] md:text-sm"></i>
              <span className="inline">Membri</span>
            </button>
            <button onClick={onStatsClick} className={getBtnClass(isActive('stats'), 'indigo')}>
              <i className="fa-solid fa-chart-line text-[10px] md:text-sm"></i>
              <span className="inline">Stats</span>
            </button>
          </nav>

          <div className="flex items-center px-3 py-2 bg-slate-900/40 rounded-xl border border-white/5 shrink-0 transition-all">
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isSyncing ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}
              title={isSyncing ? "Trasmissione dati al Server..." : "Server Connesso"}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 md:px-8 py-2.5 bg-slate-900/60 backdrop-blur-md border-t border-white/5 min-h-[56px] relative rounded-b-[2rem]">
          <div className="flex items-center gap-4 md:gap-6">
            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="shrink-0 flex items-center gap-2 md:gap-3 bg-slate-950/40 px-3 py-1.5 md:px-4 h-12 md:h-14 rounded-xl border border-indigo-500/30 shadow-inner shadow-indigo-500/10">
                  <i className="fa-solid fa-award text-xs md:text-base text-indigo-400"></i>
                  <span className="text-sm md:text-lg font-black text-white leading-none">#{userRank || '?'}</span>
                </div>
                <div className="shrink-0 flex items-center gap-2 md:gap-3 bg-slate-950/40 px-3 py-1.5 md:px-4 h-12 md:h-14 rounded-xl border border-amber-500/30 shadow-inner shadow-amber-500/10">
                  <i className="fa-solid fa-bolt-lightning text-xs md:text-base text-amber-400"></i>
                  <span className="text-sm md:text-lg font-black text-white leading-none">{userScore}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gilda Bologna</span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-1.5 p-0.5 md:p-1 rounded-xl border transition-all ${showProfileMenu ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/10 bg-white/5'}`}
                >
                  <img src={user.avatar} className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover" alt="" />
                  <i className="fa-solid fa-chevron-down text-[7px] text-slate-500 mr-1"></i>
                </button>
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-52 menu-solid rounded-2xl py-2 z-[100]">
                    <button onClick={() => { onProfileClick(user.id); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-xs text-slate-200 hover:bg-indigo-600 flex items-center gap-3">
                      <i className="fa-solid fa-user"></i> Profilo
                    </button>
                    <button onClick={onLogout} className="w-full px-4 py-3 text-left text-xs text-red-400 hover:bg-red-600 hover:text-white border-t border-white/10">
                      <i className="fa-solid fa-power-off"></i> Esci
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onAuthClick} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Accedi</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
