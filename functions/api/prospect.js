function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestPost({ request, env }) {

  const body = await request.json().catch(() => null);
  const companyCount = Number(body?.company_count);

  if (
    !Number.isInteger(companyCount) ||
    companyCount < 1 ||
    companyCount > 5
  ) {
    return jsonResponse({
      status: "error",
      message: "Select between 1 and 5 companies."
    }, 400);
  }

  if (!env.N8N_WEBHOOK_URL || !env.N8N_PORTAL_KEY) {
    return jsonResponse({
      status: "error",
      message: "Portal integration is not configured."
    }, 503);
  }

  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Baja-Portal-Key": env.N8N_PORTAL_KEY
      },
      body: JSON.stringify({
        company_count: companyCount
      })
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
      if (typeof result === "string") {
        result = JSON.parse(result);
      }
    } catch {
      result = null;
    }

    if (!response.ok || result?.status !== "accepted") {
      console.error("n8n request failed:", response.status);

      return jsonResponse({
        status: "error",
        message: "Could not start the research request."
      }, 502);
    }

    return jsonResponse({
      status: "accepted",
      message: "Research request started successfully.",
      company_count: companyCount
    }, 202);

  } catch (error) {
    console.error("Prospecting API connection failed:", error);

    return jsonResponse({
      status: "error",
      message: "Unable to connect to the research service."
    }, 502);
  }
}