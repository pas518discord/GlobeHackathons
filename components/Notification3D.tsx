
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hackathon } from '../types.ts';
import { ExternalLink, Calendar, MapPin, Trophy, ShieldCheck, Link2, UserPlus, Info, ImageIcon, SearchCode, RefreshCw, X } from 'lucide-react';
import ImageGenerator from './ImageGenerator.tsx';
import { deepScanLocation } from '../services/geminiService.ts';

interface Notification3DProps {
  hackathon: Hackathon | null;
  onClose: () => void;
}

const Notification3D: React.FC<Notification3DProps> = ({ hackathon, onClose }) => {
  const [showImageGen, setShowImageGen] = useState(false);
  const [scanResult, setScanResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const MotionDiv = motion.div as any;

  const handleDeepScan = async () => {
    if (!hackathon) return;
    setIsScanning(true);
    try {
      const result = await deepScanLocation(hackathon.location, hackathon.coordinates?.lat, hackathon.coordinates?.lng);
      setScanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AnimatePresence>
      {hackathon && (
        <>
          {showImageGen && <ImageGenerator hackathonName={hackathon.name} onClose={() => setShowImageGen(false)} />}
          
          <div className="fixed top-24 right-8 z-50 pointer-events-none perspective-1000">
            <MotionDiv
              initial={{ opacity: 0, x: 200, rotateY: 90, scale: 0.5 }}
              animate={{ opacity: 1, x: 0, rotateY: -15, scale: 1 }}
              exit={{ opacity: 0, x: 200, rotateY: 90, scale: 0.5 }}
              whileHover={{ rotateY: 0, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="pointer-events-auto"
            >
              <div className="w-[480px] p-8 bg-brand-panel rounded-[2rem] shadow-3d border border-brand-border/30 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                
                <div className="relative z-20">
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <div className="bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/20 shadow-sm">
                        <span className="text-[12px] font-black uppercase text-brand-primary tracking-tighter">AI AGENT</span>
                      </div>
                      <button 
                        onClick={() => setShowImageGen(true)}
                        className="bg-brand-surface text-brand-black px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2 border border-brand-border/30 shadow-sm"
                      >
                        <ImageIcon className="w-3 h-3" /> Art
                      </button>
                    </div>
                    <button onClick={onClose} className="text-brand-muted hover:text-brand-black transition-all hover:scale-110 bg-brand-surface p-1 rounded-full shadow-sm">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Title Section */}
                  <div className="mb-8">
                    <h3 className="text-[32px] font-black text-brand-black leading-[0.95] mb-3 uppercase italic tracking-tighter drop-shadow-sm">
                      {hackathon.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-brand-muted font-bold uppercase tracking-widest">
                        <div className="w-4 h-4 rounded-full border border-brand-primary flex items-center justify-center bg-brand-primary/10">
                          <span className="text-[8px] text-brand-primary font-black">i</span>
                        </div>
                        HOST: {hackathon.conductedBy}
                      </div>
                      <button 
                        onClick={handleDeepScan}
                        disabled={isScanning}
                        className="text-[10px] font-bold uppercase text-brand-primary flex items-center gap-2 hover:underline disabled:opacity-50"
                      >
                        {isScanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <SearchCode className="w-3 h-3" />} Deep Scan
                      </button>
                    </div>
                  </div>
                  
                  {/* Deep Scan Results */}
                  <AnimatePresence>
                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-brand-surface text-brand-black rounded-xl border border-brand-border/30 text-[11px] leading-relaxed relative shadow-inner-3d"
                      >
                        <button onClick={() => setScanResult(null)} className="absolute top-2 right-2 opacity-50 hover:opacity-100">
                          <X className="w-3 h-3" />
                        </button>
                        <p className="mb-3 opacity-90">{scanResult.text}</p>
                        <div className="flex flex-wrap gap-2">
                          {scanResult.sources.map((s, i) => (
                            <a key={i} href={s.url} target="_blank" className="bg-brand-panel hover:bg-brand-primary hover:text-white px-2 py-1 rounded-lg border border-brand-border/20 text-[9px] font-bold flex items-center gap-1 text-brand-muted transition-all">
                              <MapPin className="w-2 h-2" /> {s.title}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 2x2 Meta Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/30 shadow-sm">
                      <div className="flex items-center text-[9px] text-brand-muted uppercase mb-1 font-black tracking-widest">
                        <Calendar className="w-3 h-3 mr-1" /> Duration
                      </div>
                      <div className="text-[13px] font-bold text-brand-black">{hackathon.timePeriod}</div>
                    </div>
                    <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/30 shadow-sm">
                      <div className="flex items-center text-[9px] text-brand-muted uppercase mb-1 font-black tracking-widest">
                        <Trophy className="w-3 h-3 mr-1" /> Reward
                      </div>
                      <div className="text-[13px] font-bold text-brand-warning">{hackathon.prizeMoney}</div>
                    </div>
                    <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/30 shadow-sm">
                      <div className="flex items-center text-[9px] text-brand-muted uppercase mb-1 font-black tracking-widest">
                        <UserPlus className="w-3 h-3 mr-1" /> Applications
                      </div>
                      <div className="text-[13px] font-bold text-brand-black uppercase">{hackathon.participantCount.toLocaleString()}+ Active</div>
                    </div>
                    <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/30 shadow-sm">
                      <div className="flex items-center text-[9px] text-brand-muted uppercase mb-1 font-black tracking-widest">
                        <MapPin className="w-3 h-3 mr-1" /> Location
                      </div>
                      <div className="text-[13px] font-bold text-brand-black truncate">{hackathon.locationType === 'Online' ? 'Online' : hackathon.location}</div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-border/20">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse shadow-[0_0_8px_rgba(111,159,156,0.6)]"></div>
                       <span className="text-[11px] font-black uppercase text-brand-black tracking-widest">STATUS: {hackathon.status || 'UPCOMING'}</span>
                    </div>
                    <div className="text-[11px] font-black text-brand-primary uppercase tracking-tight border border-brand-primary/20 px-3 py-1 rounded-lg bg-brand-primary/10">
                      FIT SCORE: {hackathon.relevanceScore}%
                    </div>
                  </div>

                  <div className="mt-6">
                    <a 
                      href={hackathon.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] active:shadow-none"
                    >
                      Open Registry <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notification3D;
