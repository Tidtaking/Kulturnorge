
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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl border border-white/10 transition-all duration-300 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isRegisterMode ? (
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6" />
              ) : (
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              )}
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegisterMode ? 'Opprett konto' : 'Velkommen tilbake'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isRegisterMode ? 'Fortell oss hva du liker' : 'Logg inn for å se dine personlige anbefalinger'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Fullt navn</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white"
                placeholder="Ola Nordmann"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">E-post</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white"
              placeholder="navn@eksempel.no"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Passord</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white"
              placeholder="••••••••"
            />
          </div>

          {isRegisterMode && (
            <div className="py-2">
              <label className="block text-sm font-medium text-slate-300 mb-3 ml-1">Hva interesserer deg?</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePref(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedPrefs.includes(cat)
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!isRegisterMode && (
            <div className="flex items-center justify-between text-xs py-2">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500" />
                Husk meg
              </label>
              <a href="#" className="text-cyan-400 hover:underline">Glemt passord?</a>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isRegisterMode ? 'Opprett konto' : 'Logg inn'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            {isRegisterMode ? (
              <>
                Har du allerede en konto?{' '}
                <button 
                  onClick={() => setIsRegisterMode(false)}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Logg inn
                </button>
              </>
            ) : (
              <>
                Har du ikke konto?{' '}
                <button 
                  onClick={() => setIsRegisterMode(true)}
                  className="text-cyan-400 font-semibold hover:underline"
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
