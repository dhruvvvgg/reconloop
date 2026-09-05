import React from 'react';
import { LogoMark } from '../common/LogoMark';
import { ImagePlaceholder } from '../common/ImagePlaceholder';

interface LandingFooterProps {
  onLaunchApp: () => void;
}

export function LandingFooter({ onLaunchApp }: LandingFooterProps) {
  return (
    <footer className="py-12 border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 5. FOOTER PANORAMIC ACCENT / TEXTURAL ILLUSTRATION */}
        <div>
          <ImagePlaceholder
            src="/images/footer.png"
            alt="Indian commerce horizon"
            label="FOOTER PANORAMIC ACCENT"
            aspectRatio="aspect-[15/2]"
            heightClass="h-28 sm:h-36"
            className="shadow-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>ReconLoop</span>
            <span className="text-xs px-2 py-0.5 rounded border ml-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Verifiable FinTech
            </span>
          </div>

          <nav className="flex gap-6">
            <a href="#pipeline" className="text-sm font-medium hover:underline transition-all" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
            <a href="#proof-metrics" className="text-sm font-medium hover:underline transition-all" style={{ color: 'var(--text-secondary)' }}>Benchmarks</a>
            <a href="#live-preview" className="text-sm font-medium hover:underline transition-all" style={{ color: 'var(--text-secondary)' }}>Telemetry</a>
            <button onClick={onLaunchApp} className="text-sm font-medium hover:underline transition-all cursor-pointer" style={{ color: 'var(--accent-text)' }}>Launch Console</button>
          </nav>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <p>
            © {new Date().getFullYear()} ReconLoop · Continuous Tri-Feed Settlement Reconciliation Engine
          </p>
          <p className="mt-2 md:mt-0">
            Razorpay Buildathon · Deterministic Mathematical Invariants
          </p>
        </div>
      </div>
    </footer>
  );
}
