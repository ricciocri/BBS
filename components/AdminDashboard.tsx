
import React, { useState, useMemo } from 'react';
import { GameTable, GameProposal, Player } from '../types';

interface AdminDashboardProps {
  tables: GameTable[];
  proposals: GameProposal[];
  users: Player[];
  onDeleteTable: (id: string) => void;
  onDeleteProposal: (id: string) => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tables, 
  proposals, 
  users, 
  onDeleteTable, 
  onDeleteProposal, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'proposals' | 'users'>('overview');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeTables = tables.filter(t => t.date >= today);
    const totalSlots = tables.reduce((acc, t) => acc + t.maxPlayers, 0);
    const filledSlots = tables.reduce((acc, t) => acc + t.currentPlayers.length, 0);
    const fillRate = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

    return {
      activeTablesCount: activeTables.length,
      proposalsCount: proposals.length,
      usersCount: users.length,
      fillRate: Math.round(fillRate)
    };
  }, [tables, proposals, users]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Utenti Registrati</p>
          <p className="text-3xl font-bold text-white">{stats.usersCount}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tavoli Attivi</p>
          <p className="text-3xl font-bold text-white">{stats.activeTablesCount}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saturazione</p>
          <p className="text-3xl font-bold text-white">{stats.fillRate}%</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-rose-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Proposte</p>
          <p className="text-3xl font-bold text-white">{stats.proposalsCount}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 -mr-16 -mt-16 rounded-full blur-2xl"></div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-3xl font-fantasy font-bold text-white">Admin Dashboard</h2>
          <p className="text-xs text-slate-500">Gestione della community BBS.</p>
        </div>
        <button onClick={onBack} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
          Indietro
        </button>
      </div>

      <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50 w-full sm:w-auto overflow-x-auto">
        {['overview', 'tables', 'proposals', 'users'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && renderOverview()}
        {(activeTab === 'tables' || activeTab === 'proposals' || activeTab === 'users') && (
          <div className="glass rounded-3xl overflow-hidden border border-slate-700/50 p-6">
            <p className="text-center text-slate-500 italic">Gestione {activeTab} completa in arrivo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
