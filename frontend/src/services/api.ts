/**
 * EpidemiWatch API Service
 * Connects frontend to Quarkus backend at http://localhost:8080
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface OutbreakAlert {
  id: number;
  county: string;
  disease: string;
  weekKey: string;
  riskScore: number;
  alertLevel: 'RED' | 'ORANGE' | 'YELLOW';
  zScore: number;
  watsonSummary: string;
  recommendedAction: string;
  detectedAt: string;
  acknowledged: boolean;
}

export interface DiseaseReport {
  id: number;
  county: string;
  subCounty: string;
  disease: string;
  caseCount: number;
  deathCount: number;
  reportDate: string;
}

export interface DetectionResult {
  alertsCreated: number;
  alertsUpdated: number;
  alertsSkipped: number;
  timestamp: string;
}

/**
 * Fetch all outbreak alerts with optional filters
 */
export async function fetchAlerts(params?: {
  county?: string;
  severity?: string;
  page?: number;
  size?: number;
}): Promise<OutbreakAlert[]> {
  const queryParams = new URLSearchParams();
  if (params?.county) queryParams.append('county', params.county);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const url = `${API_BASE}/alerts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch unacknowledged alerts only
 */
export async function fetchUnacknowledgedAlerts(): Promise<OutbreakAlert[]> {
  const response = await fetch(`${API_BASE}/alerts/unacknowledged`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch unacknowledged alerts: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Acknowledge an alert (mark as reviewed)
 */
export async function acknowledgeAlert(id: number): Promise<OutbreakAlert> {
  const response = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch disease reports with optional filters
 */
export async function fetchReports(params?: {
  county?: string;
  disease?: string;
  page?: number;
  size?: number;
}): Promise<DiseaseReport[]> {
  const queryParams = new URLSearchParams();
  if (params?.county) queryParams.append('county', params.county);
  if (params?.disease) queryParams.append('disease', params.disease);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const url = `${API_BASE}/reports${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Trigger manual outbreak detection
 * Requires API key: X-API-KEY header
 */
export async function triggerDetection(apiKey: string): Promise<DetectionResult> {
  const response = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to trigger detection: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Map backend alert level to frontend severity
 */
export function mapAlertLevelToSeverity(alertLevel: 'RED' | 'ORANGE' | 'YELLOW'): 'red' | 'orange' | 'yellow' {
  return alertLevel.toLowerCase() as 'red' | 'orange' | 'yellow';
}

/**
 * Transform backend OutbreakAlert to frontend Alert format
 */
export function transformAlert(backendAlert: OutbreakAlert) {
  return {
    id: backendAlert.id.toString(),
    county: backendAlert.county,
    disease: backendAlert.disease,
    severity: mapAlertLevelToSeverity(backendAlert.alertLevel),
    riskScore: backendAlert.riskScore,
    zScore: backendAlert.zScore,
    timestamp: backendAlert.detectedAt,
    summary: backendAlert.watsonSummary,
    acknowledged: backendAlert.acknowledged,
    recommendedAction: backendAlert.recommendedAction,
    weekKey: backendAlert.weekKey,
  };
}

// Made with Bob
