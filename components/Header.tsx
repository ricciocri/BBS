
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
  isSyncing?: boolean; // Nuovo prop per lo stato del DB
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
  upcomingCount = 0,
  proposalsCount = 0,
  isSyncing = false
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;

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
      {showProfileMenu && (
        <div className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-[2px] cursor-default animate-in fade-in duration-200" onClick={() => setShowProfileMenu(false)}></div>
      )}

      <div className="glass shadow-2xl border border-white/10 flex flex-col rounded-[2rem] transform-gpu overflow-visible">
        <div className="flex items-center justify-center py-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 relative overflow-hidden rounded-t-[2rem]">
          <div className="absolute top-0 left-0 w-32 h-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>
          
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
        </div>

        <div className="flex items-center justify-between px-4 md:px-8 py-2.5 bg-slate-900/60 backdrop-blur-md border-t border-white/5 min-h-[56px] relative rounded-b-[2rem]">
          <div className="flex items-center gap-4 md:gap-10">
            {user ? (
              <div className="flex items-center gap-2 group cursor-default">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center border transition-all duration-500 bg-indigo-500/10 text-indigo-400 border-indigo-500/20`}>
                  <i className={`fa-solid fa-award text-[10px] md:text-sm`}></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-lg font-black text-white leading-none">#{userRank || '?'}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 opacity-40">
                <i className="fa-solid fa-dice-d20 text-slate-500"></i>
                <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">BENVENUT3 IN BBS</span>
              </div>
            )}
            
            {/* Database Connection Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-950/40 rounded-full border border-slate-800">
               <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isSyncing ? 'DB Syncing' : 'DB Connected'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all border ${isPinned ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <i className={`fa-solid fa-thumbtack text-[10px] md:text-xs ${isPinned ? 'rotate-45' : ''}`}></i>
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-1.5 p-0.5 md:p-1 rounded-xl border transition-all z-[95] ${showProfileMenu ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/10 bg-white/5'}`}
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover border border-white/10" />
                  <i className={`fa-solid fa-chevron-down text-[7px] text-slate-500 mr-1 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                </button>
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-52 md:w-64 menu-solid rounded-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[100] overflow-hidden shadow-2xl">
                    <button onClick={() => { onProfileClick(user.id); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-[11px] text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-4 transition-all group">
                      <i className="fa-solid fa-user text-[10px] text-indigo-400 group-hover:text-white"></i> Profilo
                    </button>
                    <button onClick={() => { onLogout(); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-[11px] text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-4 transition-all border-t border-white/10 mt-1">
                      <i className="fa-solid fa-power-off text-[10px]"></i> Esci
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onAuthClick} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Accedi</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
