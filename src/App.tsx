/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  Stethoscope, 
  PlusCircle, 
  History,
  ShieldAlert,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getChatResponse } from './services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm MediGuide AI, your medical information assistant. How can I help you today?\n\n*Disclaimer: I am an AI, not a doctor. My advice is for informational purposes only. If you are experiencing a medical emergency, please call 911 or your local emergency services immediately.*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const responseText = await getChatResponse(input, history);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center gap-3 text-medical-600">
            <div className="p-2 bg-medical-100 rounded-xl">
              <Stethoscope size={24} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">MediGuide AI</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
          >
            <PlusCircle size={18} className="text-slate-400 group-hover:text-medical-500" />
            New Consultation
          </button>
          
          <div className="pt-4">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Sessions</p>
            <div className="space-y-1">
              <div className="px-4 py-2 text-sm text-slate-500 italic">No recent history</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-900 mb-1">Medical Disclaimer</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  This AI provides general information and is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header - Mobile & Desktop */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:hidden">
            <Stethoscope size={20} className="text-medical-600" />
            <span className="font-bold text-slate-900">MediGuide AI</span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm font-medium text-slate-500">Current Session</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Online
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    message.role === 'model' 
                      ? 'bg-medical-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {message.role === 'model' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 rounded-2xl shadow-sm ${
                      message.role === 'model'
                        ? 'bg-white border border-slate-100 text-slate-800'
                        : 'bg-medical-600 text-white'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{message.text}</Markdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-medical-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={20} />
                </div>
                <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl shadow-sm flex items-center gap-3">
                  <Loader2 size={18} className="text-medical-500 animate-spin" />
                  <span className="text-sm text-slate-500 font-medium">Analyzing symptoms...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your symptoms or ask a health question..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-16 shadow-lg focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all resize-none min-h-[64px] max-h-32"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-3 bottom-3 p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-medical-600 text-white shadow-md hover:bg-medical-700 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              <AlertCircle size={12} />
              Always consult a doctor for medical concerns. In an emergency, call 911.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
