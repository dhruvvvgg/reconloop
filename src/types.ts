/**
 * ReconLoop - Settlement Reconciliation Controller
 * Core Domain Types and Entity Invariants
 */

export type Currency = 'INR';

// ==========================================
// SOURCE FEEDS (The 3 Imperfect Feeds)
// ==========================================

export interface OrderRecord {
  order_id: string; // e.g. "ORD-2026-0001"
  order_date: string; // YYYY-MM-DD
  order_amount: number; // Gross order value
  discount: number; // Merchant promotional discount
  refund_total: number; // Refund amount deducted
  currency: Currency;
  payment_ref: string; // Gateway transaction reference e.g. "PAY-0001"
  policy_fee_rate: number; // e.g. 0.02 (2%)
  policy_tax_rate: number; // e.g. 0.18 (18% on fee)
  policy_tds_rate: number; // e.g. 0.01 (1% TDS on order)
  customer_id: string;
  sku_summary: string;
}

export interface SettlementRecord {
  settlement_id: string; // e.g. "SET-0001"
  order_id: string; // Order reference (may be empty if corrupted)
  payment_ref: string; // Gateway transaction ID
  settlement_batch_id: string; // e.g. "BATCH-2026-03-01"
  settlement_date: string; // YYYY-MM-DD
  gross_amount: number;
  gateway_fee: number;
  gateway_tax: number;
  gateway_tds: number;
  settled_amount: number; // Net amount reported by payment gateway
  utr: string; // Unique Transaction Reference for bank payout
  currency: Currency;
  payout_status: 'SETTLED' | 'PENDING' | 'SPLIT';
  split_seq?: number; // 1 or 2 if split settlement
  split_total?: number;
}

export interface BankStatementRecord {
  bank_row_id: string; // e.g. "BNK-0001"
  bank_date: string; // YYYY-MM-DD
  utr: string; // Bank UTR / reference code
  narration: string; // Raw transaction description from bank feed
  credited_amount: number; // Actual amount credited to merchant account
  currency: Currency;
  account_id: string; // Bank account identifier
}

// ==========================================
// THE THREE SEPARATE ENTITY TYPES
// ==========================================

/**
 * 1. ECONOMIC_EVENT:
 * Exactly one per generated order/payment lifecycle.
 * ONLY records included in economic-event metrics.
 * Total count MUST equal exactly the batch size (500).
 */
export type EconomicEventStatus = 'RESOLVED' | 'PENDING_EXPECTED' | 'EXCEPTION';

export type DiscrepancyClass =
  | 'CLEAN_MATCH'
  | 'SETTLEMENT_ARITHMETIC_MISMATCH'
  | 'MERCHANT_POLICY_MISMATCH'
  | 'SPLIT_SETTLEMENT'
  | 'DUPLICATE_BANK_CREDIT'
  | 'PARTIAL_REFUND'
  | 'DATE_SHIFT_TIMING'
  | 'MISSING_CORRUPTED_UTR'
  | 'ROUNDING_DRIFT'
  | 'MISSING_SETTLEMENT_OR_BANK'
  | 'MISSING_AFTER_CUTOFF'
  | 'LATE_SETTLEMENT_AFTER_CUTOFF'
  | 'RESIDUAL_AMBIGUOUS_RESOLVED'
  | 'PROMPT_INJECTION_REJECTED'
  | 'DOUBLE_ASSIGNED_EVIDENCE';

export interface VerificationCheck {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface EconomicEvent {
  entity_type: 'ECONOMIC_EVENT';
  event_id: string; // "EE-ORD-2026-0001"
  order_id: string;
  payment_ref: string;
  order_date: string;
  currency: Currency;

  // The 3 strictly distinct monetary calculations
  order_amount: number;
  discount: number;
  refund_total: number;
  policy_fee: number;
  policy_tax: number;
  policy_tds: number;
  policy_expected_net: number; // (order_amount - discount) - refund_total - policy_fee - policy_tax - policy_tds
  gateway_reported_net: number; // sum(settled_amount across accepted linked settlement rows)
  bank_received_net: number; // sum(credited_amount across accepted linked bank rows)

  // Pairwise variances (Never collapsed!)
  policy_vs_gateway_variance: number; // policy_expected_net - gateway_reported_net
  gateway_vs_bank_variance: number; // gateway_reported_net - bank_received_net
  policy_vs_bank_variance: number; // policy_expected_net - bank_received_net

  // Final Single State
  status: EconomicEventStatus;
  discrepancy_class: DiscrepancyClass;

  // Timing metadata
  gateway_settlement_date: string | null;
  settlement_window_days: number;
  expected_bank_arrival_cutoff: string | null; // gateway_settlement_date + settlement_window_days
  actual_bank_date: string | null;
  is_timing_violation: boolean;

  // Evidence links
  linked_settlement_ids: string[];
  linked_bank_row_ids: string[];

  // Verification & Audit
  verifications: VerificationCheck[];
  audit_trail: string[];
  resolution_rationale: string;

  // Audit Provenance Metadata (Full Reproducibility & Verifiability)
  run_id?: string;
  source_file_hash?: string;
  model_name_and_version?: string;
  prompt_version?: string;
  evidence_ids?: string[];
  structured_audit_trail?: AuditTrailEntry[];
}

export interface AuditTrailEntry {
  timestamp: string;
  run_id: string;
  source_file_hash: string;
  before_state: EconomicEventStatus | 'UNINITIALIZED';
  after_state: EconomicEventStatus;
  action: string;
  evidence_ids: string[];
  model_name_and_version?: string;
  prompt_version?: string;
  details: string;
}

/**
 * 2. SOURCE_EXCEPTION:
 * An unlinked source item such as a true orphan bank credit.
 * Appears in exception report but DOES NOT inflate economic-event denominator (500).
 */
export interface SourceException {
  entity_type: 'SOURCE_EXCEPTION';
  exception_id: string; // e.g. "SRC-EXP-001"
  source_feed: 'ORDERS' | 'SETTLEMENTS' | 'BANK';
  source_row_id: string;
  exception_type: 'ORPHAN_BANK_CREDIT' | 'UNLINKABLE_SETTLEMENT' | 'GHOST_ORDER';
  amount: number;
  date: string;
  reference: string;
  narration?: string;
  reason: string;
  identified_at: string;
}

/**
 * 3. CANDIDATE_ASSOCIATION:
 * A possible source-row-to-economic-event relationship, including accepted and rejected candidate links.
 */
export type CandidateAssociationStatus =
  | 'ACCEPTED'
  | 'REJECTED_INSUFFICIENT_EVIDENCE'
  | 'REJECTED_PROMPT_INJECTION'
  | 'REJECTED_ARITHMETIC'
  | 'REJECTED_TIMING'
  | 'REJECTED_DUPLICATE';

export interface CandidateAssociation {
  entity_type: 'CANDIDATE_ASSOCIATION';
  candidate_id: string;
  economic_event_id: string;
  order_id: string;
  source_feed: 'SETTLEMENTS' | 'BANK';
  source_row_id: string;
  match_strategy: 'EXACT_UTR' | 'PAYMENT_REF' | 'BOUNDED_SEARCH' | 'LLM_HYPOTHESIS';
  confidence: number;
  status: CandidateAssociationStatus;
  reason: string;
  candidate_amount: number;
  variance_if_accepted: number;
  created_at: string;
}

// ==========================================
// PIPELINE EXECUTION & METRICS
// ==========================================

export type ExecutionMode =
  | 'deterministic'
  | 'live_gemini'
  | 'demo_replay'
  | 'deterministic_baseline'
  | 'benchmark_live'
  | 'benchmark_live_with_verifier';

export interface ReconciliationMetrics {
  total_economic_events: number; // Exactly 500
  resolved_count: number;
  pending_expected_count: number;
  exception_count: number;

  total_source_exceptions: number; // E.g. orphan bank credits (denominator untouched!)
  source_exceptions_count: number;
  total_candidate_associations: number;
  accepted_candidates_count: number;
  rejected_candidates_count: number;

  // Financial aggregates
  total_gross_order_amount: number;
  total_discounts: number;
  total_refunds: number;
  total_policy_fees: number;
  total_policy_taxes: number;
  total_policy_tds: number;
  total_gateway_fees: number;

  total_policy_expected_net: number;
  total_gateway_reported_net: number;
  total_bank_received_net: number;

  // Cash positions
  confirmed_cash: number; // Valid cash from RESOLVED events
  pending_value: number; // Expected cash from PENDING_EXPECTED events
  unresolved_exception_value: number; // Value tied in EXCEPTION events
  orphan_source_cash: number; // Cash in unlinked bank credits

  // Pairwise variances (aggregated)
  policy_vs_gateway_total_variance: number;
  gateway_vs_bank_total_variance: number;
  policy_vs_bank_total_variance: number;
  variance_identity_holds: boolean; // (P - G) + (G - B) === (P - B)
}

export interface DiscrepancyBreakdown {
  class_name: DiscrepancyClass;
  count: number;
  total_variance: number;
  description: string;
}

export interface ReconciliationAuditEntry {
  run_id: string;
  source_file_hash: string;
  model_name_and_version: string;
  prompt_version: string;
  event_id: string;
  order_id: string;
  evidence_ids: string[];
  before_state: ReconciliationStatus;
  after_state: ReconciliationStatus;
  timestamp: string;
}

export interface ReconciliationResult {
  run_id: string;
  timestamp: string;
  execution_mode: ExecutionMode;
  metrics: ReconciliationMetrics;
  discrepancy_breakdown: DiscrepancyBreakdown[];
  economic_events: EconomicEvent[];
  source_exceptions: SourceException[];
  candidate_associations: CandidateAssociation[];
  audit_log?: ReconciliationAuditEntry[];
  raw_feeds_summary: {
    orders_count: number;
    settlements_count: number;
    bank_rows_count: number;
  };
  demo_cases_status: {
    case_1_resolved_safely: boolean;
    case_2_injection_defended: boolean;
  };
  demo_cases?: {
    case_1_resolved_safely: boolean;
    case_2_injection_defended: boolean;
  };
}

export interface TestResultItem {
  test_name: string;
  passed: boolean;
  expected: string;
  actual: string;
  notes: string;
}

export interface TestSuiteResult {
  all_passed: boolean;
  total_tests: number;
  passed_count: number;
  failed_count: number;
  duration_ms: number;
  tests: TestResultItem[];
}

export type ReconciliationRunResult = ReconciliationResult;

export interface ReconciliationOptions {
  mode: ExecutionMode;
  cutoff_date?: string;
  variance_tolerance?: number;
  runId?: string;
  sourceFileHash?: string;
  disableVerifier?: boolean;
  modelName?: string;
  promptVersion?: string;
}

export interface RawSourceFeeds {
  orders: OrderRecord[];
  settlements: SettlementRecord[];
  bankStatement: BankStatementRecord[];
}

export type ReconciliationStatus = EconomicEventStatus;
export type BankStatementFeed = BankStatementRecord;
export interface RawFeeds {
  orders: OrderRecord[];
  settlements: SettlementRecord[];
  bank_statement: BankStatementRecord[];
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
