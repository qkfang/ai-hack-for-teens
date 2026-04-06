# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Web Builder responsive >> How to Use modal fits viewport
- Location: responsive.spec.ts:99:7

# Error details

```
Error: Page should not have horizontal scroll overflow

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - button "Menu" [ref=e8]:
            - img [ref=e9]
          - heading "Web Builder" [level=1] [ref=e11]
          - generic [ref=e12]: idea-spark-app
          - generic [ref=e13]: v0
        - generic [ref=e14]:
          - button "⛶" [ref=e15]
          - button "Save" [ref=e17]:
            - img [ref=e18]
            - text: Save
          - button "Copilot" [ref=e20]:
            - img [ref=e21]
            - text: Copilot
          - button "G Guest" [ref=e26]:
            - generic [ref=e27]: G
            - generic [ref=e28]: Guest
            - img [ref=e29]
    - generic [ref=e32]:
      - generic [ref=e33]:
        - heading "How to Use" [level=2] [ref=e34]
        - button [ref=e35]:
          - img [ref=e36]
      - list [ref=e39]:
        - listitem [ref=e40]:
          - generic [ref=e41]: ●
          - text: Click
          - strong [ref=e42]: "\"Copilot\""
          - text: to open the chat panel
        - listitem [ref=e43]:
          - generic [ref=e44]: ●
          - text: Ask Copilot to build or modify your page (e.g., "Add a contact form")
        - listitem [ref=e45]:
          - generic [ref=e46]: ●
          - text: Copilot generates a complete HTML page and applies it instantly
        - listitem [ref=e47]:
          - generic [ref=e48]: ●
          - text: Use
          - strong [ref=e49]: "\"View Code\""
          - text: from the menu to see the source
        - listitem [ref=e50]:
          - generic [ref=e51]: ●
          - text: Use
          - strong [ref=e52]: "\"Reset\""
          - text: to go back to the default page
        - listitem [ref=e53]:
          - generic [ref=e54]: ●
          - text: You can paste images into the chat for Copilot to analyze
    - main [ref=e55]:
      - iframe [ref=e58]:
        - generic [active] [ref=f1e1]:
          - banner [ref=f1e2]:
            - generic [ref=f1e3]: 🚀 AI Hack
            - heading "My Million Dollar Idea" [level=1] [ref=f1e4]
            - paragraph [ref=f1e5]: An AI-powered learning coach that helps teenagers discover their talents, build real skills, and land their first opportunity.
          - generic [ref=f1e6]:
            - heading "🔍 The Problem" [level=2] [ref=f1e7]
            - paragraph [ref=f1e8]: Millions of teenagers have no idea what they are good at or where to start. School does not always show you the way.
            - list [ref=f1e9]:
              - listitem [ref=f1e10]: 75% of teens feel unprepared for the real world after school
              - listitem [ref=f1e11]: Most career guidance is generic, outdated, or just plain boring
              - listitem [ref=f1e12]: No personalised roadmap from "I don't know" to "I got this"
          - generic [ref=f1e13]:
            - heading "💡 Our Solution" [level=2] [ref=f1e14]
            - paragraph [ref=f1e15]: SkillSpark AI is a conversational AI coach that meets teens where they are and guides them step-by-step through skill discovery.
            - generic [ref=f1e16]: "\"Think Duolingo meets LinkedIn — but designed from day one for Gen Z.\""
          - generic [ref=f1e17]:
            - heading "👋 The Team" [level=2] [ref=f1e18]
            - paragraph [ref=f1e19]: We are a group of teenagers who love AI and believe that every young person deserves a personalised guide to their future.
          - contentinfo [ref=f1e20]:
            - paragraph [ref=f1e21]: Built at AI Hack 2026 · My Million Dollar Idea
    - generic [ref=e59]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - img [ref=e63]
          - heading "Copilot Chat" [level=2] [ref=e66]
        - button "New Session" [ref=e67]
      - generic [ref=e69]:
        - img [ref=e70]
        - paragraph [ref=e73]: Describe the HTML page you want to build
        - paragraph [ref=e74]: "Try: \"Add a contact form\" or \"Make the background dark blue\""
      - generic [ref=e76]:
        - textbox "Type a message or paste an image..." [ref=e77]
        - button "Send" [disabled] [ref=e78]
  - button "Open Next.js Dev Tools" [ref=e84] [cursor=pointer]:
    - img [ref=e85]
  - alert [ref=e88]
```

# Test source

```ts
  1   | /**
  2   |  * Responsive UI tests for both Web Builder (Next.js) and Hack Studio (Vite React).
  3   |  *
  4   |  * Verifies that key pages render without horizontal overflow or element cutoffs
  5   |  * across desktop, tablet, and mobile viewports. Viewport sizes are driven by the
  6   |  * projects defined in playwright.config.ts (Desktop Chrome, iPad, iPhone 14).
  7   |  *
  8   |  * Set BASE_URL / HACKSTUDIO_URL environment variables to point at running instances.
  9   |  */
  10  | 
  11  | import { test, expect, Page } from "@playwright/test";
  12  | 
  13  | const WB_BASE = process.env.BASE_URL || "http://localhost:3000";
  14  | const HS_BASE = process.env.HACKSTUDIO_URL || "http://localhost:5173";
  15  | 
  16  | // ── Helpers ─────────────────────────────────────────────────────────────────
  17  | 
  18  | async function noHorizontalOverflow(page: Page) {
  19  |   const overflow = await page.evaluate(() => {
  20  |     return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  21  |   });
> 22  |   expect(overflow, "Page should not have horizontal scroll overflow").toBe(false);
      |                                                                       ^ Error: Page should not have horizontal scroll overflow
  23  | }
  24  | 
  25  | async function elementFitsViewport(page: Page, selector: string) {
  26  |   const box = await page.locator(selector).first().boundingBox();
  27  |   if (!box) return; // element not rendered — skip
  28  |   const viewport = page.viewportSize()!;
  29  |   expect(box.x, `${selector} left edge should be >= 0`).toBeGreaterThanOrEqual(-1);
  30  |   expect(
  31  |     box.x + box.width,
  32  |     `${selector} right edge should fit in viewport`
  33  |   ).toBeLessThanOrEqual(viewport.width + 1);
  34  | }
  35  | 
  36  | async function waitForAppReady(page: Page) {
  37  |   await page.waitForSelector("header", { timeout: 15_000 });
  38  | }
  39  | 
  40  | // ── Web Builder ─────────────────────────────────────────────────────────────
  41  | 
  42  | test.describe("Web Builder responsive", () => {
  43  |   test("home page has no horizontal overflow", async ({ page }) => {
  44  |     await page.goto(WB_BASE);
  45  |     await waitForAppReady(page);
  46  |     await noHorizontalOverflow(page);
  47  |   });
  48  | 
  49  |   test("header fits within viewport", async ({ page }) => {
  50  |     await page.goto(WB_BASE);
  51  |     await waitForAppReady(page);
  52  |     await elementFitsViewport(page, "header");
  53  |   });
  54  | 
  55  |   test("header buttons are visible and not clipped", async ({ page }) => {
  56  |     await page.goto(WB_BASE);
  57  |     await waitForAppReady(page);
  58  |     await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  59  |     await expect(page.getByRole("heading", { name: "Web Builder" })).toBeVisible();
  60  |     // Save and Copilot buttons should be visible
  61  |     const saveBtn = page.getByRole("button", { name: /Save/i });
  62  |     await expect(saveBtn).toBeVisible();
  63  |     const copilotBtn = page.getByRole("button", { name: /Copilot/i });
  64  |     await expect(copilotBtn).toBeVisible();
  65  |   });
  66  | 
  67  |   test("main content area fits viewport without cutoff", async ({ page }) => {
  68  |     await page.goto(WB_BASE);
  69  |     await waitForAppReady(page);
  70  |     await elementFitsViewport(page, "main");
  71  |   });
  72  | 
  73  |   test("chat panel opens and fits viewport", async ({ page }) => {
  74  |     await page.goto(WB_BASE);
  75  |     await waitForAppReady(page);
  76  |     await page.getByRole("button", { name: /Copilot/i }).click();
  77  |     await expect(page.getByRole("button", { name: /Close Chat/i })).toBeVisible();
  78  |     // Chat panel should not extend beyond viewport
  79  |     const viewport = page.viewportSize()!;
  80  |     const panel = page.locator("div").filter({ hasText: "Copilot Chat" }).locator("..").first();
  81  |     const box = await panel.boundingBox();
  82  |     if (box) {
  83  |       expect(
  84  |         box.x + box.width,
  85  |         "Chat panel should not exceed viewport width"
  86  |       ).toBeLessThanOrEqual(viewport.width + 1);
  87  |     }
  88  |     await noHorizontalOverflow(page);
  89  |   });
  90  | 
  91  |   test("full-screen mode fills viewport", async ({ page }) => {
  92  |     await page.goto(WB_BASE);
  93  |     await waitForAppReady(page);
  94  |     await page.getByTitle("Full screen").click();
  95  |     await expect(page.getByText(/Exit Full Screen/i)).toBeVisible();
  96  |     await noHorizontalOverflow(page);
  97  |   });
  98  | 
  99  |   test("How to Use modal fits viewport", async ({ page }) => {
  100 |     await page.goto(WB_BASE);
  101 |     await waitForAppReady(page);
  102 |     await page.getByRole("button", { name: "Menu" }).click();
  103 |     await page.getByRole("button", { name: /How to Use/i }).click();
  104 |     await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
  105 |     await noHorizontalOverflow(page);
  106 |     // Modal should be within viewport
  107 |     const modal = page.locator("div.fixed").filter({
  108 |       has: page.getByRole("heading", { name: /How to Use/i }),
  109 |     });
  110 |     const box = await modal.boundingBox();
  111 |     if (box) {
  112 |       const viewport = page.viewportSize()!;
  113 |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  114 |     }
  115 |   });
  116 | 
  117 |   test("gallery page has no horizontal overflow", async ({ page }) => {
  118 |     await page.goto(`${WB_BASE}/gallery`);
  119 |     await page.waitForLoadState("networkidle");
  120 |     await expect(
  121 |       page.getByRole("heading", { name: /Gallery|Design/i }).first()
  122 |     ).toBeVisible({ timeout: 10_000 });
```