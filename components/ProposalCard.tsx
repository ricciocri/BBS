
import React, { useState, useMemo } from 'react';
import { GameProposal, Player, GameType } from '../types';

interface ProposalCardProps {
  proposal: GameProposal;
  currentUser: Player | null;
  allUsers: Player[];
  userRanks: Record<string, number>;
  onExpressInterest: (id: string) => void;
  onConvert: (proposal: GameProposal) => void;
  onEdit: (proposal: GameProposal) => void;
  onDelete: (id: string) => void;
  onSelectMember: (userId: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  proposal, 
  currentUser, 
  allUsers, 
  userRanks, 
  onExpressInterest, 
  onConvert, 
  onEdit,
  onDelete, 
  onSelectMember 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isInterested = currentUser ? !!proposal.userPreferences[currentUser.id] : false;
  const isProposer = currentUser?.id === proposal.proposer.id;
  const isAdmin = currentUser?.isAdmin;
  
  const interestedIds = Object.keys(proposal.userPreferences);
  const SYSTEM_NOW = new Date('2026-01-23T08:06:00').getTime();
  const progress = Math.min((interestedIds.length / proposal.maxPlayersGoal) * 100, 100);
  const isFull = interestedIds.length >= proposal.maxPlayersGoal;

  const isNew = useMemo(() => {
    const created = new Date(proposal.createdAt).getTime();
    return (SYSTEM_NOW - created) < 24 * 60 * 60 * 1000;
  }, [proposal.createdAt, SYSTEM_NOW]);

  const interestedPlayers = useMemo(() => {
    return allUsers.filter(u => interestedIds.includes(u.id));
  }, [proposal.userPreferences, allUsers, interestedIds]);

  const fallbackImage = proposal.type === GameType.RPG 
    ? 'https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=400&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1585504198199-20277593b94f?q=80&w=400&auto=format&fit=crop';

  return (
    <div className="relative rounded-lg overflow-hidden transition-all duration-300 border border-slate-800 flex flex-col group bg-gradient-to-b from-slate-900/80 to-slate-950 shadow-sm hover:border-amber-500/50 hover:shadow-amber-500/20">
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Immagine Card Densificata */}
      <div className={`relative aspect-video overflow-hidden bg-slate-900 ${!imageLoaded ? 'animate-pulse' : ''}`}>
        <img 
          src={proposal.imageUrl || fallbackImage} 
          alt={proposal.gameName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
            setImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
        
        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-slate-950/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white">
           <i className="fa-solid fa-lightbulb text-[10px] text-amber-400"></i>
        </div>

        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
          <span className="text-[5px] uppercase font-black tracking-widest px-1 py-0.5 rounded backdrop-blur-sm border border-white/10 shadow-sm bg-amber-900/60 text-amber-300">
            PROP.
          </span>
          <div className="flex items-center gap-1">
            {isNew && (
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-widest shadow-lg animate-pulse">
                NEW
              </span>
            )}
            <span className={`text-[7px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded backdrop-blur-md border border-white/20 shadow-xl ${proposal.type === GameType.RPG ? 'bg-indigo-600/80 text-white' : 'bg-emerald-600/80 text-white'}`}>
              {proposal.type === GameType.RPG ? 'GdR' : 'GDT'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col relative z-10">
        <div className="mb-1.5">
          <h3 className="text-[11px] font-bold text-slate-50 group-hover:text-amber-400 transition-colors line-clamp-1 leading-tight">{proposal.title}</h3>
          <p className="text-[8px] font-black uppercase tracking-tighter text-amber-500/80 leading-none">
            {proposal.gameName || 'Qualsiasi Gioco'}
          </p>
        </div>
        
        <p className="text-slate-400 text-[9px] line-clamp-1 mb-2 leading-relaxed font-medium">
          {proposal.description}
        </p>

        {/* Partecipanti Interessati Densificati */}
        <div className="mb-2 p-1.5 bg-slate-950/40 rounded border border-slate-800/50 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1">
              {interestedPlayers.slice(0, 3).map((p) => (
                <div key={p.id} className="relative cursor-pointer hover:z-10 transition-transform hover:-translate-y-0.5" onClick={() => onSelectMember(p.id)}>
                  <img src={p.avatar} className="w-4 h-4 rounded-full border border-slate-800 shadow-sm object-cover" alt={p.name} />
                </div>
              ))}
              {interestedPlayers.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[5px] font-black text-slate-400 border border-slate-900 shadow-sm">
                  +{interestedPlayers.length - 3}
                </div>
              )}
            </div>
            <span className={`text-[7px] font-black uppercase tracking-tight ${isFull ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
              {interestedIds.length}/{proposal.maxPlayersGoal}
            </span>
          </div>
          <div className="h-0.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 ease-out bg-amber-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Metadati densificati */}
        <div className="grid grid-cols-2 gap-1 mb-2">
          <div className="flex items-center gap-1 bg-slate-900/30 px-1.5 py-1 rounded border border-slate-800/50">
            <i className="fa-regular fa-calendar text-amber-400 text-[6px]"></i>
            <span className="text-[7px] font-bold text-slate-400">
              {new Date(proposal.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div onClick={() => onSelectMember(proposal.proposer.id)} className="flex items-center gap-1 bg-slate-900/30 px-1.5 py-1 rounded border border-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
            <i className="fa-solid fa-user-pen text-amber-400 text-[6px]"></i>
            <span className="text-[7px] font-bold text-slate-400 truncate">{proposal.proposer.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-auto pt-1.5 border-t border-slate-800/50">
          <button 
            onClick={() => onExpressInterest(proposal.id)} 
            className={`flex-1 py-1 rounded text-[7px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1 ${
              isInterested ? 'bg-amber-600/10 text-amber-500 border-amber-600/20 hover:bg-amber-600 hover:text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <i className={`fa-${isInterested ? 'solid' : 'regular'} fa-star text-[6px]`}></i>
            <span>Interessati</span>
          </button>
          
          <button onClick={() => onConvert(proposal)} className="flex-1 py-1 rounded text-[7px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/10 transition-all active:scale-95">
            Sandbox
          </button>

          {(isProposer || isAdmin) && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(proposal); }} className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white transition-all flex items-center justify-center border border-slate-800">
              <i className="fa-solid fa-pen text-[7px]"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;
