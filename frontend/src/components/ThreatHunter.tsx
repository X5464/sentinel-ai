
import React, { useState, useEffect } from 'react';
import { ThreatScanResult, RiskLevel } from '../types';

interface Props {
  onToast?: (message: string, type?: 'info' | 'error' | 'success') => void;
}

// Reusable SVG Spinner specific for ThreatHunter
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const ThreatHunter: React.FC<Props> = ({ onToast }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreatScanResult | null>(null);
  const [error, setError] = useState('');
  
  // LOGIC CHANGE: Check for Environment Variable first, then localhost
  const DEFAULT_BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
  
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND);
  const [showSettings, setShowSettings] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showAllVendors, setShowAllVendors] = useState(false);
  
  // Cold Start UX State
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_backend_url');
    // Priority: 1. Manual Save (if any) -> 2. Render Env Var -> 3. Localhost
    const url = saved || DEFAULT_BACKEND;
    
    // Remove trailing slash if present to avoid //api double slash issues
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    setBackendUrl(cleanUrl);
    checkConnection(cleanUrl);
  }, []);

  // Monitor loading time to detect Cold Starts
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (loading) {
        setShowSlowLoadingMessage(false);
        // If loading takes > 2.5s, assume cold start and show hint
        timer = setTimeout(() => setShowSlowLoadingMessage(true), 2500);
    } else {
        setShowSlowLoadingMessage(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const ensureProtocol = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
        return `http://${url}`;
    }
    return url;
  };

  const checkConnection = async (url: string) => {
    try {
      const formattedUrl = ensureProtocol(url);
      const cleanUrl = formattedUrl.endsWith('/') ? formattedUrl.slice(0, -1) : formattedUrl;
      const res = await fetch(`${cleanUrl}/`);
      if (res.ok) setBackendStatus('online');
      else setBackendStatus('offline');
    } catch (e) {
      setBackendStatus('offline');
    }
  };

  const saveBackend = (url: string) => {
    setBackendUrl(url);
    const formattedUrl = ensureProtocol(url);
    const cleanUrl = formattedUrl.endsWith('/') ? formattedUrl.slice(0, -1) : formattedUrl;
    localStorage.setItem('sentinel_backend_url', cleanUrl);
    checkConnection(cleanUrl);
  };

  // Auto-detect type based on simple IP regex (IPv4)
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(input.trim());
  const detectedType = input.trim() === '' ? '...' : isIp ? 'Target: IP Address' : 'Target: URL / Domain';

  // --- REPORT GENERATOR (Refined Logic) ---
  const generateThreatReport = (
    baseResult: Omit<ThreatScanResult, 'level' | 'summary' | 'recommendations'>
  ): ThreatScanResult => {
    const score = baseResult.riskScore;
    let level = RiskLevel.SAFE;
    let summary = "This target appears clean and safe to use.";
    let recommendations: string[] = [];

    // Determine Risk Level
    if (score >= 80) level = RiskLevel.CRITICAL;
    else if (score >= 50) level = RiskLevel.HIGH;
    else if (score > 10) level = RiskLevel.MEDIUM; 
    else if (score > 0) level = RiskLevel.LOW;     

    // Generate Summary & Recommendations
    if (baseResult.type === 'IP') {
      if (level === RiskLevel.CRITICAL || level === RiskLevel.HIGH) {
        summary = `DANGER: This IP address is highly malicious. It has been reported ${baseResult.details.reports} times.`;
        recommendations = [
          "BLOCK this IP address immediately.",
          "Do not interact with any requests from this source.",
          "High confidence of malicious activity (Spam/Hacking)."
        ];
      } else if (level === RiskLevel.MEDIUM) {
        summary = `Suspicious Activity Detected. This IP has been flagged ${baseResult.details.reports} times.`;
        recommendations = [
          "Exercise caution. It shows signs of abuse.",
          "Treat as potentially unsafe.",
          "Monitor for further activity."
        ];
      } else if (level === RiskLevel.LOW) {
        summary = `Low Risk. Minor reports found, but generally considered safe.`;
        recommendations = ["Likely safe, but verify the source if unsure."];
      } else {
        summary = `Clean. This IP address has no malicious reports.`;
        recommendations = ["Safe to proceed."];
      }
    } else {
      // URL Logic
      if (level === RiskLevel.CRITICAL || level === RiskLevel.HIGH) {
        summary = `MALICIOUS: ${baseResult.details.maliciousCount} security vendors confirmed this is a threat.`;
        recommendations = [
          "🛑 DO NOT OPEN this link.",
          "High risk of Phishing or Malware.",
          "Delete any messages containing this link immediately."
        ];
      } else if (level === RiskLevel.MEDIUM) {
        summary = `Suspicious. Multiple vendors flagged this URL.`;
        recommendations = [
          "Be careful. This site may be unsafe.",
          "Do not enter personal information."
        ];
      } else if (level === RiskLevel.LOW) {
        summary = `Fully Safe. The single flag is likely a false alarm.`;
        recommendations = [
          "You can safely open this link.",
          "Risk is negligible (1 flag only)."
        ];
      } else {
        summary = "Safe. No security vendors flagged this URL.";
        recommendations = ["You can open this link."];
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
                    { engine: 'Sophos', result: 'Clean', category: 'harmless' }
                ]
            }
        };
    }
    return generateThreatReport(base);
  };

  const getCountryName = (code?: string) => {
    if (!code) return 'Unknown';
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return `${regionNames.of(code)} (${code})`;
    } catch (e) {
        return code;
    }
  };

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setIsSimulation(false);
    setShowAllVendors(false);

    const mode = isIp ? 'IP' : 'URL';

    try {
      let endpoint = mode === 'IP' ? '/api/scan-ip' : '/api/scan-url';
      let body = mode === 'IP' ? { ip: input.trim() } : { url: input.trim() };

      if (mode === 'URL') {
        const urlString = body.url as string;
        if (!/^https?:\/\//i.test(urlString)) {
          const newUrl = 'https://' + urlString;
          body.url = newUrl;
          setInput(newUrl);
        }
      }

      const formattedBackend = ensureProtocol(backendUrl);
      const cleanBackend = formattedBackend.endsWith('/') ? formattedBackend.slice(0, -1) : formattedBackend;
      
      const response = await fetch(`${cleanBackend}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Server connection failed.');

      const data = await response.json();
      let rawResult: any;

      if (mode === 'IP') {
        const d = data.data;
        const score = d.abuseConfidenceScore;
        let verdict: 'Malicious' | 'Suspicious' | 'Safe' = 'Safe';
        
        if (score > 50) verdict = 'Malicious';
        else if (score > 10) verdict = 'Suspicious'; 
        else verdict = 'Safe';

        rawResult = {
          type: 'IP',
          target: d.ipAddress,
          riskScore: score,
          verdict: verdict,
          provider: 'AbuseIPDB',
          details: {
            isp: d.isp,
            country: getCountryName(d.countryCode),
            domain: d.domain,
            reports: d.totalReports,
            lastReport: d.lastReportedAt,
            usageType: d.usageType
          }
        };
      } else {
        const attr = data.data?.attributes;
        if (!attr || data.queued) {
             setError("Analysis in progress. Please check back in a few moments.");
             if (onToast) onToast("Scan Queued. Check external link.", 'info');
             window.open(`https://www.virustotal.com/gui/url/${data.scanId || data.data.id}`, '_blank');
             setLoading(false);
             return;
        }
        
        const stats = attr.last_analysis_stats;
        const malicious = stats.malicious + stats.suspicious;
        const total = Object.values(stats).reduce((a:any, b:any) => a + b, 0) as number;
        
        const analysisResults = attr.last_analysis_results || {};
        
        const allVendors = Object.values(analysisResults).map((v: any) => ({
            engine: v.engine_name,
            result: v.result,
            category: v.category
        }));

        allVendors.sort((a, b) => {
            const isBadA = a.category === 'malicious' || a.category === 'suspicious';
            const isBadB = b.category === 'malicious' || b.category === 'suspicious';
            
            if (isBadA && !isBadB) return -1;
            if (!isBadA && isBadB) return 1;
            return a.engine.localeCompare(b.engine);
        });

        let riskScore = 0;
        let verdict: 'Malicious' | 'Suspicious' | 'Safe' | 'Unknown' = 'Safe';

        if (malicious >= 4) {
            riskScore = 100;
            verdict = 'Malicious';
        } else if (malicious >= 2) {
            riskScore = 65; 
            verdict = 'Suspicious';
        } else if (malicious === 1) {
            riskScore = 5; // Use 5 to trigger LOW Risk (score > 0)
            verdict = 'Safe'; 
        } else {
            riskScore = 0;
            verdict = 'Safe';
        }
        
        rawResult = {
          type: 'URL',
          target: input,
          riskScore: riskScore,
          verdict: verdict,
          provider: 'VirusTotal',
          details: {
            maliciousCount: malicious,
            engineCount: total,
            domain: attr.url,
            vendorAnalysis: allVendors
          }
        };
      }
      
      setResult(generateThreatReport(rawResult));
      setBackendStatus('online');
      if (onToast) onToast("Scan Completed Successfully", 'success');

    } catch (err) {
      console.error("Scan Error:", err);
      const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';
      
      if (isNetworkError || (err as Error).message === 'Server connection failed.') {
          setBackendStatus('offline');
          if (onToast) onToast("Backend offline. Switching to Simulation Mode.", 'info'); 
          setIsSimulation(true);
          setTimeout(() => {
              setResult(mockScan(input, mode));
              setLoading(false);
          }, 800); 
          return; 
      } else {
          if (onToast) onToast("Scan failed. Check server logs.", 'error');
          setError("An unexpected error occurred during the scan.");
      }
    } finally {
      if (!isSimulation) setLoading(false);
    }
  };

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
      
      {/* Settings & Status Bar */}
      <div className="flex flex-wrap justify-end mb-2 items-center gap-4">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929 1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.047 7.047 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          Server Config
        </button>
      </div>

      {showSettings && (
         <div className="mb-6 p-6 rounded-xl bg-[#0a0a0f] border border-white/10 animate-slide-up space-y-6">
            <div>
                <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Backend Server URL:</label>
                <div className="flex gap-2">
                    <input type="text" value={backendUrl} onChange={(e) => saveBackend(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none font-mono" placeholder="http://localhost:10000" />
                    <button onClick={() => checkConnection(backendUrl)} className="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Test</button>
                </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">How to start local server:</h4>
                <div className="space-y-2 text-xs text-slate-300 font-mono bg-black/40 p-3 rounded border border-white/5">
                    <p><span className="text-purple-400">npm</span> install express cors axios dotenv</p>
                    <p><span className="text-purple-400">node</span> server.js</p>
                </div>
            </div>
         </div>
      )}

      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-flow" />
         
         <div className="glass-morphism rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden bg-[#0a0a0f]/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                 <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                 </span>
                 Threat Hunter
               </h2>
               <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                  <span className={`text-xs font-mono font-bold tracking-wide transition-colors ${isIp ? 'text-blue-400' : 'text-orange-400'}`}>{detectedType}</span>
               </div>
            </div>

            <div className="space-y-6">
               <div className="relative">
                 <div className="relative">
                    <input 
                      id="threat-input"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter IP (1.1.1.1) or Domain (example.com)..."
                      className="glass-input w-full rounded-2xl p-5 md:p-6 pl-12 md:pl-14 text-lg md:text-xl text-white placeholder:text-slate-600 focus:outline-none transition-all md:pr-40"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        {isIp ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400/70 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-400/70 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        )}
                    </div>
                    
                    <div className="hidden md:block absolute right-3 top-2.5 bottom-2.5">
                        <button 
                          onClick={handleScan}
                          disabled={loading}
                          className="h-full px-8 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                          {loading ? <Spinner /> : 'SCAN'}
                        </button>
                    </div>
                 </div>

                 {/* Mobile Button */}
                 <div className="md:hidden mt-4">
                    <button 
                      onClick={handleScan}
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                    >
                      {loading ? <Spinner /> : 'SCAN TARGET'}
                    </button>
                 </div>
                 
                 {/* COLD START UX IMPROVEMENT */}
                 {showSlowLoadingMessage && (
                    <div className="absolute -bottom-8 left-0 right-0 text-center animate-pulse">
                        <span className="text-xs text-orange-400 font-mono tracking-wider flex items-center justify-center gap-2">
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Initializing Cloud Engine (Cold Start)...
                        </span>
                    </div>
                 )}
               </div>
            </div>
            
            {error && !isSimulation && (
               <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                 <div className="flex-1">
                    <p className="font-bold mb-1">Scan Failed</p>
                    <p className="opacity-80">{error}</p>
                    <div className="mt-2 flex gap-2">
                        <button onClick={handleScan} className="text-xs font-bold underline hover:text-white">Retry</button>
                        <button onClick={() => setShowSettings(true)} className="text-xs font-bold underline hover:text-white">Check Config</button>
                    </div>
                 </div>
               </div>
            )}
            
            {isSimulation && (
                <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm flex items-center gap-3 animate-slide-up">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.875zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                 <span><strong>Demo Mode:</strong> Backend server is offline. Showing sample data. Check "Server Config" to setup.</span>
               </div>
            )}

            {result && (
              <div className="mt-8 animate-slide-up">
                 <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-8">
                    <div className={`p-6 rounded-xl border ${getRiskColor(result.level)}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full border ${getRiskColor(result.level)}`}>
                                {result.level === RiskLevel.SAFE || result.level === RiskLevel.LOW ? (
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

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center justify-center min-w-[150px] border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                           <div className="relative w-32 h-32 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                 <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                 <circle cx="50" cy="50" r="45" stroke={result.riskScore > 50 ? '#ef4444' : result.riskScore > 10 ? '#facc15' : '#10b981'} strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset={283 - (result.riskScore/100 * 283)} strokeLinecap="round" className="transition-all duration-1000" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-3xl font-bold text-white">{result.riskScore}%</span>
                                 <span className="text-[10px] text-slate-400 uppercase">Risk Score</span>
                              </div>
                           </div>
                        </div>

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
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Network Identity</p>
                                  <p className="text-white font-medium">{result.details.isp || 'Unknown'}</p>
                                  {result.details.usageType && (
                                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase text-slate-300 border border-white/5">
                                          {result.details.usageType}
                                      </span>
                                  )}
                               </div>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Origin Country</p>
                                  <p className="text-white text-lg flex items-center gap-2">{result.details.country ? result.details.country : 'N/A'}</p>
                               </div>
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5 sm:col-span-2">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Report History</p>
                                  <div className="flex items-center gap-4">
                                      <div>
                                          <p className="text-xl font-bold text-white">{result.details.reports}</p>
                                          <p className="text-[10px] text-slate-500">Total Abuse Reports</p>
                                      </div>
                                      <div className="h-8 w-px bg-white/10"></div>
                                      <div>
                                          <p className="text-sm text-white">{result.details.lastReport ? new Date(result.details.lastReport).toLocaleDateString() : 'N/A'}</p>
                                          <p className="text-[10px] text-slate-500">Last Reported</p>
                                      </div>
                                  </div>
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
                               <div className="bg-black/20 p-4 rounded-xl border border-white/5 sm:col-span-2">
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Intelligence Logic</p>
                                  <p className="text-xs text-slate-400 leading-relaxed">
                                    We aggregate scan results from over 80+ distinct antivirus engines and URL scanners (like Google Safebrowsing, Microsoft SmartScreen, and Kaspersky) to determine a consensus verdict. If even one major vendor flags it, exercise extreme caution.
                                  </p>
                               </div>
                             </>
                           )}
                        </div>
                    </div>

                    <div className="mt-4">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recommended Actions</h4>
                         <ul className="space-y-3">
                            {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${result.level === RiskLevel.SAFE || result.level === RiskLevel.LOW ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span>{rec}</span>
                                </li>
                            ))}
                         </ul>
                    </div>

                    {result.type === 'URL' && result.details.vendorAnalysis && result.details.vendorAnalysis.length > 0 && (
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security Vendor Breakdown</h3>
                                    <p className="text-[10px] text-slate-600 mt-1">Detailed verdicts from global security engines.</p>
                                </div>
                                {result.details.vendorAnalysis.length > 8 && (
                                    <button 
                                        onClick={() => setShowAllVendors(!showAllVendors)}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1 bg-cyan-900/10 px-3 py-1.5 rounded-full border border-cyan-500/20"
                                    >
                                        {showAllVendors ? 'Show Less' : `View All (${result.details.vendorAnalysis.length})`}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 transition-transform ${showAllVendors ? 'rotate-180' : ''}`}>
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-500`}>
                                {result.details.vendorAnalysis.slice(0, showAllVendors ? undefined : 8).map((vendor, idx) => (
                                    <div key={idx} className={`flex flex-col justify-between p-3 rounded-xl border text-xs gap-2 animate-slide-up ${
                                        vendor.category === 'malicious' || vendor.category === 'suspicious'
                                        ? 'bg-red-500/5 border-red-500/20'
                                        : 'bg-white/5 border-white/5'
                                    }`} style={{ animationDelay: `${idx * 50}ms` }}>
                                        <span className="text-slate-300 font-medium truncate" title={vendor.engine}>{vendor.engine}</span>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase w-max tracking-wide ${
                                            vendor.category === 'malicious' || vendor.category === 'suspicious' 
                                            ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
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
}
