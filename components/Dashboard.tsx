
import React, { useEffect, useState } from 'react';
import { getStats, getHistory, clearHistory } from '../services/storageService';
import { DashboardStats, ScanHistoryItem, RiskLevel } from '../types';
import { RevealOnScroll } from './RevealOnScroll';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    setStats(getStats());
    setHistory(getHistory());
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-12 animate-slide-up">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Threat <span className="text-cyan-400">Dashboard</span></h2>
        <p className="text-slate-400">Your personal defense statistics</p>
      </div>

      {/* Stats Grid - Updated to 2 columns */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
        <div className="glass-morphism p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest truncate">Total Scans</p>
          <p className="text-4xl md:text-6xl font-bold text-white mt-4">{stats.totalScans}</p>
        </div>
        
        <div className="glass-morphism p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest truncate">Threats Blocked</p>
          <p className="text-4xl md:text-6xl font-bold text-risk-high mt-4">{stats.threatsBlocked}</p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="glass-morphism rounded-3xl p-6 md:p-8 border border-white/5 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          {history.length > 0 && (
            <button 
              onClick={() => { clearHistory(); setHistory([]); setStats(getStats()); }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors border px-3 py-1 rounded-full border-red-500/20 hover:bg-red-500/10"
            >
              Clear
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02]">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full animate-pulse-slow" />
              <div className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
            </div>
            <div>
               <h4 className="text-lg font-medium text-white mb-2">Perimeter Clean</h4>
               <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                 Your analysis log is currently empty. Scan a suspicious message to initialize tracking.
               </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 animate-slide-up">
                <div className={`w-1.5 md:w-2 h-12 rounded-full flex-shrink-0 ${
                  item.level === RiskLevel.CRITICAL ? 'bg-risk-critical' :
                  item.level === RiskLevel.HIGH ? 'bg-risk-high' :
                  item.level === RiskLevel.MEDIUM ? 'bg-risk-medium' :
                  item.level === RiskLevel.LOW ? 'bg-risk-low' : 'bg-risk-safe'
                }`} />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-white font-medium truncate pr-4 text-sm md:text-base">{item.category}</p>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm truncate mt-1">{item.textSnippet}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className={`text-sm font-bold ${
                     item.level === RiskLevel.CRITICAL ? 'text-risk-critical' :
                     item.level === RiskLevel.HIGH ? 'text-risk-high' :
                     item.level === RiskLevel.MEDIUM ? 'text-risk-medium' :
                     item.level === RiskLevel.LOW ? 'text-risk-low' : 'text-risk-safe'
                  }`}>
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
