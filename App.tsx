import React, { useState, useMemo, useEffect } from 'react';
import { CulturalEvent } from './types';
import { MOCK_EVENTS, CITIES, CATEGORIES } from './constants';
import { discoverEventsWithAI } from './services/geminiService';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';

const App: React.FC = () => {
  const [events, setEvents] = useState<CulturalEvent[]>(MOCK_EVENTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Alle');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [aiSources, setAiSources] = useState<{title: string, uri: string}[]>([]);

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
      const newEvents: CulturalEvent[] = result.events.map((e, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: e.title || 'Uten navn',
        description: e.description || 'Ingen beskrivelse.',
        date: e.date || '2025-01-01',
        location: e.venue || 'Ukjent sted',
        city: e.city || 'Norge',
        category: e.category || 'Annet',
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(e.title || 'ev')}/800/600`,
        tags: ['AI-funn'],
        link: e.link
      }));
      
      if (newEvents.length > 0) {
        setEvents(prev => [...newEvents, ...prev]);
        setAiSources(result.sources);
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center font-black text-white">KN</div>
          <h1 className="text-xl font-black tracking-tighter">KulturNorge</h1>
        </div>
        <button className="px-5 py-2 rounded-full bg-cyan-600 text-sm font-bold shadow-lg shadow-cyan-600/20">Min Side</button>
      </header>

      <main className="container mx-auto px-4 mt-10">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">Oppdag din neste <br/><span className="text-cyan-400">opplevelse.</span></h2>
          <p className="text-slate-400 max-w-xl">Finn konserter, teater og festivaler over hele landet ved hjelp av vår AI-guide.</p>
        </div>

        {/* AI Chat Box */}
        <section className="glass rounded-[2rem] p-8 mb-12 border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="text-xs font-black uppercase tracking-widest">Kultur-guiden</span>
          </div>
          <form onSubmit={handleAiSearch} className="flex flex-col md:flex-row gap-3">
            <input 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prøv: 'Hva skjer i Oslo til helgen?'"
              className="flex-grow bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all"
            />
            <button 
              disabled={isAiLoading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-10 py-4 rounded-2xl font-bold transition-all"
            >
              {isAiLoading ? 'Søker...' : 'Spør AI'}
            </button>
          </form>
          {aiSources.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {aiSources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-cyan-500 underline">{s.title}</a>
              ))}
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <input 
              placeholder="Søk i titler..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <select 
            value={selectedCity} 
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 text-sm font-bold"
          >
            <option value="Alle">Hele Norge</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        {/* Results */}
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
        </section>
      </main>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
};

export default App;