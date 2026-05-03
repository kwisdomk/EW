import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert, Severity } from '../data/mockData';
import { cn } from '../lib/utils';
import { Crosshair, Filter } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CountyFeature {
  type: string;
  properties: {
    name: string;
    code: string;
    capital: string;
  };
  geometry: any;
}

interface GeoJSONData {
  type: string;
  features: CountyFeature[];
}

// Custom marker icons for different severity levels
const createCustomIcon = (severity: Severity, isSelected: boolean) => {
  const colors = {
    red: '#f43f5e',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e'
  };
  
  const size = isSelected ? 24 : 16;
  const color = colors[severity];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${isSelected ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: ${size * 3}px; height: ${size * 3}px; border-radius: 50%; background: ${color}; opacity: 0.2; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; border: 2px solid #0f172a; box-shadow: 0 0 15px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
          <div style="width: 4px; height: 4px; border-radius: 50%; background: white; opacity: 0.8;"></div>
        </div>
        ${isSelected ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: ${size * 2}px; height: ${size * 2}px;"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" opacity="0.4" style="animation: spin 4s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"/></svg></div>` : ''}
      </div>
      <style>
        @keyframes ping {
          75%, 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function KenyaMap({ 
  alerts, 
  selectedId, 
  onSelectAlert,
  filterSeverity,
  setFilterSeverity,
  filterDisease,
  setFilterDisease
}: { 
  alerts: Alert[];
  selectedId: string | null; 
  onSelectAlert: (id: string) => void;
  filterSeverity: string;
  setFilterSeverity: (sev: Severity | 'all') => void;
  filterDisease: string;
  setFilterDisease: (dis: string | 'all') => void;
}) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch('/kenya-counties.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Get highest severity alert for a county
  const getCountySeverity = (countyName: string): Severity | null => {
    const countyAlerts = alerts.filter(a => a.county === countyName);
    if (countyAlerts.length === 0) return null;
    
    // Priority: red > orange > yellow > green
    if (countyAlerts.some(a => a.severity === 'red')) return 'red';
    if (countyAlerts.some(a => a.severity === 'orange')) return 'orange';
    if (countyAlerts.some(a => a.severity === 'yellow')) return 'yellow';
    return 'green';
  };

  // Style function for counties
  const countyStyle = (feature: any) => {
    const countyName = feature.properties.name;
    const severity = getCountySeverity(countyName);
    const isHovered = hoveredCounty === countyName;
    
    const severityColors = {
      red: { fill: '#f43f5e', stroke: '#be123c' },
      orange: { fill: '#f97316', stroke: '#c2410c' },
      yellow: { fill: '#eab308', stroke: '#a16207' },
      green: { fill: '#22c55e', stroke: '#15803d' },
    };
    
    const colors = severity ? severityColors[severity] : { fill: '#1e293b', stroke: '#475569' };
    
    return {
      fillColor: colors.fill,
      fillOpacity: severity ? (isHovered ? 0.5 : 0.3) : (isHovered ? 0.2 : 0.1),
      color: colors.stroke,
      weight: isHovered ? 3 : 1,
      opacity: isHovered ? 1 : 0.5,
    };
  };

  // Event handlers for counties
  const onEachCounty = (feature: any, layer: L.Layer) => {
    const countyName = feature.properties.name;
    const severity = getCountySeverity(countyName);
    const countyAlerts = alerts.filter(a => a.county === countyName);
    
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        setHoveredCounty(countyName);
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          fillOpacity: severity ? 0.5 : 0.2,
          opacity: 1,
        });
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        setHoveredCounty(null);
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        if (countyAlerts.length > 0) {
          onSelectAlert(countyAlerts[0].id);
        }
      },
    });

    // Bind tooltip
    if (severity) {
      const tooltipContent = `
        <div style="font-family: monospace; font-size: 10px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${countyName}</div>
          <div style="color: #94a3b8;">${countyAlerts.length} alert(s)</div>
          <div style="color: ${severity === 'red' ? '#f43f5e' : severity === 'orange' ? '#f97316' : '#eab308'}; text-transform: uppercase; margin-top: 2px;">
            ${severity} LEVEL
          </div>
        </div>
      `;
      layer.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
        opacity: 0.95,
      });
    } else {
      layer.bindTooltip(`<div style="font-family: monospace; font-size: 10px;">${countyName}</div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
        opacity: 0.95,
      });
    }
  };

  // Get alert coordinates (center of county)
  const getAlertPosition = (countyName: string): [number, number] | null => {
    if (!geoData) return null;
    const feature = geoData.features.find(f => f.properties.name === countyName);
    if (!feature) return null;
    
    // Calculate centroid of polygon (simplified)
    const coords = feature.geometry.coordinates[0];
    const lats = coords.map((c: number[]) => c[1]);
    const lngs = coords.map((c: number[]) => c[0]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return [centerLat, centerLng];
  };

  return (
    <div className="flex-1 bg-[#02050A] relative overflow-hidden flex items-center justify-center pt-14">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.15] z-0" 
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Radar Sweep Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="w-full h-full animate-[spin_10s_linear_infinite]" 
          style={{ background: 'conic-gradient(from 0deg, transparent 0 340deg, theme("colors.emerald.500") 360deg)' }}
        />
      </div>

      <div className="absolute top-20 left-6 text-emerald-500/40 font-mono text-[10px] space-y-1 z-10 pointer-events-none">
        <div>SYS.OP.GEOSPATIAL.v3.1</div>
        <div>LAT: 0° 23' 0" N</div>
        <div>LON: 37° 54' 0" E</div>
        <div>ZOOM: STRATEGIC</div>
        <div className="mt-2 text-emerald-500/60">47 COUNTIES MAPPED</div>
      </div>
      
      {/* Filter HUD Controls */}
      <div className="absolute top-20 right-6 z-30 font-mono text-[10px] bg-slate-950/80 border border-slate-800 rounded p-3 backdrop-blur-md flex flex-col space-y-4">
        <div className="flex items-center text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <Filter className="w-3 h-3 mr-2" /> Display Filters
        </div>
        
        <div className="space-y-2">
          <div className="text-slate-500 uppercase">Severity</div>
          <div className="flex space-x-1">
             <button onClick={() => setFilterSeverity('all')} className={cn("px-2 py-1 border rounded transition-colors", filterSeverity === 'all' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>ALL</button>
             <button onClick={() => setFilterSeverity('red')} className={cn("px-2 py-1 border rounded transition-colors", filterSeverity === 'red' ? 'bg-rose-500/20 border-rose-500/50 text-rose-500' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>RED</button>
             <button onClick={() => setFilterSeverity('orange')} className={cn("px-2 py-1 border rounded transition-colors", filterSeverity === 'orange' ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>ORG</button>
             <button onClick={() => setFilterSeverity('yellow')} className={cn("px-2 py-1 border rounded transition-colors", filterSeverity === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>YEL</button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-slate-500 uppercase">Disease Type</div>
          <div className="grid grid-cols-2 gap-1">
             <button onClick={() => setFilterDisease('all')} className={cn("px-2 py-1 border rounded transition-colors col-span-2 text-center", filterDisease === 'all' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>ALL VECTORS</button>
             <button onClick={() => setFilterDisease('Cholera')} className={cn("px-2 py-1 border rounded transition-colors text-center", filterDisease === 'Cholera' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>CHOLERA</button>
             <button onClick={() => setFilterDisease('Malaria')} className={cn("px-2 py-1 border rounded transition-colors text-center", filterDisease === 'Malaria' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>MALARIA</button>
             <button onClick={() => setFilterDisease('Typhoid')} className={cn("px-2 py-1 border rounded transition-colors text-center", filterDisease === 'Typhoid' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>TYPHOID</button>
             <button onClick={() => setFilterDisease('Dengue Fever')} className={cn("px-2 py-1 border rounded transition-colors text-center", filterDisease === 'Dengue Fever' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'border-slate-800 text-slate-500 hover:text-slate-300')}>DENGUE</button>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="relative w-full h-full z-10">
        {geoData && (
          <MapContainer
            center={[0.5, 37.5]}
            zoom={7}
            style={{ height: '100%', width: '100%', background: 'transparent' }}
            zoomControl={false}
            attributionControl={false}
          >
            <MapUpdater center={[0.5, 37.5]} zoom={7} />
            
            {/* Dark tile layer for context */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              opacity={0.3}
            />
            
            {/* County boundaries */}
            <GeoJSON
              data={geoData as any}
              style={countyStyle}
              onEachFeature={onEachCounty}
              ref={(ref) => {
                if (ref) geoJsonLayerRef.current = ref;
              }}
            />
            
            {/* Alert markers */}
            {alerts.map(alert => {
              const position = getAlertPosition(alert.county);
              if (!position) return null;
              
              const isSelected = selectedId === alert.id;
              
              return (
                <Marker
                  key={alert.id}
                  position={position}
                  icon={createCustomIcon(alert.severity, isSelected)}
                  eventHandlers={{
                    click: () => onSelectAlert(alert.id),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="font-mono text-[10px] p-2">
                      <div className="font-bold text-white mb-1">{alert.county}</div>
                      <div className="text-slate-400">{alert.disease}</div>
                      <div className={cn(
                        "mt-1 uppercase font-bold",
                        alert.severity === 'red' ? 'text-rose-500' :
                        alert.severity === 'orange' ? 'text-orange-500' :
                        'text-yellow-500'
                      )}>
                        {alert.severity} ALERT
                      </div>
                      <div className="text-slate-500 mt-1 text-[9px]">
                        Risk: {alert.riskScore.toFixed(1)}%
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] bg-slate-950/60 p-3 border border-slate-800/50 rounded pointer-events-none flex flex-col space-y-2 backdrop-blur-sm z-30">
        <div className="text-slate-500 uppercase tracking-wider mb-1">Threat Level Legend</div>
        <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div><span className="text-slate-300">CRITICAL OUTBREAK</span></div>
        <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div><span className="text-slate-300">ELEVATED THREAT</span></div>
        <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div><span className="text-slate-300">MONITORING REQUIRED</span></div>
      </div>
      
      {/* Custom CSS for tooltips and popups */}
      <style>{`
        .custom-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          border-radius: 4px !important;
          padding: 8px !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          border-radius: 4px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-container {
          font-family: monospace !important;
        }
      `}</style>
    </div>
  );
}

// Made with Bob
