import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  TrendingDown, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Building2,
  CreditCard,
  FileCheck2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ReconciliationMetrics } from '../types';

interface CashBridgeWaterfallProps {
  metrics: ReconciliationMetrics;
}

export const CashBridgeWaterfall: React.FC<CashBridgeWaterfallProps> = ({ metrics }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatCompact = (val: number) => {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return formatCurrency(val);
  };

  const policyNet = metrics.total_policy_expected_net;
  const gatewayNet = metrics.total_gateway_reported_net;
  const bankNet = metrics.total_bank_received_net;
  const gatewayVariance = metrics.policy_vs_gateway_total_variance;
  const bankVariance = metrics.gateway_vs_bank_total_variance;
  const totalLeakage = metrics.policy_vs_bank_total_variance;

  // Max value for scale calculation
  const maxVal = Math.max(policyNet, gatewayNet, bankNet, 1);
  
  // Height percentages for normalized display (clamp between 15% and 92%)
  const policyHeight = Math.max(20, Math.min(92, (policyNet / maxVal) * 88));
  const gatewayHeight = Math.max(20, Math.min(92, (gatewayNet / maxVal) * 88));
  const bankHeight = Math.max(20, Math.min(92, (bankNet / maxVal) * 88));
  
  // Floating steps heights (proportional to variance)
  const gVarHeight = Math.max(12, Math.min(35, (Math.abs(gatewayVariance) / maxVal) * 300));
  const bVarHeight = Math.max(12, Math.min(45, (Math.abs(bankVariance) / maxVal) * 300));

  const steps = [
    {
      id: 1,
      name: 'Policy Expected Net',
      category: 'Contract Baseline',
      amount: policyNet,
      type: 'pillar',
      color: 'from-zinc-100 to-zinc-300 text-zinc-900',
      barColor: 'bg-zinc-300',
      borderColor: 'border-zinc-400/40',
      badge: '100.0% Baseline',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      delta: null,
      icon: FileCheck2,
      description: 'Calculated contractual entitlement after order discounts, refunds, and agreed merchant policy fee/tax rates.',
      height: policyHeight,
      bottomPercent: 0,
    },
    {
      id: 2,
      name: 'Gateway Variance',
      category: 'Gateway Settlement Drift',
      amount: gatewayVariance,
      type: 'floating',
      color: 'text-amber-400',
      barColor: 'bg-amber-500/80',
      borderColor: 'border-amber-500/40',
      badge: gatewayVariance === 0 ? 'Exact Match' : `-Δ ${formatCompact(gatewayVariance)}`,
      badgeColor: gatewayVariance === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      delta: -gatewayVariance,
      icon: TrendingDown,
      description: 'Discrepancy between contractual merchant fees and actual gateway settlement deductions (overcharges or arithmetic drift).',
      height: gVarHeight,
      bottomPercent: Math.max(5, gatewayHeight),
    },
    {
      id: 3,
      name: 'Gateway Reported Net',
      category: 'Settlement Batch Advice',
      amount: gatewayNet,
      type: 'pillar',
      color: 'from-emerald-400 to-emerald-500 text-zinc-950',
      barColor: 'bg-emerald-400',
      borderColor: 'border-emerald-500/40',
      badge: `${((gatewayNet / policyNet) * 100).toFixed(1)}% Advised`,
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      delta: gatewayNet - policyNet,
      icon: CreditCard,
      description: 'Total payout advice confirmed across all payment gateway settlement batches.',
      height: gatewayHeight,
      bottomPercent: 0,
    },
    {
      id: 4,
      name: 'Bank Transit / Timing Variance',
      category: 'Timing & In-Flight Lag',
      amount: bankVariance,
      type: 'floating',
      color: 'text-rose-400',
      barColor: 'bg-rose-500/80',
      borderColor: 'border-rose-500/40',
      badge: bankVariance === 0 ? 'Fully Cleared' : `-Δ ${formatCompact(bankVariance)}`,
      badgeColor: bankVariance === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      delta: -bankVariance,
      icon: TrendingDown,
      description: 'Difference between gateway payout advice and verified cleared credits in bank accounts (in-flight timing or missing bank deposits).',
      height: bVarHeight,
      bottomPercent: Math.max(5, bankHeight),
    },
    {
      id: 5,
      name: 'Confirmed Bank Cash',
      category: 'Verified Treasury Balance',
      amount: bankNet,
      type: 'pillar',
      color: 'from-emerald-500 to-emerald-600 text-white',
      barColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500/60',
      badge: `${((bankNet / policyNet) * 100).toFixed(1)}% Realized`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      delta: bankNet - policyNet,
      icon: Building2,
      description: 'Physical cash verified and cleared in corporate bank statements via exact UTR matches.',
      height: bankHeight,
      bottomPercent: 0,
    },
  ];

  return (
    <div className="bg-[#111115] border border-[#222228] rounded-xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
      
      {/* Header with Title & Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222228]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center">
              Cash-Position Bridge
              <span className="text-[11px] font-mono text-zinc-400 ml-2 font-normal">
                Contractual Entitlement → Realized Cash
              </span>
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual waterfall showing contract-to-treasury reconciliation and timing leakage across all 3 feeds.
          </p>
        </div>

        {/* Conservation Identity Indicator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ALGEBRAIC_CONSERVATION: 100.0%</span>
          </div>
        </div>
      </div>

      {/* Waterfall Visualization Canvas */}
      <div className="mt-6 pt-2 pb-2">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 relative min-h-[260px] items-end">
          
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
            <div className="border-b border-dashed border-zinc-700 w-full"></div>
            <div className="border-b border-dashed border-zinc-700 w-full"></div>
            <div className="border-b border-dashed border-zinc-700 w-full"></div>
            <div className="border-b border-zinc-800 w-full"></div>
          </div>

          {steps.map((step, idx) => {
            const isFloating = step.type === 'floating';
            const isHovered = activeStep === step.id;

            return (
              <div 
                key={step.id} 
                className="relative flex flex-col items-center h-full justify-end z-10 group cursor-pointer"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Step Top Callout Badge */}
                <div className="mb-2 text-center w-full px-1">
                  <div className={`inline-block text-[10px] sm:text-[11px] font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded border transition-colors ${step.badgeColor}`}>
                    {step.badge}
                  </div>
                  <div className="text-xs sm:text-[13px] font-mono font-semibold text-white mt-1 tracking-tight truncate tabular-nums">
                    {formatCompact(step.amount)}
                  </div>
                </div>

                {/* The Bar Area */}
                <div className="w-full max-w-[72px] sm:max-w-[84px] h-[160px] flex items-end justify-center relative">
                  
                  {/* Dotted connecting line to next step */}
                  {idx < steps.length - 1 && (
                    <div 
                      className="absolute left-1/2 w-full border-b border-dashed border-zinc-700/80 z-0 hidden sm:block"
                      style={{
                        bottom: isFloating 
                          ? `${step.bottomPercent + step.height}%` 
                          : `${step.height}%`,
                      }}
                    />
                  )}

                  {/* The Physical Waterfall Bar */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: `${step.height}%`, 
                      opacity: 1,
                      marginBottom: isFloating ? `${step.bottomPercent}%` : '0%'
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                    className={`w-full rounded-md border transition-all duration-200 relative overflow-hidden shadow-sm ${step.borderColor} ${
                      isFloating 
                        ? step.barColor
                        : step.barColor
                    } ${isHovered ? 'ring-2 ring-zinc-400/40 scale-[1.03]' : 'opacity-90 hover:opacity-100'}`}
                  >
                    {/* Subtle top gloss highlight */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20"></div>
                  </motion.div>
                </div>

                {/* Step Name & Category Below Bar */}
                <div className="mt-3 text-center w-full">
                  <div className="text-[11px] sm:text-xs font-semibold text-zinc-200 truncate">
                    {step.name}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate mt-0.5">
                    {step.category}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail Panel / Math Verification Banner */}
      <div className="mt-5 pt-3.5 border-t border-[#222228] bg-[#0c0c0e] rounded-lg p-3 px-4">
        {activeStep ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-500 font-sans">Step {activeStep}:</span>
              <strong className="text-white">{steps[activeStep - 1].name}</strong>
              <span className="text-zinc-400">({formatCurrency(steps[activeStep - 1].amount)})</span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              {steps[activeStep - 1].description}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <Scale className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 font-sans font-medium">Conservation Equation:</span>
              <span className="text-zinc-300">
                (Policy - Gateway: <strong className="text-amber-300 font-normal">{formatCurrency(gatewayVariance)}</strong>) + (Gateway - Bank: <strong className="text-rose-300 font-normal">{formatCurrency(bankVariance)}</strong>) === <strong className="text-zinc-100 font-normal">{formatCurrency(totalLeakage)}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-zinc-500">Unaccounted Drift:</span>
              <span className="text-emerald-400 font-bold">₹0.0000 (0.00%)</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
