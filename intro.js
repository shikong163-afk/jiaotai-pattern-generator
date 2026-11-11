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
  let giftOpened = false;

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
    if (n === 2) prepareGift(false);
    if (n === 3) sessionStorage.setItem("jiaotai_intro_done", "1");
  }

  document.getElementById("toStage2").addEventListener("click", () => {
    unlocked.add(2);
    go(2);
  });
  document.getElementById("toStage3").addEventListener("click", () => {
    unlocked.add(3);
    go(3);
  });
  document.getElementById("back1").addEventListener("click", () => go(1, { force: true }));
  document.getElementById("back2").addEventListener("click", () => go(2, { force: true }));
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

  // ---- Level 2: gift box unfold ----
  const giftBox = document.getElementById("giftBox");
  const giftLid = document.getElementById("giftLid");
  const giftHint = document.getElementById("giftHint");
  const toStage3 = document.getElementById("toStage3");
  const reopenGift = document.getElementById("reopenGift");
  const vesselCanvas = document.getElementById("vesselClay");
  const vctx = vesselCanvas.getContext("2d");

  function drawVessel() {
    const w = vesselCanvas.width;
    const h = vesselCanvas.height;
    vctx.clearRect(0, 0, w, h);
    const img = vctx.createImageData(w, h);
    const data = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const xn = (x / w) * 2 - 1;
        const yn = y / h;
        // meiping-like silhouette
        let rx;
        if (yn < 0.12) rx = 0.18 + yn * 0.6;
        else if (yn < 0.38) rx = 0.28 + Math.sin(((yn - 0.12) / 0.26) * Math.PI) * 0.42;
        else if (yn < 0.82) rx = 0.55 - (yn - 0.38) * 0.55;
        else rx = 0.22 - (yn - 0.82) * 0.2;
        rx = Math.max(0.08, rx);
        const inside = Math.abs(xn) <= rx;
        const i = (y * w + x) * 4;
        if (!inside) {
          data[i + 3] = 0;
          continue;
        }
        const u = xn / rx;
        const swirl = Math.sin(u * 4.2 + yn * 14 + Math.sin(yn * 9) * 1.4);
        let r, g, b;
        if (swirl > 0.25) {
          r = 230; g = 218; b = 198;
        } else if (swirl > -0.2) {
          r = 95; g = 125; b = 100;
        } else {
          r = 40; g = 38; b = 36;
        }
        const shade = 0.62 + 0.38 * Math.sqrt(Math.max(0, 1 - u * u));
        data[i] = r * shade;
        data[i + 1] = g * shade;
        data[i + 2] = b * shade;
        data[i + 3] = 255;
      }
    }
    vctx.putImageData(img, 0, 0);
  }

  function setGiftOpened(open) {
    giftOpened = open;
    giftBox.classList.toggle("is-open", open);
    toStage3.disabled = !open;
    reopenGift.hidden = !open;
    if (open) {
      unlocked.add(3);
      giftHint.textContent = "礼成。四面铺展，绞胎器已迎出。";
      giftLid.querySelector("small").textContent = "已开启";
    } else {
      giftHint.textContent = "点按礼盒，盒盖翻开，四面铺展，迎出绞胎器。";
      giftLid.querySelector("small").textContent = "点按开启";
    }
  }

  function prepareGift(hardReset) {
    drawVessel();
    if (hardReset || !giftOpened) setGiftOpened(false);
    else setGiftOpened(true);
  }

  function openGift() {
    if (giftOpened) return;
    setGiftOpened(true);
  }

  giftLid.addEventListener("click", openGift);
  giftBox.addEventListener("click", (e) => {
    if (!giftOpened && e.target !== giftLid) openGift();
  });
  reopenGift.addEventListener("click", () => {
    setGiftOpened(false);
    // replay after a beat
    setTimeout(() => setGiftOpened(true), reduced ? 0 : 280);
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
