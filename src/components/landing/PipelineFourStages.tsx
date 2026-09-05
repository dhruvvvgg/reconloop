import React, { useState } from 'react';
import { Database, Filter, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImagePlaceholder } from '../common/ImagePlaceholder';

const stages = [
  {
    id: 1,
    title: 'Canonical Normalization',
    subtitle: 'Step 01 · Three Streams Ingested',
    description: 'Every order record, gateway settlement batch, and bank credit narration is mapped into a normalized schema with explicit gross, fees, GST, and TDS.',
    icon: Database,
    specs: [
      'Orders: Invoiced gross, contractual 2.0% merchant fee, 18% GST, 1% TDS',
      'Gateway: Batched gross amount, gateway deductions, UTR reference',
      'Bank: Timestamped ledger credit and bank narration token',
    ],
    technicalNote: 'Zero synthetic drift. Every source row is ingested idempotently with cryptographic reference integrity.',
  },
  {
    id: 2,
    title: 'Deterministic Relational Core',
    subtitle: 'Step 02 · 77.8% Instant Clearing',
    description: 'Direct UTR and Payment Reference joins clear straightforward transactions in under 2ms without invoking AI or heuristic models.',
    icon: Filter,
    specs: [
      'Exact UTR join anchors gateway payout batches to bank statement credits',
      'Payment Reference matching pairs order items to gateway line items',
      'Multi-batch aggregator reconciles split settlements (Seq 1 + Seq 2)',
    ],
    technicalNote: '389 of 500 benchmark lifecycles instantly verified without consuming LLM inference tokens.',
  },
  {
    id: 3,
    title: 'AI Hypothesis Generator',
    subtitle: 'Step 03 · Untrusted Proposer',
    description: 'When UTRs are corrupted or truncated by legacy bank narrations, Gemini analyzes residual context to suggest candidate links within allowable SLA windows.',
    icon: Sparkles,
    specs: [
      'Candidate evidence search strictly bounded within banking cutoff dates',
      'Structured JSON output specifying candidate IDs, confidence, and rationale',
      'Zero execution authority: AI proposals cannot mutate financial states directly',
    ],
    technicalNote: 'Hypotheses are strictly quarantined until evaluated by the domain gatekeeper.',
  },
  {
    id: 4,
    title: 'Domain Verifier Gate',
    subtitle: 'Step 04 · Mathematical Commit',
    description: 'Before any event is committed to RESOLVED, it must pass 7 invariant domain predicates. Single ownership is enforced; non-compliant items are quarantined.',
    icon: Lock,
    specs: [
      'Single Ownership: Proves no bank credit is ever claimed by more than one event',
      'Algebraic Conservation: (Policy Net === Gateway Net === Bank Net) within ₹0.02',
      'Adversarial Defense: Rejects injection directives disguised in bank narrations',
    ],
    technicalNote: 'Single-verdict commit architecture: either committed to RESOLVED or quarantined to EXCEPTION.',
  },
];

export function PipelineFourStages() {
  const [activeStageId, setActiveStageId] = useState<number>(1);

  return (
    <section id="pipeline" className="py-20 lg:py-28 border-t" style={{ backgroundColor: 'var(--canvas)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 2-Column Architecture Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Column: Point-of-View Headline, Visual Anchor & Thesis (5 cols) */}
          <div className="lg:col-span-5 text-left lg:sticky lg:top-24 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
              Architecture & Integrity
            </span>

            <h2 
              className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.12]"
              style={{ color: 'var(--text-primary)' }}
            >
              When three financial feeds disagree, who holds the{' '}
              <span className="italic-serif text-[1.1em] font-normal" style={{ color: 'var(--text-primary)' }}>
                burden of truth
              </span>?
            </h2>

            <p className="text-base font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Manual settlement triage is a quiet drain on merchant margins. Spreadsheets miss split payouts, while generic AI hallucinates links between mismatched amounts.
            </p>

            <p className="text-base font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              ReconLoop enforces a fundamental separation of concerns: <strong style={{ color: 'var(--text-primary)' }}>AI is permitted to propose hypotheses, but only deterministic mathematical invariants have the authority to commit funds.</strong>
            </p>

            {/* 2. SUPPORTING ARCHITECTURE ILLUSTRATION / DIAGRAM-AS-ILLUSTRATION */}
            <ImagePlaceholder
              src="/images/pipeline.png"
              alt="Tri-stream convergence architecture"
              label="ARCHITECTURE ILLUSTRATION"
              aspectRatio="aspect-[16/10]"
              className="mt-4 shadow-md"
            />

            {/* Invariant Checklist Card */}
            <div 
              className="rounded-xl p-5 border surface-card space-y-3 mt-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'var(--text-primary)' }}>
                The Reconciliation Guarantee
              </span>
              <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>No double-assignment of bank credit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% pairwise variance identity conservation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Strict isolation of prompt injection in bank lines</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Chronological Stages (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {stages.map((stage) => {
              const isActive = activeStageId === stage.id;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className="rounded-xl p-6 border transition-all cursor-pointer surface-card"
                  style={{
                    backgroundColor: isActive ? 'var(--surface-raised)' : 'var(--surface)',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border shrink-0 mt-0.5"
                        style={{ 
                          backgroundColor: isActive ? 'var(--accent)' : 'var(--surface-inset)',
                          borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                          color: isActive ? 'var(--accent-text)' : 'var(--text-primary)' 
                        }}
                      >
                        0{stage.id}
                      </div>

                      <div>
                        <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {stage.subtitle}
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {stage.title}
                        </h3>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {stage.description}
                        </p>

                        {/* Specs */}
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-3 border-t space-y-2 text-xs"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                          >
                            {stage.specs.map((sp, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 shrink-0" />
                                <span>{sp}</span>
                              </div>
                            ))}
                            <div className="pt-2 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                              {stage.technicalNote}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <Icon className="w-5 h-5 shrink-0" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
