/**
 * Load test: simulates ~80 concurrent users hitting key API endpoints.
 *
 * Run:  npx ts-node --project tsconfig.json tests/load.ts
 *   or: BASE_URL=https://your-app.example.com npx ts-node tests/load.ts
 *
 * Reports p50/p95/p99 latency and error rate per endpoint.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CONCURRENCY = 80;
const REQUESTS_PER_USER = 3;

interface Result {
  endpoint: string;
  status: number;
  durationMs: number;
  error?: string;
}

async function fetchOne(endpoint: string): Promise<Result> {
  const url = `${BASE_URL}${endpoint}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return { endpoint, status: res.status, durationMs: Date.now() - start };
  } catch (err) {
    return {
      endpoint,
      status: 0,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function printReport(label: string, results: Result[]) {
  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const errors = results.filter((r) => r.status === 0 || r.status >= 500);
  console.log(`\n── ${label} (${results.length} requests) ──`);
  console.log(`  p50: ${percentile(durations, 50)}ms`);
  console.log(`  p95: ${percentile(durations, 95)}ms`);
  console.log(`  p99: ${percentile(durations, 99)}ms`);
  console.log(`  errors: ${errors.length} (${((errors.length / results.length) * 100).toFixed(1)}%)`);
  if (errors.length > 0) {
    const sample = errors.slice(0, 3);
    sample.forEach((e) =>
      console.log(`    [${e.status}] ${e.endpoint} ${e.error || ""}`)
    );
  }
}

async function runLoad(endpoint: string): Promise<Result[]> {
  const tasks: Promise<Result>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    for (let j = 0; j < REQUESTS_PER_USER; j++) {
      tasks.push(fetchOne(endpoint));
    }
  }
  return Promise.all(tasks);
}

async function main() {
  console.log(`Load test — ${CONCURRENCY} concurrent users × ${REQUESTS_PER_USER} requests each`);
  console.log(`Target: ${BASE_URL}\n`);

  const endpoints = [
    "/api/schema",
    "/api/user?list=true",
    "/api/code?userId=load-test-user&all=true",
    "/api/gallery",
  ];

  for (const ep of endpoints) {
    const results = await runLoad(ep);
    printReport(ep, results);
  }

  console.log("\nLoad test complete.\n");
}

main().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
