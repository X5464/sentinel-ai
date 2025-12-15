
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
  const [isMobile, setIsMobile] = useState(false);
  
  const spotlightRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      targetId: 'center',
      title: 'Welcome to Sentinel AI',
      description: 'Your enterprise-grade personal security engine. Let\'s secure your digital footprint.',
      position: 'bottom'
    },
    {
      targetId: 'tour-nav-tabs',
      title: 'Command Center',
      description: 'Switch between the Scanner, History Dashboard, and Threat Vault.',
      position: 'bottom',
      requiredView: 'home'
    },
    {
      targetId: 'tour-mode-toggle',
      title: 'Select Engine',
      description: 'Toggle between scanning Message Text and the Threat Hunter (IP/URL scanner).',
      position: 'bottom',
      requiredView: 'home'
    },
    {
      targetId: 'tour-input-area',
      title: 'Analysis Engine',
      description: 'Paste suspicious content here. Our AI detects linguistic triggers and fraud patterns.',
      position: 'top', 
      requiredView: 'home',
      requiredMode: 'MESSAGE'
    },
    {
      targetId: 'threat-input',
      title: 'Threat Hunter',
      description: 'Enter an IP or URL to cross-reference with global blacklists.',
      position: 'top',
      requiredView: 'home',
      requiredMode: 'THREAT_HUNTER'
    },
    {
      targetId: 'center',
      title: 'System Active',
      description: 'You are ready. Stay vigilant.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Optimized: Check DOM existence efficiently without forcing layout reflows repeatedly
  const waitForElement = (id: string, retries = 0): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const check = () => {
        const el = document.getElementById(id);
        // Only check dimensions if element exists, and use requestAnimationFrame to batch reading
        if (el) {
            resolve(el);
        } else if (retries < 30) { 
          // Use requestAnimationFrame for smoother checking tied to refresh rate
          requestAnimationFrame(() => waitForElement(id, retries + 1).then(resolve));
        } else {
          resolve(null);
        }
      };
      check();
    });
  };

  const updatePosition = () => {
    const step = steps[currentStep];
    const spotlight = spotlightRef.current;
    const tooltip = tooltipRef.current;

    if (!spotlight || !tooltip) return;

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

    // UPDATE SPOTLIGHT
    // Batch DOM writes
    if (step.targetId === 'center' || !hasElement) {
        spotlight.style.opacity = '0';
        spotlight.style.transform = 'scale(0.9)';
    } else {
        spotlight.style.opacity = '1';
        spotlight.style.transform = 'scale(1)';
        const padding = 10;
        spotlight.style.top = `${targetRect.top - padding}px`; 
        spotlight.style.left = `${targetRect.left - padding}px`;
        spotlight.style.width = `${targetRect.width + (padding*2)}px`;
        spotlight.style.height = `${targetRect.height + (padding*2)}px`;
    }

    // UPDATE TOOLTIP
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const tooltipW = Math.min(340, viewportW - 32); 
    
    // Default: Center
    let left = (viewportW / 2) - (tooltipW / 2);
    let top = (viewportH / 2) + 60;

    if (step.targetId !== 'center' && hasElement) {
       const spaceBelow = viewportH - targetRect.bottom;
       const spaceAbove = targetRect.top;
       
       if (spaceBelow > 200 || spaceBelow > spaceAbove) {
          top = targetRect.bottom + 24;
       } else {
          top = targetRect.top - 180; 
       }
       
       // Clamp vertical
       if (top < 80) top = 80;
       if (top > viewportH - 200) top = viewportH - 200;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.width = `${tooltipW}px`;
  };

  useEffect(() => {
    const initStep = async () => {
        const step = steps[currentStep];
        
        if (currentStep > 0) setIsVisible(false);

        if (step.requiredView && currentView !== step.requiredView) {
            onRequestView(step.requiredView);
            // Longer wait for view transition to settle
            await new Promise(r => setTimeout(r, 600)); 
        }
        if (step.requiredMode && onRequestMode) {
            onRequestMode(step.requiredMode);
            await new Promise(r => setTimeout(r, 600));
        }

        if (step.targetId !== 'center') {
            const el = await waitForElement(step.targetId);
            if (el) {
                // Use smooth scroll but don't block
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Wait a frame for layout to settle before showing
        requestAnimationFrame(() => {
            updatePosition();
            setIsVisible(true);
        });
    };

    initStep();

    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
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
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-all duration-500" />

      {/* Spotlight Ring */}
      <div 
        ref={spotlightRef}
        className="fixed border-2 border-white/50 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out pointer-events-none opacity-0 z-[5001]"
      />

      {/* Tooltip Card - Updated to use Liquid Glass style */}
      <div 
        ref={tooltipRef}
        className="fixed transition-all duration-500 ease-out z-[5002]"
        style={{ opacity: 1 }}
      >
        <div className="ios-glass-card p-6 rounded-[2rem] border border-white/20 bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full bg-white/5">
                Step {currentStep + 1} / {steps.length}
              </span>
              <button 
                onClick={handleClose} 
                className="text-zinc-300 hover:text-white transition-colors p-1" 
                aria-label="Close tour"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h3>
            <p className="text-zinc-100/90 text-sm leading-relaxed mb-6 font-normal">
              {step.description}
            </p>

            <div className="flex justify-between items-center">
               <div className="flex gap-1.5">
                 {steps.map((_, idx) => (
                   <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-white w-6' : 'bg-zinc-600 w-1.5'}`} />
                 ))}
               </div>

               <button 
                 onClick={handleNext}
                 className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
                 aria-label={currentStep === steps.length - 1 ? 'Finish tour' : 'Next step'}
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
