
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
  const [visible, setVisible] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Orologio di sistema
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      if (isPinned) { 
        setVisible(true); 
      } else {
        const scrollingDown = currentScrollY > lastScrollY.current;
        if (currentScrollY < 50) setVisible(true);
        else if (scrollingDown && currentScrollY > 150) setVisible(false);
        else if (!scrollingDown && Math.abs(currentScrollY - lastScrollY.current) > 10) setVisible(true);
      }
      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };
    const handleScroll = () => { if (!ticking.current) { window.requestAnimationFrame(updateHeaderVisibility); ticking.current = true; } };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPinned]);

  const isActive = (views: View | View[]) => {
    if (Array.isArray(views)) return views.includes(currentView);
    return currentView === views;
  };

  const getBtnClass = (active: boolean, color: 'indigo' | 'amber' | 'emerald' | 'gradient' | 'rose' = 'indigo') => {
    const base = "px-2 sm:px-4 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shrink-0 border duration-200";
    if (active) {
      if (color === 'gradient') return `${base} bg-gradient-to-r from-indigo-600/40 to-emerald-600/40 text-white border-indigo-400/50 shadow-inner shadow-indigo-500/10`;
      const colors = { 
        indigo: "bg-indigo-600/30 text-indigo-400 border-indigo-500/40 shadow-inner shadow-indigo-500/10", 
        amber: "bg-amber-500/30 text-amber-500 border-amber-500/40 shadow-inner shadow-amber-500/10", 
        emerald: "bg-emerald-500/30 text-emerald-400 border-emerald-500/40 shadow-inner shadow-emerald-500/10",
        rose: "bg-rose-600/30 text-rose-400 border-rose-500/40 shadow-inner shadow-rose-500/10"
      };
      return `${base} ${colors[color as keyof typeof colors]}`;
    }
    return `${base} text-slate-400 hover:text-white hover:bg-white/5 border-transparent`;
  };

  const formattedDate = currentTime.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  const formattedTime = currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  return (
    <header 
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-110%)', opacity: visible ? 1 : 0 }}
      className="sticky top-4 z-50 px-4 max-w-7xl mx-auto transition-all duration-300 ease-out will-change-transform"
    >
      <div className="glass shadow-2xl border border-white/10 flex flex-col rounded-[2rem] transform-gpu overflow-visible">
        {/* ROW 1: TITLE & TOP ACTIONS */}
        <div className="flex items-center justify-center py-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 relative overflow-hidden rounded-t-[2rem]">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group px-4" onClick={onHomeClick}>
            <h1 className="text-base sm:text-xl md:text-2xl font-fantasy font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-white to-emerald-400 bg-clip-text text-transparent uppercase leading-none drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-500 whitespace-nowrap overflow-hidden text-center">
              Bologna Boardgame Society
            </h1>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${isPinned ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-800/50 border-white/10 text-slate-500 hover:text-slate-300'}`}
              title={isPinned ? "Sblocca Header" : "Blocca Header"}
            >
              <i className={`fa-solid fa-thumbtack transition-transform duration-300 ${isPinned ? 'rotate-45' : 'rotate-0'}`}></i>
            </button>
          </div>
        </div>

        {/* ROW 2: NAVIGATION */}
        <div className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-800/20 backdrop-blur-xl border-b border-white/5 gap-2 md:gap-4">
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
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

        {/* ROW 3: USER STATS & ACTIONS */}
        <div className="flex items-center justify-between px-4 md:px-8 py-2.5 bg-slate-900/60 backdrop-blur-md border-t border-white/5 min-h-[56px] relative rounded-b-[2rem]">
          <div className="flex items-center gap-3 md:gap-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              {user ? `Ciao, ${user.name}` : "BENVENUT3 IN BBS"}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Blocco Profilo Utente (Spostato a Destra) */}
            {user && (
              <div className="flex items-center gap-3 md:gap-4 border-r border-white/10 pr-3 md:pr-5">
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Rank</span>
                    <span className="text-xs font-black text-amber-400">#{userRank || '?'}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Score</span>
                    <span className="text-xs font-black text-indigo-400">{userScore}</span>
                  </div>
                </div>

                {/* Pulsante ADMIN Giallo con Scudo */}
                {user.isAdmin && (
                  <button onClick={onAdminClick} className={getBtnClass(isActive('admin-dashboard'), 'amber')}>
                    <i className="fa-solid fa-shield-halved text-[10px] md:text-xs"></i>
                    <span className="hidden sm:inline">ADMIN</span>
                  </button>
                )}

                <div 
                  className="shrink-0 flex items-center gap-2 md:gap-3 bg-slate-950/40 px-3 py-1.5 md:px-4 h-10 rounded-xl border border-white/10 cursor-pointer hover:bg-slate-900/60 transition-all"
                  onClick={() => onProfileClick(user.id)}
                >
                  <img src={user.avatar} className="w-6 h-6 rounded-lg object-cover border border-white/10" alt={user.name} />
                  <div className="hidden md:flex flex-col">
                    <span className="text-[10px] font-black text-white leading-none">{user.name}</span>
                    <span className="text-[7px] font-black text-indigo-400 uppercase tracking-tighter">Profilo</span>
                  </div>
                </div>
              </div>
            )}

            {/* Orologio (solo su desktop) */}
            <div className="hidden lg:flex flex-col items-end opacity-60">
              <span className="text-xs font-black text-white leading-none">{formattedTime}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{formattedDate}</span>
            </div>

            <button 
              onClick={onNotificationsClick}
              className="relative w-10 h-10 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
            >
              <i className="fa-solid fa-bell"></i>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              )}
            </button>

            {/* Main Action Button (ACCEDI / ESCI) */}
            {user ? (
              <button 
                onClick={onLogout}
                className="px-6 py-2 bg-rose-950/30 hover:bg-rose-600/20 text-rose-300/90 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <i className="fa-solid fa-power-off"></i>
                ESCI
              </button>
            ) : (
              <button 
                onClick={onAuthClick}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                ACCEDI
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
