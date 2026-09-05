import React, { useState, useRef, useEffect } from 'react';
import { LogoMark } from '../common/LogoMark';
import { ArrowLeft, RotateCw, ShieldCheck, MoreHorizontal, FileSpreadsheet, Database, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReconciliationRunResult, TestSuiteResult } from '../../types';
import { useTheme } from '../common/ThemeProvider';

interface DashboardHeaderProps {
  reconResult: ReconciliationRunResult | null;
  testSuiteResult: TestSuiteResult | null;
  mode: 'deterministic' | 'live_gemini';
  hasGeminiKey: boolean;
  isRunningRecon: boolean;
  isRunningTests: boolean;
  onBackToLanding: () => void;
  onRunReconciliation: (mode: 'deterministic' | 'live_gemini') => void;
  onOpenTestsModal: () => void;
  onOpenSourceFeeds: () => void;
  onReseed: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  reconResult,
  testSuiteResult,
  mode,
  hasGeminiKey,
  isRunningRecon,
  isRunningTests,
  onBackToLanding,
  onRunReconciliation,
  onOpenTestsModal,
  onOpenSourceFeeds,
  onReseed,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left identity & Navigation */}
        <div className="flex items-center space-x-3.5">
          <motion.button
            whileHover={{ scale: 1.04, x: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBackToLanding}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full transition-colors border shadow-sm cursor-pointer"
            style={{ 
              backgroundColor: 'var(--surface)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">Overview</span>
          </motion.button>

          <div className="flex items-center space-x-2.5">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
              <LogoMark size={24} />
            </motion.div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ReconLoop
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Settlement Console
              </span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Mode toggle */}
          <div className="inline-flex rounded-full p-0.5 border shadow-sm" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
            <button
              onClick={() => onRunReconciliation('deterministic')}
              disabled={isRunningRecon}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'deterministic' ? 'shadow-sm font-semibold' : 'font-medium'}`}
              style={{
                backgroundColor: mode === 'deterministic' ? 'var(--surface)' : 'transparent',
                color: mode === 'deterministic' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Deterministic
            </button>
            <button
              onClick={() => onRunReconciliation('live_gemini')}
              disabled={isRunningRecon}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'live_gemini' ? 'shadow-sm font-semibold' : 'font-medium'}`}
              style={{
                backgroundColor: mode === 'live_gemini' ? 'var(--surface)' : 'transparent',
                color: mode === 'live_gemini' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Live Gemini
            </button>
          </div>

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onRunReconciliation(mode)}
            disabled={isRunningRecon}
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isRunningRecon ? 'animate-spin' : ''}`} />
            <span>{isRunningRecon ? 'Reconciling...' : 'Run Reconcile'}</span>
          </motion.button>

          {/* Tests Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenTestsModal}
            className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs transition-colors border shadow-sm cursor-pointer"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {testSuiteResult ? `${testSuiteResult.passed_count}/${testSuiteResult.total_tests} Tests` : 'Run Tests'}
            </span>
          </motion.button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="p-1.5 rounded-full transition-colors border shadow-sm cursor-pointer"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl border py-1.5 z-50 overflow-hidden"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => { setIsMoreOpen(false); onOpenSourceFeeds(); }}
                    className="w-full text-left px-4 py-2.5 text-xs flex items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2.5" style={{ color: 'var(--accent)' }} />
                    Raw Source Feeds
                  </button>
                  <button
                    onClick={() => { setIsMoreOpen(false); onReseed(); }}
                    className="w-full text-left px-4 py-2.5 text-xs flex items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Database className="w-4 h-4 mr-2.5" style={{ color: 'var(--warning)' }} />
                    Reseed Benchmark
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-1.5 rounded-full transition-colors border shadow-sm cursor-pointer"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>

        </div>
      </div>
    </header>
  );
};
