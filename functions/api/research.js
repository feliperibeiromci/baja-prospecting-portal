// Cloudflare Pages Function. Secrets stay on the server, never in the browser.
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export async function onRequestPost({ request, env }) {
  // Production: protect the entire portal with Cloudflare Access or equivalent SSO.
  if (!env.N8N_RESEARCH_WEBHOOK_URL || !env.N8N_WEBHOOK_SECRET) {
    return json({ ok: false, error: 'The portal is in preview mode. Connect the n8n webhook in deployment settings before launching research.' }, 503);
  }

  let payload;
  try { payload = await request.json(); }
  catch { return json({ ok: false, error: 'Please send valid JSON.' }, 400); }

  const count = Number(payload?.company_count);
  if (!Number.isInteger(count) || count < 1 || count > 3) {
    return json({ ok: false, error: 'Company count must be a whole number between 1 and 3.' }, 400);
  }

  // Test mode is controlled here, not by the browser/client.
  const testMode = env.BAJA_TEST_MODE !== 'false';
  let upstream;
  try {
    upstream = await fetch(env.N8N_RESEARCH_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Baja-Portal-Key': env.N8N_WEBHOOK_SECRET
      },
      body: JSON.stringify({ company_count: count, test_mode: testMode, source: 'baja_portal' }),
      signal: AbortSignal.timeout(12000)
    });
  } catch {
    return json({ ok: false, error: 'Could not reach n8n. Please try again or check the webhook configuration.' }, 502);
  }

  if (!upstream.ok) {
    return json({ ok: false, error: 'n8n did not accept the request. Check its workflow execution and authentication.' }, 502);
  }

  return json({
    ok: true,
    message: testMode
      ? 'Test-mode research request accepted. Track the run in n8n; HubSpot sync should remain blocked.'
      : 'Research request accepted. Track the run in n8n.'
  }, 202);
}

export function onRequestGet() {
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}
