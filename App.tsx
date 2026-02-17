import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, MapPin, Settings, Database, RefreshCw, 
  LayoutGrid, Map as MapIcon, DatabaseZap, ShieldCheck, 
  Calendar, Star, Info, Sparkles, Globe, Lock, ExternalLink, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hackathon, UserPreferences, HACKATHON_CATEGORIES } from './types.ts';
import { searchHackathons } from './services/geminiService.ts';
import { HackathonDatabaseManager, INITIAL_HACKATHON_DATABASE } from './services/HackathonDatabase.ts';
import Notification3D from './components/Notification3D.tsx';
import GlobeView from './components/GlobeView.tsx';
import DatabaseView from './components/DatabaseView.tsx';
import AIAgentChat from './components/AIAgentChat.tsx';

// Removed conflicting global declaration for window.aistudio to avoid Type mismatch errors.
// Using explicit casting in component code instead.

const App: React.FC = () => {
  const MotionDiv = motion.div as any;
  const [loading, setLoading] = useState(false);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [activeNotification, setActiveNotification] = useState<Hackathon | null>(null);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] GLOBAL_REGISTRY_INIT. Monitoring nodes..."]);
  const [viewMode, setViewMode] = useState<'grid' | 'globe' | 'database'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [techInput, setTechInput] = useState('');

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('hackagent_prefs_v1');
    return saved ? JSON.parse(saved) : { 
      knowledgeScope: ['React', 'TypeScript', 'AI'], 
      currentLocation: '', 
      preferredCategories: ['AI & Machine Learning'], 
      minPrize: 0 
    };
  });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Use type assertion to access aistudio properties
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const has = await aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for environments where aistudio object isn't present
        setHasApiKey(true);
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (hasApiKey) {
        const loaded = HackathonDatabaseManager.loadHackathons();
        if (loaded.length > 0) {
          setHackathons(loaded);
          addLog(`Vault: Sync completed. ${loaded.length} nodes loaded.`);
        } else {
          setHackathons(INITIAL_HACKATHON_DATABASE);
          HackathonDatabaseManager.saveHackathons(INITIAL_HACKATHON_DATABASE);
          addLog(`Vault: Initialized with core protocols.`);
        }
    }
  }, [hasApiKey]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('hackagent_prefs_v1', JSON.stringify(preferences));
  }, [preferences]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleConnectApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const executeScout = async () => {
    setLoading(true);
    addLog("Agent_Link: Connecting to Gemini Cluster (Search Grounding mode)...");
    try {
      const results = await searchHackathons(preferences, addLog, preferences.currentLocation);
      if (results.length > 0) {
        setHackathons(prev => {
          const merged = [...results, ...prev].reduce((acc: Hackathon[], curr) => {
            if (!acc.find(h => h.name === curr.name)) acc.push(curr);
            return acc;
          }, []);
          HackathonDatabaseManager.saveHackathons(merged);
          return merged;
        });
        addLog(`Vault_Update: ${results.length} new nodes verified.`);
        setViewMode('grid');
        setActiveNotification(results[0]);
      } else {
        addLog("Agent_Link: Registry scan complete. No new deviations detected.");
      }
    } catch (err: any) {
      if (err.toString().includes('403') || err.toString().includes('PERMISSION_DENIED') || err.toString().includes('The caller does not have permission')) {
         addLog("Auth_Error: Permission Denied. Resetting credentials.");
         setHasApiKey(false);
      } else {
         addLog("System_Error: Neural link interrupted. Check API protocol.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      const newTech = techInput.trim();
      if (!preferences.knowledgeScope.includes(newTech)) {
        setPreferences(prev => ({
          ...prev,
          knowledgeScope: [...prev.knowledgeScope, newTech]
        }));
        addLog(`Config: Added skill [${newTech}] to agent scope.`);
      }
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setPreferences(prev => ({
      ...prev,
      knowledgeScope: prev.knowledgeScope.filter(t => t !== tech)
    }));
    addLog(`Config: Removed skill [${tech}] from agent scope.`);
  };

  const filteredNodes = useMemo(() => {
    return hackathons.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || h.category === categoryFilter || (categoryFilter === 'Other' && !HACKATHON_CATEGORIES.includes(h.category));
      const matchesFormat = formatFilter === 'All' || h.locationType === formatFilter || (formatFilter === 'Hybrid' && (h.locationType === 'Online' || h.locationType === 'Offline')); // Simplifying Hybrid for now or strict matching
      
      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [hackathons, searchQuery, categoryFilter, formatFilter]);

  if (checkingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-black">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-black p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-20 left-20 w-64 h-64 bg-brand-primary rounded-full blur-[100px]"></div>
             <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-accent rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-brand-panel p-8 rounded-[2rem] shadow-3d border border-brand-border/30 relative z-10"
        >
           <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20 mx-auto">
              <Lock className="text-white w-8 h-8" />
           </div>
           
           <h1 className="text-3xl font-black text-center text-brand-black uppercase italic tracking-tighter mb-2">
             Access Restricted
           </h1>
           <p className="text-center text-xs font-bold text-brand-muted uppercase tracking-widest mb-8 leading-relaxed">
             Secure Neural Link Required<br/>for Gemini Agent Capabilities
           </p>

           <button 
             onClick={handleConnectApiKey}
             className="w-full py-4 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-brand-primary/20 transition-all active:scale-95 mb-6 flex items-center justify-center gap-2"
           >
             Connect Secure Key <Sparkles className="w-4 h-4" />
           </button>

           <div className="text-center">
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-[10px] font-bold text-brand-muted hover:text-brand-primary uppercase flex items-center justify-center gap-1 transition-colors"
             >
               Payment setup required for Search Grounding <ExternalLink className="w-3 h-3" />
             </a>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-black transition-colors duration-500 selection:bg-brand-primary selection:text-white">
      <Notification3D hackathon={activeNotification} onClose={() => setActiveNotification(null)} />
      <AIAgentChat />
      
      {/* Navigation: Light Latte with Shadow */}
      <nav className="border-b border-brand-border/40 bg-brand-panel/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-3d">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30 transform hover:scale-110 transition-transform">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase text-brand-black leading-none tracking-tighter">
              Global<span className="text-brand-primary">Hackathons</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold tracking-widest uppercase text-brand-muted">
              <span className="mono text-brand-success">PERSISTENCE_ACTIVE</span>
              <span className="w-1 h-1 bg-brand-muted rounded-full"></span>
              <span>MODE: LIGHT_3D</span>
            </div>
          </div>
        </div>

        <div className="flex bg-brand-surface p-1.5 rounded-xl border border-brand-border/30 shadow-inner-3d">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 px-6 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-muted hover:text-brand-black hover:bg-brand-panel'}`}>
            <LayoutGrid className="w-4 h-4" /> Atlas
          </button>
          <button onClick={() => setViewMode('globe')} className={`p-2.5 px-6 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'globe' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-muted hover:text-brand-black hover:bg-brand-panel'}`}>
            <MapIcon className="w-4 h-4" /> Globe
          </button>
          <button onClick={() => setViewMode('database')} className={`p-2.5 px-6 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'database' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-muted hover:text-brand-black hover:bg-brand-panel'}`}>
            <DatabaseZap className="w-4 h-4" /> Registry
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-8">
          {/* Sidebar Panel: Light Panel with strong shadow */}
          <div className="bg-brand-panel text-brand-black rounded-3xl p-6 border border-brand-border/30 shadow-3d">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Agent Configuration
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-2 tracking-widest">Skill Inventory</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {preferences.knowledgeScope.map(skill => (
                        <span 
                          key={skill} 
                          onClick={() => removeTech(skill)}
                          className="group cursor-pointer px-2 py-1 bg-brand-surface border border-brand-border/40 hover:border-red-400 hover:bg-red-50 rounded-lg text-[10px] text-brand-black font-bold uppercase shadow-sm flex items-center gap-1 transition-all"
                        >
                          {skill}
                          <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-red-400" />
                        </span>
                    ))}
                </div>
                <input 
                  type="text" 
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  placeholder="Add Tech (Enter to add)" 
                  className="w-full bg-brand-surface border border-brand-border/40 rounded-xl px-4 py-3 text-xs font-bold text-brand-black focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder-brand-muted shadow-inner-3d"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-2 tracking-widest">Geospatial Target</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
                  <input type="text" placeholder="Global Coverage" value={preferences.currentLocation} onChange={e => setPreferences({...preferences, currentLocation: e.target.value})} className="w-full bg-brand-surface border border-brand-border/40 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-brand-black focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-inner-3d placeholder-brand-muted" />
                </div>
              </div>
              
              <button onClick={executeScout} disabled={loading} className="w-full py-4 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl font-black uppercase text-[12px] flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 active:shadow-none translate-y-0 active:translate-y-1">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />} Check Registry
              </button>

               <button 
                onClick={() => { addLog("Force_Command: Initiating deep discovery sequence..."); executeScout(); }}
                disabled={loading}
                className="w-full py-3 border border-brand-border/30 hover:border-brand-primary/50 text-brand-muted hover:text-brand-primary rounded-xl font-bold uppercase text-[11px] flex items-center justify-center gap-2 transition-all bg-brand-surface hover:bg-brand-panel active:scale-95 disabled:opacity-50"
               >
                <Sparkles className="w-4 h-4" /> Force Discovery
              </button>
            </div>
          </div>

          <div className="bg-brand-surface rounded-3xl overflow-hidden border border-brand-border/30 shadow-3d">
            <div className="px-6 py-4 border-b border-brand-border/20 flex items-center justify-between bg-brand-panel/50">
              <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">Scout_Console</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
              </div>
            </div>
            <div ref={scrollRef} className="h-48 overflow-y-auto p-6 mono text-[10px] text-brand-muted space-y-3 scrollbar-hide bg-brand-surface">
              {logs.map((l, i) => <div key={i} className="border-l-2 border-brand-border/30 pl-3 leading-relaxed hover:text-brand-black transition-colors">{l}</div>)}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-8">
           {viewMode === 'grid' && (
             <div className="bg-brand-panel p-4 rounded-3xl border border-brand-border/30 flex flex-col md:flex-row gap-4 items-center justify-between shadow-3d">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input 
                        type="text" 
                        placeholder="Filter by name or city..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border/30 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-brand-black focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder-brand-muted shadow-inner-3d"
                    />
                </div>
                <div className="flex gap-2">
                     <div className="relative">
                       <select 
                         value={categoryFilter}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                         className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-brand-border/30 bg-brand-surface text-[10px] font-bold text-brand-muted uppercase cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm focus:outline-none focus:border-brand-primary"
                       >
                         <option value="All">All Categories</option>
                         {HACKATHON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-muted pointer-events-none" />
                     </div>

                     <div className="relative">
                       <select 
                         value={formatFilter}
                         onChange={(e) => setFormatFilter(e.target.value)}
                         className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-brand-border/30 bg-brand-surface text-[10px] font-bold text-brand-muted uppercase cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm focus:outline-none focus:border-brand-primary"
                       >
                         <option value="All">All Formats</option>
                         <option value="Online">Online</option>
                         <option value="Offline">Offline</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-muted pointer-events-none" />
                     </div>
                </div>
             </div>
           )}

          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <MotionDiv key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredNodes.length > 0 ? (
                  filteredNodes.map(h => (
                    <div key={h.id} onClick={() => setActiveNotification(h)} className="hackathon-card rounded-3xl p-8 group cursor-pointer relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-lg border border-brand-primary/20 tracking-wider shadow-sm">{h.category}</span>
                        <div className="flex items-center gap-2 bg-brand-surface/50 px-2 py-1 rounded-full border border-brand-border/20">
                          <div className={`w-2 h-2 rounded-full ${h.locationType === 'Online' ? 'bg-brand-success' : 'bg-brand-primary'}`}></div>
                          <span className="text-[10px] font-bold text-brand-black uppercase">{h.locationType}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black mb-2 uppercase italic text-brand-black leading-tight tracking-tight group-hover:text-brand-primary transition-colors">{h.name}</h3>
                      <p className="text-[10px] text-brand-muted font-bold uppercase mb-6 flex items-center gap-2"><Sparkles className="w-3 h-3 text-brand-primary" /> CONDUCTED BY {h.conductedBy}</p>
                      
                      <div className="grid grid-cols-2 gap-6 border-t border-brand-border/20 pt-6">
                          <div>
                              <span className="text-[9px] font-black uppercase block text-brand-muted tracking-widest mb-1">Time Window</span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-black"><Calendar className="w-3 h-3 text-brand-primary" /> {h.timePeriod}</div>
                          </div>
                          <div className="text-right">
                              <span className="text-[9px] font-black uppercase block text-brand-muted tracking-widest mb-1">Registry Hub</span>
                              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-brand-black"><MapPin className="w-3 h-3 text-brand-primary" /> {h.locationType === 'Online' ? 'Online/Remote' : h.location}</div>
                          </div>
                          <div className="mt-1">
                              <span className="text-[9px] font-black uppercase block text-brand-muted tracking-widest mb-1">Enrollment</span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-black"><Database className="w-3 h-3 text-brand-primary" /> {h.participantCount}+ Applied</div>
                          </div>
                          <div className="text-right mt-1">
                              <span className="text-[9px] font-black uppercase block text-brand-muted tracking-widest mb-1">Reward Index</span>
                              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-brand-warning"><TrophyIcon className="w-3 h-3" /> {h.prizeMoney}</div>
                          </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between bg-brand-surface/60 p-3 rounded-xl border border-brand-border/20">
                          <div className="flex items-center gap-1">
                              <span className="ml-1 text-[9px] font-bold text-brand-muted uppercase">Verification_Tier: </span>
                              <div className="flex gap-0.5">
                                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-brand-primary/30 rounded-full"></div>
                              </div>
                          </div>
                          <div className="text-[10px] font-black text-brand-primary uppercase bg-white/50 px-3 py-1 rounded-lg border border-brand-primary/20 shadow-sm">
                              FIT: {h.relevanceScore}%
                          </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="col-span-full py-20 flex flex-col items-center justify-center text-brand-muted">
                     <Search className="w-12 h-12 mb-4 opacity-30" />
                     <p className="text-xs font-black uppercase tracking-widest">No nodes match current filters</p>
                   </div>
                )}
              </MotionDiv>
            )}
            
            {viewMode === 'globe' && (
              <MotionDiv key="globe" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-[700px] rounded-[2rem] overflow-hidden border-4 border-brand-panel shadow-3d bg-brand-panel">
                <GlobeView hackathons={filteredNodes} onSelect={h => setActiveNotification(h)} />
              </MotionDiv>
            )}

            {viewMode === 'database' && (
              <div className="bg-brand-panel p-8 rounded-[2rem] shadow-3d border border-brand-border/30">
                <DatabaseView key="database" hackathons={hackathons} onDelete={(id) => {
                  const updated = hackathons.filter(h => h.id !== id);
                  setHackathons(updated);
                  HackathonDatabaseManager.saveHackathons(updated);
                }} onClear={() => {
                  setHackathons([]);
                  HackathonDatabaseManager.clearDatabase();
                }} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

export default App;