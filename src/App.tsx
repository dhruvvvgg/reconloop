import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/common/ThemeProvider';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { 
  ReconciliationRunResult, 
  TestSuiteResult, 
  EconomicEvent 
} from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');

  const [reconResult, setReconResult] = useState<ReconciliationRunResult | null>(null);
  const [testSuiteResult, setTestSuiteResult] = useState<TestSuiteResult | null>(null);
  const [feedsData, setFeedsData] = useState<any>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  const [mode, setMode] = useState<'deterministic' | 'live_gemini'>('deterministic');
  const [isRunningRecon, setIsRunningRecon] = useState<boolean>(false);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Safe JSON fetcher that verifies content-type and prevents JSON.parse syntax errors on HTML responses
  const safeFetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    
    if (!res.ok) {
      let message = `Request to ${url} failed with status ${res.status}`;
      if (contentType.includes('application/json')) {
        try {
          const errData = await res.json();
          if (errData?.error) message = errData.error;
        } catch {
          // ignore
        }
      }
      throw new Error(message);
    }

    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON response from ${url} but received "${contentType || 'non-JSON'}"`);
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;

    // Check config
    safeFetchJson<{ has_gemini_key?: boolean }>('/api/config')
      .then((cfg) => {
        if (isMounted && cfg?.has_gemini_key) setHasGeminiKey(true);
      })
      .catch((err) => {
        console.warn('Could not load config:', err.message);
      });

    // Run initial reconciliation
    runReconciliation('deterministic');

    // Run test suite
    runTestSuite();

    // Fetch feed samples
    safeFetchJson<any>('/api/benchmark-feeds')
      .then((data) => {
        if (isMounted) setFeedsData(data);
      })
      .catch((err) => {
        console.warn('Could not load benchmark feeds:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const runReconciliation = async (runMode: 'deterministic' | 'live_gemini') => {
    setIsRunningRecon(true);
    setMode(runMode);
    try {
      const data = await safeFetchJson<ReconciliationRunResult>('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: runMode }),
      });
      setReconResult(data);

      setStatusNotification(
        `Reconciliation verified in ${runMode === 'live_gemini' ? 'Live Gemini' : 'Deterministic'} mode: ${data.metrics.resolved_count} Resolved, ${data.metrics.exception_count} Exceptions`
      );
      setTimeout(() => setStatusNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusNotification('Reconciliation error: ' + err.message);
    } finally {
      setIsRunningRecon(false);
    }
  };

  const runTestSuite = async () => {
    setIsRunningTests(true);
    try {
      const data = await safeFetchJson<TestSuiteResult>('/api/run-tests', { method: 'POST' });
      setTestSuiteResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleReseed = async () => {
    try {
      await safeFetchJson('/api/reseed', { method: 'POST' });
      runReconciliation(mode);
      const data = await safeFetchJson<any>('/api/benchmark-feeds');
      setFeedsData(data);
      setStatusNotification('Benchmark dataset reseeded deterministically.');
      setTimeout(() => setStatusNotification(null), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {currentPage === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <DashboardView
              reconResult={reconResult}
              testSuiteResult={testSuiteResult}
              feedsData={feedsData}
              mode={mode}
              hasGeminiKey={hasGeminiKey}
              isRunningRecon={isRunningRecon}
              isRunningTests={isRunningTests}
              statusNotification={statusNotification}
              onDismissNotification={() => setStatusNotification(null)}
              onBackToLanding={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentPage('landing');
              }}
              onRunReconciliation={runReconciliation}
              onRunTestSuite={runTestSuite}
              onReseed={handleReseed}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <LandingPage
              reconResult={reconResult}
              onLaunchApp={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentPage('dashboard');
              }}
              isRunningRecon={isRunningRecon}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
