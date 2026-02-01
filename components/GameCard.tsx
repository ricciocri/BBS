
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
  viewMode?: 'grid' | 'compact';
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
  index,
  viewMode = 'grid'
}) => {
  const isTable = type === 'table';
  const table = isTable ? (data as GameTable) : null;
  const proposal = !isTable ? (data as GameProposal) : null;

  const isRPG = data.type === GameType.RPG;
  const now = new Date();
  const systemTimeMs = now.getTime();
  
  const isNew = useMemo(() => {
    const created = new Date(data.createdAt).getTime();
    return (systemTimeMs - created) < 24 * 60 * 60 * 1000;
  }, [data.createdAt, systemTimeMs]);

  const isJoined = isTable && currentUser ? table!.currentPlayers.some(p => p.id === currentUser.id) : false;
  const isHost = isTable && currentUser && table ? table.hostId === currentUser.id : false;
  const isFull = isTable && table!.currentPlayers.length >= table!.maxPlayers;
  const isInterested = !isTable && currentUser ? (proposal!.interestedPlayerIds || []).includes(currentUser.id) : false;
  const isProposer = !isTable && currentUser ? proposal!.proposer.id === currentUser.id : false;

  const canManage = (isTable && isHost) || (!isTable && isProposer);
  const themeColor = isTable ? (isRPG ? 'indigo' : 'emerald') : 'amber';
  const accentColor = isRPG ? 'indigo' : 'emerald';

  const BGG_ICON_URL = "https://cf.geekdo-images.com/Cr0z-yDOu7GqlIhMhSvHnQ__imagepage@2x/img/VjsGk_8gY4nAhbfYxMtvtm368Zc=/fit-in/1800x1200/filters:strip_icc()/pic7631734.jpg";

  const getGeekUrl = () => {
    if (data.geekId) {
      return data.type === GameType.RPG 
        ? `https://rpggeek.com/rpg/${data.geekId}` 
        : `https://boardgamegeek.com/boardgame/${data.geekId}`;
    }
    const domain = data.type === GameType.RPG ? 'rpggeek.com' : 'boardgamegeek.com';
    return `https://${domain}/results?searchname=${encodeURIComponent(data.gameName)}`;
  };

  const formatInfo = useMemo(() => {
    const format = isTable ? table!.format : proposal!.format;
    switch (format) {
      case GameFormat.CAMPAIGN: 
        return { label: 'Campagna', icon: 'fa-scroll', classes: 'bg-amber-900/60 text-amber-400 border-amber-500/30' };
      case GameFormat.TOURNAMENT: 
        return { label: 'Torneo', icon: 'fa-trophy', classes: 'bg-rose-900/60 text-rose-400 border-rose-500/30' };
      case GameFormat.SINGLE_PLAY: 
        return { label: 'One-Shot', icon: 'fa-bolt-lightning', classes: 'bg-sky-900/60 text-sky-400 border-sky-500/30' };
      default: 
        return { label: 'Gara', icon: 'fa-gamepad', classes: 'bg-slate-900/60 text-slate-400 border-slate-500/30' };
    }
  }, [data.format, isTable]);

  if (viewMode === 'compact') {
    return (
      <div 
        onClick={() => onViewDetail(data)}
        className={`group relative min-h-[70px] py-2 flex flex-row items-center gap-3 md:gap-4 px-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl transition-all duration-300 hover:border-${themeColor}-500/50 hover:bg-slate-800/90 cursor-pointer overflow-hidden`}
      >
        <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-center text-[9px] font-black text-slate-500">
          #{index}
        </span>

        <div className="flex flex-col min-w-0 flex-1 py-1">
          <div className="flex items-center gap-2">
            <a 
              href={getGeekUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 shrink-0 rounded-md overflow-hidden border border-white/10 hover:border-indigo-400 transition-all shadow-md group/geek"
              title="Vedi su BoardGameGeek / RPGGeek"
            >
              <img src={BGG_ICON_URL} className="w-full h-full object-cover transition-transform group-hover/geek:scale-110" alt="BGG" />
            </a>
            <h3 className={`text-sm font-bold text-white ${isRPG ? 'group-hover:text-indigo-400' : 'group-hover:text-emerald-400'} transition-colors uppercase tracking-tight break-words`}>
              {data.gameName}
            </h3>
            {isNew && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 ml-7">
            <span className={`text-[7px] font-black uppercase tracking-widest ${isRPG ? 'text-indigo-400' : 'text-emerald-400'}`}>
              {isRPG ? 'GDR' : 'GDT'}
            </span>
            <span className="text-[7px] text-slate-600 font-bold">•</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase truncate">
              {isTable ? table!.location.split(',')[0] : proposal!.proposer.name}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-2 border-l border-white/5 h-10">
           <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${formatInfo.classes}`}>
              {formatInfo.label}
           </span>
        </div>

        <div className="flex flex-col items-center justify-center px-3 md:px-4 border-l border-white/5 h-10 min-w-[65px] md:min-w-[90px] shrink-0">
           <div className="flex items-center gap-1.5">
             <i className="fa-regular fa-calendar text-indigo-400 text-[8px]"></i>
             <span className="text-[10px] font-bold text-slate-200 uppercase whitespace-nowrap">
               {isTable ? new Date(table!.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'TBD'}
             </span>
           </div>
           {isTable && (
             <div className="flex items-center gap-1.5 mt-0.5">
               <i className="fa-regular fa-clock text-slate-500 text-[8px]"></i>
               <span className="text-[9px] font-bold text-slate-400">{table!.time}</span>
             </div>
           )}
        </div>

        <div className="flex flex-col items-center justify-center px-3 md:px-4 border-l border-white/5 h-10 shrink-0 min-w-[50px]">
           <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
             {isTable ? 'Posti' : 'Interessati'}
           </span>
           <span className={`text-[11px] font-black ${isTable && isFull ? 'text-amber-400' : 'text-white'}`}>
            {isTable ? `${table!.currentPlayers.length}/${table!.maxPlayers}` : `${(proposal!.interestedPlayerIds || []).length}`}
           </span>
        </div>

        {!isTable && (
          <div className="flex flex-col items-center justify-center px-3 md:px-4 border-l border-white/5 h-10 shrink-0 min-w-[50px]">
             <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
               Bozze
             </span>
             <span className="text-[11px] font-black text-amber-500/80">
               {proposal!.drafts?.length || 0}
             </span>
          </div>
        )}

        <div className="flex items-center gap-2 pr-1 shrink-0">
          {isTable ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onPrimaryAction(table!.id); }} 
              className={`h-9 px-3 md:px-4 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                isJoined ? 'bg-red-600/10 text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white' :
                isFull ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 
                `bg-${accentColor}-600/20 text-${accentColor}-400 border-${accentColor}-500/30 hover:bg-${accentColor}-600 hover:text-white`
              }`}
              disabled={!isJoined && isFull}
            >
              {isJoined ? 'Esci' : isFull ? 'OFF' : 'In'}
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onPrimaryAction(proposal!.id); }} 
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${isInterested ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800/60 border-slate-700 text-slate-500'}`}
            >
              <i className={`fa-${isInterested ? 'solid' : 'regular'} fa-star text-[10px]`}></i>
            </button>
          )}
        </div>

        <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-${themeColor}-500/20 group-hover:bg-${themeColor}-500 transition-colors`}></div>
      </div>
    );
  }

  const actionButtons = (
    <div className="flex items-center gap-2">
      {isTable ? (
        <button 
          disabled={!isJoined && isFull}
          onClick={(e) => { e.stopPropagation(); onPrimaryAction(table!.id); }} 
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl border ${
            isJoined ? 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white' :
            isFull ? 'bg-slate-800/80 text-slate-500 border-slate-700 cursor-not-allowed' : 
            `bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white border-${accentColor}-400/50`
          }`}
        >
          {isJoined ? 'Esci' : isFull ? 'PIENO' : 'PARTECIPA'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onPrimaryAction(proposal!.id); }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${isInterested ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'}`}>
            <i className={`fa-${isInterested ? 'solid' : 'regular'} fa-star text-xs`}></i>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div 
      onClick={() => onViewDetail(data)}
      className={`group relative rounded-2xl overflow-hidden border border-slate-800 flex flex-col transition-all duration-500 shadow-sm hover:border-${themeColor}-500/50 hover:shadow-2xl hover:shadow-${themeColor}-500/10 cursor-pointer h-full min-h-[220px] bg-slate-900/90 backdrop-blur-md`}
    >
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${themeColor}-500 blur-3xl -mr-16 -mt-16`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 bg-${themeColor}-500 blur-3xl -ml-16 -mb-16`}></div>
      </div>

      <div className="relative z-10 p-5 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">
              #{index}
            </span>
            {isNew && (
              <span className="px-2 py-1 rounded-lg bg-red-600 text-white text-[8px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                NEW
              </span>
            )}
            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${formatInfo.classes}`}>
              <i className={`fa-solid ${formatInfo.icon} mr-1.5 text-[7px]`}></i>
              {formatInfo.label}
            </span>
          </div>

          {canManage && (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(data); }} className="w-8 h-8 rounded-lg bg-slate-950/60 backdrop-blur-md hover:bg-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center border border-white/10">
                <i className="fa-solid fa-pen text-[10px]"></i>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(data.id); }} className="w-8 h-8 rounded-lg bg-red-950/60 backdrop-blur-md hover:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center border border-red-500/20">
                <i className="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          )}
        </div>

        <div className="mt-2">
          <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isRPG ? 'text-indigo-400' : 'text-emerald-400'}`}>
            {isRPG ? 'GDR System' : 'Board Game'}
          </p>
          <div className="flex items-center gap-3">
             <a 
              href={getGeekUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400 transition-all shadow-xl group/geek"
              title="Vedi su BoardGameGeek / RPGGeek"
            >
              <img src={BGG_ICON_URL} className="w-full h-full object-cover transition-transform group-hover/geek:scale-110" alt="BGG" />
            </a>
            <h3 className={`text-xl md:text-2xl font-bold text-white leading-tight uppercase tracking-tight ${isRPG ? 'group-hover:text-indigo-400' : 'group-hover:text-emerald-400'} transition-colors`}>
              {data.gameName}
            </h3>
          </div>
          <p className="text-slate-400 text-[10px] line-clamp-3 mt-2 font-medium leading-relaxed max-w-sm">
            {data.description}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Data</span>
                <span className="text-xs font-bold text-slate-200">
                  {isTable ? new Date(table!.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'TBD'}
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{isTable ? 'Luogo' : 'Autore'}</span>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                  {isTable ? table!.location.split(',')[0] : proposal!.proposer.name}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {(isTable ? table!.currentPlayers : allUsers.filter(u => (proposal!.interestedPlayerIds || []).includes(u.id))).slice(0, 3).map((p) => (
                <img key={p.id} src={p.avatar} onClick={(e) => { e.stopPropagation(); onSelectMember(p.id); }} className="w-6 h-6 rounded-full border border-slate-900 object-cover cursor-pointer hover:z-10 shadow-sm" alt={p.name} />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  {isTable ? 'Posti' : 'Interessati'}
                </span>
                <span className={`text-xs font-black ${isTable && isFull ? 'text-amber-400' : 'text-white'}`}>
                  {isTable ? `${table!.currentPlayers.length}/${table!.maxPlayers}` : `${(proposal!.interestedPlayerIds || []).length}`}
                </span>
              </div>
              
              {!isTable && (
                <div className="flex flex-col items-end border-l border-white/5 pl-3">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                    Bozze
                  </span>
                  <span className="text-[9px] font-black text-amber-500/80 flex items-center gap-1">
                    <i className="fa-solid fa-layer-group text-[7px]"></i>
                    {proposal!.drafts?.length || 0}
                  </span>
                </div>
              )}
            </div>

            {actionButtons}
          </div>
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-${themeColor}-500/30 group-hover:bg-${themeColor}-500 transition-colors`}></div>
    </div>
  );
};

export default GameCard;
