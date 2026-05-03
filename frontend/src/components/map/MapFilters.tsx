// ============================================================================
// EpidermiWatch - Map Filter HUD
// Floating filter controls for map display
// ============================================================================

import { Filter } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { AlertLevel } from '../../types';
import { cn } from '../../lib/utils';

export function MapFilters() {
  const filterSeverity = useSystemStore(state => state.filterSeverity);
  const filterDisease = useSystemStore(state => state.filterDisease);
  const setFilterSeverity = useSystemStore(state => state.setFilterSeverity);
  const setFilterDisease = useSystemStore(state => state.setFilterDisease);
  const getUniqueDiseases = useSystemStore(state => state.getUniqueDiseases);
  const resetFilters = useSystemStore(state => state.resetFilters);
  
  const diseases = getUniqueDiseases();
  
  return (
    <div className="absolute top-20 right-6 z-30 font-mono text-[10px] bg-slate-950/80 border border-slate-800 rounded p-3 backdrop-blur-md flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
        <div className="flex items-center">
          <Filter className="w-3 h-3 mr-2" />
          Display Filters
        </div>
        {(filterSeverity !== 'ALL' || filterDisease !== 'ALL') && (
          <button
            onClick={resetFilters}
            className="text-[9px] text-rose-500 hover:text-rose-400 transition-colors"
          >
            RESET
          </button>
        )}
      </div>
      
      {/* Severity Filter */}
      <div className="space-y-2">
        <div className="text-slate-500 uppercase">Severity</div>
        <div className="flex space-x-1">
          <FilterButton
            active={filterSeverity === 'ALL'}
            onClick={() => setFilterSeverity('ALL')}
            label="ALL"
          />
          <FilterButton
            active={filterSeverity === 'RED'}
            onClick={() => setFilterSeverity('RED')}
            label="RED"
            activeClass="bg-rose-500/20 border-rose-500/50 text-rose-500"
          />
          <FilterButton
            active={filterSeverity === 'ORANGE'}
            onClick={() => setFilterSeverity('ORANGE')}
            label="ORG"
            activeClass="bg-orange-500/20 border-orange-500/50 text-orange-500"
          />
          <FilterButton
            active={filterSeverity === 'YELLOW'}
            onClick={() => setFilterSeverity('YELLOW')}
            label="YEL"
            activeClass="bg-yellow-500/20 border-yellow-500/50 text-yellow-500"
          />
        </div>
      </div>

      {/* Disease Filter */}
      <div className="space-y-2">
        <div className="text-slate-500 uppercase">Disease Type</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setFilterDisease('ALL')}
            className={cn(
              "px-2 py-1 border rounded transition-colors col-span-2 text-center",
              filterDisease === 'ALL'
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'border-slate-800 text-slate-500 hover:text-slate-300'
            )}
          >
            ALL VECTORS
          </button>
          {diseases.slice(0, 4).map(disease => (
            <button
              key={disease}
              onClick={() => setFilterDisease(disease)}
              className={cn(
                "px-2 py-1 border rounded transition-colors text-center",
                filterDisease === disease
                  ? 'bg-slate-800 border-slate-600 text-slate-200'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              )}
            >
              {disease.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Active Filter Count */}
      {(filterSeverity !== 'ALL' || filterDisease !== 'ALL') && (
        <div className="text-[9px] text-emerald-500 border-t border-slate-800 pt-2">
          FILTERS ACTIVE
        </div>
      )}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  activeClass?: string;
}

function FilterButton({ active, onClick, label, activeClass }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 border rounded transition-colors",
        active
          ? activeClass || 'bg-slate-800 border-slate-600 text-slate-200'
          : 'border-slate-800 text-slate-500 hover:text-slate-300'
      )}
    >
      {label}
    </button>
  );
}

// Made with Bob