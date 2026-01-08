
import React from 'react';
import { CulturalEvent } from '../types';

interface EventModalProps {
  event: CulturalEvent | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              {event.category}
            </span>
            <span className="text-slate-400 text-sm">{event.city}</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">{event.title}</h2>
          
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{event.location}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-400 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {event.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Pris</p>
              <p className="text-xl font-bold text-white">{event.price}</p>
            </div>
            <a 
              href={event.link || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all transform hover:scale-105"
            >
              Kjøp billetter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
