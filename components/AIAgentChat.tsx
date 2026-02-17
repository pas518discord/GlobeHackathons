import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Bot, User, RefreshCw, Sparkles } from 'lucide-react';
import { createAIAgentChat } from '../services/geminiService.ts';

const AIAgentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      if (!chatRef.current) {
        chatRef.current = createAIAgentChat();
      }
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'agent', text: response.text || 'Protocol error. Try again.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Neural link interrupted. Please verify your connection.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[60]">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-3d-hover border-2 border-white shadow-brand-primary/30"
        >
          {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-brand-surface rounded-[2rem] shadow-[0_50px_100px_rgba(62,34,18,0.25)] border border-brand-border/30 overflow-hidden z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="bg-brand-panel p-6 flex items-center gap-4 border-b border-brand-border/20 shadow-sm relative z-10">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-brand-black font-black uppercase italic tracking-tighter text-lg">Agent_Link</h3>
                <p className="text-brand-success text-[10px] font-bold uppercase tracking-widest">Neural_Sync: ACTIVE</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-brand-surface shadow-inner-3d">
              {messages.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-brand-black" />
                  <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Initializing Neural Stream...</p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-bold shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white border border-brand-border/20 text-brand-black shadow-sm rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-border/20 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-brand-panel border-t border-brand-border/20">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask the Agent..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white border border-brand-border/30 rounded-xl px-5 py-4 text-sm font-bold text-brand-black focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder-brand-muted shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-brand-primary text-white p-4 rounded-xl hover:bg-brand-primaryHover transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-brand-primary/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgentChat;