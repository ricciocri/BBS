
import React from 'react';
import { GameTable, GameProposal, Player } from '../types';

interface HomeDashboardProps {
  currentUser: Player | null;
  tables: GameTable[];
  proposals: GameProposal[];
  allUsers: Player[];
  userStats: Record<string, { rank: number, score: number }>;
  onViewTableDetail: (t: GameTable) => void;
  onViewProposalDetail: (p: GameProposal) => void;
  onExploreTables: () => void;
  onExploreProposals: () => void;
  todayStr: string;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  currentUser, 
  tables, 
  proposals, 
  allUsers, 
  userStats,
  onViewTableDetail,
  onViewProposalDetail,
  onExploreTables,
  onExploreProposals,
  todayStr
}) => {
  const activeTonight = tables.filter(t => t.date === todayStr);
  const hypeProposal = proposals.length > 0 
    ? [...proposals].sort((a, b) => (b.interestedPlayerIds?.length || 0) - (a.interestedPlayerIds?.length || 0))[0]
    : null;

  const topMembers = allUsers
    .map(u => ({ ...u, score: userStats[u.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden glass rounded-[3rem] p-8 md:p-12 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-5xl font-fantasy font-black text-white tracking-tight">
              {currentUser ? `Bentornat3, ${currentUser.name}!` : 'Benvenut3 nella Community'}
            </h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed">
              La Bologna Boardgame Society è il cuore pulsante del gioco analogico sotto le due torri. 
              Scopri tavoli pronti, lancia nuove idee e scala il ranking dei Master.
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

      {/* SECTION 2: STASERA IN COMMUNITY */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            Stasera nella Community
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

export default HomeDashboard;
