// ============================================================================
// EpidermiWatch - Investigation Console (Right Panel)
// Tabbed interface for threat analysis and logistics
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, ShieldAlert, Cpu, ArrowUpRight, Share2, Save,
  Users, HeartPulse, Database, Truck
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { getCountyStats, getUtilizationColor } from '../../data/countyStats';
import { cn, alertLevelToSeverity } from '../../lib/utils';

type TabType = 'synthesis' | 'logistics';

export function Console() {
  const selectedAlert = useSystemStore(state => state.selectedAlert);
  const acknowledgeAlert = useSystemStore(state => state.acknowledgeAlert);
  const [activeTab, setActiveTab] = useState<TabType>('synthesis');

  if (!selectedAlert) {
    return (
      <div className="w-96 border-l border-slate-800 bg-slate-950/50 pt-14 z-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-6 text-center backdrop-blur-sm">
        <Terminal className="w-8 h-8 mb-4 opacity-20" />
        <p>AWAITING OPERATOR INPUT</p>
        <p className="opacity-50 mt-2">
          Select a node from the intelligence map or tactical feed to commence investigation.
        </p>
      </div>
    );
  }

  const severity = alertLevelToSeverity(selectedAlert.alertLevel);
  const isCritical = selectedAlert.alertLevel === 'RED';
  const countyStats = getCountyStats(selectedAlert.county);

  return (
    <div className="w-96 border-l border-slate-800 bg-slate-950 pt-14 z-20 flex flex-col relative overflow-hidden backdrop-blur-md">
      {/* Dynamic Background glow based on severity */}
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 opacity-[0.03] blur-3xl rounded-full pointer-events-none",
        isCritical ? 'bg-rose-500' : 
        selectedAlert.alertLevel === 'ORANGE' ? 'bg-orange-500' : 'bg-yellow-500'
      )} />

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 relative z-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">
          Analysis Console
        </h2>
        <div className="font-mono text-[10px] text-slate-500">
          #{selectedAlert.id.toString().padStart(4, '0')}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/50 bg-slate-950/80 p-2 relative z-10">
        <button 
          onClick={() => setActiveTab('synthesis')}
          className={cn(
            "flex-1 py-1.5 text-xs font-mono uppercase transition-colors rounded-sm",
            activeTab === 'synthesis' 
              ? 'bg-slate-800 text-slate-200' 
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          Threat Synthesis
        </button>
        <button 
          onClick={() => setActiveTab('logistics')}
          className={cn(
            "flex-1 py-1.5 text-xs font-mono uppercase transition-colors rounded-sm",
            activeTab === 'logistics' 
              ? 'bg-slate-800 text-slate-200' 
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          Logistics & Demo
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'synthesis' ? (
            <SynthesisTab key="synthesis" alert={selectedAlert} isCritical={isCritical} />
          ) : (
            <LogisticsTab key="logistics" alert={selectedAlert} countyStats={countyStats} />
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col space-y-2 relative z-10">
        <button 
          onClick={() => acknowledgeAlert(selectedAlert.id)}
          disabled={selectedAlert.acknowledged}
          className={cn(
            "w-full py-2.5 rounded font-mono text-[11px] uppercase tracking-widest font-semibold transition-all flex items-center justify-center",
            selectedAlert.acknowledged
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : isCritical 
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:brightness-110" 
                : "bg-slate-800 text-white hover:bg-slate-700"
          )}
        >
          {selectedAlert.acknowledged 
            ? "✓ Acknowledged" 
            : isCritical 
              ? "Initiate Emergency Protocol" 
              : "Acknowledge & Monitor"
          }
          {!selectedAlert.acknowledged && <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-70" />}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] uppercase text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center">
            <Share2 className="w-3 h-3 mr-1.5" /> Disseminate
          </button>
          <button className="py-2 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] uppercase text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center">
            <Save className="w-3 h-3 mr-1.5" /> Log Event
          </button>
        </div>
      </div>
    </div>
  );
}

function SynthesisTab({ alert, isCritical }: { alert: any; isCritical: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-5 flex flex-col space-y-6"
    >
      {/* Header Section */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <ShieldAlert className={cn(
            "w-6 h-6",
            isCritical ? 'text-rose-500' : 
            alert.alertLevel === 'ORANGE' ? 'text-orange-500' : 'text-yellow-500'
          )} />
          <h3 className="text-xl font-sans font-semibold text-slate-100 uppercase tracking-wide">
            {alert.county} <span className="opacity-50 font-light ml-1">/ {alert.disease}</span>
          </h3>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-500 opacity-80 uppercase tracking-widest">
          <span>Class: {alert.alertLevel}</span>
          <span>•</span>
          <span>T: {new Date(alert.detectedAt).toISOString().replace('T', ' ').substring(0, 16)}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">
            Risk Factor
          </span>
          <span className={cn(
            "font-mono text-2xl tracking-tighter",
            isCritical ? 'text-rose-400' : 'text-slate-200'
          )}>
            {alert.riskScore.toFixed(1)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">
            Anomalous Z-Score
          </span>
          <span className="font-mono text-2xl tracking-tighter text-slate-200">
            +{alert.zScore.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col col-span-2 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center relative z-10">
            <Cpu className="w-3 h-3 mr-1.5 opacity-70" /> AI Diagnostic Synthesis
          </span>
          <p className="font-sans text-sm text-slate-300 leading-relaxed relative z-10">
            {alert.watsonSummary}
          </p>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 flex w-full">
          Recommended Action Matrix
        </span>
        <ul className="text-sm font-sans space-y-2 text-slate-300">
          <li className="flex items-start">
            <span className="text-emerald-500 mr-2 font-bold opacity-70">01</span>
            <span className="opacity-90">{alert.recommendedAction}</span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-500 mr-2 font-bold opacity-70">02</span>
            <span className="opacity-90">Initiate localized supply chain surge for triage materials.</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

function LogisticsTab({ alert, countyStats }: { alert: any; countyStats: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-5 flex flex-col space-y-6"
    >
      <div>
        <h3 className="text-lg font-sans font-semibold text-slate-100 uppercase tracking-wide mb-1">
          County Profile: {alert.county}
        </h3>
        <div className="font-mono text-[10px] text-slate-500 opacity-80 uppercase tracking-widest">
          Live Resource Telemetry
        </div>
      </div>

      {countyStats ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col items-start">
              <Users className="w-4 h-4 text-emerald-500 mb-2 opacity-80" />
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Population
              </span>
              <span className="font-mono text-lg text-slate-200">
                {new Intl.NumberFormat().format(countyStats.population)}
              </span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col items-start">
              <HeartPulse className="w-4 h-4 text-emerald-500 mb-2 opacity-80" />
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Clinical Bed Cap.
              </span>
              <span className="font-mono text-lg text-slate-200">
                {new Intl.NumberFormat().format(countyStats.hospitalCapacity)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex justify-between items-center relative overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 left-0 bg-slate-800/50" 
              style={{ width: `${countyStats.currentUtilization}%` }} 
            />
            <div className="relative z-10 flex flex-col">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Health System Load
              </span>
              <span className={cn(
                "font-mono text-xl",
                countyStats.currentUtilization > 85 ? 'text-rose-500' : 'text-slate-200'
              )}>
                {countyStats.currentUtilization}% 
                <span className="text-xs opacity-50 ml-1">UTILIZATION</span>
              </span>
            </div>
            <Database className="w-6 h-6 text-slate-600 relative z-10" />
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-slate-800 pt-4">
            <div className="text-xs font-mono uppercase text-slate-500 mb-2 tracking-widest">
              Operational Units
            </div>
            
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/50">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Active Mobile Units</span>
              </div>
              <span className="font-mono text-emerald-400">
                {countyStats.activeResponseUnits} / 12
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/50">
              <div className="flex items-center space-x-2 text-sm">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Stockpile Status</span>
              </div>
              <span className={cn(
                "font-mono text-[10px] uppercase px-2 py-0.5 rounded border",
                countyStats.stockpileStatus === 'critical' 
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 
                countyStats.stockpileStatus === 'low' 
                  ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : 
                  'bg-emerald-500/20 text-emerald-500 border-emerald-500/50'
              )}>
                {countyStats.stockpileStatus}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10 opacity-50 font-mono text-xs text-slate-500">
          Logistics data unavailable for {alert.county}.
        </div>
      )}
    </motion.div>
  );
}

// Made with Bob
