import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { EconomicEvent, SettlementRecord, BankStatementRecord, CandidateAssociation } from '../../types';
import { formatINR } from '../../utils/formatters';

interface TriFeedDrawerProps {
  event: EconomicEvent | null;
  allSettlements: SettlementRecord[];
  allBankRows: BankStatementRecord[];
  candidateAssociations: CandidateAssociation[];
  onClose: () => void;
  onOpenAmbiguityDemo?: (event: EconomicEvent) => void;
}

export const TriFeedDrawer: React.FC<TriFeedDrawerProps> = ({
  event,
  allSettlements,
  allBankRows,
  candidateAssociations,
  onClose,
  onOpenAmbiguityDemo,
}) => {
  if (!event) return null;

  const linkedSettlements = allSettlements.filter((s) =>
    event.linked_settlement_ids?.includes(s.settlement_id)
  );

  const linkedBankRows = allBankRows.filter((b) =>
    event.linked_bank_row_ids?.includes(b.bank_row_id)
  );

  const totalGatewayGross = linkedSettlements.reduce((sum, s) => sum + s.gross_amount, 0);
  const hasBankMismatch = Math.abs(event.gateway_vs_bank_variance) > 0.01;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-4xl border-l shadow-2xl flex flex-col z-10"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div 
            className="p-4 px-6 border-b flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
          >
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-base font-semibold tracking-tight font-mono" style={{ color: 'var(--text-primary)' }}>
                  {event.order_id}
                </h2>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                  style={{
                    backgroundColor: event.status === 'RESOLVED' 
                      ? 'var(--positive-subtle)' 
                      : event.status === 'PENDING_EXPECTED' 
                      ? 'var(--warning-subtle)' 
                      : 'var(--error-subtle)',
                    color: event.status === 'RESOLVED' 
                      ? 'var(--positive-text)' 
                      : event.status === 'PENDING_EXPECTED' 
                      ? 'var(--warning-text)' 
                      : 'var(--error-text)',
                  }}
                >
                  {event.status}
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Event ID: {event.event_id}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {onOpenAmbiguityDemo && (
                <button
                  onClick={() => onOpenAmbiguityDemo(event)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  Inspect in Verifier
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border transition-colors"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans" style={{ color: 'var(--text-secondary)' }}>
            
            {/* Status & Rationale */}
            <div 
              className="p-4 rounded-lg border"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
            >
              <div className="font-semibold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                Classification: {event.discrepancy_class}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {event.resolution_rationale}
              </p>
            </div>

            {/* Tri-Feed Alignment Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Tri-Feed Alignment Matrix
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Orders · Settlements · Bank
                </span>
              </div>

              <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {/* Headers */}
                <div 
                  className="grid grid-cols-3 border-b divide-x text-center text-xs font-semibold"
                  style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
                >
                  <div className="p-2.5" style={{ color: 'var(--text-primary)' }}>Feed 1: Orders</div>
                  <div className="p-2.5" style={{ color: 'var(--text-primary)' }}>Feed 2: Gateway</div>
                  <div className="p-2.5" style={{ color: 'var(--text-primary)' }}>Feed 3: Bank</div>
                </div>

                {/* IDs */}
                <div className="grid grid-cols-3 border-b divide-x p-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Order ID</span>
                    <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{event.order_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Settlement ID</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{linkedSettlements[0]?.settlement_id || 'UNLINKED'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Bank Row ID</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{linkedBankRows[0]?.bank_row_id || 'UNLINKED'}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 border-b divide-x p-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Order Date</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{event.order_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Settlement Date</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{linkedSettlements[0]?.settlement_date || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Bank Credit Date</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{linkedBankRows[0]?.bank_date || '-'}</span>
                  </div>
                </div>

                {/* Reference */}
                <div className="grid grid-cols-3 border-b divide-x p-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Payment Ref</span>
                    <span className="font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{event.payment_ref}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Gateway UTR</span>
                    <span className="font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{linkedSettlements[0]?.utr || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Bank UTR</span>
                    <span className="font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{linkedBankRows[0]?.utr || '-'}</span>
                  </div>
                </div>

                {/* Invoiced Gross */}
                <div className="grid grid-cols-3 border-b divide-x p-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Invoiced Gross</span>
                    <span className="font-mono font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatINR(event.order_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Settlement Gross</span>
                    <span className="font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>{totalGatewayGross > 0 ? formatINR(totalGatewayGross) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Bank Gross</span>
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  </div>
                </div>

                {/* Net Amounts */}
                <div className="grid grid-cols-3 divide-x p-3 text-xs" style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Policy Expected Net</span>
                    <strong className="font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatINR(event.policy_expected_net)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Gateway Advised Net</span>
                    <strong className="font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatINR(event.gateway_reported_net)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block" style={{ color: 'var(--text-muted)' }}>Confirmed Bank Cash</span>
                    <strong className={`font-mono tabular-nums ${hasBankMismatch ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatINR(event.bank_received_net)}
                    </strong>
                  </div>
                </div>

              </div>
            </div>

            {/* Verifier Checks */}
            {event.verifications && event.verifications.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-primary)' }}>
                  Domain Verifier Predicates ({event.verifications.length})
                </span>
                <div className="space-y-1.5">
                  {event.verifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-lg border flex items-start space-x-2 text-xs"
                      style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${v.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v.name}</span>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{v.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail */}
            {event.audit_trail && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-primary)' }}>
                  Deterministic Audit Trail
                </span>
                <div 
                  className="p-3 rounded-lg border space-y-1.5 text-xs font-mono"
                  style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {event.audit_trail.map((log, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <span className="select-none shrink-0" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
};
