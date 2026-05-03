// ============================================================================
// EpidermiWatch - Utility Functions
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if an alert is new (within last 5 minutes)
 */
export function isAlertNew(timestamp: string): boolean {
  const alertTime = new Date(timestamp).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return (now - alertTime) < fiveMinutes;
}

/**
 * Format alert ID for display (e.g., "ALT-0042-CH")
 */
export function formatAlertId(id: number, disease: string): string {
  const diseaseCode = disease.substring(0, 2).toUpperCase();
  return `ALT-${id.toString().padStart(4, '0')}-${diseaseCode}`;
}

/**
 * Convert AlertLevel to severity color
 */
export function alertLevelToSeverity(level: string): 'red' | 'orange' | 'yellow' | 'green' {
  const map: Record<string, 'red' | 'orange' | 'yellow' | 'green'> = {
    'RED': 'red',
    'ORANGE': 'orange',
    'YELLOW': 'yellow',
    'GREEN': 'green'
  };
  return map[level] || 'green';
}

// Made with Bob