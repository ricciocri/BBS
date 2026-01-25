import React, { useMemo, useState } from 'react';
import { Player, GameTable, GameProposal, RankingPeriod } from '../types';

interface MemberListProps {
  allUsers: Player[];
  userRanks: Record<string, number>;
  userStats: Record<string, { rank: number, score: number }>;
  currentUser: Player | null;
  rankingPeriod: RankingPeriod;
  onRankingPeriodChange: (period: RankingPeriod) => void;
  onSelectMember: (userId: string) => void;
  tables: GameTable[];
  proposals: GameProposal[];
}

const MemberList: React.FC<MemberListProps> = ({ 
  allUsers, 
  userRanks, 
  userStats, 
  currentUser,
  rankingPeriod,
  onRankingPeriodChange,
  onSelectMember, 
  tables, 
  proposals 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const { activeUsers, inactiveUsers } = useMemo(() => {
    const processedUsers = allUsers.map(user => {
      const stats = userStats[user.id] || { rank: 0, score: 0 };
      
      const hostedTablesCount = tables.filter(t => t.hostId === user.id).length;
      const joinedTablesCount = tables.filter(t => t.currentPlayers.some(p => p.id === user.id) && t.hostId !== user.id).length;
      const createdProposalsCount = proposals.filter(p => p.proposer?.id === user.id).length;
      const interestedProposalsCount = proposals.filter(p => p.interestedPlayerIds.includes(user.id) && p.proposer?.id !== user.id).length;

      return {
        ...user,
        stats: {
          activityScore: stats.score,
          hostedTablesCount,
          joinedTablesCount,
          createdProposalsCount,
          interestedProposalsCount
        }
      };
    });

    const filtered = processedUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const active = filtered
      .filter(u => u.stats.activityScore > 0)
      .sort((a, b) => userRanks[a.id] - userRanks[b.id]);
      
    const inactive = filtered
      .filter(u => u.stats.activityScore === 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { activeUsers: active, inactiveUsers: inactive };
  }, [allUsers, tables, proposals, searchTerm, userRanks, userStats]);

  const renderUserRow = (user: any) => {
    const rank = userRanks[user.id];
    const isTopThree = rank !== undefined && rank <= 3;
    const isInactive = user.stats.activityScore === 0;
    const isMe = currentUser?.id === user.id;
    
    return (
      <div 
        key={user.id}
        onClick={() => onSelectMember(user.id)}
        className={`glass group p-3 md:py-4 md:px-5 rounded-2xl border transition-all cursor-pointer flex flex-row items-center gap-3 md:gap-5 relative overflow-hidden shadow-sm animate-in slide-in-from-left-4 duration-300 ${
          isMe ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] z-10' : 
          user.isAdmin ? 'border-amber-500/20 border-slate-800' : 'border-slate-800'
        } hover:border-indigo-500/50`}
      >
        {isMe && (
          <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg z-20">
            Tu
          </div>
        )}

        {/* Colonna Rank */}
        <div className="flex items-center justify-center shrink-0 w-6 md:w-10">
           <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs border-2 shadow-inner ${
            isInactive ? 'bg-slate-900 text-slate-700 border-slate-800' :
            rank === 1 ? 'bg-amber-500 text-slate-950 border-amber-300' :
            rank === 2 ? 'bg-slate-300 text-slate-950 border-white' :
            rank === 3 ? 'bg-orange-600 text-white border-orange-400' :
            'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {isInactive ? '-' : (rank || '-')}
          </div>
        </div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className={`w-10 h-10 md:w-14 md:h-14 rounded-xl border shadow-lg transition-transform group-hover:scale-105 object-cover ${
              isMe ? 'border-indigo-400' : user.isAdmin ? 'border-amber-500' : 'border-slate-700'
            }`}
          />
          {!isInactive && isTopThree && rank === 1 && (
            <div className="absolute -top-1.5 -right-1.5 text-amber-400 drop-shadow-lg">
              <i className="fa-solid fa-crown text-[10px] md:text-xs"></i>
            </div>
          )}
        </div>

        {/* Area Centrale: Nome + Statistiche in Riga */}
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-sm md:text-base font-bold transition-colors truncate ${
              isMe ? 'text-indigo-300' : isInactive ? 'text-slate-500' : 'text-white'
            }`}>
              {user.name}
            </h3>
            {user.isAdmin && (
              <span className="bg-amber-500 text-slate-950 text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded uppercase leading-none shrink-0">
                ADMIN
              </span>
            )}
          </div>

          {/* Riga Statistiche Compact con Etichette */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 shrink-0">
            {/* Host */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/40 rounded-lg border border-slate-800/50" title="Tavoli Organizzati">
              <i className="fa-solid fa-crown text-amber-400 text-[8px] md:text-[9px]"></i>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-tighter">Host</span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-200">{user.stats.hostedTablesCount}</span>
            </div>
            {/* Play */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/40 rounded-lg border border-slate-800/50" title="Tavoli Partecipati">
              <i className="fa-solid fa-people-group text-emerald-400 text-[8px] md:text-[9px]"></i>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-tighter">Play</span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-200">{user.stats.joinedTablesCount}</span>
            </div>
            {/* Idea */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/40 rounded-lg border border-slate-800/50" title="Proposte Lanciate">
              <i className="fa-solid fa-lightbulb text-amber-500 text-[8px] md:text-[9px]"></i>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-tighter">Idea</span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-200">{user.stats.createdProposalsCount}</span>
            </div>
            {/* Star */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/40 rounded-lg border border-slate-800/50" title="Interessi Espressi">
              <i className="fa-solid fa-star text-indigo-400 text-[8px] md:text-[9px]"></i>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-tighter">Star</span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-200">{user.stats.interestedProposalsCount}</span>
            </div>
          </div>
        </div>

        {/* Score Finale */}
        <div className={`shrink-0 flex items-center gap-2 bg-slate-950/40 px-3 py-2 md:px-4 h-12 md:h-14 rounded-xl border transition-colors ${
          isMe ? 'border-indigo-400/50 bg-indigo-500/20 shadow-inner shadow-indigo-500/10' : 
          isInactive ? 'border-slate-800' : 'border-slate-800 group-hover:border-indigo-500/30'
        }`}>
          <i className={`fa-solid fa-bolt-lightning text-[10px] md:text-xs ${isInactive ? 'text-slate-800' : 'text-amber-400 animate-pulse'}`}></i>
          <span className={`text-xs md:text-base font-black ${isMe ? 'text-white' : isInactive ? 'text-slate-700' : 'text-indigo-400'}`}>
            {user.stats.activityScore}
          </span>
          <span className="hidden xs:inline text-[8px] text-slate-600 font-black uppercase tracking-tighter">pts</span>
        </div>

        {/* Freccia Desktop */}
        <div className="hidden md:block shrink-0">
           <div className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${
             isInactive 
             ? 'bg-slate-900 text-slate-800 border-slate-800' 
             : 'bg-slate-800 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white border-slate-700 group-hover:border-indigo-500'
           }`}>
             <i className="fa-solid fa-chevron-right text-[10px]"></i>
           </div>
        </div>
      </div>
    );
  };

  const periodButtons: { id: RankingPeriod, label: string }[] = [
    { id: 'daily', label: 'Giorno' },
    { id: 'weekly', label: 'Settimana' },
    { id: 'monthly', label: 'Mese' },
    { id: 'yearly', label: 'Anno' },
    { id: 'all', label: 'Globale' }
  ];

  const scoreActions = [
    { label: 'Ospitare Tavolo GdR', pts: '+15 PTS', icon: 'fa-dice-d20', color: 'indigo', desc: 'Come organizzatore di una sessione di ruolo.' },
    { label: 'Ospitare Tavolo GDT', pts: '+10 PTS', icon: 'fa-dice-six', color: 'emerald', desc: 'Come organizzatore di un tavolo da gioco.' },
    { label: 'Successo Proposta', pts: '+10 PTS', icon: 'fa-wand-magic-sparkles', color: 'indigo', desc: 'Bonus per chi converte una proposta in tavolo.' },
    { label: 'Karma Sociale', pts: '+2 PTS', icon: 'fa-users', color: 'rose', desc: 'Per ogni altro giocatore ospitato al tuo tavolo.' },
    { label: 'Giocare a GdR', pts: '+5 PTS', icon: 'fa-scroll', color: 'sky', desc: 'Come partecipante a una sessione di ruolo.' },
    { label: 'Giocare a GDT', pts: '+3 PTS', icon: 'fa-gamepad', color: 'emerald', desc: 'Come partecipante a un tavolo da gioco.' },
    { label: 'Lanciare Proposta', pts: '+5 PTS', icon: 'fa-lightbulb', color: 'amber', desc: 'Creando una nuova proposta di gioco.' },
    { label: 'Sostegno Proposta', pts: '+1 PT', icon: 'fa-star', color: 'amber', desc: 'Esprimendo interesse per\'idea di un altro.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-slate-900/60 p-5 md:p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="space-y-1 relative">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-fantasy font-bold text-white">Community Live</h2>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Classifica basata sull'attività recente.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl xl:justify-end">
          {/* Selettore Periodo */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 h-10 shrink-0 overflow-x-auto no-scrollbar">
            {periodButtons.map((period) => (
              <button
                key={period.id}
                onClick={() => onRankingPeriodChange(period.id)}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  rankingPeriod === period.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input 
              type="text" 
              placeholder="Cerca un membro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Riquadro Informativo Punteggi */}
      <div className={`glass rounded-2xl border border-indigo-500/20 overflow-hidden transition-all duration-500 ${showScoreInfo ? 'max-h-[1200px] p-4 md:p-6 opacity-100' : 'max-h-0 p-0 opacity-0 border-none'}`}>
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-base"></i>
            Sistema Punteggi BBS
          </h3>
          <button onClick={() => setShowScoreInfo(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {scoreActions.map((action, idx) => (
            <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-row items-center justify-between gap-4 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 flex items-center justify-center text-${action.color}-400 shrink-0 border border-${action.color}-500/20 shadow-inner`}>
                  <i className={`fa-solid ${action.icon} text-lg`}></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs md:text-sm font-bold text-white leading-tight">{action.label}</p>
                  <p className="text-[9px] text-slate-500 mt-1">{action.desc}</p>
                </div>
              </div>
              <div className={`bg-${action.color}-500/20 px-3 py-1.5 rounded-lg border border-${action.color}-500/30 shrink-0`}>
                <p className={`text-[11px] md:text-xs font-black text-${action.color}-400`}>{action.pts}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showScoreInfo && (
        <div className="flex justify-center md:justify-end">
          <button 
            onClick={() => setShowScoreInfo(true)} 
            className="group relative px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black text-white uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center gap-3 border border-indigo-400/50"
          >
            <i className="fa-solid fa-circle-info text-base animate-pulse text-amber-400"></i>
            <span>Mostra info punteggio</span>
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <h3 className="text-sm font-fantasy font-bold text-white flex items-center gap-3">
            <i className="fa-solid fa-trophy text-amber-500 text-xs"></i>
            Leaderboard {periodButtons.find(p => p.id === rankingPeriod)?.label}
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {activeUsers.length}
            </span>
          </h3>
          <div className="h-px flex-1 bg-slate-800/50"></div>
        </div>
        {activeUsers.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {activeUsers.map((user) => renderUserRow(user))}
          </div>
        ) : (
          <div className="py-16 text-center glass rounded-3xl border-dashed border-slate-800 border-2">
            <i className="fa-solid fa-ranking-star text-5xl text-slate-800 mb-4"></i>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Nessuna attività registrata in questo periodo</p>
          </div>
        )}
      </section>

      {inactiveUsers.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-1">
            <h3 className="text-sm font-fantasy font-bold text-slate-400 flex items-center gap-3">
              <i className="fa-solid fa-moon text-slate-500 text-xs"></i>
              In Riposo {rankingPeriod !== 'all' ? '(Senza attività nel periodo)' : ''}
              <span className="text-[10px] font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {inactiveUsers.length}
              </span>
            </h3>
            <div className="h-px flex-1 bg-slate-800/50"></div>
          </div>
          <div className="flex flex-col gap-2.5 opacity-75 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all">
            {inactiveUsers.map(user => renderUserRow(user))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MemberList;