import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Layers
} from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-[#0e0e12] border border-[#24242e] rounded-2xl max-w-4xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#22222a] bg-[#0a0a0d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-zinc-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight font-mono">
                Source Feed Raw Ingestion Feeds
              </h2>
              <p className="text-xs text-zinc-400 font-mono text-[11px] mt-0.5">
                3 Imperfect Source Feeds: orders.csv, settlements.csv, and bank_statement.csv
              </p>
            </div>
          </div>

          <button
            id="btn-close-source-feeds"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141418] border border-[#24242e] text-zinc-400 hover:text-white hover:bg-[#1e1e26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2 bg-[#121217] border-b border-[#22222a] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              orders.csv ({feedsData.orders_count} rows)
            </button>

            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'settlements'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              settlements.csv ({feedsData.settlements_count} rows)
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'bank'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              bank_statement.csv ({feedsData.bank_rows_count} rows)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-[#16161c] hover:bg-[#1e1e26] text-zinc-300 border border-[#24242e] transition-colors text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>
        </div>

        {/* CSV Preview Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#0c0c0e]">
          <div className="bg-[#111116] rounded-xl border border-[#222228] p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
            {currentCsv}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2.5 font-mono">
            Canonical data streaming pipeline representation. 100% algebraic conservation guaranteed.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-[#22222a] bg-[#0a0a0d] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Feed Ingestion: Strict schema validation & atomic entity mapping</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1e1e26] text-zinc-200 text-xs font-medium border border-[#24242e] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
