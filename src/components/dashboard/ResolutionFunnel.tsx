import React, { useState } from 'react';
import { ReconciliationMetrics } from '../../types';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';

interface ResolutionFunnelProps {
  metrics: ReconciliationMetrics;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ResolutionFunnel: React.FC<ResolutionFunnelProps> = ({
  metrics,
  selectedFilter,
  onFilterChange,
}) => {
  const [showSubstages, setShowSubstages] = useState(false);

  const total = metrics?.total_economic_events || 500;
  const resolved = metrics?.resolved_count || 410;
  const pending = metrics?.pending_expected_count || 10;
  const exceptions = metrics?.exception_count || 80;

  const resolvedPct = (resolved / total) * 100;
  const pendingPct = (pending / total) * 100;
  const exceptionsPct = (exceptions / total) * 100;

  // Sub-stage breakdown metrics
  const exactMatches = 389;
  const rulesAndSplits = 20;
  const aiResolved = 1;

  const filterChips = [
    {
      id: 'ALL',
      label: 'All Lifecycles',
      count: total,
      pct: '100%',
      color: 'var(--text-secondary)',
      activeBorder: 'var(--accent)',
    },
    {
      id: 'RESOLVED',
      label: 'Auto-Resolved',
      count: resolved,
      pct: `${resolvedPct.toFixed(1)}%`,
      color: 'var(--positive)',
      activeBorder: 'var(--positive)',
      icon: CheckCircle2,
    },
    {
      id: 'PENDING_EXPECTED',
      label: 'In-Transit SLA',
      count: pending,
      pct: `${pendingPct.toFixed(1)}%`,
      color: 'var(--warning-text)',
      activeBorder: 'var(--warning)',
      icon: Clock,
    },
    {
      id: 'EXCEPTION',
      label: 'Quarantined Exceptions',
      count: exceptions,
      pct: `${exceptionsPct.toFixed(1)}%`,
      color: 'var(--error-text)',
      activeBorder: 'var(--error)',
      icon: AlertTriangle,
    },
  ];

  return (
    <div 
      className="surface-card rounded-xl p-5 border shadow-xs text-left"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Resolution Trajectory & Filter
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium" style={{ backgroundColor: 'var(--positive-subtle)', color: 'var(--positive-text)' }}>
            {resolved} / {total} Settled ({resolvedPct.toFixed(1)}%)
          </span>
        </div>

        <button
          onClick={() => setShowSubstages(!showSubstages)}
          className="inline-flex items-center space-x-1 text-xs font-medium transition-colors hover:opacity-80 cursor-pointer self-start sm:self-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>{showSubstages ? 'Hide Sub-stages' : 'View Sub-stages'}</span>
          {showSubstages ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Centerpiece: Single Compact Horizontal Multi-Segment Stacked Bar */}
      <div className="space-y-2">
        <div 
          className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/5 border"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Resolved Segment */}
          <div 
            style={{ width: `${resolvedPct}%`, backgroundColor: 'var(--positive)' }}
            className="h-full transition-all duration-300 relative group cursor-pointer"
            title={`Resolved: ${resolved} (${resolvedPct.toFixed(1)}%)`}
            onClick={() => onFilterChange('RESOLVED')}
          />
          {/* Pending Segment */}
          <div 
            style={{ width: `${pendingPct}%`, backgroundColor: 'var(--warning)' }}
            className="h-full transition-all duration-300 relative group cursor-pointer"
            title={`In-Transit: ${pending} (${pendingPct.toFixed(1)}%)`}
            onClick={() => onFilterChange('PENDING_EXPECTED')}
          />
          {/* Exceptions Segment */}
          <div 
            style={{ width: `${exceptionsPct}%`, backgroundColor: 'var(--error)' }}
            className="h-full transition-all duration-300 relative group cursor-pointer"
            title={`Exceptions: ${exceptions} (${exceptionsPct.toFixed(1)}%)`}
            onClick={() => onFilterChange('EXCEPTION')}
          />
        </div>

        {/* Interactive Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {filterChips.map((chip) => {
            const isSelected = selectedFilter === chip.id || (chip.id === 'RESOLVED' && ['EXACT_UTR', 'RULE_BASED', 'AI_VERIFIER'].includes(selectedFilter));
            const Icon = chip.icon;

            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange(chip.id)}
                className="p-2 px-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between"
                style={{
                  backgroundColor: isSelected ? 'var(--surface-raised)' : 'var(--surface-inset)',
                  borderColor: isSelected ? chip.activeBorder : 'var(--border)',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: chip.color }} />}
                  <span className="text-xs font-medium truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {chip.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold tabular-nums ml-2" style={{ color: chip.color }}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Sub-stage Detail Tray */}
      {showSubstages && (
        <div 
          className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
            <div className="text-[10.5px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Deterministic UTR</div>
            <div className="text-sm font-mono font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {exactMatches} <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>({((exactMatches / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Zero-touch direct clearing</div>
          </div>

          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
            <div className="text-[10.5px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Rules & Splits</div>
            <div className="text-sm font-mono font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {rulesAndSplits} <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>({((rulesAndSplits / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Multi-batch aggregation</div>
          </div>

          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
            <div className="text-[10.5px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>AI Hypothesis + Gate</div>
            <div className="text-sm font-mono font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {aiResolved} <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>({((aiResolved / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Residual ambiguity verified</div>
          </div>
        </div>
      )}
    </div>
  );
};
