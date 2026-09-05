import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroConvergingStreams } from './HeroConvergingStreams';
import { PipelineFourStages } from './PipelineFourStages';
import { ProofMetrics } from './ProofMetrics';
import { LiveProductPreview } from './LiveProductPreview';
import { LandingFooter } from './LandingFooter';
import { ReconciliationRunResult, EconomicEvent } from '../../types';

interface LandingPageProps {
  onLaunchApp: () => void;
  reconResult: ReconciliationRunResult | null;
  isRunningRecon?: boolean;
  onSelectEvent?: (event: EconomicEvent) => void;
}

export function LandingPage({
  onLaunchApp,
  reconResult,
  isRunningRecon,
  onSelectEvent,
}: LandingPageProps) {
  const totalEvents = reconResult?.metrics?.total_economic_events || 500;
  const grossAmount = reconResult?.metrics?.total_gross_order_amount || 42228657;

  return (
    <div className="min-h-screen w-full transition-colors duration-200" style={{ backgroundColor: 'var(--canvas)' }}>
      <LandingNavbar 
        onLaunchApp={onLaunchApp} 
        isRunningRecon={isRunningRecon}
      />
      
      <main>
        <HeroConvergingStreams 
          onLaunchApp={onLaunchApp}
          totalEvents={totalEvents}
          grossAmount={grossAmount}
        />
        
        <PipelineFourStages />
        
        <ProofMetrics />
        
        <LiveProductPreview 
          reconResult={reconResult}
          onLaunchApp={onLaunchApp}
          onSelectEvent={onSelectEvent}
        />
      </main>

      <LandingFooter onLaunchApp={onLaunchApp} />
    </div>
  );
}
