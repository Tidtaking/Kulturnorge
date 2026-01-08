import React, { useState, useMemo } from 'react';
import { CulturalEvent, User } from './types';
import { MOCK_EVENTS, CITIES } from './constants';
import { discoverEventsWithAI } from './services/geminiService';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  const [events, setEvents] = useState<CulturalEvent[]>(MOCK_EVENTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Alle');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [aiSources, setAiSources] = useState<{title: string, uri: string}[]>([]);
  
  // Bruker-relatert state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'Alle' || e.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [events, searchQuery, selectedCity]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiSources([]);

    try {
      const result = await discoverEventsWithAI(aiPrompt);
      const newEvents: CulturalEvent[] = result.events.map((ev, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: ev.title || 'Uten navn',
        description: ev.description || 'Ingen beskrivelse.',
        date: ev.date || '2025-01-01',
        location: ev.venue || 'Ukjent sted',
        city: ev.city || 'Norge',
        category: ev.category || 'Annet',
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(ev.title || 'ev')}/800/600`,
        tags: ['AI-funn'],
        link: ev.link
      }));
      
      if (newEvents.length > 0) {
        setEvents(prev => [...newEvents, ...prev]);
        setAiSources(result.sources);
      }
    } catch (err) {
      console.error("AI Search failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogin = (email: string, name?: string, preferences?: string[]) => {
    setUser({ email, name, preferences });
    setIsLoginOpen(false);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center font-black text-white">KN</div>
          <h1 className="text-xl font-black tracking-tighter hidden sm:block">KulturNorge</h1>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 hidden md:block">Hei, {user.name || user.email}</span>
              <button 
                onClick={() => setUser(null)}
                className="px-4 py-2 rounded-full bg-slate-800 text-xs font-bold"
              >
                Logg ut
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-600/20 transition-all"
            >
              Min Side
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">Opplev det beste <br/><span className="text-cyan-400 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Norge har å by på.</span></h2>
          <p className="text-slate-400 max-w-xl text-lg font-medium">Finn din neste favorittkonsert eller teaterstykke ved hjelp av vår intelligente kultur-guide.</p>
        </div>

        {/* AI Chat Box */}
        <section className="glass rounded-[2.5rem] p-8 md:p-10 mb-16 border-cyan-500/10 shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10"></div>
          <div className="flex items-center gap-2 mb-6 text-cyan-400">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kultur-guiden AI</span>
          </div>
          <form onSubmit={handleAiSearch} className="flex flex-col md:flex-row gap-4">
            <input 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prøv: 'Hvilke rockekonserter er i Trondheim i mai?'"
              className="flex-grow bg-slate-900/40 border border-white/5 rounded-2xl py-5 px-8 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all text-white placeholder:text-slate-600"
            />
            <button 
              disabled={isAiLoading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-cyan-600/20 active:scale-95"
            >
              {isAiLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Søker...
                </div>
              ) : 'Spør AI'}
            </button>
          </form>
          {aiSources.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kilder:</span>
              {aiSources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-cyan-500/80 hover:text-cyan-400 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Search & Filters */}
        <section className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow">
            <input 
              placeholder="Søk etter arrangementer..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-white/10 outline-none transition-all"
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <select 
            value={selectedCity} 
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-slate-900/50 border border-white/5 rounded-2xl px-8 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="Alle">Hele landet</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isFavorite={favorites.has(event.id)} 
              onClick={setSelectedEvent} 
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-500 font-medium">Ingen arrangementer funnet. Prøv et AI-søk!</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
    </div>
  );
};

export default App;