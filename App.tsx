
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import GameCard from './components/GameCard';
import TableForm from './components/TableForm';
import ProposalForm from './components/ProposalForm';
import StatsModule from './components/StatsModule';
import AdvancedFilters from './components/AdvancedFilters';
import FeedControls from './components/FeedControls';
import AuthModal from './components/AuthModal';
import MemberList from './components/MemberList';
import PublicProfile from './components/PublicProfile';
import AdminDashboard from './components/AdminDashboard';
import NotificationsView from './components/NotificationsView';
import GameDetailView from './components/GameDetailView';
import { GameTable, GameProposal, View, GameType, GameFormat, Player, AppNotification, AdvancedFilterState, RankingPeriod, SortType, GroupType, CollectedGame } from './types';
import { db } from './services/api';
import { MOCK_USERS } from './constants';

const SIMULATED_NOW = new Date('2026-01-23T08:06:00');
const TODAY_STR = SIMULATED_NOW.toISOString().split('T')[0];

const initialAdvancedFilters: AdvancedFilterState = {
  dateFrom: '',
  timeFrom: '',
  minPlayers: 1,
  locationSearch: '',
  participantSearch: '',
  showOnlyJoined: false,
  showPastTables: false,
  showOnlyMyProposals: false,
  formatFilter: 'all',
  typeFilter: 'all'
};

const App: React.FC = () => {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [proposals, setProposals] = useState<GameProposal[]>([]);
  const [allUsers, setAllUsers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Impostiamo Mauro come utente loggato di default (ID: admin-mauro)
  const [currentUser, setCurrentUser] = useState<Player | null>(MOCK_USERS.find(u => u.id === 'admin-mauro') || null);

  // Stati per la gestione della navigazione e delle azioni post-login
  const [view, setView] = useState<View>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: 'join' | 'interest', id: string } | null>(null);

  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('daily');
  const [sortOption, setSortOption] = useState<SortType>('session');
  const [groupOption, setGroupOption] = useState<GroupType>('none');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(initialAdvancedFilters);
  const [editingTable, setEditingTable] = useState<Partial<GameTable> | null>(null);
  const [editingProposal, setEditingProposal] = useState<Partial<GameProposal> | null>(null);
  const [prefilledPlayers, setPrefilledPlayers] = useState<Player[] | null>(null);

  // Inizializzazione dati
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [t, p, u] = await Promise.all([
          db.getTables(),
          db.getProposals(),
          db.getUsers()
        ]);
        setTables(t);
        setProposals(p);
        setAllUsers(u);
      } catch (error) {
        console.error("Errore inizializzazione dati:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedUserId, selectedTableId, selectedProposalId]);

  // Esegue l'azione in sospeso dopo il login
  useEffect(() => {
    if (currentUser && pendingAction) {
      if (pendingAction.type === 'join') {
        handleJoinTable(pendingAction.id);
      } else if (pendingAction.type === 'interest') {
        handleToggleInterest(pendingAction.id);
      }
      setPendingAction(null);
    }
  }, [currentUser, pendingAction]);

  const handleUpdateCollection = async (userId: string, newCollection: CollectedGame[]) => {
    setIsSyncing(true);
    const updatedUser = allUsers.find(u => u.id === userId);
    if (updatedUser) {
      const newUser = { ...updatedUser, collection: newCollection };
      await db.updateUser(newUser);
      setAllUsers(prev => prev.map(u => u.id === userId ? newUser : u));
      if (currentUser?.id === userId) setCurrentUser(newUser);
    }
    setIsSyncing(false);
  };

  const handleJoinTable = async (tableId: string) => {
    if (!currentUser) { 
      setPendingAction({ type: 'join', id: tableId });
      setIsAuthModalOpen(true); 
      return; 
    }
    setIsSyncing(true);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const isAlreadyJoined = table.currentPlayers.some(p => p.id === currentUser.id);
      
      if (isAlreadyJoined) {
        if (table.hostId === currentUser.id) {
          alert("L'organizzatore non può abbandonare il tavolo.");
        } else {
          const updatedTable = { 
            ...table, 
            currentPlayers: table.currentPlayers.filter(p => p.id !== currentUser.id) 
          };
          await db.saveTable(updatedTable);
          setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
        }
      } else {
        if (table.currentPlayers.length < table.maxPlayers) {
          const updatedTable = { 
            ...table, 
            currentPlayers: [...table.currentPlayers, currentUser] 
          };
          await db.saveTable(updatedTable);
          setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
        } else {
          alert("Il tavolo è pieno!");
        }
      }
    }
    setIsSyncing(false);
  };

  const handleToggleInterest = async (id: string) => {
    if (!currentUser) { 
      setPendingAction({ type: 'interest', id: id });
      setIsAuthModalOpen(true); 
      return; 
    }
    setIsSyncing(true);
    const prop = proposals.find(p => p.id === id);
    if (prop) {
      const isAlreadyInterested = prop.interestedPlayerIds.includes(currentUser.id);
      const updatedIds = isAlreadyInterested 
        ? prop.interestedPlayerIds.filter(pid => pid !== currentUser.id) 
        : [...prop.interestedPlayerIds, currentUser.id];
      const updatedProp = { ...prop, interestedPlayerIds: updatedIds };
      await db.saveProposal(updatedProp);
      setProposals(prev => prev.map(p => p.id === id ? updatedProp : p));
    }
    setIsSyncing(false);
  };

  const handleLeaveTable = async (tableId: string) => {
    return handleJoinTable(tableId);
  };

  const handleDeleteTable = async (id: string) => {
    setIsSyncing(true);
    try {
      await db.deleteTable(id);
      setTables(prev => prev.filter(t => t.id !== id));
      if (view === 'table-detail') setView('home');
    } catch (error) {
      console.error("Errore eliminazione tavolo:", error);
      alert("Errore durante l'eliminazione del tavolo.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    setIsSyncing(true);
    try {
      await db.deleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      if (view === 'proposal-detail') setView('proposals');
    } catch (error) {
      console.error("Errore eliminazione proposta:", error);
      alert("Errore durante l'eliminazione della proposta.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateTable = async (formData: Omit<GameTable, 'id' | 'currentPlayers' | 'createdAt' | 'hostId'>) => {
    if (!currentUser) return;
    setIsSyncing(true);

    // Se stiamo modificando un tavolo ESISTENTE (non una conversione da proposta)
    if (editingTable && editingTable.id && !prefilledPlayers) {
      const updatedTable: GameTable = {
        ...editingTable as GameTable,
        ...formData,
      };
      await db.saveTable(updatedTable);
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
      setEditingTable(null);
    } else {
      // MODALITÀ CREAZIONE (o conversione da proposta)
      const initialPlayers = prefilledPlayers 
        ? [currentUser, ...prefilledPlayers.filter(p => p.id !== currentUser.id)] 
        : [currentUser];

      const newTable: GameTable = {
        ...formData,
        id: Date.now().toString(),
        createdAt: SIMULATED_NOW.toISOString(),
        hostId: currentUser.id,
        host: currentUser.name,
        currentPlayers: initialPlayers,
        isConverted: !!prefilledPlayers 
      };
      await db.saveTable(newTable);
      setTables(prev => [newTable, ...prev]);
      setEditingTable(null);
    }

    setView('home');
    setPrefilledPlayers(null);
    setIsSyncing(false);
  };

  const handleCreateProposal = async (formData: Omit<GameProposal, 'id' | 'interestedPlayerIds' | 'createdAt' | 'proposer'>) => {
    if (!currentUser) return;
    setIsSyncing(true);

    if (editingProposal && editingProposal.id) {
      const updatedProp: GameProposal = {
        ...editingProposal as GameProposal,
        ...formData,
      };
      await db.saveProposal(updatedProp);
      setProposals(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
      setEditingProposal(null);
    } else {
      const newProp: GameProposal = {
        ...formData,
        id: Date.now().toString(),
        proposer: currentUser,
        interestedPlayerIds: [currentUser.id],
        createdAt: SIMULATED_NOW.toISOString()
      };
      await db.saveProposal(newProp);
      setProposals(prev => [newProp, ...prev]);
    }

    setView('proposals');
    setIsSyncing(false);
  };

  const rankingRange = useMemo(() => {
    const period = rankingPeriod;
    const now = new Date(SIMULATED_NOW);
    const start = new Date(now);
    const end = new Date(now);
    if (period === 'all') return { start: new Date(0), end: new Date(8640000000000000) };
    if (period === 'daily') { start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); }
    else if (period === 'weekly') { 
        const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        start.setDate(diff); start.setHours(0, 0, 0, 0); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999); 
    }
    else if (period === 'monthly') { start.setDate(1); start.setHours(0, 0, 0, 0); end.setMonth(start.getMonth() + 1, 0); end.setHours(23, 59, 59, 999); }
    else if (period === 'yearly') { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); end.setMonth(11, 31); end.setHours(23, 59, 59, 999); }
    return { start, end };
  }, [rankingPeriod]);

  const userStats = useMemo(() => {
    const start = rankingRange.start.getTime();
    const end = rankingRange.end.getTime();
    const scores = allUsers.map(user => {
      const uCT = tables.filter(t => { const time = new Date(t.createdAt).getTime(); return time >= start && time <= end && t.hostId === user.id; });
      const uCP = proposals.filter(p => { const time = new Date(p.createdAt).getTime(); return time >= start && time <= end && p.proposer?.id === user.id; });
      const uPT = tables.filter(t => { const time = new Date(t.createdAt).getTime(); return time >= start && time <= end && t.currentPlayers.some(p => p.id === user.id); });
      const iPC = proposals.filter(p => { const time = new Date(p.createdAt).getTime(); return time >= start && time <= end && p.interestedPlayerIds.includes(user.id); }).length;
      let hostingScore = 0; let conversionBonus = 0;
      uCT.forEach(t => { hostingScore += (t.type === GameType.RPG ? 15 : 10); if (t.isConverted) conversionBonus += 10; });
      let playScore = 0; uPT.forEach(t => { if (t.hostId !== user.id) playScore += (t.type === GameType.RPG ? 5 : 3); });
      let socialBonus = 0; uCT.forEach(t => { socialBonus += (t.currentPlayers.length - 1) * 2; });
      const score = hostingScore + conversionBonus + (uCP.length * 5) + playScore + (iPC * 1) + socialBonus;
      return { id: user.id, score };
    });
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const stats: Record<string, { rank: number, score: number }> = {};
    sorted.forEach((s, idx) => { stats[s.id] = { rank: idx + 1, score: s.score }; });
    return stats;
  }, [allUsers, tables, proposals, rankingRange]);

  const userRanks = useMemo(() => {
    const ranks: Record<string, number> = {};
    Object.keys(userStats).forEach(id => { ranks[id] = userStats[id].rank; });
    return ranks;
  }, [userStats]);

  const filteredTables = useMemo(() => {
    let result = tables.filter(t => {
      const matchesSearch = t.gameName.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = advancedFilters.typeFilter === 'all' || (advancedFilters.typeFilter === 'rpg' && t.type === GameType.RPG) || (advancedFilters.typeFilter === 'boardgame' && t.type === GameType.BOARD_GAME);
      const matchesFormat = advancedFilters.formatFilter === 'all' || (advancedFilters.formatFilter === 'campaign' && t.format === GameFormat.CAMPAIGN) || (advancedFilters.formatFilter === 'single' && t.format === GameFormat.SINGLE_PLAY) || (advancedFilters.formatFilter === 'tournament' && t.format === GameFormat.TOURNAMENT);
      const matchesJoined = !advancedFilters.showOnlyJoined || (currentUser && t.currentPlayers.some(p => p.id === currentUser.id));
      const matchesLocation = !advancedFilters.locationSearch || t.location.toLowerCase().includes(advancedFilters.locationSearch.toLowerCase());
      const matchesDate = !advancedFilters.dateFrom || t.date >= advancedFilters.dateFrom;
      return matchesSearch && matchesType && matchesFormat && matchesJoined && matchesLocation && matchesDate && (advancedFilters.showPastTables || t.date >= TODAY_STR);
    });
    if (sortOption === 'creation') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortOption === 'session') result.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return result;
  }, [tables, search, advancedFilters, currentUser, sortOption]);

  const groupedTables = useMemo(() => {
    if (groupOption === 'none') return { "Tutte": filteredTables };
    const groups: Record<string, GameTable[]> = {};
    filteredTables.forEach(t => {
      let key = "Altro"; const d = new Date(t.date);
      if (groupOption === 'game') key = t.gameName;
      else if (groupOption === 'day') key = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      else if (groupOption === 'month') key = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filteredTables, groupOption]);

  const filteredProposals = useMemo(() => {
    let result = proposals.filter(p => {
      const matchesSearch = p.gameName.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = advancedFilters.typeFilter === 'all' || (advancedFilters.typeFilter === 'rpg' && p.type === GameType.RPG) || (advancedFilters.typeFilter === 'boardgame' && p.type === GameType.BOARD_GAME);
      const matchesMyProp = !advancedFilters.showOnlyMyProposals || (currentUser && p.proposer?.id === currentUser.id);
      const matchesJoined = !advancedFilters.showOnlyJoined || (currentUser && p.interestedPlayerIds.includes(currentUser.id));
      const matchesFormat = advancedFilters.formatFilter === 'all' || (advancedFilters.formatFilter === 'campaign' && p.format === GameFormat.CAMPAIGN) || (advancedFilters.formatFilter === 'single' && p.format === GameFormat.SINGLE_PLAY) || (advancedFilters.formatFilter === 'tournament' && p.format === GameFormat.TOURNAMENT);
      return matchesSearch && matchesType && matchesMyProp && matchesJoined && matchesFormat;
    });
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return result;
  }, [proposals, search, advancedFilters, currentUser]);

  const groupedProposals = useMemo(() => {
    if (groupOption === 'none') return { "Tutte": filteredProposals };
    const groups: Record<string, GameProposal[]> = {};
    filteredProposals.forEach(p => {
      let key = "Altro"; const d = new Date(p.createdAt);
      if (groupOption === 'game') key = p.gameName;
      else if (groupOption === 'day') key = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [filteredProposals, groupOption]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-fantasy text-xl animate-pulse">Connessione alla Gilda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header 
        user={currentUser} currentView={view} rankingPeriod={rankingPeriod}
        userRank={currentUser ? userStats[currentUser.id]?.rank : undefined}
        userScore={currentUser ? userStats[currentUser.id]?.score : undefined}
        onHomeClick={() => { setView('home'); setEditingTable(null); }} onProposalsClick={() => { setView('proposals'); setEditingProposal(null); }}
        onStatsClick={() => setView('stats')} onMembersClick={() => setView('members')}
        onAdminClick={() => setView('admin-dashboard')} onNotificationsClick={() => setView('notifications')}
        onAuthClick={() => setIsAuthModalOpen(true)} onLogout={() => setCurrentUser(null)}
        onProfileClick={(id) => { setSelectedUserId(id); setView('profile'); }}
        notifications={notifications} upcomingCount={tables.filter(t => t.date >= TODAY_STR).length}
        proposalsCount={proposals.length} memberCount={allUsers.length}
        isSyncing={isSyncing}
      />

      {isSyncing && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full shadow-2xl animate-bounce">
          <i className="fa-solid fa-cloud-arrow-up text-white"></i>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizzazione...</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20 pt-8">
        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <button onClick={() => { if(!currentUser) setIsAuthModalOpen(true); else setView('create'); }} className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 shrink-0">
                <i className="fa-solid fa-plus-circle text-base"></i> Apri Tavolo
              </button>
              <div className="relative flex-1 w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input type="text" placeholder="Cerca un gioco o una sessione..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className={`w-full md:w-auto px-4 py-3 rounded-xl flex items-center justify-center gap-3 border transition-all text-[10px] font-black uppercase tracking-widest ${showAdvanced ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                <i className={`fa-solid ${showAdvanced ? 'fa-chevron-up' : 'fa-sliders'}`}></i>
                <span className="md:hidden lg:inline">Filtri</span>
              </button>
            </div>

            <AdvancedFilters mode="tables" filters={advancedFilters} onChange={setAdvancedFilters} onReset={() => setAdvancedFilters(initialAdvancedFilters)} isVisible={showAdvanced} />
            <FeedControls mode="tables" sort={sortOption} group={groupOption} onSortChange={setSortOption} onGroupChange={setGroupOption} />

            <div className="space-y-10">
              {(Object.entries(groupedTables) as [string, GameTable[]][]).map(([groupKey, groupItems], gIdx) => (
                <div key={groupKey} className="space-y-4 animate-in fade-in duration-500" style={{ animationDelay: `${gIdx * 50}ms` }}>
                  {groupOption !== 'none' && (
                    <div className="flex items-center gap-3 px-2">
                      <div className={`w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]`}></div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{groupKey}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent"></div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {groupItems.map((table) => (
                      <GameCard 
                        key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} 
                        index={tables.length - tables.findIndex(t => t.id === table.id)}
                        onPrimaryAction={handleJoinTable} 
                        onEdit={(t) => { setEditingTable(t); setView('edit'); }} 
                        onDelete={handleDeleteTable}
                        onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
                        onViewDetail={(t) => { setSelectedTableId(t.id); setView('table-detail'); }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'proposals' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <button onClick={() => { if(!currentUser) setIsAuthModalOpen(true); else setView('create-proposal'); }} className="w-full md:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 shrink-0">
                  <i className="fa-solid fa-lightbulb text-base"></i> Crea proposta
                </button>
                <div className="relative flex-1 w-full">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input type="text" placeholder="Cerca una proposta..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className={`w-full md:w-auto px-4 py-3 rounded-xl flex items-center justify-center gap-3 border transition-all text-[10px] font-black uppercase tracking-widest ${showAdvanced ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                  <i className={`fa-solid ${showAdvanced ? 'fa-chevron-up' : 'fa-sliders'}`}></i>
                  <span className="md:hidden lg:inline">Filtri</span>
                </button>
              </div>

              <AdvancedFilters mode="proposals" filters={advancedFilters} onChange={setAdvancedFilters} onReset={() => setAdvancedFilters(initialAdvancedFilters)} isVisible={showAdvanced} />
              <FeedControls mode="proposals" sort={sortOption} group={groupOption} onSortChange={setSortOption} onGroupChange={setGroupOption} />

              <div className="space-y-10">
                {(Object.entries(groupedProposals) as [string, GameProposal[]][]).map(([groupKey, groupItems], gIdx) => (
                  <div key={groupKey} className="space-y-4 animate-in fade-in duration-500" style={{ animationDelay: `${gIdx * 50}ms` }}>
                    {groupOption !== 'none' && (
                      <div className="flex items-center gap-3 px-2">
                        <div className={`w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]`}></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{groupKey}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent"></div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {groupItems.map((proposal) => (
                        <GameCard 
                          key={proposal.id} type="proposal" data={proposal} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} 
                          index={proposals.length - proposals.findIndex(p => p.id === proposal.id)}
                          onPrimaryAction={handleToggleInterest} 
                          onSecondaryAction={(id) => { 
                            if (!currentUser) { setIsAuthModalOpen(true); return; }
                            const p = proposals.find(pr => pr.id === id); 
                            if(p) { setPrefilledPlayers(allUsers.filter(u => p.interestedPlayerIds.includes(u.id))); setEditingTable(p); setView('create'); }
                          }}
                          onEdit={(p) => { setEditingProposal(p); setView('edit-proposal'); }}
                          onDelete={handleDeleteProposal}
                          onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
                          onViewDetail={(p) => { setSelectedProposalId(p.id); setView('proposal-detail'); }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        {view === 'table-detail' && selectedTableId && (
          <GameDetailView 
            type="table" data={tables.find(t => t.id === selectedTableId)!} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
            onBack={() => setView('home')} onPrimaryAction={handleJoinTable}
            onEdit={(t) => { setEditingTable(t); setView('edit'); }}
            onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
            onDelete={handleDeleteTable}
          />
        )}

        {view === 'proposal-detail' && selectedProposalId && (
          <GameDetailView 
            type="proposal" data={proposals.find(p => p.id === selectedProposalId)!} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
            onBack={() => setView('proposals')} onPrimaryAction={handleToggleInterest}
            onSecondaryAction={(id) => { 
              if (!currentUser) { setIsAuthModalOpen(true); return; }
              const p = proposals.find(pr => pr.id === id); 
              if(p) { setPrefilledPlayers(allUsers.filter(u => p.interestedPlayerIds.includes(u.id))); setEditingTable(p); setView('create'); }
            }}
            onEdit={(p) => { setEditingProposal(p); setView('edit-proposal'); }}
            onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
            onDelete={handleDeleteProposal}
          />
        )}

        {view === 'profile' && selectedUserId && (
          <PublicProfile 
            user={allUsers.find(u => u.id === selectedUserId)!} userRank={userRanks[selectedUserId]}
            userScore={userStats[selectedUserId]?.score || 0}
            hostedTables={tables.filter(t => t.hostId === selectedUserId)}
            joinedAsPlayerTables={tables.filter(t => t.currentPlayers.some(p => p.id === selectedUserId) && t.hostId !== selectedUserId)}
            userProposals={proposals.filter(p => p.proposer?.id === selectedUserId)}
            joinedProposals={proposals.filter(p => p.interestedPlayerIds.includes(selectedUserId) && p.proposer?.id !== selectedUserId)}
            currentUser={currentUser} allUsers={allUsers} userRanks={userRanks}
            onBack={() => setView('members')} onJoinTable={handleJoinTable} onLeaveTable={handleLeaveTable}
            onExpressInterest={handleToggleInterest} onSelectMember={setSelectedUserId}
            onCreateTable={() => setView('create')} onCreateProposal={() => setView('create-proposal')}
            onUpdateCollection={handleUpdateCollection}
            onViewTableDetail={(t) => { setSelectedTableId(t.id); setView('table-detail'); }}
            onViewProposalDetail={(p) => { setSelectedProposalId(p.id); setView('proposal-detail'); }}
          />
        )}

        {view === 'stats' && <StatsModule tables={tables} user={currentUser} onBack={() => setView('home')} />}
        {view === 'members' && <MemberList allUsers={allUsers} userRanks={userRanks} userStats={userStats} currentUser={currentUser} rankingPeriod={rankingPeriod} onRankingPeriodChange={setRankingPeriod} onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }} tables={tables} proposals={proposals} />}
        {(view === 'create' || view === 'edit') && <TableForm onCancel={() => { setView('home'); setEditingTable(null); }} onSubmit={handleCreateTable} initialData={editingTable} isConversion={!!prefilledPlayers} />}
        {(view === 'create-proposal' || view === 'edit-proposal') && <ProposalForm onCancel={() => { setView('proposals'); setEditingProposal(null); }} onSubmit={handleCreateProposal} initialData={editingProposal} />}
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null); // Pulisce l'azione in sospeso se l'utente annulla il login
        }} 
        onLogin={(name) => {
          const user = allUsers.find(u => u.name === name);
          if (user) {
            setCurrentUser(user);
          }
          setIsAuthModalOpen(false);
          // La view corrente NON viene resettata, l'utente rimane dove si trovava.
          // L'azione pendente verrà eseguita tramite lo useEffect dedicato.
        }} 
      />
    </div>
  );
};

export default App;
