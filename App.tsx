
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
import HomeDashboard from './components/HomeDashboard';
import { GameTable, GameProposal, View, GameType, GameFormat, Player, AppNotification, AdvancedFilterState, RankingPeriod, SortType, GroupType, CollectedGame, DraftTable } from './types';
import { db } from './services/api';

const SIMULATED_NOW = new Date('2026-01-23T08:06:00');
const TODAY_STR = SIMULATED_NOW.toISOString().split('T')[0];

const initialAdvancedFilters: AdvancedFilterState = {
  dateFrom: '',
  timeFrom: '',
  minPlayers: 1,
  locationSearch: '',
  participantSearch: '',
  showOnlyJoined: false,
  showOnlyNew: false,
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
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<Player | null>(null);

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

  const [itemToDelete, setItemToDelete] = useState<{
    type: 'table' | 'proposal' | 'draft';
    id: string;
    title: string;
    parentId?: string;
  } | null>(null);

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
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedUserId, selectedTableId, selectedProposalId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleUpdateUser = async (updatedUser: Player) => {
    setIsSyncing(true);
    try {
      await db.updateUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Errore aggiornamento utente:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCollection = async (userId: string, newCollection: CollectedGame[]) => {
    const userToUpdate = allUsers.find(u => u.id === userId);
    if (userToUpdate) {
      handleUpdateUser({ ...userToUpdate, collection: newCollection });
    }
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
      
      let updatedInterested: string[];
      let updatedPrefs: Record<string, any> = { ...prop.userPreferences };
      let updatedDrafts: DraftTable[] = [...prop.drafts];

      if (isAlreadyInterested) {
        // Rimozione interesse
        updatedInterested = prop.interestedPlayerIds.filter(uid => uid !== currentUser.id);
        delete updatedPrefs[currentUser.id];
        
        // Coerenza logica: se tolgo l'interesse esco da tutte le bozze della proposta
        updatedDrafts = prop.drafts.map(draft => ({
          ...draft,
          joinedUserIds: draft.joinedUserIds.filter(uid => uid !== currentUser.id)
        }));
      } else {
        // Aggiunta interesse
        updatedInterested = [...prop.interestedPlayerIds, currentUser.id];
        updatedPrefs[currentUser.id] = { gameName: prop.gameName };
      }
      
      const updatedProp = { 
        ...prop, 
        interestedPlayerIds: updatedInterested,
        userPreferences: updatedPrefs,
        drafts: updatedDrafts
      };
      await db.saveProposal(updatedProp);
      setProposals(prev => prev.map(p => p.id === id ? updatedProp : p));
    }
    setIsSyncing(false);
  };

  const handleUpdateProposalDrafts = async (proposalId: string, updatedDrafts: DraftTable[]) => {
    setIsSyncing(true);
    const prop = proposals.find(p => p.id === proposalId);
    if (prop) {
      let updatedProp = { ...prop, drafts: updatedDrafts };

      // Automazione Workflow: Se l'utente partecipa a una bozza, gli interessa la proposta
      if (currentUser) {
        const isUserInAnyDraft = updatedDrafts.some(d => d.joinedUserIds.includes(currentUser.id));
        const isAlreadyInterested = prop.interestedPlayerIds.includes(currentUser.id);

        if (isUserInAnyDraft && !isAlreadyInterested) {
          updatedProp = {
            ...updatedProp,
            interestedPlayerIds: [...prop.interestedPlayerIds, currentUser.id],
            userPreferences: {
              ...prop.userPreferences,
              [currentUser.id]: { gameName: prop.gameName }
            }
          };
        }
      }

      await db.saveProposal(updatedProp);
      setProposals(prev => prev.map(p => p.id === proposalId ? updatedProp : p));
    }
    setIsSyncing(false);
  };

  const handleLeaveTable = async (tableId: string) => {
    return handleJoinTable(tableId);
  };

  const handleDeleteTable = (id: string) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      setItemToDelete({ type: 'table', id, title: table.title });
    }
  };

  const handleDeleteProposal = (id: string) => {
    const prop = proposals.find(p => p.id === id);
    if (prop) {
      setItemToDelete({ type: 'proposal', id, title: prop.title });
    }
  };

  const handleDeleteDraft = (proposalId: string, draftId: string) => {
    const prop = proposals.find(p => p.id === proposalId);
    const draft = prop?.drafts.find(d => d.id === draftId);
    if (draft) {
      setItemToDelete({ 
        type: 'draft', 
        id: draftId, 
        parentId: proposalId, 
        title: `Bozza di ${draft.gameName || prop?.gameName}` 
      });
    }
  };

  const executeConfirmDelete = async () => {
    if (!itemToDelete) return;

    const { type, id, parentId } = itemToDelete;
    setIsSyncing(true);

    try {
      if (type === 'table') {
        await db.deleteTable(id);
        setTables(prev => prev.filter(t => t.id !== id));
        if (view === 'table-detail' && selectedTableId === id) setView('tables');
      } else if (type === 'proposal') {
        await db.deleteProposal(id);
        setProposals(prev => prev.filter(p => p.id !== id));
        if (view === 'proposal-detail' && selectedProposalId === id) setView('proposals');
      } else if (type === 'draft' && parentId) {
        const prop = proposals.find(p => p.id === parentId);
        if (prop) {
          const updatedDrafts = prop.drafts.filter(d => d.id !== id);
          await handleUpdateProposalDrafts(parentId, updatedDrafts);
        }
      }
    } catch (error) {
      console.error("Errore eliminazione:", error);
      alert("Errore durante l'eliminazione.");
    } finally {
      setIsSyncing(false);
      setItemToDelete(null);
    }
  };

  const handleCreateTable = async (formData: Omit<GameTable, 'id' | 'currentPlayers' | 'createdAt' | 'hostId'>) => {
    if (!currentUser) return;
    setIsSyncing(true);

    if (editingTable && editingTable.id && !prefilledPlayers) {
      const updatedTable: GameTable = {
        ...editingTable as GameTable,
        ...formData,
      };
      await db.saveTable(updatedTable);
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
      setEditingTable(null);
    } else {
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

    if (selectedUserId) setView('profile');
    else setView('tables');
    
    setPrefilledPlayers(null);
    setIsSyncing(false);
  };

  const handleCreateProposal = async (formData: Omit<GameProposal, 'id' | 'interestedPlayerIds' | 'createdAt' | 'proposer' | 'drafts' | 'userPreferences' | 'clusterStatus'>) => {
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
        drafts: [],
        createdAt: SIMULATED_NOW.toISOString(),
        userPreferences: { [currentUser.id]: { gameName: formData.gameName } },
        clusterStatus: {}
      };
      await db.saveProposal(newProp);
      setProposals(prev => [newProp, ...prev]);
    }

    if (selectedUserId) setView('profile');
    else setView('proposals');
    
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
      const matchesNew = !advancedFilters.showOnlyNew || ((SIMULATED_NOW.getTime() - new Date(t.createdAt).getTime()) < 24 * 60 * 60 * 1000);
      return matchesSearch && matchesType && matchesFormat && matchesJoined && matchesLocation && matchesDate && matchesNew && (t.date >= TODAY_STR);
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
      const matchesNew = !advancedFilters.showOnlyNew || ((SIMULATED_NOW.getTime() - new Date(p.createdAt).getTime()) < 24 * 60 * 60 * 1000);
      return matchesSearch && matchesType && matchesMyProp && matchesJoined && matchesFormat && matchesNew;
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
        <p className="font-fantasy text-xl animate-pulse">Connessione alla community...</p>
      </div>
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUserId(null);
    setEditingTable(null);
    setEditingProposal(null);
    setSelectedTableId(null);
    setSelectedProposalId(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header 
        user={currentUser} currentView={view} rankingPeriod={rankingPeriod}
        userRank={currentUser ? userStats[currentUser.id]?.rank : undefined}
        userScore={currentUser ? userStats[currentUser.id]?.score : undefined}
        onHomeClick={() => { setView('home'); setEditingTable(null); setSelectedUserId(null); }} 
        onTablesClick={() => { setView('tables'); setEditingTable(null); setSelectedUserId(null); }}
        onProposalsClick={() => { setView('proposals'); setEditingProposal(null); setSelectedUserId(null); }}
        onStatsClick={() => { setView('stats'); setSelectedUserId(null); }} 
        onMembersClick={() => setView('members')}
        onAdminClick={() => setView('admin-dashboard')} onNotificationsClick={() => setView('notifications')}
        onAuthClick={() => setIsAuthModalOpen(true)} onLogout={handleLogout}
        onProfileClick={(id) => { setSelectedUserId(id); setView('profile'); }}
        notifications={notifications} upcomingCount={tables.filter(t => t.date >= TODAY_STR).length}
        proposalsCount={proposals.length} memberCount={allUsers.length}
        isSyncing={isSyncing}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20 pt-8">
        {view === 'home' && (
          <HomeDashboard 
            currentUser={currentUser}
            tables={tables}
            proposals={proposals}
            allUsers={allUsers}
            userStats={userStats}
            todayStr={TODAY_STR}
            onViewTableDetail={(t) => { setSelectedTableId(t.id); setView('table-detail'); }}
            onViewProposalDetail={(p) => { setSelectedProposalId(p.id); setView('proposal-detail'); }}
            onExploreTables={() => setView('tables')}
            onExploreProposals={() => setView('proposals')}
          />
        )}

        {view === 'tables' && (
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
            <FeedControls mode="tables" sort={sortOption} group={groupOption} onSortChange={setSortOption} onGroupChange={setGroupOption} viewMode={viewMode} onViewModeChange={setViewMode} />

            <div className="space-y-10">
              {(Object.entries(groupedTables) as [string, GameTable[]][]).map(([groupKey, groupItems], gIdx) => (
                <div 
                  key={`${viewMode}-${groupKey}-${groupItems.length}`} 
                  className="space-y-4 animate-in fade-in zoom-in-95 duration-500" 
                  style={{ animationDelay: `${gIdx * 100}ms` }}
                >
                  {groupOption !== 'none' && (
                    <div className="flex items-center gap-3 px-2">
                      <div className={`w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]`}></div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{groupKey}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-sky-500/40 to-transparent"></div>
                    </div>
                  )}
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
                    {groupItems.map((table) => (
                      <GameCard 
                        key={table.id} type="table" data={table} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} 
                        index={tables.length - tables.findIndex(t => t.id === table.id)}
                        onPrimaryAction={handleJoinTable} 
                        onEdit={(t) => { setEditingTable(t); setView('edit'); }} 
                        onDelete={handleDeleteTable}
                        onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
                        onViewDetail={(t) => { setSelectedTableId(t.id); setView('table-detail'); }}
                        viewMode={viewMode}
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

              <div className="space-y-10">
                {(Object.entries(groupedProposals) as [string, GameProposal[]][]).map(([groupKey, groupItems], gIdx) => (
                  <div 
                    key={`${viewMode}-${groupKey}-${groupItems.length}`} 
                    className="space-y-4 animate-in fade-in zoom-in-95 duration-500" 
                    style={{ animationDelay: `${gIdx * 100}ms` }}
                  >
                    {groupOption !== 'none' && (
                      <div className="flex items-center gap-3 px-2">
                        <div className={`w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]`}></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{groupKey}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-sky-500/40 to-transparent"></div>
                      </div>
                    )}
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
                      {groupItems.map((proposal) => (
                        <GameCard 
                          key={proposal.id} type="proposal" data={proposal} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers} 
                          index={proposals.length - proposals.findIndex(p => p.id === proposal.id)}
                          onPrimaryAction={handleToggleInterest} 
                          onSecondaryAction={(id) => { 
                            setSelectedProposalId(id); setView('proposal-detail');
                          }}
                          onEdit={(p) => { setEditingProposal(p); setView('edit-proposal'); }}
                          onDelete={handleDeleteProposal}
                          onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
                          onViewDetail={(p) => { setSelectedProposalId(p.id); setView('proposal-detail'); }}
                          viewMode={viewMode}
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
            onBack={() => setView('tables')} onPrimaryAction={handleJoinTable}
            onEdit={(t) => { setEditingTable(t); setView('edit'); }}
            onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
            onDelete={handleDeleteTable}
            onUpdateDrafts={() => {}}
            onConfirmDraft={() => {}}
          />
        )}

        {view === 'proposal-detail' && selectedProposalId && (
          <GameDetailView 
            type="proposal" data={proposals.find(p => p.id === selectedProposalId)!} currentUser={currentUser} userRanks={userRanks} allUsers={allUsers}
            onBack={() => setView('proposals')} onPrimaryAction={handleToggleInterest}
            onEdit={(p) => { setEditingProposal(p); setView('edit-proposal'); }}
            onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }}
            onDelete={handleDeleteProposal}
            onUpdateDrafts={handleUpdateProposalDrafts}
            onDeleteDraft={(id) => handleDeleteDraft(selectedProposalId, id)}
            onConfirmDraft={(draft) => {
              if (!currentUser) { setIsAuthModalOpen(true); return; }
              const p = proposals.find(pr => pr.id === selectedProposalId);
              if (p) {
                setPrefilledPlayers(allUsers.filter(u => draft.joinedUserIds.includes(u.id)));
                setEditingTable({
                  ...p,
                  ...draft,
                  title: draft.gameName || p.gameName
                });
                setView('create');
              }
            }}
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
            onUpdateUser={handleUpdateUser}
            onViewTableDetail={(t) => { setSelectedTableId(t.id); setView('table-detail'); }}
            onViewProposalDetail={(p) => { setSelectedProposalId(p.id); setView('proposal-detail'); }}
          />
        )}

        {view === 'stats' && <StatsModule tables={tables} user={currentUser} onBack={() => setView('home')} />}
        {view === 'members' && <MemberList allUsers={allUsers} userRanks={userRanks} userStats={userStats} currentUser={currentUser} rankingPeriod={rankingPeriod} onRankingPeriodChange={setRankingPeriod} onSelectMember={(id) => { setSelectedUserId(id); setView('profile'); }} tables={tables} proposals={proposals} />}
        
        {(view === 'create' || view === 'edit') && (
          <TableForm 
            onCancel={() => { 
              if (selectedUserId) setView('profile');
              else setView('tables'); 
              setEditingTable(null); 
            }} 
            onSubmit={handleCreateTable} 
            initialData={editingTable} 
            isConversion={!!prefilledPlayers} 
          />
        )}

        {(view === 'create-proposal' || view === 'edit-proposal') && (
          <ProposalForm 
            onCancel={() => { 
              if (selectedUserId) setView('profile');
              else setView('proposals'); 
              setEditingProposal(null); 
            }} 
            onSubmit={handleCreateProposal} 
            initialData={editingProposal} 
          />
        )}
      </main>

      {itemToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-sm rounded-[2rem] p-8 border border-red-500/30 shadow-2xl shadow-red-500/10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <i className="fa-solid fa-trash-can text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Conferma Eliminazione</h3>
            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
              Sei sicuro di voler eliminare definitivamente <strong className="text-white">"{itemToDelete.title}"</strong>? Questa azione non può essere annullata.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeConfirmDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                Sì, Elimina
              </button>
              <button 
                onClick={() => setItemToDelete(null)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null); 
        }} 
        onLogin={(name) => {
          const user = allUsers.find(u => u.name === name);
          if (user) {
            setCurrentUser(user);
          }
          setIsAuthModalOpen(false);
        }} 
      />
    </div>
  );
};

export default App;
