import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hackathon } from '../types';
import { Bell, ExternalLink, Calendar, MapPin, Trophy, Users, ShieldCheck, Link2, UserPlus, Info } from 'lucide-react';

interface Notification3DProps {
  hackathon: Hackathon | null;
  onClose: () => void;
}

const Notification3D: React.FC<Notification3DProps> = ({ hackathon, onClose }) => {
  return (
    <AnimatePresence>
      {hackathon && (
        <div className="fixed top-24 right-8 z-50 pointer-events-none perspective-1000">
          <motion.div
            initial={{ opacity: 0, x: 200, rotateY: 90, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, rotateY: -15, scale: 1 }}
            exit={{ opacity: 0, x: 200, rotateY: 90, scale: 0.5 }}
            whileHover={{ rotateY: 0, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto"
          >
            <div className="w-[420px] p-6 hackathon-card rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] border-blue-500/30 overflow-hidden relative group bg-black/80 backdrop-blur-xl">
              {/* Animated Scan Line */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-blue-500/50 blur-[2px] z-10"
              />
              
              <div className="relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400 mono">Scout Verified Match</span>
                  </div>
                  <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase text-blue-300 tracking-[0.2em] mb-1 inline-block">
                    {hackathon.category}
                  </span>
                  <h3 className="text-2xl font-black text-white leading-tight mb-1 uppercase italic tracking-tighter">{hackathon.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-blue-400 font-black uppercase tracking-widest">
                    <Info className="w-3 h-3" /> CONDUCTED BY {hackathon.conductedBy}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center text-[10px] text-white/40 uppercase mb-1 font-black tracking-widest">
                      <Calendar className="w-3 h-3 mr-1.5 text-blue-500" /> Duration
                    </div>
                    <div className="text-[11px] font-black text-white">{hackathon.timePeriod}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center text-[10px] text-white/40 uppercase mb-1 font-black tracking-widest">
                      <Trophy className="w-3 h-3 mr-1.5 text-yellow-400" /> Reward
                    </div>
                    <div className="text-[11px] font-black text-yellow-500">{hackathon.prizeMoney}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center text-[10px] text-white/40 uppercase mb-1 font-black tracking-widest">
                      <UserPlus className="w-3 h-3 mr-1.5 text-green-500" /> Participants
                    </div>
                    <div className="text-[11px] font-black text-white">{hackathon.participantCount.toLocaleString()}+ APPLIED</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center text-[10px] text-white/40 uppercase mb-1 font-black tracking-widest">
                      <MapPin className="w-3 h-3 mr-1.5 text-red-500" /> Location
                    </div>
                    <div className="text-[11px] font-black text-white truncate" title={hackathon.location}>{hackathon.location}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                     <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">NODE_STATUS: {hackathon.status}</span>
                  </div>
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 px-2 py-0.5 rounded bg-blue-500/5">
                    MATCH: {hackathon.relevanceScore}%
                  </div>
                </div>

                {/* Display grounding sources as required by Google Search Grounding guidelines */}
                {hackathon.sources && hackathon.sources.length > 0 && (
                  <div className="mb-6">
                    <div className="text-[10px] font-bold text-blue-300/40 uppercase mb-2 tracking-widest flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> External Grounding
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hackathon.sources.slice(0, 3).map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-blue-300 hover:bg-blue-500/20 transition-colors truncate max-w-[150px] font-black uppercase"
                          title={source.title}
                        >
                          {source.title || 'Official Site'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <a 
                  href={hackathon.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                >
                  Join Hackathon <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Notification3D;