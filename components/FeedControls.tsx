
import React, { useState, useMemo } from 'react';
import { SortType, GroupType } from '../types';

interface FeedControlsProps {
  mode: 'tables' | 'proposals';
  sort: SortType;
  group: GroupType;
  onSortChange: (sort: SortType) => void;
  onGroupChange: (group: GroupType) => void;
}

const FeedControls: React.FC<FeedControlsProps> = ({ mode, sort, group, onSortChange, onGroupChange }) => {
  return (
    <div className="glass rounded-2xl p-3 md:p-4 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
      
      {/* Ordinamento */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-arrow-down-wide-short text-rose-400"></i>
          Ordina per data di
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
            { id: 'none', label: 'Nessuno' },
            { id: 'game', label: 'Gioco' },
            { id: 'day', label: 'Giorno' },
            { id: 'week', label: 'Sett.' },
            { id: 'month', label: 'Mese' },
            { id: 'year', label: 'Anno' }
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
  );
};

export default FeedControls;
