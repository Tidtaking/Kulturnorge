
import React, { useState, useEffect, useMemo } from 'react';
import { CulturalEvent, EventCategory, User } from './types';
import { MOCK_EVENTS, CITIES, CATEGORIES } from './constants';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import LoginModal from './components/LoginModal';
import { discoverEventsWithAI } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [events, setEvents] = useState<CulturalEvent[]>(() => {
    const saved = localStorage.getItem('kn-custom-events');
    return saved ? [...MOCK_EVENTS, ...JSON.parse(saved)] : MOCK_EVENTS;
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('kn-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kn-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Alle');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [activeTab, setActiveTab] = useState<'explore' | 'favorites' | 'foryou'>('explore');
  
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSources, setAiSources] = useState<{title: string, uri: string}[]>([]);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('kn-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kn-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kn-user');
    }
  }, [user]);

  // Filter and Sort logic
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    let result = events
      // Filter out past events
      .filter(event => event.date >= today);

    // Filter based on active tab
    if (activeTab === 'favorites') {
      result = result.filter(event => favorites.has(event.id));
    } else if (activeTab === 'foryou' && user?.preferences) {
      result = result.filter(event => user.preferences?.includes(event.category));
    } else if (activeTab === 'explore' && user?.preferences && !searchQuery && selectedCity === 'Alle' && selectedCategory === 'Alle') {
        // Default smart view: suggest some preferences even in explore
        // But for now, let's keep explore pure unless "For You" is clicked
    }

    // Apply manual filters
    result = result.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'Alle' || event.city === selectedCity;
      const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
      return matchesSearch && matchesCity && matchesCategory;
    });

    // Sort by date ascending (closest events first)
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, searchQuery, selectedCity, selectedCategory, activeTab, favorites, user]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await discoverEventsWithAI(aiPrompt);
      
      const newEvents: CulturalEvent[] = result.events.map((e, idx) => ({
        id: `ai-${idx}-${Date.now()}`,
        title: e.title || 'Uten tittel',
        description: e.description || 'Ingen beskrivelse tilgjengelig.',
        date: e.date || '2025-01-01',
        location: e.venue || 'Ukjent sted',
        city: e.city || 'Ukjent by',
        category: (e.category as EventCategory) || EventCategory.OTHER,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(e.title || 'event')}/800/600`,
        tags: ['AI-funn', e.category || 'Kultur'],
        price: 'Se kilde'
      }));

      if (newEvents.length > 0) {
        setEvents(prev => [...newEvents, ...prev]);
        const customEvents = events.filter(e => e.id.startsWith('ai-'));
        localStorage.setItem('kn-custom-events', JSON.stringify([...customEvents, ...newEvents]));
        
        setAiSources(result.sources);
        setSearchQuery('');
        setSelectedCity('Alle');
        setSelectedCategory('Alle');
        setActiveTab('explore');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleLogin = (email: string, name?: string, preferences?: string[]) => {
    setUser({ 
      email, 
      name: name || email.split('@')[0],
      preferences: preferences || []
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('explore');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] pb-24 md:pb-8">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/5 safe-top">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden xs:block">
              KulturNorge
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('explore')}
              className={`transition-colors font-medium ${activeTab === 'explore' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              Utforsk
            </button>
            {user && (
              <button 
                onClick={() => setActiveTab('foryou')}
                className={`transition-colors font-medium ${activeTab === 'foryou' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                For deg
              </button>
            )}
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 transition-colors font-medium ${activeTab === 'favorites' ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
            >
              Favoritter
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3 bg-slate-900/50 p-1 md:pr-3 rounded-full border border-white/5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.name?.[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] text-slate-500 uppercase leading-none mb-0.5">Bruker</p>
                  <p className="text-xs font-bold text-white truncate max-w-[80px]">{user.name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-all"
                  title="Logg ut"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 md:px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-sm font-bold transition-all shadow-lg shadow-cyan-600/10 active:scale-95"
              >
                Logg inn
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-white/5 px-6 pb-6 pt-3 flex justify-between items-center safe-bottom">
        <button 
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'explore' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>
          <span className="text-[10px] font-bold">Utforsk</span>
        </button>
        <button 
          onClick={() => {
            if (!user) setIsLoginModalOpen(true);
            else setActiveTab('foryou');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'foryou' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span className="text-[10px] font-bold">For deg</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'favorites' ? 'text-rose-400 scale-110' : 'text-slate-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'favorites' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span className="text-[10px] font-bold">Favoritter</span>
        </button>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Dynamic Header Titles */}
        <div className="mb-8 md:mb-12">
          {activeTab === 'explore' && (
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight tracking-tight">
                Gjør deg klar for <br /> <span className="text-cyan-400">opplevelser</span> i Norge.
              </h2>
              <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto md:mx-0">
                Alt fra små gallerier til store stadionkonserter. Vi hjelper deg å finne det neste store.
              </p>
            </div>
          )}
          {activeTab === 'favorites' && (
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black mb-2 text-rose-400">Favoritter</h2>
              <p className="text-slate-400 text-sm md:text-lg">Dine lagrede øyeblikk på ett sted.</p>
            </div>
          )}
          {activeTab === 'foryou' && (
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black mb-2 text-cyan-400">Håndplukket for deg</h2>
              <p className="text-slate-400 text-sm md:text-lg">Basert på dine interesser: {user?.preferences?.join(', ')}</p>
            </div>
          )}
        </div>

        {/* AI Box - Unified and Mobile Friendly */}
        <section className="mb-10 md:mb-14">
          <div className="glass p-5 md:p-8 rounded-3xl border-cyan-500/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3 className="text-lg font-bold">Smarte forslag</h3>
            </div>
            
            <form onSubmit={handleAiSearch} className="relative flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Hva skjer i Bergen neste helg?"
                className="flex-grow bg-[#151d2e] border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={isAiLoading}
                className="px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-all font-bold text-sm shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Finn nå'
                )}
              </button>
            </form>
            
            {aiSources.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 items-center px-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Søkekilder:</span>
                {aiSources.map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400/80 hover:text-cyan-400 transition-colors flex items-center gap-1 underline underline-offset-4 decoration-cyan-500/20">
                    {source.title.slice(0, 20)}...
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Filter Section - Mobile Optimised Tabs & Selects */}
        <section className="mb-10">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Søk i titler, artister eller steder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151d2e] border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm shadow-inner"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              <div className="flex-shrink-0 relative group">
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-[#151d2e] border border-white/5 rounded-xl py-3 pl-4 pr-10 focus:outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-[#1c263d] transition-colors"
                >
                  <option value="Alle">Hele landet</option>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              <div className="flex-shrink-0 relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#151d2e] border border-white/5 rounded-xl py-3 pl-4 pr-10 focus:outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-[#1c263d] transition-colors"
                >
                  <option value="Alle">Kategorier</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {/* Quick filter badges */}
              <button 
                onClick={() => setSearchQuery('') || setSelectedCity('Alle') || setSelectedCategory('Alle')}
                className="flex-shrink-0 px-4 py-3 rounded-xl bg-slate-800/40 text-[10px] font-black uppercase tracking-tighter hover:bg-slate-800 transition-colors"
              >
                Nullstill
              </button>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={setSelectedEvent} 
                  isFavorite={favorites.has(event.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 glass rounded-[2.5rem] text-center border-white/5">
              <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-300">
                {activeTab === 'favorites' ? 'Ingen favoritter lagret' : 
                 activeTab === 'foryou' ? 'Ingen treff på dine preferanser' :
                 'Ingen arrangementer funnet'}
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs text-sm">
                {activeTab === 'favorites' ? 'Trykk på hjerte-ikonet på et arrangement for å lagre det til senere.' : 
                 'Prøv et bredere søk eller endre by og kategori i filtrene.'}
              </p>
              {activeTab !== 'explore' && (
                <button 
                  onClick={() => setActiveTab('explore')}
                  className="mt-8 px-8 py-3 rounded-2xl bg-cyan-600/10 text-cyan-400 font-bold text-sm border border-cyan-500/20 hover:bg-cyan-600/20 transition-all"
                >
                  Utforsk alt
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="container mx-auto px-6 py-16 border-t border-white/5 text-center mt-10">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6 border border-white/5">
          <span className="text-slate-500 font-bold">K</span>
        </div>
        <p className="text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
          &copy; 2024 KulturNorge &bull; Powered by Gemini AI
        </p>
      </footer>

      {/* Overlays */}
      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem); }
        @media (max-width: 480px) {
          .xs\\:hidden { display: none; }
          .xs\\:block { display: block; }
        }
      `}</style>
    </div>
  );
};

export default App;
