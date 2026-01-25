
import React, { useState, useMemo } from 'react';
import { GameTable, GameType, GameFormat, Player } from '../types';

interface TableCardProps {
  table: GameTable;
  currentUser: Player | null;
  userRanks: Record<string, number>;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onEdit: (table: GameTable) => void;
  onDelete: (id: string) => void;
  onSelectMember: (userId: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, currentUser, userRanks, onJoin, onLeave, onEdit, onDelete, onSelectMember }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isJoined = currentUser ? table.currentPlayers.some(p => p.id === currentUser.id) : false;
  const isHost = currentUser ? table.currentPlayers[0]?.id === currentUser.id : false;
  const isFull = table.currentPlayers.length >= table.maxPlayers;
  const isRPG = table.type === GameType.RPG;
  const isAdmin = currentUser?.isAdmin || false;
  
  const SYSTEM_NOW = new Date('2026-01-23T08:06:00').getTime();
  const today = '2026-01-23';
  const isPast = table.date < today;

  const isNew = useMemo(() => {
    const created = new Date(table.createdAt).getTime();
    return (SYSTEM_NOW - created) < 24 * 60 * 60 * 1000;
  }, [table.createdAt, SYSTEM_NOW]);

  const getFormatDetails = (format: GameFormat) => {
    switch (format) {
      case GameFormat.CAMPAIGN:
        return { label: 'Camp.', icon: 'fa-scroll', color: 'bg-amber-900/60 text-amber-300 border-amber-500/30' };
      case GameFormat.TOURNAMENT:
        return { label: 'Torn.', icon: 'fa-trophy', color: 'bg-rose-900/60 text-rose-300 border-rose-500/30' };
      default:
        return { label: 'One-sh', icon: 'fa-bolt-lightning', color: 'bg-sky-900/60 text-sky-300 border-sky-500/30' };
    }
  };

  const formatInfo = getFormatDetails(table.format);

  const fallbackImage = isRPG 
    ? 'https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=400&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1585504198199-20277593b94f?q=80&w=400&auto=format&fit=crop';

  const themeColorClass = isRPG ? 'indigo' : 'emerald';

  return (
    <div className={`relative rounded-lg overflow-hidden transition-all duration-300 border border-slate-800 flex flex-col group bg-gradient-to-b from-slate-900/80 to-slate-950 shadow-sm hover:shadow-${themeColorClass}-500/20 ${isPast ? 'opacity-60 grayscale-[0.6]' : ''}`}>
      <div className={`relative aspect-video overflow-hidden bg-slate-900 ${!imageLoaded ? 'animate-pulse' : ''}`}>
        <img 
          src={table.imageUrl || fallbackImage} 
          alt={table.gameName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; setImageLoaded(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50"></div>
        <div className={`absolute bottom-0 left-0 w-full h-0.5 ${isPast ? 'bg-red-600' : isRPG ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {isPast && (
            <span className="text-[6px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded backdrop-blur-sm border border-red-500/50 bg-red-900/60 text-red-300 animate-pulse">
              NON ATTIVO
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className="flex items-center gap-1">
            {isNew && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-widest shadow-lg animate-pulse">
                NEW
              </span>
            )}
            <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded backdrop-blur-md border border-white/20 shadow-xl ${isRPG ? 'bg-indigo-600/80 text-white' : 'bg-emerald-600/80 text-white'}`}>
              {isRPG ? 'GdR' : 'GdT'}
            </span>
          </div>
          <span className={`text-[6px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded backdrop-blur-sm border shadow-sm ${formatInfo.color} flex items-center gap-1`}>
            <i className={`fa-solid ${formatInfo.icon} text-[5px]`}></i>
            {formatInfo.label}
          </span>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col relative z-10">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-50 group-hover:text-white transition-colors line-clamp-1 leading-tight">{table.title}</h3>
          <p className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isRPG ? 'text-indigo-400/80' : 'text-emerald-400/80'}`}>
            {table.gameName}
          </p>
        </div>
        
        <p className="text-slate-400 text-[10px] line-clamp-1 mb-3 leading-relaxed font-medium">
          {table.description}
        </p>

        <div className="mb-3 p-2 bg-slate-950/40 rounded border border-slate-800/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {table.currentPlayers.slice(0, 3).map((p) => (
                <div key={p.id} className="relative cursor-pointer hover:z-10 transition-transform hover:-translate-y-0.5" onClick={() => onSelectMember(p.id)} title={p.name}>
                  <img src={p.avatar} className={`w-5 h-5 rounded-full border border-slate-800 shadow-sm object-cover`} alt={p.name} />
                </div>
              ))}
              {table.currentPlayers.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[6px] font-black text-slate-400 border border-slate-900 shadow-sm">
                  +{table.currentPlayers.length - 3}
                </div>
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tight ${isFull ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
              {table.currentPlayers.length}/{table.maxPlayers}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className={`flex items-center justify-between bg-slate-900/30 px-2 py-2 rounded border ${isPast ? 'border-red-500/20' : 'border-slate-800/50'}`}>
            <div className="flex items-center gap-2">
              <i className={`fa-regular fa-calendar ${isPast ? 'text-red-400' : 'text-indigo-400'} text-xs`}></i>
              <span className={`text-[11px] font-black ${isPast ? 'text-red-400/90' : 'text-slate-200'}`}>
                {new Date(table.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock text-indigo-400 text-xs"></i>
              <span className="text-[11px] font-black text-slate-200">{table.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/30 px-2 py-2 rounded border border-slate-800/50">
            <i className="fa-solid fa-location-dot text-emerald-400 text-xs"></i>
            <span className="text-[11px] font-black text-slate-200 truncate">{table.location.split(',')[0]}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-800/50">
          {!isPast ? (
            isJoined ? (
              <button onClick={() => onLeave(table.id)} className="flex-1 py-1.5 rounded text-[8px] font-black uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all">Esci</button>
            ) : (
              <button disabled={isFull} onClick={() => onJoin(table.id)} className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${isFull ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : `bg-${themeColorClass}-600 hover:bg-${themeColorClass}-500 text-white`}`}>{isFull ? 'PIENO' : 'PARTECIPA'}</button>
            )
          ) : (
            <button disabled className="flex-1 py-1.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700">CONCLUSO</button>
          )}
          
          {(isHost || isAdmin) && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(table); }} className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white transition-all flex items-center justify-center border border-slate-800"><i className="fa-solid fa-pen text-[8px]"></i></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;
