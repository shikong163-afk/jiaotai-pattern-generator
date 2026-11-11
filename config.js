// Public proxy endpoint only — NEVER put API keys here.
// Local: python proxy/agnes_proxy.py
// Online: temporary tunnel / Cloudflare Worker /generate (no key in this file)
(() => {
  const local = "http://127.0.0.1:8787/generate";
  const online = "https://every-mice-cut.loca.lt/generate";
  const host = typeof location !== "undefined" ? location.hostname : "";
  window.JIAOTAI_AGNES_PROXY =
    host === "127.0.0.1" || host === "localhost" || host === "" ? local : online;
})();
