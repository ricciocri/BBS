
import React, { useState, useEffect, useMemo } from 'react';
import { Player, GameTable, GameProposal, CollectedGame, GameType } from '../types';
import GameCard from './GameCard';
import { fetchBggUserCollection } from '../services/geekService';
import GameAutocomplete from './GameAutocomplete';

interface PublicProfileProps {
  user: Player;
  userRank?: number;
  userScore?: number;
  hostedTables: GameTable[];
  joinedAsPlayerTables: GameTable[];
  userProposals: GameProposal[];
  joinedProposals: GameProposal[];
  currentUser: Player | null;
  allUsers: Player[];
  userRanks: Record<string, number>;
  onBack: () => void;
  onJoinTable: (id: string) => void;
  onLeaveTable: (id: string) => void;
  onExpressInterest: (id: string) => void;
  onSelectMember: (userId: string) => void;
  onCreateTable: () => void;
  onCreateProposal: () => void;
  onUpdateCollection: (userId: string, newCollection: CollectedGame[]) => void;
  onViewTableDetail: (table: GameTable) => void;
  onViewProposalDetail: (proposal: GameProposal) => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ 
  user, 
  userRank,
  userScore = 0,
  hostedTables,
  joinedAsPlayerTables,
  userProposals, 
  joinedProposals,
  currentUser,
  allUsers,
  userRanks,
  onBack, 
  onJoinTable, 
  onLeaveTable, 
  onExpressInterest,
  onSelectMember,
  onCreateTable,
  onCreateProposal,
  onUpdateCollection,
  onViewTableDetail,
  onViewProposalDetail
}) => {
  const isOwnProfile = currentUser?.id === user.id;
  const [collection, setCollection] = useState<CollectedGame[]>(user.collection || []);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [searchGameName, setSearchGameName] = useState('');

  const levelInfo = useMemo(() => {
    if (userScore <= 50) return { level: 1, next: 50, label: 'Novizio', progress: (userScore / 50) * 100 };
    if (userScore <= 150) return { level: 2, next: 150, label: 'Avventuriero', progress: ((userScore - 50) / 100) * 100 };
    if (userScore <= 300) return { level: 3, next: 300, label: 'Veterano', progress: ((userScore - 150) / 150) * 100 };
    if (userScore <= 600) return { level: 4, next: 600, label: 'Eroe', progress: ((userScore - 300) / 300) * 100 };
    return { level: 5, next: 1000, label: 'Leggenda', progress: 100 };
  }, [userScore]);

  useEffect(() => {
    setCollection(user.collection || []);
  }, [user]);

  const getRankBadgeStyle = (rank?: number) => {
    if (!rank) return 'bg-slate-800 text-slate-500 border-slate-700';
    if (rank === 1) return 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
    if (rank === 2) return 'bg-slate-300 text-slate-950 border-white shadow-[0_0_15px_rgba(203,213,225,0.4)]';
    if (rank === 3) return 'bg-orange-600 text-white border-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.4)]';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const ActivityCounter = ({ icon, color, count, label, title }: { icon: string, color: string, count: number, label: string, title: string }) => (
    <div className="flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors" title={title}>
      <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-400 shrink-0 border border-${color}-500/20`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black text-white leading-none">{count}</span>
        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );

  const handleAddGameToCollection = (name: string, geekId?: string, imageUrl?: string, type?: GameType) => {
    const exists = collection.find(g => (geekId && g.geekId === geekId) || (g.name.toLowerCase() === name.toLowerCase()));
    if (exists) return;

    const newGame: CollectedGame = {
      id: Date.now().toString(),
      name,
      type: type || GameType.BOARD_GAME,
      imageUrl,
      geekId
    };
    
    const newCollection = [...collection, newGame];
    setCollection(newCollection);
    onUpdateCollection(user.id, newCollection);
    setSearchGameName('');
  };

  const handleRemoveGame = (id: string) => {
    const newCollection = collection.filter(g => g.id !== id);
    setCollection(newCollection);
    onUpdateCollection(user.id, newCollection);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="glass rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 -mr-24 -mt-24 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-slate-800 shadow-2xl object-cover" />
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest ${getRankBadgeStyle(userRank)}`}>
                 #{userRank || '?'}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full min-w-[160px]">
              <ActivityCounter icon="fa-crown" color="amber" count={hostedTables.length} label="Host" title="Tavoli Organizzati" />
              <ActivityCounter icon="fa-people-group" color="emerald" count={joinedAsPlayerTables.length} label="Play" title="Tavoli Partecipati" />
              <ActivityCounter icon="fa-lightbulb" color="amber" count={userProposals.length} label="Idea" title="Proposte Lanciate" />
              <ActivityCounter icon="fa-star" color="indigo" count={joinedProposals.length} label="Star" title="Interessi Espressi" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl font-fantasy font-bold text-white tracking-tight">
                {user.name}
              </h2>
              {user.isAdmin && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-amber-500/20">
                  ADMIN
                </span>
              )}
            </div>
            
            <div className="w-full max-w-md mb-8 space-y-3">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{levelInfo.label} (Liv. {levelInfo.level})</span>
                <span className="text-[10px] font-bold text-slate-500">{userScore} / {levelInfo.next} XP</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%] animate-pulse rounded-full transition-all duration-1000 ease-out" style={{ width: `${levelInfo.progress}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {isOwnProfile && (
                <>
                  <button onClick={onCreateTable} className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group">
                    <i className="fa-solid fa-plus-circle group-hover:rotate-90 transition-transform"></i> Nuovo Tavolo
                  </button>
                  <button onClick={onCreateProposal} className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xl shadow-amber-600/20 flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Proponi
                  </button>
                </>
              )}
              <button onClick={() => setIsCollectionModalOpen(true)} className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center gap-2">
                <i className="fa-solid fa-box-archive text-emerald-400"></i> Collezione ({collection.length})
              </button>
              <button onClick={onBack} className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-arrow-left-long"></i> Torna
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-fantasy font-bold text-white flex items-center gap-3">
                <i className="fa-solid fa-box-archive text-emerald-400"></i>
                {isOwnProfile ? 'La Mia Collezione' : `Collezione di ${user.name}`}
              </h2>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            {isOwnProfile && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Cerca e Aggiungi (GDT o GDR)</p>
                    <GameAutocomplete 
                      value={searchGameName}
                      onChange={handleAddGameToCollection}
                      placeholder="Cerca gioco, manuale o espansione..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
              {collection.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
                  {collection.map((game) => (
                    <div key={game.id} className={`bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 group transition-colors ${game.type === GameType.RPG ? 'hover:border-indigo-500/30' : 'hover:border-emerald-500/30'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0 overflow-hidden border border-slate-700 flex items-center justify-center">
                          {game.imageUrl ? (
                            <img src={game.imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <i className={`fa-solid ${game.type === GameType.RPG ? 'fa-dice-d20' : 'fa-dice-six'} text-slate-600`}></i>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-200 truncate">{game.name}</p>
                          <p className={`text-[8px] font-black uppercase tracking-tighter ${game.type === GameType.RPG ? 'text-indigo-400' : 'text-emerald-400'}`}>
                            {game.type === GameType.RPG ? 'RPG System' : 'Board Game'}
                          </p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <button 
                          onClick={() => handleRemoveGame(game.id)}
                          className="w-8 h-8 rounded-lg bg-red-900/10 text-red-500/40 hover:text-red-500 hover:bg-red-900/20 transition-all flex items-center justify-center shrink-0"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-40">
                  <i className="fa-solid fa-box-open text-5xl mb-4"></i>
                  <p className="text-sm font-bold uppercase tracking-widest">La collezione è vuota</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <button 
                onClick={() => setIsCollectionModalOpen(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-16 mt-12">
        {/* SEZIONE: TAVOLI CREATI */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <i className="fa-solid fa-crown"></i>
              </div>
              Tavoli Organizzati
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {hostedTables.length} sessioni
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {hostedTables.length > 0 ? (
              hostedTables.map((table, i) => (
                <GameCard key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} index={hostedTables.length - i} onPrimaryAction={currentUser && table.currentPlayers.some(p => p.id === currentUser.id) ? onLeaveTable : onJoinTable} onEdit={() => {}} onDelete={() => {}} onSelectMember={onSelectMember} onViewDetail={onViewTableDetail} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center glass rounded-2xl border-2 border-dashed border-slate-800">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Nessun tavolo organizzato</p>
              </div>
            )}
          </div>
        </section>

        {/* SEZIONE: TAVOLI PARTECIPATI */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <i className="fa-solid fa-people-group"></i>
              </div>
              Tavoli Partecipati
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {joinedAsPlayerTables.length} sessioni
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {joinedAsPlayerTables.length > 0 ? (
              joinedAsPlayerTables.map((table, i) => (
                <GameCard key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} index={joinedAsPlayerTables.length - i} onPrimaryAction={onLeaveTable} onEdit={() => {}} onDelete={() => {}} onSelectMember={onSelectMember} onViewDetail={onViewTableDetail} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center glass rounded-2xl border-2 border-dashed border-slate-800">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Nessun tavolo partecipato</p>
              </div>
            )}
          </div>
        </section>

        {/* SEZIONE: PROPOSTE CREATE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              Proposte Lanciate
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {userProposals.length} idee
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {userProposals.length > 0 ? (
              userProposals.map((proposal, i) => (
                <GameCard key={proposal.id} type="proposal" data={proposal} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} index={userProposals.length - i} onPrimaryAction={onExpressInterest} onEdit={() => {}} onDelete={() => {}} onSelectMember={onSelectMember} onViewDetail={onViewProposalDetail} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center glass rounded-2xl border-2 border-dashed border-slate-800">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Nessuna proposta creata</p>
              </div>
            )}
          </div>
        </section>

        {/* SEZIONE: INTERESSI ESPRESSI */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <i className="fa-solid fa-star"></i>
              </div>
              Interessi Espressi
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {joinedProposals.length} star
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {joinedProposals.length > 0 ? (
              joinedProposals.map((proposal, i) => (
                <GameCard key={proposal.id} type="proposal" data={proposal} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} index={joinedProposals.length - i} onPrimaryAction={onExpressInterest} onEdit={() => {}} onDelete={() => {}} onSelectMember={onSelectMember} onViewDetail={onViewProposalDetail} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center glass rounded-2xl border-2 border-dashed border-slate-800">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Nessun interesse espresso</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicProfile;
