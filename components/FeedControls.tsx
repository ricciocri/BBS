
import React, { useState, useMemo } from 'react';
import { SortType, GroupType } from '../types';

interface FeedControlsProps {
  mode: 'tables' | 'proposals';
  sort: SortType;
  group: GroupType;
  viewMode?: 'grid' | 'compact';
  onSortChange: (sort: SortType) => void;
  onGroupChange: (group: GroupType) => void;
  onViewModeChange?: (view: 'grid' | 'compact') => void;
}

const FeedControls: React.FC<FeedControlsProps> = ({ 
  mode, 
  sort, 
  group, 
  viewMode = 'grid',
  onSortChange, 
  onGroupChange,
  onViewModeChange
}) => {
  return (
    <div className="glass rounded-2xl p-3 md:p-4 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Ordinamento */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-arrow-down-wide-short text-rose-400"></i>
            Ordina per
          </span>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => onSortChange('session')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sort === 'session' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sessione
            </button>
            <button 
              onClick={() => onSortChange('creation')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sort === 'creation' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Creazione
            </button>
          </div>
        </div>

        <div className="hidden lg:block w-px h-6 bg-slate-800"></div>

        {/* Raggruppamento */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-sky-400"></i>
            Raggruppa
          </span>
          <div className="flex flex-wrap bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'none', label: 'No' },
              { id: 'game', label: 'Gioco' },
              { id: 'day', label: 'Giorno' },
              { id: 'month', label: 'Mese' }
            ].map((g) => (
              <button 
                key={g.id}
                onClick={() => onGroupChange(g.id as GroupType)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${group === g.id ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualizzazione Toggle */}
      {onViewModeChange && (
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vista</span>
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              title="Griglia"
            >
              <i className="fa-solid fa-grip text-sm"></i>
            </button>
            <button 
              onClick={() => onViewModeChange('compact')}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'compact' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              title="Lista Compatta"
            >
              <i className="fa-solid fa-list text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedControls;
