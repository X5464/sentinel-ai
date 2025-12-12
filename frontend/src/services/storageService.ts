
import { AnalysisResult, RiskLevel, ScanHistoryItem, DashboardStats } from '../types';

const STORAGE_KEY = 'sentinel_history_v1';

export const saveScan = (result: AnalysisResult, text: string): void => {
  if (result.level === RiskLevel.SAFE) return; // Optional: Only save threats? Let's save all for now.

  const history = getHistory();
  
  const newItem: ScanHistoryItem = {
    id: result.id,
    textSnippet: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
    date: Date.now(),
    level: result.level,
    score: result.score,
    category: result.patterns.length > 0 ? result.patterns[0].name : 'Unknown'
  };

  // Keep last 50 scans
  const newHistory = [newItem, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
};

export const getHistory = (): ScanHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getStats = (): DashboardStats => {
  const history = getHistory();
  
  const totalScans = history.length;
  
  // Count items that are NOT safe
  const threatsBlocked = history.filter(item => item.level !== RiskLevel.SAFE && item.level !== RiskLevel.LOW).length;
  
  return {
    totalScans,
    threatsBlocked,
    lastScanDate: history.length > 0 ? history[0].date : null
  };
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};