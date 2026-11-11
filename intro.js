(() => {
  const gate = document.getElementById("gate");
  const stages = {
    1: document.getElementById("stage1"),
    2: document.getElementById("stage2"),
    3: document.getElementById("stage3"),
  };
  const dots = [...document.querySelectorAll(".progress .dot")];
  const unlocked = new Set([1]);
  let stage = 1;
  let giftBusy = false;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(n, { force = false } = {}) {
    if (!force && !unlocked.has(n)) return;
    stage = n;
    gate.dataset.stage = String(n);
    Object.entries(stages).forEach(([k, el]) => {
      const on = Number(k) === n;
      el.hidden = !on;
      el.classList.toggle("is-active", on);
    });
    dots.forEach((dot) => {
      const id = Number(dot.dataset.go);
      dot.classList.toggle("active", id === n);
      dot.disabled = !unlocked.has(id);
    });
    document.body.classList.toggle("stage-history", n === 1);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    if (n === 1) startHistoryAnim();
    if (n === 2) resetGift();
    if (n === 3) sessionStorage.setItem("jiaotai_intro_done", "1");
  }

  document.getElementById("toStage2").addEventListener("click", () => {
    unlocked.add(2);
    go(2);
  });
  document.getElementById("back1").addEventListener("click", () => go(1, { force: true }));
  document.getElementById("back2").addEventListener("click", () => {
    unlocked.add(2);
    go(2, { force: true });
  });
  document.getElementById("skipIntro").addEventListener("click", () => {
    unlocked.add(2);
    unlocked.add(3);
    go(3, { force: true });
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => go(Number(dot.dataset.go)));
  });

  // Accordion: one open at a time
  const accordion = document.getElementById("historyAccordion");
  if (accordion) {
    accordion.querySelectorAll("details.acc-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        accordion.querySelectorAll("details.acc-item").forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  // ---- Level 1 visual ----
  const historyCanvas = document.getElementById("historyClay");
  const hctx = historyCanvas.getContext("2d", { willReadFrequently: true });
  let historyRaf = 0;
  let historyT = 0;

  function hash2(x, y, s) {
    const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function drawHistoryFrame(t) {
    const w = historyCanvas.width;
    const h = historyCanvas.height;
    const img = hctx.createImageData(w, h);
    const data = img.data;
    const twist = 1.35 + Math.sin(t * 0.00035) * 0.25;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = (x / w) * 2 - 1;
        const v = (y / h) * 2 - 1;
        const ang = Math.atan2(v, u);
        const rad = Math.hypot(u, v);
        const swirl = ang * twist + rad * 4.2 + t * 0.00045;
        const band = Math.sin(swirl * 3.2 + hash2(x * 0.02, y * 0.02, 3) * 1.4);
        const feather = Math.sin((v * 8 + Math.sin(u * 6 + t * 0.0005)) * 2.2);
        const mix = band * 0.65 + feather * 0.35;
        let r, g, b;
        if (mix > 0.25) {
          r = 232; g = 220; b = 200;
        } else if (mix > -0.15) {
          r = 90; g = 120; b = 95;
        } else {
          r = 36; g = 34; b = 32;
        }
        const shade = 0.72 + 0.28 * Math.exp(-rad * rad * 1.6);
        const i = (y * w + x) * 4;
        data[i] = r * shade;
        data[i + 1] = g * shade;
        data[i + 2] = b * shade;
        data[i + 3] = 255;
      }
    }
    hctx.putImageData(img, 0, 0);
    const grd = hctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.2, w * 0.5, h * 0.5, w * 0.72);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.28)");
    hctx.fillStyle = grd;
    hctx.fillRect(0, 0, w, h);
  }

  function startHistoryAnim() {
    cancelAnimationFrame(historyRaf);
    if (reduced) {
      drawHistoryFrame(0);
      return;
    }
    const tick = (now) => {
      if (stage !== 1) return;
      if (!historyT || now - historyT > 140) {
        historyT = now;
        drawHistoryFrame(now);
      }
      historyRaf = requestAnimationFrame(tick);
    };
    historyRaf = requestAnimationFrame(tick);
  }

  // ---- Level 2: large gift → Level 3 ----
  const giftBox = document.getElementById("giftBox");
  const giftLid = document.getElementById("giftLid");
  const giftHint = document.getElementById("giftHint");

  function resetGift() {
    giftBusy = false;
    giftBox.classList.remove("is-open", "is-opening");
    giftHint.textContent = "点按礼盒。盒盖翻开、四面外翻后，直接进入三级本体。";
    giftLid.querySelector("small").textContent = "点按开启";
  }

  function openGift() {
    if (giftBusy || giftBox.classList.contains("is-open")) return;
    giftBusy = true;
    giftBox.classList.add("is-opening", "is-open");
    giftHint.textContent = "礼盒铺展中…";
    giftLid.querySelector("small").textContent = "开启中";
    unlocked.add(3);
    const delay = reduced ? 0 : 1050;
    setTimeout(() => {
      go(3, { force: true });
      giftBusy = false;
    }, delay);
  }

  giftLid.addEventListener("click", openGift);
  giftBox.addEventListener("click", (e) => {
    if (e.target.closest(".gift-lid") || !giftBox.classList.contains("is-open")) {
      openGift();
    }
  });

  // boot
  const params = new URLSearchParams(location.search);
  if (params.get("skip") === "1" || params.get("enter") === "1") {
    unlocked.add(2);
    unlocked.add(3);
    go(3, { force: true });
  } else {
    go(1, { force: true });
  }
})();
