
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name?: string, preferences?: string[]) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const togglePref = (cat: string) => {
    setSelectedPrefs(prev => 
      prev.includes(cat) ? prev.filter(p => p !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      onLogin(email, isRegisterMode ? name : undefined, isRegisterMode ? selectedPrefs : undefined);
      setIsLoading(false);
      onClose();
      setIsRegisterMode(false);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPrefs([]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
      <div className="relative w-full max-w-lg bg-[#0d1425] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-t sm:border border-white/10 transition-all duration-300 overflow-y-auto max-h-[95vh] custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-slate-800 text-slate-500 transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="text-center mb-10 mt-2">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20 rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              {isRegisterMode ? (
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6" />
              ) : (
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              )}
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isRegisterMode ? 'Opprett profil' : 'Velkommen tilbake'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isRegisterMode ? 'Bli en del av KulturNorge' : 'Fortsett å utforske kultur over hele landet'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Navn</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#151d2e] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-white text-sm"
                placeholder="Ditt fulle navn"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-post</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#151d2e] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-white text-sm"
              placeholder="navn@eksempel.no"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Passord</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#151d2e] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {isRegisterMode && (
            <div className="py-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Interesser</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePref(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      selectedPrefs.includes(cat)
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!isRegisterMode && (
            <div className="flex items-center justify-between text-[11px] py-2 font-bold px-1">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded-lg border-white/10 bg-slate-900 text-cyan-600 focus:ring-cyan-500/50" />
                <span>Husk meg</span>
              </label>
              <button type="button" className="text-cyan-500/80 hover:text-cyan-400">Glemt passord?</button>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] text-sm transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-cyan-600/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isRegisterMode ? 'Opprett Profil' : 'Logg Inn'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {isRegisterMode ? (
              <>
                Allerede medlem?{' '}
                <button 
                  onClick={() => setIsRegisterMode(false)}
                  className="text-cyan-400 hover:text-cyan-300 ml-1 underline underline-offset-4"
                >
                  Logg inn
                </button>
              </>
            ) : (
              <>
                Ny her?{' '}
                <button 
                  onClick={() => setIsRegisterMode(true)}
                  className="text-cyan-400 hover:text-cyan-300 ml-1 underline underline-offset-4"
                >
                  Registrer deg
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
