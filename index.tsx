import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPER ---
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

interface User {
  email: string;
  name?: string;
  preferences?: string[];
}

// --- KONSTANTER ---
const CITIES = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø', 'Bodø', 'Ålesund', 'Drammen', 'Hamar', 'Tønsberg'];
const CATEGORIES = ['Konsert', 'Teater', 'Festival', 'Kunst', 'Standup', 'Sport', 'Annet'];

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
    title: 'Peer Gynt på Nationaltheatret',
    description: 'Ibsen i storslått moderne drakt med noen av landets fremste skuespillere.',
    date: '10. April 2025',
    location: 'Hovedscenen',
    city: 'Oslo',
    category: 'Teater',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759c4bc0e?auto=format&fit=crop&q=80&w=800',
    price: '450,-'
  },
  {
    id: 'm3',
    title: 'Oslo Jazzfestival 2025',
    description: 'En hel uke med jazz i verdensklasse spredt over hele hovedstaden.',
    date: 'August 2025',
    location: 'Sentrum Scene',
    city: 'Oslo',
    category: 'Festival',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800',
    price: 'Pass fra 1200,-'
  }
];

// --- AI TJENESTE ---
const discoverEventsWithAI = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Finn aktuelle kulturarrangementer i Norge for 2025 basert på: "${prompt}". Bruk Google Search for å finne reelle datoer. Returner JSON med "events" array.`,
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
                  link: { type: Type.STRING },
                  price: { type: Type.STRING }
                },
                required: ["title", "city"]
              }
            }
          }
        }
      },
    });

    const json = JSON.parse(response.text || "{\"events\":[]}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(c => c.web)?.map(c => ({ title: c.web?.title, uri: c.web?.uri })) || [];
    return { events: json.events || [], sources };
  } catch (error) {
    console.error("AI Error:", error);
    return { events: [], sources: [] };
  }
};

// --- KOMPONENTER ---

const EventCard = ({ event, isFavorite, onClick, onToggleFavorite }: any) => (
  <div onClick={() => onClick(event)} className="glass rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:translate-y-[-8px] animate-fade relative border border-white/5">
    <div className="relative aspect-[16/10] overflow-hidden">
      <img 
        src={event.imageUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800&sig=${event.id}`} 
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

const LoginModal = ({ isOpen, onClose, onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ email, name: email.split('@')[0] });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-xl shadow-cyan-600/20">K</div>
           <h2 className="text-2xl font-black">Velkommen tilbake</h2>
           <p className="text-slate-500 text-sm mt-1">Logg inn for å lagre favoritter</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input type="password" required placeholder="Passord" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <button disabled={isLoading} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Logg Inn'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APP HOVEDLOGIKK ---

const App = () => {
  const [events, setEvents] = useState<CulturalEvent[]>(MOCK_EVENTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Alle');
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CulturalEvent | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
      const matchCity = city === 'Alle' || e.city === city;
      return matchSearch && matchCity;
    });
  }, [events, search, city]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setLoading(true);
    setSources([]);

    const res = await discoverEventsWithAI(aiInput);
    if (res.events && res.events.length > 0) {
      const formatted: CulturalEvent[] = res.events.map((ev: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        title: ev.title || 'Uten navn',
        description: ev.description || 'Fant ingen beskrivelse.',
        date: ev.date || 'Snart',
        city: ev.city || 'Norge',
        venue: ev.venue || 'Ukjent sted',
        location: ev.venue || 'Se info',
        category: ev.category || 'Event',
        price: ev.price || 'Sjekk kilde',
        imageUrl: `https://images.unsplash.com/photo-1514525253361-bee0438d7df3?auto=format&fit=crop&q=80&w=800&sig=${i}`,
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
      <header className="glass sticky top-0 z-[60] px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">K</div>
          <span className="text-xl font-black tracking-tighter">KulturNorge</span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Hei, {user.name}</span>
              <button onClick={() => setUser(null)} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">Logg Ut</button>
            </div>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="px-6 py-2 rounded-full bg-cyan-600 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20">Min Side</button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-4xl mb-16">
          <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter animate-fade">
            Hva skjer i <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Norge i dag?</span>
          </h2>
          <p className="text-slate-400 text-xl font-medium max-w-xl">Oppdag konserter, teater og festivaler drevet av kunstig intelligens.</p>
        </div>

        {/* AI Søkefelt */}
        <section className="glass rounded-[3rem] p-2 mb-20 relative shadow-2xl">
          <form onSubmit={handleAiSearch} className="flex flex-col md:flex-row gap-2">
            <input 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Prøv: 'Hvilke festivaler er i Oslo i sommer?'"
              className="flex-grow bg-transparent border-none py-6 px-8 text-lg font-medium focus:ring-0 text-white placeholder:text-slate-600"
            />
            <button 
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 m-1 px-12 py-5 rounded-[2.2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Finn med AI'}
            </button>
          </form>
          {sources.length > 0 && (
            <div className="px-8 pb-6 flex flex-wrap gap-4 items-center">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Verifiserte kilder:</span>
              {sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-cyan-500 hover:underline">{s.title}</a>
              ))}
            </div>
          )}
        </section>

        {/* Filtrering */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {['Alle', ...CITIES.slice(0, 5)].map(c => (
              <button key={c} onClick={() => setCity(c)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${city === c ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/20'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative">
             <input placeholder="Søk i listen..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-xs outline-none focus:ring-1 focus:ring-cyan-500/40" />
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map(ev => (
            <EventCard key={ev.id} event={ev} isFavorite={favorites.has(ev.id)} onClick={setActiveEvent} onToggleFavorite={toggleFav} />
          ))}
        </div>
      </main>

      {/* Modal Detaljer */}
      {activeEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setActiveEvent(null)}>
          <div className="glass w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2 h-64 md:h-auto">
              <img src={activeEvent.imageUrl} className="w-full h-full object-cover" alt={activeEvent.title}/>
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto flex flex-col">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 block">{activeEvent.category}</span>
              <h2 className="text-3xl font-black mb-6 leading-tight tracking-tight">{activeEvent.title}</h2>
              <p className="text-slate-400 mb-8 leading-relaxed font-medium">{activeEvent.description}</p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Dato</span>
                  <p className="font-bold text-sm">{activeEvent.date}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sted</span>
                  <p className="font-bold text-sm">{activeEvent.location}, {activeEvent.city}</p>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="text-2xl font-black">{activeEvent.price || 'Sjekk kilde'}</div>
                {activeEvent.link && (
                  <a href={activeEvent.link} target="_blank" className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-600/20 transition-all">Billetter</a>
                )}
              </div>
            </div>
            <button onClick={() => setActiveEvent(null)} className="absolute top-6 right-6 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={setUser} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);