import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- KONFIGURASJON & TYPER ---
const CITIES = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø', 'Bodø', 'Ålesund', 'Drammen', 'Hamar', 'Fredrikstad'];
const CATEGORIES = ['Konsert', 'Teater', 'Festival', 'Kunst', 'Standup', 'Sport', 'Annet'];

interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  venue?: string;
  city: string;
  category: string;
  imageUrl: string;
  price?: string;
  link?: string;
}

const MOCK_EVENTS: CulturalEvent[] = [
  {
    id: 'm1',
    title: 'Aurora - Skygge over fjorden',
    description: 'En magisk aften med Norges pop-dronning i storslåtte omgivelser.',
    date: '15. Mai 2025',
    location: 'Grieghallen',
    city: 'Bergen',
    category: 'Konsert',
    imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=800',
    price: 'fra 595,-'
  },
  {
    id: 'm2',
    title: 'Peer Gynt på Hovedscenen',
    description: 'Ibsen i storslått moderne drakt med noen av landets fremste skuespillere.',
    date: '10. April 2025',
    location: 'Nationaltheatret',
    city: 'Oslo',
    category: 'Teater',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759c4bc0e?auto=format&fit=crop&q=80&w=800',
    price: '450,-'
  },
  {
    id: 'm3',
    title: 'Oslo Jazz Festival 2025',
    description: 'En uke fylt med det ypperste innen internasjonal og norsk jazz.',
    date: 'August 2025',
    location: 'Sentrum Scene',
    city: 'Oslo',
    category: 'Festival',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800',
    price: 'Pass fra 1200,-'
  }
];

// --- AI LOGIKK ---
const getCulturalGuidance = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Finn aktuelle kulturarrangementer i Norge for 2025 basert på: "${prompt}". Bruk Google Search. Returner kun JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  city: { type: Type.STRING },
                  category: { type: Type.STRING },
                  venue: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["title", "city"]
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"events":[]}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(c => c.web)?.map(c => ({ title: c.web?.title, uri: c.web?.uri })) || [];
    
    return { events: data.events, sources };
  } catch (err) {
    console.error("AI Error:", err);
    return { events: [], sources: [] };
  }
};

// --- KOMPONENTER ---

const EventCard = ({ event, isFavorite, onClick, onToggleFavorite }: any) => (
  <div onClick={() => onClick(event)} className="glass rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:translate-y-[-8px] animate-fade relative">
    <div className="relative aspect-[16/10] overflow-hidden">
      <img 
        src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'} 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        alt={event.title}
        onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(event.id); }}
        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all active:scale-90 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>

      <div className="absolute bottom-4 left-6">
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[9px] font-black uppercase tracking-widest text-cyan-400 backdrop-blur-md">
          {event.category}
        </span>
      </div>
    </div>
    
    <div className="p-7">
      <div className="flex items-center gap-2 mb-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        {event.date}
      </div>
      <h3 className="text-xl font-black mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{event.title}</h3>
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {event.venue || event.location}, {event.city}
      </div>
    </div>
  </div>
);

// --- APP HOVEDLOGIKK ---

const App = () => {
  const [events, setEvents] = useState<CulturalEvent[]>(MOCK_EVENTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Alle');
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CulturalEvent | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase());
      const matchCity = city === 'Alle' || e.city === city;
      return matchSearch && matchCity;
    });
  }, [events, search, city]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setLoading(true);
    setSources([]);

    const res = await getCulturalGuidance(aiInput);
    if (res.events && res.events.length > 0) {
      const formatted: CulturalEvent[] = res.events.map((ev: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        title: ev.title || 'Event',
        description: ev.description || 'Ingen beskrivelse tilgjengelig.',
        date: ev.date || 'Dato ikke oppgitt',
        city: ev.city || 'Norge',
        venue: ev.venue || 'Se kilde',
        location: ev.venue || 'Ukjent',
        category: ev.category || 'Kultur',
        imageUrl: `https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=800&sig=${i}`,
        link: ev.link
      }));
      setEvents(prev => [...formatted, ...prev]);
      setSources(res.sources);
    }
    setLoading(false);
  };

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-cyan-500/30">
      {/* Header */}
      <header className="glass sticky top-0 z-[60] px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-cyan-500/20 group-hover:rotate-6 transition-transform">K</div>
          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">KulturNorge</span>
        </div>
        <div className="flex gap-4">
          <button className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            Favoritter ({favorites.size})
          </button>
          <button className="px-6 py-2 rounded-full bg-cyan-600 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20">Logg Inn</button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-16">
        {/* Hero Section */}
        <div className="max-w-4xl mb-20">
          <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter animate-fade">
            Hva skjer i <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">Norge i dag?</span>
          </h2>
          <p className="text-slate-400 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
            Norges første intelligente kulturplattform. Finn konserter, teater og festivaler ved hjelp av AI.
          </p>
        </div>

        {/* AI Input Area */}
        <section className="glass rounded-[3rem] p-1 md:p-2 mb-20 relative shadow-2xl shadow-cyan-500/10">
          <form onSubmit={handleAiSearch} className="flex flex-col md:flex-row gap-2">
            <input 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Prøv: 'Hvilke festivaler skjer i Oslo i sommer?'"
              className="flex-grow bg-transparent border-none py-6 px-10 text-lg md:text-xl font-medium focus:ring-0 text-white placeholder:text-slate-600"
            />
            <button 
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 m-2 px-12 py-5 rounded-[2.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>Søker...</>
              ) : 'Spør Kultur-AI'}
            </button>
          </form>
          {sources.length > 0 && (
            <div className="px-10 pb-6 flex flex-wrap gap-4 items-center">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bekreftede kilder:</span>
              {sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-cyan-500 hover:underline flex items-center gap-1">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                   {s.title}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Filters & Grid */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="w-full md:w-auto">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Utforsk kategorier</h3>
            <div className="flex flex-wrap gap-2">
              {['Alle', ...CITIES.slice(0, 5)].map(c => (
                <button 
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${city === c ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-80 relative">
             <input 
              placeholder="Søk i listen..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none"
             />
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map(ev => (
            <EventCard 
              key={ev.id} 
              event={ev} 
              isFavorite={favorites.has(ev.id)} 
              onClick={setActiveEvent} 
              onToggleFavorite={toggleFav}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-32 text-center glass rounded-[3rem]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <p className="text-slate-400 font-bold text-xl">Ingen treff. Prøv å spørre AI-en!</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Detail */}
      {activeEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setActiveEvent(null)}>
          <div className="glass w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl border-white/20" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2 h-80 md:h-auto relative">
              <img src={activeEvent.imageUrl} className="w-full h-full object-cover" alt={activeEvent.title}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden"></div>
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-16 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  {activeEvent.category}
                </span>
                <button onClick={() => setActiveEvent(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">{activeEvent.title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">{activeEvent.description}</p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Når</span>
                  <p className="font-bold text-white flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {activeEvent.date}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hvor</span>
                  <p className="font-bold text-white flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {activeEvent.city}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Inngang</span>
                  <span className="text-3xl font-black text-white">{activeEvent.price || 'Se kilde'}</span>
                </div>
                {activeEvent.link ? (
                  <a href={activeEvent.link} target="_blank" className="bg-cyan-600 hover:bg-cyan-500 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-600/20 transition-all active:scale-95">Gå til billetter</a>
                ) : (
                  <button className="bg-slate-800 cursor-not-allowed px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest opacity-50">Ingen lenke</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);