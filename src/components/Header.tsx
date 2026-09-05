import React from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet, 
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { ReconciliationRunResult, TestSuiteResult } from '../types';

interface HeaderProps {
  reconResult: ReconciliationRunResult | null;
  testSuiteResult: TestSuiteResult | null;
  mode: 'deterministic' | 'live_gemini';
  hasGeminiKey: boolean;
  isRunningRecon: boolean;
  isRunningTests: boolean;
  onRunReconciliation: (mode: 'deterministic' | 'live_gemini') => void;
  onOpenTestsModal: () => void;
  onOpenSourceFeeds: () => void;
  onReseed: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  reconResult,
  testSuiteResult,
  mode,
  hasGeminiKey,
  isRunningRecon,
  isRunningTests,
  onRunReconciliation,
  onOpenTestsModal,
  onOpenSourceFeeds,
  onReseed,
}) => {
  return (
    <header className="bg-[#0c0c0e] border-b border-[#222228] text-[#fafafa] sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Platform Title (Restrained Fintech Identity) */}
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#181820] border border-[#2c2c36] flex items-center justify-center font-mono font-bold text-white shadow-sm shrink-0 relative">
              <span className="text-sm tracking-tight text-white">R</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c0c0e]"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-base font-semibold tracking-tight text-white flex items-center">
                  ReconLoop
                </h1>
                <span className="px-1.5 py-0.5 text-[9.5px] font-mono font-medium rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                  v1.0.4-ENTERPRISE
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span>VERIFICATION_ENGINE</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                3-Feed Reconciler: Orders (₹) → Gateway Settlements (₹) → Bank Statement (₹)
              </p>
            </div>
          </div>

          {/* Controls and Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Mode Switcher Pill */}
            <div className="flex items-center rounded-lg bg-[#141418] p-0.5 border border-[#24242c] text-xs">
              <button
                id="btn-mode-deterministic"
                onClick={() => onRunReconciliation('deterministic')}
                disabled={isRunningRecon}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'deterministic'
                    ? 'bg-[#22222a] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Deterministic Seeded Execution"
              >
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-[11px]">Deterministic</span>
                </span>
              </button>

              <button
                id="btn-mode-gemini"
                onClick={() => onRunReconciliation('live_gemini')}
                disabled={isRunningRecon}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'live_gemini'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={hasGeminiKey ? 'Use live server-side Gemini model' : 'Gemini Key not configured; will fallback gracefully'}
              >
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-mono text-[11px]">Live Gemini</span>
                  {hasGeminiKey && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </span>
              </button>
            </div>

            {/* Run Reconciliation Button (Restrained Emerald Accent) */}
            <button
              id="btn-run-recon"
              onClick={() => onRunReconciliation(mode)}
              disabled={isRunningRecon}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 text-xs font-semibold shadow-[0_1px_8px_rgba(16,185,129,0.2)] transition-colors active:scale-[0.98]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunningRecon ? 'animate-spin' : ''}`} />
              <span>{isRunningRecon ? 'Reconciling...' : 'Reconcile'}</span>
            </button>

            {/* 16-Invariant Test Suite Trigger */}
            <button
              id="btn-open-tests-modal"
              onClick={onOpenTestsModal}
              disabled={isRunningTests}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1a1a22] text-zinc-200 border border-[#24242c] text-xs font-medium transition-colors"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${testSuiteResult?.all_passed ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Verification Suite</span>
              {testSuiteResult && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {testSuiteResult.passed_count}/{testSuiteResult.total_tests}
                </span>
              )}
            </button>

            {/* Inspect Source Feeds */}
            <button
              id="btn-open-sources"
              onClick={onOpenSourceFeeds}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1a1a22] text-zinc-300 border border-[#24242c] text-xs font-medium transition-colors"
              title="Inspect Orders, Settlements, and Bank CSVs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline font-mono text-[11px]">Source CSVs</span>
            </button>

            {/* Reseed Benchmark */}
            <button
              id="btn-reseed-data"
              onClick={onReseed}
              className="inline-flex items-center p-1.5 rounded-lg bg-[#141418] hover:bg-[#1a1a22] text-zinc-400 hover:text-zinc-200 border border-[#24242c] transition-colors"
              title="Reseed Benchmark Dataset"
            >
              <Database className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
