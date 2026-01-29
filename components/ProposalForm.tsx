
import React, { useState, useEffect, useRef } from 'react';
import { GameType, GameProposal, GameFormat, Player } from '../types';
import { generateGameDescription } from '../services/geminiService';
import GameAutocomplete from './GameAutocomplete';
import { getGeekGameDetails } from '../services/geekService';

interface ProposalFormProps {
  onCancel: () => void;
  onSubmit: (proposal: Omit<GameProposal, 'id' | 'interestedPlayerIds' | 'createdAt' | 'proposer' | 'userPreferences' | 'clusterStatus'>) => void;
  initialData?: Partial<GameProposal> | null;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ onCancel, onSubmit, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '', 
    gameName: '',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: '',
    imageUrl: '',
    maxPlayersGoal: 4,
    geekId: '',
    date: '',
    time: '',
    location: '',
    system: ''
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
        geekId: initialData.geekId || '',
        date: initialData.date || '',
        time: initialData.time || '',
        location: initialData.location || '',
        system: initialData.system || ''
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, title: formData.gameName });
  };

  return (
    <div className="max-w-2xl mx-auto glass rounded-3xl p-5 md:p-8 border border-slate-700 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold font-fantasy text-white">
          {initialData?.id ? 'Modifica proposta' : 'Lancia una Proposta'}
        </h2>
        <button onClick={onCancel} type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div className="space-y-5">
            <div className="col-span-full">
                <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Gioco (Opzionale, Cerca su BGG/RPGGeek)</label>
                <GameAutocomplete 
                  value={formData.gameName}
                  gameType={formData.type}
                  onChange={handleGameSelect}
                  placeholder={formData.type === GameType.RPG ? "Cerca su RPGGeek..." : "Cerca su BoardGameGeek..."}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none text-base font-bold"
                />
            </div>
            
            {formData.type === GameType.RPG && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Sistema di gioco</label>
                <input 
                  type="text" 
                  placeholder="Es: D&D 5e, Cyberpunk, ecc..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none text-base"
                  value={formData.system}
                  onChange={e => setFormData({...formData, system: e.target.value})}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Tipologia Default</label>
                  <select 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none text-base" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as GameType})}
                  >
                      <option value={GameType.RPG}>GdR</option>
                      <option value={GameType.BOARD_GAME}>GDT</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Formato Default</label>
                  <select 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none text-base"
                    value={formData.format}
                    onChange={e => setFormData({...formData, format: e.target.value as GameFormat})}
                  >
                    <option value={GameFormat.SINGLE_PLAY}>One-shot</option>
                    <option value={GameFormat.CAMPAIGN}>Campagna</option>
                    <option value={GameFormat.TOURNAMENT}>Torneo</option>
                  </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Obiettivo Giocatori</label>
                <input 
                  required
                  type="number" 
                  min="1" 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white outline-none text-base" 
                  value={formData.maxPlayersGoal} 
                  onChange={e => setFormData({...formData, maxPlayersGoal: parseInt(e.target.value)})} 
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Immagine</label>
                <div className="flex gap-2">
                    {formData.imageUrl && (
                        <img src={formData.imageUrl} className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0" alt="" />
                    )}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-white transition-all h-14 flex items-center justify-center"
                    >
                      <i className="fa-solid fa-upload mr-2"></i> Foto
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
            </div>
        </div>

        <div className="relative">
          <label className="block text-xs md:text-sm font-semibold text-slate-400 mb-2">Perché dovremmo giocare? (Obbligatorio)</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 md:py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-base"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <button 
            type="button"
            onClick={handleAiPitch}
            disabled={isGenerating}
            className="absolute bottom-4 right-4 text-emerald-400 bg-slate-900/90 px-3 py-2 rounded-lg text-xs border border-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            Pitch IA
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5">Data Suggerita</label>
                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 md:px-3 md:py-2 text-base md:text-sm text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5">Ora Suggerita</label>
                <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 md:px-3 md:py-2 text-base md:text-sm text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5">Luogo Suggerito</label>
                <input 
                  type="text"
                  placeholder="Es: La Gilda, ecc..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 md:px-3 md:py-2 text-base md:text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
            </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
          <button type="button" onClick={onCancel} className="w-full md:flex-1 py-4 md:py-3 border border-slate-700 text-slate-400 rounded-xl font-semibold hover:bg-slate-800 transition-colors">Annulla</button>
          <button type="submit" disabled={isFetching} className="w-full md:flex-1 py-4 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50">
            {isFetching ? 'Recupero dati...' : (initialData?.id ? 'Salva Modifiche' : 'Crea proposta')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
