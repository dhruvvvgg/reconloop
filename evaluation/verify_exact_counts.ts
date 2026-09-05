import fs from 'fs';
import path from 'path';
import { runReconciliationPipeline } from '../src/engine/pipeline';
import { RawFeeds } from '../src/types';

function isGroundTruthException(orderId: string): boolean {
  const match = orderId.match(/^ORD-2026-(\d+)$/);
  if (!match) return false;
  const num = parseInt(match[1], 10);

  // 361-370: Settlement Arithmetic Mismatch
  if (num >= 361 && num <= 370) return true;
  // 371-380: Merchant Policy Fee Mismatch
  if (num >= 371 && num <= 380) return true;
  // 401-410: Missing bank credit after cutoff date
  if (num >= 401 && num <= 410) return true;
  // 411-420: Missing settlement records
  if (num >= 411 && num <= 420) return true;
  // 421-430: Late Settlement Timing Violations
  if (num >= 421 && num <= 430) return true;
  // 465-466: Colliding UTR / ambiguous grouping
  if (num === 465 || num === 466) return true;
  // 471-488: Ambiguous stress cases without valid evidence token
  if (num >= 471 && num <= 488) return true;
  // 499: Adversarial Prompt Injection with fee discrepancy
  if (num === 499) return true;

  return false;
}

async function analyzeMode(name: string, mode: 'deterministic_baseline' | 'benchmark_live_with_verifier', rawData: RawFeeds) {
  console.log(`\n=======================================================`);
  console.log(`RUNNING MODE: ${name}`);
  console.log(`=======================================================`);

  const result = await runReconciliationPipeline(rawData, { mode });
  const events = result.economic_events;

  // 1. Group all 500 events by discrepancy_class
  const discrepancyCounts: Record<string, number> = {};
  for (const ev of events) {
    const cls = ev.discrepancy_class || 'NONE';
    discrepancyCounts[cls] = (discrepancyCounts[cls] || 0) + 1;
  }

  console.log(`\n--- 1. RAW GROUPED COUNTS BY discrepancy_class (Total events = ${events.length}) ---`);
  let sumCounts = 0;
  for (const [cls, count] of Object.entries(discrepancyCounts).sort()) {
    console.log(`  ${cls.padEnd(35)} : ${count}`);
    sumCounts += count;
  }
  console.log(`  ${'TOTAL SUM'.padEnd(35)} : ${sumCounts}`);

  // Also group by status
  const statusCounts: Record<string, number> = {};
  for (const ev of events) {
    statusCounts[ev.status] = (statusCounts[ev.status] || 0) + 1;
  }
  console.log(`\n--- STATUS BREAKDOWN ---`);
  for (const [st, count] of Object.entries(statusCounts)) {
    console.log(`  ${st.padEnd(35)} : ${count}`);
  }

  // 2. Compute the exact 4 metrics
  const totalEvents = events.length;
  const resolved = events.filter((e) => e.status === 'RESOLVED');
  const exceptions = events.filter((e) => e.status === 'EXCEPTION');
  const pending = events.filter((e) => e.status === 'PENDING_EXPECTED');

  const groundTruthExceptions = events.filter((e) => isGroundTruthException(e.order_id));
  const totalGT = groundTruthExceptions.length;

  const resolvedAndGTException = resolved.filter((e) => isGroundTruthException(e.order_id));
  const exceptionAndGTException = exceptions.filter((e) => isGroundTruthException(e.order_id));

  const balancedResolved = resolved.filter((e) => {
    const pDiff = Math.abs(e.policy_expected_net - e.bank_received_net);
    const gDiff = Math.abs(e.gateway_reported_net - e.bank_received_net);
    return pDiff < 0.02 && gDiff < 0.02;
  });

  console.log(`\n--- 2. EXACT METRIC FRACTIONS AND PERCENTAGES ---`);

  // resolution_rate = count(status == 'RESOLVED') / 500
  const resRateNum = resolved.length;
  const resRateDen = totalEvents;
  const resRatePct = ((resRateNum / resRateDen) * 100).toFixed(4);
  console.log(`resolution_rate       = ${resRateNum} / ${resRateDen} = ${resRatePct}%`);

  // false_resolution_rate = count(status == 'RESOLVED' AND is_ground_truth_exception) / count(status == 'RESOLVED')
  // NOTE: The user's requested formula: denominator = count(status == 'RESOLVED')
  const falseResNum = resolvedAndGTException.length;
  const falseResDen = resolved.length;
  const falseResPct = falseResDen > 0 ? ((falseResNum / falseResDen) * 100).toFixed(4) : '0.0000';
  console.log(`false_resolution_rate (per user def: resolved_gt_exc / resolved) = ${falseResNum} / ${falseResDen} = ${falseResPct}%`);
  // Also show classical false resolution rate: resolved_gt_exc / total_gt_exceptions
  const falseResGtDen = totalGT;
  const falseResGtPct = falseResGtDen > 0 ? ((falseResNum / falseResGtDen) * 100).toFixed(4) : '0.0000';
  console.log(`false_resolution_rate (alt: resolved_gt_exc / total_gt_exceptions) = ${falseResNum} / ${falseResGtDen} = ${falseResGtPct}%`);

  // exception_recall = count(status == 'EXCEPTION' AND is_ground_truth_exception) / count(is_ground_truth_exception)
  const excRecallNum = exceptionAndGTException.length;
  const excRecallDen = totalGT;
  const excRecallPct = excRecallDen > 0 ? ((excRecallNum / excRecallDen) * 100).toFixed(4) : '0.0000';
  console.log(`exception_recall      = ${excRecallNum} / ${excRecallDen} = ${excRecallPct}%`);

  // ledger_balance_rate = count(resolved AND policy==gateway==bank within tolerance) / count(status == 'RESOLVED')
  const balNum = balancedResolved.length;
  const balDen = resolved.length;
  const balPct = balDen > 0 ? ((balNum / balDen) * 100).toFixed(4) : '0.0000';
  console.log(`ledger_balance_rate   = ${balNum} / ${balDen} = ${balPct}%`);

  // Show any ground truth exceptions that got resolved
  if (resolvedAndGTException.length > 0) {
    console.log(`\nGround truth exceptions that were RESOLVED:`);
    for (const e of resolvedAndGTException) {
      console.log(`  Order: ${e.order_id}, Status: ${e.status}, Class: ${e.discrepancy_class}, Policy: ${e.policy_expected_net}, Bank: ${e.bank_received_net}`);
    }
  }

  // Show ground truth exceptions that were NOT flagged as EXCEPTION
  const missedGT = groundTruthExceptions.filter((e) => e.status !== 'EXCEPTION');
  if (missedGT.length > 0) {
    console.log(`\nGround truth exceptions NOT in EXCEPTION status:`);
    for (const e of missedGT) {
      console.log(`  Order: ${e.order_id}, Status: ${e.status}, Class: ${e.discrepancy_class}`);
    }
  }
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'data/stress_batch.json');
  const rawData: RawFeeds = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  await analyzeMode('deterministic_baseline', 'deterministic_baseline', rawData);
  await analyzeMode('benchmark_live_with_verifier', 'benchmark_live_with_verifier', rawData);
}

main().catch(console.error);
