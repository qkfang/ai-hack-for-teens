/**
 * Load test: simulates ~80 concurrent users hitting key API endpoints.
 *
 * Run:  npx ts-node --project tsconfig.json tests/load.ts
 *   or: BASE_URL=https://your-app.example.com \
 *       API_BASE_URL=https://your-api.example.com \
 *       npx ts-node tests/load.ts
 *
 * Reports p50/p95/p99 latency and error rate per endpoint.
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5163";
const CONCURRENCY = 20;
const REQUESTS_PER_USER = 1;

interface Result {
  endpoint: string;
  status: number;
  durationMs: number;
  error?: string;
}

async function fetchOne(endpoint: string, body?: unknown): Promise<Result> {
  const start = Date.now();
  try {
    const res = await fetch(endpoint, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    // drain the body (handles SSE/streaming responses)
    await res.text();
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

async function runLoad(endpoint: string, body?: unknown): Promise<Result[]> {
  const tasks: Promise<Result>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    for (let j = 0; j < REQUESTS_PER_USER; j++) {
      tasks.push(
        fetchOne(endpoint, body).then((r) => {
          console.log(`  [${r.status}] ${r.endpoint} — ${r.durationMs}ms${r.error ? ` (${r.error})` : ""}`);
          return r;
        })
      );
    }
  }
  return Promise.all(tasks);
}

async function main() {
  console.log(`Load test — ${CONCURRENCY} concurrent users × ${REQUESTS_PER_USER} requests each`);

  await loadChat();

  console.log("\nLoad test complete.\n");
}


async function loadChat() {
  const url = `${API_BASE_URL}/api/chat`;
  const body = {
    messages: [{ role: "user", content: "Tell me a detailed and fascinating story about the history of space exploration, covering key milestones from Sputnik in 1957 through the Apollo moon landings, the Space Shuttle program, the International Space Station, and modern private spaceflight. Include interesting facts about the astronauts, the challenges they faced, scientific discoveries made, and how each era shaped the next. Please provide a thorough and engaging narrative that would inspire a young student to pursue a career in science or engineering." }],
    systemPrompt: "You are a helpful assistant.",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 128,
    topP: 1.0,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    mcpTools: [],
  };
  console.log(`\n=== POST ${url} ===`);
  printReport(url, await runLoad(url, body));
}

main().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
