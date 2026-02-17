import React from 'react';
import { motion } from 'framer-motion';
import { Hackathon } from '../types.ts';
import { Trash2, ShieldAlert, ExternalLink, MapPin, DatabaseZap, Clock, Calendar, Download } from 'lucide-react';

interface DatabaseViewProps {
  hackathons: Hackathon[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ hackathons, onDelete, onClear }) => {
  const MotionDiv = motion.div as any;

  const handleDownload = () => {
    const dataStr = JSON.stringify(hackathons, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hackathon_registry_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic text-brand-black uppercase tracking-tighter flex items-center gap-3">
            <DatabaseZap className="w-8 h-8 text-brand-primary" /> Registry_Vault
          </h2>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.5em] ml-1">Central Node Management Protocol</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-5 py-3 bg-brand-surface hover:bg-brand-primary hover:text-white text-brand-muted border border-brand-border/30 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button onClick={onClear} className="px-5 py-3 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-sm">
            <Trash2 className="w-4 h-4" /> Purge Cache
          </button>
        </div>
      </div>

      <div className="bg-brand-surface rounded-[1.5rem] border border-brand-border/20 overflow-hidden shadow-inner-3d">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-panel border-b border-brand-border/30">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-brand-muted tracking-widest">Node_Auth</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-brand-muted tracking-widest">Project_Header</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-brand-muted tracking-widest">Geo_Location</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-brand-muted tracking-widest">Time_Period</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-brand-muted tracking-widest">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/10">
              {hackathons.map((h) => (
                <tr key={h.id} className="hover:bg-brand-panel/30 group transition-all">
                  <td className="px-6 py-4 mono text-[10px] text-brand-muted font-bold">{h.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-brand-black uppercase italic tracking-tight">{h.name}</span>
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">{h.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-brand-black"><MapPin className="w-3 h-3 inline mr-1 text-brand-muted" /> {h.location}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-brand-black mono uppercase"><Clock className="w-3 h-3 inline mr-1 text-brand-muted" /> {h.timePeriod}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <a href={h.url} target="_blank" className="p-2 border border-brand-border/30 bg-white rounded-lg text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"><ExternalLink className="w-3 h-3" /></a>
                      <button onClick={() => onDelete(h.id)} className="p-2 border border-brand-border/30 bg-white rounded-lg text-brand-muted hover:text-red-500 hover:border-red-500 transition-all shadow-sm"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MotionDiv>
  );
};
export default DatabaseView;