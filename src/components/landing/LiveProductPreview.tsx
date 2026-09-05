import React, { useState } from 'react';
import { Search, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ReconciliationRunResult, EconomicEvent } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ImagePlaceholder } from '../common/ImagePlaceholder';

interface LiveProductPreviewProps {
  reconResult: ReconciliationRunResult | null;
  onLaunchApp: () => void;
  onSelectEvent?: (event: EconomicEvent) => void;
}

export function LiveProductPreview({
  reconResult,
  onLaunchApp,
  onSelectEvent,
}: LiveProductPreviewProps) {
  const [filter, setFilter] = useState<'ALL' | 'RESOLVED' | 'EXCEPTION'>('ALL');
  const [search, setSearch] = useState<string>('');

  const allEvents = reconResult?.economic_events || [];
  const metrics = reconResult?.metrics;

  const filteredEvents = allEvents
    .filter((e) => {
      if (filter !== 'ALL' && e.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return e.order_id.toLowerCase().includes(q) || e.payment_ref.toLowerCase().includes(q);
      }
      return true;
    })
    .slice(0, 7);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span 
            className="px-2 py-0.5 text-xs font-semibold rounded" 
            style={{ backgroundColor: 'var(--positive-subtle)', color: 'var(--positive-text)' }}
          >
            RESOLVED
          </span>
        );
      case 'PENDING_EXPECTED':
        return (
          <span 
            className="px-2 py-0.5 text-xs font-semibold rounded" 
            style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning-text)' }}
          >
            PENDING
          </span>
        );
      case 'EXCEPTION':
      default:
        return (
          <span 
            className="px-2 py-0.5 text-xs font-semibold rounded" 
            style={{ backgroundColor: 'var(--error-subtle)', color: 'var(--error-text)' }}
          >
            EXCEPTION
          </span>
        );
    }
  };

  return (
    <section id="live-preview" className="py-20 lg:py-28 border-t" style={{ backgroundColor: 'var(--canvas)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-left">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
              Live Telemetry Feed
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Every transaction accounted for.{' '}
              <span className="italic-serif text-[1.1em] font-normal" style={{ color: 'var(--text-primary)' }}>
                Down to the paise
              </span>.
            </h2>
            <p className="text-base font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Directly streaming the current active batch from the reconciliation engine. Each row connects an order item to its gateway settlement tranche and confirmed bank credit.
            </p>
          </div>

          <button
            onClick={onLaunchApp}
            className="inline-flex items-center px-4 py-2.5 rounded-lg border text-xs font-semibold shadow-xs transition-colors self-start md:self-auto cursor-pointer"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <span>Open Settlement Console</span>
            <ArrowUpRight className="w-4 h-4 ml-1.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* 4. SUPPORTING TELEMETRY TRANSITIONAL VIGNETTE */}
        <div className="mb-8">
          <ImagePlaceholder
            src="/images/telemetry.png"
            alt="Live settlement telemetry stream"
            label="LIVE TELEMETRY STREAM VIGNETTE"
            aspectRatio="aspect-[4/1]"
            heightClass="h-44 sm:h-56"
            className="shadow-md"
          />
        </div>

        {/* Embedded Card */}
        <div className="rounded-xl border shadow-sm overflow-hidden surface-card" style={{ borderColor: 'var(--border)' }}>
          
          {/* Stat Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b text-left" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 border-r md:border-b-0 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-inset)' }}>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Total Ingested</div>
              <div className="text-lg font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {(metrics?.total_economic_events || 500).toLocaleString()} orders
              </div>
            </div>
            <div className="p-4 border-r md:border-b-0 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-inset)' }}>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Auto-Resolved</div>
              <div className="text-lg font-mono font-bold mt-1 tabular-nums text-emerald-600 dark:text-emerald-400">
                {(metrics?.resolved_count || 410).toLocaleString()} (82.0%)
              </div>
            </div>
            <div className="p-4 border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-inset)' }}>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>In-Transit (SLA Window)</div>
              <div className="text-lg font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--warning-text)' }}>
                {(metrics?.pending_expected_count || 10).toLocaleString()} (2.0%)
              </div>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--surface-inset)' }}>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Quarantined Exceptions</div>
              <div className="text-lg font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--error-text)' }}>
                {(metrics?.exception_count || 80).toLocaleString()} (16.0%)
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div 
            className="p-3.5 px-5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID or Payment Ref..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              {(['ALL', 'RESOLVED', 'EXCEPTION'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: filter === s ? 'var(--accent)' : 'transparent',
                    color: filter === s ? 'var(--accent-text)' : 'var(--text-secondary)',
                  }}
                >
                  {s === 'ALL' ? 'All Rows' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr 
                  className="border-b text-[11px] font-medium uppercase tracking-wider" 
                  style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <th className="py-2.5 px-5">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payment Ref</th>
                  <th className="py-2.5 px-3 text-right">Invoiced Gross</th>
                  <th className="py-2.5 px-3 text-right">Gateway Net</th>
                  <th className="py-2.5 px-3 text-right">Bank Credit</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-5">Discrepancy Category</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredEvents.map((e) => (
                  <tr 
                    key={e.event_id}
                    onClick={() => onSelectEvent?.(e)}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-5 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {e.order_id}
                    </td>
                    <td className="py-3 px-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {e.order_date}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {e.payment_ref}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {formatINR(e.order_amount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {formatINR(e.gateway_reported_net)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums" style={{ color: 'var(--positive)' }}>
                      {formatINR(e.bank_received_net)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(e.status)}
                    </td>
                    <td className="py-3 px-5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {e.discrepancy_class ? e.discrepancy_class.replace(/_/g, ' ') : 'Standard Settlement'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Callout */}
          <div 
            className="p-3.5 px-5 border-t text-xs flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Full cryptographic audit trail attached to each row</span>
            </div>

            <button
              onClick={onLaunchApp}
              className="font-semibold text-xs transition-colors cursor-pointer"
              style={{ color: 'var(--accent-text)' }}
            >
              Inspect all 500 orders in full console &rarr;
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
