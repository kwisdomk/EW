// ============================================================================
// EpidermiWatch - Type Definitions
// ============================================================================

export type AlertLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
export type SystemMode = 'OPERATIONS' | 'ANALYSIS';
export type Severity = 'red' | 'orange' | 'yellow' | 'green';

export interface OutbreakAlert {
  id: number;
  county: string;
  disease: string;
  weekKey: string;
  riskScore: number;
  alertLevel: AlertLevel;
  zScore: number;
  watsonSummary: string;
  recommendedAction: string;
  detectedAt: string;
  acknowledged: boolean;
  cases?: number;
  baseline?: number;
  // Display enhancements
  isNew?: boolean;
  displayId?: string;
}

export interface CountyCoordinates {
  county: string;
  lat: number;
  lng: number;
}

export interface SystemMetrics {
  activeOutbreaks: number;
  countiesAffected: number;
  escalationRate: number;
  lastScan: string;
}

export interface TrendDataPoint {
  week: string;
  actual: number;
  baseline: number;
}

export interface CountyStats {
  population: number;
  hospitalCapacity: number;
  currentUtilization: number;
  activeResponseUnits: number;
  stockpileStatus: 'optimal' | 'low' | 'critical';
}

// Made with Bob
