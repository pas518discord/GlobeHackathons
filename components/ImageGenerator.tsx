import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, RefreshCw, Download, X, Maximize2, Sparkles } from 'lucide-react';
import { generateHackathonArt } from '../services/geminiService.ts';

const ASPECT_RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"];

interface ImageGeneratorProps {
  hackathonName: string;
  onClose: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ hackathonName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState("16:9");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const url = await generateHackathonArt(hackathonName, ratio);
      setImgUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-8 bg-brand-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-brand-surface rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(62,34,18,0.4)] border-2 border-brand-border/30 overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-1/3 p-10 bg-brand-panel border-r border-brand-border/30">
          <div className="mb-10 flex justify-between items-center">
             <div className="bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/20">
               <span className="text-[12px] font-black uppercase text-brand-primary tracking-tighter flex items-center gap-2">
                 <Sparkles className="w-3.5 h-3.5" /> Creative_Agent
               </span>
             </div>
             <button onClick={onClose} className="text-brand-muted hover:text-brand-black transition-all">
               <X className="w-6 h-6" />
             </button>
          </div>

          <h3 className="text-3xl font-black text-brand-black italic uppercase tracking-tighter mb-4 leading-none">
            Hero Art Generator
          </h3>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-10 leading-relaxed">
            Generating promotional visual for:<br/>
            <span className="text-brand-primary">{hackathonName}</span>
          </p>

          <div className="space-y-8">
            <div>
              <label className="block text-[11px] font-black text-brand-muted uppercase mb-4 tracking-widest opacity-60">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`py-2 text-[10px] font-black rounded-lg border transition-all shadow-sm ${
                      ratio === r 
                        ? 'bg-brand-primary text-white border-brand-primary' 
                        : 'bg-white text-brand-muted border-brand-border/30 hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-2xl font-black uppercase text-[12px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {imgUrl ? "Regenerate" : "Generate Art"}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white p-10 flex items-center justify-center relative min-h-[400px] shadow-inner-3d">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing_Pixels...</p>
              </motion.div>
            ) : imgUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group shadow-2xl rounded-2xl overflow-hidden max-h-full"
              >
                <img src={imgUrl} alt="Generated Art" className="max-w-full max-h-[600px] object-contain bg-black" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={imgUrl} download={`${hackathonName}_Art.png`} className="bg-white p-4 rounded-full text-brand-primary hover:text-brand-accent transition-all">
                    <Download className="w-6 h-6" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="text-center opacity-30">
                <ImageIcon className="w-20 h-20 mx-auto mb-4 text-brand-muted" />
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Awaiting Command...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageGenerator;