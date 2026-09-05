import React, { useMemo } from 'react';
import { EconomicEvent, SourceException } from '../../types';
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { ArrowRight } from 'lucide-react';

interface ExceptionQueueViewProps {
  events: EconomicEvent[];
  sourceExceptions: SourceException[];
  onSelectEvent: (event: EconomicEvent) => void;
}

export const ExceptionQueueView: React.FC<ExceptionQueueViewProps> = ({
  events,
  sourceExceptions,
  onSelectEvent,
}) => {
  const exceptions = useMemo(() => {
    return events.filter((e) => e.status === 'EXCEPTION');
  }, [events]);

  const totalAmountAtRisk = useMemo(() => {
    const eeRisk = exceptions.reduce((sum, e) => sum + Math.abs(e.policy_vs_bank_variance || e.order_amount), 0);
    const srcRisk = sourceExceptions.reduce((sum, s) => sum + s.amount, 0);
    return eeRisk + srcRisk;
  }, [exceptions, sourceExceptions]);

  const categorized = useMemo(() => {
    const map = new Map<string, { count: number; totalRisk: number; items: EconomicEvent[] }>();
    exceptions.forEach((e) => {
      const cls = e.discrepancy_class || 'UNKNOWN_EXCEPTION';
      if (!map.has(cls)) {
        map.set(cls, { count: 0, totalRisk: 0, items: [] });
      }
      const group = map.get(cls)!;
      group.count += 1;
      group.totalRisk += Math.abs(e.policy_vs_bank_variance || e.order_amount);
      group.items.push(e);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].totalRisk - a[1].totalRisk);
  }, [exceptions]);

  return (
    <div className="space-y-4 text-left">
      {/* Triage summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          className="surface-card rounded-lg p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <span className="text-xs uppercase block font-medium" style={{ color: 'var(--text-muted)' }}>Exceptions in Queue</span>
          <div className="text-xl font-mono font-semibold mt-1 tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {exceptions.length} <span className="text-xs font-normal font-sans" style={{ color: 'var(--text-secondary)' }}>of 500 lifecycles</span>
          </div>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>16.0% Exception Rate</span>
        </div>

        <div 
          className="surface-card rounded-lg p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <span className="text-xs uppercase block font-medium" style={{ color: 'var(--text-muted)' }}>Total Amount at Risk</span>
          <div className="text-xl font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--error)' }}>
            {formatINR(totalAmountAtRisk)}
          </div>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>Unbalanced / Quarantined Capital</span>
        </div>

        <div 
          className="surface-card rounded-lg p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <span className="text-xs uppercase block font-medium" style={{ color: 'var(--text-muted)' }}>True Orphan Bank Credits</span>
          <div className="text-xl font-mono font-semibold mt-1 tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {sourceExceptions.length} <span className="text-xs font-normal font-sans" style={{ color: 'var(--text-secondary)' }}>Records</span>
          </div>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>Unlinked Feed Credits</span>
        </div>
      </div>

      {/* Exception Categories */}
      <div 
        className="surface-card rounded-lg border p-4"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
          Categorized Exposure Clusters ({categorized.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categorized.map(([className, data]) => {
            const isHigh = data.totalRisk > 50000 || className.includes('INJECTION');

            return (
              <div
                key={className}
                className="p-3.5 rounded-lg border flex flex-col justify-between transition-all"
                style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                      style={{
                        backgroundColor: isHigh ? 'var(--error-subtle)' : 'var(--warning-subtle)',
                        color: isHigh ? 'var(--error-text)' : 'var(--warning-text)',
                      }}
                    >
                      {isHigh ? 'HIGH RISK' : 'MEDIUM'}
                    </span>
                    <span className="font-semibold text-xs" style={{ color: 'var(--text-secondary)' }}>{data.count} events</span>
                  </div>

                  <h5 className="text-xs font-semibold mt-2.5 font-mono break-all" style={{ color: 'var(--text-primary)' }}>
                    {className}
                  </h5>
                </div>

                <div 
                  className="mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-sans"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="font-mono font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatINRCompact(data.totalRisk)}</span>
                  <button
                    onClick={() => onSelectEvent(data.items[0])}
                    className="flex items-center gap-1 font-medium hover:underline text-xs"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Queue List */}
      <div 
        className="surface-card rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div 
          className="p-3.5 border-b text-xs font-semibold"
          style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Individual Exception Events ({exceptions.length})
        </div>

        <div className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>
          {exceptions.map((e) => {
            const risk = Math.abs(e.policy_vs_bank_variance || e.order_amount);

            return (
              <div
                key={e.event_id}
                onClick={() => onSelectEvent(e)}
                className="p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{e.order_id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{e.discrepancy_class}</span>
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {e.resolution_rationale}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-right shrink-0">
                  <span className="font-mono font-bold tabular-nums" style={{ color: 'var(--error)' }}>{formatINR(risk)}</span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
