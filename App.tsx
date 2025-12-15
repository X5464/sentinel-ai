
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisResultCard } from './components/AnalysisResult';
import { analyzeMessage } from './services/scamDetectionService';
import { playRiskSound, initAudio } from './services/audioService';
import { saveScan } from './services/storageService';
import { AnalysisResult } from './types';
import { HowItWorks } from './components/HowItWorks';
import { Dashboard } from './components/Dashboard';
import { ScamVault } from './components/ScamVault';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ContactView } from './components/ContactView';
import { InteractionEffect } from './components/InteractionEffect';
import { OnboardingTour } from './components/OnboardingTour';
import { ThreatHunter } from './components/ThreatHunter';

type ViewMode = 'home' | 'dashboard' | 'vault' | 'privacy' | 'terms' | 'contact';
type ScannerMode = 'MESSAGE' | 'THREAT_HUNTER';

// Internal Toast Component for Global Notifications
const Toast = ({ message, visible }: { message: string, visible: boolean }) => {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
       <div className="bg-[#050505]/90 backdrop-blur-xl border border-cyan-500/30 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-3 w-max max-w-[90vw]">
          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-black">
               <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
             </svg>
          </div>
          <span className="text-sm font-medium tracking-wide truncate">{message}</span>
       </div>
    </div>
  );
};

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [view, setView] = useState<ViewMode>('home');
  const [showTour, setShowTour] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('MESSAGE');
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xl'>('normal');

  // Navigation Refs & State
  const navRef = useRef<HTMLDivElement>(null);
  const footerNavRef = useRef<HTMLDivElement>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isFooterNavHovered, setIsFooterNavHovered] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Tour Logic: Check local storage on mount
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sentinel_tour_seen');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1500);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('sentinel_tour_seen', 'true');
    triggerToast("You're all set! Stay safe.");
  };

  // Hash Routing Handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'dashboard', 'vault', 'privacy', 'terms', 'contact'].includes(hash)) {
        setView(hash as ViewMode);
      } else if (!hash) {
        setView('home');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeView = (newView: ViewMode) => {
    setView(newView);
    window.location.hash = newView === 'home' ? '' : newView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Font Scaling
  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === 'normal') root.style.fontSize = '16px'; 
    if (fontScale === 'large') root.style.fontSize = '18px'; 
    if (fontScale === 'xl') root.style.fontSize = '21px';    
  }, [fontScale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim().length > 5) {
        setIsAnalyzing(true);
        setTimeout(() => {
          const analysis = analyzeMessage(inputText);
          setResult(analysis);
          setIsAnalyzing(false);
          saveScan(analysis, inputText);
          
          if (isSoundEnabled) {
            playRiskSound(analysis.level);
          }

          if (resultRef.current) {
             resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1500);
      } else {
        setResult(null);
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [inputText, isSoundEnabled]);

  const handleInteraction = () => {
    initAudio();
  };

  const handleNavMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    navRef.current.style.setProperty('--mouse-x', `${x}px`);
    navRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleFooterNavMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!footerNavRef.current) return;
    const rect = footerNavRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    footerNavRef.current.style.setProperty('--mouse-x', `${x}px`);
    footerNavRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const containerClasses = [
    "min-h-screen pb-24 selection:bg-cyan-500/30 selection:text-white font-sans overflow-x-hidden transition-colors duration-300",
    highContrast ? "high-contrast" : ""
  ].join(" ");

  return (
    <div className={containerClasses} onClick={handleInteraction} onKeyDown={handleInteraction} onTouchStart={handleInteraction}>
      
      <InteractionEffect />
      <Toast message={toastMessage} visible={showToast} />

      {showTour && (
        <OnboardingTour 
          onComplete={handleTourComplete} 
          onRequestView={changeView} 
          onRequestMode={setScannerMode}
          currentView={view} 
        />
      )}

      {/* Navbar */}
      <nav className="w-full fixed top-0 z-50 transition-all duration-300 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl" role="navigation">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          
          {/* Animated Logo */}
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            onClick={() => changeView('home')}
          >
             <div className="relative w-10 h-10 rounded-xl flex items-center justify-center perspective-500">
               {/* Pulse Background */}
               <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-xl animate-pulse-slow group-hover:bg-cyan-500/40 transition-all duration-500" />
               
               {/* Glass Container with Deep Layering */}
               <div className="relative w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] group-hover:border-cyan-500/40 group-hover:bg-gradient-to-br group-hover:from-cyan-500/20 group-hover:via-white/5 group-hover:to-transparent transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_0_0_1px_rgba(6,182,212,0.2)]">
                  
                  {/* Inner Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

                  {/* Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110 relative z-10">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.757-3.257zM10.5 14.25a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5h-1.5v-.75zm.75-1.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm-1.5-3a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
               </div>
             </div>
             
             <div className="hidden md:flex flex-col justify-center">
                <span className="font-bold text-lg tracking-tight text-white leading-none mb-0.5 group-hover:text-cyan-100 transition-colors">Sentinel <span className="text-cyan-400">AI</span></span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold group-hover:text-cyan-500/70 transition-colors">Shield</span>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
               <button onClick={() => setFontScale('normal')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${fontScale === 'normal' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>A</button>
               <button onClick={() => setFontScale('large')} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${fontScale === 'large' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>A+</button>
               <button onClick={() => setFontScale('xl')} className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all ${fontScale === 'xl' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>A++</button>
               <div className="w-px h-4 bg-white/20 mx-1"></div>
               <button onClick={() => setHighContrast(!highContrast)} className={`px-3 h-8 rounded-full flex items-center gap-1 text-xs font-bold transition-all ${highContrast ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'text-slate-400 hover:text-white'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                 <span className="hidden md:inline">Contrast</span>
               </button>
             </div>
             <div className="hidden lg:block text-xs font-medium text-slate-300 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 tracking-wide backdrop-blur-md shadow-lg" id="tour-privacy-badge">
                Enterprise Edition
             </div>
          </div>
        </div>
      </nav>

      <div className="h-24" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-12 md:space-y-16 pt-8 relative" role="main">
        
        {/* Ambient Main Background - Static for performance */}
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none rounded-[3rem]">
           <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
           <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-cyan-900/5 blur-[100px] rounded-full" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center pb-8 animate-slide-up w-full scroll-mt-48" id="tour-nav-tabs">
           <div 
             ref={navRef}
             onMouseMove={handleNavMouseMove}
             onMouseEnter={() => setIsNavHovered(true)}
             onMouseLeave={() => setIsNavHovered(false)}
             className={`relative flex items-center gap-1 p-1.5 rounded-2xl md:rounded-full border backdrop-blur-xl overflow-hidden group/nav transition-all duration-500 ease-out ${
               isNavHovered ? 'bg-white/10 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] scale-[1.01]' : 'bg-white/5 border-white/10 scale-100'
             }`}
           >
             <div 
               className={`pointer-events-none absolute top-0 left-0 w-[250px] h-[250px] z-0 transition-opacity duration-300 ${isNavHovered ? 'opacity-100' : 'opacity-0'}`}
               style={{
                 transform: 'translate(calc(var(--mouse-x, -200px) - 50%), calc(var(--mouse-y, -200px) - 50%))'
               }}
             >
                <div 
                  className={`w-full h-full rounded-full bg-radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%) mix-blend-screen backdrop-blur-[4px] transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    isNavHovered ? 'scale-100' : 'scale-0'
                  }`}
                  style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)',
                  }}
                />
             </div>

             {['home', 'dashboard', 'vault'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => changeView(tab as ViewMode)}
                 className={`relative px-4 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex-1 md:flex-none text-center z-10 group`}
               >
                 {view === tab ? (
                   <>
                     <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-flow bg-[length:200%_100%] rounded-xl md:rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                     <span className="relative z-10 text-black">
                       {tab === 'home' ? 'Scanner' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                     </span>
                   </>
                 ) : (
                   <span className="relative z-10 text-slate-400 group-hover:text-white transition-colors">
                     {tab === 'home' ? 'Scanner' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                   </span>
                 )}
               </button>
             ))}
           </div>
        </div>

        {view === 'dashboard' && <Dashboard />}
        {view === 'vault' && <ScamVault />}
        {view === 'privacy' && <PrivacyPolicy />}
        {view === 'terms' && <TermsOfService />}
        {view === 'contact' && <ContactView />}

        {view === 'home' && (
          <>
            <Hero />

            <section className="space-y-12" aria-label="Scam Detector">
              
              {/* MASTER MODE TOGGLE (Message vs Threat Hunter) */}
              <div id="tour-mode-toggle" className="flex justify-center mb-[-2rem] relative z-20 animate-slide-up scroll-mt-48">
                  <div className="flex bg-[#0a0a0f]/80 p-1.5 rounded-full border border-white/10 backdrop-blur-xl relative shadow-2xl">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r ${scannerMode === 'MESSAGE' ? 'from-cyan-500 to-blue-600 left-1.5' : 'from-red-500 to-orange-600 left-[calc(50%+3px)]'} rounded-full transition-all duration-300 shadow-lg`} />
                    
                    <button 
                      onClick={() => setScannerMode('MESSAGE')}
                      className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${scannerMode === 'MESSAGE' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      Message Scanner
                    </button>
                    <button 
                      onClick={() => setScannerMode('THREAT_HUNTER')}
                      className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${scannerMode === 'THREAT_HUNTER' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                      Threat Hunter
                    </button>
                  </div>
              </div>

              {/* RENDER MODE: THREAT HUNTER */}
              {scannerMode === 'THREAT_HUNTER' && <ThreatHunter onToast={triggerToast} />}

              {/* RENDER MODE: MESSAGE SCANNER */}
              {scannerMode === 'MESSAGE' && (
              <>
                {/* Static wrapper for Tour Target */}
                <div id="tour-input-area" className="scroll-mt-48 block w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-flow bg-[length:200%_200%]" aria-hidden="true" />
                      
                      <div className="glass-morphism rounded-[2.5rem] p-2 relative transition-all duration-500">
                        <div className="bg-[#0a0a0f]/60 rounded-[2rem] p-6 md:p-12 transition-all duration-500">
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 px-2 gap-4">
                            <h2 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
                              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                              </span> 
                              Risk Analysis Engine
                            </h2>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowTour(true); }}
                                  aria-label="Restart Onboarding Guide"
                                  className="flex-1 md:flex-none text-sm font-medium text-slate-400 hover:text-cyan-400 transition-all px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-cyan-400"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                  </svg>
                                  <span className="hidden sm:inline">Guide</span>
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); setIsSoundEnabled(!isSoundEnabled); initAudio(); }}
                                  aria-pressed={isSoundEnabled}
                                  className={`flex-1 md:flex-none text-sm font-medium transition-all px-4 py-2 rounded-full border flex items-center justify-center gap-2 ${isSoundEnabled ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                >
                                  {isSoundEnabled ? (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h1.536l4.033 3.796A.75.75 0 0010 16.25V3.75zM14.03 6.97a.75.75 0 011.06-1.06A7.476 7.476 0 0117.25 10a7.476 7.476 0 01-2.16 4.09.75.75 0 01-1.06-1.06A5.976 5.976 0 0015.75 10a5.976 5.976 0 00-1.72-3.03z" /><path d="M11.97 8.03a.75.75 0 011.06 0 2.986 2.986 0 01.886 2.118c-.015.756-.302 1.486-.843 2.023a.75.75 0 01-1.06-1.06 1.486 1.486 0 00.42-.999c.007-.376-.136-.74-.423-1.022a.75.75 0 010-1.06z" /></svg>
                                      <span className="hidden sm:inline">Sound On</span>
                                      <span className="sm:hidden">On</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M9.547 3.092A.75.75 0 0 1 10 3.75v12.5a.75.75 0 0 1-1.264.546L4.703 13H3.167a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75h1.536l4.033-3.796a.75.75 0 0 1 .811-.112ZM12.97 6.47a.75.75 0 0 1 1.06 0l1.97 1.97 1.97-1.97a.75.75 0 1 1 1.06 1.06l-1.97 1.97 1.97 1.97a.75.75 0 1 1-1.06 1.06l-1.97-1.97-1.97-1.97a.75.75 0 0 1 0-1.06Z" /></svg>
                                      <span className="hidden sm:inline">Sound Off</span>
                                      <span className="sm:hidden">Off</span>
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => {setInputText(''); setResult(null);}}
                                  aria-label="Clear input text"
                                  className="flex-1 md:flex-none text-sm font-medium text-slate-400 hover:text-white transition-all px-5 py-2 hover:bg-white/10 rounded-full border border-transparent hover:border-white/10"
                                >
                                  Clear
                                </button>
                            </div>
                          </div>

                          <div className="relative rounded-3xl overflow-hidden">
                            <label htmlFor="scam-input" className="sr-only">Paste suspicious message here</label>
                            <textarea
                              id="scam-input"
                              value={inputText}
                              onFocus={handleInteraction}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder="Paste a suspicious WhatsApp message here..."
                              className="glass-input w-full min-h-[14rem] h-56 rounded-3xl p-6 md:p-8 text-lg md:text-2xl leading-relaxed text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none font-light"
                              spellCheck={false}
                            />
                            
                            {isAnalyzing && (
                              <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-10">
                                <div className="w-full h-[2px] bg-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.8)] absolute animate-scan" />
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent animate-pulse" />
                              </div>
                            )}

                            <div className={`absolute bottom-6 left-6 pointer-events-none transition-all duration-500 ${inputText.length > 0 && inputText.length <= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/20 backdrop-blur-md">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                  </span>
                                  <span className="text-cyan-300 text-xs font-mono tracking-wide">
                                    Awaiting data stream...
                                  </span>
                              </div>
                            </div>
                            
                            <div className="absolute bottom-6 right-6 flex items-center gap-4 pointer-events-none z-20" aria-hidden="true">
                              {isAnalyzing && (
                                <div className="flex flex-col gap-1.5 px-5 py-3 rounded-2xl bg-[#0a0a0f]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl min-w-[200px] animate-scale-in">
                                  <div className="flex justify-between items-center">
                                      <span className="text-cyan-400 text-xs font-bold tracking-widest flex items-center gap-2">
                                        <span className="animate-spin text-sm">⟳</span> ANALYZING
                                      </span>
                                      <span className="text-cyan-500/70 text-[10px] font-mono">AI-ENGINE</span>
                                    </div>
                                  <div className="w-full h-1.5 bg-cyan-900/30 rounded-full overflow-hidden relative">
                                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 h-full rounded-full animate-fill w-full bg-[length:200%_100%] animate-flow" />
                                  </div>
                                </div>
                              )}
                              {!isAnalyzing && (
                                <span className="hidden md:block text-slate-600 text-xs font-medium tracking-widest px-2">
                                  SECURE LOCAL ENCLAVE
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                </div>

                <div ref={resultRef} className="min-h-[100px] transition-all duration-500 scroll-mt-48">
                  {result && <AnalysisResultCard result={result} onToast={triggerToast} />}
                </div>

                <HowItWorks />
              </>
              )}
              
            </section>
          </>
        )}

      </main>
      
      <footer className="mt-24 pb-8 border-t border-white/5 bg-[#050505]/80 backdrop-blur-xl" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => changeView('home')}>
              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.757-3.257zM10.5 14.25a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5h-1.5v-.75zm.75-1.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm-1.5-3a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-white tracking-tight">Sentinel AI</span>
           </div>
           
           <div 
             ref={footerNavRef}
             onMouseMove={handleFooterNavMouseMove}
             onMouseEnter={() => setIsFooterNavHovered(true)}
             onMouseLeave={() => setIsFooterNavHovered(false)}
             className="flex gap-8 relative p-4 rounded-full group/footer"
           >
             <div 
               className={`pointer-events-none absolute top-0 left-0 w-[200px] h-[200px] z-0 transition-opacity duration-300 ${isFooterNavHovered ? 'opacity-100' : 'opacity-0'}`}
               style={{
                 background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
                 transform: 'translate(calc(var(--mouse-x, -100px) - 50%), calc(var(--mouse-y, -100px) - 50%))'
               }}
             />

             {['Privacy', 'Terms', 'Contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => changeView(item.toLowerCase() as ViewMode)}
                  className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors relative z-10"
                >
                  {item}
                </button>
             ))}
           </div>
           
           <div className="text-center md:text-right space-y-1">
             <div className="text-xs text-slate-500">
               Created by <span className="text-slate-300">Rajarshi Chakraborty</span>
             </div>
             <div className="text-xs text-slate-600 flex items-center justify-center md:justify-end gap-2">
               <span>Bangalore, India</span>
               <span>•</span>
               <a href="mailto:rajarshi7474@gmail.com" className="hover:text-cyan-500 transition-colors">rajarshi7474@gmail.com</a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
