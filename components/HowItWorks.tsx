import React from 'react';
import { RevealOnScroll } from './RevealOnScroll';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: '01',
      title: 'Neural Ingestion',
      subtitle: 'Input Processing',
      desc: 'The message is securely ingested into a local sandboxed environment. Personal identifiers (PII) like names and numbers are masked instantly to ensure zero-data leakage.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
      color: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20'
    },
    {
      id: '02',
      title: 'Pattern Matching',
      subtitle: 'Threat Detection',
      desc: 'Our engine scans for 1,000+ known phishing signatures, malicious URL structures, and specific linguistic patterns used in high-risk financial fraud scenarios.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      color: 'from-purple-500/20 via-pink-500/20 to-purple-500/20'
    },
    {
      id: '03',
      title: 'Cognitive Analysis',
      subtitle: 'Psychological AI',
      desc: 'Heuristic models evaluate emotional triggers: artificial urgency, fear induction, and authority impersonation designed to bypass your critical thinking.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      ),
      color: 'from-amber-500/20 via-orange-500/20 to-amber-500/20'
    },
    {
      id: '04',
      title: 'Risk Scoring',
      subtitle: 'Final Verdict',
      desc: 'A weighted algorithm calculates a precise threat probability score (0-100) and generates actionable, context-aware defense strategies for you.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      color: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20'
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden" aria-label="How Sentinel Works">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-morph" />
         <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full animate-morph" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-20 space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4">
              System Architecture
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Inside the <span className="hero-gradient">Sentinel Engine</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              We combine static signature matching with behavioral AI to detect sophisticated social engineering attacks in real-time.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[35%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          {steps.map((step, index) => (
            <RevealOnScroll key={index} delay={index * 150} className="h-full">
              <div className="group relative h-full">
                
                {/* Connecting Dot (Desktop) */}
                <div className="hidden lg:block absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#050505] border border-white/20 z-10 group-hover:border-cyan-400 group-hover:bg-cyan-500 transition-all duration-500" />

                <div className={`glass-morphism p-8 rounded-[2rem] h-full relative border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-[#0a0a0f]/60 overflow-hidden`}>
                  
                  {/* Hover Liquid Gradient Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-flow bg-[length:200%_200%]`} />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors font-sans select-none">
                        {step.id}
                      </span>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:bg-white/10 relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-flow bg-[length:200%_200%]" />
                         <span className="relative z-10">{step.icon}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 flex-grow">
                      <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest opacity-80">
                        {step.subtitle}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-100 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light group-hover:text-slate-300">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};