/**
 * End-to-end tests for the .NET backend REST API (src/api).
 *
 * Set API_BASE_URL to point at a running instance, e.g.:
 *   API_BASE_URL=http://localhost:5163 npx playwright test tests/api.spec.ts
 */

import { test, expect } from "@playwright/test";

const API = process.env.API_BASE_URL || "http://localhost:5163";

// ── Users ─────────────────────────────────────────────────────────────────────

test.describe("GET /api/users", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/users`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe("POST /api/users", () => {
  test("creates a user and returns id + username", async ({ request }) => {
    const res = await request.post(`${API}/api/users`, {
      data: { username: "playwright-api-test" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body.username).toBe("playwright-api-test");
  });

  test("returns 400 when username is missing", async ({ request }) => {
    const res = await request.post(`${API}/api/users`, { data: {} });
    expect(res.status()).toBe(400);
  });
});

test.describe("GET /api/users/:id", () => {
  test("returns 404 for a non-existent user", async ({ request }) => {
    const res = await request.get(`${API}/api/users/999999999`);
    expect(res.status()).toBe(404);
  });

  test("returns user for a valid id", async ({ request }) => {
    // Create first so we have a known id
    const createRes = await request.post(`${API}/api/users`, {
      data: { username: "pw-get-user" },
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    const getRes = await request.get(`${API}/api/users/${id}`);
    expect(getRes.status()).toBe(200);
    const body = await getRes.json();
    expect(body.id).toBe(id);
    expect(body.username).toBe("pw-get-user");
  });
});

test.describe("DELETE /api/users/:id", () => {
  test("deletes a user and returns 204", async ({ request }) => {
    const createRes = await request.post(`${API}/api/users`, {
      data: { username: "pw-delete-user" },
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    const delRes = await request.delete(`${API}/api/users/${id}`);
    expect(delRes.status()).toBe(204);

    const getRes = await request.get(`${API}/api/users/${id}`);
    expect(getRes.status()).toBe(404);
  });

  test("returns 404 when deleting non-existent user", async ({ request }) => {
    const res = await request.delete(`${API}/api/users/999999999`);
    expect(res.status()).toBe(404);
  });
});

// ── Ideas ─────────────────────────────────────────────────────────────────────

test.describe("GET /api/ideas", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/ideas`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

test.describe("GET /api/ideas/:id", () => {
  test("returns 404 for a non-existent idea", async ({ request }) => {
    const res = await request.get(`${API}/api/ideas/999999999`);
    expect(res.status()).toBe(404);
  });
});

test.describe("POST /api/ideas", () => {
  test("returns 400 when title is missing", async ({ request }) => {
    // Create a real user first to isolate the title-validation path
    const userRes = await request.post(`${API}/api/users`, {
      data: { username: "pw-ideas-no-title" },
    });
    expect(userRes.status()).toBe(201);
    const { id: userId } = await userRes.json();

    const res = await request.post(`${API}/api/ideas`, {
      data: { userId },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});

// ── Weather ───────────────────────────────────────────────────────────────────

test.describe("GET /api/weather", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/weather`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

test.describe("GET /api/weather/summary", () => {
  test("returns summary with TotalCities", async ({ request }) => {
    const res = await request.get(`${API}/api/weather/summary`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("TotalCities");
    expect(body).toHaveProperty("AverageTemperatureCelsius");
  });
});

test.describe("GET /api/weather/city/:city", () => {
  test("returns 404 for an unknown city", async ({ request }) => {
    const res = await request.get(`${API}/api/weather/city/atlantis`);
    expect(res.status()).toBe(404);
  });
});

// ── Stories ───────────────────────────────────────────────────────────────────

test.describe("GET /api/stories", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/stories`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

// ── Comics ────────────────────────────────────────────────────────────────────

test.describe("GET /api/comics", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/comics`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

test.describe("GET /api/comics/user/:userId", () => {
  test("returns empty array for non-existent user", async ({ request }) => {
    const res = await request.get(`${API}/api/comics/user/999999999`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── Quiz ──────────────────────────────────────────────────────────────────────

test.describe("GET /api/quiz/state", () => {
  test("returns quiz state with status", async ({ request }) => {
    const res = await request.get(`${API}/api/quiz/state`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("totalQuestions");
  });
});

test.describe("GET /api/quiz/leaderboard", () => {
  test("returns an array", async ({ request }) => {
    const res = await request.get(`${API}/api/quiz/leaderboard`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

test.describe("POST /api/quiz/admin/control", () => {
  test("returns 401 without admin password", async ({ request }) => {
    const res = await request.post(`${API}/api/quiz/admin/control`, {
      data: { action: "start" },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 400 for unknown action with valid password", async ({ request }) => {
    const res = await request.post(`${API}/api/quiz/admin/control`, {
      headers: { "X-Admin-Password": "9999" },
      data: { action: "invalid-action" },
    });
    expect(res.status()).toBe(400);
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────

test.describe("GET /api/settings/nav", () => {
  test("returns 200 or 404 depending on seed data", async ({ request }) => {
    const res = await request.get(`${API}/api/settings/nav`);
    expect([200, 404]).toContain(res.status());
  });
});

// ── User sub-resources ────────────────────────────────────────────────────────

test.describe("User comics and stories", () => {
  test("GET /api/users/:id/comics returns 404 for non-existent user", async ({ request }) => {
    const res = await request.get(`${API}/api/users/999999999/comics`);
    expect(res.status()).toBe(404);
  });

  test("GET /api/users/:id/stories returns 404 for non-existent user", async ({ request }) => {
    const res = await request.get(`${API}/api/users/999999999/stories`);
    expect(res.status()).toBe(404);
  });

  test("POST /api/users/:id/comics returns 404 for non-existent user", async ({ request }) => {
    const res = await request.post(`${API}/api/users/999999999/comics`, {
      data: { description: "test", imageUrl: "https://example.com/img.png" },
    });
    expect(res.status()).toBe(404);
  });

  test("POST /api/users/:id/stories returns 400 when fields missing", async ({ request }) => {
    // Create a real user first
    const createRes = await request.post(`${API}/api/users`, {
      data: { username: "pw-story-test" },
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    const res = await request.post(`${API}/api/users/${id}/stories`, {
      data: { title: "" },
    });
    expect(res.status()).toBe(400);
  });
});
