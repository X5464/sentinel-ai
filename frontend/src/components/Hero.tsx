
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative text-center px-4 py-8 md:py-16 overflow-hidden">
      
      {/* 
         FIXED: "Weird Rectangle" Artifacts
         Solution: Replaced `bg-gradient-to-r` (linear) with explicit `radial-gradient` via style prop.
         This ensures a perfect soft circular glow that fades to transparent, regardless of container shape.
         
         UPDATED: Monochrome Minimalist Palette (White/Zinc instead of Cyan/Blue)
      */}
      
      {/* Main Center Light - Soft White Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] animate-blob pointer-events-none"
        style={{
            background: 'radial-gradient(circle closest-side, rgba(255,255,255,0.08) 0%, transparent 100%)',
            mixBlendMode: 'screen'
        }}
      />
      
      {/* Secondary Ambient Light - Subtle Zinc/Grey */}
      <div 
        className="absolute top-0 left-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] animate-blob pointer-events-none" 
        style={{ 
            animationDelay: '2s',
            background: 'radial-gradient(circle closest-side, rgba(161, 161, 170, 0.05) 0%, transparent 100%)',
            mixBlendMode: 'screen'
        }} 
      />

      {/* Third Accent Light - Moving Ghost */}
      <div 
        className="absolute bottom-0 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] animate-blob pointer-events-none" 
        style={{ 
            animationDelay: '4s',
            background: 'radial-gradient(circle closest-side, rgba(255, 255, 255, 0.04) 0%, transparent 100%)' 
        }} 
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 md:space-y-10">
        
        {/* Premium Pill Badge - Monochrome Liquid Glass */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full ios-liquid-btn animate-slide-up cursor-default group relative">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white transition-colors"></span>
          </span>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-300 group-hover:text-white uppercase relative transition-colors">Powered Engine</span>
        </div>
        
        {/* Title - Monochrome */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white animate-slide-up leading-tight" style={{ animationDelay: '0.1s' }}>
          Sentinel <span className="hero-gradient drop-shadow-2xl">AI</span>
        </h1>
        
        {/* Subtitle - Zinc text */}
        <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up px-2" style={{ animationDelay: '0.2s' }}>
          Protect your organization and family with <span className="text-white font-normal">enterprise-grade</span> scam detection. 
          Instant analysis for WhatsApp messages with clear, actionable advice.
        </p>
        
        {/* Stats/Trust - Minimalist Glass Cards */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 md:pt-8 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
           <div className="ios-glass-card px-6 md:px-8 py-4 rounded-2xl cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">100%</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 group-hover:text-zinc-300">Privacy Focused</div>
           </div>
           <div className="ios-glass-card px-6 md:px-8 py-4 rounded-2xl cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">0ms</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 group-hover:text-zinc-300">Latency</div>
           </div>
           <div className="ios-glass-card px-6 md:px-8 py-4 rounded-2xl cursor-default min-w-[120px] group">
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">AI</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 group-hover:text-zinc-300">Powered Engine</div>
           </div>
        </div>

      </div>
    </div>
  );
};
