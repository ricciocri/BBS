
import React, { useState, useMemo } from 'react';
import { GameTable, Player, GameType } from '../types';

interface CalendarViewProps {
  tables: GameTable[];
  currentUser: Player | null;
  onSelectTable: (table: GameTable) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tables, currentUser, onSelectTable }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Default a Novembre 2025 come richiesto

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Gestione inizio settimana (Domenica = 0, Lunedì = 1)
    // Convertiamo a Lunedì = 0
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const tablesByDay = useMemo(() => {
    const map: Record<number, GameTable[]> = {};
    tables.forEach(table => {
      const tDate = new Date(table.date);
      if (tDate.getFullYear() === currentDate.getFullYear() && tDate.getMonth() === currentDate.getMonth()) {
        const day = tDate.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(table);
      }
    });
    return map;
  }, [tables, currentDate]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  return (
    <div className="glass rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
            <i className="fa-solid fa-calendar-days text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-fantasy font-bold text-white tracking-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pianificazione Gilda BBS</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-6 text-xs font-black uppercase text-slate-400 hover:text-indigo-400 transition-colors"
          >
            Oggi
          </button>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="bg-slate-900/40 p-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, idx) => (
          <div 
            key={idx} 
            className={`min-h-[100px] md:min-h-[140px] p-2 bg-slate-900/20 transition-colors ${day ? 'hover:bg-slate-800/40' : 'bg-slate-950/20 opacity-50'}`}
          >
            {day && (
              <div className="flex flex-col h-full">
                <span className={`text-xs font-bold mb-2 ml-1 ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'text-indigo-400 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center' : 'text-slate-500'}`}>
                  {day}
                </span>
                <div className="space-y-1 overflow-y-auto max-h-[80px] md:max-h-[100px] no-scrollbar">
                  {tablesByDay[day]?.map(table => (
                    <button
                      key={table.id}
                      onClick={() => onSelectTable(table)}
                      className={`w-full text-left p-1.5 rounded-lg border text-[9px] font-bold leading-tight transition-all active:scale-95 flex items-center gap-1.5 truncate group ${
                        table.type === GameType.RPG 
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-400'
                      }`}
                    >
                      <i className={`fa-solid ${table.type === GameType.RPG ? 'fa-dice-d20' : 'fa-dice-six'} shrink-0 opacity-70 group-hover:opacity-100`}></i>
                      <span className="truncate">{table.gameName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giochi di Ruolo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giochi da Tavolo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campagne in Corso</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
