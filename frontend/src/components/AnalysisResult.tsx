
import React from 'react';
import { AnalysisResult, RiskLevel } from '../types';
import { RiskGauge } from './RiskGauge';

interface Props {
  result: AnalysisResult;
  onToast?: (message: string) => void;
}

export const AnalysisResultCard: React.FC<Props> = ({ result, onToast }) => {
  
  // Dynamic header gradients based on 5-tier system - Now with FLOW support
  const getHeaderStyle = () => {
    switch(result.level) {
      case RiskLevel.CRITICAL: return 'from-risk-critical via-red-500 to-red-600'; // Red
      case RiskLevel.HIGH:     return 'from-risk-high via-orange-400 to-orange-500';  // Orange
      case RiskLevel.MEDIUM:   return 'from-risk-medium via-yellow-400 to-yellow-500';// Yellow
      case RiskLevel.LOW:      return 'from-risk-low via-teal-300 to-teal-400';     // Semi Green
      default:                 return 'from-risk-safe via-emerald-400 to-emerald-500'; // Deep Green
    }
  };

  const getBlobColor = () => {
    switch(result.level) {
      case RiskLevel.CRITICAL: return 'bg-red-500/20';
      case RiskLevel.HIGH:     return 'bg-orange-500/20';
      case RiskLevel.MEDIUM:   return 'bg-yellow-500/20';
      case RiskLevel.LOW:      return 'bg-teal-500/20';
      default:                 return 'bg-emerald-500/20';
    }
  }

  const getIcon = () => {
    if (result.level === RiskLevel.SAFE) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-400">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      );
    }
    if (result.level === RiskLevel.LOW) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-teal-400">
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.757-3.257zM12 9a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 9zm0 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    }
    if (result.level === RiskLevel.MEDIUM) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-400">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      );
    }
    if (result.level === RiskLevel.HIGH) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-orange-400">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      );
    }
    // Critical
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
      </svg>
    );
  };

  const handleShare = async () => {
    // UPDATED: Proper Warning Message for Family Groups
    const shareText = `⚠️ *URGENT FAMILY SECURITY ALERT* ⚠️\n\n` +
      `I scanned a suspicious message using Sentinel AI.\n\n` +
      `🚨 *Risk Level:* ${result.level}\n` +
      `📊 *Threat Score:* ${result.score}/100\n` +
      `📝 *Analysis:* ${result.summary}\n\n` +
      `PLEASE DO NOT CLICK any links in similar messages. Stay safe!\n\n` +
      `Verify unknown messages here:\n${window.location.origin}`;

    // 2. Use the Web Share API (Works natively with WhatsApp, Telegram, etc. on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sentinel AI Security Alert',
          text: shareText,
        });
        if (onToast) onToast('Report shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
           console.log('Share skipped');
        }
      }
    } else {
      // 3. Fallback for Desktop/Unsupported Browsers -> Copy to Clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        if (onToast) {
           onToast('Warning copied to clipboard!');
        } else {
           alert('Warning copied to clipboard! Paste it in your family group.');
        }
      } catch (err) {
        if (onToast) onToast('Unable to share automatically.');
      }
    }
  };

  return (
    <div 
      className="w-full animate-slide-up transform transition-all duration-500"
      role="region"
      aria-label="Scan Analysis Results"
      aria-live="polite"
    >
      <div className="glass-morphism rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/10">
        
        {/* Top Gradient Line - Liquid Effect */}
        <div className={`h-2 w-full bg-gradient-to-r ${getHeaderStyle()} shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-flow bg-[length:200%_100%]`} />

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          
          {/* Left: Gauge Section (Aligned Center) */}
          <div className="w-full lg:w-[28rem] border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 flex flex-col items-center justify-center relative p-6 md:p-8 overflow-hidden">
            {/* Morphing Liquid Blob Background - Changed to simple pulse to reduce lag */}
            <div className={`absolute w-[120%] h-[120%] ${getBlobColor()} blur-[80px] animate-pulse-slow opacity-40`} />
            <RiskGauge score={result.score} level={result.level} />
          </div>

          {/* Right: Content Section (Aligned Top-Left) */}
          <div className="flex-1 p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10 bg-gradient-to-br from-transparent to-white/5 relative">
            
            {/* Header Area with Share Button */}
            <div className="space-y-4 relative z-10">
               <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-morphism flex items-center justify-center text-3xl shadow-lg relative overflow-hidden" aria-hidden="true">
                      {/* Subtle liquid sheen on icon bg */}
                      <div className="absolute inset-0 bg-white/10 animate-flow bg-[length:200%_200%] opacity-30" />
                      {getIcon()}
                   </div>
                   <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                     Analysis Complete
                   </h3>
                 </div>
                 
                 {/* Share Button */}
                 {result.level !== RiskLevel.SAFE && (
                   <button 
                     onClick={handleShare}
                     className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs md:text-sm font-bold uppercase tracking-wide ml-auto md:ml-0 shadow-lg hover:shadow-red-500/30"
                     aria-label="Share Analysis Report"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                     </svg>
                     Warn Others
                   </button>
                 )}
               </div>
               
               <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light border-l-2 border-white/10 pl-4">
                 {result.summary}
               </p>
            </div>

            {/* Risk Indicators Grid with Detailed Explanations */}
            {/* FIX: Only show detected patterns if the overall risk is NOT SAFE */}
            {result.level !== RiskLevel.SAFE && result.patterns.length > 0 && (
              <div className="space-y-5 relative z-10">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" id="risk-factors-title">
                   Detected Risk Signals
                </h4>
                <div className="grid grid-cols-1 gap-4" role="list" aria-labelledby="risk-factors-title">
                  {result.patterns.map((pattern, idx) => (
                    <div 
                      key={idx} 
                      className="group flex flex-col gap-3 p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                      style={{ animationDelay: `${idx * 100}ms` }}
                      role="listitem"
                    >
                      {/* Subtle hover liquid fill */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-1.5 h-12 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                          pattern.severity === 'high' ? 'bg-risk-critical' : 'bg-risk-medium'
                        }`} aria-hidden="true" />
                        <div>
                           <p className="text-white font-semibold text-lg tracking-wide">{pattern.name}</p>
                           <p className="text-slate-400 text-sm">{pattern.description}</p>
                        </div>
                      </div>
                      
                      {/* Detailed Why Box - whitespace-pre-line enables multi-line text */}
                      <div className="ml-5 mt-2 p-3 md:p-4 rounded-xl bg-black/30 border border-white/5 text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line relative z-10">
                        <span className="text-cyan-400 font-medium text-xs uppercase tracking-wider block mb-2 border-b border-white/10 pb-1">Risk Intelligence</span>
                        {pattern.detailedDescription}
                        
                        {/* Keyword Matches Highlight */}
                        {pattern.matches && pattern.matches.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-2">Trigger Words:</span>
                                <div className="inline-flex flex-wrap gap-2 mt-1">
                                    {pattern.matches.map((word, i) => (
                                        <span key={i} className="inline-block px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
                                            "{word}"
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Box - Premium Liquid Style */}
            <div 
              className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-colors duration-500 ${
               result.level === RiskLevel.SAFE ? 'bg-risk-safe/5 border-risk-safe/20' : 'bg-white/5 border-white/10'
              }`}
              role="complementary"
              aria-label="Recommended Actions"
            >
               {/* Ambient Glow */}
               <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${getHeaderStyle()} animate-morph`} aria-hidden="true" />
               
               <div className="flex justify-between items-center mb-6 relative z-10">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">
                   Recommended Actions
                 </h4>
                 
                 {/* Special Badge for Contextual Verification */}
                 {result.recommendations.some(r => r.includes("initiated the request")) && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                       VERIFICATION REQUIRED
                    </span>
                 )}
               </div>
               
               <ul className="space-y-4 md:space-y-5 relative z-10">
                 {result.recommendations.map((rec, idx) => (
                   <li key={idx} className="flex items-start gap-4 text-base md:text-lg text-slate-200 font-light">
                     <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 shadow-lg ${
                       rec.includes("Only use this code") ? 'bg-yellow-400 shadow-yellow-400/50' :
                       result.level === RiskLevel.SAFE ? 'bg-risk-safe shadow-risk-safe/50' : 'bg-white shadow-white/50'
                     }`} aria-hidden="true" />
                     <span className="leading-relaxed">{rec}</span>
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
