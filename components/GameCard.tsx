import React, { useMemo } from 'react';
import { GameTable, GameProposal, GameType, GameFormat, Player } from '../types';

interface GameCardProps {
  data: GameTable | GameProposal;
  type: 'table' | 'proposal';
  currentUser: Player | null;
  allUsers: Player[];
  userRanks: Record<string, number>;
  onPrimaryAction: (id: string) => void;
  onSecondaryAction?: (id: string) => void;
  onEdit: (data: any) => void;
  onDelete: (id: string) => void;
  onSelectMember: (userId: string) => void;
  onViewDetail: (data: any) => void;
  index: number;
}

const GameCard: React.FC<GameCardProps> = ({ 
  data, 
  type, 
  currentUser, 
  allUsers,
  userRanks,
  onPrimaryAction, 
  onSecondaryAction,
  onEdit, 
  onDelete,
  onSelectMember,
  onViewDetail,
  index
}) => {
  const isTable = type === 'table';
  const table = isTable ? (data as GameTable) : null;
  const proposal = !isTable ? (data as GameProposal) : null;

  const isRPG = data.type === GameType.RPG;
  
  const SYSTEM_NOW = new Date('2026-01-23T08:06:00').getTime();
  const today = '2026-01-23';
  
  const isInactive = isTable && table!.date < today;

  const isNew = useMemo(() => {
    const created = new Date(data.createdAt).getTime();
    return (SYSTEM_NOW - created) < 24 * 60 * 60 * 1000;
  }, [data.createdAt, SYSTEM_NOW]);

  const isJoined = isTable && currentUser ? table!.currentPlayers.some(p => p.id === currentUser.id) : false;
  const isHost = isTable && currentUser && table ? table.hostId === currentUser.id : false;
  const isFull = isTable ? table!.currentPlayers.length >= table!.maxPlayers : proposal!.interestedPlayerIds.length >= proposal!.maxPlayersGoal;
  const isInterested = !isTable && currentUser ? proposal!.interestedPlayerIds.includes(currentUser.id) : false;
  const isProposer = !isTable && currentUser ? proposal!.proposer.id === currentUser.id : false;

  const canManage = (isTable && isHost) || (!isTable && isProposer);
  const themeColor = isTable ? (isRPG ? 'indigo' : 'emerald') : 'amber';
  const accentColor = isRPG ? 'indigo' : 'emerald';

  const formatInfo = useMemo(() => {
    const format = isTable ? table!.format : proposal!.format;
    switch (format) {
      case GameFormat.CAMPAIGN: 
        return { label: 'Campagna', classes: 'bg-amber-900/40 text-amber-400 border-amber-500/20' };
      case GameFormat.TOURNAMENT: 
        return { label: 'Torneo', classes: 'bg-rose-900/40 text-rose-400 border-rose-500/20' };
      case GameFormat.SINGLE_PLAY: 
        return { label: 'One-Shot', classes: 'bg-sky-900/40 text-sky-400 border-sky-500/20' };
      default: 
        return { label: 'Gara', classes: 'bg-slate-900/40 text-slate-400 border-slate-500/20' };
    }
  }, [data.format, isTable]);

  const getGeekUrl = () => {
    if (data.geekId) {
      return isRPG 
        ? `https://rpggeek.com/rpg/${data.geekId}` 
        : `https://boardgamegeek.com/boardgame/${data.geekId}`;
    }
    return `https://boardgamegeek.com/results?searchname=${encodeURIComponent(data.gameName)}`;
  };

  const actionButtons = (
    <div className="flex items-center gap-1.5 md:gap-2">
      {isTable ? (
        <button 
          disabled={isInactive || (!isJoined && isFull)}
          onClick={(e) => { e.stopPropagation(); onPrimaryAction(table!.id); }} 
          className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-md ${
            isJoined ? 'bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white' :
            (isFull || isInactive) ? 'bg-slate-800/50 text-slate-600 border border-slate-700' : 
            `bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white`
          }`}
        >
          {isInactive ? 'CONCLUSA' : isJoined ? 'Esci' : isFull ? 'PIENO' : 'PARTECIPA'}
        </button>
      ) : (
        <div className="flex items-center gap-1.5 md:gap-2">
          <button onClick={(e) => { e.stopPropagation(); onPrimaryAction(proposal!.id); }} className={`px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl flex items-center justify-center transition-all border gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider ${isInterested ? 'bg-amber-600/20 text-amber-500 border-amber-600/30' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
            <i className={`fa-${isInterested ? 'solid' : 'regular'} fa-star text-[10px] md:text-xs`}></i>
            <span className="hidden sm:inline">Interessa</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSecondaryAction && onSecondaryAction(proposal!.id); }} className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md whitespace-nowrap">
            Apri
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div 
      onClick={() => onViewDetail(data)}
      className={`glass group relative rounded-xl border border-slate-800 flex flex-col gap-4 p-3 md:p-5 hover:border-${themeColor}-500/50 transition-all duration-300 shadow-sm hover:shadow-${themeColor}-500/10 animate-in slide-in-from-left-4 cursor-pointer h-full ${isInactive ? 'opacity-60 grayscale-[0.3]' : ''}`}
    >
      {/* HEADER: BADGES (LEFT) & ACTIONS (RIGHT) */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-1.5 py-0.5 h-5 rounded-md text-[9px] flex items-center justify-center font-black border border-slate-700 bg-slate-900/80 text-slate-400`}>
            #{index}
          </span>

          {isNew && (
            <span className="text-[7px] font-black px-1.5 py-0.5 h-5 flex items-center justify-center rounded bg-red-600 text-white uppercase tracking-widest shadow-lg animate-pulse">
              NEW
            </span>
          )}

          <span className={`text-[7px] font-black px-1.5 py-0.5 h-5 flex items-center justify-center rounded border uppercase tracking-wider ${
            isRPG 
              ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/40' 
              : 'bg-emerald-600/30 text-emerald-400 border-emerald-500/40'
          }`}>
            {isRPG ? 'GdR' : 'GdT'}
          </span>

          <span className={`text-[7px] font-black px-1.5 py-0.5 h-5 flex items-center justify-center rounded border uppercase tracking-wider ${formatInfo.classes}`}>
            {formatInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
          {actionButtons}
          
          {canManage && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2 ml-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(data); }} className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-500 hover:text-white transition-all flex items-center justify-center border border-slate-700/50">
                <i className="fa-solid fa-pen text-[10px]"></i>
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Eliminare definitivamente?')) onDelete(data.id); }} className="w-8 h-8 rounded-lg bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/30">
                <i className="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GAME TITLE CLICCABILE */}
      <div className="min-w-0 flex items-center">
        <div className="flex-1 min-w-0">
          <a 
            href={getGeekUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()}
            className="block group/title"
            title={isRPG ? "Vedi su RPGGeek" : "Vedi su BoardGameGeek"}
          >
            <h3 className="text-xl md:text-2xl font-bold text-white transition-colors uppercase tracking-tight leading-tight group-hover/title:text-indigo-400 break-words cursor-pointer underline-offset-4 decoration-indigo-500/0 hover:decoration-indigo-500/50 decoration-2">
              {data.gameName}
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px] ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity align-middle"></i>
            </h3>
          </a>
          <p className="text-[10px] text-slate-500 font-medium italic mt-1">
            Pubblicato il: {new Date(data.createdAt).toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>

      {/* METADATA FOOTER GRID */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-5 mt-auto border-t border-slate-800/50 pt-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
          {/* DATA */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Data Sessione</span>
            <div className="flex items-center gap-2.5">
              <i className={`fa-regular fa-calendar ${isInactive ? 'text-red-400' : 'text-indigo-400'} text-base`}></i>
              <span className={`text-sm md:text-base font-black whitespace-nowrap ${isInactive ? 'text-red-400/90' : 'text-slate-100'}`}>
                {isTable ? new Date(table!.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'TBD'}
                {isTable && ` • ${table!.time}`}
              </span>
            </div>
          </div>

          {/* LUOGO */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{isTable ? 'Luogo' : 'Proponente'}</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <i className={`fa-solid ${isTable ? 'fa-location-dot' : 'fa-user-pen'} ${isTable ? 'text-emerald-400' : 'text-amber-400'} text-base shrink-0`}></i>
              <span className="text-sm md:text-base font-black text-slate-100 break-words leading-tight">
                {isTable ? table!.location.split(',')[0] : proposal!.proposer.name}
              </span>
            </div>
          </div>
        </div>

        {/* PARTICIPANTS */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex -space-x-2 shrink-0">
            {(isTable ? table!.currentPlayers : allUsers.filter(u => proposal!.interestedPlayerIds.includes(u.id))).slice(0, 3).map((p) => (
              <img key={p.id} src={p.avatar} onClick={(e) => { e.stopPropagation(); onSelectMember(p.id); }} className="w-8 h-8 rounded-full border border-slate-900 object-cover cursor-pointer hover:z-10 shadow-sm" title={p.name} />
            ))}
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Posti</span>
            <span className={`text-sm md:text-base font-black whitespace-nowrap ${isFull ? 'text-amber-400' : 'text-slate-100'}`}>
              {isTable ? `${table!.currentPlayers.length}/${table!.maxPlayers}` : `${proposal!.interestedPlayerIds.length}/${proposal!.maxPlayersGoal}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;