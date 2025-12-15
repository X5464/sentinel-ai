
import React from 'react';
import { RevealOnScroll } from './RevealOnScroll';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: '01',
      title: 'Neural Ingestion',
      subtitle: 'Input Processing',
      desc: 'The message is securely ingested into a local sandboxed environment. Personal identifiers (PII) like names and numbers are masked instantly.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      )
    },
    {
      id: '02',
      title: 'Pattern Matching',
      subtitle: 'Threat Detection',
      desc: 'Our engine scans for 1,000+ known phishing signatures, malicious URL structures, and specific linguistic patterns.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )
    },
    {
      id: '03',
      title: 'Cognitive Analysis',
      subtitle: 'Psychological AI',
      desc: 'Heuristic models evaluate emotional triggers: artificial urgency, fear induction, and authority impersonation.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      )
    },
    {
      id: '04',
      title: 'Risk Scoring',
      subtitle: 'Final Verdict',
      desc: 'A weighted algorithm calculates a precise threat probability score (0-100) and generates actionable defense strategies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden" aria-label="How Sentinel Works">
      {/* Static Background for Performance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4">
              System Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Inside the <span className="hero-gradient">Sentinel Engine</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              We combine static signature matching with behavioral AI to detect sophisticated social engineering attacks in real-time.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="group relative h-full">
                {/* Clean, Simple Card to avoid GPU Lag on Mobile */}
                <div className="bg-[#0a0a0f] border border-white/10 p-8 rounded-[2rem] h-full relative overflow-hidden transition-colors duration-300 hover:bg-white/5">
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-5xl font-bold text-white/5 font-sans select-none">
                        {step.id}
                      </span>
                      {/* Forced Visibility on Icon Container */}
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-lg relative z-20">
                         {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 flex-grow">
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest opacity-90">
                        {step.subtitle}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {step.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
