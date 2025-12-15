
import React, { useEffect, useState } from 'react';
import { RiskLevel } from '../types';

interface Props {
  score: number;
  level: RiskLevel;
}

export const RiskGauge: React.FC<Props> = ({ score, level }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score counting up - Faster Duration (800ms instead of 1200ms)
    let start = 0;
    const end = score;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedScore(Math.round(start + (end - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // 5-Color Logic Mapping
  const getColors = () => {
    switch(level) {
      case RiskLevel.CRITICAL: return { text: 'text-risk-critical', stroke: '#ef4444', bg: 'bg-risk-critical/10', border: 'border-risk-critical/20' };
      case RiskLevel.HIGH:     return { text: 'text-risk-high',     stroke: '#fb923c', bg: 'bg-risk-high/10',     border: 'border-risk-high/20' };
      case RiskLevel.MEDIUM:   return { text: 'text-risk-medium',   stroke: '#facc15', bg: 'bg-risk-medium/10',   border: 'border-risk-medium/20' };
      case RiskLevel.LOW:      return { text: 'text-risk-low',      stroke: '#2dd4bf', bg: 'bg-risk-low/10',      border: 'border-risk-low/20' };
      default:                 return { text: 'text-risk-safe',     stroke: '#10b981', bg: 'bg-risk-safe/10',     border: 'border-risk-safe/20' };
    }
  };

  const colors = getColors();
  
  // SVG Metrics based on viewBox 0 0 288 288
  // Center (144, 144). Radius 80.
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div 
      className="flex flex-col items-center justify-center p-4 md:p-8 relative w-full h-full"
      role="region"
      aria-label="Risk Score Gauge"
    >
      {/* Use w-full/h-full with a max-width container relative to font size (rem) 
          This ensures when font scales, the container scales, and SVG fills it. 
      */}
      <div 
        className="relative w-64 h-64 md:w-72 md:h-72 lg:w-[18rem] lg:h-[18rem] flex items-center justify-center"
        role="meter" 
        aria-valuenow={animatedScore} 
        aria-valuemin={0} 
        aria-valuemax={100}
        aria-label={`Current Risk Score: ${animatedScore} out of 100, indicating ${level} risk.`}
      >
        {/* Glow Effect behind gauge */}
        <div 
          className="absolute inset-0 rounded-full blur-[40px] md:blur-[60px] opacity-30 transition-colors duration-700"
          style={{ backgroundColor: colors.stroke }}
          aria-hidden="true"
        />

        {/* Added viewBox for perfect scaling inside the container */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 288 288" aria-hidden="true">
          {/* Background Track */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
            fill="transparent"
            className="backdrop-blur-sm"
          />
          {/* Progress Arc */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 10px ${colors.stroke})` }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className={`text-6xl md:text-7xl font-bold tracking-tighter transition-colors duration-500 ${colors.text} drop-shadow-lg`}>
            {animatedScore}
          </span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest mt-2">Risk Score</span>
        </div>
      </div>
      
      <div className={`mt-6 md:mt-8 px-8 py-3 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-500 ${colors.bg} ${colors.border}`}>
        <span className={`text-lg md:text-xl font-bold tracking-wide ${colors.text}`}>
          {level} RISK
        </span>
      </div>
    </div>
  );
};
