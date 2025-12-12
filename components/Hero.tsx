import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative text-center px-4 py-8 md:py-16 overflow-hidden">
      {/* Dynamic Background Blob - Fluid Morphing Liquid with increased blur/saturation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[900px] h-[350px] md:h-[900px] bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-purple-600/30 blur-[100px] md:blur-[130px] animate-morph pointer-events-none mix-blend-screen" />
      
      {/* Secondary Blob for complexity - Warmer tones for contrast */}
      <div className="absolute top-1/4 left-1/4 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent blur-[90px] md:blur-[120px] animate-morph pointer-events-none mix-blend-screen" style={{ animationDelay: '-5s', animationDuration: '12s' }} />

      {/* Third floating accent blob */}
      <div className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-cyan-400/10 blur-[80px] md:blur-[100px] animate-blob-bounce pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 md:space-y-10">
        
        {/* Premium Pill Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg animate-slide-up hover:bg-white/10 transition-colors cursor-default group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 group-hover:bg-cyan-400 transition-colors"></span>
          </span>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-cyan-300 uppercase relative">Powered Engine</span>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white animate-slide-up leading-tight" style={{ animationDelay: '0.1s' }}>
          Sentinel <span className="hero-gradient drop-shadow-2xl">AI</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up px-2" style={{ animationDelay: '0.2s' }}>
          Protect your organization and family with <span className="text-white font-normal">enterprise-grade</span> scam detection. 
          Instant analysis for WhatsApp messages with clear, actionable advice.
        </p>
        
        {/* Stats/Trust - Glass Cards */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 md:pt-8 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
           <div className="glass-morphism px-6 md:px-8 py-4 rounded-2xl transition-transform hover:-translate-y-1 cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">100%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Privacy Focused</div>
           </div>
           <div className="glass-morphism px-6 md:px-8 py-4 rounded-2xl transition-transform hover:-translate-y-1 cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">0ms</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Latency</div>
           </div>
           <div className="glass-morphism px-6 md:px-8 py-4 rounded-2xl transition-transform hover:-translate-y-1 cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">AI</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Powered Engine</div>
           </div>
        </div>

      </div>
    </div>
  );
};