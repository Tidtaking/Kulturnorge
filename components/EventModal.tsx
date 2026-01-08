import React from 'react';
import { CulturalEvent } from '../types';

interface Props {
  event: CulturalEvent;
  onClose: () => void;
}

const EventModal: React.FC<Props> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="glass w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 bg-black/50 rounded-full text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title}/>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-4">{event.category}</span>
          <h2 className="text-3xl font-black mb-6 leading-tight">{event.title}</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300">
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
               </div>
               <span className="text-sm font-bold">{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>
               <span className="text-sm font-bold">{event.venue}, {event.city}</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">{event.description}</p>
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pris</p>
              <p className="text-xl font-black">{event.price || 'Se kilde'}</p>
            </div>
            {event.link && (
              <a href={event.link} target="_blank" className="px-8 py-3 bg-cyan-600 rounded-xl font-black uppercase text-xs tracking-widest">Kjøp billett</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;