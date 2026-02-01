
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Player, GameTable, GameProposal, CollectedGame, GameType } from '../types';
import GameCard from './GameCard';
import { getGeekGameDetails } from '../services/geekService';
import { fetchBggUserCollection } from '../services/bggService';
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
  onUpdateUser?: (user: Player) => void;
  onViewTableDetail: (table: GameTable) => void;
  onViewProposalDetail: (proposal: GameProposal) => void;
  lastVisitBoundary: string;
}

type CollectionSortMode = 'alpha' | 'rank' | 'difficulty' | 'duration';
type AddMode = 'single' | 'import';

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
  onUpdateUser,
  onViewTableDetail,
  onViewProposalDetail,
  lastVisitBoundary
}) => {
  const isOwnProfile = currentUser?.id === user.id;
  const [collection, setCollection] = useState<CollectedGame[]>(user.collection || []);
  const [searchGameName, setSearchGameName] = useState('');
  
  const [addMode, setAddMode] = useState<AddMode>('single');
  const [bggUsername, setBggUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{msg: string, type: 'success' | 'error' | 'none'}>({msg: '', type: 'none'});
  
  const [gameToDelete, setGameToDelete] = useState<CollectedGame | null>(null);
  const [selectedPendingGame, setSelectedPendingGame] = useState<{name: string, geekId?: string, imageUrl?: string, type?: GameType} | null>(null);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  
  const [collectionQuery, setCollectionQuery] = useState('');
  const [sortMode, setSortMode] = useState<CollectionSortMode>('alpha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterMinPlayers, setFilterMinPlayers] = useState<number | ''>('');
  const [filterMaxPlayers, setFilterMaxPlayers] = useState<number | ''>('');
  const [filterDifficultyRange, setFilterDifficultyRange] = useState<string>('all');
  const [filterMinDuration, setFilterMinDuration] = useState<number | ''>('');
  const [filterMaxDuration, setFilterMaxDuration] = useState<number | ''>('');
  const [filterMinYear, setFilterMinYear] = useState<number | ''>('');
  const [filterMaxYear, setFilterMaxYear] = useState<number | ''>('');
  
  const [selectedTypes, setSelectedTypes] = useState<GameType[]>([GameType.BOARD_GAME, GameType.RPG]);

  const [appliedFilters, setAppliedFilters] = useState({
    minPlayers: '' as number | '',
    maxPlayers: '' as number | '',
    difficultyRange: 'all',
    minDuration: '' as number | '',
    maxDuration: '' as number | '',
    minYear: '' as number | '',
    maxYear: '' as number | ''
  });

  const collectionRef = useRef<HTMLElement>(null);
  const activityRef = useRef<HTMLElement>(null);
  const userDataRef = useRef<HTMLElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const levelInfo = useMemo(() => {
    if (userScore <= 50) return { level: 1, next: 50, label: 'Novizio', progress: (userScore / 50) * 100 };
    if (userScore <= 150) return { level: 2, next: 150, label: 'Avventuriero', progress: ((userScore - 50) / 100) * 100 };
    if (userScore <= 300) return { level: 3, next: 300, label: 'Veterano', progress: ((userScore - 150) / 150) * 100 };
    if (userScore <= 600) return { level: 4, next: 600, label: 'Eroe', progress: ((userScore - 300) / 300) * 100 };
    return { level: 5, next: 1000, label: 'Leggenda', progress: 100 };
  }, [userScore]);

  useEffect(() => {
    setCollection(user.collection || []);
  }, [user.collection]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateUser({ ...user, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      minPlayers: filterMinPlayers,
      maxPlayers: filterMaxPlayers,
      difficultyRange: filterDifficultyRange,
      minDuration: filterMinDuration,
      maxDuration: filterMaxDuration,
      minYear: filterMinYear,
      maxYear: filterMaxYear
    });
  };

  const resetFilters = () => {
    setFilterMinPlayers('');
    setFilterMaxPlayers('');
    setFilterDifficultyRange('all');
    setFilterMinDuration('');
    setFilterMaxDuration('');
    setFilterMinYear('');
    setFilterMaxYear('');
    const emptyFilters = {
      minPlayers: '' as number | '',
      maxPlayers: '' as number | '',
      difficultyRange: 'all',
      minDuration: '' as number | '',
      maxDuration: '' as number | '',
      minYear: '' as number | '',
      maxYear: '' as number | ''
    };
    setAppliedFilters(emptyFilters);
    setSelectedTypes([GameType.BOARD_GAME, GameType.RPG]);
    setCollectionQuery('');
  };

  const filteredAndSortedCollection = useMemo(() => {
    let result = [...collection];

    if (collectionQuery.trim() !== '') {
      const q = collectionQuery.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }

    result = result.filter(g => selectedTypes.includes(g.type));

    if (appliedFilters.minPlayers !== '') {
      result = result.filter(g => (g.maxPlayers || 0) >= (appliedFilters.minPlayers as number));
    }
    if (appliedFilters.maxPlayers !== '') {
      result = result.filter(g => (g.minPlayers || 0) <= (appliedFilters.maxPlayers as number));
    }

    if (appliedFilters.difficultyRange !== 'all') {
      const [min, max] = appliedFilters.difficultyRange.split('-').map(Number);
      result = result.filter(g => !g.difficulty || (g.difficulty >= min && g.difficulty <= max));
    }

    if (appliedFilters.minDuration !== '') {
      result = result.filter(g => (g.maxDuration || g.duration || 0) >= (appliedFilters.minDuration as number));
    }
    if (appliedFilters.maxDuration !== '') {
      result = result.filter(g => (g.minDuration || g.duration || 0) <= (appliedFilters.maxDuration as number));
    }

    if (appliedFilters.minYear !== '' || appliedFilters.maxYear !== '') {
      result = result.filter(g => {
        const year = g.yearpublished ? parseInt(g.yearpublished) : NaN;
        if (isNaN(year)) return false;
        let matches = true;
        if (appliedFilters.minYear !== '') matches = matches && year >= (appliedFilters.minYear as number);
        if (appliedFilters.maxYear !== '') matches = matches && year <= (appliedFilters.maxYear as number);
        return matches;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortMode === 'alpha') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortMode === 'rank') {
        const rankA = (a.rank && a.rank > 0) ? a.rank : 999999;
        const rankB = (b.rank && b.rank > 0) ? b.rank : 999999;
        comparison = rankA - rankB;
      } else if (sortMode === 'difficulty') {
        const diffA = a.difficulty || 0;
        const diffB = b.difficulty || 0;
        comparison = diffA - diffB;
      } else if (sortMode === 'duration') {
        const durA = a.duration || 0;
        const durB = b.duration || 0;
        comparison = durA - durB;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [collection, collectionQuery, sortMode, sortDir, appliedFilters, selectedTypes]);

  const toggleType = (type: GameType) => {
    setSelectedTypes(prev => {
      const next = prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type];
      return next.length === 0 ? [GameType.BOARD_GAME, GameType.RPG] : next;
    });
  };

  const handleAutocompleteSelect = (name: string, geekId?: string, imageUrl?: string, type?: GameType) => {
    setSearchGameName(name);
    if (geekId) {
      setSelectedPendingGame({ name, geekId, imageUrl, type });
    } else {
      setSelectedPendingGame(null);
    }
  };

  const handleAddConfirm = async () => {
    if (!selectedPendingGame) return;
    
    setIsAddingToCollection(true);
    const { name, geekId, imageUrl, type } = selectedPendingGame;

    const exists = collection.find(g => (geekId && g.geekId === geekId) || (g.name.toLowerCase() === name.toLowerCase()));
    if (exists) {
      alert("Questo gioco è già presente nella tua collezione!");
      setIsAddingToCollection(false);
      return;
    }

    let meta: Partial<CollectedGame> = {};
    if (geekId) {
      try {
        const details = await getGeekGameDetails(geekId, type || GameType.BOARD_GAME);
        meta = {
          ...details,
          imageUrl: details.image || imageUrl
        } as any;
      } catch (e) { 
        console.error("Err metadata:", e); 
      }
    }

    const newGame: CollectedGame = {
      id: Date.now().toString(),
      name,
      type: type || GameType.BOARD_GAME,
      imageUrl: meta.imageUrl || imageUrl,
      geekId,
      ...meta
    };
    
    setCollection(prev => {
      const next = [...prev, newGame];
      onUpdateCollection(user.id, next);
      return next;
    });

    setSelectedPendingGame(null);
    setSearchGameName('');
    setIsAddingToCollection(false);
  };

  const handleImportBgg = async () => {
    if (!bggUsername.trim()) return;
    
    setIsImporting(true);
    setImportStatus({ msg: 'Navigazione verso il tuo profilo BGG...', type: 'none' });
    
    try {
      const cleanUsername = bggUsername.trim().toLowerCase();
      const importedGames = await fetchBggUserCollection(cleanUsername);
      
      if (importedGames.length === 0) {
        setImportStatus({ 
          msg: `Nessun gioco trovato per lo username "${cleanUsername}". Assicurati che sia lo "handle" corretto e che la collezione sia pubblica.`, 
          type: 'error' 
        });
      } else {
        const currentIds = new Set(collection.map(g => g.geekId).filter(id => !!id));
        const currentNames = new Set(collection.map(g => g.name.toLowerCase()));
        
        const newGames = importedGames.filter(ig => 
          !currentIds.has(ig.geekId) && !currentNames.has(ig.name.toLowerCase())
        );

        if (newGames.length === 0) {
          setImportStatus({ msg: 'La tua collezione è già aggiornata!', type: 'success' });
        } else {
          const updatedCollection = [...collection, ...newGames];
          setCollection(updatedCollection);
          onUpdateCollection(user.id, updatedCollection);
          setImportStatus({ msg: `Ottimo! Abbiamo aggiunto ${newGames.length} nuovi giochi dalla tua collezione BGG.`, type: 'success' });
          setBggUsername('');
        }
      }
    } catch (e: any) {
      console.error("Errore importazione:", e);
      setImportStatus({ msg: e.message || 'Errore tecnico durante l\'importazione.', type: 'error' });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportStatus(prev => ({...prev, msg: prev.type === 'success' ? '' : prev.msg, type: prev.type === 'success' ? 'none' : prev.type})), 7000);
    }
  };

  const confirmRemoval = () => {
    if (!gameToDelete) return;
    setCollection(prev => {
      const next = prev.filter(g => g.id !== gameToDelete.id);
      onUpdateCollection(user.id, next);
      return next;
    });
    setGameToDelete(null);
  };

  const handleRemoveGameClick = (e: React.MouseEvent, game: CollectedGame) => {
    e.stopPropagation();
    e.preventDefault();
    setGameToDelete(game);
  };

  const getBggUrl = (game: CollectedGame) => {
    if (game.geekId) {
      return game.type === GameType.RPG 
        ? `https://rpggeek.com/rpg/${game.geekId}` 
        : `https://boardgamegeek.com/boardgame/${game.geekId}`;
    } else {
      const domain = game.type === GameType.RPG ? 'rpggeek.com' : 'boardgamegeek.com';
      return `https://${domain}/results?searchname=${encodeURIComponent(game.name)}`;
    }
  };

  const openGeekPage = (game: CollectedGame) => {
    window.open(getBggUrl(game), '_blank');
  };

  const FALLBACK_ICON_URL = "https://cf.geekdo-images.com/Cr0z-yDOu7GqlIhMhSvHnQ__imagepage@2x/img/VjsGk_8gY4nAhbfYxMtvtm368Zc=/fit-in/1800x1200/filters:strip_icc()/pic7631734.jpg";

  const SectionHeader = ({ icon, title, count, color = 'indigo' }: { icon: string, title: string, count: number, color?: string }) => (
    <div className="flex items-center gap-4 px-2 mb-6">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20 text-${color}-400 shadow-inner`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">{title}</h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{count} elementi</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent ml-2"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {gameToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-sm rounded-[2rem] p-8 border border-red-500/30 shadow-2xl shadow-red-500/10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <i className="fa-solid fa-trash-can text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Sei sicuro?</h3>
            <p className="text-slate-400 text-sm text-center mb-8">
              Stai per rimuovere <strong className="text-white">"{gameToDelete.name}"</strong> dalla tua collezione. Questa azione non può essere annullata.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmRemoval}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                Sì, elimina gioco
              </button>
              <button 
                onClick={() => setGameToDelete(null)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 -mr-24 -mt-24 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div 
              className={`relative ${isOwnProfile ? 'cursor-pointer group' : ''}`}
              onClick={() => isOwnProfile && avatarInputRef.current?.click()}
              title={isOwnProfile ? 'Cambia immagine profilo' : ''}
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-slate-800 shadow-2xl object-cover transition-all ${isOwnProfile ? 'group-hover:brightness-75 group-hover:scale-[1.02]' : ''}`} 
              />
              
              {isOwnProfile && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/80 flex items-center justify-center text-white shadow-xl mb-1">
                      <i className="fa-solid fa-camera text-sm"></i>
                    </div>
                    <span className="text-[7px] font-black text-white uppercase tracking-tighter bg-indigo-600 px-1.5 py-0.5 rounded shadow">Modifica</span>
                  </div>
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                  />
                </>
              )}

              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest ${userRank === 1 ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                 #{userRank || '?'}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full min-w-[160px]">
              <ActivityCounter icon="fa-crown" color="amber" count={hostedTables.length} label="Host" title="Organizzati" />
              <ActivityCounter icon="fa-people-group" color="emerald" count={joinedAsPlayerTables.length} label="Play" title="Partecipati" />
              <ActivityCounter icon="fa-lightbulb" color="amber" count={userProposals.length} label="Idea" title="Proposte" />
              <ActivityCounter icon="fa-star" color="indigo" count={joinedProposals.length} label="Star" title="Mi interessa" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl font-fantasy font-bold text-white tracking-tight">{user.name}</h2>
              {user.isAdmin && <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-amber-500/20">ADMIN</span>}
            </div>
            
            <div className="w-full max-w-md mb-8 space-y-3">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{levelInfo.label} (Liv. {levelInfo.level})</span>
                <span className="text-[10px] font-bold text-slate-500">{userScore} / {levelInfo.next} XP</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${levelInfo.progress}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {isOwnProfile && (
                <>
                  <button onClick={onCreateTable} className="min-w-[160px] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
                    <i className="fa-solid fa-plus-circle group-hover:rotate-90 transition-transform"></i> Nuovo Tavolo
                  </button>
                  <button onClick={onCreateProposal} className="min-w-[160px] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Proponi
                  </button>
                </>
              )}
              <button onClick={() => activityRef.current?.scrollIntoView({ behavior: 'smooth' })} className="min-w-[160px] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center justify-center gap-2">
                <i className="fa-solid fa-bolt-lightning text-amber-400"></i> Attività
              </button>
              <button onClick={() => collectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="min-w-[160px] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center justify-center gap-2">
                <i className="fa-solid fa-box-archive text-emerald-400"></i> Collezione ({collection.length})
              </button>
              <button onClick={() => userDataRef.current?.scrollIntoView({ behavior: 'smooth' })} className="min-w-[160px] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center justify-center gap-2">
                <i className="fa-solid fa-user-gear text-indigo-400"></i> I Miei Dati
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        <section ref={activityRef} className="space-y-12">
          <div className="animate-in fade-in duration-500">
            <SectionHeader icon="fa-crown" title="Tavoli Organizzati" count={hostedTables.length} color="amber" />
            {hostedTables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedTables.map((table) => (
                  <GameCard 
                    key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
                    onPrimaryAction={onJoinTable} onEdit={onViewTableDetail} onDelete={() => {}}
                    onSelectMember={onSelectMember} onViewDetail={onViewTableDetail}
                    lastVisitBoundary={lastVisitBoundary}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-10 glass rounded-3xl border border-slate-800 text-slate-500 text-xs italic">Nessun tavolo organizzato al momento.</p>
            )}
          </div>

          <div className="animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
            <SectionHeader icon="fa-people-group" title="Partecipazioni" count={joinedAsPlayerTables.length} color="emerald" />
            {joinedAsPlayerTables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedAsPlayerTables.map((table) => (
                  <GameCard 
                    key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
                    onPrimaryAction={onLeaveTable} onEdit={onViewTableDetail} onDelete={() => {}}
                    onSelectMember={onSelectMember} onViewDetail={onViewTableDetail}
                    lastVisitBoundary={lastVisitBoundary}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-10 glass rounded-3xl border border-slate-800 text-slate-500 text-xs italic">Nessuna partecipazione attiva.</p>
            )}
          </div>

          <div className="animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
            <SectionHeader icon="fa-lightbulb" title="Proposte" count={userProposals.length} color="amber" />
            {userProposals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProposals.map((prop) => (
                  <GameCard 
                    key={prop.id} type="proposal" data={prop} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
                    onPrimaryAction={onExpressInterest} onEdit={onViewProposalDetail} onDelete={() => {}}
                    onSelectMember={onSelectMember} onViewDetail={onViewProposalDetail}
                    lastVisitBoundary={lastVisitBoundary}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-10 glass rounded-3xl border border-slate-800 text-slate-500 text-xs italic">Nessuna proposta lanciata.</p>
            )}
          </div>

          <div className="animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
            <SectionHeader icon="fa-star" title="Mi interessa" count={joinedProposals.length} color="indigo" />
            {joinedProposals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedProposals.map((prop) => (
                  <GameCard 
                    key={prop.id} type="proposal" data={prop} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
                    onPrimaryAction={onExpressInterest} onEdit={onViewProposalDetail} onDelete={() => {}}
                    onSelectMember={onSelectMember} onViewDetail={onViewProposalDetail}
                    lastVisitBoundary={lastVisitBoundary}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-10 glass rounded-3xl border border-slate-800 text-slate-500 text-xs italic">Anora nessun interesse espresso.</p>
            )}
          </div>
        </section>

        <section ref={userDataRef} className="space-y-8 pt-12 border-t border-slate-800/50 animate-in fade-in duration-700">
           <div className="flex flex-col gap-6 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><i className="fa-solid fa-user-gear"></i></div>
              I Miei Dati & Account
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-3xl border border-slate-800 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nome Visualizzato</label>
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white">
                    {user.name}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Username Tecnico</label>
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 italic">
                    @{user.username || user.name.toLowerCase()}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Ruolo Community</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {user.isAdmin ? 'Amministratore' : 'Membro Society'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-slate-800 lg:col-span-2 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <h4 className="text-lg font-bold text-white">Progressione Karma</h4>
                      <p className="text-xs text-slate-500">Analisi dettagliata della tua attività nella Society.</p>
                   </div>
                   <div className="bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 rounded-2xl flex items-center gap-3">
                      <i className="fa-solid fa-award text-indigo-400 text-xl"></i>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter leading-none">Grado Attuale</span>
                        <span className="text-sm font-black text-white uppercase tracking-widest">{levelInfo.label}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/30 border border-slate-800/50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Leadership (Organizzatore)</span>
                      <span className="text-xs font-bold text-amber-400">{hostedTables.length * 10} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min((hostedTables.length / 10) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-[8px] text-slate-600 mt-2">Punteggio ottenuto ospitando nuovi tavoli.</p>
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800/50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Socialità (Giocatore)</span>
                      <span className="text-xs font-bold text-emerald-400">{joinedAsPlayerTables.length * 5} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min((joinedAsPlayerTables.length / 20) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-[8px] text-slate-600 mt-2">Punteggio ottenuto partecipando a sessioni.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                   <p className="text-[9px] text-slate-500 uppercase font-bold">Posizione Globale: <span className="text-white">#{userRank || '?'}</span></p>
                   {isOwnProfile && (
                     <button className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                       <i className="fa-solid fa-pen-to-square"></i> Modifica Profilo (Beta)
                     </button>
                   )}
                </div>
              </div>
            </div>
           </div>
        </section>

        <section ref={collectionRef} className="space-y-8 pt-12 border-t border-slate-800/50">
          <div className="flex flex-col gap-6 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><i className="fa-solid fa-box-archive"></i></div>
              Collezione Personale
            </h3>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative shrink-0">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
                  <input 
                    type="text" 
                    placeholder="Cerca in collezione..." 
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-[10px] text-white outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[200px]"
                    value={collectionQuery}
                    onChange={(e) => setCollectionQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-slate-900/50 p-0.5 rounded-xl border border-slate-800 w-36 shrink-0">
                  <button 
                    onClick={() => toggleType(GameType.BOARD_GAME)} 
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${selectedTypes.includes(GameType.BOARD_GAME) ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <i className="fa-solid fa-dice-six"></i> BG
                  </button>
                  <button 
                    onClick={() => toggleType(GameType.RPG)} 
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${selectedTypes.includes(GameType.RPG) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <i className="fa-solid fa-dice-d20"></i> GDR
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <div className="flex flex-wrap bg-slate-900/50 p-1 rounded-xl border border-slate-800 gap-1">
                  <button onClick={() => { if (sortMode === 'alpha') setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortMode('alpha'); setSortDir('asc'); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${sortMode === 'alpha' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><i className={`fa-solid ${sortDir === 'asc' && sortMode === 'alpha' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up'}`}></i> AZ</button>
                  <button onClick={() => { if (sortMode === 'rank') setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortMode('rank'); setSortDir('asc'); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${sortMode === 'rank' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} title="BGG Rank Overall"><i className={`fa-solid ${sortDir === 'asc' && sortMode === 'rank' ? 'fa-arrow-down-1-9' : 'fa-arrow-up-9-1'}`}></i> Rank</button>
                  <button onClick={() => { if (sortMode === 'difficulty') setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortMode('difficulty'); setSortDir('asc'); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${sortMode === 'difficulty' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} title="Peso (Difficoltà)"><i className="fa-solid fa-brain"></i> Peso</button>
                  <button onClick={() => { if (sortMode === 'duration') setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortMode('duration'); setSortDir('asc'); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${sortMode === 'duration' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} title="Durata"><i className="fa-solid fa-clock"></i> Durata</button>
                </div>

                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${showFilters ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <i className="fa-solid fa-filter"></i> {showFilters ? 'Nascondi' : 'Filtri Avanzati'}
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giocatori (Range)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" placeholder="Da" value={filterMinPlayers} onChange={e => setFilterMinPlayers(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50" />
                  <input type="number" min="1" placeholder="A" value={filterMaxPlayers} onChange={e => setFilterMaxPlayers(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Difficoltà (Peso)</label>
                <select 
                  value={filterDifficultyRange} 
                  onChange={e => setFilterDifficultyRange(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="all">Qualsiasi</option>
                  <option value="1.0-1.5">Leggero (1.0 - 1.5)</option>
                  <option value="1.5-2.5">Medio-Light (1.5 - 2.5)</option>
                  <option value="2.5-3.5">Medio (2.5 - 3.5)</option>
                  <option value="3.5-4.5">Medio-Heavy (3.5 - 4.5)</option>
                  <option value="4.5-5.0">Expert (4.5 - 5.0)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Durata (Minuti)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" placeholder="Da" value={filterMinDuration} onChange={e => setFilterMinDuration(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50" />
                  <input type="number" min="0" placeholder="A" value={filterMaxDuration} onChange={e => setFilterMaxDuration(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Anno Pubblicazione</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Da" value={filterMinYear} onChange={e => setFilterMinYear(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 md:px-3 md:py-2 text-base md:text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/50" />
                  <input type="number" placeholder="A" value={filterMaxYear} onChange={e => setFilterMaxYear(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 md:px-3 md:py-2 text-base md:text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/50" />
                </div>
              </div>

              <div className="lg:col-span-4 flex items-center justify-between pt-4 border-t border-slate-800/50 mt-2">
                <button onClick={resetFilters} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                   <i className="fa-solid fa-trash-can"></i> Resetta
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <i className="fa-solid fa-check-circle"></i> Applica Filtri
                </button>
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div className="max-w-xl mx-auto mb-12 relative z-[100]">
              <div className="glass p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {addMode === 'single' ? 'Aggiungi alla Collezione' : 'Importa da BoardGameGeek'}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setAddMode('single'); setImportStatus({msg: '', type: 'none'}); }}
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${addMode === 'single' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      Manuale
                    </button>
                    <span className="text-slate-800">/</span>
                    <button 
                      onClick={() => { setAddMode('import'); setSelectedPendingGame(null); setSearchGameName(''); }}
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${addMode === 'import' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      Importa BGG
                    </button>
                  </div>
                </div>

                {addMode === 'single' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <GameAutocomplete 
                        value={searchGameName} 
                        onChange={handleAutocompleteSelect} 
                        placeholder="Cerca titolo su BGG/RPGGeek..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white text-base outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold" 
                      />
                      {selectedPendingGame && (
                        <button 
                          onClick={handleAddConfirm}
                          disabled={isAddingToCollection}
                          className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 animate-in zoom-in duration-300"
                        >
                          {isAddingToCollection ? (
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                          ) : (
                            <i className="fa-solid fa-plus-circle"></i>
                          )}
                          Aggiungi
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative w-full">
                        <i className="fa-solid fa-user-tag absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                        <input 
                          type="text"
                          value={bggUsername}
                          onChange={(e) => setBggUsername(e.target.value)}
                          placeholder="Username tecnico BGG (es: MarioRossi88)..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-4 text-white text-base outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                        />
                      </div>
                      <button 
                        onClick={handleImportBgg}
                        disabled={isImporting || !bggUsername.trim()}
                        className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:bg-slate-800"
                      >
                        {isImporting ? (
                          <i className="fa-solid fa-circle-notch animate-spin"></i>
                        ) : (
                          <i className="fa-solid fa-cloud-arrow-down"></i>
                        )}
                        Importa
                      </button>
                    </div>
                    {importStatus.msg && (
                      <p className={`text-[9px] font-black uppercase tracking-widest px-1 animate-in fade-in duration-300 ${
                        importStatus.type === 'error' ? 'text-rose-400' : 
                        importStatus.type === 'success' ? 'text-emerald-400' : 'text-indigo-400'
                      }`}>
                        {importStatus.msg}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredAndSortedCollection.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedCollection.map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => openGeekPage(game)}
                  className={`relative group rounded-xl overflow-hidden border border-slate-800 flex flex-col transition-all duration-300 bg-slate-900/40 hover:bg-slate-800/60 hover:border-indigo-500/30 cursor-pointer h-full min-h-[160px]`}
                >
                  <div className="p-3 flex items-center justify-between gap-3 border-b border-white/5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${game.type === GameType.RPG ? 'bg-indigo-600/60 text-indigo-100 border-indigo-400/30' : 'bg-emerald-600/60 text-emerald-100 border-emerald-400/30'}`}>
                        {game.type === GameType.RPG ? 'GDR' : (game.isExpansion ? 'EX' : 'BG')}
                      </span>
                      {game.yearpublished && (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black text-slate-500 bg-slate-950/40 border border-slate-800 uppercase tracking-widest">
                          {game.yearpublished}
                        </span>
                      )}
                    </div>

                    {isOwnProfile && (
                      <button 
                        type="button"
                        onClick={(e) => handleRemoveGameClick(e, game)} 
                        className="w-10 h-10 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center border border-red-500/20 relative z-30 shadow-sm active:scale-90"
                        title="Rimuovi gioco"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex gap-4 items-center">
                    <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between gap-2">
                         <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-700/50 hover:border-indigo-500 transition-all shadow-md group/bgg">
                               <img src={FALLBACK_ICON_URL} className="w-full h-full object-cover transition-transform group-hover/bgg:scale-110" alt="BGG" />
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight uppercase tracking-tight group-hover:text-indigo-300 transition-colors">
                              {game.name}
                            </h3>
                         </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-700 opacity-50 group-hover:opacity-100 mt-1"></i>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Giocatori</span>
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-users text-[8px] text-indigo-400/60"></i>
                          <span className="text-[10px] font-bold text-slate-300">{game.minPlayers || '?'}{game.maxPlayers && game.maxPlayers !== game.minPlayers ? `-${game.maxPlayers}` : ''}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Peso</span>
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-brain text-[8px] text-amber-500/60"></i>
                          <span className="text-[10px] font-bold text-slate-300">
                            {game.difficulty 
                              ? (typeof game.difficulty === 'number' 
                                  ? game.difficulty.toFixed(2) 
                                  : parseFloat(game.difficulty as any).toFixed(2)) 
                              : '?'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Durata</span>
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-clock text-[8px] text-sky-400/60"></i>
                        <span className="text-[10px] font-bold text-slate-300">
                          {game.minDuration && game.maxDuration 
                            ? (game.minDuration === game.maxDuration ? `${game.minDuration}'` : `${game.minDuration}-${game.maxDuration}'`)
                            : (game.duration ? `${game.duration}'` : '?')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center glass rounded-3xl border-2 border-dashed border-slate-800 opacity-60">
              <i className="fa-solid fa-box-open text-5xl mb-4 text-slate-800"></i>
              <p className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">Collezione vuota o nessun filtro corrispondente</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
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

export default PublicProfile;
