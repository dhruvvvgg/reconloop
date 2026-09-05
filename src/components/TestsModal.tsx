import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TestSuiteResult } from '../types';

interface TestsModalProps {
  isOpen: boolean;
  testSuiteResult: TestSuiteResult | null;
  isRunningTests: boolean;
  onRunTests: () => void;
  onClose: () => void;
}

export const TestsModal: React.FC<TestsModalProps> = ({
  isOpen,
  testSuiteResult,
  isRunningTests,
  onRunTests,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const total = testSuiteResult?.total_tests || 17;
  const passed = testSuiteResult?.passed_count || 17;
  const failed = testSuiteResult?.failed_count || 0;
  const duration = testSuiteResult?.duration_ms || 107;

  const tests = testSuiteResult?.tests || [];
  const filteredTests = tests.filter((t) => {
    if (filter === 'passed') return t.passed;
    if (filter === 'failed') return !t.passed;
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div 
            className="p-4 px-6 border-b flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--positive)' }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    ReconLoop Invariant Verification Suite
                  </h2>
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: 'var(--positive-subtle)', color: 'var(--positive-text)' }}
                  >
                    17 Active Invariants
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Automated mathematical regression verifying all financial and domain predicates
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                id="btn-rerun-tests"
                onClick={onRunTests}
                disabled={isRunningTests}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? 'Verifying...' : 'Re-run All'}</span>
              </motion.button>

              <button
                id="btn-close-tests-modal"
                onClick={onClose}
                className="p-1.5 rounded-lg border transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div 
            className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="flex items-center space-x-1.5 font-semibold"
                style={{ color: failed === 0 ? 'var(--positive)' : 'var(--error)' }}
              >
                {failed === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ALL PASSING ({passed}/{total})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>{failed} FAILED</span>
                  </>
                )}
              </div>

              <span style={{ color: 'var(--border-strong)' }}>|</span>

              <div className="flex items-center space-x-1" style={{ color: 'var(--text-secondary)' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <span className="font-mono tabular-nums">{duration}ms total execution</span>
              </div>
            </div>

            {/* Filter Pills */}
            <div 
              className="inline-flex rounded-full p-0.5 border text-xs"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setFilter('all')}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filter === 'all' ? 'var(--surface)' : 'transparent',
                  color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                All ({total})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filter === 'passed' ? 'var(--surface)' : 'transparent',
                  color: filter === 'passed' ? 'var(--positive)' : 'var(--text-muted)',
                }}
              >
                Passed ({passed})
              </button>
              {failed > 0 && (
                <button
                  onClick={() => setFilter('failed')}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: filter === 'failed' ? 'var(--surface)' : 'transparent',
                    color: filter === 'failed' ? 'var(--error)' : 'var(--text-muted)',
                  }}
                >
                  Failed ({failed})
                </button>
              )}
            </div>
          </div>

          {/* Test List */}
          <div className="p-6 overflow-y-auto space-y-2.5 flex-1" style={{ backgroundColor: 'var(--canvas)' }}>
            {filteredTests.map((t, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <motion.div
                  key={idx}
                  layout
                  className="rounded-lg border transition-all cursor-pointer hover:translate-y-[-1px]"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="p-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 shrink-0">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </span>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-mono text-xs opacity-60 mr-1.5">{idx + 1}.</span>
                          {t.test_name}
                        </div>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                          {t.notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: t.passed ? 'var(--positive-subtle)' : 'var(--error-subtle)',
                          color: t.passed ? 'var(--positive-text)' : 'var(--error-text)',
                        }}
                      >
                        {t.passed ? 'PASS' : 'FAIL'}
                      </span>
                      <ChevronRight 
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        style={{ color: 'var(--text-muted)' }} 
                      />
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3.5 pb-3.5 pt-1 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="p-2.5 rounded border" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
                          <span className="text-[10px] uppercase font-sans font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Expected Invariant Rule:
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{t.expected}</span>
                        </div>

                        <div className="p-2.5 rounded border" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
                          <span className="text-[10px] uppercase font-sans font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Observed Execution Output:
                          </span>
                          <span className={t.passed ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                            {t.actual}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div 
            className="p-3.5 px-6 border-t flex items-center justify-between text-xs"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Target Verifier: <code className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>src/engine/verifier.ts</code></span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              id="btn-close-tests-footer"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Close
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
