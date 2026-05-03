// ============================================================================
// EpidermiWatch - Mock SSE Service
// Simulates real-time outbreak detection updates
// ============================================================================

import { OutbreakAlert, AlertLevel } from '../types';

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Turkana', 'Machakos', 'Kiambu', 'Kajiado', 'Meru',
  'Nyeri', 'Garissa', 'Kakamega', 'Bungoma', 'Kitui'
];

const DISEASES = [
  'Cholera', 'Malaria', 'Typhoid', 'Dengue', 'Measles',
  'COVID-19', 'Tuberculosis', 'Hepatitis'
];

let alertIdCounter = 1;

// Generate initial mock alerts
export function generateInitialAlerts(count: number = 12): OutbreakAlert[] {
  const alerts: OutbreakAlert[] = [];
  
  for (let i = 0; i < count; i++) {
    alerts.push(generateRandomAlert());
  }
  
  return alerts.sort((a, b) => {
    const severityOrder = { RED: 3, ORANGE: 2, YELLOW: 1, GREEN: 0 };
    return severityOrder[b.alertLevel] - severityOrder[a.alertLevel];
  });
}

// Generate a random alert
function generateRandomAlert(): OutbreakAlert {
  const county = KENYA_COUNTIES[Math.floor(Math.random() * KENYA_COUNTIES.length)];
  const disease = DISEASES[Math.floor(Math.random() * DISEASES.length)];
  const alertLevel = getRandomAlertLevel();
  const zScore = getZScoreForLevel(alertLevel);
  const riskScore = Math.min(zScore * 20, 100);
  const baseline = Math.floor(Math.random() * 50) + 10;
  const cases = Math.floor(baseline * (1 + zScore * 0.3));
  
  return {
    id: alertIdCounter++,
    county,
    disease,
    weekKey: getCurrentWeekKey(),
    riskScore: Math.round(riskScore),
    alertLevel,
    zScore: parseFloat(zScore.toFixed(2)),
    watsonSummary: generateWatsonSummary(county, disease, alertLevel, cases, baseline, zScore),
    recommendedAction: generateRecommendedAction(alertLevel, disease, county),
    detectedAt: new Date().toISOString(),
    acknowledged: Math.random() > 0.7,
    cases,
    baseline
  };
}

// Get random alert level with weighted distribution
function getRandomAlertLevel(): AlertLevel {
  const rand = Math.random();
  if (rand < 0.15) return 'RED';
  if (rand < 0.35) return 'ORANGE';
  if (rand < 0.70) return 'YELLOW';
  return 'GREEN';
}

// Get z-score based on alert level
function getZScoreForLevel(level: AlertLevel): number {
  switch (level) {
    case 'RED': return 4.0 + Math.random() * 2;
    case 'ORANGE': return 3.0 + Math.random();
    case 'YELLOW': return 2.0 + Math.random();
    case 'GREEN': return Math.random() * 2;
  }
}

// Generate Watson AI summary
function generateWatsonSummary(
  county: string,
  disease: string,
  level: AlertLevel,
  cases: number,
  baseline: number,
  zScore: number
): string {
  return `EpidemiWatch AI detected a potential ${disease.toUpperCase()} outbreak in ${county} County. ` +
    `Current week cases: ${cases} (historical mean: ${baseline.toFixed(1)}). ` +
    `Statistical z-score: ${zScore.toFixed(2)} — classified as ${level} alert level.`;
}

// Generate recommended action
function generateRecommendedAction(level: AlertLevel, disease: string, county: string): string {
  switch (level) {
    case 'RED':
      return `IMMEDIATE ACTION REQUIRED: Deploy rapid response team to ${county}. ` +
        `Notify county health director. Issue public health advisory for ${disease}.`;
    case 'ORANGE':
      return `URGENT: Increase surveillance in ${county} for ${disease}. ` +
        `Alert sub-county health officers. Prepare treatment stockpiles.`;
    case 'YELLOW':
      return `MONITOR: Elevated ${disease} cases in ${county}. ` +
        `Increase community health worker visits. Review water/sanitation.`;
    case 'GREEN':
      return `Continue routine surveillance. No immediate action required.`;
  }
}

// Get current ISO week key
function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Mock SSE Service
export class MockSseService {
  private intervalId: number | null = null;
  private callbacks: ((alert: OutbreakAlert) => void)[] = [];
  
  start(onAlert: (alert: OutbreakAlert) => void) {
    this.callbacks.push(onAlert);
    
    // Emit new/updated alerts every 5 seconds
    this.intervalId = window.setInterval(() => {
      const shouldUpdate = Math.random() > 0.5;
      
      if (shouldUpdate) {
        // Generate new alert
        const newAlert = generateRandomAlert();
        this.callbacks.forEach(cb => cb(newAlert));
      }
    }, 5000);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks = [];
  }
}

export const mockSseService = new MockSseService();

// Made with Bob
