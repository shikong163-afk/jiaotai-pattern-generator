const AGNES_URL = "https://api.agnes-ai.cn/v1/images/generations";
const MODEL = "agnes-image-2.5-flash";
const MAX_PROMPT = 2000;

function originAllowed(origin) {
  if (!origin || origin === "null") return true;
  if (origin === "https://shikong163-afk.github.io") return true;
  if (origin.endsWith(".pages.dev") || origin.includes("jiaotai-pattern-generator.pages.dev")) return true;
  if (origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://localhost:")) return true;
  return false;
}

function corsHeaders(origin) {
  const value =
    originAllowed(origin) && origin && origin !== "null"
      ? origin
      : "https://shikong163-afk.github.io";
  return {
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function normalize(size, ratio) {
  if (!["1K", "2K", "3K", "4K", "1024x1024", "1024x768"].includes(size)) size = "1K";
  if (!["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"].includes(ratio)) ratio = "1:1";
  return { size, ratio };
}

async function generate(env, prompt, size, ratio, headers) {
  if (!env.AGNES_API_KEY) return json({ error: "server_misconfigured" }, 503, headers);
  prompt = String(prompt || "").trim();
  if (!prompt || prompt.length > MAX_PROMPT) return json({ error: "invalid_prompt" }, 400, headers);
  ({ size, ratio } = normalize(String(size || "1K"), String(ratio || "1:1")));

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
  if (!imageUrl) return json({ error: "empty_image" }, 502, headers);
  return json({ url: imageUrl, model: MODEL, provider: "agnes" }, 200, headers);
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const headers = corsHeaders(origin);
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method === "GET") {
    return generate(
      env,
      url.searchParams.get("prompt") || "",
      url.searchParams.get("size") || "1K",
      url.searchParams.get("ratio") || "1:1",
      headers
    );
  }

  if (request.method === "POST") {
    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400, headers);
    }
    return generate(env, data?.prompt, data?.size, data?.ratio, headers);
  }

  return json({ error: "method_not_allowed" }, 405, headers);
}
