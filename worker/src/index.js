const AGNES_URL = "https://api.agnes-ai.cn/v1/images/generations";
const MODEL = "agnes-image-2.5-flash";
const MAX_PROMPT = 2000;
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60_000;

const hits = new Map();

function parseOrigins(env) {
  return new Set(
    String(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function corsHeaders(origin, allowed) {
  const value = allowed.has(origin) ? origin : "https://shikong163-afk.github.io";
  return {
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateOk(ip) {
  const now = Date.now();
  const q = hits.get(ip) || [];
  const next = q.filter((t) => now - t < RATE_WINDOW_MS);
  if (next.length >= RATE_LIMIT) {
    hits.set(ip, next);
    return false;
  }
  next.push(now);
  hits.set(ip, next);
  return true;
}

export default {
  async fetch(request, env) {
    const allowed = parseOrigins(env);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, allowed);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json(
        {
          ok: true,
          service: "jiaotai-agnes-proxy",
          model: MODEL,
          key_configured: Boolean(env.AGNES_API_KEY),
        },
        200,
        headers
      );
    }

    if (
      request.method !== "POST" ||
      (url.pathname !== "/generate" && url.pathname !== "/v1/images/generations")
    ) {
      return json({ error: "not_found" }, 404, headers);
    }

    if (!env.AGNES_API_KEY) {
      return json({ error: "server_misconfigured" }, 503, headers);
    }

    const ip = clientIp(request);
    if (!rateOk(ip)) {
      return json({ error: "rate_limited", retry_after: 60 }, 429, headers);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400, headers);
    }

    const prompt = String(data?.prompt || "").trim();
    if (!prompt || prompt.length > MAX_PROMPT) {
      return json({ error: "invalid_prompt" }, 400, headers);
    }

    let size = String(data?.size || "1K");
    if (!["1K", "2K", "3K", "4K", "1024x1024", "1024x768"].includes(size)) size = "1K";
    let ratio = String(data?.ratio || "1:1");
    if (!["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"].includes(ratio)) {
      ratio = "1:1";
    }

    const upstream = await fetch(AGNES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AGNES_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size,
        ratio,
        extra_body: { response_format: "url" },
      }),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return json(
        { error: "upstream_error", status: upstream.status, detail: text.slice(0, 300) },
        502,
        headers
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ error: "bad_upstream_json" }, 502, headers);
    }

    const imageUrl = parsed?.data?.[0]?.url;
    if (!imageUrl) {
      return json({ error: "empty_image" }, 502, headers);
    }

    return json({ url: imageUrl, model: MODEL, provider: "agnes" }, 200, headers);
  },
};
