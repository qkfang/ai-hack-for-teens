# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> GET /api/comics/user/:userId >> returns empty array for non-existent user
- Location: api.spec.ts:350:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  252 | 
  253 |   test("vote returns 404 for non-existent idea", async ({ request }) => {
  254 |     const res = await request.post(`${API}/api/ideas/999999/vote`, {
  255 |       data: { userId: voterId },
  256 |     });
  257 |     expect(res.status()).toBe(404);
  258 |   });
  259 | 
  260 |   test("vote returns 404 for non-existent user", async ({ request }) => {
  261 |     const res = await request.post(`${API}/api/ideas/${ideaId}/vote`, {
  262 |       data: { userId: 999999 },
  263 |     });
  264 |     expect(res.status()).toBe(404);
  265 |   });
  266 | 
  267 |   test("unpublish idea", async ({ request }) => {
  268 |     const res = await request.patch(`${API}/api/ideas/${ideaId}/unpublish`);
  269 |     expect(res.status()).toBe(200);
  270 |     const body = await res.json();
  271 |     expect(body.isPublished).toBe(false);
  272 |   });
  273 | 
  274 |   test("mark webbuilder", async ({ request }) => {
  275 |     const res = await request.patch(`${API}/api/ideas/${ideaId}/webbuilder`);
  276 |     expect(res.status()).toBe(200);
  277 |     const body = await res.json();
  278 |     expect(body.hasWebBuilder).toBe(true);
  279 |   });
  280 | 
  281 |   test("delete idea returns 204", async ({ request }) => {
  282 |     const res = await request.delete(`${API}/api/ideas/${ideaId}`);
  283 |     expect(res.status()).toBe(204);
  284 |   });
  285 | 
  286 |   test("deleted idea returns 404", async ({ request }) => {
  287 |     const res = await request.get(`${API}/api/ideas/${ideaId}`);
  288 |     expect(res.status()).toBe(404);
  289 |   });
  290 | 
  291 |   test("delete non-existent idea returns 404", async ({ request }) => {
  292 |     const res = await request.delete(`${API}/api/ideas/999999`);
  293 |     expect(res.status()).toBe(404);
  294 |   });
  295 | 
  296 |   test("publish non-existent idea returns 404", async ({ request }) => {
  297 |     const res = await request.patch(`${API}/api/ideas/999999/publish`);
  298 |     expect(res.status()).toBe(404);
  299 |   });
  300 | });
  301 | 
  302 | // ── Weather ───────────────────────────────────────────────────────────────────
  303 | 
  304 | test.describe("GET /api/weather", () => {
  305 |   test("returns an array", async ({ request }) => {
  306 |     const res = await request.get(`${API}/api/weather`);
  307 |     expect(res.status()).toBe(200);
  308 |     expect(Array.isArray(await res.json())).toBe(true);
  309 |   });
  310 | });
  311 | 
  312 | test.describe("GET /api/weather/summary", () => {
  313 |   test("returns summary with TotalCities", async ({ request }) => {
  314 |     const res = await request.get(`${API}/api/weather/summary`);
  315 |     expect(res.status()).toBe(200);
  316 |     const body = await res.json();
  317 |     expect(body).toHaveProperty("totalCities");
  318 |     expect(body).toHaveProperty("averageTemperatureCelsius");
  319 |   });
  320 | });
  321 | 
  322 | test.describe("GET /api/weather/city/:city", () => {
  323 |   test("returns 404 for an unknown city", async ({ request }) => {
  324 |     const res = await request.get(`${API}/api/weather/city/atlantis`);
  325 |     expect(res.status()).toBe(404);
  326 |   });
  327 | });
  328 | 
  329 | // ── Stories ───────────────────────────────────────────────────────────────────
  330 | 
  331 | test.describe("GET /api/stories", () => {
  332 |   test("returns an array", async ({ request }) => {
  333 |     const res = await request.get(`${API}/api/stories`);
  334 |     expect(res.status()).toBe(200);
  335 |     expect(Array.isArray(await res.json())).toBe(true);
  336 |   });
  337 | });
  338 | 
  339 | // ── Comics ────────────────────────────────────────────────────────────────────
  340 | 
  341 | test.describe("GET /api/comics", () => {
  342 |   test("returns an array", async ({ request }) => {
  343 |     const res = await request.get(`${API}/api/comics`);
  344 |     expect(res.status()).toBe(200);
  345 |     expect(Array.isArray(await res.json())).toBe(true);
  346 |   });
  347 | });
  348 | 
  349 | test.describe("GET /api/comics/user/:userId", () => {
  350 |   test("returns empty array for non-existent user", async ({ request }) => {
  351 |     const res = await request.get(`${API}/api/comics/user/999999999`);
> 352 |     expect(res.status()).toBe(200);
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  353 |     const body = await res.json();
  354 |     expect(Array.isArray(body)).toBe(true);
  355 |   });
  356 | });
  357 | 
  358 | // ── Quiz ──────────────────────────────────────────────────────────────────────
  359 | 
  360 | test.describe("GET /api/quiz/state", () => {
  361 |   test("returns quiz state with status", async ({ request }) => {
  362 |     const res = await request.get(`${API}/api/quiz/state`);
  363 |     expect(res.status()).toBe(200);
  364 |     const body = await res.json();
  365 |     expect(body).toHaveProperty("status");
  366 |     expect(body).toHaveProperty("totalQuestions");
  367 |   });
  368 | });
  369 | 
  370 | test.describe("GET /api/quiz/leaderboard", () => {
  371 |   test("returns an array", async ({ request }) => {
  372 |     const res = await request.get(`${API}/api/quiz/leaderboard`);
  373 |     expect(res.status()).toBe(200);
  374 |     expect(Array.isArray(await res.json())).toBe(true);
  375 |   });
  376 | });
  377 | 
  378 | test.describe("POST /api/quiz/admin/control", () => {
  379 |   test("returns 401 without admin password", async ({ request }) => {
  380 |     const res = await request.post(`${API}/api/quiz/admin/control`, {
  381 |       data: { action: "start" },
  382 |     });
  383 |     expect(res.status()).toBe(401);
  384 |   });
  385 | 
  386 |   test("returns 400 for unknown action with valid password", async ({ request }) => {
  387 |     const res = await request.post(`${API}/api/quiz/admin/control`, {
  388 |       headers: { "X-Admin-Password": "9999" },
  389 |       data: { action: "invalid-action" },
  390 |     });
  391 |     expect(res.status()).toBe(400);
  392 |   });
  393 | });
  394 | 
  395 | // ── Settings ──────────────────────────────────────────────────────────────────
  396 | 
  397 | test.describe("GET /api/settings/nav", () => {
  398 |   test("returns 200 or 404 depending on seed data", async ({ request }) => {
  399 |     const res = await request.get(`${API}/api/settings/nav`);
  400 |     expect([200, 404]).toContain(res.status());
  401 |   });
  402 | });
  403 | 
  404 | // ── User sub-resources ────────────────────────────────────────────────────────
  405 | 
  406 | test.describe("User comics and stories", () => {
  407 |   test("GET /api/users/:id/comics returns 404 for non-existent user", async ({ request }) => {
  408 |     const res = await request.get(`${API}/api/users/999999999/comics`);
  409 |     expect(res.status()).toBe(404);
  410 |   });
  411 | 
  412 |   test("GET /api/users/:id/stories returns 404 for non-existent user", async ({ request }) => {
  413 |     const res = await request.get(`${API}/api/users/999999999/stories`);
  414 |     expect(res.status()).toBe(404);
  415 |   });
  416 | 
  417 |   test("POST /api/users/:id/comics returns 404 for non-existent user", async ({ request }) => {
  418 |     const res = await request.post(`${API}/api/users/999999999/comics`, {
  419 |       data: { description: "test", imageUrl: "https://example.com/img.png" },
  420 |     });
  421 |     expect(res.status()).toBe(404);
  422 |   });
  423 | 
  424 |   test("POST /api/users/:id/stories returns 400 when fields missing", async ({ request }) => {
  425 |     // Create a real user first
  426 |     const createRes = await request.post(`${API}/api/users`, {
  427 |       data: { username: "pw-story-test" },
  428 |     });
  429 |     expect(createRes.status()).toBe(201);
  430 |     const { id } = await createRes.json();
  431 | 
  432 |     const res = await request.post(`${API}/api/users/${id}/stories`, {
  433 |       data: { title: "" },
  434 |     });
  435 |     expect(res.status()).toBe(400);
  436 |   });
  437 | });
  438 | 
```