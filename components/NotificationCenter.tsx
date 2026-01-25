
import React from 'react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onClose, 
  onMarkAsRead,
  onClearAll 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-0 w-80 md:w-96 menu-solid rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/20">
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-bell text-indigo-400"></i>
          Notifiche {unreadCount > 0 && <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </h3>
        <div className="flex gap-3">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-bold"
            >
              Svuota
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => onMarkAsRead(n.id)}
                className={`p-4 hover:bg-indigo-600/10 transition-colors cursor-pointer relative ${!n.read ? 'bg-indigo-500/5' : ''}`}
              >
                {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'upcoming' ? 'bg-amber-500/20 text-amber-400' :
                    n.type === 'update' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <i className={`fa-solid ${
                      n.type === 'upcoming' ? 'fa-clock' :
                      n.type === 'update' ? 'fa-pen-to-square' :
                      'fa-user-group'
                    } text-xs`}></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      {new Date(n.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <i className="fa-solid fa-bell-slash text-3xl mb-3 opacity-20"></i>
            <p className="text-sm">Nessuna notifica</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;