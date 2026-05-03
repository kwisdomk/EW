// ============================================================================
// EpidermiWatch - Global System Store (Zustand)
// Single source of truth for all panels
// ============================================================================

import { create } from 'zustand';
import { OutbreakAlert, SystemMode, AlertLevel } from '../types';

interface SystemStore {
  // State
  alerts: OutbreakAlert[];
  selectedAlert: OutbreakAlert | null;
  systemMode: SystemMode;
  lastUpdate: string;
  
  // Filter state
  filterSeverity: AlertLevel | 'ALL';
  filterDisease: string | 'ALL';
  
  // Actions
  setAlerts: (alerts: OutbreakAlert[]) => void;
  addAlert: (alert: OutbreakAlert) => void;
  updateAlert: (alert: OutbreakAlert) => void;
  selectAlert: (alert: OutbreakAlert | null) => void;
  toggleSystemMode: () => void;
  acknowledgeAlert: (id: number) => void;
  
  // Filter actions
  setFilterSeverity: (level: AlertLevel | 'ALL') => void;
  setFilterDisease: (disease: string | 'ALL') => void;
  resetFilters: () => void;
  
  // Computed getters
  getRedAlerts: () => OutbreakAlert[];
  getOrangeAlerts: () => OutbreakAlert[];
  getYellowAlerts: () => OutbreakAlert[];
  getActiveOutbreakCount: () => number;
  getAffectedCounties: () => string[];
  getFilteredAlerts: () => OutbreakAlert[];
  getUniqueDiseases: () => string[];
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  // Initial state
  alerts: [],
  selectedAlert: null,
  systemMode: 'OPERATIONS',
  lastUpdate: new Date().toISOString(),
  
  // Filter state
  filterSeverity: 'ALL',
  filterDisease: 'ALL',
  
  // Actions
  setAlerts: (alerts) => set({
    alerts,
    lastUpdate: new Date().toISOString()
  }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    lastUpdate: new Date().toISOString()
  })),
  
  updateAlert: (updatedAlert) => set((state) => ({
    alerts: state.alerts.map(alert =>
      alert.id === updatedAlert.id ? updatedAlert : alert
    ),
    selectedAlert: state.selectedAlert?.id === updatedAlert.id
      ? updatedAlert
      : state.selectedAlert,
    lastUpdate: new Date().toISOString()
  })),
  
  selectAlert: (alert) => set({ selectedAlert: alert }),
  
  toggleSystemMode: () => set((state) => ({
    systemMode: state.systemMode === 'OPERATIONS' ? 'ANALYSIS' : 'OPERATIONS'
  })),
  
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ),
    selectedAlert: state.selectedAlert?.id === id
      ? { ...state.selectedAlert, acknowledged: true }
      : state.selectedAlert
  })),
  
  // Filter actions
  setFilterSeverity: (level) => set({ filterSeverity: level }),
  setFilterDisease: (disease) => set({ filterDisease: disease }),
  resetFilters: () => set({ filterSeverity: 'ALL', filterDisease: 'ALL' }),
  
  // Computed getters
  getRedAlerts: () => get().alerts.filter(a => a.alertLevel === 'RED'),
  getOrangeAlerts: () => get().alerts.filter(a => a.alertLevel === 'ORANGE'),
  getYellowAlerts: () => get().alerts.filter(a => a.alertLevel === 'YELLOW'),
  
  getActiveOutbreakCount: () => {
    const alerts = get().alerts;
    return alerts.filter(a => a.alertLevel === 'RED' || a.alertLevel === 'ORANGE').length;
  },
  
  getAffectedCounties: () => {
    const alerts = get().alerts;
    const counties = new Set(alerts.map(a => a.county));
    return Array.from(counties);
  },
  
  getFilteredAlerts: () => {
    const { alerts, filterSeverity, filterDisease } = get();
    return alerts.filter(alert => {
      if (filterSeverity !== 'ALL' && alert.alertLevel !== filterSeverity) return false;
      if (filterDisease !== 'ALL' && alert.disease !== filterDisease) return false;
      return true;
    });
  },
  
  getUniqueDiseases: () => {
    const alerts = get().alerts;
    const diseases = new Set(alerts.map(a => a.disease));
    return Array.from(diseases).sort();
  }
}));

// Made with Bob
