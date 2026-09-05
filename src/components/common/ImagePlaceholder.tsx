import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  label?: string;
  description?: string;
  aspectRatio?: string;
  dimensions?: string;
  className?: string;
  heightClass?: string;
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

export function ImagePlaceholder({
  label,
  description,
  aspectRatio = 'aspect-[16/10]',
  dimensions = 'Recommended: 1200 × 750 px',
  className = '',
  heightClass,
  src,
  alt,
  children,
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <div className={`relative w-full ${heightClass || aspectRatio} rounded-2xl overflow-hidden border shadow-sm ${className}`} style={{ borderColor: 'var(--border)' }}>
        <img
          src={src}
          alt={alt || label || 'Settlement illustration'}
          className="w-full h-full object-cover"
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${heightClass || aspectRatio} rounded-2xl border-2 border-dashed overflow-hidden flex flex-col justify-between p-6 transition-all group ${className}`}
      style={{
        backgroundColor: 'var(--surface-inset)',
        borderColor: 'var(--border-strong)',
      }}
    >
      {/* Subtle textured canvas background simulation */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Bar: Clean minimal text without any pills */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span className="text-[10.5px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {dimensions}
        </span>
      </div>

      {/* Center: Descriptive Brief */}
      <div className="relative z-10 my-auto text-center max-w-md mx-auto space-y-2 py-4">
        <div 
          className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center border shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <ImageIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {description}
        </p>
      </div>

      {/* Bottom: Clean minimal label without pill */}
      <div className="relative z-10 flex items-center justify-between text-[11px] pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>Hand-crafted narrative illustration slot</span>
        <span className="font-mono">{dimensions}</span>
      </div>

      {children && (
        <div className="relative z-10 mt-3">
          {children}
        </div>
      )}
    </div>
  );
}
