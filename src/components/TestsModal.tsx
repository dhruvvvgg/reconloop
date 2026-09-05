import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-[#0e0e12] border border-[#24242e] rounded-2xl max-w-3xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#22222a] bg-[#0a0a0d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight font-mono">
                ReconLoop Correctness Invariant Verification Suite
              </h2>
              <p className="text-xs text-zinc-400 font-mono text-[11px] mt-0.5">
                Automated regression verifying all 16 mission-critical financial predicates
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-rerun-tests"
              onClick={onRunTests}
              disabled={isRunningTests}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 font-mono"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Executing...' : 'Re-run Tests'}</span>
            </button>

            <button
              id="btn-close-tests-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141418] border border-[#24242e] text-zinc-400 hover:text-white hover:bg-[#1e1e26] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Summary Strip */}
        <div className="bg-[#121217] px-6 py-2.5 border-b border-[#22222a] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-zinc-400">Status:</span>
              {testSuiteResult?.all_passed ? (
                <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ALL PASSING (16/16)</span>
                </span>
              ) : (
                <span className="font-semibold text-rose-400 flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{testSuiteResult?.failed_count} FAILED</span>
                </span>
              )}
            </div>

            <div className="text-zinc-400">
              Passed: <strong className="text-emerald-400 font-normal">{testSuiteResult?.passed_count || 0}</strong>
            </div>

            <div className="text-zinc-400">
              Failed: <strong className="text-rose-400 font-normal">{testSuiteResult?.failed_count || 0}</strong>
            </div>
          </div>

          <div className="text-zinc-400 font-mono text-[11px] flex items-center space-x-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>Duration: {testSuiteResult?.duration_ms || 0}ms</span>
          </div>
        </div>

        {/* Tests List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {testSuiteResult?.tests.map((t, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-colors ${
                t.passed
                  ? 'bg-[#111116] border-[#22222a]'
                  : 'bg-[#180e10] border-rose-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  <span className="mt-0.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white font-mono">
                      {idx + 1}. {t.test_name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      {t.notes}
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase shrink-0 ${
                  t.passed
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {t.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              {/* Details */}
              <div className="mt-2.5 pt-2 border-t border-[#1e1e26] grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10.5px]">
                <div className="bg-[#0c0c0e] p-2 rounded-lg border border-[#1e1e26]">
                  <span className="text-zinc-500 block text-[9.5px] uppercase font-sans">Expected Predicate:</span>
                  <span className="text-zinc-300">{t.expected}</span>
                </div>

                <div className="bg-[#0c0c0e] p-2 rounded-lg border border-[#1e1e26]">
                  <span className="text-zinc-500 block text-[9.5px] uppercase font-sans">Actual Execution Result:</span>
                  <span className={t.passed ? 'text-emerald-400' : 'text-rose-400'}>
                    {t.actual}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 border-t border-[#22222a] bg-[#0a0a0d] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Target: <code className="text-zinc-300 font-mono">src/engine/verifier.ts</code></span>
          <button
            id="btn-close-tests-footer"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1e1e26] text-zinc-200 text-xs font-medium border border-[#24242e] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
