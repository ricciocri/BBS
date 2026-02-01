
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, isAdmin: boolean, avatar?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Fix: Added null checks for username and password to prevent errors on optional properties
    const user = MOCK_USERS.find(u => 
      u.username && u.password &&
      (u.username.toLowerCase() === formData.username.toLowerCase() || u.username.toLowerCase() === formData.email.toLowerCase()) && 
      u.password === formData.password
    );

    if (user) {
      onLogin(user.name, !!user.isAdmin, user.avatar);
      onClose();
    } else if (isLogin) {
      setError('Credenziali non valide. Prova utente1/utente1 o tester1/tester1.');
    } else {
      // Per la registrazione mock, accettiamo chiunque
      const displayName = formData.username || 'Nuovo Utente';
      onLogin(displayName, false, `https://picsum.photos/seed/${displayName}/40/40`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-slate-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-fantasy text-white">
            {isLogin ? 'Bentornato!' : 'Benvenut3 nella community'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 mb-8">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            Accedi
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            Registrati
          </button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              {isLogin ? 'Username (es: utente1)' : 'Username'}
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
              <input 
                type="text" 
                required
                placeholder={isLogin ? "Inserisci lo username" : "Scegli un handle"}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input 
                  type="email" 
                  required
                  placeholder="nome@esempio.it"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              {isLogin && <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">Dimenticata?</button>}
            </div>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 mt-4"
          >
            {isLogin ? 'Entra nella community' : 'Crea Account'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50"></div></div>
            <span className="relative bg-[#1e293b] px-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Oppure continua con</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 group">
                <i className="fa-brands fa-google text-red-400 group-hover:scale-110 transition-transform"></i> Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 group">
                <i className="fa-brands fa-apple text-white group-hover:scale-110 transition-transform"></i> Apple
              </button>
            </div>
            <button className="flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 group">
              <i className="fa-brands fa-facebook text-[#1877F2] group-hover:scale-110 transition-transform text-sm"></i> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
