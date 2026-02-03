import React from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, Shield, Calendar, MapPin, ExternalLink, HardDrive, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Hackathon } from '../types';

interface DatabaseViewProps {
  hackathons: Hackathon[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ hackathons, onDelete, onClear }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.conductedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase"><Clock className="w-2.5 h-2.5" /> Upcoming</span>;
      case 'ACTIVE':
        return <span className="bg-green-500/10 border border-green-500/30 text-green-500 flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase"><CheckCircle2 className="w-2.5 h-2.5" /> Active</span>;
      case 'ENDED':
        return <span className="bg-red-500/10 border border-red-500/30 text-red-500/50 flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase"><AlertCircle className="w-2.5 h-2.5" /> Ended</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden group">
          <HardDrive className="absolute top-4 right-4 w-12 h-12 opacity-5" />
          <div className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-1">Vault_Occupancy</div>
          <div className="text-3xl font-black text-white italic">{hackathons.length} NODES</div>
          <div className="mt-2 text-[9px] mono text-blue-500 font-bold uppercase">Integrity: Verified_Secure</div>
        </div>
        
        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
          <div className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-1">Persistent_Weight</div>
          <div className="text-3xl font-black text-white italic">{(JSON.stringify(hackathons).length / 1024).toFixed(1)} KB</div>
          <div className="mt-2 text-[9px] mono text-green-500 font-bold uppercase flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> Encryption: None
          </div>
        </div>

        <div className="bg-red-900/5 border border-red-900/20 p-6 rounded-2xl flex flex-col justify-between">
          <div className="text-[10px] font-black text-red-400/60 uppercase tracking-widest mb-1">Registry_Control</div>
          <button 
            onClick={() => { if(confirm('Purge all persistent records?')) onClear(); }}
            className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-950/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge_Vault
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/40" />
        <input 
          type="text" 
          placeholder="Filter persistent metadata..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-blue-500/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-blue-500/30 text-blue-100 font-bold"
        />
      </div>

      <div className="bg-black/40 border border-blue-500/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-blue-900/10 border-b border-blue-500/10 text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em]">
              <th className="px-6 py-4">Node_Identifier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Spatio_Temporal</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/5">
            {filtered.map(h => (
              <tr key={h.id} className={`group hover:bg-blue-500/5 transition-colors ${h.status === 'ENDED' ? 'opacity-40' : ''}`}>
                <td className="px-6 py-4">
                  <div className="font-black text-white text-xs uppercase italic truncate max-w-[200px]">{h.name}</div>
                  <div className="text-[9px] text-blue-400/40 font-bold uppercase tracking-widest">{h.conductedBy}</div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(h.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[10px] text-blue-100/60 font-bold"><Calendar className="w-3 h-3 opacity-30" /> {h.timePeriod}</div>
                  <div className="flex items-center gap-2 text-[10px] text-blue-100/60 font-bold mt-1"><MapPin className="w-3 h-3 opacity-30" /> {h.location}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a href={h.url} target="_blank" className="p-2 text-blue-500/40 hover:text-blue-400 transition-colors"><ExternalLink className="w-4 h-4" /></a>
                    <button onClick={() => onDelete(h.id)} className="p-2 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DatabaseView;