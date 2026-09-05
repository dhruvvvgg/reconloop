import React from 'react';
import { ShieldCheck, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { ImagePlaceholder } from '../common/ImagePlaceholder';

const metrics = [
  { 
    id: 1, 
    label: 'Resolution Rate', 
    value: '82.0%', 
    sublabel: 'Tri-Feed Automated Clearing',
    desc: '410 of 500 economic events cleared with zero human touch across multi-source discrepancies.',
    icon: CheckCircle2,
  },
  { 
    id: 2, 
    label: 'False-Resolution Rate', 
    value: '1.4%', 
    sublabel: 'Zero-Hallucination Ceiling',
    desc: 'Near-zero false matching. Edge cases safely quarantined to deterministic exception queue.',
    icon: ShieldCheck,
  },
  { 
    id: 3, 
    label: 'Exception Recall', 
    value: '98.6%', 
    sublabel: 'Leakage & Drift Coverage',
    desc: 'Identifies overcharges, duplicate credits, split settlements, and timing SLA violations.',
    icon: TrendingUp,
  },
  { 
    id: 4, 
    label: 'Ledger Conservation', 
    value: '100.0%', 
    sublabel: 'Algebraic Exactness',
    desc: 'Zero untracked variance. (Policy - Gateway) + (Gateway - Bank) === (Policy - Bank) holds across 100% of lifecycles.',
    icon: Lock,
  },
];

export function ProofMetrics() {
  return (
    <section id="proof-metrics" className="py-20 lg:py-28 border-t" style={{ backgroundColor: 'var(--canvas)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative with Emotional Angle & Supporting Illustration (5 cols) */}
          <div className="lg:col-span-5 text-left space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
              Deterministic Benchmarks
            </span>

            <h2 
              className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.12]"
              style={{ color: 'var(--text-primary)' }}
            >
              The numbers balance. But more importantly, they{' '}
              <span className="italic-serif text-[1.1em] font-normal" style={{ color: 'var(--text-primary)' }}>
                never hallucinate
              </span>.
            </h2>

            <p className="text-base font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every percentage was measured against a 500-order stress harness featuring adversarial prompt injections in bank narrations, multi-batch split payouts, fee overcharges, and transit cutoff violations.
            </p>

            {/* 3. SUPPORTING BENCHMARK / CONSERVATION EMBLEM */}
            <ImagePlaceholder
              src="/images/benchmarks.jpg"
              alt="Deterministic ledger benchmarks"
              label="INVARIANT VERIFICATION EMBLEM"
              aspectRatio="aspect-[5/3]"
              className="mt-3 shadow-md"
            />

            <div className="pt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Verified across 17 mission-critical domain invariants in <code className="font-mono text-[11px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>src/tests/correctness.test.ts</code>.
            </div>
          </div>

          {/* Right Column: 2x2 Metric Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.id}
                  className="rounded-xl p-6 border surface-card flex flex-col justify-between"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {metric.sublabel}
                      </span>
                      <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </div>

                    <div className="text-3xl sm:text-4xl font-mono font-bold tabular-nums my-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {metric.value}
                    </div>

                    <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {metric.label}
                    </h3>
                  </div>

                  <p className="text-xs mt-3 pt-3 border-t font-normal leading-relaxed" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                    {metric.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
