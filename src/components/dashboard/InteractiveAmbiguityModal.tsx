import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { EconomicEvent } from '../../types';
import { formatINR } from '../../utils/formatters';

interface InteractiveAmbiguityModalProps {
  isOpen: boolean;
  event: EconomicEvent | null;
  allEvents: EconomicEvent[];
  onSelectEvent: (event: EconomicEvent) => void;
  onClose: () => void;
}

export const InteractiveAmbiguityModal: React.FC<InteractiveAmbiguityModalProps> = ({
  isOpen,
  event,
  allEvents,
  onSelectEvent,
  onClose,
}) => {
  if (!isOpen || !event) return null;

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  const demoCase1 = allEvents.find((e) => e.order_id === 'ORD-2026-0042') || allEvents[41];
  const demoCase2 = allEvents.find((e) => e.discrepancy_class === 'PROMPT_INJECTION_REJECTED') || allEvents[98];

  const predicates = [
    {
      id: 'EVIDENCE_EXISTS',
      name: 'Source Evidence Existence',
      passed: event.linked_settlement_ids?.length > 0 && event.linked_bank_row_ids?.length > 0,
      details: `Settlement: ${event.linked_settlement_ids?.join(', ') || 'None'}, Bank: ${event.linked_bank_row_ids?.join(', ') || 'None'}`,
    },
    {
      id: 'INJECTION_DEFENSE',
      name: 'Instruction-Like Data Defense',
      passed: event.discrepancy_class !== 'PROMPT_INJECTION_REJECTED',
      details: event.discrepancy_class === 'PROMPT_INJECTION_REJECTED'
        ? 'Adversarial override directive pattern detected in bank narration'
        : 'Bank narration clean: No override or injection directives found',
    },
    {
      id: 'NO_DOUBLE_ASSIGNMENT',
      name: 'Single Ownership Conservation',
      passed: event.discrepancy_class !== 'DOUBLE_ASSIGNED_EVIDENCE',
      details: event.discrepancy_class === 'DOUBLE_ASSIGNED_EVIDENCE'
        ? 'Conflict: Bank row already claimed by another economic event'
        : 'Linked candidate evidence is exclusively owned by this event lifecycle',
    },
    {
      id: 'NO_DUPLICATE_CREDIT',
      name: 'Duplicate Credit Prevention',
      passed: event.discrepancy_class !== 'DUPLICATE_BANK_CREDIT',
      details: event.discrepancy_class === 'DUPLICATE_BANK_CREDIT'
        ? 'Multiple bank credits detected for single settlement payout'
        : 'Bank statement credits strictly match settlement payout batches',
    },
    {
      id: 'SETTLEMENT_ARITHMETIC',
      name: 'Settlement Arithmetic Consistency',
      passed: event.discrepancy_class !== 'SETTLEMENT_ARITHMETIC_MISMATCH',
      details: 'Gross minus fees equals reported net payout',
    },
    {
      id: 'LEDGER_CONSERVATION',
      name: 'Tri-Feed Conservation (P === G === B)',
      passed: Math.abs(event.policy_vs_bank_variance) < 0.02,
      details: `Policy Net: ${formatINR(event.policy_expected_net)} | Gateway: ${formatINR(event.gateway_reported_net)} | Bank: ${formatINR(event.bank_received_net)}`,
    },
    {
      id: 'TIMING_AND_CUTOFF',
      name: 'Settlement Window Cutoff Verification',
      passed: !event.is_timing_violation && event.discrepancy_class !== 'LATE_SETTLEMENT_AFTER_CUTOFF' && event.discrepancy_class !== 'MISSING_AFTER_CUTOFF',
      details: event.is_timing_violation
        ? `Deposited on ${event.actual_bank_date}, which is after cutoff ${event.expected_bank_arrival_cutoff}`
        : 'Transaction cleared within allowed settlement window',
    },
  ];

  const allPassed = predicates.every((p) => p.passed);

  useEffect(() => {
    setStepIndex(0);
    setIsSimulating(true);
  }, [event.event_id]);

  useEffect(() => {
    if (!isSimulating) return;
    if (stepIndex < predicates.length) {
      const timer = setTimeout(() => {
        setStepIndex((s) => s + 1);
      }, 450);
      return () => clearTimeout(timer);
    } else {
      setIsSimulating(false);
    }
  }, [stepIndex, isSimulating, predicates.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-3xl rounded-xl border shadow-2xl p-6 z-10 font-sans"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div 
          className="flex items-center justify-between pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              AI Ambiguity Resolution & Verifier Commit
            </h3>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
              Target: {event.order_id} ({event.event_id}) · Gross: {formatINR(event.order_amount)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setStepIndex(0);
                setIsSimulating(true);
              }}
              className="p-1.5 rounded-lg border transition-colors"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title="Re-run"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-colors"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Demo Cases:</span>
          {demoCase1 && (
            <button
              onClick={() => onSelectEvent(demoCase1)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors border"
              style={{
                backgroundColor: event.order_id === demoCase1.order_id ? 'var(--surface-raised)' : 'var(--surface-inset)',
                borderColor: event.order_id === demoCase1.order_id ? 'var(--accent)' : 'var(--border)',
                color: event.order_id === demoCase1.order_id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Case 1: Ambiguity Cleared
            </button>
          )}
          {demoCase2 && (
            <button
              onClick={() => onSelectEvent(demoCase2)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors border"
              style={{
                backgroundColor: event.order_id === demoCase2.order_id ? 'var(--surface-raised)' : 'var(--surface-inset)',
                borderColor: event.order_id === demoCase2.order_id ? 'var(--accent)' : 'var(--border)',
                color: event.order_id === demoCase2.order_id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Case 2: Injection Defended
            </button>
          )}
        </div>

        {/* Predicates Checklist */}
        <div className="mt-4 space-y-2">
          {predicates.map((p, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex && isSimulating;

            return (
              <div
                key={p.id}
                className="p-2.5 rounded-lg border text-xs transition-colors"
                style={{
                  backgroundColor: isDone
                    ? p.passed ? 'var(--positive-subtle)' : 'var(--error-subtle)'
                    : isCurrent ? 'var(--surface-raised)' : 'var(--surface-inset)',
                  borderColor: isDone
                    ? p.passed ? 'var(--positive)' : 'var(--error)'
                    : 'var(--border)',
                  color: isDone
                    ? p.passed ? 'var(--positive-text)' : 'var(--error-text)'
                    : 'var(--text-secondary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDone ? (
                      p.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )
                    ) : (
                      <span 
                        className="w-4 h-4 rounded-full border text-[10px] flex items-center justify-center font-mono"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        {idx + 1}
                      </span>
                    )}
                    <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  </div>

                  <span className="text-[10px] uppercase font-bold">
                    {isDone ? (p.passed ? 'PASS' : 'FAIL') : isCurrent ? 'CHECKING...' : 'QUEUED'}
                  </span>
                </div>

                {isDone && (
                  <p className="text-xs pl-6 mt-1 opacity-90 leading-tight">
                    {p.details}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        <div 
          className="mt-4 pt-3 border-t flex items-center justify-between text-xs"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <span className="text-[10px] block uppercase" style={{ color: 'var(--text-muted)' }}>Final Resolution Verdict</span>
            <span className="font-medium font-mono" style={{ color: 'var(--text-primary)' }}>
              {stepIndex === predicates.length
                ? allPassed
                  ? 'COMMIT_CLAIMS_TO_RESOLVED'
                  : 'REJECT_PROPOSAL_PERSIST_EXCEPTION'
                : 'Evaluating predicates...'}
            </span>
          </div>

          {stepIndex === predicates.length && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: allPassed ? 'var(--positive)' : 'var(--error)',
                color: '#ffffff',
              }}
            >
              {allPassed ? 'RESOLVED' : 'EXCEPTION'}
            </span>
          )}
        </div>

      </motion.div>
    </div>
  );
};
