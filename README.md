# Baja Fulfillment — Prospecting Portal

Responsive prospecting portal deployed as a Cloudflare Worker with static assets.

## Project structure

- `public/index.html`: portal UI
- `public/styles.css`: responsive styles
- `public/app.js`: validation, submission and feedback
- `src/worker.js`: POST /api/prospect proxy to n8n
- `wrangler.jsonc`: Worker entry point and static asset configuration
- `functions/api/`: legacy Pages handlers, unused by this Worker deployment

## Setup

The configured Worker name is `baja-prospecting-portal`. It must match the target Worker in Cloudflare.

Set server-side secrets:

```sh
npx wrangler secret put N8N_WEBHOOK_URL
npx wrangler secret put N8N_PORTAL_KEY
```

Use the n8n production webhook URL and the key expected by its X-Baja-Portal-Key header authentication. Never put these values in public/.

The API accepts `icp1_count`, `icp2_count`, and `icp3_count` as JSON integers from 0 through 5. All three fields are required; at least one must be positive. Zero skips that profile. Maximum total: 15. It forwards the three fields to n8n. The previous `company_count` payload must be migrated before deployment. The webhook must return a successful HTTP status and a JSON object containing `"status": "accepted"`. HTTP 202 confirms acceptance, not completion of research.

For local development, configure the secrets in an untracked .dev.vars file and run `npx wrangler dev`. Opening the HTML directly only previews the UI.

Deploy with `npx wrangler deploy`. For Git-connected Cloudflare Worker builds, use this as the deploy command. The assets directory is public/; /api/* requests run the Worker first.

This Worker does not send a test_mode flag; configure any test-mode behavior in n8n.

Example request: `{"icp1_count":5,"icp2_count":5,"icp3_count":5}`.

Deploy only after the n8n Prospecting API and Find Companies accept these fields. Counts are discovery targets, not a guarantee of net-new or qualified companies.
