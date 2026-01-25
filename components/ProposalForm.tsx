
import React, { useState, useEffect } from 'react';
import { GameType, GameProposal, GameFormat, Player } from '../types';
import { generateGameDescription } from '../services/geminiService';
import GameAutocomplete from './GameAutocomplete';
import { getGeekGameDetails } from '../services/geekService';

interface ProposalFormProps {
  onCancel: () => void;
  onSubmit: (proposal: Omit<GameProposal, 'id' | 'interestedPlayerIds' | 'createdAt' | 'proposer'>) => void;
  initialData?: Partial<GameProposal> | null;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ onCancel, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '', // Per compatibilità ma automatizzato
    gameName: '',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: '',
    imageUrl: '',
    maxPlayersGoal: 4,
    geekId: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || initialData.gameName || '',
        gameName: initialData.gameName || '',
        type: initialData.type || GameType.BOARD_GAME,
        format: initialData.format || GameFormat.SINGLE_PLAY,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        maxPlayersGoal: initialData.maxPlayersGoal || 4,
        geekId: initialData.geekId || ''
      }));
    }
  }, [initialData]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleAiPitch = async () => {
    if (!formData.gameName) {
        alert("Inserisci il nome del gioco!");
        return;
    }
    setIsGenerating(true);
    const desc = await generateGameDescription(formData.gameName, formData.type);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleGameSelect = async (name: string, geekId?: string, imageUrl?: string) => {
    setFormData(prev => ({ 
      ...prev, 
      gameName: name, 
      title: name,
      imageUrl: imageUrl || prev.imageUrl,
      geekId: geekId || ''
    }));
    
    if (geekId) {
        setIsFetching(true);
        const details = await getGeekGameDetails(geekId, formData.type);
        if (details.image) setFormData(prev => ({ ...prev, imageUrl: details.image! }));
        setIsFetching(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass rounded-3xl p-8 border border-slate-700 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold font-fantasy mb-6 text-white text-center">
        {initialData?.id ? 'Modifica proposta' : 'Lancia una Proposta'}
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({...formData, title: formData.gameName}); }} className="space-y-5">
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Gioco (Cerca su {formData.type === GameType.RPG ? 'RPGGeek' : 'BGG'})</label>
                <GameAutocomplete 
                  value={formData.gameName}
                  gameType={formData.type}
                  onChange={handleGameSelect}
                  placeholder={formData.type === GameType.RPG ? "Cerca su RPGGeek..." : "Cerca su BoardGameGeek..."}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white outline-none text-base font-bold"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tipo</label>
                  <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none text-base" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as GameType})}>
                      <option value={GameType.RPG}>GdR</option>
                      <option value={GameType.BOARD_GAME}>GDT</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Formato</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none text-base"
                    value={formData.format}
                    onChange={e => setFormData({...formData, format: e.target.value as GameFormat})}
                  >
                    <option value={GameFormat.SINGLE_PLAY}>One-shot</option>
                    <option value={GameFormat.CAMPAIGN}>Campagna</option>
                    <option value={GameFormat.TOURNAMENT}>Torneo</option>
                  </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Obiettivo Giocatori</label>
              <input type="number" min="1" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-base" value={formData.maxPlayersGoal} onChange={e => setFormData({...formData, maxPlayersGoal: parseInt(e.target.value)})} />
            </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Perché dovremmo giocare?</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-base"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <button 
            type="button"
            onClick={handleAiPitch}
            disabled={isGenerating}
            className="absolute top-9 right-4 text-emerald-400 bg-slate-900/80 px-2 py-1 rounded-md text-[10px] border border-emerald-500/30 flex items-center gap-1"
          >
            {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            Pitch IA
          </button>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 rounded-xl font-semibold hover:bg-slate-800">Annulla</button>
          <button type="submit" disabled={isFetching} className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50">
            {isFetching ? 'Recupero dati...' : (initialData?.id ? 'Salva Modifiche' : 'Crea proposta')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
