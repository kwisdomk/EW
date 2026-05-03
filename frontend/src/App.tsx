/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AlertFeed } from './components/AlertFeed';
import { KenyaMap } from './components/KenyaMap';
import { InvestigationConsole } from './components/InvestigationConsole';
import { TrendAnalytics } from './components/TrendAnalytics';
import { fetchAlerts, transformAlert } from './services/api';
import { alertStreamService } from './services/sseService';
import { Alert, Severity } from './data/mockData';

export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterDisease, setFilterDisease] = useState<string | 'all'>('all');
  const [sseConnected, setSseConnected] = useState(false);

  // Initial data fetch
  useEffect(() => {
    loadAlerts();
  }, []);

  // SSE connection for real-time updates
  useEffect(() => {
    alertStreamService.connect(
      (backendAlert) => {
        console.log('[App] Received SSE alert:', backendAlert);
        const transformedAlert = transformAlert(backendAlert);
        
        setAlerts((prevAlerts) => {
          // Check if alert already exists (update) or is new (add)
          const existingIndex = prevAlerts.findIndex(a => a.id === transformedAlert.id);
          
          if (existingIndex >= 0) {
            // Update existing alert
            const updated = [...prevAlerts];
            updated[existingIndex] = { ...transformedAlert, isNew: false };
            return updated;
          } else {
            // Add new alert at the beginning
            return [{ ...transformedAlert, isNew: true }, ...prevAlerts];
          }
        });
      },
      (error) => {
        console.error('[App] SSE error:', error);
        setSseConnected(false);
      },
      () => {
        console.log('[App] SSE connected');
        setSseConnected(true);
      }
    );

    return () => {
      alertStreamService.disconnect();
    };
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError(null);
      const backendAlerts = await fetchAlerts({ size: 50 });
      const transformed = backendAlerts.map(transformAlert);
      setAlerts(transformed);
      
      // Set first alert as selected if none selected
      if (!selectedAlertId && transformed.length > 0) {
        setSelectedAlertId(transformed[0].id);
      }
    } catch (err) {
      console.error('[App] Failed to load alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterDisease !== 'all' && alert.disease !== filterDisease) return false;
    return true;
  });

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050505] text-slate-300 font-sans overflow-hidden cursor-default selection:bg-rose-500/30 selection:text-white">
      {/* Visual scanline decorative overlay */}
      <div className="scan-line" />
      
      <Header sseConnected={sseConnected} alertCount={alerts.length} />
      
      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
            <p className="text-slate-400">Loading epidemic intelligence...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-rose-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-rose-500 mb-2">Connection Failed</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <button
              onClick={loadAlerts}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
            >
              Retry Connection
            </button>
            <p className="text-xs text-slate-500 mt-4">
              Ensure backend is running at http://localhost:8080
            </p>
          </div>
        </div>
      )}

      {/* Main interface area */}
      {!loading && !error && (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 flex min-h-0 relative z-10">
            <AlertFeed 
              alerts={filteredAlerts} 
              onSelectAlert={setSelectedAlertId}
              selectedId={selectedAlertId}
            />
            
            <div className="flex-1 flex flex-col min-h-0 relative">
              <KenyaMap 
                alerts={filteredAlerts}
                selectedId={selectedAlertId} 
                onSelectAlert={setSelectedAlertId}
                filterSeverity={filterSeverity}
                setFilterSeverity={setFilterSeverity}
                filterDisease={filterDisease}
                setFilterDisease={setFilterDisease}
              />
              <TrendAnalytics selectedAlert={selectedAlert} />
            </div>
            
            <InvestigationConsole alert={selectedAlert} onRefresh={loadAlerts} />
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
