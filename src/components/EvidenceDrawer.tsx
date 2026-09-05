import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Building2, 
  CreditCard, 
  History, 
  Sparkles,
  FileCheck2,
  Receipt,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EconomicEvent, 
  SettlementRecord, 
  BankStatementRecord, 
  CandidateAssociation 
} from '../types';

interface EvidenceDrawerProps {
  event: EconomicEvent | null;
  allSettlements: SettlementRecord[];
  allBankRows: BankStatementRecord[];
  candidateAssociations: CandidateAssociation[];
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  event,
  allSettlements,
  allBankRows,
  candidateAssociations,
  onClose,
}) => {
  if (!event) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Find linked settlements and bank rows
  const linkedSettlements = allSettlements.filter((s) =>
    event.linked_settlement_ids.includes(s.settlement_id)
  );

  const linkedBankRows = allBankRows.filter((b) =>
    event.linked_bank_row_ids.includes(b.bank_row_id)
  );

  const relatedCandidates = candidateAssociations.filter(
    (c) => c.economic_event_id === event.event_id || c.order_id === event.order_id
  );

  const totalGatewayGross = linkedSettlements.reduce((sum, s) => sum + s.gross_amount, 0);
  const totalGatewayFees = linkedSettlements.reduce((sum, s) => sum + s.gateway_fee, 0);
  const totalGatewayTaxTds = linkedSettlements.reduce((sum, s) => sum + s.gateway_tax + s.gateway_tds, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      
      {/* Dimmed Backdrop Overlay with Smooth Fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-3xl bg-[#0e0e12] border-l border-[#24242e] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10"
        >
          {/* Drawer Header */}
          <div className="p-4 px-6 border-b border-[#22222a] bg-[#0a0a0d] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#181822] border border-[#2a2a38] flex items-center justify-center font-mono font-bold text-white text-xs">
                EV
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-base font-semibold text-white tracking-tight font-mono">
                    {event.order_id}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide ${
                    event.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : event.status === 'PENDING_EXPECTED'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Event: <span className="text-zinc-200">{event.event_id}</span> | Customer: {event.customer_id}
                </p>
              </div>
            </div>

            <button
              id="btn-close-evidence-drawer"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141418] hover:bg-[#1c1c24] text-zinc-400 hover:text-white border border-[#24242c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300">
            
            {/* Status & Rationale Callout */}
            <div className={`p-4 rounded-xl border ${
              event.status === 'RESOLVED'
                ? 'bg-[#0d1712] border-emerald-500/30 text-emerald-200'
                : event.status === 'PENDING_EXPECTED'
                ? 'bg-[#18140c] border-amber-500/30 text-amber-200'
                : 'bg-[#180e10] border-rose-500/30 text-rose-200'
            }`}>
              <div className="font-semibold text-xs mb-1 flex items-center space-x-2">
                {event.status === 'RESOLVED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : event.status === 'PENDING_EXPECTED' ? (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-mono text-white text-[12px]">
                  Resolution Verdict: {event.discrepancy_class}
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed font-mono mt-1 opacity-90">
                {event.resolution_rationale}
              </p>
            </div>

            {/* GENUINELY ALIGNED TRI-FEED COMPARISON VIEW */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                  <Scale className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Synchronized Tri-Feed Alignment Matrix</span>
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Orders · Settlements · Bank Statement
                </span>
              </div>

              {/* 3-Column Comparative Grid with Strictly Matching Row Positions */}
              <div className="bg-[#111116] border border-[#22222a] rounded-xl overflow-hidden shadow-sm">
                
                {/* Headers Row */}
                <div className="grid grid-cols-3 border-b border-[#22222a] bg-[#0c0c0f] divide-x divide-[#22222a] text-center font-mono text-[11px]">
                  
                  {/* Feed 1 Header */}
                  <div className="p-3">
                    <div className="flex items-center justify-center space-x-1.5 text-zinc-200 font-semibold">
                      <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Feed 1: Orders</span>
                    </div>
                    <span className="text-[9.5px] text-zinc-400 block mt-0.5">Contract Entitlement</span>
                  </div>

                  {/* Feed 2 Header */}
                  <div className="p-3">
                    <div className="flex items-center justify-center space-x-1.5 text-emerald-300 font-semibold">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Feed 2: Gateway</span>
                    </div>
                    <span className="text-[9.5px] text-zinc-400 block mt-0.5">Settlement Advice</span>
                  </div>

                  {/* Feed 3 Header */}
                  <div className="p-3">
                    <div className="flex items-center justify-center space-x-1.5 text-zinc-100 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Feed 3: Bank</span>
                    </div>
                    <span className="text-[9.5px] text-zinc-400 block mt-0.5">Cleared Treasury</span>
                  </div>

                </div>

                {/* Aligned Row 1: Source Identifiers */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[11px]">
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Order ID</span>
                    <strong className="text-white">{event.order_id}</strong>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Settlement ID(s)</span>
                    {linkedSettlements.length > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        {linkedSettlements.map((s) => s.settlement_id).join(', ')}
                      </span>
                    ) : (
                      <span className="text-rose-400">UNLINKED</span>
                    )}
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Bank Statement Row(s)</span>
                    {linkedBankRows.length > 0 ? (
                      <span className="text-zinc-200 font-semibold">
                        {linkedBankRows.map((b) => b.bank_row_id).join(', ')}
                      </span>
                    ) : (
                      <span className="text-rose-400">UNLINKED</span>
                    )}
                  </div>
                </div>

                {/* Aligned Row 2: Dates & Cutoff */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[11px]">
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Order Timestamp</span>
                    <span className="text-zinc-300">{event.order_date}</span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Settlement Date</span>
                    <span className="text-zinc-300">
                      {linkedSettlements.length > 0 ? linkedSettlements[0].settlement_date : '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Bank Credit Date</span>
                    <span className="text-zinc-300">
                      {linkedBankRows.length > 0 ? linkedBankRows[0].bank_date : '—'}
                    </span>
                  </div>
                </div>

                {/* Aligned Row 3: Trace Reference / UTR */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[11px]">
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Payment Ref</span>
                    <span className="text-zinc-300 break-all">{event.payment_ref}</span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Gateway UTR</span>
                    <span className="text-emerald-300 break-all">
                      {linkedSettlements.length > 0 ? linkedSettlements[0].utr : '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Bank UTR / Narration</span>
                    <span className="text-zinc-300 break-all">
                      {linkedBankRows.length > 0 ? linkedBankRows[0].utr : '—'}
                    </span>
                  </div>
                </div>

                {/* Aligned Row 4: Gross / Invoiced */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[11px]">
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Invoiced Gross</span>
                    <span className="text-white font-medium tabular-nums">{formatCurrency(event.order_amount)}</span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Settlement Gross</span>
                    <span className="text-zinc-300 tabular-nums">
                      {totalGatewayGross > 0 ? formatCurrency(totalGatewayGross) : '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Bank Gross</span>
                    <span className="text-zinc-400">—</span>
                  </div>
                </div>

                {/* Aligned Row 5: Deductions (Fee + Tax + TDS + Refund) */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[11px]">
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Policy Deductions</span>
                    <div className="space-y-0.5 text-zinc-400">
                      <div>Fee: <span className="text-rose-400 tabular-nums">-{formatCurrency(event.policy_fee)}</span></div>
                      <div>Tax/TDS: <span className="text-rose-400 tabular-nums">-{formatCurrency(event.policy_tax + event.policy_tds)}</span></div>
                      {event.refund_total > 0 && (
                        <div>Refund: <span className="text-purple-400 tabular-nums">-{formatCurrency(event.refund_total)}</span></div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Gateway Deductions</span>
                    <div className="space-y-0.5 text-zinc-400">
                      <div>Fee: <span className="text-rose-400 tabular-nums">-{formatCurrency(totalGatewayFees)}</span></div>
                      <div>Tax/TDS: <span className="text-rose-400 tabular-nums">-{formatCurrency(totalGatewayTaxTds)}</span></div>
                      {event.refund_total > 0 && (
                        <div>Refund: <span className="text-purple-400 tabular-nums">-{formatCurrency(event.refund_total)}</span></div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-[#111116]">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5">Bank Charges</span>
                    <span className="text-zinc-400">₹0.00 (Direct Payout)</span>
                  </div>
                </div>

                {/* Aligned Row 6: Net Credited / Expected */}
                <div className="grid grid-cols-3 border-b border-[#1c1c24] divide-x divide-[#22222a] font-mono text-[12px] bg-[#0c0c10]">
                  <div className="p-3">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5 font-medium">
                      Policy Expected Net
                    </span>
                    <strong className="text-zinc-100 text-sm tabular-nums">
                      {formatCurrency(event.policy_expected_net)}
                    </strong>
                  </div>
                  <div className="p-3">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5 font-medium">
                      Gateway Advised Net
                    </span>
                    <strong className="text-emerald-400 text-sm tabular-nums">
                      {formatCurrency(event.gateway_reported_net)}
                    </strong>
                  </div>
                  <div className="p-3">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-400 block mb-0.5 font-medium">
                      Confirmed Cleared Cash
                    </span>
                    <strong className="text-emerald-400 text-sm tabular-nums">
                      {formatCurrency(event.bank_received_net)}
                    </strong>
                  </div>
                </div>

                {/* Aligned Row 7: Variance Identity Delta */}
                <div className="grid grid-cols-3 divide-x divide-[#22222a] font-mono text-[11px] bg-[#09090c] p-3 text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Contract Delta: </span>
                    <span className="text-zinc-300">₹0.00</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Policy vs Gateway: </span>
                    <strong className={event.policy_vs_gateway_variance !== 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {formatCurrency(event.policy_vs_gateway_variance)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Gateway vs Bank: </span>
                    <strong className={event.gateway_vs_bank_variance !== 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {formatCurrency(event.gateway_vs_bank_variance)}
                    </strong>
                  </div>
                </div>

              </div>
            </div>

            {/* TESTED CANDIDATE ASSOCIATIONS */}
            {relatedCandidates.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Hypothesis & Candidate Associations ({relatedCandidates.length})</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Confidence & Safety Guardrails
                  </span>
                </div>

                <div className="space-y-2">
                  {relatedCandidates.map((c) => (
                    <div key={c.candidate_id} className="bg-[#111116] p-3.5 rounded-xl border border-[#222228] shadow-sm">
                      <div className="flex items-start justify-between font-mono">
                        <div>
                          <span className="text-zinc-200 text-xs font-semibold">{c.candidate_id}</span>
                          <span className="text-[10.5px] text-zinc-400 block mt-0.5">
                            Source: {c.source_feed} ({c.source_row_id})
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          c.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'REJECTED_PROMPT_INJECTION'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-zinc-300 mt-2 font-mono leading-relaxed bg-[#0c0c0e] p-2.5 rounded border border-[#1e1e26]">
                        {c.reason}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-mono">
                        <span>Strategy: <strong className="text-zinc-200 font-normal">{c.match_strategy}</strong></span>
                        <span>Confidence: <strong className="text-zinc-200 font-normal">{(c.confidence * 100).toFixed(0)}%</strong></span>
                        <span>Amount: <strong className="text-white font-normal tabular-nums">{formatCurrency(c.candidate_amount)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECONCILIATION AUDIT LOG PIPELINE */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-zinc-400" />
                <span>Deterministic Reconciliation Audit Trail</span>
              </h3>

              <div className="bg-[#111116] rounded-xl border border-[#222228] p-4 font-mono text-[11px] space-y-2.5">
                {event.audit_trail.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-zinc-300 leading-relaxed">
                    <span className="text-zinc-500 select-none text-[10px] shrink-0 font-mono mt-0.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="break-all">{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};
