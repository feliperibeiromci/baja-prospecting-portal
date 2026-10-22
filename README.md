# Baja Fulfillment — Prospecting Portal (custom v1)

A custom, responsive internal prospecting portal for Baja Fulfillment. This is a **starter implementation** with a production-style UI and a Cloudflare Pages server-side proxy. It does NOT change the existing n8n Form or sourcing workflows. **It is not connected to your n8n account yet.**

## Files

- `index.html`: English-facing portal UI for Susan
- `styles.css`: responsive layout, colors, typography and controls
- `app.js`: input validation, request submission, success/error messaging
- `functions/api/research.js`: server-side proxy to n8n (never exposes secrets)

## Recommended setup

1. Deploy the project as a Cloudflare Pages project (static assets + Pages Functions). Add authentication such as Cloudflare Access before sharing externally. Alternatively deploy with an equivalent serverless service, adapting the function.
2. Create a **separate n8n workflow** `Baja - Prospecting API` with a `Webhook` trigger: `POST`, a unique path, `Header Auth` using the header `X-Baja-Portal-Key` and a strong secret stored in n8n credentials. Choose `Respond: Immediately`, returning a response as soon as the request starts. Publish it and copy its Production URL.
3. In `Baja - Prospecting API`, normalize and validate `$json.body.company_count` (1–3), set `test_mode=true` for initial testing, then call your existing `Baja - Automated Company Sourcing` using the **Execute Sub-workflow** node with Wait for completion **OFF**. The sourcing workflow already supports `company_count`. Do not remove the existing Form or the existing triggers.
4. In Cloudflare Pages > Settings > Variables and Secrets, add: `N8N_RESEARCH_WEBHOOK_URL` (Production URL), `N8N_WEBHOOK_SECRET` (same strong secret, encrypted), `BAJA_TEST_MODE` = `true` (ordinary config). Redeploy if needed.
5. Test with one company, check the n8n Executions tab, and verify the current `test_mode` protections before any live CRM sync.

## Important safeguards

- The API response **only confirms acceptance**, not research completion. Do not claim that companies have been discovered or sent to Clay based solely on the success message.
- The website currently supports 1–3 companies (same as your validated research prompt). Raise this only after verifying timeouts, dedupe, credit use and API limits.
- Keep the site private using SSO / Cloudflare Access or comparable authentication, as each submission can incur n8n, web research, and Clay enrichment costs.
- Cloudflare Pages Functions secrets must **never** be embedded in `app.js` or `index.html`.
- If you open `index.html` locally, the UI can be previewed but the API call will fail: deploy with the server-side function to actually submit requests.
- If `BAJA_TEST_MODE` is absent or anything other than literal `false`, this proxy sends `test_mode: true`. Confirm all downstream workflows respect the flag before running live.
- No emails are sent by this starter project; actual enrollments remain governed by HubSpot configuration.
