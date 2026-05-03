// ============================================================================
// EpidermiWatch - System State Interface
// Real-time operational status and global metrics
// ============================================================================

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { cn } from '../../lib/utils';

export function Header() {
  const [time, setTime] = useState(new Date());
  const alerts = useSystemStore(state => state.alerts);
  const systemMode = useSystemStore(state => state.systemMode);
  const toggleSystemMode = useSystemStore(state => state.toggleSystemMode);
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Calculate alert counts
  const criticalCount = alerts.filter(a => a.alertLevel === 'RED').length;
  const elevatedCount = alerts.filter(a => a.alertLevel === 'ORANGE').length;
  const monitoringCount = alerts.filter(a => a.alertLevel === 'YELLOW').length;
  const totalActiveAlerts = criticalCount + elevatedCount + monitoringCount;
  
  // Determine system operational state
  const getSystemState = () => {
    if (criticalCount > 0) return { status: 'DEGRADED', color: 'text-orange-500', icon: AlertTriangle };
    if (elevatedCount > 3) return { status: 'DEGRADED', color: 'text-orange-500', icon: AlertTriangle };
    if (totalActiveAlerts > 0) return { status: 'LIVE', color: 'text-cyan-400', icon: Activity };
    return { status: 'STABLE', color: 'text-emerald-500', icon: CheckCircle2 };
  };
  
  const systemState = getSystemState();
  const StateIcon = systemState.icon;
  
  // Generate status message
  const getStatusMessage = () => {
    if (criticalCount > 0) {
      return `${criticalCount} critical outbreak${criticalCount > 1 ? 's' : ''} requiring immediate response`;
    }
    if (elevatedCount > 0) {
      return `${elevatedCount} elevated threat${elevatedCount > 1 ? 's' : ''} under active monitoring`;
    }
    if (monitoringCount > 0) {
      return `${monitoringCount} situation${monitoringCount > 1 ? 's' : ''} tracked, baseline surveillance active`;
    }
    return 'All systems nominal, continuous surveillance active';
  };
  
  // Format UTC time
  const utcTime = time.toISOString().split('T')[1].slice(0, 8);
  const utcDate = time.toISOString().split('T')[0];
  
  return (
    <header className="h-12 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-between px-4 fixed top-0 w-full z-50 text-[10px] font-mono">
      {/* Left: System ID & Operational State */}
      <div className="flex items-center space-x-4">
        {/* Minimal Branding */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-semibold tracking-wide">EW</span>
        </div>
        
        <div className="h-3 w-px bg-slate-800"></div>
        
        {/* System Operational State */}
        <div className="flex items-center space-x-2">
          <StateIcon className={cn("w-3.5 h-3.5", systemState.color)} />
          <span className={cn("uppercase tracking-wider font-semibold", systemState.color)}>
            {systemState.status}
          </span>
        </div>
        
        <div className="h-3 w-px bg-slate-800"></div>
        
        {/* Mode Toggle - Compact */}
        <div className="flex bg-slate-900/50 rounded border border-slate-800/50 p-0.5">
          <button
            onClick={() => systemMode !== 'OPERATIONS' && toggleSystemMode()}
            className={cn(
              "px-2 py-0.5 rounded-sm transition-colors uppercase tracking-wide",
              systemMode === 'OPERATIONS'
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            OPS
          </button>
          <button
            onClick={() => systemMode !== 'ANALYSIS' && toggleSystemMode()}
            className={cn(
              "px-2 py-0.5 rounded-sm transition-colors uppercase tracking-wide",
              systemMode === 'ANALYSIS'
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            ANLYS
          </button>
        </div>
      </div>

      {/* Center: Status Message & Alert Counters */}
      <div className="flex-1 flex items-center justify-center space-x-6">
        {/* One-line Status Message */}
        <div className="text-slate-400 max-w-md truncate">
          {getStatusMessage()}
        </div>
        
        <div className="h-3 w-px bg-slate-800"></div>
        
        {/* Compact Alert Counters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-rose-500 font-bold tabular-nums">{criticalCount}</span>
            <span className="text-slate-600 uppercase">CRIT</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-orange-500 font-bold tabular-nums">{elevatedCount}</span>
            <span className="text-slate-600 uppercase">ELEV</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 font-bold tabular-nums">{monitoringCount}</span>
            <span className="text-slate-600 uppercase">MON</span>
          </div>
        </div>
      </div>

      {/* Right: UTC Clock */}
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-slate-500 uppercase tracking-wider">UTC</span>
          <span className="text-slate-300 tabular-nums font-semibold">{utcTime}</span>
        </div>
        <div className="text-slate-600 text-[9px]">{utcDate}</div>
      </div>
    </header>
  );
}

// Made with Bob
