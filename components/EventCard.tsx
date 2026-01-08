
import React from 'react';
import { CulturalEvent } from '../types';

interface EventCardProps {
  event: CulturalEvent;
  onClick: (event: CulturalEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <div 
      onClick={() => onClick(event)}
      className="group cursor-pointer glass rounded-[2rem] overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col h-full relative border-white/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d]/60 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-600/90 text-white backdrop-blur-md shadow-lg border border-white/10">
            {event.category}
          </span>
        </div>
        
        {/* Favorite Button - Larger for touch */}
        <button 
          onClick={(e) => onToggleFavorite(e, event.id)}
          className={`absolute top-3 right-3 p-3.5 rounded-full transition-all duration-300 backdrop-blur-md border ${
            isFavorite 
              ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30' 
              : 'bg-slate-900/60 border-white/10 text-white/70 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <div className="flex items-center gap-1.5 text-white font-black text-[11px] uppercase tracking-tighter">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             {event.date}
           </div>
           <div className="text-white/80 font-bold text-[10px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
             {event.city}
           </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-slate-100 mb-3 line-clamp-1 group-hover:text-cyan-400 transition-colors leading-tight">
          {event.title}
        </h3>
        
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6 font-medium">
          {event.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex gap-1.5">
            {event.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-900 text-slate-500 border border-white/5">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-slate-100 font-black text-xs uppercase tracking-widest">
            {event.price || 'Sjekk pris'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
