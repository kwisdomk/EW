// ============================================================================
// EpidermiWatch - Trend Analytics Chart (Bottom Panel)
// National aggregation with temporal velocity visualization
// ============================================================================

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useSystemStore } from '../../store/useSystemStore';

// Mock trend data - in production, this would come from the backend
const mockTrendData = [
  { day: 'Mon', cases: 120, baseline: 110 },
  { day: 'Tue', cases: 132, baseline: 112 },
  { day: 'Wed', cases: 180, baseline: 111 },
  { day: 'Thu', cases: 240, baseline: 115 },
  { day: 'Fri', cases: 310, baseline: 114 },
  { day: 'Sat', cases: 410, baseline: 110 },
  { day: 'Sun', cases: 390, baseline: 108 },
];

export function Charts() {
  const alerts = useSystemStore(state => state.alerts);
  
  // Calculate disease breakdown
  const diseaseBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.disease] = (acc[alert.disease] || 0) + (alert.cases || 1);
    return acc;
  }, {} as Record<string, number>);
  
  const totalCases = Object.values(diseaseBreakdown).reduce((sum, count) => sum + count, 0);
  const topDiseases = Object.entries(diseaseBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // Calculate percentage change (mock)
  const percentChange = 14;
  
  return (
    <div className="h-64 border-t border-slate-800 bg-slate-950 flex z-30">
      {/* Left section: Stats */}
      <div className="w-80 border-r border-slate-800 p-4 flex flex-col justify-between bg-slate-900/20">
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">
            National Aggregation
          </div>
          <div className="text-3xl font-sans font-light text-slate-200 tracking-tight">
            {totalCases.toLocaleString()}{' '}
            <span className="text-sm font-mono text-rose-500 ml-1">
              ↑ +{percentChange}%
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono uppercase mt-1">
            Active Cases (7D-MA)
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          {topDiseases.map(([disease, count]) => (
            <div key={disease} className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">{disease}</span>
              <span className="text-slate-200">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Chart */}
      <div className="flex-1 p-4 flex flex-col relative">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            Temporal Velocity [Global]
          </span>
          <div className="flex space-x-3 font-mono text-[9px] uppercase">
            <span className="flex items-center text-slate-400">
              <span className="w-2 h-2 bg-rose-500 opacity-50 mr-1 rounded-sm"/> Actual
            </span>
            <span className="flex items-center text-slate-400">
              <span className="w-2 h-2 bg-emerald-500 opacity-50 mr-1 rounded-sm"/> Baseline
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={5} 
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#020617', 
                  borderColor: '#1e293b', 
                  fontSize: '11px', 
                  fontFamily: 'monospace' 
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <ReferenceLine 
                y={150} 
                stroke="#f59e0b" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5} 
                label={{ 
                  position: 'insideTopLeft', 
                  value: 'ALERT THRESHOLD', 
                  fill: '#f59e0b', 
                  fontSize: 9, 
                  opacity: 0.5 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="baseline" 
                stroke="#10b981" 
                strokeOpacity={0.5} 
                strokeWidth={1} 
                fillOpacity={0} 
              />
              <Area 
                type="monotone" 
                dataKey="cases" 
                stroke="#f43f5e" 
                fillOpacity={1} 
                fill="url(#colorCases)" 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
