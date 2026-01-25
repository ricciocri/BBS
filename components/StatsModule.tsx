
import React, { useMemo } from 'react';
import { GameTable, GameType, Player } from '../types';

interface StatsModuleProps {
  tables: GameTable[];
  user: Player | null;
  onBack: () => void;
}

const StatsModule: React.FC<StatsModuleProps> = ({ tables, user, onBack }) => {
  const stats = useMemo(() => {
    const totalTables = tables.length;
    const rpgCount = tables.filter(t => t.type === GameType.RPG).length;
    const bgCount = tables.filter(t => t.type === GameType.BOARD_GAME).length;
    
    const gameFrequency: Record<string, number> = {};
    tables.forEach(t => {
      gameFrequency[t.gameName] = (gameFrequency[t.gameName] || 0) + 1;
    });
    const popularGames = Object.entries(gameFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const monthActivity = [
      { name: 'Gen', value: 12 },
      { name: 'Feb', value: 19 },
      { name: 'Mar', value: 15 },
      { name: 'Apr', value: 22 },
      { name: 'Mag', value: 30 },
      { name: 'Giu', value: 25 },
    ];

    const userTables = user ? tables.filter(t => t.currentPlayers.some(p => p.id === user.id)) : [];

    return {
      totalTables,
      rpgCount,
      bgCount,
      popularGames,
      monthActivity,
      userTablesCount: userTables.length
    };
  }, [tables, user]);

  const rpgPercentage = stats.totalTables > 0 ? (stats.rpgCount / stats.totalTables) * 100 : 0;
  const bgPercentage = stats.totalTables > 0 ? (stats.bgCount / stats.totalTables) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-fantasy font-bold text-white mb-1">Bologna Boardgame Society Statistiche</h2>
          <p className="text-sm text-slate-400">Dati pubblici della community di Bologna.</p>
        </div>
        <button 
          onClick={onBack}
          className="w-full md:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 font-bold shadow-lg"
        >
          <i className="fa-solid fa-arrow-left"></i> Torna alla Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass p-5 md:p-6 rounded-2xl border border-indigo-500/20">
          <div className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Sessioni Totali</div>
          <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalTables}</div>
          <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase">+12% vs mese scorso</div>
        </div>
        
        <div className="glass p-5 md:p-6 rounded-2xl border border-amber-500/20 col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Il tuo Profilo</div>
            {user ? (
              <div className="flex items-center gap-6 mt-2">
                <div>
                  <div className="text-3xl font-bold text-white">{stats.userTablesCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Tavoli giocati</div>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <p className="text-slate-500 text-xs md:text-sm">Accedi per sbloccare le tue statistiche personali.</p>
              </div>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none">
            <i className="fa-solid fa-dice-d20 text-7xl md:text-8xl text-amber-400"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center">
          <h3 className="text-base font-bold text-white mb-6 self-start flex items-center gap-3">
            <i className="fa-solid fa-chart-pie text-indigo-400"></i>
            Tipologia Giochi
          </h3>
          
          <div className="relative w-40 h-40 md:w-48 md:h-48 mb-6">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1e293b" strokeWidth="3.8" />
              <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#6366f1" strokeWidth="3.8" strokeDasharray={`${rpgPercentage} ${100 - rpgPercentage}`} strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10b981" strokeWidth="3.8" strokeDasharray={`${bgPercentage} ${100 - bgPercentage}`} strokeDashoffset={-rpgPercentage} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-white">{stats.totalTables}</span>
              <span className="text-[8px] md:text-[10px] uppercase text-slate-500 font-black">Totali</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
            <div className="bg-slate-800/40 p-2 md:p-3 rounded-xl border border-indigo-500/20 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">GdR</span>
              <div className="text-lg md:text-xl font-bold text-indigo-400">{Math.round(rpgPercentage)}%</div>
            </div>
            <div className="bg-slate-800/40 p-2 md:p-3 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">GDT</span>
              <div className="text-lg md:text-xl font-bold text-emerald-400">{Math.round(bgPercentage)}%</div>
            </div>
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-700/50 flex flex-col lg:col-span-2 overflow-hidden">
          <h3 className="text-base font-bold text-white mb-6 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <i className="fa-solid fa-chart-line text-emerald-400"></i>
              Attività Mensile
            </span>
          </h3>

          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-1 min-h-[150px] md:min-h-[200px]">
            {stats.monthActivity.map((month, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <div className="relative w-full flex-1 flex flex-col justify-end">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-t-lg transition-all duration-700 ease-out origin-bottom group-hover:to-indigo-300"
                    style={{ height: `${(month.value / 35) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase">{month.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-700/50 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-3">
              <i className="fa-solid fa-fire text-amber-400"></i>
              Titoli più giocati
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {stats.popularGames.map(([name, count], idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 md:p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all"
              >
                <div className="flex items-center gap-3 md:gap-4 truncate">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-700 flex items-center justify-center font-fantasy font-bold text-slate-400 shrink-0 text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-200 truncate text-sm md:text-base">{name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-indigo-400">{count}</span>
                  <span className="text-[10px] uppercase text-slate-600 font-black">Partite</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModule;
