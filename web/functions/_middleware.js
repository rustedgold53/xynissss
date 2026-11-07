export async function onRequest(context) {
  const { request, env, next, waitUntil } = context;
  const url = new URL(request.url);

  const isPageView =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  if (isPageView) {
    const visitorIp = request.headers.get("CF-Connecting-IP") || "Unknown";
    const country =
      request.cf?.country || request.headers.get("CF-IPCountry") || "Unknown";

    waitUntil(
      fetch(`${env.SUPABASE_URL}/rest/v1/visitor_logs`, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          ip_address: visitorIp,
          country,
          page_path: url.pathname,
        }),
      })
        .then((r) => {
          if (!r.ok) console.error("log failed", r.status, r.statusText);
        })
        .catch((err) => console.error("log error", err))
    );
  }

  return next();
}