import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateBenchmarkDataset, convertFeedsToCsv } from './src/engine/dataset';
import { runReconciliationPipeline } from './src/engine/pipeline';
import { runAllCorrectnessTests } from './src/tests/correctness.test';
import { resolveResidualAmbiguityWithGemini } from './src/engine/gemini';
import { ReconciliationOptions } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory cache for benchmark dataset and latest reconciliation result
let cachedDataset = generateBenchmarkDataset();
let cachedCsv = convertFeedsToCsv(cachedDataset);
let latestReconResult: any = null;

// ===========================================================================
// API ROUTES
// ===========================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ReconLoop',
    environment: process.env.NODE_ENV || 'development',
    has_gemini_key: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    has_gemini_key: Boolean(process.env.GEMINI_API_KEY),
    benchmark_date: '2026-09-04',
    total_events: 500,
    version: '1.0.0-verifiable',
  });
});

// Returns the raw source feeds and CSV preview
app.get('/api/benchmark-feeds', (req, res) => {
  try {
    res.json({
      orders_count: cachedDataset.orders.length,
      settlements_count: cachedDataset.settlements.length,
      bank_rows_count: cachedDataset.bankStatement.length,
      orders_sample: cachedDataset.orders.slice(0, 50),
      settlements_sample: cachedDataset.settlements.slice(0, 50),
      bank_rows_sample: cachedDataset.bankStatement.slice(0, 50),
      csv_previews: {
        orders_csv: cachedCsv.ordersCsv.split('\n').slice(0, 20).join('\n'),
        settlements_csv: cachedCsv.settlementsCsv.split('\n').slice(0, 20).join('\n'),
        bank_statement_csv: cachedCsv.bankStatementCsv.split('\n').slice(0, 20).join('\n'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Runs the 8-stage reconciliation pipeline
app.post('/api/reconcile', async (req, res) => {
  try {
    const options: ReconciliationOptions = {
      mode: req.body.mode === 'live_gemini' ? 'live_gemini' : 'deterministic',
      cutoff_date: req.body.cutoff_date || '2026-09-04',
      variance_tolerance: req.body.variance_tolerance || 0.01,
    };

    const result = await runReconciliationPipeline(cachedDataset, options);
    latestReconResult = result;
    res.json(result);
  } catch (err: any) {
    console.error('Reconciliation error:', err);
    res.status(500).json({ error: err.message || 'Internal reconciliation error' });
  }
});

// Executes the comprehensive 16-predicate correctness test suite
app.post('/api/run-tests', async (req, res) => {
  try {
    const testResults = await runAllCorrectnessTests();
    res.json(testResults);
  } catch (err: any) {
    console.error('Test execution error:', err);
    res.status(500).json({ error: err.message || 'Failed to run test suite' });
  }
});

// Single-event Gemini hypothesis resolution endpoint
app.post('/api/resolve-hypothesis', async (req, res) => {
  try {
    const { event, candidateBankRows, mode } = req.body;
    if (!event || !candidateBankRows) {
      return res.status(400).json({ error: 'Missing event or candidateBankRows' });
    }

    const hypothesis = await resolveResidualAmbiguityWithGemini(
      { event, candidateBankRows },
      mode || 'deterministic'
    );
    res.json(hypothesis);
  } catch (err: any) {
    console.error('Hypothesis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reseed benchmark data
app.post('/api/reseed', (req, res) => {
  cachedDataset = generateBenchmarkDataset();
  cachedCsv = convertFeedsToCsv(cachedDataset);
  latestReconResult = null;
  res.json({ message: 'Benchmark data reseeded deterministically', count: cachedDataset.orders.length });
});

// Explicitly handle all unmatched /api/* routes as JSON 404
// This prevents Vite SPA middleware from returning HTML index.html for API calls
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global API error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  } else {
    next(err);
  }
});

// ===========================================================================
// VITE / STATIC SERVING
// ===========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReconLoop Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
