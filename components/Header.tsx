
import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, Player, View, RankingPeriod } from '../types';

interface HeaderProps {
  user: Player | null;
  currentView: View;
  rankingPeriod: RankingPeriod;
  userRank?: number;
  userScore?: number;
  onHomeClick: () => void;
  onTablesClick: () => void;
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
  onTablesClick,
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
  const [showPinButton, setShowPinButton] = useState(false);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 150) {
        setVisible(true);
      } 
      else if (isPinned) { 
        setVisible(false); 
      } 
      else {
        const scrollingDown = currentScrollY > lastScrollY.current;
        if (scrollingDown) {
          setVisible(false);
        } 
        else if (!scrollingDown && Math.abs(currentScrollY - lastScrollY.current) > 10) {
          setVisible(true);
        }
      }

      setShowPinButton(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setShowPinButton(false);
      }, 1000);

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => { 
      if (!ticking.current) { 
        window.requestAnimationFrame(updateHeaderVisibility); 
        ticking.current = true; 
      } 
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPinned]);

  const isActive = (views: View | View[]) => {
    if (Array.isArray(views)) return views.includes(currentView);
    return currentView === views;
  };

  const getBtnClass = (active: boolean, color: 'indigo' | 'amber' | 'emerald' | 'gradient' | 'rose' = 'indigo') => {
    const base = "px-3 md:px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border duration-200";
    if (active) {
      if (color === 'gradient') return `${base} bg-gradient-to-r from-indigo-600/40 to-emerald-600/40 text-white border-indigo-400/50 shadow-inner shadow-indigo-500/10`;
      const colors = { 
        indigo: "bg-indigo-600/30 text-indigo-400 border-indigo-500/40 shadow-inner shadow-indigo-500/10", 
        amber: "bg-amber-500/30 text-amber-500 border-amber-500/40 shadow-inner shadow-amber-500/10", 
        emerald: "bg-emerald-500/30 text-emerald-400 border-emerald-500/40 shadow-inner shadow-emerald-500/10",
        rose: "bg-rose-600/30 text-rose-400 border-rose-500/40 shadow-inner shadow-indigo-500/10"
      };
      return `${base} ${colors[color as keyof typeof colors]}`;
    }
    return `${base} text-slate-400 hover:text-white hover:bg-white/5 border-transparent`;
  };

  return (
    <>
      <div 
        className={`fixed top-6 right-6 z-[70] transition-all duration-500 transform-gpu ${
          showPinButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => setIsPinned(!isPinned)}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 glass shadow-2xl ${
            isPinned 
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-thumbtack text-sm transition-transform duration-300 ${isPinned ? 'rotate-45' : 'rotate-0'}`}></i>
          <span className="text-[6px] font-black uppercase mt-1 tracking-tighter">Focus</span>
        </button>
      </div>

      <header 
        style={{ 
          transform: visible ? 'translateY(0)' : 'translateY(-115%)', 
          opacity: visible ? 1 : 0 
        }}
        className="sticky top-4 z-50 px-4 max-w-7xl mx-auto transition-all duration-500 ease-out will-change-transform"
      >
        <div className="glass shadow-2xl border border-white/10 flex flex-col rounded-[2.5rem] transform-gpu overflow-hidden">
          
          {/* ROW 1: BRAND (CENTERED) */}
          <div className="flex items-center justify-center py-4 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 relative">
            <div className="cursor-pointer group px-4" onClick={onHomeClick}>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-fantasy font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-white to-emerald-400 bg-clip-text text-transparent uppercase leading-none drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-500 whitespace-nowrap overflow-hidden text-center">
                Bologna Boardgame Society
              </h1>
            </div>
          </div>

          {/* ROW 2: USER DASHBOARD (PROFILE, STATS & ACTIONS) */}
          <div className="flex items-center justify-between px-4 md:px-8 py-3 bg-slate-950/20 backdrop-blur-md border-b border-white/10 relative">
             <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:block">
                 {user ? `Bentornatə, ${user.name}` : 'Benvenutə nella community'}
               </span>
             </div>

             <div className="flex items-center gap-6">
                {user ? (
                  <div className="flex items-center gap-4 md:gap-8">
                    {/* Stats Group */}
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Rank</span>
                        <span className="text-sm font-black text-amber-400 drop-shadow-md">#{userRank || '?'}</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-white/10 pl-4 md:pl-6">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">XP Karma</span>
                        <span className="text-sm font-black text-indigo-400 drop-shadow-md">{userScore}</span>
                      </div>
                    </div>
                    
                    {/* Avatar Pill */}
                    <div 
                      className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-2xl border border-white/5 cursor-pointer hover:bg-slate-800/80 transition-all shadow-lg"
                      onClick={() => onProfileClick(user.id)}
                    >
                      <img src={user.avatar} className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-md" alt={user.name} />
                      <div className="hidden xs:flex flex-col">
                        <span className="text-[10px] font-black text-white leading-none uppercase tracking-widest">{user.name}</span>
                        <span className="text-[6px] font-black text-indigo-400 uppercase tracking-tighter mt-0.5">Area Profilo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-8"></div> // Spacer
                )}
             </div>

             <div className="flex items-center gap-2 md:gap-3">
               {user?.isAdmin && (
                 <button onClick={onAdminClick} className="px-3 py-2 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition-all">
                   <i className="fa-solid fa-shield-halved mr-1.5"></i> Admin
                 </button>
               )}
               
               <button 
                onClick={onNotificationsClick}
                className="relative w-10 h-10 rounded-xl bg-slate-800/40 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-md group"
                title="Notifiche"
              >
                <i className="fa-solid fa-bell group-hover:rotate-12 transition-transform text-xs"></i>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                )}
              </button>

               {user ? (
                 <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm("Sei sicuro di voler uscire?")) onLogout();
                  }}
                  className="w-10 h-10 rounded-xl bg-rose-950/20 hover:bg-rose-600/20 text-rose-400/70 hover:text-rose-400 border border-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center shadow-lg"
                  title="Esci"
                >
                  <i className="fa-solid fa-power-off text-xs"></i>
                </button>
               ) : (
                 <button 
                  onClick={onAuthClick}
                  className="px-5 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Accedi
                </button>
               )}
             </div>
          </div>

          {/* ROW 3: NAVIGATION MENU & SYSTEM STATUS */}
          <div className="flex items-center justify-between px-3 md:px-6 py-2.5 bg-slate-900/40 backdrop-blur-xl gap-4">
            <nav className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar py-0.5">
              <button onClick={onHomeClick} className={getBtnClass(isActive('home'), 'indigo')}>
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </button>
              <button onClick={onTablesClick} className={getBtnClass(isActive(['tables', 'table-detail']), 'gradient')}>
                <i className="fa-solid fa-dice-six"></i>
                <span>Tavoli</span>
              </button>
              <button onClick={onProposalsClick} className={getBtnClass(isActive(['proposals', 'proposal-detail']), 'amber')}>
                <i className="fa-solid fa-lightbulb"></i>
                <span>Proposte</span>
              </button>
              <button onClick={onMembersClick} className={getBtnClass(isActive('members'), 'emerald')}>
                <i className="fa-solid fa-users"></i>
                <span>Membri</span>
              </button>
              <button onClick={onStatsClick} className={getBtnClass(isActive('stats'), 'indigo')}>
                <i className="fa-solid fa-chart-line"></i>
                <span>Stats</span>
              </button>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center px-3 py-2 bg-slate-950/60 rounded-xl border border-white/5 transition-all">
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${isSyncing ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}
                  title={isSyncing ? "Sincronizzazione DB in corso..." : "Database Online"}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
