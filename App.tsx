
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
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  
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

    // Apply preferences if logged in and in "Recommended" mode or just by default if nothing else is selected
    if (user && user.preferences && user.preferences.length > 0 && (showRecommendedOnly || (!searchQuery && selectedCity === 'Alle' && selectedCategory === 'Alle' && !showOnlyFavorites))) {
      result = result.filter(event => user.preferences?.includes(event.category));
    }

    // Apply normal filters
    result = result.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'Alle' || event.city === selectedCity;
      const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
      const matchesFavorite = !showOnlyFavorites || favorites.has(event.id);
      return matchesSearch && matchesCity && matchesCategory && matchesFavorite;
    });

    // Sort by date ascending (closest events first)
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, searchQuery, selectedCity, selectedCategory, showOnlyFavorites, showRecommendedOnly, favorites, user]);

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
        setShowOnlyFavorites(false);
        setShowRecommendedOnly(false);
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
    setShowRecommendedOnly(false);
  };

  const isShowingPreferences = user && user.preferences && user.preferences.length > 0 && !searchQuery && selectedCity === 'Alle' && selectedCategory === 'Alle' && !showOnlyFavorites;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 w-full glass border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setShowOnlyFavorites(false); setShowRecommendedOnly(false); }}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              KulturNorge
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => { setShowOnlyFavorites(false); setShowRecommendedOnly(false); }}
              className={`transition-colors ${!showOnlyFavorites && !showRecommendedOnly ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
            >
              Utforsk
            </button>
            {user && (
              <button 
                onClick={() => { setShowOnlyFavorites(false); setShowRecommendedOnly(true); }}
                className={`transition-colors ${showRecommendedOnly ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
              >
                For deg
              </button>
            )}
            <button 
              onClick={() => { setShowOnlyFavorites(true); setShowRecommendedOnly(false); }}
              className={`flex items-center gap-2 transition-colors ${showOnlyFavorites ? 'text-rose-400' : 'text-slate-300 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={showOnlyFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              Favoritter
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">Logget inn som</p>
                  <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user.name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  title="Logg ut"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold transition-all border border-white/5 active:scale-95"
              >
                Logg inn
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showOnlyFavorites && (
          <>
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                Oppdag <span className="text-cyan-400">øyeblikkene</span> <br /> som former Norge.
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                {user ? `Velkommen tilbake, ${user.name}! Her er kommende arrangementer ${isShowingPreferences ? 'basert på din smak' : 'over hele landet'}.` : 'Fra de mørkeste kjellerklubbene i Oslo til de lyseste sommerfestivalene i Lofoten. Vi samler alt på ett sted.'}
              </p>
            </div>

            <div className="mb-12 glass p-6 md:p-8 rounded-3xl border-cyan-500/20 shadow-xl shadow-cyan-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Spør vår AI-guide</h3>
                  <p className="text-slate-400 text-sm">Finn noe spesifikt eller få anbefalinger basert på dine interesser</p>
                </div>
              </div>
              
              <form onSubmit={handleAiSearch} className="relative">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="F.eks. 'Hva skjer i Tromsø til helgen?' eller 'Finn jazzkonserter i Oslo i oktober'"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all pr-32"
                />
                <button 
                  type="submit"
                  disabled={isAiLoading}
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-all font-bold flex items-center gap-2"
                >
                  {isAiLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Spør'
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder="Søk i titler og beskrivelser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-12 focus:outline-none focus:border-cyan-500 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 appearance-none min-w-[140px]"
            >
              <option value="Alle">Hele Norge</option>
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 appearance-none min-w-[140px]"
            >
              <option value="Alle">Alle kategorier</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Results Info */}
        {(isShowingPreferences || showRecommendedOnly) && (
          <div className="mb-6 flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-400">Personaliserte anbefalinger</p>
                <p className="text-xs text-slate-400">Viser arrangementer basert på dine interesser: {user?.preferences?.join(', ')}</p>
              </div>
            </div>
            <button 
              onClick={() => { setShowRecommendedOnly(false); setSearchQuery(' '); setTimeout(() => setSearchQuery(''), 0); }}
              className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4"
            >
              Vis alle
            </button>
          </div>
        )}

        {/* Results Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl">
            <div className="text-slate-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <h3 className="text-xl font-medium text-slate-300">
              {showOnlyFavorites ? 'Du har ingen favoritter enda' : 'Ingen kommende arrangementer funnet'}
            </h3>
            <p className="text-slate-500 mt-2">
              {showOnlyFavorites ? 'Trykk på hjerte-ikonet på et arrangement for å lagre det.' : 'Prøv å endre filtrene eller spør AI-guiden ovenfor.'}
            </p>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-12 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          &copy; 2024 KulturNorge. Utviklet for å koble mennesker med kultur.
        </p>
      </footer>

      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
