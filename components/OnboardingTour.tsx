
import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom';
  requiredView?: string;
  requiredMode?: 'MESSAGE' | 'THREAT_HUNTER';
}

interface Props {
  onComplete: () => void;
  onRequestView: (view: any) => void;
  onRequestMode?: (mode: 'MESSAGE' | 'THREAT_HUNTER') => void;
  currentView: string;
}

export const OnboardingTour: React.FC<Props> = ({ onComplete, onRequestView, onRequestMode, currentView }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Responsive States
  const [isMobile, setIsMobile] = useState(false); // Phones (< 768px)
  const [enableBlur, setEnableBlur] = useState(false); // High Performance Desktop (>= 1280px)
  
  // Refs for direct DOM manipulation (High Performance)
  const spotlightRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const steps: TourStep[] = [
    {
      targetId: 'center',
      title: 'Welcome to Sentinel AI',
      description: 'Your enterprise-grade personal security engine. Let\'s quickly show you how to detect threats while keeping your data private.',
      position: 'bottom'
    },
    {
      targetId: 'tour-nav-tabs',
      title: 'Command Center',
      description: 'Switch between the Scanner, your History Dashboard, and the Scam Vault using this liquid navigation bar.',
      position: 'bottom',
      requiredView: 'home'
    },
    {
      targetId: 'tour-mode-toggle',
      title: 'Choose Your Engine',
      description: 'Switch between the Message Scanner (for WhatsApp text) and the new Threat Hunter (for checking IP addresses and Links).',
      position: 'bottom',
      requiredView: 'home'
    },
    {
      targetId: 'tour-input-area',
      title: 'Message Analysis',
      description: 'Paste suspicious text here. Our AI engine analyzes linguistic patterns to detect scams instantly.',
      position: 'top', 
      requiredView: 'home',
      requiredMode: 'MESSAGE'
    },
    {
      targetId: 'threat-input',
      title: 'Threat Hunter',
      description: 'Enter an IP address (like 1.1.1.1) or a Website URL here. We will cross-check it against global security databases.',
      position: 'top',
      requiredView: 'home',
      requiredMode: 'THREAT_HUNTER'
    },
    {
      targetId: 'center',
      title: 'You are Ready',
      description: 'Sentinel AI is now active. Stay vigilant and remember: if something feels off, scan it here first.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setEnableBlur(width >= 1280);
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Robustly find element and ensure it is rendered (has dimensions)
  const waitForElement = (id: string, retries = 0): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const check = () => {
        const el = document.getElementById(id);
        // Check if element exists AND is painted (has dimension)
        if (el && el.offsetHeight > 0) {
          resolve(el);
        } else if (retries < 60) { // Retry for up to 3s
          setTimeout(() => check(), 50);
          retries++;
        } else {
          resolve(null);
        }
      };
      check();
    });
  };

  // High-performance update loop (60 FPS)
  const updatePosition = () => {
    const step = steps[currentStep];
    const spotlight = spotlightRef.current;
    const tooltip = tooltipRef.current;

    if (!spotlight || !tooltip) return;

    // --- 1. DETERMINE TARGET RECT (Viewport Relative) ---
    let targetRect: DOMRect | { top: number, left: number, width: number, height: number, bottom: number, right: number };
    let hasElement = false;

    if (step.targetId === 'center') {
        targetRect = {
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
            width: 0,
            height: 0,
            bottom: window.innerHeight / 2,
            right: window.innerWidth / 2
        };
    } else {
        const el = document.getElementById(step.targetId);
        if (el) {
            targetRect = el.getBoundingClientRect();
            hasElement = true;
        } else {
            // Fallback to center if element lost
            targetRect = {
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                width: 0,
                height: 0,
                bottom: window.innerHeight / 2,
                right: window.innerWidth / 2
            };
        }
    }

    // --- 2. UPDATE SPOTLIGHT (Fixed to Viewport) ---
    if (step.targetId === 'center' || !hasElement) {
        spotlight.style.opacity = '0';
        spotlight.style.transform = 'scale(0.9)';
    } else {
        spotlight.style.opacity = '1';
        spotlight.style.transform = 'scale(1)';
        spotlight.style.position = 'fixed'; 
        
        const padding = 8;
        spotlight.style.top = `${targetRect.top - padding}px`; 
        spotlight.style.left = `${targetRect.left - padding}px`;
        spotlight.style.width = `${targetRect.width + (padding*2)}px`;
        spotlight.style.height = `${targetRect.height + (padding*2)}px`;
    }

    // --- 3. UPDATE TOOLTIP POSITION (Fixed Viewport) ---
    tooltip.style.position = 'fixed';
    
    if (isMobile) {
      // PHONE STRATEGY: Fixed Bottom Sheet
      tooltip.style.bottom = '24px'; 
      tooltip.style.top = 'auto'; 
      tooltip.style.left = '16px';
      tooltip.style.right = '16px';
      tooltip.style.transform = 'none';
      tooltip.style.width = 'auto';
      tooltip.style.maxWidth = 'none';
      
    } else {
      // TABLET & DESKTOP STRATEGY: Fluid Floating Tooltip
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      
      const maxTooltipW = Math.min(450, viewportW - 32);
      const tooltipH = tooltip.offsetHeight || 200;
      
      const gap = 20;
      const navbarBuffer = 90;

      let left = targetRect.left + (targetRect.width / 2) - (maxTooltipW / 2);
      if (left < 16) left = 16;
      if (left + maxTooltipW > viewportW - 16) left = viewportW - maxTooltipW - 16;

      const spaceAbove = targetRect.top - navbarBuffer - gap;
      const spaceBelow = viewportH - targetRect.bottom - gap;

      let top = 0;
      const preferTop = step.position === 'top';
      const fitsTop = spaceAbove >= tooltipH;
      const fitsBottom = spaceBelow >= tooltipH;

      if (preferTop) {
          if (fitsTop) {
              top = targetRect.top - tooltipH - gap;
          } else if (fitsBottom) {
              top = targetRect.bottom + gap;
          } else {
              top = spaceAbove > spaceBelow ? navbarBuffer : targetRect.bottom + gap;
          }
      } else {
          if (fitsBottom) {
              top = targetRect.bottom + gap;
          } else if (fitsTop) {
              top = targetRect.top - tooltipH - gap;
          } else {
              top = spaceBelow > spaceAbove ? targetRect.bottom + gap : navbarBuffer;
          }
      }

      if (top < navbarBuffer) top = navbarBuffer;
      if (top + tooltipH > viewportH - 10) top = viewportH - tooltipH - 10;

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.width = `${maxTooltipW}px`;
      tooltip.style.maxWidth = 'none';
      tooltip.style.bottom = 'auto';
      tooltip.style.right = 'auto';
      tooltip.style.transform = 'none';
    }
  };

  useEffect(() => {
    const initStep = async () => {
        const step = steps[currentStep];
        
        if (currentStep > 0) setIsVisible(false);

        // 1. View Switch
        if (step.requiredView && currentView !== step.requiredView) {
            onRequestView(step.requiredView);
            await new Promise(r => setTimeout(r, 600)); 
        }

        // 2. Mode Switch (Message vs Threat Hunter)
        if (step.requiredMode && onRequestMode) {
            onRequestMode(step.requiredMode);
            await new Promise(r => setTimeout(r, 600));
        }

        // 3. Scroll (Manual Precise Implementation)
        if (step.targetId !== 'center') {
            await new Promise(r => setTimeout(r, 300));

            const el = await waitForElement(step.targetId);
            if (el) {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                
                const rect = el.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const elementTop = rect.top + scrollTop;
                
                let offset = 0;
                
                if (isMobile) {
                    offset = 110; 
                } else {
                    const viewportHeight = window.innerHeight;
                    offset = (viewportHeight / 2) - (rect.height / 2);
                }

                const targetScroll = Math.max(0, elementTop - offset);

                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });

                await new Promise(r => setTimeout(r, 800));
            }
        }

        setIsVisible(true);
    };

    initStep();

    const loop = () => {
       updatePosition();
       requestRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [currentStep, currentView, isMobile]); 

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const step = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[5000] transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Dimmed Backdrop */}
      <div className={`absolute inset-0 bg-[#050505]/80 transition-all duration-500 ${enableBlur ? 'backdrop-blur-sm' : ''}`} />

      {/* Spotlight Highlighter */}
      <div 
        ref={spotlightRef}
        className="border-2 border-cyan-400 rounded-[2rem] shadow-[0_0_60px_rgba(6,182,212,0.4),inset_0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 ease-out pointer-events-none opacity-0 z-[5001] animate-pulse will-change-transform"
      />

      {/* Tooltip Card */}
      <div 
        ref={tooltipRef}
        className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-[5002]"
        style={{ opacity: 1 }}
      >
        <div className="glass-morphism p-6 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden bg-[#0a0a0f]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-transparent animate-flow bg-[length:200%_200%]" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded-full bg-cyan-900/20">
                Step {currentStep + 1} / {steps.length}
              </span>
              <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors p-1" aria-label="Skip Tour">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <h3 className="text-lg md:text-2xl font-bold text-white mb-2 tracking-tight">{step.title}</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-light border-l-2 border-white/10 pl-4">
              {step.description}
            </p>

            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                 {steps.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'bg-cyan-400 w-6 md:w-8 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-white/10 w-2'}`} 
                   />
                 ))}
               </div>

               <button 
                 onClick={handleNext}
                 className="px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs md:text-sm transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
               >
                 {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
