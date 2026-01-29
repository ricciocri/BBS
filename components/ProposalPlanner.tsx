
import React, { useMemo, useState } from 'react';
import { GameProposal, UserPreference, Player, GameType, GameFormat } from '../types';
import GameAutocomplete from './GameAutocomplete';

interface ProposalPlannerProps {
  proposal: GameProposal;
  currentUser: Player | null;
  allUsers: Player[];
  onUpdatePreference: (proposalId: string, userId: string, prefs: UserPreference) => void;
  onConfirmProposal: (proposalId: string, clusterKey: string) => void;
  onJoinProposal: (proposalId: string) => void;
  onSelectMember: (id: string) => void;
}

const ProposalPlanner: React.FC<ProposalPlannerProps> = ({
  proposal,
  currentUser,
  allUsers,
  onUpdatePreference,
  onConfirmProposal,
  onJoinProposal,
  onSelectMember
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localPref, setLocalPref] = useState<UserPreference | null>(
    currentUser ? proposal.userPreferences[currentUser.id] || null : null
  );

  const userPrefs = proposal.userPreferences;
  const participantsIds = Object.keys(userPrefs);
  const isParticipant = currentUser && participantsIds.includes(currentUser.id);

  // Clustering logic: Group users by identical preferences
  const clusters = useMemo(() => {
    const map: Record<string, string[]> = {};
    participantsIds.forEach(uid => {
      const pref = userPrefs[uid];
      const key = JSON.stringify(pref);
      if (!map[key]) map[key] = [];
      map[key].push(uid);
    });
    return map;
  }, [userPrefs, participantsIds]);

  const handleDragStart = (e: React.DragEvent, userId: string) => {
    e.dataTransfer.setData('userId', userId);
  };

  const handleDropOnCluster = (e: React.DragEvent, clusterKey: string) => {
    e.preventDefault();
    const draggedUserId = e.dataTransfer.getData('userId');
    if (draggedUserId && draggedUserId === currentUser?.id) {
      const targetPrefs = JSON.parse(clusterKey) as UserPreference;
      onUpdatePreference(proposal.id, draggedUserId, targetPrefs);
    }
  };

  const handleSavePref = () => {
    if (currentUser && localPref) {
      onUpdatePreference(proposal.id, currentUser.id, localPref);
      setIsEditing(false);
    }
  };

  // Fix: Cast Object.entries(clusters) to [string, string[]][] to resolve unknown type errors in sub-calls
  const clusterEntries = Object.entries(clusters) as [string, string[]][];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
          <i className="fa-solid fa-users-gear text-amber-500"></i>
          Sandbox Collaborativa
        </h3>
        {!isParticipant && currentUser && (
          <button 
            onClick={() => onJoinProposal(proposal.id)}
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Partecipa alla Proposta
          </button>
        )}
      </div>

      {isParticipant && (
        <div className="glass p-6 rounded-3xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Le tue Preferenze</h4>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
            >
              {isEditing ? 'Annulla' : 'Modifica'}
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Gioco</label>
                <GameAutocomplete 
                  value={localPref?.gameName || ''} 
                  onChange={(name) => setLocalPref(p => p ? {...p, gameName: name} : null)}
                  placeholder="Nome Gioco..."
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white ${proposal.isGameFixed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={proposal.isGameFixed}
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Data</label>
                <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" value={localPref?.date || ''} onChange={e => setLocalPref(p => p ? {...p, date: e.target.value} : null)} />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Ora</label>
                <input type="time" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" value={localPref?.time || ''} onChange={e => setLocalPref(p => p ? {...p, time: e.target.value} : null)} />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Luogo</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Luogo..." value={localPref?.location || ''} onChange={e => setLocalPref(p => p ? {...p, location: e.target.value} : null)} />
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  onClick={handleSavePref}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  Aggiorna Preferenze
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 items-center">
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, currentUser!.id)}
                className="w-12 h-12 rounded-xl border-2 border-indigo-400 p-0.5 animate-pulse cursor-grab active:cursor-grabbing"
              >
                <img src={currentUser!.avatar} className="w-full h-full object-cover rounded-lg" alt="" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-white">{localPref?.gameName || 'Gioco non scelto'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                  {localPref?.date ? `${localPref.date} @ ${localPref.time}` : 'Data da definire'} • {localPref?.location || 'Luogo da definire'}
                </p>
              </div>
              <p className="text-[8px] text-slate-600 font-bold uppercase italic">Trascina il tuo avatar per cambiare gruppo</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusterEntries.map(([clusterKey, userIds]) => {
          const pref = JSON.parse(clusterKey) as UserPreference;
          const status = proposal.clusterStatus[clusterKey] || 'draft';
          // Fix: userIds is now string[] instead of unknown
          const isComplete = userIds.length >= (pref.maxPlayers || 2);
          
          return (
            <div 
              key={clusterKey}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnCluster(e, clusterKey)}
              className={`relative glass p-5 rounded-3xl border-2 transition-all duration-300 ${
                status === 'proposing' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-highlight' : 
                isComplete ? 'border-emerald-500/50' : 'border-dashed border-slate-700'
              } hover:bg-slate-900/40`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-white uppercase">{pref.gameName || 'Senza Nome'}</h5>
                  <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase">
                    <i className="fa-solid fa-calendar text-indigo-400"></i>
                    {pref.date || 'TBD'}
                    <i className="fa-solid fa-clock text-indigo-400 ml-1"></i>
                    {pref.time || 'TBD'}
                  </div>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                  status === 'proposing' ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {/* Fix: userIds is now string[] instead of unknown */}
                {userIds.map(uid => {
                  const u = allUsers.find(x => x.id === uid);
                  return (
                    <div 
                      key={uid} 
                      onClick={() => onSelectMember(uid)}
                      className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-white transition-all"
                    >
                      <img src={u?.avatar} className="w-full h-full object-cover" alt={u?.name} title={u?.name} />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                {/* Fix: userIds is now string[] instead of unknown */}
                <span className="text-[10px] font-black text-slate-500 uppercase">{userIds.length} Partecipanti</span>
                {/* Fix: userIds is now string[] instead of unknown */}
                {userIds.includes(currentUser?.id || '') && (
                  <button 
                    onClick={() => onConfirmProposal(proposal.id, clusterKey)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      status === 'proposing' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {status === 'proposing' ? 'Conferma Apertura' : 'Proponi Apertura'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalPlanner;
