// Public config only — NEVER put API keys here.
(() => {
  const host = typeof location !== "undefined" ? location.hostname : "";
  const port = typeof location !== "undefined" ? location.port : "";
  const isLocal = host === "127.0.0.1" || host === "localhost" || host === "";
  const onProxy = port === "8787";
  const onPages = host.endsWith("pages.dev");
  // Cloudflare Pages Function keeps the key server-side (no PC needed).
  const cloudProxy = "https://jiaotai-pattern-generator.pages.dev/generate";

  if (onProxy || onPages) {
    window.JIAOTAI_AGNES_PROXY = `${location.origin}/generate`;
    window.JIAOTAI_AI_PREFER = "agnes";
  } else if (isLocal) {
    window.JIAOTAI_AGNES_PROXY = "http://127.0.0.1:8787/generate";
    window.JIAOTAI_AI_PREFER = "agnes";
  } else {
    // GitHub Pages → call Cloudflare Function (secret stays in cloud)
    window.JIAOTAI_AGNES_PROXY = cloudProxy;
    window.JIAOTAI_AI_PREFER = "agnes";
  }
})();
