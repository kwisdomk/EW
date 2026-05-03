// ============================================================================
// EpidermiWatch - Main Application
// Mission-Critical Operations Center - National Epidemic Intelligence
// ============================================================================

import { useEffect } from 'react';
import { ScanLine } from './components/ScanLine';
import { Header } from './components/header/Header';
import { Feed } from './components/feed/Feed';
import { Map } from './components/map/Map';
import { Console } from './components/console/Console';
import { Charts } from './components/charts/Charts';
import { useSystemStore } from './store/useSystemStore';
import { mockSseService, generateInitialAlerts } from './services/mockSseService';

function App() {
  const setAlerts = useSystemStore(state => state.setAlerts);
  const addAlert = useSystemStore(state => state.addAlert);
  const updateAlert = useSystemStore(state => state.updateAlert);
  
  useEffect(() => {
    // Initialize with mock alerts
    const initialAlerts = generateInitialAlerts(15);
    setAlerts(initialAlerts);
    
    // Start mock SSE service for real-time updates
    mockSseService.start((alert) => {
      // Check if alert exists (update) or is new (add)
      const existingAlert = useSystemStore.getState().alerts.find(a => a.id === alert.id);
      if (existingAlert) {
        updateAlert(alert);
      } else {
        addAlert(alert);
      }
    });
    
    // Cleanup on unmount
    return () => {
      mockSseService.stop();
    };
  }, [setAlerts, addAlert, updateAlert]);
  
  return (
    <>
      {/* Tactical Scan Line Overlay */}
      <ScanLine />
      
      {/* Command Center Grid Layout */}
      <div className="grid-command-center">
        <Header />
        <Feed />
        <Map />
        <Console />
        <Charts />
      </div>
    </>
  );
}

export default App;

// Made with Bob
