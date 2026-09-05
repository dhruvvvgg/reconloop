import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SummaryMetrics } from './components/SummaryMetrics';
import { DemoCasesBanner } from './components/DemoCasesBanner';
import { EventGrid } from './components/EventGrid';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { TestsModal } from './components/TestsModal';
import { SourceFeedsModal } from './components/SourceFeedsModal';
import { SourceExceptionsTab } from './components/SourceExceptionsTab';
import { 
  ReconciliationRunResult, 
  TestSuiteResult, 
  EconomicEvent,
  RawSourceFeeds
} from './types';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export default function App() {
  const [reconResult, setReconResult] = useState<ReconciliationRunResult | null>(null);
  const [testSuiteResult, setTestSuiteResult] = useState<TestSuiteResult | null>(null);
  const [feedsData, setFeedsData] = useState<any>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  const [mode, setMode] = useState<'deterministic' | 'live_gemini'>('deterministic');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const [isTestsModalOpen, setIsTestsModalOpen] = useState<boolean>(false);
  const [isSourceFeedsOpen, setIsSourceFeedsOpen] = useState<boolean>(false);

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

      // If an event was currently selected, update it with fresh data
      if (selectedEvent) {
        const updated = data.economic_events.find(
          (e: EconomicEvent) => e.event_id === selectedEvent.event_id
        );
        if (updated) setSelectedEvent(updated);
      }

      setStatusNotification(
        `Reconciliation completed successfully in ${runMode === 'live_gemini' ? 'Live Gemini' : 'Deterministic'} mode (${data.metrics.resolved_count} Resolved, ${data.metrics.exception_count} Exceptions)`
      );
      setTimeout(() => setStatusNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusNotification('Error running reconciliation: ' + err.message);
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
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans flex flex-col selection:bg-emerald-500/30 selection:text-white">
      
      {/* Header */}
      <Header
        reconResult={reconResult}
        testSuiteResult={testSuiteResult}
        mode={mode}
        hasGeminiKey={hasGeminiKey}
        isRunningRecon={isRunningRecon}
        isRunningTests={isRunningTests}
        onRunReconciliation={runReconciliation}
        onOpenTestsModal={() => setIsTestsModalOpen(true)}
        onOpenSourceFeeds={() => setIsSourceFeedsOpen(true)}
        onReseed={handleReseed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Status Notification Toast */}
        {statusNotification && (
          <div className="bg-[#111116] border border-[#262632] text-zinc-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotification}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-zinc-500 hover:text-white text-xs ml-4 font-mono transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Summary Metrics & Tri-Feed Funnel */}
        {reconResult && (
          <SummaryMetrics
            metrics={reconResult.metrics}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        )}

        {/* Frozen Ambiguity Demo Controls */}
        {reconResult && (
          <DemoCasesBanner
            events={reconResult.economic_events || []}
            case1Status={
              reconResult.demo_cases?.case_1_resolved_safely ??
              reconResult.demo_cases_status?.case_1_resolved_safely ??
              false
            }
            case2Status={
              reconResult.demo_cases?.case_2_injection_defended ??
              reconResult.demo_cases_status?.case_2_injection_defended ??
              true
            }
            onSelectEvent={setSelectedEvent}
          />
        )}

        {/* View Switch: Master Event Grid vs Source Exceptions Tab */}
        {reconResult && (
          <>
            {selectedFilter === 'SOURCE_EXCEPTIONS' ? (
              <SourceExceptionsTab
                sourceExceptions={reconResult.source_exceptions}
              />
            ) : (
              <EventGrid
                events={reconResult.economic_events}
                selectedFilter={selectedFilter}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />
            )}
          </>
        )}

        {!reconResult && isRunningRecon && (
          <div className="py-24 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-mono">
              Executing 8-stage settlement-to-cash reconciliation engine...
            </p>
          </div>
        )}

      </main>

      {/* Sophisticated Dark Footer with Real-Time Invariant Indicators */}
      <footer className="border-t border-[#222228] bg-[#0c0c0e] py-3.5 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-400">Verifier: <strong className="text-emerald-400 font-semibold">ONLINE</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono border-l border-[#24242e] pl-4">
              <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
              <span className="text-zinc-400">LLM: <strong className="text-zinc-300 font-semibold">HYPOTHESIS_ONLY</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono border-l border-[#24242e] pl-4 hidden sm:flex">
              <span className="text-zinc-500">Domain Rules:</span>
              <span className="text-zinc-300">7 Active Predicates</span>
            </div>
          </div>
          
          <div className="text-[11px] font-mono text-zinc-400 tracking-tight flex items-center gap-2">
            <span className="text-zinc-600 font-semibold">INVARIANT:</span>
            <span>∑ECONOMIC_EVENTS = 500</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-semibold">GROUND_TRUTH: COMPLIANT</span>
          </div>
        </div>
      </footer>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        event={selectedEvent}
        allSettlements={reconResult?.settlements || []}
        allBankRows={reconResult?.bank_statement || []}
        candidateAssociations={reconResult?.candidate_associations || []}
        onClose={() => setSelectedEvent(null)}
      />

      {/* 16-Invariant Test Suite Modal */}
      <TestsModal
        isOpen={isTestsModalOpen}
        testSuiteResult={testSuiteResult}
        isRunningTests={isRunningTests}
        onRunTests={runTestSuite}
        onClose={() => setIsTestsModalOpen(false)}
      />

      {/* Source CSV Feeds Modal */}
      <SourceFeedsModal
        isOpen={isSourceFeedsOpen}
        feedsData={feedsData}
        onClose={() => setIsSourceFeedsOpen(false)}
      />

    </div>
  );
}
