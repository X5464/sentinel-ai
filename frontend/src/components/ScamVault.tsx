
import React, { useState } from 'react';
import { categories } from '../services/scamDetectionService';

export const ScamVault: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-slide-up">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Scam <span className="text-cyan-400">Vault</span></h2>
        <p className="text-slate-400">Encyclopedia of known digital threats</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
        <input 
          type="text" 
          placeholder="Search scams (e.g., 'crypto', 'bank', 'job')..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="relative w-full bg-black/40 border border-white/10 rounded-full py-4 px-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all backdrop-blur-xl"
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-hover:text-cyan-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat, idx) => (
            <div key={idx} className="glass-morphism p-6 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
                <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-slate-300">
                  Weight: {cat.weight}%
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">{cat.description}</p>
              <div className="bg-[#050505]/50 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Detailed Analysis</p>
                <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{cat.explanation}</p>
              </div>
            </div>
          ))
        ) : (
          /* Empty State - Spans full width */
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center animate-slide-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse-slow" />
              <div className="relative z-10 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {/* Orbital Particle */}
                <div className="absolute -right-2 top-0 w-4 h-4 bg-cyan-500 rounded-full blur-md animate-ping" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">No Matching Patterns</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Our neural database couldn't find a match for "<span className="text-cyan-400">{searchTerm}</span>". 
              Try using broader keywords like <span className="text-slate-300">"bank"</span>, <span className="text-slate-300">"job"</span>, or <span className="text-slate-300">"crypto"</span>.
            </p>
            
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-8 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};