// ============================================================================
// EpidermiWatch - Geospatial Intelligence Map (Center Panel)
// Kenya county outbreak visualization with Leaflet + HUD overlay
// ============================================================================

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useSystemStore } from '../../store/useSystemStore';
import { COUNTY_COORDINATES } from '../../data/countyCoordinates';
import { OutbreakAlert } from '../../types';
import { MapFilters } from './MapFilters';
import 'leaflet/dist/leaflet.css';

const KENYA_CENTER: [number, number] = [-0.0236, 37.9062];
const KENYA_ZOOM = 6;

export function Map() {
  const alerts = useSystemStore(state => state.getFilteredAlerts());
  const selectAlert = useSystemStore(state => state.selectAlert);
  const selectedAlert = useSystemStore(state => state.selectedAlert);
  
  // Group alerts by county
  const alertsByCounty = alerts.reduce((acc, alert) => {
    if (!acc[alert.county]) {
      acc[alert.county] = [];
    }
    acc[alert.county].push(alert);
    return acc;
  }, {} as Record<string, OutbreakAlert[]>);
  
  return (
    <div className="grid-map panel overflow-hidden relative bg-[#020617]">
      {/* Grid Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none z-10" 
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* System Info HUD */}
      <div className="absolute top-20 left-6 text-emerald-500/40 font-mono text-[10px] space-y-1 z-20 pointer-events-none">
        <div>SYS.OP.GEOSPATIAL.v3.1</div>
        <div>LAT: 0° 23' 0" N</div>
        <div>LON: 37° 54' 0" E</div>
        <div>ZOOM: STRATEGIC</div>
      </div>
      
      {/* Filter HUD */}
      <MapFilters />
      
      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] bg-slate-950/60 p-3 border border-slate-800/50 rounded pointer-events-none flex flex-col space-y-2 backdrop-blur-sm z-20">
        <div className="text-slate-500 uppercase tracking-wider mb-1">Threat Level Legend</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
          <span className="text-slate-300">CRITICAL OUTBREAK</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
          <span className="text-slate-300">ELEVATED THREAT</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
          <span className="text-slate-300">MONITORING REQUIRED</span>
        </div>
      </div>
      
      {/* Leaflet Map */}
      <MapContainer
        center={KENYA_CENTER}
        zoom={KENYA_ZOOM}
        style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render county markers */}
        {COUNTY_COORDINATES.map(coord => {
          const countyAlerts = alertsByCounty[coord.county] || [];
          const highestAlert = getHighestSeverityAlert(countyAlerts);
          
          if (!highestAlert) return null;
          
          const markerColor = getMarkerColor(highestAlert.alertLevel);
          const markerRadius = getMarkerRadius(highestAlert.riskScore);
          const isSelected = selectedAlert?.id === highestAlert.id;
          
          return (
            <CircleMarker
              key={coord.county}
              center={[coord.lat, coord.lng]}
              radius={markerRadius}
              pathOptions={{
                fillColor: markerColor,
                fillOpacity: isSelected ? 0.9 : 0.7,
                color: markerColor,
                weight: isSelected ? 3 : 2,
                className: isSelected ? 'animate-pulse' : ''
              }}
              eventHandlers={{
                click: () => selectAlert(highestAlert)
              }}
            >
              <Popup>
                <div className="text-sm font-mono">
                  <p className="font-bold text-slate-200">{coord.county} County</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {countyAlerts.length} active alert(s)
                  </p>
                  <p className="text-xs mt-2">
                    Highest:{' '}
                    <span className={`font-bold ${
                      highestAlert.alertLevel === 'RED' ? 'text-rose-500' :
                      highestAlert.alertLevel === 'ORANGE' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`}>
                      {highestAlert.alertLevel}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Risk: {highestAlert.riskScore.toFixed(1)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function getHighestSeverityAlert(alerts: OutbreakAlert[]): OutbreakAlert | null {
  if (alerts.length === 0) return null;
  
  const severityOrder = { RED: 3, ORANGE: 2, YELLOW: 1, GREEN: 0 };
  return alerts.reduce((highest, current) => {
    return severityOrder[current.alertLevel] > severityOrder[highest.alertLevel]
      ? current
      : highest;
  });
}

function getMarkerColor(level: string): string {
  const colors = {
    RED: '#f43f5e',
    ORANGE: '#f97316',
    YELLOW: '#eab308',
    GREEN: '#10b981'
  };
  return colors[level as keyof typeof colors] || colors.GREEN;
}

function getMarkerRadius(riskScore: number): number {
  // Scale radius based on risk score (8-25 pixels)
  return Math.max(8, Math.min(25, riskScore / 4));
}

// Made with Bob
