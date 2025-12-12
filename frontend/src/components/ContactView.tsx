
import React, { useState } from 'react';

export const ContactView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "rajarshi7474@gmail.com";

  const handleCopy = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent navigating if this was inside an anchor, though we will separate them
    e.stopPropagation();
    e.preventDefault();
    
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Contact <span className="text-cyan-400">Us</span></h2>
        <p className="text-slate-400">Get in touch with the developer.</p>
      </div>

      <div className="glass-morphism p-8 md:p-12 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-2xl mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
           </svg>
        </div>

        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-bold text-white">Rajarshi Chakraborty</h3>
          <p className="text-cyan-400 font-medium">Lead Developer</p>
        </div>

        <div className="space-y-4 w-full max-w-md relative z-10">
           {/* Email Container - Split into link and copy button */}
           <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 group relative">
             <a 
                href={`mailto:${email}`} 
                className="flex items-center gap-4 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] rounded-lg"
                aria-label={`Send an email to ${email}`}
             >
               <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors" aria-hidden="true">
                 @
               </div>
               <div className="text-left">
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Email</p>
                 <p className="text-white group-hover:text-cyan-300 transition-colors">{email}</p>
               </div>
             </a>

             <button 
               onClick={handleCopy}
               className="p-2.5 rounded-lg bg-white/5 hover:bg-white/20 text-slate-400 hover:text-cyan-400 border border-white/5 transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
               aria-label={copied ? "Email copied to clipboard" : "Copy email address to clipboard"}
               title="Copy Email Address"
             >
               {copied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400" aria-hidden="true">
                   <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                 </svg>
               )}
               
               {/* Copied Tooltip */}
               <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded shadow-[0_0_15px_rgba(6,182,212,0.6)] whitespace-nowrap transition-all duration-300 pointer-events-none ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} role="status" aria-live="polite">
                 Copied!
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rotate-45"></div>
               </div>
             </button>
           </div>

           <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all">
             <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
             </div>
             <div className="text-left">
               <p className="text-xs text-slate-500 uppercase tracking-widest">Location</p>
               <p className="text-white">Bangalore, India</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};