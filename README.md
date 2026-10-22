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

The API accepts company_count from 1 through 5 and forwards only that field. The webhook must return a successful HTTP status and a JSON object containing `"status": "accepted"`. HTTP 202 confirms acceptance, not completion of research.

For local development, configure the secrets in an untracked .dev.vars file and run `npx wrangler dev`. Opening the HTML directly only previews the UI.

Deploy with `npx wrangler deploy`. For Git-connected Cloudflare Worker builds, use this as the deploy command. The assets directory is public/; /api/* requests run the Worker first.

This Worker does not send a test_mode flag; configure any test-mode behavior in n8n.
