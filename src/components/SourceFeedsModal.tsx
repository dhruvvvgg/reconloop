import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Layers,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SourceFeedsModalProps {
  isOpen: boolean;
  feedsData: {
    orders_count: number;
    settlements_count: number;
    bank_rows_count: number;
    csv_previews: {
      orders_csv: string;
      settlements_csv: string;
      bank_statement_csv: string;
    };
  } | null;
  onClose: () => void;
}

export const SourceFeedsModal: React.FC<SourceFeedsModalProps> = ({
  isOpen,
  feedsData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'settlements' | 'bank'>('orders');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !feedsData) return null;

  const currentCsv =
    activeTab === 'orders'
      ? feedsData.csv_previews.orders_csv
      : activeTab === 'settlements'
      ? feedsData.csv_previews.settlements_csv
      : feedsData.csv_previews.bank_statement_csv;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'orders' as const, label: 'orders.csv', count: feedsData.orders_count, desc: 'Order Ledger Baseline' },
    { id: 'settlements' as const, label: 'settlements.csv', count: feedsData.settlements_count, desc: 'Gateway Batches' },
    { id: 'bank' as const, label: 'bank_statement.csv', count: feedsData.bank_rows_count, desc: 'Bank Clearances' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-4xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div 
            className="p-4 px-6 border-b flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--accent)' }}
              >
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Tri-Feed Raw Ingestion Artifacts
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Original immutable CSV feeds: orders, settlements, and bank statement
                </p>
              </div>
            </div>

            <button
              id="btn-close-source-feeds"
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selection */}
          <div 
            className="px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div 
              className="inline-flex rounded-full p-0.5 border"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {tab.label} <span className="font-mono text-[11px] opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-colors text-xs font-medium shadow-sm"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy CSV'}</span>
            </motion.button>
          </div>

          {/* CSV Preview Body */}
          <div className="p-6 overflow-y-auto flex-1 font-mono text-xs" style={{ backgroundColor: 'var(--canvas)' }}>
            <div 
              className="rounded-lg border p-4 overflow-x-auto whitespace-pre leading-relaxed shadow-sm"
              style={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)' 
              }}
            >
              {currentCsv}
            </div>
            <p className="text-[11px] mt-3 font-sans" style={{ color: 'var(--text-muted)' }}>
              Deterministic data streaming pipeline. Converted to canonical records with 100% algebraic conservation.
            </p>
          </div>

          {/* Footer */}
          <div 
            className="p-3.5 px-6 border-t flex items-center justify-between text-xs"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span>Strict schema validation & idempotent entity mapping</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Close
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
