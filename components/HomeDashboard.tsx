
import React, { useState, useMemo } from 'react';
import { GameTable, GameProposal, Player, AppActivity } from '../types';

interface HomeDashboardProps {
  currentUser: Player | null;
  tables: GameTable[];
  proposals: GameProposal[];
  allUsers: Player[];
  userStats: Record<string, { rank: number, score: number }>;
  activities: AppActivity[];
  onViewTableDetail: (t: GameTable) => void;
  onViewProposalDetail: (p: GameProposal) => void;
  onExploreTables: () => void;
  onExploreProposals: () => void;
  onSelectMember: (id: string) => void;
  todayStr: string;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  currentUser, 
  tables, 
  proposals, 
  allUsers, 
  userStats,
  activities,
  onViewTableDetail,
  onViewProposalDetail,
  onExploreTables,
  onExploreProposals,
  onSelectMember,
  todayStr
}) => {
  const [activityView, setActivityView] = useState<'chrono' | 'account'>('chrono');

  const activeTonight = tables.filter(t => t.date === todayStr);
  const hypeProposal = proposals.length > 0 
    ? [...proposals].sort((a, b) => (b.interestedPlayerIds?.length || 0) - (a.interestedPlayerIds?.length || 0))[0]
    : null;

  const topMembers = allUsers
    .map(u => ({ ...u, score: userStats[u.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "proprio ora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m fa`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h fa`;
    return then.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  const groupedActivities = useMemo(() => {
    if (activityView === 'chrono') return activities;
    
    const groups: Record<string, AppActivity[]> = {};
    activities.forEach(act => {
      if (!groups[act.userId]) groups[act.userId] = [];
      groups[act.userId].push(act);
    });
    return Object.entries(groups).sort((a, b) => b[1][0].timestamp.localeCompare(a[1][0].timestamp));
  }, [activities, activityView]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden glass rounded-[3rem] p-8 md:p-12 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-5xl font-fantasy font-black text-white tracking-tight">
              {currentUser ? `Bentornatə nella community, ${currentUser.name}!` : 'Benvenutə nella community'}
            </h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed">
              Bologna Boardgame Society è il cuore pulsante del gioco analogico. Scopri tavoli pronti, lancia nuove idee e scala il ranking dei giocatori.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button onClick={onExploreTables} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95">
                Esplora Tavoli
              </button>
              <button onClick={onExploreProposals} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-700">
                Guarda Proposte
              </button>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 shadow-inner">
             <div className="text-center space-y-1">
                <div className="text-4xl md:text-6xl font-black text-white">{allUsers.length}</div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Membri Attivi</div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION: SOCIETY LIVE FEED */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
              <i className="fa-solid fa-satellite-dish text-indigo-400 animate-pulse"></i>
              Society Live Feed
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Le ultime attività della gilda in tempo reale</p>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActivityView('chrono')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${activityView === 'chrono' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Cronologia
            </button>
            <button 
              onClick={() => setActivityView('account')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${activityView === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Per Account
            </button>
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl">
          <div className="max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-white/5">
            {activities.length > 0 ? (
              activityView === 'chrono' ? (
                (groupedActivities as AppActivity[]).map((act) => (
                  <ActivityRow key={act.id} act={act} formatTime={formatRelativeTime} onSelectMember={onSelectMember} />
                ))
              ) : (
                (groupedActivities as [string, AppActivity[]][]).map(([userId, userActs]) => (
                  <div key={userId} className="p-4 space-y-3">
                    <div className="flex items-center gap-3 px-2">
                       <img src={userActs[0].userAvatar} className="w-6 h-6 rounded-lg object-cover border border-white/10" alt="" />
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{userActs[0].userName}</span>
                       <div className="flex-1 h-px bg-white/5"></div>
                    </div>
                    <div className="space-y-1">
                      {userActs.map(act => (
                        <div key={act.id} className="flex items-center justify-between py-1 px-4 hover:bg-white/5 rounded-lg transition-colors group">
                           <div className="flex items-center gap-3">
                              <i className={`fa-solid ${act.type === 'delete' ? 'fa-circle-xmark text-rose-500' : act.type === 'create' ? 'fa-circle-plus text-emerald-500' : 'fa-circle-check text-amber-500'} text-[10px]`}></i>
                              <p className="text-xs text-slate-300">
                                {act.action} <span className="font-bold text-white tracking-tight">{act.targetName}</span>
                              </p>
                           </div>
                           <span className="text-[8px] font-black text-slate-600 uppercase group-hover:text-slate-400 transition-colors">{formatRelativeTime(act.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="py-12 text-center">
                <i className="fa-solid fa-ghost text-3xl text-slate-800 mb-4"></i>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Ancora nessuna attività registrata</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: STASERA IN COMMUNITY */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            Stasera in Community
          </h3>
          <button onClick={onExploreTables} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors">
            Vedi tutti ({tables.length})
          </button>
        </div>
        
        {activeTonight.length > 0 ? (
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4 px-2">
            {activeTonight.map((table) => (
              <div 
                key={table.id} 
                onClick={() => onViewTableDetail(table)}
                className="shrink-0 w-[280px] md:w-[320px] glass p-5 rounded-[2rem] border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                  <img src={table.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-emerald-600 text-white text-[8px] font-black uppercase rounded-lg">
                    {table.time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white uppercase tracking-tight truncate">{table.gameName}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{table.location.split(',')[0]}</p>
                  <span className="text-[10px] font-black text-emerald-400">
                    {table.currentPlayers.length}/{table.maxPlayers} <i className="fa-solid fa-users text-[8px] ml-1"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center glass rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nessun tavolo stasera. Perché non ne apri uno?</p>
          </div>
        )}
      </section>

      {/* SECTION 3 & 4: HYPE & HALL OF FAME */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* HYPE DEL MOMENTO */}
        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <i className="fa-solid fa-fire text-amber-500 animate-bounce"></i>
            Hype del Momento
          </h3>
          {hypeProposal ? (
            <div 
              onClick={() => onViewProposalDetail(hypeProposal)}
              className="relative overflow-hidden glass p-6 rounded-[2.5rem] border border-amber-500/30 shadow-2xl hover:border-amber-400 transition-all cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl -mr-16 -mt-16"></div>
              <div className="flex items-center gap-6">
                <img src={hypeProposal.imageUrl} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-amber-500/20 shadow-lg group-hover:scale-105 transition-transform" alt="" />
                <div className="flex-1 min-w-0">
                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">PROPOSTA TRENDING</span>
                   <h4 className="text-xl md:text-2xl font-fantasy font-bold text-white truncate mb-1">{hypeProposal.gameName}</h4>
                   <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300">
                        <i className="fa-solid fa-star text-amber-400 mr-2"></i>
                        {hypeProposal.interestedPlayerIds.length} interessati
                      </span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase">Da {hypeProposal.proposer.name}</span>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center glass rounded-3xl border border-slate-800">
              <p className="text-slate-500 text-xs font-black uppercase">Nessuna proposta attiva</p>
            </div>
          )}
        </div>

        {/* HALL OF FAME */}
        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <i className="fa-solid fa-crown text-amber-400"></i>
            Hall of Fame
          </h3>
          <div className="glass p-6 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-2xl">
            {topMembers.map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                     idx === 0 ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 
                     idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-600 text-white'
                   }`}>
                     {idx + 1}
                   </div>
                   <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-white truncate max-w-[120px]">{user.name}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase">Karma XP: {user.score}</span>
                   </div>
                </div>
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  {idx === 0 ? 'Leggenda' : idx === 1 ? 'Eroe' : 'Veterano'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityRow: React.FC<{ act: AppActivity, formatTime: (t: string) => string, onSelectMember: (id: string) => void }> = ({ act, formatTime, onSelectMember }) => {
  const icon = act.type === 'create' ? 'fa-circle-plus text-emerald-500' : act.type === 'delete' ? 'fa-circle-xmark text-rose-500' : 'fa-circle-check text-amber-500';
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-4 min-w-0">
        <img 
          src={act.userAvatar} 
          onClick={() => onSelectMember(act.userId)}
          className="w-10 h-10 rounded-xl object-cover border border-white/10 cursor-pointer hover:border-indigo-500 transition-all shadow-md" 
          alt="" 
        />
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-slate-300 leading-tight">
            <span 
              onClick={() => onSelectMember(act.userId)}
              className="font-bold text-white cursor-pointer hover:text-indigo-400 transition-colors uppercase tracking-tight"
            >
              {act.userName}
            </span>
            {" "}{act.action}{" "}
            <span className="font-black text-white italic tracking-tight">{act.targetName}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
             <i className={`fa-solid ${icon} text-[8px]`}></i>
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Attività {act.type}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-400/70 transition-colors">
          {formatTime(act.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default HomeDashboard;
