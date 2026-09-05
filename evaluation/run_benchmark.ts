import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { runReconciliationPipeline } from '../src/engine/pipeline';
import { generateStressBatch, generateRealisticBatch } from '../src/engine/dataset';
import { RawFeeds, ExecutionMode } from '../src/types';

interface BenchmarkMetrics {
  mode: string;
  total_events: number;
  resolved: number;
  pending: number;
  exceptions: number;
  resolution_rate: string;
  false_resolution_rate: string;
  exception_recall: string;
  ledger_balance_rate: string;
  llm_calls_made: number;
  duration_ms: number;
}

// Ground truth exception orders in the stress batch
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

function computeMetrics(
  modeName: string,
  events: any[],
  llmCalls: number,
  durationMs: number
): BenchmarkMetrics {
  const total = events.length;
  const resolved = events.filter((e) => e.status === 'RESOLVED');
  const pending = events.filter((e) => e.status === 'PENDING_EXPECTED');
  const exceptions = events.filter((e) => e.status === 'EXCEPTION');

  const groundTruthExceptions = events.filter((e) => isGroundTruthException(e.order_id));
  const totalGTExceptions = groundTruthExceptions.length;

  // False resolutions: events that are ground-truth exceptions but were marked RESOLVED
  const falseResolutions = resolved.filter((e) => isGroundTruthException(e.order_id));
  const falseResolutionRate =
    totalGTExceptions > 0
      ? ((falseResolutions.length / totalGTExceptions) * 100).toFixed(1) + '%'
      : '0.0%';

  // Exception recall: fraction of true exceptions that landed in EXCEPTION
  const caughtExceptions = exceptions.filter((e) => isGroundTruthException(e.order_id));
  const exceptionRecall =
    totalGTExceptions > 0
      ? ((caughtExceptions.length / totalGTExceptions) * 100).toFixed(1) + '%'
      : '100.0%';

  // Ledger balance rate: fraction of resolved cases where policy == gateway == bank (variance == 0)
  const balancedResolved = resolved.filter((e) => {
    const pDiff = Math.abs(e.policy_expected_net - e.bank_received_net);
    const gDiff = Math.abs(e.gateway_reported_net - e.bank_received_net);
    return pDiff < 0.02 && gDiff < 0.02;
  });
  const ledgerBalanceRate =
    resolved.length > 0
      ? ((balancedResolved.length / resolved.length) * 100).toFixed(1) + '%'
      : '100.0%';

  return {
    mode: modeName,
    total_events: total,
    resolved: resolved.length,
    pending: pending.length,
    exceptions: exceptions.length,
    resolution_rate: ((resolved.length / total) * 100).toFixed(1) + '%',
    false_resolution_rate: falseResolutionRate,
    exception_recall: exceptionRecall,
    ledger_balance_rate: ledgerBalanceRate,
    llm_calls_made: llmCalls,
    duration_ms: durationMs,
  };
}

export async function runAblationStudy() {
  console.log('=====================================================================');
  console.log('RECONLOOP 3-MODE ABLATION BENCHMARK RUNNER');
  console.log('=====================================================================\n');

  // Load frozen stress batch
  const filePath = path.resolve(process.cwd(), 'data/stress_batch.json');
  let rawData: RawFeeds;
  let fileHash = '';

  if (fs.existsSync(filePath)) {
    const rawStr = fs.readFileSync(filePath, 'utf-8');
    rawData = JSON.parse(rawStr);
    fileHash = crypto.createHash('sha256').update(rawStr).digest('hex');
    console.log(`Loaded frozen stress batch from ${filePath}`);
    console.log(`SHA-256 Hash: ${fileHash}`);
  } else {
    rawData = generateStressBatch();
    const rawStr = JSON.stringify(rawData, null, 2);
    fileHash = crypto.createHash('sha256').update(rawStr).digest('hex');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, rawStr, 'utf-8');
    console.log(`Generated and froze stress batch to ${filePath}`);
    console.log(`SHA-256 Hash: ${fileHash}`);
  }

  console.log(`Dataset size: ${rawData.orders.length} orders, ${rawData.settlements.length} settlements, ${rawData.bankStatement.length} bank rows\n`);

  const results: BenchmarkMetrics[] = [];

  // -------------------------------------------------------------------------
  // Mode 1: Deterministic Baseline
  // -------------------------------------------------------------------------
  console.log('Running Mode 1: deterministic_baseline (Deterministic Candidate Scoring & Rules)...');
  const t1 = Date.now();
  const res1 = await runReconciliationPipeline(rawData, {
    executionMode: 'deterministic_baseline',
  });
  const dur1 = Date.now() - t1;
  const metrics1 = computeMetrics('deterministic_baseline', res1.economic_events, 0, dur1);
  results.push(metrics1);
  console.log(`  -> Completed in ${dur1}ms | Resolved: ${metrics1.resolved} | Exceptions: ${metrics1.exceptions}\n`);

  // -------------------------------------------------------------------------
  // Mode 2: Benchmark Live (Un-gated Gemini)
  // -------------------------------------------------------------------------
  console.log('Running Mode 2: benchmark_live (Live Gemini Calls, Raw LLM Gating)...');
  const t2 = Date.now();
  // Count LLM-eligible cases that trigger live calls
  let llmCallsMode2 = 0;
  const res2 = await runReconciliationPipeline(rawData, {
    executionMode: 'benchmark_live',
  });
  const dur2 = Date.now() - t2;
  const llmCands2 = res2.candidate_associations.filter((c) => c.match_strategy === 'LLM_HYPOTHESIS');
  llmCallsMode2 = llmCands2.length;
  const metrics2 = computeMetrics('benchmark_live', res2.economic_events, llmCallsMode2, dur2);
  results.push(metrics2);
  console.log(`  -> Completed in ${dur2}ms | Resolved: ${metrics2.resolved} | Exceptions: ${metrics2.exceptions} | LLM Calls: ${llmCallsMode2}\n`);

  // -------------------------------------------------------------------------
  // Mode 3: Benchmark Live + Verifier (Live Gemini + DomainVerifier Gating)
  // -------------------------------------------------------------------------
  console.log('Running Mode 3: benchmark_live + verifier (Live Gemini + DomainVerifier Invariant Gating)...');
  const t3 = Date.now();
  let llmCallsMode3 = 0;
  const res3 = await runReconciliationPipeline(rawData, {
    executionMode: 'benchmark_live_with_verifier',
  });
  const dur3 = Date.now() - t3;
  const llmCands3 = res3.candidate_associations.filter((c) => c.match_strategy === 'LLM_HYPOTHESIS');
  llmCallsMode3 = llmCands3.length;
  const metrics3 = computeMetrics('benchmark_live + verifier', res3.economic_events, llmCallsMode3, dur3);
  results.push(metrics3);
  console.log(`  -> Completed in ${dur3}ms | Resolved: ${metrics3.resolved} | Exceptions: ${metrics3.exceptions} | LLM Calls: ${llmCallsMode3}\n`);

  // -------------------------------------------------------------------------
  // Output Comparison Table
  // -------------------------------------------------------------------------
  console.log('========================================================================================================================');
  console.log('                                            ABLATION STUDY RESULTS MATRIX                                               ');
  console.log('========================================================================================================================');
  console.table(
    results.map((r) => ({
      'Pipeline Mode': r.mode,
      'Resolution Rate': r.resolution_rate,
      'False-Resolution Rate': r.false_resolution_rate,
      'Exception Recall': r.exception_recall,
      'Ledger-Balance Rate': r.ledger_balance_rate,
      'LLM Calls': r.llm_calls_made,
      'Duration (ms)': r.duration_ms,
    }))
  );
  console.log('========================================================================================================================\n');

  // Save results to evaluation/benchmark_results.json
  const outPath = path.resolve(process.cwd(), 'evaluation/benchmark_results.json');
  fs.writeFileSync(outPath, JSON.stringify({ dataset_sha256: fileHash, results }, null, 2), 'utf-8');
  console.log(`Ablation results saved to: ${outPath}`);

  return results;
}

// Run if directly executed
if (process.argv[1]?.endsWith('run_benchmark.ts')) {
  runAblationStudy().catch(console.error);
}
