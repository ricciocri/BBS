
import React, { useMemo, useState } from 'react';
import { GameProposal, DraftTable, Player } from '../types';
import GameAutocomplete from './GameAutocomplete';

interface ProposalPlannerProps {
  proposal: GameProposal;
  currentUser: Player | null;
  allUsers: Player[];
  onUpdateDrafts: (proposalId: string, drafts: DraftTable[]) => void;
  onConfirmDraft: (draft: DraftTable) => void;
  onJoinProposal: (proposalId: string) => void;
  onSelectMember: (id: string) => void;
}

const ProposalPlanner: React.FC<ProposalPlannerProps> = ({
  proposal,
  currentUser,
  allUsers,
  onUpdateDrafts,
  onConfirmDraft,
  onJoinProposal,
  onSelectMember
}) => {
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [newDraft, setNewDraft] = useState<Partial<DraftTable>>({
    gameName: proposal.gameName,
    date: '',
    time: '',
    location: '',
    system: '',
    maxPlayers: 4
  });

  const isInterestedGeneral = currentUser && (proposal.interestedPlayerIds || []).includes(currentUser.id);

  const handleToggleJoinDraft = (draftId: string) => {
    if (!currentUser) return;
    const updatedDrafts = (proposal.drafts || []).map(d => {
      if (d.id === draftId) {
        const isJoined = (d.joinedUserIds || []).includes(currentUser.id);
        return {
          ...d,
          joinedUserIds: isJoined 
            ? (d.joinedUserIds || []).filter(uid => uid !== currentUser.id)
            : [...(d.joinedUserIds || []), currentUser.id]
        };
      }
      return d;
    });
    onUpdateDrafts(proposal.id, updatedDrafts);
  };

  const handleAddDraft = () => {
    if (!currentUser) return;
    const draftToAdd: DraftTable = {
      id: Date.now().toString(),
      proposerId: currentUser.id,
      gameName: newDraft.gameName || proposal.gameName,
      date: newDraft.date,
      time: newDraft.time,
      location: newDraft.location,
      system: newDraft.system,
      maxPlayers: newDraft.maxPlayers || 4,
      joinedUserIds: [currentUser.id]
    };
    onUpdateDrafts(proposal.id, [...(proposal.drafts || []), draftToAdd]);
    setIsAddingDraft(false);
    setNewDraft({ gameName: proposal.gameName, date: '', time: '', location: '', system: '', maxPlayers: 4 });
  };

  const handleRemoveDraft = (draftId: string) => {
    const updatedDrafts = (proposal.drafts || []).filter(d => d.id !== draftId);
    onUpdateDrafts(proposal.id, updatedDrafts);
  };

  const draftsList = proposal.drafts || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-base font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
            <i className="fa-solid fa-shop text-amber-500"></i>
            Marketplace delle Bozze
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Scegli una configurazione o proponine una nuova</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isInterestedGeneral && currentUser && (
            <button 
              onClick={() => onJoinProposal(proposal.id)}
              className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Interesse Generale
            </button>
          )}
          {currentUser && (
            <button 
              onClick={() => setIsAddingDraft(!isAddingDraft)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <i className={`fa-solid ${isAddingDraft ? 'fa-xmark' : 'fa-plus'}`}></i>
              {isAddingDraft ? 'Annulla' : 'Proponi Tua Configurazione'}
            </button>
          )}
        </div>
      </div>

      {isAddingDraft && (
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-indigo-500/30 shadow-2xl animate-in zoom-in-95 duration-300">
          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">Nuova Bozza Logistica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Gioco / Titolo Alternativo</label>
              <GameAutocomplete 
                value={newDraft.gameName || ''} 
                onChange={(name) => setNewDraft(p => ({...p, gameName: name}))}
                placeholder="Nome Gioco..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Data</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" value={newDraft.date} onChange={e => setNewDraft(p => ({...p, date: e.target.value}))} />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Ora</label>
              <input type="time" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" value={newDraft.time} onChange={e => setNewDraft(p => ({...p, time: e.target.value}))} />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Luogo</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Es: La Gilda..." value={newDraft.location} onChange={e => setNewDraft(p => ({...p, location: e.target.value}))} />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Sistema (per GdR)</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Es: D&D 5e..." value={newDraft.system} onChange={e => setNewDraft(p => ({...p, system: e.target.value}))} />
            </div>
            <div className="md:col-span-2 pt-4">
              <button 
                onClick={handleAddDraft}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                Pubblica nel Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {draftsList.length > 0 ? (
          draftsList.map((draft) => {
            const proposer = allUsers.find(u => u.id === draft.proposerId);
            const isJoined = currentUser && (draft.joinedUserIds || []).includes(currentUser.id);
            const canManage = currentUser && draft.proposerId === currentUser.id;
            const joinedIds = draft.joinedUserIds || [];

            return (
              <div 
                key={draft.id}
                className={`glass group p-6 rounded-[2rem] border transition-all duration-500 flex flex-col bg-slate-900/40 border-slate-800 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => onSelectMember(draft.proposerId)}
                    >
                      <img src={proposer?.avatar} className="w-12 h-12 rounded-2xl border-2 border-slate-700 object-cover group-hover:border-indigo-500 transition-colors" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] text-white">
                        <i className="fa-solid fa-crown"></i>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[150px]">{proposer?.name}</h4>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Proponente Bozza</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     {canManage && (
                        <button 
                          onClick={() => handleRemoveDraft(draft.id)}
                          className="w-8 h-8 rounded-xl bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-lg"
                        >
                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                     )}
                     <button 
                        onClick={() => onConfirmDraft(draft)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <i className="fa-solid fa-door-open"></i>
                        Apri
                      </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-6">
                   <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                      <p className="text-xs font-bold text-indigo-300 uppercase mb-2">{draft.gameName || proposal.gameName}</p>
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="flex items-center gap-2">
                           <i className="fa-solid fa-calendar text-slate-600 text-[10px]"></i>
                           <span className="text-[10px] font-black text-slate-300 uppercase">{draft.date || 'Data TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <i className="fa-solid fa-clock text-slate-600 text-[10px]"></i>
                           <span className="text-[10px] font-black text-slate-300 uppercase">{draft.time || 'Ora TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                           <i className="fa-solid fa-location-dot text-slate-600 text-[10px]"></i>
                           <span className="text-[10px] font-black text-slate-300 uppercase truncate">{draft.location || 'Luogo TBD'}</span>
                        </div>
                      </div>
                   </div>

                   {draft.system && (
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-900/20 border border-sky-500/30">
                        <i className="fa-solid fa-dice-d20 text-sky-400 text-[9px]"></i>
                        <span className="text-[9px] font-black text-sky-400 uppercase tracking-tighter">Sistema: {draft.system}</span>
                     </div>
                   )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {joinedIds.map(uid => {
                        const u = allUsers.find(x => x.id === uid);
                        return (
                          <img 
                            key={uid} 
                            src={u?.avatar} 
                            onClick={() => onSelectMember(uid)}
                            className="w-7 h-7 rounded-lg border-2 border-slate-900 object-cover cursor-pointer hover:z-10 transition-transform hover:-translate-y-1 shadow-md" 
                            alt="" 
                          />
                        );
                      })}
                      <div className="flex flex-col justify-center ml-4">
                        <span className="text-[10px] font-black text-white uppercase">{joinedIds.length} Partecipanti</span>
                      </div>
                   </div>

                   <button 
                    onClick={() => handleToggleJoinDraft(draft.id)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      isJoined 
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-600/10'
                    }`}
                   >
                     {isJoined ? 'Esci' : 'Unisciti'}
                   </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="xl:col-span-2 py-16 text-center glass rounded-[3rem] border-2 border-dashed border-slate-800 opacity-60">
             <i className="fa-solid fa-layer-group text-5xl mb-4 text-slate-800"></i>
             <p className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">Nessuna configurazione proposta nel marketplace.</p>
             <button 
                onClick={() => setIsAddingDraft(true)}
                className="mt-6 text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest underline decoration-indigo-500/30 underline-offset-8"
              >
               Lancia la prima bozza
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalPlanner;
