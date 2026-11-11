// Public config only — NEVER put API keys here.
(() => {
  const host = typeof location !== "undefined" ? location.hostname : "";
  const port = typeof location !== "undefined" ? location.port : "";
  const isLocal = host === "127.0.0.1" || host === "localhost" || host === "";
  const onProxy = port === "8787";

  if (onProxy) {
    // Same-origin with python proxy — Agnes works without tunnels.
    window.JIAOTAI_AGNES_PROXY = `${location.origin}/generate`;
    window.JIAOTAI_AI_PREFER = "agnes";
  } else if (isLocal) {
    window.JIAOTAI_AGNES_PROXY = "http://127.0.0.1:8787/generate";
    window.JIAOTAI_AI_PREFER = "agnes";
  } else {
    // GitHub Pages has no secret-safe public proxy by default.
    // Skip hanging tunnel calls; use free Pollinations online.
    window.JIAOTAI_AGNES_PROXY = "";
    window.JIAOTAI_AI_PREFER = "pollinations";
  }
})();
