import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Privacy <span className="text-cyan-400">Policy</span></h2>
        <p className="text-slate-400">Your data never leaves your device.</p>
      </div>

      <div className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">1. Zero-Data Collection</h3>
          <p className="text-slate-400 leading-relaxed">
            Sentinel AI is architected with a "Local-First" philosophy. When you paste a message for analysis, the processing happens entirely within your web browser using JavaScript. No text data is ever transmitted to external servers, cloud databases, or third-party analytics platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">2. Local Storage</h3>
          <p className="text-slate-400 leading-relaxed">
            Your scan history and dashboard statistics are stored using your browser's <code className="text-cyan-400 bg-cyan-900/20 px-1 py-0.5 rounded">LocalStorage</code> API. This data resides physically on your device. Clearing your browser cache or clicking the "Clear History" button in the dashboard permanently deletes this data.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-bold text-white">3. No PII Tracking</h3>
          <p className="text-slate-400 leading-relaxed">
            We do not use cookies for tracking, advertising pixels, or fingerprinting technologies. The application functions without requiring any user account, email login, or phone number registration.
          </p>
        </section>
      </div>
    </div>
  );
};