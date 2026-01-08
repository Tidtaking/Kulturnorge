
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
      className="group cursor-pointer glass rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col h-full relative"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-600/90 text-white backdrop-blur-md">
            {event.category}
          </span>
        </div>
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite(e, event.id)}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 backdrop-blur-md border ${
            isFavorite 
              ? 'bg-rose-500/80 border-rose-400 text-white shadow-lg shadow-rose-500/20' 
              : 'bg-slate-900/60 border-white/10 text-white/70 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <p className="text-cyan-400 text-sm font-medium">{event.date}</p>
          <p className="text-slate-400 text-sm">{event.city}</p>
        </div>
        
        <h3 className="text-xl font-bold text-slate-100 mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
          {event.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-2">
            {event.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-slate-800 text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-slate-200 font-semibold text-sm">
            {event.price || 'Sjekk pris'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
