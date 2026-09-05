import React from 'react';
import { 
  ShieldAlert, 
  Building2, 
  CreditCard
} from 'lucide-react';
import { SourceException } from '../types';

interface SourceExceptionsTabProps {
  sourceExceptions: SourceException[];
}

export const SourceExceptionsTab: React.FC<SourceExceptionsTabProps> = ({
  sourceExceptions,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      
      {/* Informative Explanation Banner */}
      <div className="bg-[#141018] border border-purple-500/20 rounded-xl p-4 flex items-start space-x-3 text-xs text-purple-200">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-sm text-purple-100 font-mono">
            Source Exceptions · Independent External Feed Orphans
          </div>
          <p className="text-purple-300/80 leading-relaxed font-sans text-[11.5px]">
            These feed-level records appear in external payment or bank statements but possess no corresponding merchant order lifecycle. By mathematical invariant design, source exceptions are segregated independently so they <strong>never inflate or corrupt the 500 Economic Event lifecycle denominator</strong>.
          </p>
        </div>
      </div>

      {/* Grid of Source Exceptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceExceptions.map((ex) => (
          <div
            key={ex.exception_id}
            className="bg-[#111115] border border-[#222228] rounded-xl p-4 space-y-3 hover:border-zinc-700/60 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0c0c0e] border border-[#222228] flex items-center justify-center text-purple-400">
                  {ex.feed === 'BANK' ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-mono text-xs font-semibold text-purple-300">{ex.exception_id}</span>
                  <div className="text-[10.5px] text-zinc-400 font-mono">Feed: {ex.feed}</div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {ex.reason}
              </span>
            </div>

            <div className="bg-[#0c0c0e] p-3 rounded-lg border border-[#1e1e26] font-mono text-[11px] space-y-1.5 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-sans">Raw Row ID:</span>
                <span className="text-white font-medium">{ex.raw_row_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-sans">Amount:</span>
                <span className="text-purple-300 font-bold tabular-nums">{formatCurrency(ex.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-sans">Created At:</span>
                <span className="text-zinc-400">{ex.created_at.split('T')[0]}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans text-[11.5px]">
              {ex.notes}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
