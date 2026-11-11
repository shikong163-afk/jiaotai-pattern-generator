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
  let twistProgress = 0;

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
    if (n === 1) startHistoryAnim();
    if (n === 2) resetTwistBoard(false);
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

  // ---- Level 1: ambient jiaotai history visual ----
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
    // soft vignette rim
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

  // ---- Level 2: interactive twist ----
  const twistCanvas = document.getElementById("twistCanvas");
  const tctx = twistCanvas.getContext("2d", { willReadFrequently: true });
  const twistBar = document.getElementById("twistBar");
  const twistPct = document.getElementById("twistPct");
  const twistHint = document.getElementById("twistHint");
  const toStage3 = document.getElementById("toStage3");
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let fieldSeed = 11;
  let strokes = [];

  function paintBase() {
    const w = twistCanvas.width;
    const h = twistCanvas.height;
    const img = tctx.createImageData(w, h);
    const data = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = hash2(x * 0.03, y * 0.03, fieldSeed);
        const band = Math.sin((x * 0.035 + y * 0.01) + n * 2);
        let r, g, b;
        if (band > 0.2) {
          r = 226; g = 214; b = 194;
        } else if (band > -0.25) {
          r = 108; g = 138; b = 112;
        } else {
          r = 42; g = 40; b = 38;
        }
        const i = (y * w + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }
    tctx.putImageData(img, 0, 0);
  }

  function applyStroke(x0, y0, x1, y1, force) {
    const w = twistCanvas.width;
    const h = twistCanvas.height;
    const steps = Math.max(4, Math.hypot(x1 - x0, y1 - y0) | 0);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      const radius = 18 + force * 22;
      const img = tctx.getImageData(
        Math.max(0, cx - radius - 2),
        Math.max(0, cy - radius - 2),
        Math.min(w, radius * 2 + 4),
        Math.min(h, radius * 2 + 4)
      );
      const data = img.data;
      const ow = img.width;
      const oh = img.height;
      const ox = Math.max(0, cx - radius - 2);
      const oy = Math.max(0, cy - radius - 2);
      const copy = new Uint8ClampedArray(data);
      for (let y = 0; y < oh; y++) {
        for (let x = 0; x < ow; x++) {
          const gx = ox + x;
          const gy = oy + y;
          const dx = gx - cx;
          const dy = gy - cy;
          const d = Math.hypot(dx, dy);
          if (d > radius) continue;
          const fall = 1 - d / radius;
          const ang = 0.55 * fall * fall * (0.7 + force);
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);
          const sx = Math.round(cx + dx * cos - dy * sin - ox);
          const sy = Math.round(cy + dx * sin + dy * cos - oy);
          if (sx < 0 || sy < 0 || sx >= ow || sy >= oh) continue;
          const i = (y * ow + x) * 4;
          const j = (sy * ow + sx) * 4;
          data[i] = copy[j];
          data[i + 1] = copy[j + 1];
          data[i + 2] = copy[j + 2];
        }
      }
      tctx.putImageData(img, ox, oy);
    }
  }

  function setProgress(v) {
    twistProgress = Math.max(0, Math.min(1, v));
    const pct = Math.round(twistProgress * 100);
    twistBar.style.width = `${pct}%`;
    twistPct.textContent = `${pct}%`;
    if (twistProgress >= 0.72) {
      toStage3.disabled = false;
      twistHint.textContent = "纹路已醒 · 可以进入本体";
      twistHint.classList.add("ready");
      unlocked.add(3);
    }
  }

  function resetTwistBoard(hard = true) {
    if (hard) {
      fieldSeed = 7 + Math.floor(Math.random() * 90);
      strokes = [];
      setProgress(0);
      toStage3.disabled = true;
      twistHint.textContent = "手指或鼠标在泥面上滑动";
      twistHint.classList.remove("ready");
    }
    paintBase();
    strokes.forEach((s) => applyStroke(s.x0, s.y0, s.x1, s.y1, s.force));
  }

  function pointerPos(e) {
    const rect = twistCanvas.getBoundingClientRect();
    const scaleX = twistCanvas.width / rect.width;
    const scaleY = twistCanvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  function onDown(e) {
    e.preventDefault();
    dragging = true;
    const p = pointerPos(e);
    lastX = p.x;
    lastY = p.y;
  }
  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const p = pointerPos(e);
    const dist = Math.hypot(p.x - lastX, p.y - lastY);
    if (dist < 2) return;
    const force = Math.min(1, dist / 28);
    applyStroke(lastX, lastY, p.x, p.y, force);
    strokes.push({ x0: lastX, y0: lastY, x1: p.x, y1: p.y, force });
    if (strokes.length > 120) strokes.shift();
    setProgress(twistProgress + dist * 0.00135);
    lastX = p.x;
    lastY = p.y;
  }
  function onUp() {
    dragging = false;
  }

  twistCanvas.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  twistCanvas.addEventListener("touchstart", onDown, { passive: false });
  twistCanvas.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);

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
