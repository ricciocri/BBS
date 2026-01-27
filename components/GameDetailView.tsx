
import React, { useState } from 'react';
import { GameTable, GameProposal, GameType, GameFormat, Player } from '../types';

interface GameDetailViewProps {
  data: GameTable | GameProposal;
  type: 'table' | 'proposal';
  currentUser: Player | null;
  userRanks: Record<string, number>;
  allUsers: Player[];
  onBack: () => void;
  onPrimaryAction: (id: string) => void;
  onSecondaryAction?: (id: string) => void;
  onEdit: (data: any) => void;
  onSelectMember: (userId: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
}

const GameDetailView: React.FC<GameDetailViewProps> = ({ 
  data, 
  type, 
  currentUser, 
  userRanks, 
  allUsers, 
  onBack, 
  onPrimaryAction,
  onSecondaryAction,
  onEdit,
  onSelectMember,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isTable = type === 'table';
  const table = isTable ? (data as GameTable) : null;
  const proposal = !isTable ? (data as GameProposal) : null;

  // Utilizziamo la data simulata del sistema per coerenza con il resto dell'app
  const today = '2026-01-23';
  const isInactive = isTable 
    ? table!.date < today 
    : proposal!.interestedPlayerIds.length === 0;

  const isRPG = data.type === GameType.RPG;
  const isJoined = isTable && currentUser ? table!.currentPlayers.some(p => p.id === currentUser.id) : false;
  const isInterested = !isTable && currentUser ? proposal!.interestedPlayerIds.includes(currentUser.id) : false;
  const isFull = isTable ? table!.currentPlayers.length >= table!.maxPlayers : proposal!.interestedPlayerIds.length >= proposal!.maxPlayersGoal;
  
  const themeColor = isTable ? (isRPG ? 'indigo' : 'emerald') : 'amber';

  const participants = isTable 
    ? table!.currentPlayers 
    : allUsers.filter(u => proposal!.interestedPlayerIds.includes(u.id));

  const sortedParticipants = [...participants].sort((a, b) => (userRanks[a.id] || 999) - (userRanks[b.id] || 999));

  const canManage = (isTable && currentUser?.id === table!.hostId) || (!isTable && currentUser?.id === proposal!.proposer.id);

  const getFormatDetails = () => {
    const format = isTable ? table!.format : proposal!.format;
    switch (format) {
      case GameFormat.CAMPAIGN: 
        return { label: 'Campagna', icon: 'fa-scroll', classes: 'bg-amber-600 text-white border-amber-500' };
      case GameFormat.TOURNAMENT: 
        return { label: 'Torneo', icon: 'fa-trophy', classes: 'bg-rose-600 text-white border-rose-500' };
      case GameFormat.SINGLE_PLAY: 
        return { label: 'One-Shot', icon: 'fa-bolt-lightning', classes: 'bg-sky-600 text-white border-sky-500' };
      default: 
        return { label: 'Gara', icon: 'fa-gamepad', classes: 'bg-slate-700 text-white border-slate-600' };
    }
  };

  const formatInfo = getFormatDetails();

  const getGameUrl = () => {
    if (data.geekId) {
      return isRPG 
        ? `https://rpggeek.com/rpg/${data.geekId}` 
        : `https://boardgamegeek.com/boardgame/${data.geekId}`;
    }
    return `https://boardgamegeek.com/results?searchname=${encodeURIComponent(data.gameName)}`;
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare definitivamente questo elemento?') && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(data.id);
        // La navigazione indietro è gestita internamente dalla funzione onDelete in App.tsx se necessario
        // o chiamiamo onBack qui se onDelete non lo fa. 
        // In App.tsx handleTableDelete chiama setView('home')
      } catch (e) {
        console.error("Errore durante l'eliminazione:", e);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Hero Section */}
      <div className="relative min-h-[35vh] md:min-h-[45vh] w-full flex flex-col">
        <div className="absolute inset-0">
          <img 
            src={data.imageUrl || 'https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=1200'} 
            className={`w-full h-full object-cover ${isInactive ? 'grayscale-[0.8] opacity-50' : ''}`}
            alt={data.gameName} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
        </div>
        
        <div className="relative z-20 px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full flex justify-between items-start gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white hover:bg-slate-800 transition-all shadow-2xl shrink-0"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Indietro</span>
          </button>
          
          <div className="flex gap-2">
            {canManage && (
              <>
                <button 
                  onClick={() => onEdit(data)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-2xl"
                >
                  <i className="fa-solid fa-pen text-amber-500"></i>
                  <span className="hidden sm:inline">Modifica</span>
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className={`px-4 py-2.5 rounded-2xl bg-red-900/80 backdrop-blur-xl border border-red-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-2xl ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <i className={`fa-solid ${isDeleting ? 'fa-spinner animate-spin' : 'fa-trash'}`}></i>
                  <span className="hidden sm:inline">{isDeleting ? 'Eliminazione...' : 'Elimina'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-auto px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isInactive && isTable && (
              <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-red-600 text-white shadow-lg animate-pulse">
                SESSIONE CONCLUSA
              </span>
            )}
            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${isTable ? 'bg-indigo-600 border-indigo-500' : 'bg-amber-600 border-amber-500'} text-white`}>
              {isTable ? 'Tavolo' : 'Proposta'}
            </span>
            <span className={`px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1.5 uppercase tracking-widest border ${isRPG ? 'bg-indigo-900/80 border-indigo-700' : 'bg-emerald-900/80 border-emerald-700'} text-white`}>
              <i className={`fa-solid ${isRPG ? 'fa-dice-d20' : 'fa-dice-six'}`}></i>
              {isRPG ? 'GDR' : 'GDT'}
            </span>
            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${formatInfo.classes}`}>
              <i className={`fa-solid ${formatInfo.icon}`}></i>
              {formatInfo.label}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-5xl font-fantasy font-black text-white mb-2 leading-tight break-words hyphens-auto drop-shadow-lg">
            {isTable ? table!.title : proposal!.title}
          </h1>
          
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">GIOCO:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs md:text-base font-black uppercase tracking-widest">{data.gameName}</span>
              <a href={getGameUrl()} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <i className="fa-solid fa-external-link text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Quando', value: isTable ? new Date(table!.date).toLocaleDateString('it-IT') : new Date(proposal!.createdAt).toLocaleDateString('it-IT'), icon: 'fa-calendar', color: 'indigo' },
                { label: 'Orario', value: isTable ? table!.time : 'TBD', icon: 'fa-clock', color: 'indigo' },
                { label: 'Luogo', value: isTable ? table!.location.split(',')[0] : 'In attesa', icon: 'fa-location-dot', color: 'indigo' },
                { label: 'Posti', value: `${participants.length} / ${isTable ? table!.maxPlayers : proposal!.maxPlayersGoal}`, icon: 'fa-users', color: 'indigo' }
              ].map((meta, idx) => (
                <div key={idx} className={`glass p-4 rounded-2xl border flex items-center gap-4 ${isInactive && isTable ? 'border-red-900/20' : 'border-slate-800'}`}>
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sm border border-slate-800 text-${meta.color}-400 shrink-0`}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{meta.label}</p>
                    <p className={`text-xs font-bold truncate ${isInactive && isTable ? 'text-red-400' : 'text-white'}`}>{meta.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-quote-left text-indigo-500/50"></i>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Note di Sessione</h3>
              </div>
              <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 relative">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
                  {data.description}
                </p>
              </div>
            </div>

            {!isTable && (
              <div 
                onClick={() => onSelectMember(proposal!.proposer.id)}
                className="glass p-4 rounded-2xl border border-amber-500/10 flex items-center gap-4 cursor-pointer hover:border-amber-500/30 transition-all"
              >
                <img src={proposal!.proposer.avatar} className="w-12 h-12 rounded-xl object-cover border border-amber-500/30" alt={proposal!.proposer.name} />
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Organizzatore Proposta</p>
                  <p className="text-sm font-bold text-white truncate">{proposal!.proposer.name}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-700 ml-auto"></i>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`glass p-6 rounded-3xl border ${isInactive && isTable ? 'border-red-500/20 bg-red-500/5' : isJoined ? 'border-red-500/20 bg-red-500/5' : 'border-indigo-500/20 bg-indigo-500/5'} space-y-6`}>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Stato Partecipazione</p>
                <div className={`text-2xl font-black ${isInactive && isTable ? 'text-red-400' : 'text-white'}`}>
                  {participants.length} / {isTable ? table!.maxPlayers : proposal!.maxPlayersGoal}
                </div>
              </div>

              <div className="space-y-3">
                {isTable ? (
                  <button 
                    disabled={isInactive || (!isJoined && isFull)}
                    onClick={() => onPrimaryAction(table!.id)}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                      isInactive ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                      isJoined ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' :
                      isFull ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <i className={`fa-solid ${isInactive ? 'fa-lock' : isJoined ? 'fa-door-open' : 'fa-plus'}`}></i>
                    {isInactive ? 'Sessione Conclusa' : isJoined ? 'Lascia il Tavolo' : isFull ? 'Posti Esauriti' : 'Partecipa'}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => onPrimaryAction(proposal!.id)}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        isInterested ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <i className={`fa-${isInterested ? 'solid' : 'regular'} fa-star`}></i>
                      {isInterested ? 'Ti Interessa' : 'Mi Interessa'}
                    </button>
                    <button 
                      onClick={() => onSecondaryAction && onSecondaryAction(proposal!.id)}
                      className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white transition-all shadow-lg"
                    >
                      Conferma e Apri
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                <span>Giocatori</span>
                <span className="text-indigo-400">{participants.length}</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {sortedParticipants.map((p) => {
                  const isOrganizer = isTable && p.id === table!.hostId;
                  const rank = userRanks[p.id];
                  return (
                    <div 
                      key={p.id}
                      onClick={() => onSelectMember(p.id)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.avatar} className="w-8 h-8 rounded-lg object-cover border border-slate-800" alt={p.name} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          {isOrganizer && <p className="text-[7px] text-amber-500 font-black uppercase">Organizzatore</p>}
                        </div>
                      </div>
                      <div className="text-[9px] font-black text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded-md">
                        #{rank || '?'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailView;
