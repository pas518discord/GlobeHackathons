import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, MapPin, Tag, DollarSign, Settings, Database, Cpu, Zap, 
  TrendingUp, Filter, RefreshCw, Terminal, Layers, Users, 
  ExternalLink, Globe as GlobeIcon, Activity, Terminal as Console,
  ChevronDown, Check, Calendar, Trophy, Gift,
  LayoutGrid, Map as MapIcon, DatabaseZap, HardDrive, ShieldAlert,
  Server, Binary, Key, Sparkles, Globe, UserPlus, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hackathon, UserPreferences, HACKATHON_CATEGORIES, LocationType, PrizeType } from './types';
import { searchHackathons } from './services/geminiService';
import Notification3D from './components/Notification3D';
import GlobeView from './components/GlobeView';
import DatabaseView from './components/DatabaseView';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [activeNotification, setActiveNotification] = useState<Hackathon | null>(null);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Registry Initialized. Persistence Online."]);
  const [viewMode, setViewMode] = useState<'grid' | 'globe' | 'database'>('grid');
  
  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LocationType | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPrize, setFilterPrize] = useState<PrizeType | 'All'>('All');

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('hackagent_prefs_v1');
    return saved ? JSON.parse(saved) : {
      knowledgeScope: ['React', 'TypeScript', 'AI'],
      currentLocation: '', // Empty means Global
      preferredCategories: ['AI & Machine Learning'],
      minPrize: 0
    };
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = 'hackagent_permanent_vault_v1';

  // Persistence Loader
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      let parsed: Hackathon[] = JSON.parse(saved);
      const now = new Date();
      parsed = parsed.map(h => {
        const start = new Date(h.startDate);
        const end = new Date(h.endDate);
        let status: Hackathon['status'] = 'ACTIVE';
        if (now < start) status = 'UPCOMING';
        else if (now > end) status = 'ENDED';
        return { ...h, status };
      });
      setHackathons(parsed);
      addLog(`Vault: Successfully mapped ${parsed.length} persistent nodes.`);
    }
  }, []);

  // Save Prefs
  useEffect(() => {
    localStorage.setItem('hackagent_prefs_v1', JSON.stringify(preferences));
  }, [preferences]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const saveToVault = useCallback((newNodes: Hackathon[]) => {
    setHackathons(prev => {
      const merged = [...newNodes, ...prev].reduce((acc: Hackathon[], curr) => {
        if (!acc.find(h => h.name.toLowerCase() === curr.name.toLowerCase())) {
          acc.push(curr);
        }
        return acc;
      }, []);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const deleteFromVault = (id: string) => {
    const updated = hackathons.filter(h => h.id !== id);
    setHackathons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addLog(`Vault: Node ID_${id.slice(0, 6)} de-indexed.`);
  };

  const purgeVault = () => {
    setHackathons([]);
    localStorage.removeItem(STORAGE_KEY);
    addLog("Vault: Global registry wipe successful.");
  };

  /**
   * REGISTRY-FIRST AGENT LOGIC
   * Prioritizes local data to avoid redundant API calls.
   */
  const executeScout = async (forceDeepSearch = false) => {
    const isGlobal = !preferences.currentLocation.trim();
    
    // Check local registry
    const localMatches = hackathons.filter(h => {
      const isStillRunning = h.status !== 'ENDED';
      const matchesCategory = preferences.preferredCategories.some(cat => h.category.includes(cat));
      
      if (isGlobal) return isStillRunning && matchesCategory;
      
      const locationMatch = h.location.toLowerCase().includes(preferences.currentLocation.toLowerCase());
      return isStillRunning && matchesCategory && (locationMatch || h.locationType === 'Online');
    });

    if (!forceDeepSearch && localMatches.length > 0) {
      addLog(`Agent: Registry Hit. Analyzing ${localMatches.length} matching nodes...`);
      const prioritized = localMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setActiveNotification(prioritized[0]);
      addLog(`Agent: Prioritized "${prioritized[0].name}" from local persistence.`);
      return;
    }

    setLoading(true);
    addLog(forceDeepSearch ? "Agent: Deep Search forced. Crawling global endpoints..." : "Agent: No local matches. Initiating external telemetry...");
    
    try {
      const results = await searchHackathons(preferences, addLog);
      if (results.length > 0) {
        saveToVault(results);
        const topResult = results.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
        setActiveNotification(topResult);
        addLog(`Agent: ${results.length} new records synchronized.`);
      } else {
        addLog("Agent: Scan completed. No new nodes detected.");
      }
    } catch (err) {
      addLog("Agent: Telemetry error. Verification of Gemini context required.");
    } finally {
      setLoading(false);
      addLog("Agent: Execution cycle finished.");
    }
  };

  const filteredNodes = hackathons.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || h.locationType === filterType;
    const matchesCategory = filterCategory === 'All' || h.category === filterCategory;
    const matchesPrize = filterPrize === 'All' || h.prizeType === filterPrize;
    return matchesSearch && matchesType && matchesCategory && matchesPrize;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#020202] text-white selection:bg-blue-500 selection:text-white">
      <Notification3D hackathon={activeNotification} onClose={() => setActiveNotification(null)} />

      {/* Header */}
      <nav className="border-b border-blue-500/10 bg-black/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-500/30 relative group">
              <Binary className="text-blue-400 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Global<span className="text-blue-500">Hackathons</span></h1>
              <div className="flex items-center gap-2 text-[9px] mono text-blue-400/40 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1 text-green-500"><ShieldAlert className="w-2.5 h-2.5" /> PERSISTENCE_ACTIVE</span>
                <span className="w-1 h-1 bg-blue-500/20 rounded-full"></span>
                <span className="flex items-center gap-1 text-blue-400/60">MODE: {preferences.currentLocation.trim() || 'GLOBAL'}</span>
              </div>
            </div>
          </div>

          <div className="flex bg-blue-900/10 p-1 rounded-xl border border-blue-500/10 shadow-inner">
            <button onClick={() => setViewMode('grid')} className={`p-2 px-5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400/40 hover:text-blue-400'}`}><LayoutGrid className="w-4 h-4" /> Atlas</button>
            <button onClick={() => setViewMode('globe')} className={`p-2 px-5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'globe' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400/40 hover:text-blue-400'}`}><MapIcon className="w-4 h-4" /> Globe</button>
            <button onClick={() => setViewMode('database')} className={`p-2 px-5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'database' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400/40 hover:text-blue-400'}`}><DatabaseZap className="w-4 h-4" /> Registry</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="hackathon-card rounded-2xl p-6 border-blue-500/20 bg-blue-950/10 shadow-xl shadow-black/50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Agent Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-blue-300/40 uppercase mb-3 tracking-widest">Skill Inventory</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {preferences.knowledgeScope.map(skill => (
                    <span key={skill} className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase text-blue-400 flex items-center gap-1">
                      {skill}
                      <button onClick={() => setPreferences(p => ({...p, knowledgeScope: p.knowledgeScope.filter(s => s !== skill)}))} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <input 
                  placeholder="Add Tech (e.g. Flutter)"
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && e.currentTarget.value) {
                      const val = e.currentTarget.value.trim();
                      if(!preferences.knowledgeScope.includes(val)) setPreferences(p => ({...p, knowledgeScope: [...p.knowledgeScope, val]}));
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full bg-blue-950/20 border border-blue-500/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500/40 text-blue-100 placeholder:text-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-300/40 uppercase mb-3 tracking-widest">Geospatial Target</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input 
                    type="text" 
                    placeholder="Global Coverage"
                    value={preferences.currentLocation}
                    onChange={(e) => setPreferences(p => ({ ...p, currentLocation: e.target.value }))}
                    className="w-full bg-blue-950/20 border border-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/40 font-bold text-blue-100 placeholder:text-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-blue-500/10 space-y-3">
                <button 
                  onClick={() => executeScout(false)}
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                  Check Registry
                </button>
                <button 
                  onClick={() => executeScout(true)}
                  disabled={loading}
                  className="w-full py-3 border border-blue-500/20 hover:border-blue-500/50 text-blue-400 text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 bg-black/40"
                >
                  <Sparkles className="w-4 h-4" /> Force Discovery
                </button>
              </div>
            </div>
          </div>

          <div className="hackathon-card rounded-2xl overflow-hidden border-blue-500/10 bg-black/20">
            <div className="bg-blue-500/5 px-6 py-3 border-b border-blue-500/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Scout_Console</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
            <div ref={scrollRef} className="h-40 overflow-y-auto p-4 mono text-[10px] bg-black/60 text-blue-100/30 space-y-2 scrollbar-hide">
              {logs.map((l, i) => <div key={i} className="border-l border-blue-500/10 pl-3 leading-relaxed">{l}</div>)}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9 space-y-8">
          {viewMode !== 'database' && (
            <div className="bg-blue-950/10 p-5 rounded-3xl border border-blue-500/10 flex flex-wrap gap-4 items-center backdrop-blur-md">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/40" />
                <input 
                  placeholder="Filter by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/40 text-blue-100 placeholder:text-blue-500/20"
                />
              </div>
              
              <div className="flex gap-4">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)} 
                  className="bg-black/40 border border-blue-500/20 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {HACKATHON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value as any)} 
                  className="bg-black/40 border border-blue-500/20 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Formats</option>
                  <option value="Online">Online</option>
                  <option value="Offline">On-Site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>

                <select 
                  value={filterPrize} 
                  onChange={(e) => setFilterPrize(e.target.value as any)} 
                  className="bg-black/40 border border-blue-500/20 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Rewards</option>
                  <option value="Price">Cash Prizes</option>
                  <option value="Non-price">Others</option>
                </select>
              </div>
            </div>
          )}

          <div className="min-h-[600px] relative">
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div 
                  key="grid" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredNodes.filter(h => h.status !== 'ENDED').map(h => (
                    <div 
                      key={h.id} 
                      onClick={() => setActiveNotification(h)}
                      className="hackathon-card rounded-2xl p-6 group cursor-pointer border-blue-500/10 hover:border-blue-500/40 transition-all hover:bg-blue-900/5 relative flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded border border-blue-500/20 tracking-widest">{h.category}</span>
                        <div className="flex gap-2">
                           <div className={`text-[8px] font-black px-2 py-0.5 rounded ${h.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                            {h.status}
                          </div>
                          <div className="text-[8px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {h.locationType}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl font-black mb-1 group-hover:text-blue-400 transition-colors uppercase italic truncate tracking-tighter">{h.name}</h3>
                        <p className="text-[10px] text-blue-100/40 font-black uppercase tracking-widest flex items-center gap-2">
                           <Activity className="w-3 h-3 text-blue-500" /> CONDUCTED BY {h.conductedBy}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-6 mb-8">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block">Time Window</span>
                          <div className="flex items-center gap-2 truncate text-[11px] font-bold text-white/80">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" /> {h.timePeriod}
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block">Registry Hub</span>
                          <div className="flex items-center justify-end gap-2 truncate text-[11px] font-bold text-white/80">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" /> {h.location}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block">Enrollment</span>
                          <div className="flex items-center gap-2 truncate text-[11px] font-bold text-white/80">
                            <UserPlus className="w-3.5 h-3.5 text-blue-500" /> {h.participantCount.toLocaleString()}+ Applied
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block">Reward Index</span>
                          <div className="flex items-center justify-end gap-2 truncate text-[11px] font-bold text-white/80">
                            <Trophy className={`w-3.5 h-3.5 ${h.prizeType === 'Price' ? 'text-yellow-400' : 'text-blue-400'}`} /> 
                            <span className={h.prizeType === 'Price' ? 'text-yellow-500' : 'text-blue-300'}>{h.prizeMoney}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-blue-500/5">
                        <div className="flex items-center gap-2">
                           <div className="flex -space-x-1.5">
                              {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-blue-900 border border-black/50 text-[7px] font-bold flex items-center justify-center">?</div>)}
                           </div>
                           <span className="text-[9px] font-black text-blue-500/40 uppercase">Vetting_Pipeline</span>
                        </div>
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
                          FIT: {h.relevanceScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {viewMode === 'globe' && (
                <motion.div key="globe" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full h-[650px] rounded-3xl overflow-hidden border border-blue-500/10 shadow-2xl">
                  <GlobeView hackathons={filteredNodes.filter(h => h.status !== 'ENDED')} onSelect={setActiveNotification} />
                </motion.div>
              )}

              {viewMode === 'database' && (
                <DatabaseView key="database" hackathons={hackathons} onDelete={deleteFromVault} onClear={purgeVault} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="border-t border-blue-500/10 py-12 bg-black/40 mt-12 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-4">
             <div className="flex items-center gap-3">
               <Binary className="text-blue-500 w-6 h-6" />
               <span className="font-black italic text-xl tracking-tighter uppercase">GlobalHackathons_v2.1</span>
             </div>
             <p className="text-xs text-blue-100/40 max-w-sm font-bold uppercase tracking-widest leading-loose">
               Advanced geospatial intelligence for discovery. Featuring verified participant metrics, persistent caching, and real-time grounding.
             </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-blue-500/40 tracking-[0.3em] mb-4">Discovery Status</h4>
            <ul className="space-y-2 text-[10px] text-blue-100/60 mono font-bold">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full"></div> GEO: {preferences.currentLocation.trim() || 'WORLDWIDE'}</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> VAULT: {hackathons.length} NODES</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> SOURCE: GOOGLE_GROUNDING</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-blue-500/40 tracking-[0.3em] mb-4">Vault Access</h4>
            <div 
              onClick={() => setViewMode('database')}
              className="flex items-center gap-3 p-4 bg-blue-900/10 rounded-xl border border-blue-500/20 cursor-pointer hover:bg-blue-900/20 transition-all shadow-lg"
            >
               <DatabaseZap className="w-5 h-5 text-blue-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-blue-100 tracking-widest uppercase">Open_Registry</span>
                 <span className="text-[9px] text-blue-400/40 font-black uppercase">Internal DB</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;