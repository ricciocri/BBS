
import React from 'react';
import { AdvancedFilterState } from '../types';

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  isVisible: boolean;
  mode?: 'tables' | 'proposals';
}

const ToggleSwitch: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  color: 'indigo' | 'amber';
}> = ({ label, icon, active, onClick, color }) => {
  const activeColor = color === 'indigo' ? 'bg-indigo-600' : 'bg-amber-500';
  const activeText = color === 'indigo' ? 'text-indigo-400' : 'text-amber-400';
  const activeBg = color === 'indigo' ? 'bg-indigo-500/10' : 'bg-amber-500/10';
  const activeBorder = color === 'indigo' ? 'border-indigo-500/30' : 'border-amber-500/30';

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] ${active ? `${activeBg} ${activeBorder}` : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? activeBg + ' ' + activeText : 'bg-slate-800 text-slate-500'}`}>
          <i className={`fa-solid ${icon} text-base md:text-sm`}></i>
        </div>
        <span className={`text-xs md:text-sm font-bold tracking-tight transition-colors ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
      </div>
      <button 
        type="button"
        onClick={onClick}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none ring-offset-slate-900 focus:ring-2 focus:ring-indigo-500/20 ${active ? activeColor : 'bg-slate-700'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onChange, onReset, isVisible, mode = 'tables' }) => {
  if (!isVisible) return null;

  const handleChange = (key: keyof AdvancedFilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass rounded-3xl p-5 md:p-6 border border-slate-700/50 space-y-6 md:space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-sliders text-indigo-400"></i>
          <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-white">Opzioni Ricerca {mode === 'proposals' ? 'Proposte' : 'Tavoli'}</h4>
        </div>
        <button onClick={onReset} className="text-[10px] md:text-xs text-slate-500 hover:text-indigo-400 font-bold transition-colors uppercase">Resetta</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Gruppo 1: Tipo di Gioco */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Tipo di Gioco</p>
          <div className="flex flex-col gap-2">
            {[
              { id: 'all', label: 'Tutti i tipi', icon: 'fa-layer-group', style: 'indigo' },
              { id: 'boardgame', label: 'GDT (Boardgame)', icon: 'fa-dice-six', style: 'emerald' },
              { id: 'rpg', label: 'GDR (Roleplay)', icon: 'fa-dice-d20', style: 'indigo' }
            ].map(t => (
              <button 
                  key={t.id}
                  onClick={() => handleChange('typeFilter', t.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                    filters.typeFilter === t.id 
                      ? `bg-${t.style}-500/20 border-${t.style}-500/50 text-${t.style}-400` 
                      : 'bg-slate-900/50 border-slate-700/80 text-slate-500 hover:border-slate-600'
                  }`}
              >
                  <i className={`fa-solid ${t.icon} mr-2`}></i>
                  {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gruppo 2: Formato */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Filtro Formato</p>
          <div className="flex flex-col gap-2">
            {[
              { id: 'all', label: 'Tutti i formati', icon: null, style: 'indigo' },
              { id: 'campaign', label: 'Campagne', icon: 'fa-scroll', style: 'amber' },
              { id: 'tournament', label: 'Tornei', icon: 'fa-trophy', style: 'rose' },
              { id: 'single', label: 'Giocate Singole', icon: 'fa-bolt-lightning', style: 'sky' }
            ].map(f => (
              <button 
                  key={f.id}
                  onClick={() => handleChange('formatFilter', f.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                    filters.formatFilter === f.id 
                      ? `bg-${f.style}-500/20 border-${f.style}-500/50 text-${f.style}-400` 
                      : 'bg-slate-900/50 border-slate-700/80 text-slate-500 hover:border-slate-600'
                  }`}
              >
                  {f.icon && <i className={`fa-solid ${f.icon} mr-2`}></i>}
                  {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Pianificazione & Info</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1 ml-1">
                {mode === 'tables' ? 'Data da' : 'Postata dopo il'}
              </label>
              <input 
                type="date" 
                value={filters.dateFrom} 
                onChange={(e) => handleChange('dateFrom', e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" 
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1 ml-1">
                {mode === 'proposals' ? 'Cerca Proponente' : 'Località'}
              </label>
              <input 
                type="text" 
                placeholder={mode === 'proposals' ? "Nome utente..." : "Cerca luogo..."} 
                value={mode === 'proposals' ? filters.participantSearch : filters.locationSearch} 
                onChange={(e) => handleChange(mode === 'proposals' ? 'participantSearch' : 'locationSearch', e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/30" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Filtri Personali</p>
          <div className="flex flex-col gap-3">
            <ToggleSwitch 
              label={mode === 'proposals' ? "Miei interessi" : "Miei tavoli"} 
              icon={mode === 'proposals' ? "fa-star" : "fa-user-check"} 
              active={filters.showOnlyJoined} 
              color="indigo" 
              onClick={() => handleChange('showOnlyJoined', !filters.showOnlyJoined)} 
            />
            {mode === 'tables' ? (
              <ToggleSwitch label="Tavoli passati" icon="fa-clock-rotate-left" active={filters.showPastTables} color="amber" onClick={() => handleChange('showPastTables', !filters.showPastTables)} />
            ) : (
              <ToggleSwitch label="Mie proposte" icon="fa-lightbulb" active={filters.showOnlyMyProposals} color="amber" onClick={() => handleChange('showOnlyMyProposals', !filters.showOnlyMyProposals)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
