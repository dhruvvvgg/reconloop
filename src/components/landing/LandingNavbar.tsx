import React from 'react';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../common/ThemeProvider';
import { LogoMark } from '../common/LogoMark';

interface LandingNavbarProps {
  onLaunchApp: () => void;
  isRunningRecon?: boolean;
}

export function LandingNavbar({ onLaunchApp, isRunningRecon }: LandingNavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header 
      className="sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-200" 
      style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
            <LogoMark size={26} />
          </motion.div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ReconLoop
          </span>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--surface-inset)', color: 'var(--text-muted)' }}>
            v2.4
          </span>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium">
          <a 
            href="#pipeline" 
            className="transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            How It Works
          </a>
          <a 
            href="#proof-metrics" 
            className="transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            Benchmarks
          </a>
          <a 
            href="#live-preview" 
            className="transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            Live Telemetry
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme} 
            className="p-2 rounded-full transition-colors border shadow-sm cursor-pointer"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onLaunchApp}
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </motion.button>
        </div>

      </div>
    </header>
  );
}
