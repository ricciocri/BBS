
import React, { useState, useMemo } from 'react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onBack: () => void;
  onNavigateToTable: (tableId: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClearAll,
  onBack,
  onNavigateToTable
}) => {
  const [filter, setFilter] = useState<'all' | 'tables' | 'proposals'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'all') return true;
      if (filter === 'tables') return n.type === 'upcoming' || n.type === 'join' || n.type === 'leave' || (n.type === 'update' && n.tableId);
      if (filter === 'proposals') return n.type === 'update' && !n.tableId;
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Sezione */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 -mr-16 -mt-16 rounded-full blur-2xl"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-fantasy font-bold text-white">Centro Notifiche</h2>
            {unreadCount > 0 && (
              <div className="bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/30">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                  {unreadCount} nuove
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">Rimani aggiornato sui tuoi tavoli e sulle proposte della community.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative z-10 flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Torna Indietro
        </button>
      </div>

      {/* Controlli e Filtri */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700 w-full sm:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Tutte
          </button>
          <button 
            onClick={() => setFilter('tables')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'tables' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Tavoli
          </button>
          <button 
            onClick={() => setFilter('proposals')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'proposals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Proposte
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-4">
            <button 
              onClick={onMarkAllAsRead}
              className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
            >
              Segna tutte come lette
            </button>
            <div className="w-px h-4 bg-slate-800"></div>
            <button 
              onClick={onClearAll}
              className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
            >
              Pulisci tutto
            </button>
          </div>
        )}
      </div>

      {/* Lista Notifiche */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => {
                onMarkAsRead(n.id);
                if (n.tableId) onNavigateToTable(n.tableId);
              }}
              className={`glass group p-6 rounded-3xl border transition-all cursor-pointer relative flex items-start gap-6 ${
                !n.read 
                  ? 'border-indigo-500/30 bg-indigo-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/20'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                n.type === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                n.type === 'update' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                n.type === 'join' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                <i className={`fa-solid ${
                  n.type === 'upcoming' ? 'fa-calendar-check' :
                  n.type === 'update' ? 'fa-arrows-rotate' :
                  n.type === 'join' ? 'fa-user-plus' :
                  'fa-user-minus'
                } text-xl md:text-2xl`}></i>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-base font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {new Date(n.timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-300' : 'text-slate-500'}`}>
                  {n.message}
                </p>
                {n.tableId && (
                  <div className="pt-2 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    <span>Vai al tavolo</span>
                    <i className="fa-solid fa-arrow-right text-[8px]"></i>
                  </div>
                )}
              </div>

              {!n.read && (
                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              )}
            </div>
          ))
        ) : (
          <div className="py-32 text-center glass rounded-[3rem] border-2 border-dashed border-slate-800">
            <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <i className="fa-solid fa-bell-slash text-4xl text-slate-700"></i>
            </div>
            <h3 className="text-xl font-fantasy font-bold text-slate-500 mb-2">Nessuna notifica</h3>
            <p className="text-sm text-slate-600">Al momento non ci sono avvisi per te in questa categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
