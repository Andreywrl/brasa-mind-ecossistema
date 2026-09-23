#!/usr/bin/env node
/**
 * HTTP smoke: espera o app em BASE_URL (default http://localhost:3000).
 * Classifica 2xx/3xx/401/403/400 como OK; 404/5xx como falha.
 */
const base = process.env.BASE_URL ?? "http://localhost:3000";

const checks = [
  { method: "GET", path: "/api/faq", expectAuth: false },
  { method: "GET", path: "/api/legal", expectAuth: false },
  { method: "GET", path: "/api/admin/eventos", expectAuth: true },
  { method: "GET", path: "/api/admin/checkin", expectAuth: true },
  {
    method: "PATCH",
    path: "/api/admin/eventos/seed-past/review",
    body: { stars: 5, comment: "smoke" },
    expectAuth: true,
  },
  {
    method: "POST",
    path: "/api/auth/forgot-password",
    body: { email: "not-an-email" },
    expectClientError: true,
  },
  {
    method: "POST",
    path: "/api/guest/seed-guest-invite",
    body: {},
    expectClientError: true,
  },
];

async function hit(c) {
  const res = await fetch(`${base}${c.path}`, {
    method: c.method,
    headers: { "Content-Type": "application/json" },
    body: c.body ? JSON.stringify(c.body) : undefined,
  });
  const status = res.status;
  const okAuth = c.expectAuth && (status === 401 || status === 403);
  const okClient = c.expectClientError && status >= 400 && status < 500;
  const okHttp = status >= 200 && status < 400;
  const pass = okAuth || okClient || okHttp;
  return { ...c, status, pass };
}

async function main() {
  const results = [];
  for (const c of checks) {
    try {
      results.push(await hit(c));
    } catch (e) {
      results.push({ ...c, status: 0, pass: false, error: String(e) });
    }
  }
  const failed = results.filter((r) => !r.pass);
  console.log("API Smoke Test Results:");
  console.log(`  Tested: ${results.length}`);
  console.log(`  Passed: ${results.filter((r) => r.pass).length}`);
  for (const r of results) {
    console.log(
      `  ${r.pass ? "OK" : "FAIL"} ${r.method} ${r.path} → ${r.status}${r.error ? ` (${r.error})` : ""}`,
    );
  }
  if (failed.length) process.exit(1);
}

main();
