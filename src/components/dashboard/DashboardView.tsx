import React, { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { MetricStatStrip } from './MetricStatStrip';
import { CashPositionBridge } from './CashPositionBridge';
import { ResolutionFunnel } from './ResolutionFunnel';
import { TransactionTable } from './TransactionTable';
import { ExceptionQueueView } from './ExceptionQueueView';
import { TriFeedDrawer } from './TriFeedDrawer';
import { InteractiveAmbiguityModal } from './InteractiveAmbiguityModal';
import { TestsModal } from '../TestsModal';
import { SourceFeedsModal } from '../SourceFeedsModal';
import { ReconciliationRunResult, TestSuiteResult, EconomicEvent, ReconciliationMetrics } from '../../types';
import { CheckCircle2, RotateCw } from 'lucide-react';

interface DashboardViewProps {
  reconResult: ReconciliationRunResult | null;
  testSuiteResult: TestSuiteResult | null;
  feedsData: any;
  mode: 'deterministic' | 'live_gemini';
  hasGeminiKey: boolean;
  isRunningRecon: boolean;
  isRunningTests: boolean;
  statusNotification: string | null;
  onDismissNotification: () => void;
  onBackToLanding: () => void;
  onRunReconciliation: (mode: 'deterministic' | 'live_gemini') => void;
  onRunTestSuite: () => void;
  onReseed: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reconResult,
  testSuiteResult,
  feedsData,
  mode,
  hasGeminiKey,
  isRunningRecon,
  isRunningTests,
  statusNotification,
  onDismissNotification,
  onBackToLanding,
  onRunReconciliation,
  onRunTestSuite,
  onReseed,
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'EXCEPTIONS'>('TRANSACTIONS');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const [isTestsModalOpen, setIsTestsModalOpen] = useState<boolean>(false);
  const [isSourceFeedsOpen, setIsSourceFeedsOpen] = useState<boolean>(false);
  const [isAmbiguityModalOpen, setIsAmbiguityModalOpen] = useState<boolean>(false);
  const [ambiguityModalEvent, setAmbiguityModalEvent] = useState<EconomicEvent | null>(null);

  const handleOpenAmbiguityModal = (event: EconomicEvent) => {
    setAmbiguityModalEvent(event);
    setIsAmbiguityModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--canvas)', color: 'var(--text-primary)' }}>
      
      {/* Header */}
      <DashboardHeader
        reconResult={reconResult}
        testSuiteResult={testSuiteResult}
        mode={mode}
        hasGeminiKey={hasGeminiKey}
        isRunningRecon={isRunningRecon}
        isRunningTests={isRunningTests}
        onBackToLanding={onBackToLanding}
        onRunReconciliation={onRunReconciliation}
        onOpenTestsModal={() => setIsTestsModalOpen(true)}
        onOpenSourceFeeds={() => setIsSourceFeedsOpen(true)}
        onReseed={onReseed}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Status Toast */}
        {statusNotification && (
          <div className="surface-card rounded-lg px-4 py-2.5 text-xs flex items-center justify-between shadow-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-sans">{statusNotification}</span>
            </div>
            <button
              onClick={onDismissNotification}
              className="text-xs ml-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {!reconResult && isRunningRecon && (
          <div className="py-24 text-center space-y-3">
            <RotateCw className="w-6 h-6 animate-spin mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Executing reconciliation engine...
            </p>
          </div>
        )}

        {reconResult && (
          <>
            {/* 1. Quiet, Compact Metric Stat Strip */}
            <MetricStatStrip metrics={reconResult.metrics} />

            {/* 2. Full-Width Visual Hero Anchor: Cash-Position Waterfall Bridge */}
            <div className="w-full">
              <CashPositionBridge metrics={reconResult.metrics} />
            </div>

            {/* 3. Compact Horizontal Funnel & Filter Bar */}
            <div className="w-full">
              <ResolutionFunnel
                metrics={reconResult.metrics}
                selectedFilter={selectedFilter}
                onFilterChange={(filter) => {
                  setSelectedFilter(filter);
                  if (filter === 'EXCEPTION') {
                    setActiveTab('EXCEPTIONS');
                  } else {
                    setActiveTab('TRANSACTIONS');
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-b pb-2 text-xs font-sans" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('TRANSACTIONS')}
                  className="px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: activeTab === 'TRANSACTIONS' ? 'var(--surface)' : 'transparent',
                    color: activeTab === 'TRANSACTIONS' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === 'TRANSACTIONS' ? 500 : 400
                  }}
                >
                  Master Transactions ({reconResult.economic_events?.length || 500})
                </button>

                <button
                  onClick={() => setActiveTab('EXCEPTIONS')}
                  className="px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: activeTab === 'EXCEPTIONS' ? 'var(--surface)' : 'transparent',
                    color: activeTab === 'EXCEPTIONS' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === 'EXCEPTIONS' ? 500 : 400
                  }}
                >
                  Exception Queue ({reconResult.metrics?.exception_count || 80})
                </button>
              </div>

              <button
                onClick={() => {
                  const target = reconResult.economic_events.find((e) => e.order_id === 'ORD-2026-0042') || reconResult.economic_events[0];
                  handleOpenAmbiguityModal(target);
                }}
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border transition-colors"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <span>Inspect Ambiguity Verifier</span>
              </button>
            </div>

            {activeTab === 'TRANSACTIONS' ? (
              <TransactionTable
                events={reconResult.economic_events || []}
                selectedFilter={selectedFilter}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
                onOpenAmbiguityDemo={handleOpenAmbiguityModal}
              />
            ) : (
              <ExceptionQueueView
                events={reconResult.economic_events || []}
                sourceExceptions={reconResult.source_exceptions || []}
                onSelectEvent={setSelectedEvent}
              />
            )}

          </>
        )}

      </main>

      <footer className="border-t py-4 px-6 text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--nav-bg)', color: 'var(--text-secondary)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 text-[11px] font-sans">
          <span>ReconLoop · Settlement Reconciliation Console</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span>Razorpay Buildathon</span>
        </div>
      </footer>

      <TriFeedDrawer
        event={selectedEvent}
        allSettlements={reconResult?.settlements || feedsData?.settlements_sample || []}
        allBankRows={reconResult?.bank_statement || feedsData?.bank_rows_sample || []}
        candidateAssociations={reconResult?.candidate_associations || []}
        onClose={() => setSelectedEvent(null)}
        onOpenAmbiguityDemo={handleOpenAmbiguityModal}
      />

      <InteractiveAmbiguityModal
        isOpen={isAmbiguityModalOpen}
        event={ambiguityModalEvent || selectedEvent}
        allEvents={reconResult?.economic_events || []}
        onSelectEvent={(e) => setAmbiguityModalEvent(e)}
        onClose={() => setIsAmbiguityModalOpen(false)}
      />

      <TestsModal
        isOpen={isTestsModalOpen}
        testSuiteResult={testSuiteResult}
        isRunningTests={isRunningTests}
        onRunTests={onRunTestSuite}
        onClose={() => setIsTestsModalOpen(false)}
      />

      <SourceFeedsModal
        isOpen={isSourceFeedsOpen}
        feedsData={feedsData}
        onClose={() => setIsSourceFeedsOpen(false)}
      />

    </div>
  );
};
