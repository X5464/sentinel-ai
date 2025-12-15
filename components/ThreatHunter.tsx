
import React, { useState, useEffect } from 'react';
import { ThreatScanResult, RiskLevel } from '../types';

interface Props {
  onToast?: (message: string) => void;
}

export const ThreatHunter: React.FC<Props> = ({ onToast }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreatScanResult | null>(null);
  const [error, setError] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:10000'); // Default Render Port
  const [showSettings, setShowSettings] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_backend_url');
    if (saved) setBackendUrl(saved);
    checkConnection(saved || 'http://localhost:10000');
  }, []);

  const checkConnection = async (url: string) => {
    try {
      const res = await fetch(`${url}/`);
      if (res.ok) setBackendStatus('online');
      else setBackendStatus('offline');
    } catch (e) {
      setBackendStatus('offline');
    }
  };

  const saveBackend = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem('sentinel_backend_url', url);
    checkConnection(url);
  };

  // Auto-detect type based on simple IP regex (IPv4)
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(input.trim());
  const detectedType = input.trim() === '' ? '...' : isIp ? 'Target: IP Address' : 'Target: URL / Domain';

  // --- REPORT GENERATOR (Elderly Friendly Logic) ---
  const generateThreatReport = (
    baseResult: Omit<ThreatScanResult, 'level' | 'summary' | 'recommendations'>
  ): ThreatScanResult => {
    const score = baseResult.riskScore;
    let level = RiskLevel.SAFE;
    let summary = "This target appears clean and safe to use.";
    let recommendations: string[] = [];

    // Determine Risk Level
    if (score >= 90) level = RiskLevel.CRITICAL;
    else if (score >= 50) level = RiskLevel.HIGH;
    else if (score >= 20) level = RiskLevel.MEDIUM;
    else if (score > 0) level = RiskLevel.LOW;

    // Generate Summary & Recommendations
    if (baseResult.type === 'IP') {
      if (level === RiskLevel.CRITICAL || level === RiskLevel.HIGH) {
        summary = `DANGER: This IP address is highly malicious. It has been reported ${baseResult.details.reports} times for cyber-attacks.`;
        recommendations = [
          "BLOCK this IP address immediately in your firewall.",
          "Do not click any links coming from this source.",
          "If this IP tried to login to your account, change your passwords now."
        ];
      } else if (level === RiskLevel.MEDIUM) {
        summary = `Caution: This IP has some suspicious activity reported. It might be a spam server.`;
        recommendations = [
          "Be careful if you received emails from this address.",
          "Monitor for any further suspicious activity."
        ];
      } else {
        summary = `This IP address looks safe. It belongs to ${baseResult.details.isp}.`;
        recommendations = ["No action needed currently."];
      }
    } else {
      // URL Logic
      if (level === RiskLevel.CRITICAL || level === RiskLevel.HIGH) {
        summary = `CRITICAL THREAT: ${baseResult.details.maliciousCount} security vendors confirmed this is a malicious website.`;
        recommendations = [
          "DO NOT CLICK this link.",
          "Do not enter any passwords or personal details.",
          "If you already clicked it, disconnect your device from the internet and run a virus scan."
        ];
      } else if (level === RiskLevel.MEDIUM) {
        summary = `Suspicious Website. Some security engines flagged it, but others say it's clean.`;
        recommendations = [
          "Avoid visiting this site if possible.",
          "Do not download any files from this page."
        ];
      } else {
        summary = "This website appears safe. Major security vendors found no threats.";
        recommendations = ["Proceed, but always double-check the URL spelling."];
      }
    }

    return {
      ...baseResult,
      level,
      summary,
      recommendations
    };
  };

  const mockScan = (target: string, type: 'IP' | 'URL'): ThreatScanResult => {
    // Generate realistic mock data for preview purposes
    let base: any;
    if (type === 'IP') {
        base = {
            type: 'IP',
            target: target,
            riskScore: 85,
            verdict: 'Malicious',
            provider: 'AbuseIPDB',
            details: {
                isp: 'DigitalOcean, LLC',
                country: 'CN',
                domain: target,
                reports: 142,
                lastReport: new Date().toISOString()
            }
        };
    } else {
        base = {
            type: 'URL',
            target: target,
            riskScore: 92,
            verdict: 'Malicious',
            provider: 'VirusTotal',
            details: {
                maliciousCount: 4,
                engineCount: 88,
                domain: target.replace(/^https?:\/\//, ''),
                vendorAnalysis: [
                    { engine: 'Google Safebrowsing', result: 'Phishing', category: 'malicious' },
                    { engine: 'PhishTank', result: 'Phishing', category: 'malicious' },
                    { engine: 'Microsoft', result: 'Clean', category: 'harmless' },
                    { engine: 'BitDefender', result: 'Malicious', category: 'malicious' },
                    { engine: 'Sophos', result: 'Clean', category: 'harmless' },
                    { engine: 'OpenPhish', result: 'Malware', category: 'malicious' },
                    { engine: 'Kaspersky', result: 'Clean', category: 'harmless' },
                    { engine: 'Cloudflare', result: 'Clean', category: 'harmless' },
                ]
            }
        };
    }
    return generateThreatReport(base);
  };

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setIsSimulation(false);

    // Determine mode based on detection
    const mode = isIp ? 'IP' : 'URL';

    try {
      let endpoint = mode === 'IP' ? '/api/scan-ip' : '/api/scan-url';
      let body = mode === 'IP' ? { ip: input.trim() } : { url: input.trim() };

      // Append protocol if missing for URL
      if (mode === 'URL' && !/^https?:\/\//i.test(body.url as string)) {
        body.url = 'http://' + body.url;
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Server connection failed.');

      const data = await response.json();
      let rawResult: any;

      // Transform Data
      if (mode === 'IP') {
        const d = data.data;
        rawResult = {
          type: 'IP',
          target: d.ipAddress,
          riskScore: d.abuseConfidenceScore,
          verdict: d.abuseConfidenceScore > 50 ? 'Malicious' : d.abuseConfidenceScore > 0 ? 'Suspicious' : 'Safe',
          provider: 'AbuseIPDB',
          details: {
            isp: d.isp,
            country: d.countryCode,
            domain: d.domain,
            reports: d.totalReports,
            lastReport: d.lastReportedAt
          }
        };
      } else {
        // VirusTotal Logic
        const attr = data.data?.attributes;
        if (!attr) {
             setError("Scan initiated! Check VirusTotal.");
             window.open(`https://www.virustotal.com/gui/url/${data.scanId}`, '_blank');
             setLoading(false);
             return;
        }
        
        const stats = attr.last_analysis_stats;
        const malicious = stats.malicious + stats.suspicious;
        const total = Object.values(stats).reduce((a:any, b:any) => a + b, 0) as number;
        
        // Granular Vendor Analysis
        const analysisResults = attr.last_analysis_results || {};
        const keyVendors = ['Google Safebrowsing', 'PhishTank', 'Microsoft', 'OpenPhish', 'Sophos'];
        
        const flaggedVendors = Object.values(analysisResults)
            .filter((v: any) => v.category === 'malicious' || v.category === 'suspicious')
            .map((v: any) => ({ engine: v.engine_name, result: v.result, category: v.category }));

        const reputableVendors = Object.values(analysisResults)
            .filter((v: any) => keyVendors.includes(v.engine_name) && v.category !== 'malicious' && v.category !== 'suspicious')
            .map((v: any) => ({ engine: v.engine_name, result: v.result, category: v.category }));

        const displayVendors = [...flaggedVendors, ...reputableVendors].slice(0, 8); 
        
        rawResult = {
          type: 'URL',
          target: input,
          riskScore: malicious > 0 ? 100 : 0,
          verdict: malicious > 0 ? 'Malicious' : 'Safe',
          provider: 'VirusTotal',
          details: {
            maliciousCount: malicious,
            engineCount: total,
            domain: attr.url,
            vendorAnalysis: displayVendors
          }
        };
      }
      
      setResult(generateThreatReport(rawResult));
      setBackendStatus('online');

    } catch (err) {
      // FALLBACK: SIMULATION MODE
      console.warn("Backend unavailable. Switching to simulation mode.");
      setBackendStatus('offline');
      if (onToast) onToast("Backend offline. Simulating scan results...");
      setIsSimulation(true);
      
      // Artificial delay for realism
      setTimeout(() => {
          setResult(mockScan(input, mode));
          setLoading(false);
      }, 1500);
      return; // Exit early since we handled it via timeout
    } finally {
      if (!isSimulation) setLoading(false);
    }
  };

  // Helper for color coding
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return 'text-red-500 border-red-500/50 bg-red-500/10';
      case RiskLevel.HIGH: return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case RiskLevel.MEDIUM: return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
      case RiskLevel.LOW: return 'text-teal-400 border-teal-400/50 bg-teal-400/10';
      default: return 'text-green-500 border-green-500/50 bg-green-500/10';
    }
  };

  return (
    <div className="animate-slide-up w-full max-w-4xl mx-auto px-4 md:px-0">
      
      {/* Settings Toggle */}
      <div className="flex justify-end mb-2 items-center gap-4">
        
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${backendStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {backendStatus === 'online' ? 'System Online' : 'Backend Offline'}
            </span>
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
             <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.047 7.047 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Server Config
        </button>
      </div>

      {showSettings && (
         <div className="mb-6 p-6 rounded-xl bg-[#0a0a0f] border border-white/10 animate-slide-up space-y-6">
            <div>
                <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Backend Server URL:</label>
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    value={backendUrl} 
                    onChange={(e) => saveBackend(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none font-mono"
                    placeholder="http://localhost:10000"
                    />
                    <button onClick={() => checkConnection(backendUrl)} className="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Test</button>
                </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                    How to start the server locally:
                </h4>
                <div className="space-y-2 text-xs text-slate-300 font-mono bg-black/40 p-3 rounded border border-white/5">
                    <p className="text-slate-500"># 1. Create a folder and copy server.js into it</p>
                    <p className="text-slate-500"># 2. Open terminal in that folder and run:</p>
                    <p><span className="text-purple-400">npm</span> init -y</p>
                    <p><span className="text-purple-400">npm</span> install express cors axios dotenv</p>
                    <p><span className="text-purple-400">node</span> server.js</p>
                </div>
            </div>
         </div>
      )}

      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-flow" />
         
         <div className="glass-morphism rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden bg-[#0a0a0f]/80">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                 <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                     <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                   </svg>
                 </span>
                 Threat Hunter
               </h2>
               
               {/* Auto-Detection Badge */}
               <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                  <span className={`text-xs font-mono font-bold tracking-wide transition-colors ${isIp ? 'text-blue-400' : 'text-orange-400'}`}>
                    {detectedType}
                  </span>
               </div>
            </div>

            {/* Input Area */}
            <div className="space-y-6">
               <div className="relative">
                 <input 
                   id="threat-input"
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Enter IP (1.1.1.1) or Domain (example.com)..."
                   className="glass-input w-full rounded-2xl p-5 md:p-6 pl-12 md:pl-14 text-lg md:text-xl text-white placeholder:text-slate-600 focus:outline-none transition-all pr-32 md:pr-40"
                   // Removed autoFocus to prevent scroll jumping
                 />
                 <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500">
                    {/* Dynamic Icon based on type */}
                    {isIp ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400/70 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-400/70 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    )}
                 </div>
                 
                 <button 
                   onClick={handleScan}
                   disabled={loading}
                   className="absolute right-2 top-2 bottom-2 md:right-3 md:top-2.5 md:bottom-2.5 px-4 md:px-8 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
                 >
                   {loading ? <span className="animate-spin">⟳</span> : 'SCAN'}
                 </button>
               </div>
            </div>
            
            {/* Error Message */}
            {error && !isSimulation && (
               <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                 <span>{error}</span>
               </div>
            )}
            
            {isSimulation && (
                <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm flex items-center gap-3 animate-slide-up">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.875zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                 <span><strong>Demo Mode:</strong> Backend server is offline. Showing sample data. Check "Server Config" to setup.</span>
               </div>
            )}

            {/* Results Panel */}
            {result && (
              <div className="mt-8 animate-slide-up">
                 <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-8">
                    
                    {/* NEW: Actionable Summary Banner */}
                    <div className={`p-6 rounded-xl border ${getRiskColor(result.level)}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full border ${getRiskColor(result.level)}`}>
                                {result.level === RiskLevel.SAFE ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold uppercase mb-2">{result.verdict}</h3>
                                <p className="text-base font-medium opacity-90">{result.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Section: Score & Basic Info */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Score Ring */}
                        <div className="flex flex-col items-center justify-center min-w-[150px] border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                           <div className="relative w-32 h-32 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                 <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                 <circle 
                                   cx="50" cy="50" r="45" 
                                   stroke={result.riskScore > 50 ? '#ef4444' : result.riskScore > 0 ? '#facc15' : '#10b981'} 
                                   strokeWidth="8" fill="none" 
                                   strokeDasharray="283" 
                                   strokeDashoffset={283 - (result.riskScore/100 * 283)} 
                                   strokeLinecap="round"
                                   className="transition-all duration-1000"
                                 />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-3xl font-bold text-white">{result.riskScore}%</span>
                                 <span className="text-[10px] text-slate-400 uppercase">Risk Score</span>
                              </div>
                           </div>
                        </div>

                        {/* Details Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                           <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Target</p>
                              <p className="text-white font-mono break-all">{result.target}</p>
                           </div>
                           <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Intelligence Source</p>
                              <p className="text-cyan-400 font-bold">{result.provider}</p>
                           </div>
                           
                           {result.type === 'IP' && (
                             <>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">ISP / Organization</p>
                                  <p className="text-white">{result.details.isp || 'Unknown'}</p>
                               </div>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Origin Country</p>
                                  <p className="text-white text-lg flex items-center gap-2">
                                    {result.details.country ? result.details.country : 'N/A'}
                                  </p>
                               </div>
                             </>
                           )}

                           {result.type === 'URL' && (
                             <>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Security Vendors</p>
                                  <p className="text-red-400 font-bold">{result.details.maliciousCount} <span className="text-slate-500 font-normal">flagged out of</span> {result.details.engineCount}</p>
                               </div>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Resolved Domain</p>
                                  <p className="text-white break-all">{result.details.domain || 'N/A'}</p>
                               </div>
                             </>
                           )}
                        </div>
                    </div>

                    {/* NEW: Recommendations */}
                    <div className="mt-4">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recommended Actions</h4>
                         <ul className="space-y-3">
                            {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${result.level === RiskLevel.SAFE ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span>{rec}</span>
                                </li>
                            ))}
                         </ul>
                    </div>

                    {/* VirusTotal Vendor Breakdown (Only for URL) */}
                    {result.type === 'URL' && result.details.vendorAnalysis && result.details.vendorAnalysis.length > 0 && (
                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Security Vendor Breakdown</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {result.details.vendorAnalysis.map((vendor, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                                        <span className="text-slate-300 font-medium truncate pr-2">{vendor.engine}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            vendor.category === 'malicious' || vendor.category === 'suspicious' 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                            {vendor.result}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
              </div>
            )}

         </div>
      </div>
    </div>
  );
};
