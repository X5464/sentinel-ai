import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Terms of <span className="text-cyan-400">Service</span></h2>
        <p className="text-slate-400">Usage guidelines and disclaimers.</p>
      </div>

      <div className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">1. Nature of Service</h3>
          <p className="text-slate-400 leading-relaxed">
            Sentinel AI is an informational tool designed to assist in identifying common patterns associated with digital scams. It uses heuristic algorithms and pattern matching. It is <strong className="text-white">not</strong> a definitive guarantee of safety or danger.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">2. Disclaimer of Liability</h3>
          <p className="text-slate-400 leading-relaxed">
            By using this tool, you acknowledge that the creator (Rajarshi Chakraborty) and any contributors are not liable for any financial losses, data breaches, or damages resulting from your decisions. Always verify sensitive requests through official channels (e.g., calling your bank directly).
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">3. "As-Is" Provision</h3>
          <p className="text-slate-400 leading-relaxed">
            The software is provided "as is", without warranty of any kind, express or implied. Updates to the scam database are made periodically but may not cover every emerging threat immediately.
          </p>
        </section>
      </div>
    </div>
  );
};