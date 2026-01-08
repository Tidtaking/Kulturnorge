import React from 'react';
import { CulturalEvent } from '../types';

interface Props {
  event: CulturalEvent;
  isFavorite: boolean;
  onClick: (e: CulturalEvent) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const EventCard: React.FC<Props> = ({ event, isFavorite, onClick, onToggleFavorite }) => {
  return (
    <div 
      onClick={() => onClick(event)}
      className="glass rounded-[2rem] overflow-hidden group cursor-pointer animate-fade"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={event.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={event.title}/>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        <button 
          onClick={(e) => onToggleFavorite(e, event.id)}
          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/70'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{event.category}</span>
          <span className="text-[10px] font-bold text-slate-500">{event.date}</span>
        </div>
        <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-cyan-400 transition-colors">{event.title}</h3>
        <p className="text-slate-400 text-xs line-clamp-2 mb-4">{event.description}</p>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {event.venue}, {event.city}
        </div>
      </div>
    </div>
  );
};

export default EventCard;