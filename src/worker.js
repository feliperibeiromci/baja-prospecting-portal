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
      const count = Number(body?.company_count);

      if (!Number.isInteger(count) || count < 1 || count > 8) {
        return json({ error: "Choose between 1 and 8 companies." }, 400);
      }

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
          body: JSON.stringify({ company_count: count })
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
          company_count: count
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
