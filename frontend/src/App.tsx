
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
type ToastType = 'info' | 'error' | 'success';

const Toast = ({ message, visible, type = 'info' }: { message: string, visible: boolean, type?: ToastType }) => {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
       <div className="ios-glass-card px-6 py-3 rounded-full flex items-center gap-3 w-max max-w-[90vw] shadow-2xl">
          <div className={`w-2 h-2 rounded-full ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-white'}`}></div>
          <span className="text-sm font-medium tracking-wide truncate text-white">{message}</span>
       </div>
    </div>
  );
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [view, setView] = useState<ViewMode>('home');
  const [showTour, setShowTour] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('MESSAGE');
  const [isMobile, setIsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('info');
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xl'>('normal');

  const navRef = useRef<HTMLDivElement>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isTouch = /android|ipad|iphone|ipod|windows phone/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isTouch || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sentinel_tour_seen');
    if (!hasSeenTour) setTimeout(() => setShowTour(true), 1500);
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('sentinel_tour_seen', 'true');
    triggerToast("System initialized. You are safe.", 'success');
  };

  const changeView = (newView: ViewMode) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerToast = (msg: string, type: ToastType = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === 'normal') root.style.fontSize = '16px'; 
    if (fontScale === 'large') root.style.fontSize = '18px'; 
    if (fontScale === 'xl') root.style.fontSize = '21px';    
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const handleManualAnalyze = () => {
    if (inputText.trim().length <= 5) {
        triggerToast("Please enter more text to analyze.", 'info');
        return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      try {
        const analysis = analyzeMessage(inputText);
        setResult(analysis);
        setIsAnalyzing(false);
        saveScan(analysis, inputText);
        if (isSoundEnabled) playRiskSound(analysis.level);
        if (resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        setIsAnalyzing(false);
        triggerToast("Analysis engine error.", 'error');
      }
    }, 1500); 
  };

  const handleInteraction = () => initAudio();

  const handleNavMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    navRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    navRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const containerClasses = [
    "min-h-screen flex flex-col selection:bg-white selection:text-black font-sans overflow-x-hidden transition-colors duration-300",
    highContrast ? "high-contrast" : ""
  ].join(" ");

  return (
    <div className={containerClasses} onClick={handleInteraction} onKeyDown={handleInteraction} onTouchStart={handleInteraction}>
      
      <InteractionEffect isMobile={isMobile} />
      <Toast message={toastMessage} visible={showToast} type={toastType} />

      {showTour && (
        <OnboardingTour 
          onComplete={handleTourComplete} 
          onRequestView={changeView} 
          onRequestMode={setScannerMode}
          currentView={view} 
        />
      )}

      {/* Navbar */}
      <nav className="w-full fixed top-0 z-50 transition-all duration-300 ios-glass-nav" role="navigation">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <button 
            className="flex items-center gap-3 shrink-0 cursor-pointer group focus:outline-none" 
            onClick={() => changeView('home')}
            aria-label="Go to Home"
          >
             <div className="relative w-10 h-10 rounded-xl flex items-center justify-center ios-liquid-btn p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.757-3.257zM10.5 14.25a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5h-1.5v-.75zm.75-1.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm-1.5-3a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
             </div>
             <div className="hidden md:flex flex-col justify-center text-left">
                <span className="font-bold text-lg tracking-tight text-white leading-none mb-0.5">Sentinel <span className="text-zinc-400">AI</span></span>
             </div>
          </button>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <button onClick={() => setShowTour(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white ios-liquid-btn" title="Start Tour" aria-label="Start Onboarding Tour">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
             </button>

             <div className="flex items-center gap-1 p-1 ios-glass-card rounded-full shrink-0 !bg-white/5 !border-white/10">
               <button onClick={() => setFontScale('normal')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${fontScale === 'normal' ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`} aria-label="Normal Font Size">A</button>
               <button onClick={() => setFontScale('large')} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${fontScale === 'large' ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`} aria-label="Large Font Size">A+</button>
               <button onClick={() => setFontScale('xl')} className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all ${fontScale === 'xl' ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`} aria-label="Extra Large Font Size">A++</button>
               <div className="w-px h-4 bg-white/10 mx-1"></div>
               <button onClick={() => setHighContrast(!highContrast)} className={`px-3 h-8 rounded-full flex items-center gap-1 text-xs font-bold transition-all ${highContrast ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`} aria-label="Toggle Contrast">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                 <span>Contrast</span>
               </button>
             </div>
          </div>
        </div>
      </nav>

      <div className="h-24" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-12 md:space-y-16 pt-8 relative flex-grow w-full" role="main">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center pb-8 w-full scroll-mt-48" id="tour-nav-tabs">
           <div 
             ref={navRef}
             onMouseMove={handleNavMouseMove}
             onMouseEnter={() => setIsNavHovered(true)}
             onMouseLeave={() => setIsNavHovered(false)}
             className={`relative flex items-center gap-1 p-1.5 rounded-2xl md:rounded-full ios-glass-card overflow-hidden`}
           >
             <div 
               className={`pointer-events-none absolute top-0 left-0 w-[200px] h-[200px] z-0 transition-opacity duration-300 ${isNavHovered ? 'opacity-100' : 'opacity-0'}`}
               style={{
                 background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                 transform: 'translate(calc(var(--mouse-x, -100px) - 50%), calc(var(--mouse-y, -100px) - 50%))'
               }}
             />
             {['home', 'dashboard', 'vault'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => changeView(tab as ViewMode)}
                 className={`relative px-4 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex-1 md:flex-none text-center z-10 ${
                    view === tab 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'text-zinc-400 hover:text-white'
                 }`}
               >
                 {tab === 'home' ? 'Scanner' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
              
              <div id="tour-mode-toggle" className="flex justify-center mb-[-2rem] relative z-20 scroll-mt-48">
                  <div className="flex bg-black/80 p-1.5 rounded-full border border-white/10 backdrop-blur-xl relative shadow-2xl">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] ${scannerMode === 'MESSAGE' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
                    
                    <button onClick={() => setScannerMode('MESSAGE')} className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${scannerMode === 'MESSAGE' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      Message Scanner
                    </button>
                    <button onClick={() => setScannerMode('THREAT_HUNTER')} className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${scannerMode === 'THREAT_HUNTER' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                      Threat Hunter
                    </button>
                  </div>
              </div>

              {scannerMode === 'THREAT_HUNTER' && <div id="threat-hunter-section" className="scroll-mt-40 transform-gpu"><ThreatHunter onToast={triggerToast} /></div>}

              {scannerMode === 'MESSAGE' && (
              <>
                <div id="tour-input-area" className="scroll-mt-48 block w-full" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group">
                      <div className="ios-glass-card rounded-[2.5rem] p-6 md:p-12 transition-all duration-500">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 px-2 gap-4">
                            <h2 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
                              <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                              </span> 
                              Risk Analysis Engine
                            </h2>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowTour(true); }} 
                                  className="flex-1 md:flex-none text-sm font-bold text-white px-4 py-2 rounded-full ios-liquid-btn flex items-center justify-center gap-2 appearance-none !bg-zinc-900/80 md:!bg-transparent border border-white/10"
                                  aria-label="Start Guide"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                  <span>Guide</span>
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setIsSoundEnabled(!isSoundEnabled); initAudio(); }} 
                                  className={`flex-1 md:flex-none text-sm font-bold px-4 py-2 rounded-full flex items-center justify-center gap-2 ios-liquid-btn appearance-none ${isSoundEnabled ? '!bg-white !text-black !shadow-none !border-transparent' : 'text-white !bg-zinc-900/80 md:!bg-transparent border-white/10'}`}
                                  aria-label="Toggle Sound"
                                >
                                  {isSoundEnabled ? <span>Sound On</span> : <span>Sound Off</span>}
                                </button>
                                <button 
                                  onClick={() => {setInputText(''); setResult(null);}} 
                                  className="flex-1 md:flex-none text-sm font-bold text-white px-5 py-2 rounded-full ios-liquid-btn appearance-none !bg-zinc-900/80 md:!bg-transparent border border-white/10"
                                  aria-label="Clear Text"
                                >
                                  Clear
                                </button>
                            </div>
                          </div>

                          <div className="relative rounded-3xl overflow-hidden">
                            <label htmlFor="scam-input" className="sr-only">Paste suspicious message here</label>
                            {/* Updated Input: Force appearance-none and dark background on mobile */}
                            <textarea 
                              id="scam-input" 
                              value={inputText} 
                              onFocus={handleInteraction} 
                              onChange={(e) => setInputText(e.target.value)} 
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleManualAnalyze(); } }} 
                              placeholder="Paste a suspicious WhatsApp message here..." 
                              className="ios-glass-input w-full min-h-[14rem] h-56 rounded-3xl p-6 md:p-8 pb-24 text-lg md:text-2xl leading-relaxed text-white placeholder:text-zinc-600 focus:outline-none resize-none font-light appearance-none !bg-zinc-900/80 md:!bg-transparent" 
                              spellCheck={false} 
                            />
                            
                            {isAnalyzing && (
                              <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-20">
                                <div className="w-full h-[3px] bg-white shadow-[0_0_30px_rgba(255,255,255,1)] absolute animate-scan opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent animate-pulse" />
                              </div>
                            )}

                            <div className={`absolute bottom-6 left-6 pointer-events-none transition-all duration-500 ${inputText.length > 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                              <span className="hidden md:block text-zinc-500 text-xs font-medium tracking-widest px-2">SECURE LOCAL ENCLAVE</span>
                            </div>
                            
                            <div className="absolute bottom-6 right-6 flex items-center gap-4 z-30">
                              {isAnalyzing ? (
                                <div className="flex flex-col gap-1.5 px-5 py-3 rounded-2xl bg-black border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.15)] min-w-[200px]">
                                  <div className="flex justify-between items-center">
                                      <span className="text-white text-xs font-bold tracking-widest flex items-center gap-2"><Spinner /> ANALYZING</span>
                                      <span className="text-zinc-500 text-[10px] font-mono">AI-ENGINE</span>
                                    </div>
                                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                                      <div className="absolute inset-y-0 left-0 bg-white h-full rounded-full animate-fill w-full" />
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={handleManualAnalyze} 
                                  className={`px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 text-sm md:text-base tracking-wide transition-all transform appearance-none ${
                                    inputText.length > 0 
                                      ? 'bg-white text-black hover:bg-zinc-200 hover:scale-105 cursor-pointer' 
                                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                                  }`}
                                >
                                  SCAN
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
                                </button>
                              )}
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
      
      <footer className="mt-auto pt-24 pb-12 border-t border-white/5 bg-[#050505]/80 backdrop-blur-xl" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => changeView('home')}>
              <div className="w-6 h-6 rounded bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.757-3.257zM10.5 14.25a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5h-1.5v-.75zm.75-1.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm-1.5-3a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-white tracking-tight">Sentinel AI</span>
           </div>
           
           <div className="flex gap-8 relative p-4 rounded-full">
             {['Privacy', 'Terms', 'Contact'].map((item) => (
                <button key={item} onClick={() => changeView(item.toLowerCase() as ViewMode)} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative z-10">{item}</button>
             ))}
           </div>
           
           <div className="text-center md:text-right space-y-1">
             <div className="text-xs text-zinc-400">Created by <span className="text-zinc-300">Rajarshi Chakraborty</span></div>
             <div className="text-xs text-zinc-400 flex items-center justify-center md:justify-end gap-2">
               <span>Bangalore, India</span>
               <span>•</span>
               <a href="mailto:rajarshi7474@gmail.com" className="hover:text-white transition-colors">rajarshi7474@gmail.com</a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
