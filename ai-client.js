(() => {
  const DEFAULT_PROXY =
    (typeof window !== "undefined" && window.JIAOTAI_AGNES_PROXY) ||
    "http://127.0.0.1:8787/generate";

  const POLLINATIONS =
    "https://image.pollinations.ai/prompt/";

  async function viaAgnes(prompt, { size = "1K", ratio = "1:1", proxyUrl = DEFAULT_PROXY } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 180000);
    try {
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Helps some free tunnels skip the browser interstitial page
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ prompt, size, ratio }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || `agnes_http_${res.status}`);
        err.code = data.error || "agnes_http";
        err.status = res.status;
        throw err;
      }
      if (!data.url) {
        const err = new Error("empty_image");
        err.code = "empty_image";
        throw err;
      }
      return { url: data.url, provider: "agnes", model: data.model || "agnes-image-2.5-flash" };
    } finally {
      clearTimeout(timer);
    }
  }

  function viaPollinations(prompt, seed) {
    const url =
      POLLINATIONS +
      encodeURIComponent(prompt) +
      `?width=768&height=768&seed=${seed}&nologo=true&enhance=true&referrer=jiaotai-pattern-generator`;
    return { url, provider: "pollinations", model: "pollinations" };
  }

  /**
   * Prefer Agnes via secure proxy; fall back to Pollinations if proxy is down.
   */
  async function generateJiaotaiImage(prompt, { seed = 1, prefer = "agnes" } = {}) {
    if (prefer === "pollinations") {
      return viaPollinations(prompt, seed);
    }
    try {
      return await viaAgnes(prompt);
    } catch (e) {
      const fallback = viaPollinations(prompt, seed);
      fallback.fallbackFrom = e.code || e.message || "agnes_error";
      return fallback;
    }
  }

  window.JiaotaiAI = {
    generateJiaotaiImage,
    viaAgnes,
    viaPollinations,
    DEFAULT_PROXY,
  };
})();
