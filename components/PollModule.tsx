
import React from 'react';
import { GameTable, Player, PollOption } from '../types';

interface PollModuleProps {
  table: GameTable;
  currentUser: Player | null;
  onVote: (tableId: string, section: 'dates' | 'times' | 'locations', optionId: string) => void;
  onBack: () => void;
}

const PollModule: React.FC<PollModuleProps> = ({ table, currentUser, onVote, onBack }) => {
  if (!table.poll || !currentUser) return null;

  const renderSection = (title: string, icon: string, section: 'dates' | 'times' | 'locations', options: PollOption[]) => {
    const totalVotesInSection = options.reduce((acc, opt) => acc + opt.votes.length, 0);

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <i className={`fa-solid ${icon} text-indigo-400`}></i>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((opt) => {
            const hasVoted = opt.votes.includes(currentUser.id);
            const percentage = totalVotesInSection > 0 ? (opt.votes.length / totalVotesInSection) * 100 : 0;
            
            return (
              <button 
                key={opt.id}
                onClick={() => onVote(table.id, section, opt.id)}
                className={`relative group p-4 rounded-2xl border transition-all text-left overflow-hidden ${
                  hasVoted ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Progress bar background */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>

                <div className="relative flex justify-between items-center z-10">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${hasVoted ? 'text-indigo-300' : 'text-slate-200'}`}>{opt.value}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{opt.votes.length} Voti</span>
                  </div>
                  {hasVoted && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px]">
                      <i className="fa-solid fa-check"></i>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto glass rounded-3xl p-6 md:p-10 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-slate-700">
            <img src={table.imageUrl} className="w-full h-full object-cover" alt="" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 block">Organizzazione Tavolo</span>
            <h2 className="text-2xl md:text-3xl font-fantasy font-bold text-white">{table.title}</h2>
            <p className="text-slate-400 text-sm mt-1">Vota le opzioni migliori per definire i dettagli della sessione.</p>
          </div>
        </div>
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="space-y-12">
        {renderSection('Quando giocare?', 'fa-calendar-days', 'dates', table.poll.dates)}
        {renderSection('A che ora?', 'fa-clock', 'times', table.poll.times)}
        {renderSection('Dove ci troviamo?', 'fa-location-dot', 'locations', table.poll.locations)}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
        <div className="flex -space-x-3">
          {table.currentPlayers.map(p => (
            <img key={p.id} src={p.avatar} className="w-10 h-10 rounded-full border-4 border-[#1e293b] shadow-xl" title={p.name} />
          ))}
          <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-[#1e293b] flex items-center justify-center text-[10px] font-black text-slate-500">
            +{table.maxPlayers - table.currentPlayers.length}
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          Ho finito di votare
        </button>
      </div>
    </div>
  );
};

export default PollModule;
