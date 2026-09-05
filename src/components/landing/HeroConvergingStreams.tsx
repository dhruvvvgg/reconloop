import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, QrCode, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { ImagePlaceholder } from '../common/ImagePlaceholder';

interface HeroConvergingStreamsProps {
  onLaunchApp: () => void;
  totalEvents?: number;
  grossAmount?: number;
}

export function HeroConvergingStreams({ 
  onLaunchApp, 
  totalEvents = 500, 
  grossAmount = 20794576.04 
}: HeroConvergingStreamsProps) {
  return (
    <section className="relative pt-4 pb-16 md:pt-6 md:pb-24 overflow-hidden" style={{ backgroundColor: 'var(--canvas)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          
          {/* Left Column: Editorial Point-of-View Copy (6 Cols) */}
          <div className="lg:col-span-6 text-left space-y-7">
            
            {/* Small secondary pill badge */}
            <div className="inline-flex items-center space-x-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>Razorpay Buildathon</span>
              <span>·</span>
              <span>Settlement Integrity Controller</span>
            </div>

            {/* Main Editorial Headline with Italic Serif Accent */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]"
              style={{ color: 'var(--text-primary)' }}
            >
              Never wonder where your{' '}
              <span className="italic-serif text-[1.12em] font-normal" style={{ color: 'var(--text-primary)' }}>
                settlement money
              </span>{' '}
              actually went.
            </h1>

            {/* Emotional Point-of-View Subtitle */}
            <p 
              className="text-base sm:text-lg max-w-xl font-normal leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Your order ledger records one number. Your payment gateway advises another. And your bank credits a third. ReconLoop mathematically proves every rupee across all three feeds before the day closes — so you never absorb silent fee drift or uncredited payouts.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onLaunchApp}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                <span>Launch Reconciliation Console</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>

              <a
                href="#live-preview"
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <span>Inspect Live Telemetry</span>
                <ArrowUpRight className="w-4 h-4 ml-1.5" style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>

            {/* Ground Truth Metric Ribbon */}
            <div 
              className="pt-6 border-t grid grid-cols-3 gap-4 max-w-lg text-left"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>Lifecycle Events</span>
                <span className="text-xl font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {totalEvents}
                </span>
                <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>Ingested 1-to-1</span>
              </div>

              <div>
                <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>Auto-Cleared</span>
                <span className="text-xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  82.0%
                </span>
                <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>Zero-touch UTR match</span>
              </div>

              <div>
                <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>Ledger Conservation</span>
                <span className="text-xl font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  100%
                </span>
                <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>Zero rupee drift</span>
              </div>
            </div>

          </div>

          {/* Right Column: Dominant Visual Anchor (Illustrated Scene + Merchant Terminal Card) (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 text-left">
            
            {/* 1. LARGE DOMINANT ILLUSTRATED SCENE (Paytm Mitra target style) */}
            <ImagePlaceholder
              src="/images/hero.png"
              alt="Kirana merchant settlement scene"
              label="HERO NARRATIVE SCENE"
              aspectRatio="aspect-[16/10]"
              className="shadow-lg"
            />

            {/* 2. LIVE MERCHANT TERMINAL TELEMETRY CARD */}
            <div 
              className="rounded-xl p-5 border shadow-sm surface-card"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="inline-flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      Kirana Merchant Settlement Terminal
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      Terminal #KA-BLR-094 · Daily Batch
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  BATCH CLEARED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                <div>
                  <span className="text-[10px] uppercase font-medium block" style={{ color: 'var(--text-muted)' }}>Invoiced Gross</span>
                  <span className="text-base font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {formatINR(42500)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium block" style={{ color: 'var(--text-muted)' }}>Bank Credit Net</span>
                  <span className="text-base font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatINR(41497)}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-medium block" style={{ color: 'var(--text-muted)' }}>UTR Verification</span>
                  <span className="text-xs font-mono font-semibold truncate block" style={{ color: 'var(--text-secondary)' }}>
                    CMS90281740
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center space-x-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>7 Invariant Domain Predicates Verified</span>
                </div>
                <span className="text-[10.5px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  0 Rupee Variance
                </span>
              </div>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              From in-store UPI soundbox transactions to high-volume gateway tranches, every rupee is traced to bank credit.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
