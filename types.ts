
export enum RiskLevel {
  SAFE = 'SAFE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RiskPattern {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalysisResult {
  score: number;
  level: RiskLevel;
  patterns: RiskPattern[];
  recommendations: string[];
  summary: string;
  timestamp: number;
  id: string;
}

export interface ScamCategory {
  keywords: RegExp[];
  weight: number;
  name: string;
  description: string;
  explanation: string;
  averageLoss?: number;
}

export interface ScanHistoryItem {
  id: string;
  textSnippet: string;
  date: number;
  level: RiskLevel;
  score: number;
  category: string;
}

export interface DashboardStats {
  totalScans: number;
  threatsBlocked: number;
  lastScanDate: number | null;
}

// --- THREAT HUNTER TYPES ---

export interface ThreatScanResult {
  type: 'IP' | 'URL';
  target: string;
  riskScore: number; // 0-100
  verdict: 'Malicious' | 'Suspicious' | 'Safe' | 'Unknown';
  
  // New User-Friendly Fields
  level: RiskLevel;
  summary: string;
  recommendations: string[];

  details: {
    isp?: string;
    country?: string;
    domain?: string;
    reports?: number;
    lastReport?: string;
    engineCount?: number; // VirusTotal
    maliciousCount?: number; // VirusTotal
    vendorAnalysis?: { engine: string; result: string; category: string }[]; // Specific VT Vendors
  };
  provider: 'AbuseIPDB' | 'VirusTotal';
}
