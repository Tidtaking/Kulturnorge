
import React, { useEffect } from 'react';
import { CulturalEvent } from '../types';

interface EventModalProps {
  event: CulturalEvent | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [event]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] bg-[#0d1425] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-t md:border border-white/10">
        
        {/* Close Button - Sticky/Fixed for mobile accessibility */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-[110] p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-xl border border-white/10 backdrop-blur-md active:scale-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Hero Image Section */}
        <div className="w-full md:w-[45%] h-64 sm:h-80 md:h-auto flex-shrink-0 relative">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1425] via-transparent to-transparent md:hidden"></div>
          
          <div className="absolute bottom-6 left-6 md:hidden">
             <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-600 text-white">
                {event.category}
              </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-[55%] p-6 sm:p-10 overflow-y-auto flex flex-col custom-scrollbar">
          <div className="hidden md:flex items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-600/10 text-cyan-400 border border-cyan-500/20">
              {event.category}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {event.city}
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
            {event.title}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Dato</p>
                <p className="text-sm font-bold text-white">{event.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Sted</p>
                <p className="text-sm font-bold text-white">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Om arrangementet</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {event.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col xs:flex-row items-center justify-between gap-6 pb-4">
            <div className="text-center xs:text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Billettservice</p>
              <p className="text-2xl font-black text-white">{event.price || 'Gratis'}</p>
            </div>
            <a 
              href={event.link || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full xs:w-auto px-10 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-cyan-600/20 active:scale-95 text-center"
            >
              Bestill her
            </a>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default EventModal;
