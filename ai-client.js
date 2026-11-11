(() => {
  const POLLINATIONS = "https://image.pollinations.ai/prompt/";

  function proxyBase() {
    return (typeof window !== "undefined" && window.JIAOTAI_AGNES_PROXY) || "";
  }

  function prefer() {
    return (typeof window !== "undefined" && window.JIAOTAI_AI_PREFER) || "agnes";
  }

  function withCacheBust(url) {
    if (!url) return url;
    // Fragment does not change the network resource, but forces <img> to treat it as new.
    const base = String(url).split("#")[0];
    return `${base}#jiaotai=${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function pollinationsUrl(prompt, seed) {
    const s = Math.abs(Number(seed) || 1) % 1000000;
    return (
      POLLINATIONS +
      encodeURIComponent(prompt) +
      `?width=768&height=768&seed=${s}&nologo=true&enhance=true&referrer=jiaotai-pattern-generator&_=${Date.now()}`
    );
  }

  async function viaAgnes(prompt, { size = "1K", ratio = "1:1", timeoutMs = 45000, seed = 1, nonce = "" } = {}) {
    const proxyUrl = proxyBase();
    if (!proxyUrl) {
      const err = new Error("no_proxy");
      err.code = "no_proxy";
      throw err;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const endpoint = new URL(proxyUrl, typeof location !== "undefined" ? location.href : "http://127.0.0.1");

    // Include seed/nonce so identical visual params still request a fresh sample.
    const fullPrompt = `${String(prompt).trim()} [seed ${seed}${nonce ? ` · ${nonce}` : ""}]`;

    try {
      const res = await fetch(endpoint.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          prompt: fullPrompt,
          size,
          ratio,
          seed: Number(seed) || 1,
          nonce: nonce || String(Date.now()),
        }),
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
      return {
        url: data.url,
        displayUrl: withCacheBust(data.url),
        provider: "agnes",
        model: data.model || "agnes-image-2.5-flash",
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function viaPollinations(prompt, seed, nonce = "") {
    const full = nonce ? `${prompt} · var ${nonce}` : prompt;
    const url = pollinationsUrl(full, seed);
    return {
      url,
      displayUrl: withCacheBust(url),
      provider: "pollinations",
      model: "pollinations",
    };
  }

  /** Load remote image into an <img>, always resolving even when URL repeats / is cached. */
  function applyImage(img, result) {
    return new Promise((resolve, reject) => {
      if (!img || !result?.url) {
        reject(new Error("no_image"));
        return;
      }
      const token = String(Date.now()) + Math.random();
      img.dataset.loadToken = token;
      let settled = false;
      const finish = (ok, err) => {
        if (settled || img.dataset.loadToken !== token) return;
        settled = true;
        img.onload = null;
        img.onerror = null;
        if (ok) resolve(result);
        else reject(err || new Error("image_load_failed"));
      };

      // Probe with a detached Image so cached repeats still fire onload.
      const probe = new Image();
      const display = result.displayUrl || withCacheBust(result.url);
      const watchdog = setTimeout(() => finish(false, new Error("image_timeout")), 30000);

      probe.onload = () => {
        clearTimeout(watchdog);
        img.onload = () => finish(true);
        img.onerror = () => finish(true); // probe ok; visible tag glitch shouldn't block UI
        // Reset first so identical URLs still refresh the visible element.
        img.removeAttribute("src");
        img.src = display;
        if (img.complete) finish(true);
      };
      probe.onerror = () => {
        clearTimeout(watchdog);
        finish(false, new Error("image_load_failed"));
      };
      probe.src = result.url;
    });
  }

  async function generateJiaotaiImage(prompt, { seed = 1, preferMode, nonce } = {}) {
    const mode = preferMode || prefer();
    const n = nonce || `g${Date.now().toString(36)}`;
    if (mode === "pollinations") {
      return viaPollinations(prompt, seed, n);
    }
    try {
      return await viaAgnes(prompt, { seed, nonce: n });
    } catch (e) {
      const fallback = viaPollinations(prompt, seed, n);
      fallback.fallbackFrom = e.code || e.name || e.message || "agnes_error";
      return fallback;
    }
  }

  window.JiaotaiAI = {
    generateJiaotaiImage,
    viaAgnes,
    viaPollinations,
    applyImage,
    withCacheBust,
    get DEFAULT_PROXY() {
      return proxyBase();
    },
  };
})();
