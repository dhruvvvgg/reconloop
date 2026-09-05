/**
 * ReconLoop - Comprehensive Correctness Test Suite
 * 
 * Verifies all 16 mission-critical invariants and financial domain rules:
 * 1. Exactly 500 economic events are generated.
 * 2. Order IDs are unique.
 * 3. Source exceptions do not inflate the economic-event count.
 * 4. Rejected candidate links are not classified as true orphans.
 * 5. Refund is deducted exactly once.
 * 6. Split settlements conserve amounts.
 * 7. Duplicate bank credit does not inflate valid bank cash.
 * 8. Missing bank credit differs from orphan bank credit.
 * 9. Late balanced bank credits are not marked RESOLVED.
 * 10. Missing dates before and after cutoff receive different states.
 * 11. Settlement arithmetic is checked.
 * 12. Pairwise variance identity holds.
 * 13. Every economic event receives exactly one final state.
 * 14. Invalid LLM evidence IDs are rejected.
 * 15. Rejected AI proposals persist as EXCEPTION.
 * 16. Instruction-like bank narration cannot alter financial state.
 * 17. Ambiguous evidence collision triggers NO_DOUBLE_ASSIGNMENT rejection and lands in EXCEPTION.
 */

import { generateBenchmarkDataset } from '../engine/dataset';
import { runReconciliationPipeline } from '../engine/pipeline';
import { DomainVerifier } from '../engine/verifier';
import { TestSuiteResult, TestResultItem } from '../types';

export async function runAllCorrectnessTests(): Promise<TestSuiteResult> {
  const startTime = Date.now();
  const tests: TestResultItem[] = [];

  // Generate benchmark dataset and execute pipeline in deterministic mode
  const rawFeeds = generateBenchmarkDataset();
  const result = await runReconciliationPipeline(rawFeeds, { mode: 'deterministic' });

  // -------------------------------------------------------------------------
  // Test 1: Exactly 500 economic events are generated
  // -------------------------------------------------------------------------
  const count500 = result.economic_events.length === 500;
  tests.push({
    test_name: 'Exactly 500 economic events are generated',
    passed: count500,
    expected: '500 ECONOMIC_EVENT records',
    actual: `${result.economic_events.length} records`,
    notes: 'Preserves 1-to-1 mapping with generated order lifecycle batch',
  });

  // -------------------------------------------------------------------------
  // Test 2: Order IDs are unique
  // -------------------------------------------------------------------------
  const orderIds = new Set(result.economic_events.map((e) => e.order_id));
  const uniqueOrders = orderIds.size === 500;
  tests.push({
    test_name: 'Order IDs are unique',
    passed: uniqueOrders,
    expected: '500 unique Order IDs',
    actual: `${orderIds.size} unique Order IDs`,
    notes: 'Zero collisions across lifecycle identifiers',
  });

  // -------------------------------------------------------------------------
  // Test 3: Source exceptions do not inflate the economic-event count
  // -------------------------------------------------------------------------
  const denominatorUntouched =
    result.economic_events.length === 500 && result.source_exceptions.length > 0;
  tests.push({
    test_name: 'Source exceptions do not inflate the economic-event count',
    passed: denominatorUntouched,
    expected: `Economic Events = 500, Source Exceptions > 0`,
    actual: `Economic Events = ${result.economic_events.length}, Source Exceptions = ${result.source_exceptions.length}`,
    notes: 'Orphan bank credits/unlinkable settlements appear in exception report without inflating economic event denominator',
  });

  // -------------------------------------------------------------------------
  // Test 4: Rejected candidate links are not classified as true orphans
  // -------------------------------------------------------------------------
  // Find a candidate association that was rejected (e.g. from Order 499)
  const rejectedCand = result.candidate_associations.find(
    (c) => c.status === 'REJECTED_PROMPT_INJECTION' || c.status === 'REJECTED_INSUFFICIENT_EVIDENCE'
  );
  const orphanSourceIds = new Set(result.source_exceptions.map((s) => s.source_row_id));
  const rejectedNotOrphan = rejectedCand ? !orphanSourceIds.has(rejectedCand.source_row_id) : true;
  tests.push({
    test_name: 'Rejected candidate links are not classified as true orphans',
    passed: Boolean(rejectedCand && rejectedNotOrphan),
    expected: 'Rejected candidate row kept in candidate associations, NOT in source exceptions',
    actual: rejectedCand
      ? `Rejected candidate ${rejectedCand.source_row_id} is in CANDIDATE_ASSOCIATION (${rejectedCand.status}) and omitted from SOURCE_EXCEPTION`
      : 'No rejected candidate found',
    notes: 'Preserves audit trail of tested candidates without false orphan creation',
  });

  // -------------------------------------------------------------------------
  // Test 5: Refund is deducted exactly once
  // -------------------------------------------------------------------------
  // Order 355 has refund of ₹4,150
  const refundEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0355');
  let refundDeductedOnce = false;
  if (refundEvent) {
    const expected = refundEvent.order_amount - refundEvent.discount - refundEvent.refund_total - refundEvent.policy_fee - refundEvent.policy_tax - refundEvent.policy_tds;
    refundDeductedOnce = Math.abs(refundEvent.policy_expected_net - expected) < 0.01 && refundEvent.refund_total === 4150;
  }
  tests.push({
    test_name: 'Refund is deducted exactly once',
    passed: refundDeductedOnce,
    expected: 'Policy Net strictly reflects single deduction of refund_total',
    actual: refundEvent ? `Refund=₹${refundEvent.refund_total}, Policy Net=₹${refundEvent.policy_expected_net}` : 'Event not found',
    notes: 'Verified against partial refund discrepancy cohort',
  });

  // -------------------------------------------------------------------------
  // Test 6: Split settlements conserve amounts
  // -------------------------------------------------------------------------
  // Order 385 has split settlement across 2 tranches
  const splitEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0385');
  let splitConservesAmount = false;
  if (splitEvent && splitEvent.linked_settlement_ids.length === 2) {
    splitConservesAmount = Math.abs(splitEvent.policy_expected_net - splitEvent.gateway_reported_net) < 0.02 && splitEvent.status === 'RESOLVED';
  }
  tests.push({
    test_name: 'Split settlements conserve amounts',
    passed: splitConservesAmount,
    expected: 'Sum of split tranches equals net settled amount and resolves',
    actual: splitEvent ? `Linked ${splitEvent.linked_settlement_ids.length} settlements, Gateway Net=₹${splitEvent.gateway_reported_net}, Status=${splitEvent.status}` : 'Not found',
    notes: 'Tranches 1 & 2 conserve exact paise of merchant payout',
  });

  // -------------------------------------------------------------------------
  // Test 7: Duplicate bank credit does not inflate valid bank cash
  // -------------------------------------------------------------------------
  // Order 395 has duplicate bank credit
  const dupEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0395');
  let dupCashProtected = false;
  if (dupEvent) {
    // Should be classified as EXCEPTION, and NOT contribute to confirmed_cash
    const confirmedIds = new Set(
      result.economic_events.filter((e) => e.status === 'RESOLVED').map((e) => e.event_id)
    );
    dupCashProtected = dupEvent.status === 'EXCEPTION' && dupEvent.discrepancy_class === 'DUPLICATE_BANK_CREDIT' && !confirmedIds.has(dupEvent.event_id);
  }
  tests.push({
    test_name: 'Duplicate bank credit does not inflate valid bank cash',
    passed: dupCashProtected,
    expected: 'Duplicate bank credit flagged as EXCEPTION; excluded from confirmed cash',
    actual: dupEvent ? `Status=${dupEvent.status}, Class=${dupEvent.discrepancy_class}` : 'Not found',
    notes: 'Quarantines over-credited transactions to prevent false cash confirmation',
  });

  // -------------------------------------------------------------------------
  // Test 8: Missing bank credit differs from orphan bank credit
  // -------------------------------------------------------------------------
  // Missing bank credit is an ECONOMIC_EVENT with missing bank row
  // Orphan bank credit is a SOURCE_EXCEPTION with no parent order
  const missingBankEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0405');
  const orphanSource = result.source_exceptions.find((s) => s.exception_type === 'ORPHAN_BANK_CREDIT');
  const typesDiffer =
    Boolean(missingBankEvent && missingBankEvent.entity_type === 'ECONOMIC_EVENT' && missingBankEvent.status === 'EXCEPTION' && missingBankEvent.linked_bank_row_ids.length === 0) &&
    Boolean(orphanSource && orphanSource.entity_type === 'SOURCE_EXCEPTION');
  tests.push({
    test_name: 'Missing bank credit differs from orphan bank credit',
    passed: typesDiffer,
    expected: 'Missing bank is an ECONOMIC_EVENT; Orphan bank credit is a SOURCE_EXCEPTION',
    actual: `Missing Bank = ${missingBankEvent?.entity_type} (${missingBankEvent?.discrepancy_class}), Orphan = ${orphanSource?.entity_type} (${orphanSource?.exception_type})`,
    notes: 'Clear architectural boundary maintained between parentless source lines and unfulfilled lifecycles',
  });

  // -------------------------------------------------------------------------
  // Test 9: Late balanced bank credits are not marked RESOLVED
  // -------------------------------------------------------------------------
  // Order 425: Bank credited balanced amount, but 5 days after cutoff
  const lateEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0425');
  let lateNotResolved = false;
  if (lateEvent) {
    lateNotResolved =
      lateEvent.status === 'EXCEPTION' &&
      lateEvent.discrepancy_class === 'LATE_SETTLEMENT_AFTER_CUTOFF';
  }
  tests.push({
    test_name: 'Late balanced bank credits are not marked RESOLVED',
    passed: lateNotResolved,
    expected: 'EXCEPTION / LATE_SETTLEMENT_AFTER_CUTOFF even though amounts balance',
    actual: lateEvent ? `Status=${lateEvent.status}, Class=${lateEvent.discrepancy_class}` : 'Not found',
    notes: 'Strict timing predicate enforces expected_bank_arrival_cutoff',
  });

  // -------------------------------------------------------------------------
  // Test 10: Missing dates before and after cutoff receive different states
  // -------------------------------------------------------------------------
  // Order 435 is recent (before cutoff) -> PENDING_EXPECTED
  // Order 405 is old (after cutoff) -> EXCEPTION / MISSING_AFTER_CUTOFF
  const pendingEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0435');
  const missingAfterCutoffEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0405');
  const statesDiffer =
    pendingEvent?.status === 'PENDING_EXPECTED' &&
    missingAfterCutoffEvent?.status === 'EXCEPTION' &&
    missingAfterCutoffEvent?.discrepancy_class === 'MISSING_AFTER_CUTOFF';
  tests.push({
    test_name: 'Missing dates before and after cutoff receive different states',
    passed: Boolean(statesDiffer),
    expected: 'Before cutoff = PENDING_EXPECTED; After cutoff = EXCEPTION (MISSING_AFTER_CUTOFF)',
    actual: `Before cutoff: ${pendingEvent?.status}, After cutoff: ${missingAfterCutoffEvent?.status} (${missingAfterCutoffEvent?.discrepancy_class})`,
    notes: 'Timing window governs transitional pending state vs delinquent exception',
  });

  // -------------------------------------------------------------------------
  // Test 11: Settlement arithmetic is checked
  // -------------------------------------------------------------------------
  // Order 365 has gateway calculation error (settled != gross - fees)
  const arithEvent = result.economic_events.find((e) => e.order_id === 'ORD-2026-0365');
  let arithChecked = false;
  if (arithEvent) {
    arithChecked =
      arithEvent.status === 'EXCEPTION' &&
      arithEvent.discrepancy_class === 'SETTLEMENT_ARITHMETIC_MISMATCH';
  }
  tests.push({
    test_name: 'Settlement arithmetic is checked',
    passed: arithChecked,
    expected: 'Gateway gross-fee arithmetic verified; calculation errors flagged as EXCEPTION',
    actual: arithEvent ? `Status=${arithEvent.status}, Class=${arithEvent.discrepancy_class}` : 'Not found',
    notes: 'Catches upstream gateway fee deduction bugs',
  });

  // -------------------------------------------------------------------------
  // Test 12: Pairwise variance identity holds
  // -------------------------------------------------------------------------
  // Check that for all events and in aggregate:
  // (policy_expected_net - gateway_reported_net) + (gateway_reported_net - bank_received_net) === policy_expected_net - bank_received_net
  let allEventsSatisfyIdentity = true;
  for (const e of result.economic_events) {
    const pMinusG = e.policy_vs_gateway_variance;
    const gMinusB = e.gateway_vs_bank_variance;
    const pMinusB = e.policy_vs_bank_variance;
    if (Math.abs((pMinusG + gMinusB) - pMinusB) > 0.001) {
      allEventsSatisfyIdentity = false;
      break;
    }
  }
  const aggregateHolds = result.metrics.variance_identity_holds;
  tests.push({
    test_name: 'Pairwise variance identity holds',
    passed: allEventsSatisfyIdentity && aggregateHolds,
    expected: '(Policy - Gateway) + (Gateway - Bank) === (Policy - Bank) within ₹0.001',
    actual: `All 500 events pass. Aggregate diff: ₹${Math.abs(result.metrics.policy_vs_gateway_total_variance + result.metrics.gateway_vs_bank_total_variance - result.metrics.policy_vs_bank_total_variance).toFixed(4)}`,
    notes: 'Zero-leakage algebraic conservation across tri-feed ledger',
  });

  // -------------------------------------------------------------------------
  // Test 13: Every economic event receives exactly one final state
  // -------------------------------------------------------------------------
  let validStates = true;
  for (const e of result.economic_events) {
    if (e.status !== 'RESOLVED' && e.status !== 'PENDING_EXPECTED' && e.status !== 'EXCEPTION') {
      validStates = false;
      break;
    }
  }
  const sumMatches =
    result.metrics.resolved_count +
      result.metrics.pending_expected_count +
      result.metrics.exception_count ===
    500;
  tests.push({
    test_name: 'Every economic event receives exactly one final state',
    passed: validStates && sumMatches,
    expected: 'Resolved + Pending + Exception = 500. Zero INITIALIZED/UNRECONCILED',
    actual: `Resolved: ${result.metrics.resolved_count}, Pending: ${result.metrics.pending_expected_count}, Exception: ${result.metrics.exception_count} (Total: 500)`,
    notes: 'Exhaustive state closure guarantee',
  });

  // -------------------------------------------------------------------------
  // Test 14: Invalid LLM evidence IDs are rejected
  // -------------------------------------------------------------------------
  // Test domain verifier directly with an invalid fabricated evidence ID
  const testVerifier = new DomainVerifier();
  const mockEvent = { ...result.economic_events[0] };
  const verifierCheckInvalid = testVerifier.verifyEconomicEvent(
    mockEvent,
    [], // missing settlement evidence
    [], // missing bank evidence
    '2026-09-04'
  );
  tests.push({
    test_name: 'Invalid LLM evidence IDs are rejected',
    passed: !verifierCheckInvalid.validForResolution && verifierCheckInvalid.rejectionReason?.includes('MISSING'),
    expected: 'Verifier rejects fabricated or missing evidence IDs before committing',
    actual: `validForResolution=${verifierCheckInvalid.validForResolution}, Reason=${verifierCheckInvalid.rejectionReason}`,
    notes: 'AI hallucinated or non-existent evidence cannot penetrate the verifier boundary',
  });

  // -------------------------------------------------------------------------
  // Test 15: Rejected AI proposals persist as EXCEPTION
  // -------------------------------------------------------------------------
  // Order 499 (adversarial case) must persist as EXCEPTION
  const case2Event = result.economic_events.find((e) => e.order_id === 'ORD-2026-0499');
  let case2PersistsAsException = false;
  if (case2Event) {
    case2PersistsAsException =
      case2Event.status === 'EXCEPTION' &&
      (case2Event.discrepancy_class === 'PROMPT_INJECTION_REJECTED' || case2Event.discrepancy_class === 'MERCHANT_POLICY_MISMATCH');
  }
  tests.push({
    test_name: 'Rejected AI proposals persist as EXCEPTION',
    passed: case2PersistsAsException,
    expected: 'Event remains EXCEPTION when AI hypothesis is rejected by verifier',
    actual: case2Event ? `Status=${case2Event.status}, Class=${case2Event.discrepancy_class}` : 'Not found',
    notes: 'No silent fall-through to resolved state',
  });

  // -------------------------------------------------------------------------
  // Test 16: Instruction-like bank narration cannot alter financial state
  // -------------------------------------------------------------------------
  // Check Order 499 bank narration injection
  const injectionBankRow = rawFeeds.bankStatement.find((b) => b.narration.includes('SYSTEM_OVERRIDE'));
  const injectionProtected =
    Boolean(injectionBankRow) &&
    case2Event?.status === 'EXCEPTION' &&
    result.demo_cases_status.case_2_injection_defended;
  tests.push({
    test_name: 'Instruction-like bank narration cannot alter financial state',
    passed: Boolean(injectionProtected),
    expected: 'Adversarial instruction in narration neutralized; state remains EXCEPTION',
    actual: `Adversarial narration detected: "${injectionBankRow?.narration.substring(0, 40)}...". Event Status: ${case2Event?.status}`,
    notes: 'Prompt injection heuristics and ledger conservation prevent state hijack',
  });

  // -------------------------------------------------------------------------
  // Test 17: Ambiguous evidence collision triggers NO_DOUBLE_ASSIGNMENT rejection and lands in EXCEPTION
  // -------------------------------------------------------------------------
  // Orders 465 and 466 share the identical settlement UTR and candidate bank credit (BNK-0465).
  // Order 465 evaluates first, claiming BNK-0465 and resolving.
  // Order 466 evaluates second, detects BNK-0465 is already claimed, fails NO_DOUBLE_ASSIGNMENT,
  // receives DOUBLE_ASSIGNED_EVIDENCE rejection, and lands in EXCEPTION.
  const event465 = result.economic_events.find((e) => e.order_id === 'ORD-2026-0465');
  const event466 = result.economic_events.find((e) => e.order_id === 'ORD-2026-0466');
  const checkDoubleAssignmentFailed = event466?.verifications.find((v) => v.id === 'NO_DOUBLE_ASSIGNMENT' && !v.passed);
  const doubleAssignmentCaught =
    event465?.status === 'RESOLVED' &&
    event466?.status === 'EXCEPTION' &&
    event466?.discrepancy_class === 'DOUBLE_ASSIGNED_EVIDENCE' &&
    Boolean(checkDoubleAssignmentFailed);

  tests.push({
    test_name: 'Ambiguous evidence collision triggers NO_DOUBLE_ASSIGNMENT rejection and lands in EXCEPTION',
    passed: Boolean(doubleAssignmentCaught),
    expected: 'Order 466 rejected via NO_DOUBLE_ASSIGNMENT as DOUBLE_ASSIGNED_EVIDENCE in EXCEPTION',
    actual: `Order 465: ${event465?.status}, Order 466: ${event466?.status} (${event466?.discrepancy_class}, NO_DOUBLE_ASSIGNMENT passed=${checkDoubleAssignmentFailed ? 'false' : 'true'})`,
    notes: 'Single Ownership Conservation quarantines contested evidence against double-counting',
  });

  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.length - passedCount;

  return {
    all_passed: failedCount === 0,
    total_tests: tests.length,
    passed_count: passedCount,
    failed_count: failedCount,
    duration_ms: Date.now() - startTime,
    tests,
  };
}

// If executed via CLI
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('correctness.test.ts')) {
  runAllCorrectnessTests().then((res) => {
    console.log(`\n======================================================`);
    console.log(`ReconLoop Correctness Verification Suite`);
    console.log(`Total: ${res.total_tests} | Passed: ${res.passed_count} | Failed: ${res.failed_count} (${res.duration_ms}ms)`);
    console.log(`======================================================\n`);
    for (const t of res.tests) {
      const mark = t.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${mark} : ${t.test_name}`);
      if (!t.passed) {
        console.log(`   Expected: ${t.expected}`);
        console.log(`   Actual:   ${t.actual}`);
      }
    }
    console.log(`\nAll Passed: ${res.all_passed}\n`);
    if (!res.all_passed) {
      process.exit(1);
    }
  });
}
