import { parseCounts } from './counts.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/prospect") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      const body = await request.json().catch(() => null);
      let counts;
      try { counts = parseCounts(body); }
      catch (error) { return json({ error: error.message }, 400); }

      if (!env.N8N_WEBHOOK_URL || !env.N8N_PORTAL_KEY) {
        return json({ error: "Research API is not configured." }, 503);
      }

      try {
        const response = await fetch(env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Baja-Portal-Key": env.N8N_PORTAL_KEY
          },
          body: JSON.stringify(counts)
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || data?.status !== "accepted") {
          return json({
            error: "The research workflow did not accept the request."
          }, 502);
        }

        return json({
          status: "accepted",
          message: "Research request started successfully.",
          ...counts
        }, 202);
      } catch (error) {
        console.error("n8n connection error", error);
        return json({
          error: "Unable to connect to the research workflow."
        }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
