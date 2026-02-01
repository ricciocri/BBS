
import React, { useState, useRef, useEffect } from 'react';
import { GameTable, GameProposal, GameType, GameFormat, Player, DraftTable } from '../types';
import ProposalPlanner from './ProposalPlanner';

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
  onUpdateDrafts: (proposalId: string, drafts: DraftTable[]) => void;
  onDeleteDraft?: (draftId: string) => void;
  onConfirmDraft: (draft: DraftTable) => void;
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
  onDelete,
  onUpdateDrafts,
  onDeleteDraft,
  onConfirmDraft
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isTable = type === 'table';
  const table = isTable ? (data as GameTable) : null;
  const proposal = !isTable ? (data as GameProposal) : null;

  const today = '2026-01-23';
  const isInactive = isTable 
    ? table!.date < today 
    : false;

  const isRPG = data.type === GameType.RPG;
  const isJoined = isTable && currentUser ? table!.currentPlayers.some(p => p.id === currentUser.id) : false;
  const isInterested = !isTable && currentUser ? proposal!.interestedPlayerIds.includes(currentUser.id) : false;
  
  const isFull = isTable && table!.currentPlayers.length >= table!.maxPlayers;

  const participants = isTable 
    ? table!.currentPlayers 
    : allUsers.filter(u => proposal!.interestedPlayerIds.includes(u.id));

  const sortedParticipants = [...participants].sort((a, b) => (userRanks[a.id] || 999) - (userRanks[b.id] || 999));
  const canManage = (isTable && currentUser?.id === table!.hostId) || (!isTable && currentUser?.id === proposal!.proposer.id);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowScrollTop(containerRef.current.scrollTop > 300);
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    const domain = isRPG ? 'rpggeek.com' : 'boardgamegeek.com';
    return `https://${domain}/results?searchname=${encodeURIComponent(data.gameName)}`;
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(data.id);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-[80] w-12 h-12 rounded-2xl glass border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-2xl transition-all duration-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 active:scale-90 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
        title="Torna a inizio scheda"
      >
        <i className="fa-solid fa-chevron-up text-lg"></i>
      </button>

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
            <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">GIOCO BASE:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs md:text-base font-black uppercase tracking-widest">{data.gameName || 'Qualsiasi gioco'}</span>
              <a href={getGameUrl()} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <i className="fa-solid fa-external-link text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-quote-left text-indigo-500/50"></i>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descrizione</h3>
              </div>
              <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 relative shadow-inner">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
                  {data.description}
                </p>
              </div>
            </div>

            {!isTable && (
              <div className="space-y-12">
                <ProposalPlanner 
                  proposal={proposal!} 
                  currentUser={currentUser} 
                  allUsers={allUsers}
                  onUpdateDrafts={onUpdateDrafts}
                  onDeleteDraft={onDeleteDraft}
                  onConfirmDraft={onConfirmDraft}
                  onJoinProposal={() => onPrimaryAction(proposal!.id)}
                  onSelectMember={onSelectMember}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`glass p-6 rounded-3xl border ${isTable ? (isInactive ? 'border-red-500/20 bg-red-500/5' : isJoined ? 'border-red-500/20 bg-red-500/5' : 'border-indigo-500/20 bg-indigo-500/5') : (isInterested ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-800')} space-y-6 shadow-2xl`}>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                    {isTable ? 'Stato Partecipazione' : 'Stato Interesse'}
                  </p>
                  <div className={`text-2xl font-black ${isInactive ? 'text-red-400' : 'text-white'}`}>
                    {participants.length} {isTable ? `/ ${table!.maxPlayers}` : 'Interessati'}
                  </div>
                </div>

                <button 
                  disabled={isInactive || (isTable && !isJoined && isFull)}
                  onClick={() => onPrimaryAction(data.id)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    isInactive ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                    (isTable ? (isJoined ? 'bg-red-600 text-white' : isFull ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white') : (isInterested ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'))
                  } shadow-lg`}
                >
                  <i className={`fa-solid ${isInactive ? 'fa-lock' : (isTable ? (isJoined ? 'fa-door-open' : 'fa-plus') : (isInterested ? 'fa-star' : 'fa-star-half-stroke'))}`}></i>
                  {isTable ? (isJoined ? 'Lascia il Tavolo' : isFull ? 'Posti Esauriti' : 'Partecipa') : (isInterested ? 'Rimuovi Interesse' : 'Esprimi Interesse')}
                </button>
              </div>

            <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                <span>{isTable ? 'Membri del Tavolo' : 'Persone Interessate'}</span>
                <span className="text-indigo-400">{participants.length}</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {sortedParticipants.map((p) => {
                  const isOrganizer = (isTable && p.id === table!.hostId) || (!isTable && p.id === proposal!.proposer.id);
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
                          {isOrganizer && <p className="text-[7px] text-amber-500 font-black uppercase">Autore</p>}
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
