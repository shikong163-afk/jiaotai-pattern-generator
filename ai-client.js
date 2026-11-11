(() => {
  const POLLINATIONS = "https://image.pollinations.ai/prompt/";

  function proxyBase() {
    return (typeof window !== "undefined" && window.JIAOTAI_AGNES_PROXY) || "";
  }

  function prefer() {
    return (typeof window !== "undefined" && window.JIAOTAI_AI_PREFER) || "agnes";
  }

  async function viaAgnes(prompt, { size = "1K", ratio = "1:1", timeoutMs = 25000 } = {}) {
    const proxyUrl = proxyBase();
    if (!proxyUrl) {
      const err = new Error("no_proxy");
      err.code = "no_proxy";
      throw err;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const u = new URL(proxyUrl, typeof location !== "undefined" ? location.href : "http://127.0.0.1");
    u.searchParams.set("prompt", prompt);
    u.searchParams.set("size", size);
    u.searchParams.set("ratio", ratio);

    try {
      const res = await fetch(u.toString(), { method: "GET", signal: controller.signal });
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

  async function generateJiaotaiImage(prompt, { seed = 1, preferMode } = {}) {
    const mode = preferMode || prefer();
    if (mode === "pollinations") {
      return viaPollinations(prompt, seed);
    }
    try {
      return await viaAgnes(prompt);
    } catch (e) {
      const fallback = viaPollinations(prompt, seed);
      fallback.fallbackFrom = e.code || e.name || e.message || "agnes_error";
      return fallback;
    }
  }

  window.JiaotaiAI = {
    generateJiaotaiImage,
    viaAgnes,
    viaPollinations,
    get DEFAULT_PROXY() {
      return proxyBase();
    },
  };
})();
