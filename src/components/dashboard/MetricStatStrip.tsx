import React, { useState } from 'react';
import { ReconciliationMetrics } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MetricStatStripProps {
  metrics: ReconciliationMetrics;
}

export const MetricStatStrip: React.FC<MetricStatStripProps> = ({ metrics }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const gatewayVariance = metrics.policy_vs_gateway_total_variance;
  const bankVariance = metrics.gateway_vs_bank_total_variance;

  const stats = [
    {
      id: 'gross',
      label: 'Gross Invoiced Volume',
      sublabel: '500 Orders Ingested',
      amount: metrics.total_gross_order_amount,
      breakdown: [
        { name: 'Discounts', val: formatINR(metrics.total_discounts) },
        { name: 'Refunds', val: formatINR(metrics.total_refunds) },
      ],
    },
    {
      id: 'policy',
      label: 'Policy Expected Net',
      sublabel: 'Contractual Baseline',
      amount: metrics.total_policy_expected_net,
      breakdown: [
        { name: 'Policy Fees (2%)', val: formatINR(metrics.total_policy_fees) },
        { name: 'GST & TDS', val: formatINR(metrics.total_policy_taxes + metrics.total_policy_tds) },
      ],
    },
    {
      id: 'gateway',
      label: 'Gateway Reported Net',
      sublabel: 'Settlement Batches',
      amount: metrics.total_gateway_reported_net,
      breakdown: [
        { name: 'Gateway Deductions', val: formatINR(metrics.total_gateway_fees) },
        { name: 'Gateway Variance', val: formatINR(gatewayVariance, true), highlight: Math.abs(gatewayVariance) > 0.01 },
      ],
    },
    {
      id: 'bank',
      label: 'Confirmed Bank Cash',
      sublabel: 'Realized Treasury',
      amount: metrics.total_bank_received_net,
      breakdown: [
        { name: 'Realized Payouts', val: formatINR(metrics.confirmed_cash) },
        { name: 'In-Transit / Lag', val: formatINR(bankVariance, true), highlight: Math.abs(bankVariance) > 0.01 },
      ],
    },
  ];

  return (
    <div 
      className="surface-card rounded-xl border shadow-xs overflow-hidden transition-all"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Sleek, Quiet Unified 4-Column Horizontal Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        {stats.map((s, idx) => (
          <div key={s.id} className="p-3.5 px-5 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {s.sublabel}
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-mono font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {formatINR(s.amount, false)}
              </span>

              {idx === 3 && (
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium transition-colors hover:opacity-80 cursor-pointer ml-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>{showBreakdown ? 'Hide Details' : 'Details'}</span>
                  {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Secondary Breakdown Tray (Quiet & Secondary) */}
      {showBreakdown && (
        <div 
          className="border-t px-5 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
        >
          {stats.map((s) => (
            <div key={s.id} className="space-y-1 text-left">
              {s.breakdown.map((b, bIdx) => (
                <div key={bIdx} className="flex items-center justify-between text-[11px]">
                  <span style={{ color: 'var(--text-muted)' }}>{b.name}</span>
                  <span 
                    className="font-mono tabular-nums font-medium"
                    style={{ color: b.highlight ? 'var(--warning-text)' : 'var(--text-secondary)' }}
                  >
                    {b.val}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
