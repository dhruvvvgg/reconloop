import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Layers,
  ArrowDownRight,
  TrendingDown,
  Building2,
  ReceiptText
} from 'lucide-react';
import { ReconciliationMetrics } from '../types';
import { CashBridgeWaterfall } from './CashBridgeWaterfall';

interface SummaryMetricsProps {
  metrics: ReconciliationMetrics;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  metrics,
  selectedFilter,
  onFilterChange,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const hasGatewayVariance = Math.abs(metrics.policy_vs_gateway_total_variance) > 0.01;
  const hasBankVariance = Math.abs(metrics.gateway_vs_bank_total_variance) > 0.01;
  const hasTotalLeakage = Math.abs(metrics.policy_vs_bank_total_variance) > 0.01;

  return (
    <div className="space-y-5">
      
      {/* Top 4 Core Ledger Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Invoiced Value */}
        <div className="bg-[#111115] border border-[#222228] rounded-xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-zinc-700/60 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Feed 1 · Invoiced Orders
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            </div>
            <div className="text-[11px] text-zinc-400">Gross Order Value</div>
            <div className="text-2xl font-mono font-semibold text-white tracking-tight mt-1 tabular-nums">
              {formatCurrency(metrics.total_gross_order_amount)}
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#222228] flex items-center justify-between font-mono text-[11px] text-zinc-400">
            <span>Refunds: <strong className="text-zinc-200 font-normal">{formatCurrency(metrics.total_refunds)}</strong></span>
            <span>Disc: <strong className="text-zinc-200 font-normal">{formatCurrency(metrics.total_discounts)}</strong></span>
          </div>
        </div>

        {/* Card 2: Policy Expected Net */}
        <div className="bg-[#111115] border border-[#222228] rounded-xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-zinc-700/60 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Contractual Entitlement
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
            </div>
            <div className="text-[11px] text-zinc-400">Policy Expected Net</div>
            <div className="text-2xl font-mono font-semibold text-zinc-100 tracking-tight mt-1 tabular-nums">
              {formatCurrency(metrics.total_policy_expected_net)}
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#222228] flex items-center justify-between font-mono text-[11px] text-zinc-400">
            <span>Fees: <strong className="text-zinc-200 font-normal">{formatCurrency(metrics.total_policy_fees)}</strong></span>
            <span>Tax+TDS: <strong className="text-zinc-200 font-normal">{formatCurrency(metrics.total_policy_taxes + metrics.total_policy_tds)}</strong></span>
          </div>
        </div>

        {/* Card 3: Gateway Reported Net */}
        <div className="bg-[#111115] border border-[#222228] rounded-xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-zinc-700/60 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Feed 2 · Gateway Payouts
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[11px] text-zinc-400">Gateway Reported Net</div>
            <div className="text-2xl font-mono font-semibold text-emerald-400 tracking-tight mt-1 tabular-nums">
              {formatCurrency(metrics.total_gateway_reported_net)}
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#222228] flex items-center justify-between font-mono text-[11px]">
            <span className="text-zinc-400">Gateway Fees: <strong className="text-zinc-200 font-normal">{formatCurrency(metrics.total_gateway_fees)}</strong></span>
            <span className={hasGatewayVariance ? 'text-amber-400' : 'text-zinc-500'}>
              Δ: {formatCurrency(metrics.policy_vs_gateway_total_variance)}
            </span>
          </div>
        </div>

        {/* Card 4: Confirmed Bank Cash */}
        <div className="bg-[#111115] border border-[#222228] rounded-xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-zinc-700/60 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Feed 3 · Cleared Treasury
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-[11px] text-zinc-400">Bank Received Cash</div>
            <div className="text-2xl font-mono font-semibold text-emerald-400 tracking-tight mt-1 tabular-nums">
              {formatCurrency(metrics.total_bank_received_net)}
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#222228] flex items-center justify-between font-mono text-[11px]">
            <span className="text-zinc-400">Transit: <strong className={hasBankVariance ? 'text-rose-400 font-normal' : 'text-zinc-300 font-normal'}>{formatCurrency(metrics.gateway_vs_bank_total_variance)}</strong></span>
            <span className={hasTotalLeakage ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
              {hasTotalLeakage ? `Leak: ${formatCurrency(metrics.policy_vs_bank_total_variance)}` : '0 Leakage'}
            </span>
          </div>
        </div>

      </div>

      {/* Cash-Position Bridge Waterfall Chart (The Centerpiece Visual) */}
      <CashBridgeWaterfall metrics={metrics} />

      {/* Funnel Filter Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
        
        {/* All Events */}
        <button
          id="btn-filter-all"
          onClick={() => onFilterChange('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-[#181820] border-zinc-500 shadow-sm'
              : 'bg-[#111115] border-[#222228] hover:bg-[#15151b] hover:border-zinc-700/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">All Events</span>
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-mono font-semibold text-white tabular-nums">
            {metrics.total_economic_events}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">100% of Lifecycles</div>
        </button>

        {/* Resolved Events */}
        <button
          id="btn-filter-resolved"
          onClick={() => onFilterChange('RESOLVED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'RESOLVED'
              ? 'bg-[#0e1814] border-emerald-500/60 shadow-sm'
              : 'bg-[#111115] border-[#222228] hover:bg-[#15151b] hover:border-zinc-700/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 font-medium">Resolved</span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
          </div>
          <div className="text-xl font-mono font-semibold text-emerald-400 tabular-nums">
            {metrics.resolved_count}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            {((metrics.resolved_count / metrics.total_economic_events) * 100).toFixed(1)}% Settled & Cleared
          </div>
        </button>

        {/* Pending Expected */}
        <button
          id="btn-filter-pending"
          onClick={() => onFilterChange('PENDING_EXPECTED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'PENDING_EXPECTED'
              ? 'bg-[#1a1710] border-amber-500/60 shadow-sm'
              : 'bg-[#111115] border-[#222228] hover:bg-[#15151b] hover:border-zinc-700/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 font-medium">Pending</span>
            </div>
            <Clock className="w-3.5 h-3.5 text-amber-400/70" />
          </div>
          <div className="text-xl font-mono font-semibold text-amber-300 tabular-nums">
            {metrics.pending_expected_count}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            Within Cutoff SLA Window
          </div>
        </button>

        {/* Exceptions */}
        <button
          id="btn-filter-exceptions"
          onClick={() => onFilterChange('EXCEPTION')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'EXCEPTION'
              ? 'bg-[#1a1012] border-rose-500/60 shadow-sm'
              : 'bg-[#111115] border-[#222228] hover:bg-[#15151b] hover:border-zinc-700/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/90 font-medium">Exceptions</span>
            </div>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400/70" />
          </div>
          <div className="text-xl font-mono font-semibold text-rose-400 tabular-nums">
            {metrics.exception_count}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            Action / Audit Required
          </div>
        </button>

        {/* Source Exceptions */}
        <button
          id="btn-filter-source-exceptions"
          onClick={() => onFilterChange('SOURCE_EXCEPTIONS')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'SOURCE_EXCEPTIONS'
              ? 'bg-[#16101c] border-purple-500/60 shadow-sm'
              : 'bg-[#111115] border-[#222228] hover:bg-[#15151b] hover:border-zinc-700/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300/90 font-medium">Source Orphans</span>
            </div>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400/70" />
          </div>
          <div className="text-xl font-mono font-semibold text-purple-300 tabular-nums">
            {metrics.source_exceptions_count}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            Independent Feed-Only
          </div>
        </button>

      </div>

    </div>
  );
};
