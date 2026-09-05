import fs from 'fs';
import path from 'path';
import { runReconciliationPipeline } from '../src/engine/pipeline';
import { resolveResidualAmbiguityWithGemini } from '../src/engine/gemini';
import { DomainVerifier } from '../src/engine/verifier';
import { RawFeeds } from '../src/types';

async function main() {
  const filePath = path.resolve(process.cwd(), 'data/stress_batch.json');
  const rawFeeds: RawFeeds = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log('========================================================================================');
  console.log('RAW PER-CASE TRACE: ALL 20 LLM-ELIGIBLE CASES IN STRESS BATCH (LIVE GEMINI-3.6-FLASH)');
  console.log('========================================================================================\n');

  // Find candidate settlements and bank statement rows for each case
  const eligibleOrderIds = [
    ...Array.from({ length: 18 }, (_, i) => `ORD-2026-0${471 + i}`),
    'ORD-2026-0498',
    'ORD-2026-0499',
  ];

  const results = [];
  const verifier = new DomainVerifier();

  for (let idx = 9; idx < eligibleOrderIds.length; idx++) {
    const orderId = eligibleOrderIds[idx];
    const order = rawFeeds.orders.find((o) => o.order_id === orderId)!;
    const settlements = rawFeeds.settlements.filter((s) => s.order_id === orderId);
    
    // Find candidate bank rows within +/- 3 day window
    const candidateBankRows = rawFeeds.bankStatement.filter((b) => {
      // Look for candidates near the settlement date
      const sDate = settlements[0]?.settlement_date || '2026-08-21';
      return Math.abs(new Date(b.bank_date).getTime() - new Date(sDate).getTime()) <= 4 * 86400000;
    }).slice(0, 5);

    const dummyEvent: any = {
      event_id: `EE-${orderId}`,
      order_id: orderId,
      order_date: order.order_date,
      order_amount: order.order_amount,
      discount: order.discount,
      refund_total: order.refund_total,
      currency: order.currency,
      policy_fee: settlements[0]?.gateway_fee || 25,
      policy_tax: settlements[0]?.gateway_tax || 4.5,
      policy_tds: settlements[0]?.gateway_tds || 12.5,
      policy_expected_net: settlements[0]?.settled_amount || 1000,
      gateway_reported_net: settlements[0]?.settled_amount || 1000,
      bank_received_net: 0,
      policy_vs_gateway_variance: 0,
      gateway_vs_bank_variance: 0,
      policy_vs_bank_variance: 0,
      status: 'PENDING_EXPECTED',
      discrepancy_class: 'CLEAN_MATCH',
      gateway_settlement_date: settlements[0]?.settlement_date || '2026-08-21',
      settlement_window_days: 2,
      expected_bank_arrival_cutoff: '2026-08-23',
      actual_bank_date: null,
      is_timing_violation: false,
      linked_settlement_ids: settlements.map((s) => s.settlement_id),
      linked_bank_row_ids: [],
      verifications: [],
      audit_trail: [],
    };

    console.log(`----------------------------------------------------------------------------------------`);
    console.log(`[Case ${idx + 1}/20] Evaluating ${orderId}`);
    console.log(`  - Order Amount: $${order.order_amount} | Expected Net: $${dummyEvent.policy_expected_net}`);
    console.log(`  - Settlement ID: ${settlements[0]?.settlement_id} | UTR: ${settlements[0]?.utr}`);
    console.log(`  - Candidate Bank Rows Evaluated: ${candidateBankRows.length}`);
    console.log(`  - Sent to Live LLM (gemini-3.6-flash): true`);

    const t0 = Date.now();
    let hypothesis;
    try {
      hypothesis = await resolveResidualAmbiguityWithGemini(
        { event: dummyEvent, candidateBankRows },
        'benchmark_live'
      );
    } catch (e: any) {
      hypothesis = {
        proposed_event_id: dummyEvent.event_id,
        proposed_bank_row_id: null,
        match_confidence: 0,
        suggested_action: 'REJECT_UNRELIABLE',
        rationale: `Error: ${e.message}`,
      };
    }
    const duration = Date.now() - t0;

    console.log(`  - Gemini Response Time: ${duration}ms`);
    console.log(`  - Gemini Action: ${hypothesis.suggested_action} | Confidence: ${hypothesis.match_confidence}`);
    console.log(`  - Proposed Bank Row: ${hypothesis.proposed_bank_row_id || 'None'}`);
    console.log(`  - Rationale: ${hypothesis.rationale}`);

    // Check verifier acceptance
    const matchedBank = candidateBankRows.filter((b) => b.bank_row_id === hypothesis.proposed_bank_row_id);
    dummyEvent.linked_bank_row_ids = matchedBank.map((b) => b.bank_row_id);
    dummyEvent.bank_received_net = matchedBank.reduce((sum, b) => sum + b.credited_amount, 0);

    const verification = verifier.verifyEconomicEvent(
      dummyEvent,
      settlements,
      matchedBank,
      '2026-09-05'
    );

    let verifierDecision = 'REJECTED';
    let finalStatus = 'EXCEPTION';

    if (hypothesis.suggested_action === 'ACCEPT_MATCH' && verification.validForResolution) {
      verifierDecision = 'ACCEPTED';
      finalStatus = 'RESOLVED';
      verifier.commitClaims(dummyEvent.linked_settlement_ids, dummyEvent.linked_bank_row_ids);
    } else {
      const failedChecks = verification.checks.filter((c) => !c.passed).map((c) => c.name);
      verifierDecision = `REJECTED (${failedChecks.join(', ') || 'Confidence/Action failure'})`;
      finalStatus = 'EXCEPTION';
    }

    console.log(`  - Verifier Decision: ${verifierDecision}`);
    console.log(`  - Resulting Status: ${finalStatus}`);

    results.push({
      case_index: idx + 1,
      order_id: orderId,
      sent_to_llm: true,
      duration_ms: duration,
      suggested_action: hypothesis.suggested_action,
      confidence: hypothesis.match_confidence,
      proposed_bank_row: hypothesis.proposed_bank_row_id,
      rationale: hypothesis.rationale,
      verifier_decision: verifierDecision,
      resulting_status: finalStatus,
    });
  }

  console.log(`\n========================================================================================`);
  console.log(`SUMMARY OF 20 CASES:`);
  console.log(`Resolved: ${results.filter((r) => r.resulting_status === 'RESOLVED').length}/20`);
  console.log(`Exception: ${results.filter((r) => r.resulting_status === 'EXCEPTION').length}/20`);
  console.log(`========================================================================================`);
}

main().catch(console.error);
