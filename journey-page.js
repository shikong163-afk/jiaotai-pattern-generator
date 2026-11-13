(() => {
  const J = window.JiaotaiJourney;
  if (!J) return;

  const stepId = document.body.dataset.step;
  const meta = J.STEPS.find((s) => s.id === stepId);
  if (!meta) return;

  const state = J.loadState();
  if (!state.cleared) state.cleared = {};
  const $ = (id) => document.getElementById(id);
  let drawTimer = 0;
  let advancing = false;
  let advanceTimer = 0;
  let fireRaf = 0;
  let fireSpeed = 1;
  let fireRunning = false;
  let dryRaf = 0;
  let dryRunning = false;
  const DRY_MS = { slow: 12000, standard: 8000, controlled: 10000 };
  const FIRE_MS = 10000;
  const REDUCED_MS = 400;

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function barBusy() {
    return dryRunning || fireRunning || advancing;
  }

  function toast(msg) {
    const el = $("jToast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 1600);
  }

  function persist() {
    J.saveState(state);
  }

  function scheduleDraw(opts) {
    clearTimeout(drawTimer);
    drawTimer = setTimeout(() => {
      J.drawPreview($("jPreview"), state, opts || {});
      const cap = $("jVizCap");
      if (cap) cap.textContent = `${J.vesselName(state)} · ${J.labelOf(J.TWISTS, state.twist)}`;
    }, 40);
  }

  function buildRail() {
    const rail = $("jRail");
    if (!rail) return;
    const idx = J.stepIndex(stepId);
    const busy = barBusy();
    rail.classList.toggle("is-locked", busy);
    rail.innerHTML = J.STEPS.map((s, i) => {
      const now = i === idx;
      const done = !now && !!state.cleared[s.id];
      const open = now || done || i === idx - 1;
      const interactive = open && !busy;
      const cls = [now ? "now" : "", done ? "done" : "", open ? "" : "is-locked"].filter(Boolean).join(" ");
      if (!interactive) {
        return `<a class="${cls}" aria-disabled="true" tabindex="-1" title="${s.title}">${s.no}</a>`;
      }
      return `<a class="${cls}" href="./${s.file}" title="${s.title}">${s.no}</a>`;
    }).join("");
  }

  function setMark(name) {
    J.addMark(state, name);
    persist();
    const mark = $("jMark");
    if (mark) mark.textContent = `印记 ${state.marks.length}/9`;
  }

  function goNextSoon(label) {
    if (advancing || stepId === "finish") return;
    const next = J.nextFile(stepId);
    if (!next) return;
    advancing = true;
    state.cleared[stepId] = true;
    setMark(stepId);
    persist();
    showCraftNote(label);
    lockRunningUi();
    advanceTimer = setTimeout(() => {
      location.href = `./${next}`;
    }, 1100);
  }

  function showCraftNote() {
    const host = $("jCraft");
    if (!host || !meta.voice) return;
    const voice = host.querySelector(".j-voice");
    const fact = host.querySelector(".j-fact");
    if (voice) voice.textContent = meta.voice;
    if (fact) fact.textContent = "";
    host.hidden = false;
    host.classList.add("show");
    host.classList.remove("has-fact");
    window.setTimeout(() => {
      if (!advancing || !fact) return;
      fact.textContent = meta.fact || "";
      host.classList.add("has-fact");
    }, 280);
  }

  function settleTimedStage() {
    let changed = false;
    if (stepId === "dry") {
      const p = Number(state.dryProgress) || 0;
      if (p >= 100) {
        if (state.dryProgress !== 100) {
          state.dryProgress = 100;
          changed = true;
        }
        if (!state.cleared.dry) {
          state.cleared.dry = true;
          changed = true;
        }
      } else {
        if (p !== 0) {
          state.dryProgress = 0;
          changed = true;
        }
        if (state.cleared.dry) {
          delete state.cleared.dry;
          changed = true;
        }
      }
    }
    if (stepId === "fire") {
      const p = Number(state.fireProgress) || 0;
      if (state.fireDone || p >= 100) {
        if (!state.fireDone || state.fireProgress !== 100 || state.fireTemp !== 100) {
          state.fireDone = true;
          state.fireProgress = 100;
          state.fireTemp = 100;
          changed = true;
        }
        if (!state.cleared.fire) {
          state.cleared.fire = true;
          changed = true;
        }
      } else {
        if (p !== 0 || state.fireDone || state.fireTemp !== 60) {
          state.fireProgress = 0;
          state.fireDone = false;
          state.fireTemp = 60;
          changed = true;
        }
        if (state.cleared.fire) {
          delete state.cleared.fire;
          changed = true;
        }
      }
    }
    if (changed) persist();
  }

  function stageComplete() {
    if (stepId === "dry") return (Number(state.dryProgress) || 0) >= 100;
    if (stepId === "fire") return !!state.fireDone && (Number(state.fireProgress) || 0) >= 100;
    return !!state.cleared[stepId];
  }

  function hasLegalChoice() {
    const inList = (list, id) => list.some((item) => item.id === id);
    if (stepId === "soil") return inList(J.SOILS, state.soil);
    if (stepId === "refine") {
      const n = Number(state.colorCount);
      const hex = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));
      return n >= 2 && n <= 3 && hex(state.c1) && hex(state.c2) && (n === 2 || hex(state.c3));
    }
    if (stepId === "twist") return inList(J.TWISTS, state.twist);
    if (stepId === "vessel") return (window.JIAOTAI_VESSELS || []).some((v) => v.id === state.vessel);
    if (stepId === "form") return inList(J.FORMS, state.form);
    if (stepId === "dry") return inList(J.DRYS, state.dry);
    if (stepId === "glaze") return inList(J.GLAZES, state.glaze);
    if (stepId === "fire") return inList(J.FIRES, state.fire);
    return false;
  }

  function confirmControls(tip, extra) {
    const ready = hasLegalChoice();
    return `
      <div class="j-craft" id="jCraft" hidden>
        <p class="j-voice"></p>
        <p class="j-fact"></p>
      </div>
      <div class="j-play">
        <button type="button" class="j-play-btn" id="actConfirm"${ready ? "" : " disabled"}>确定</button>
        ${extra || ""}
      </div>
      <p class="j-tip">${tip}</p>`;
  }

  function syncNav() {
    const btnPrev = $("jPrev");
    const btnNext = $("jNext");
    const locked = barBusy();
    if (btnPrev) btnPrev.disabled = locked;
    if (!btnNext) return;
    if (stepId === "finish") {
      btnNext.disabled = false;
      btnNext.textContent = "重新开始";
      return;
    }
    btnNext.textContent = "下一关";
    btnNext.disabled = locked || !stageComplete();
  }

  function lockRunningUi() {
    document.querySelectorAll("#jPanel .j-choice, #jPanel input, #jPanel textarea").forEach((el) => {
      el.disabled = true;
    });
    document.querySelectorAll("#jPanel button").forEach((btn) => {
      if (btn.id === "actBoost" && fireRunning && !state.fireDone) {
        btn.disabled = false;
        return;
      }
      btn.disabled = true;
    });
    const confirm = $("actConfirm");
    if (confirm) {
      confirm.disabled = true;
      confirm.textContent = "进行中";
    }
    syncNav();
    buildRail();
  }

  function restartJourney() {
    cancelAnimationFrame(fireRaf);
    cancelAnimationFrame(dryRaf);
    fireRunning = false;
    dryRunning = false;
    fireSpeed = 1;
    if (advanceTimer) clearTimeout(advanceTimer);
    advancing = false;
    const img = $("aiImage");
    if (img) {
      img.hidden = true;
      img.removeAttribute("src");
    }
    if (typeof J.resetState === "function") J.resetState();
    else localStorage.removeItem("jiaotai_journey_v1");
    location.href = "../index.html";
  }

  /* —— unique option icons (SVG) —— */
  function iconSoil(item) {
    if (item.form === "chunk") {
      return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 30c2-8 8-14 14-14s10 4 12 10c4 2 6 6 4 10H12c-4-1-4-4-2-6z" fill="#6b5a4a"/><path d="M16 22l4-6 5 3 3-5 6 4" fill="none" stroke="#4a3d32" stroke-width="2"/><circle cx="20" cy="28" r="2" fill="#8a7560"/><circle cx="28" cy="32" r="1.5" fill="#8a7560"/></svg>`;
    }
    if (item.form === "soft") {
      return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="14" ry="9" fill="#f0e6d4"/><ellipse cx="24" cy="24" rx="11" ry="8" fill="#f7f1e6"/><ellipse cx="24" cy="20" rx="8" ry="5" fill="#fff8ee"/><path d="M14 28c4 3 16 3 20 0" fill="none" stroke="#d9cdb8" stroke-width="1.5"/></svg>`;
    }
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true"><path d="M12 32c3-10 9-14 12-14s8 5 12 14c-3 4-21 4-24 0z" fill="#a89070"/><path d="M18 26c3-4 5-2 7 1 2-4 5-5 8-1" fill="none" stroke="#7d6a52" stroke-width="2.2"/><path d="M16 32c4-3 12-3 16 0" fill="none" stroke="#cbb896" stroke-width="1.5"/></svg>`;
  }

  function iconTwist(item) {
    const map = {
      feather: `<path d="M24 8c8 10 10 18 8 28-8-4-12-10-14-18 6 2 10 6 12 12" fill="none" stroke="#3d5a48" stroke-width="2.4"/><path d="M18 18c4 2 8 6 10 10M16 24c5 2 9 6 11 9" fill="none" stroke="#6b8f71" stroke-width="1.6"/>`,
      weave: `<path d="M12 16h24M12 24h24M12 32h24M16 12v24M24 12v24M32 12v24" fill="none" stroke="#3d5a48" stroke-width="2"/><path d="M12 16h8v8h-8zm8 8h8v8h-8z" fill="rgba(61,90,72,0.2)"/>`,
      marble: `<path d="M10 30c6-14 10-8 14-16 4 10 6 4 14 16" fill="none" stroke="#3d5a48" stroke-width="2.4"/><path d="M12 34c8-8 16-4 24 0" fill="none" stroke="#a89070" stroke-width="2"/>`,
      ribbon: `<path d="M10 18c8 0 8 12 16 12s8-12 16-12" fill="none" stroke="#3d5a48" stroke-width="3"/><path d="M10 28c8 0 8 10 16 10s8-10 16-10" fill="none" stroke="#c4a484" stroke-width="2.4"/>`,
    };
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true">${map[item.id] || map.marble}</svg>`;
  }

  function iconForm(item) {
    const map = {
      slab: `<rect x="10" y="14" width="28" height="6" rx="1.5" fill="#c4a484"/><rect x="12" y="22" width="24" height="6" rx="1.5" fill="#a89070"/><rect x="14" y="30" width="20" height="6" rx="1.5" fill="#8a7560"/>`,
      wheel: `<circle cx="24" cy="24" r="12" fill="none" stroke="#3d5a48" stroke-width="2.5"/><circle cx="24" cy="24" r="4" fill="#c4a484"/><path d="M24 12v4M24 32v4M12 24h4M32 24h4" stroke="#3d5a48" stroke-width="2"/>`,
      hybrid: `<path d="M14 16h20v6H14zm2 8h16v12H16z" fill="#c4a484"/><path d="M18 18h4M26 18h4M20 28v6" stroke="#3d5a48" stroke-width="2"/>`,
    };
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true">${map[item.id] || map.hybrid}</svg>`;
  }

  function iconDry(item) {
    const map = {
      slow: `<path d="M24 10v20" stroke="#3d5a48" stroke-width="2.5"/><circle cx="24" cy="34" r="5" fill="#c4a484"/><path d="M16 16h16M18 22h12" stroke="#a89070" stroke-width="2" opacity=".7"/>`,
      standard: `<path d="M14 34h20l-3-18H17z" fill="#c4a484"/><path d="M20 16c0-4 8-4 8 0" fill="none" stroke="#3d5a48" stroke-width="2"/>`,
      controlled: `<rect x="12" y="14" width="24" height="22" rx="4" fill="none" stroke="#3d5a48" stroke-width="2"/><path d="M18 28c3-6 9-6 12 0" fill="none" stroke="#6b8f71" stroke-width="2"/><circle cx="24" cy="20" r="2" fill="#c4a484"/>`,
    };
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true">${map[item.id] || map.standard}</svg>`;
  }

  function iconGlaze(item) {
    const map = {
      "clear-thin": `<path d="M18 12h12l2 24H16z" fill="#c4a484"/><path d="M17 18h14" stroke="rgba(255,255,255,0.7)" stroke-width="2"/><path d="M20 12c2-4 6-4 8 0" fill="none" stroke="#6b8f71" stroke-width="2"/>`,
      clear: `<path d="M16 12h16l3 26H13z" fill="#b89a78"/><path d="M14 16h20" stroke="rgba(255,255,255,0.85)" stroke-width="3"/><path d="M15 24h18" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>`,
      none: `<path d="M18 12h12l2 24H16z" fill="#9a8570"/><circle cx="22" cy="22" r="1.5" fill="#6b5a4a"/><circle cx="27" cy="28" r="1.2" fill="#6b5a4a"/>`,
    };
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true">${map[item.id] || map["clear-thin"]}</svg>`;
  }

  function iconFire(item) {
    const map = {
      classic: `<path d="M24 8c8 10 10 16 10 22a10 10 0 1 1-20 0c0-6 2-12 10-22z" fill="#e07a3a"/><path d="M24 18c4 5 5 8 5 12a5 5 0 1 1-10 0c0-4 1-7 5-12z" fill="#f0c36a"/>`,
      hold: `<path d="M14 34h20v4H14zm2-4h16c0-8-3-14-8-18-5 4-8 10-8 18z" fill="#d9894a"/><rect x="20" y="22" width="8" height="4" fill="#f0c36a"/>`,
      "slow-cool": `<path d="M24 10c6 8 8 12 8 18a8 8 0 1 1-16 0c0-6 2-10 8-18z" fill="#c47a4a"/><path d="M18 36h12" stroke="#6b8f71" stroke-width="3"/><path d="M20 40h8" stroke="#3d5a48" stroke-width="2"/>`,
    };
    return `<svg class="ico-svg" viewBox="0 0 48 48" aria-hidden="true">${map[item.id] || map.hold}</svg>`;
  }

  function iconFor(key, item) {
    if (key === "soil") return iconSoil(item);
    if (key === "twist") return iconTwist(item);
    if (key === "form") return iconForm(item);
    if (key === "dry") return iconDry(item);
    if (key === "glaze") return iconGlaze(item);
    if (key === "fire") return iconFire(item);
    return `<span class="ico-fallback">◆</span>`;
  }

  /* —— close-up feature drawings —— */
  function showCloseup(kind, id) {
    const host = $("jCloseup");
    if (!host) return;
    host.hidden = false;
    host.classList.add("show");
    const canvas = host.querySelector("canvas") || document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 480;
    if (!canvas.parentNode) host.appendChild(canvas);
    const title = host.querySelector(".j-closeup-title");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 480, 480);
    const g = ctx.createRadialGradient(240, 220, 40, 240, 240, 240);
    g.addColorStop(0, "#2a2622");
    g.addColorStop(1, "#0e0d0c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 480, 480);

    let label = "";
    if (kind === "soil") {
      const item = J.SOILS.find((x) => x.id === id) || J.SOILS[0];
      label = item.name;
      drawSoilCloseup(ctx, item);
    } else if (kind === "twist") {
      const item = J.TWISTS.find((x) => x.id === id) || J.TWISTS[0];
      label = item.name;
      drawTwistCloseup(ctx, item);
    } else if (kind === "form") {
      const item = J.FORMS.find((x) => x.id === id) || J.FORMS[0];
      label = item.name;
      drawFormCloseup(ctx, item);
    } else if (kind === "dry") {
      const item = J.DRYS.find((x) => x.id === id) || J.DRYS[0];
      label = item.name;
      drawDryCloseup(ctx, item);
    } else if (kind === "glaze") {
      const item = J.GLAZES.find((x) => x.id === id) || J.GLAZES[0];
      label = item.name;
      drawGlazeCloseup(ctx, item);
    } else if (kind === "fire") {
      const item = J.FIRES.find((x) => x.id === id) || J.FIRES[0];
      label = item.name;
      drawFireCloseup(ctx, item);
    } else if (kind === "vessel") {
      label = J.vesselName(state);
      J.drawPreview(canvas, state);
    } else if (kind === "refine") {
      label = "揉泥特写";
      drawRefineCloseup(ctx);
    }
    if (title) title.textContent = `特写 · ${label}`;
  }

  function hideCloseupSoon() {
    const host = $("jCloseup");
    if (!host) return;
    clearTimeout(hideCloseupSoon._t);
    hideCloseupSoon._t = setTimeout(() => {
      host.classList.remove("show");
      setTimeout(() => {
        host.hidden = true;
      }, 280);
    }, 1600);
  }

  function drawSoilCloseup(ctx, item) {
    // three handful silhouettes unique by form/color
    const hues =
      item.form === "chunk"
        ? ["#5a4a3c", "#6b5a4a", "#7a6754"]
        : item.form === "soft"
          ? ["#e8dcc8", "#f0e6d4", "#f7f1e6"]
          : ["#8a7358", "#a89070", "#c4a484"];
    const shapes = [
      (x, y, s) => {
        ctx.beginPath();
        ctx.moveTo(x - 40 * s, y + 10 * s);
        ctx.bezierCurveTo(x - 50 * s, y - 30 * s, x - 10 * s, y - 55 * s, x + 5 * s, y - 20 * s);
        ctx.bezierCurveTo(x + 30 * s, y - 50 * s, x + 55 * s, y - 10 * s, x + 40 * s, y + 15 * s);
        ctx.bezierCurveTo(x + 20 * s, y + 35 * s, x - 20 * s, y + 35 * s, x - 40 * s, y + 10 * s);
        ctx.fill();
      },
      (x, y, s) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 48 * s, 32 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
      },
      (x, y, s) => {
        ctx.beginPath();
        ctx.moveTo(x, y - 40 * s);
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 7;
          const r = i % 2 ? 28 * s : 46 * s;
          ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      },
    ];
    const pickShape =
      item.form === "chunk" ? shapes[0] : item.form === "soft" ? shapes[1] : shapes[2];
    [[140, 260], [240, 200], [340, 270]].forEach(([x, y], i) => {
      ctx.fillStyle = hues[i];
      pickShape(x, y, 1 + i * 0.05);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(x, y + 36, 40, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // grit
    ctx.fillStyle = item.form === "soft" ? "rgba(120,100,70,0.2)" : "rgba(255,255,255,0.15)";
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(80 + Math.random() * 320, 140 + Math.random() * 220, Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTwistCloseup(ctx, item) {
    const img = ctx.createImageData(480, 480);
    for (let y = 0; y < 480; y++) {
      for (let x = 0; x < 480; x++) {
        const nx = x / 480,
          ny = y / 480;
        const t = patternSample(item.id, nx, ny);
        const i = (y * 480 + x) * 4;
        const a = hexToRgb(state.c1);
        const b = hexToRgb(state.c2);
        img.data[i] = a.r * (1 - t) + b.r * t;
        img.data[i + 1] = a.g * (1 - t) + b.g * t;
        img.data[i + 2] = a.b * (1 - t) + b.b * t;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = "rgba(247,243,235,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 408, 408);
  }

  function patternSample(id, nx, ny) {
    if (id === "feather") {
      const ang = Math.atan2(ny - 0.5, nx - 0.5);
      const r = Math.hypot(nx - 0.5, ny - 0.5);
      return (Math.sin(r * 28 + Math.sin(ang * 6) * 2) + 1) / 2;
    }
    if (id === "weave") {
      const u = nx * 10,
        v = ny * 10;
      const iu = Math.floor(u),
        iv = Math.floor(v);
      return (iu + iv) % 2 === 0 ? Math.abs(u - iu - 0.5) * 2 : Math.abs(v - iv - 0.5) * 2;
    }
    if (id === "ribbon") return (Math.sin((nx * 2 + ny) * 16) + 1) / 2;
    return (Math.sin(nx * 18 + Math.sin(ny * 12) * 3) * Math.cos(ny * 14) + 1) / 2;
  }

  function hexToRgb(hex) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function drawFormCloseup(ctx, item) {
    ctx.fillStyle = "#c4a484";
    if (item.id === "slab") {
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? "#a89070" : "#c4a484";
        roundRect(ctx, 90, 90 + i * 55, 300, 42, 8);
        ctx.fill();
      }
    } else if (item.id === "wheel") {
      ctx.strokeStyle = "#d7c4a8";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(240, 240, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#a89070";
      ctx.beginPath();
      ctx.arc(240, 240, 36, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#b89a78";
      roundRect(ctx, 150, 100, 180, 260, 20);
      ctx.fill();
      ctx.strokeStyle = "#3d5a48";
      ctx.lineWidth = 4;
      ctx.strokeRect(170, 140, 140, 40);
    }
  }

  function drawDryCloseup(ctx, item) {
    const p = item.id === "slow" ? 0.35 : item.id === "controlled" ? 0.55 : 0.7;
    ctx.fillStyle = `rgba(196,164,132,${0.4 + p * 0.5})`;
    roundRect(ctx, 150, 90, 180, 280, 24);
    ctx.fill();
    ctx.fillStyle = "rgba(247,243,235,0.2)";
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(170, 120 + i * 28, 140 * (0.4 + p * 0.5), 8);
    }
  }

  function drawGlazeCloseup(ctx, item) {
    ctx.fillStyle = "#9a8570";
    roundRect(ctx, 160, 90, 160, 280, 20);
    ctx.fill();
    if (item.id !== "none") {
      const shine = ctx.createLinearGradient(160, 90, 320, 200);
      shine.addColorStop(0, item.id === "clear" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      roundRect(ctx, 168, 100, 60, 240, 16);
      ctx.fill();
    }
  }

  function drawFireCloseup(ctx, item) {
    const colors =
      item.id === "classic"
        ? ["#e07a3a", "#f0c36a"]
        : item.id === "slow-cool"
          ? ["#c47a4a", "#6b8f71"]
          : ["#d9894a", "#f0c36a"];
    const g = ctx.createRadialGradient(240, 320, 20, 240, 240, 180);
    g.addColorStop(0, colors[1]);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 480, 480);
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(240, 100);
    ctx.bezierCurveTo(320, 180, 330, 260, 240, 360);
    ctx.bezierCurveTo(150, 260, 160, 180, 240, 100);
    ctx.fill();
  }

  function drawRefineCloseup(ctx) {
    const cols = [state.c1, state.c2, state.c3].slice(0, state.colorCount);
    cols.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.arc(160 + i * 80, 240, 70 - i * 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function choiceHtml(list, key) {
    return `<div class="j-choices">${list
      .map((item) => {
        const active = state[key] === item.id;
        return `<button type="button" class="j-choice ${active ? "active" : ""}" data-key="${key}" data-id="${item.id}">
          <span class="ico">${iconFor(key, item)}</span>
          <span><strong>${item.name}</strong><span>${item.note}</span></span>
          <span class="check" aria-hidden="true"></span>
        </button>`;
      })
      .join("")}</div>`;
  }

  function ensureCloseupHost() {
    const viz = $("jViz");
    if (!viz || $("jCloseup")) return;
    const host = document.createElement("div");
    host.id = "jCloseup";
    host.className = "j-closeup";
    host.hidden = true;
    host.innerHTML = `<p class="j-closeup-title">特写</p>`;
    viz.appendChild(host);
  }

  function renderPanel() {
    const panel = $("jPanel");
    if (!panel) return;
    let html = "";

    if (stepId === "soil") {
      html = `
        <h3>点选你的泥脉</h3>
        ${choiceHtml(J.SOILS, "soil")}
        <div class="j-field"><label>署名（可选）</label><input type="text" id="author" maxlength="20" placeholder="例如：控" value="${state.author}" /></div>
        <div class="j-field"><label>一句心愿（可选）</label><textarea id="wish" maxlength="80" placeholder="想做一件送给谁的瓷器？">${state.wish}</textarea></div>
        ${confirmControls("确认后进入下一关。可先点开三种土看特写。")}`;
    } else if (stepId === "refine") {
      html = `
        <h3>炼泥台 · 揉出色泥</h3>
        <div class="j-field"><label>色数 <b id="colorCountVal">${state.colorCount}</b></label>
          <input type="range" id="colorCount" min="2" max="3" value="${state.colorCount}" /></div>
        <div class="j-colors">
          <label>泥色1<input type="color" id="c1" value="${state.c1}" /></label>
          <label>泥色2<input type="color" id="c2" value="${state.c2}" /></label>
          <label>泥色3<input type="color" id="c3" value="${state.c3}" /></label>
        </div>
        ${confirmControls("确认后进入下一关", `<button type="button" class="j-play-btn alt" id="actSwap">互换主次色</button>`)}
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "twist") {
      html = `
        <h3>绞盘 · 编花成纹</h3>
        ${choiceHtml(J.TWISTS, "twist")}
        <div class="j-field"><label>绞扭强度 <b id="strengthVal">${state.strength}</b></label>
          <input type="range" id="strength" min="20" max="90" value="${state.strength}" /></div>
        <div class="j-field"><label>纹路密度 <b id="densityVal">${state.density}</b></label>
          <input type="range" id="density" min="20" max="90" value="${state.density}" /></div>
        ${confirmControls("确认后进入下一关。也可在预览区左右滑动绞转。")}`;
    } else if (stepId === "vessel") {
      html = `
        <h3>器型库 · 图文选型</h3>
        <div id="vesselPicker" class="process-vessel-picker"></div>
        <div class="j-field"><label>腹径 <b id="bellyVal">${state.belly}</b></label>
          <input type="range" id="belly" min="0" max="500" value="${state.belly}" /></div>
        <div class="j-field"><label>口沿 <b id="rimVal">${state.rim}</b></label>
          <input type="range" id="rim" min="0" max="500" value="${state.rim}" /></div>
        ${confirmControls("确认后进入下一关")}`;
    } else if (stepId === "form") {
      html = `
        <h3>成型路径</h3>
        ${choiceHtml(J.FORMS, "form")}
        ${confirmControls("确认后进入下一关")}`;
    } else if (stepId === "dry") {
      const dryPct = Math.round(Number(state.dryProgress) || 0);
      const dryDone = dryPct >= 100;
      html = `
        <h3>荫干节奏</h3>
        ${choiceHtml(J.DRYS, "dry")}
        <div class="j-field"><label>荫干进度 <b id="dryVal">${dryPct}%</b></label></div>
        <div class="j-gauge${dryDone ? "" : " is-wait"}" id="dryGauge"><i id="dryBar" style="width:${dryPct}%"></i></div>
        <p class="j-fire-meta${dryDone ? "" : " is-wait"}" id="dryMeta">${dryDone ? "荫干完成" : "等待确定后开始"}</p>
        ${confirmControls("确认后开始荫干")}`;
    } else if (stepId === "glaze") {
      html = `
        <h3>施釉方案</h3>
        ${choiceHtml(J.GLAZES, "glaze")}
        ${confirmControls("确认后进入下一关")}`;
    } else if (stepId === "fire") {
      const pct = Math.round(Number(state.fireProgress) || 0);
      const done = !!state.fireDone || pct >= 100;
      const boost = reducedMotion()
        ? ""
        : `<button type="button" class="j-play-btn alt" id="actBoost" disabled>手动加速</button>`;
      html = `
        <h3>焙烧曲线</h3>
        ${choiceHtml(J.FIRES, "fire")}
        <div class="j-field"><label>窑火进度 <b id="fireVal">${pct}%</b></label></div>
        <div class="j-gauge${done ? " fire" : " is-wait"}" id="fireGauge"><i id="fireBar" style="width:${pct}%"></i></div>
        <p class="j-fire-meta${done ? "" : " is-wait"}" id="fireMeta">${done ? "烧成完成" : "请选择曲线后点确定开始"}</p>
        ${confirmControls("确认后开始焙烧", boost)}`;
    } else {
      const id = J.dossierId(state);
      const wish = state.wish.trim();
      html = `
        <h3>出窑 · 器物卡</h3>
        <p class="j-finish-id">${id}</p>
        <p class="j-tip">创作者：${escapeHtml(state.author.trim() || "未署名")} · 独特性 ${J.originalityScore(state)}/100</p>
        ${wish ? `<p class="j-tip">心愿：${escapeHtml(wish)}</p>` : ""}
        <div id="vesselCardMount"></div>
        <div class="j-play">
          <button type="button" class="j-play-btn" id="btnMakeCard">生成我的器物卡</button>
          <button type="button" class="j-play-btn alt" id="btnShareCard">转发器物卡</button>
          <button type="button" class="j-play-btn alt" id="btnCopyLink">复制链接</button>
        </div>
        <div class="j-ai">
          <img id="aiImage" alt="AI 样张" hidden />
          <p class="j-ai-status" id="aiStatus">可生成 AI 产品摄影样张</p>
          <div class="j-play">
            <button type="button" class="j-play-btn alt" id="btnAiGen">生成 AI 样张</button>
          </div>
          <div class="j-play">
            <button type="button" class="j-play-btn" id="actRestart">重新开始</button>
          </div>
        </div>
        <p class="j-tip">${meta.tip}</p>`;
    }

    panel.innerHTML = html;
    bindPanel();
  }

  function bindPanel() {
    panelChoices();
    bindInputs(["author", "wish", "colorCount", "c1", "c2", "c3", "strength", "density", "belly", "rim"]);

    const act = (id, fn) => {
      const el = $(id);
      if (el) el.addEventListener("click", fn);
    };

    act("actConfirm", onConfirm);
    act("actSwap", () => {
      if (barBusy()) return;
      const t = state.c1;
      state.c1 = state.c2;
      state.c2 = t;
      persist();
      renderPanel();
      showCloseup("refine");
      hideCloseupSoon();
      scheduleDraw();
      toast("主次色已互换");
    });
    act("actBoost", () => {
      if (state.fireDone || !fireRunning) return;
      fireSpeed = Math.min(6, fireSpeed + 1.8);
      toast(`加速 ×${fireSpeed.toFixed(1)}`);
      paintFire();
    });
    act("btnAiGen", generateAi);
    act("btnMakeCard", () => saveVesselCard());
    act("btnShareCard", () => shareVesselCard());
    act("btnCopyLink", () => copyHomeLink());
    act("actRestart", () => restartJourney());
    if (stepId === "finish" && window.JiaotaiVesselCard) {
      const host = $("vesselCardMount");
      if (host) window.JiaotaiVesselCard.mount(host, state);
    }

    if (stepId === "vessel" && window.JiaotaiVesselUI) {
      window.JiaotaiVesselUI.mountVesselPicker($("vesselPicker"), {
        selectedId: state.vessel,
        compact: true,
        onSelect: (v) => {
          if (barBusy()) return;
          state.vessel = v.id;
          persist();
          showCloseup("vessel");
          hideCloseupSoon();
          scheduleDraw();
          toast(`器型：${v.name}`);
          const confirm = $("actConfirm");
          if (confirm) confirm.disabled = !hasLegalChoice();
        },
      });
    }

    if (stepId === "fire" && state.fireDone) {
      setKilnGlow(0.12 + 0.35);
      scheduleDraw({ fireGlow: true });
    } else if (stepId === "fire") {
      setKilnGlow(0);
    }
  }

  function onConfirm() {
    if (barBusy() || !hasLegalChoice()) return;
    if (stepId === "soil") {
      burstParticles();
      showCloseup("soil", state.soil);
      scheduleDraw();
      goNextSoon("泥脉已定，进入下一关");
      return;
    }
    if (stepId === "refine") {
      showCloseup("refine");
      hideCloseupSoon();
      kneadPulse();
      scheduleDraw();
      goNextSoon("炼泥完成，进入下一关");
      return;
    }
    if (stepId === "twist") {
      showCloseup("twist", state.twist);
      hideCloseupSoon();
      scheduleDraw();
      goNextSoon("编花完成，进入下一关");
      return;
    }
    if (stepId === "vessel") {
      showCloseup("vessel");
      hideCloseupSoon();
      scheduleDraw();
      goNextSoon("器型已定，进入下一关");
      return;
    }
    if (stepId === "form") {
      showCloseup("form", state.form);
      hideCloseupSoon();
      scheduleDraw();
      goNextSoon("成型路径已定，进入下一关");
      return;
    }
    if (stepId === "glaze") {
      glazeFlash();
      showCloseup("glaze", state.glaze);
      hideCloseupSoon();
      scheduleDraw();
      goNextSoon("施釉完成，进入下一关");
      return;
    }
    if (stepId === "dry") {
      startAutoDry();
      return;
    }
    if (stepId === "fire") startAutoFire();
  }

  function panelChoices() {
    document.querySelectorAll(".j-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (barBusy()) return;
        const key = btn.dataset.key;
        const id = btn.dataset.id;
        state[key] = id;
        persist();
        renderPanel();
        showCloseup(key, id);
        // 选土：停留看特写，方便连点对比
        if (key !== "soil") hideCloseupSoon();
        if (key === "glaze") glazeFlash();
        scheduleDraw(key === "fire" && state.fireDone ? { fireGlow: true } : {});
        toast(`已选 · ${btn.querySelector("strong")?.textContent || ""}`);
      });
    });
  }

  function bindInputs(ids) {
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        if (barBusy()) return;
        if (id === "author" || id === "wish") state[id] = el.value;
        else if (id === "c1" || id === "c2" || id === "c3") state[id] = el.value;
        else {
          state[id] = Number(el.value);
          const map = {
            colorCount: "colorCountVal",
            strength: "strengthVal",
            density: "densityVal",
            belly: "bellyVal",
            rim: "rimVal",
          };
          const lab = $(map[id]);
          if (lab) lab.textContent = state[id];
        }
        persist();
        if (id === "c1" || id === "c2" || id === "c3" || id === "colorCount") {
          showCloseup("refine");
          hideCloseupSoon();
        }
        scheduleDraw();
      });
    });
  }

  function setKilnGlow(opacity) {
    const fx = $("jFx");
    if (!fx) return;
    if (!opacity) {
      fx.innerHTML = "";
      return;
    }
    fx.innerHTML = `<div class="j-kiln-glow" style="opacity:${opacity}"></div>`;
  }

  function paintDry() {
    const value = Math.min(100, Number(state.dryProgress) || 0);
    const pct = Math.round(value);
    const done = value >= 100;
    const waiting = !dryRunning && !done;
    const bar = $("dryBar");
    const lab = $("dryVal");
    const meta = $("dryMeta");
    const gauge = $("dryGauge");
    if (bar) bar.style.width = `${value}%`;
    if (lab) lab.textContent = `${pct}%`;
    if (gauge) gauge.classList.toggle("is-wait", waiting);
    if (meta) {
      meta.classList.toggle("is-wait", waiting);
      meta.textContent = done ? "荫干完成" : dryRunning ? `荫干中 · ${pct}%` : "等待确定后开始";
    }
  }

  function paintFire() {
    const value = Math.min(100, Number(state.fireProgress) || 0);
    const pct = Math.round(value);
    const done = !!state.fireDone || value >= 100;
    const running = fireRunning && !done;
    const waiting = !running && !done;
    const bar = $("fireBar");
    const lab = $("fireVal");
    const meta = $("fireMeta");
    const gauge = $("fireGauge");
    if (bar) bar.style.width = `${value}%`;
    if (lab) lab.textContent = `${pct}%`;
    if (gauge) {
      gauge.classList.toggle("is-wait", waiting);
      gauge.classList.toggle("fire", running || done);
    }
    if (meta) {
      meta.classList.toggle("is-wait", waiting);
      if (done) meta.textContent = "烧成完成";
      else if (running) {
        const duration = reducedMotion() ? REDUCED_MS : FIRE_MS;
        meta.textContent =
          fireSpeed > 1.05
            ? `加速烧制中 ×${fireSpeed.toFixed(1)}`
            : `自动烧制中 · 约 ${Math.max(0, ((100 - value) / 100) * (duration / 1000)).toFixed(1)} 秒`;
      } else meta.textContent = "请选择曲线后点确定开始";
    }
    const boost = $("actBoost");
    if (boost) boost.disabled = !(running && !reducedMotion());
  }

  function startAutoDry() {
    if (dryRunning || advancing) return;
    if ((Number(state.dryProgress) || 0) >= 100) {
      goNextSoon("荫干完成，进入下一关");
      return;
    }
    dryRunning = true;
    state.dryProgress = 0;
    const duration = reducedMotion() ? REDUCED_MS : DRY_MS[state.dry] || 8000;
    paintDry();
    lockRunningUi();
    let last = performance.now();
    const tick = (now) => {
      if (!dryRunning) return;
      const dt = Math.max(0, now - last);
      last = now;
      state.dryProgress = Math.min(100, (Number(state.dryProgress) || 0) + (dt / duration) * 100);
      paintDry();
      scheduleDraw();
      if (state.dryProgress >= 100) {
        dryRunning = false;
        state.dryProgress = 100;
        persist();
        paintDry();
        showCloseup("dry", state.dry);
        hideCloseupSoon();
        goNextSoon("荫干完成，进入下一关");
        return;
      }
      persist();
      dryRaf = requestAnimationFrame(tick);
    };
    dryRaf = requestAnimationFrame(tick);
  }

  function startAutoFire() {
    if (fireRunning || advancing) return;
    if (state.fireDone) {
      goNextSoon("焙烧完成，出窑见瓷");
      return;
    }
    fireRunning = true;
    fireSpeed = 1;
    state.fireProgress = 0;
    state.fireDone = false;
    state.fireTemp = 30;
    const duration = reducedMotion() ? REDUCED_MS : FIRE_MS;
    paintFire();
    setKilnGlow(0.12);
    lockRunningUi();
    let last = performance.now();
    const tick = (now) => {
      if (!fireRunning) return;
      const dt = Math.max(0, now - last);
      last = now;
      state.fireProgress = Math.min(100, (Number(state.fireProgress) || 0) + (dt / duration) * 100 * fireSpeed);
      state.fireTemp = Math.round(30 + state.fireProgress * 0.7);
      paintFire();
      scheduleDraw({ fireGlow: true });
      setKilnGlow(0.12 + (state.fireProgress / 100) * 0.35);
      if (state.fireProgress >= 100) {
        fireRunning = false;
        state.fireDone = true;
        state.fireProgress = 100;
        state.fireTemp = 100;
        persist();
        paintFire();
        showCloseup("fire", state.fire);
        hideCloseupSoon();
        toast("烧成！");
        goNextSoon("焙烧完成，出窑见瓷");
        return;
      }
      persist();
      fireRaf = requestAnimationFrame(tick);
    };
    fireRaf = requestAnimationFrame(tick);
  }

  function kneadPulse() {
    const viz = $("jViz");
    if (!viz) return;
    viz.animate([{ transform: "scale(1)" }, { transform: "scale(0.97)" }, { transform: "scale(1)" }], {
      duration: 420,
      easing: "ease-out",
    });
  }

  function burstParticles() {
    const fx = $("jFx");
    if (!fx) return;
    fx.innerHTML = "";
    const hue = J.SOILS.find((x) => x.id === state.soil)?.hue || "#c4a484";
    for (let i = 0; i < 14; i++) {
      const d = document.createElement("i");
      d.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:${hue};left:50%;top:50%;opacity:0.9;transform:translate(-50%,-50%);transition:transform 0.7s ease,opacity 0.7s ease;`;
      fx.appendChild(d);
      requestAnimationFrame(() => {
        const ang = (Math.PI * 2 * i) / 14;
        const r = 80 + Math.random() * 70;
        d.style.transform = `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r}px))`;
        d.style.opacity = "0";
      });
    }
  }

  function glazeFlash() {
    const fx = $("jFx");
    if (!fx) return;
    fx.innerHTML = `<div class="j-glaze-flash"></div>`;
    const d = fx.firstChild;
    requestAnimationFrame(() => d.classList.add("on"));
  }

  function bindVizGestures() {
    const viz = $("jViz");
    if (!viz || stepId !== "twist") return;
    let x0 = null;
    viz.addEventListener("pointerdown", (e) => {
      x0 = e.clientX;
      viz.setPointerCapture?.(e.pointerId);
    });
    viz.addEventListener("pointermove", (e) => {
      if (x0 == null || barBusy()) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 18) {
        state.strength = Math.max(20, Math.min(90, state.strength + Math.sign(dx) * 2));
        state.seed = (state.seed + Math.sign(dx) * 13 + 100000000) % 100000000;
        x0 = e.clientX;
        persist();
        const lab = $("strengthVal");
        if (lab) lab.textContent = state.strength;
        const range = $("strength");
        if (range) range.value = state.strength;
        scheduleDraw();
      }
    });
    viz.addEventListener("pointerup", () => {
      x0 = null;
    });
  }

  let aiBusy = false;
  let aiSerial = 0;
  async function generateAi() {
    const img = $("aiImage");
    const status = $("aiStatus");
    const btn = $("btnAiGen");
    if (!window.JiaotaiAI || !img) return;
    if (aiBusy) {
      status.textContent = "上一张仍在生成中…";
      return;
    }
    aiBusy = true;
    aiSerial += 1;
    const serial = aiSerial;
    btn.disabled = true;
    status.textContent = "正在请求生图…";
    const colors = [state.c1, state.c2, state.c3].slice(0, state.colorCount).join(", ");
    const prompt = [
      "Original product photo of Dangyangyu jiaotai porcelain,",
      `${J.vesselName(state)} vase, through-body ${J.labelOf(J.TWISTS, state.twist)} marbled clay,`,
      `colors ${colors}, twist ${state.strength}, density ${state.density},`,
      "thin clear glaze, dark studio, no text no logo",
    ].join(" ");
    try {
      const result = await window.JiaotaiAI.generateJiaotaiImage(prompt, {
        seed: (state.seed + serial * 97) % 1000000,
        nonce: `j${serial}_${Date.now().toString(36)}`,
      });
      await window.JiaotaiAI.applyImage(img, result);
      img.hidden = false;
      status.textContent = `已生成 · ${result.provider === "agnes" ? "Agnes" : "备用"} · 第 ${serial} 次`;
      setMark("finish");
    } catch (e) {
      status.textContent = `失败：${e?.message || "error"}，可重试`;
    } finally {
      btn.disabled = false;
      aiBusy = false;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function saveVesselCard() {
    if (!window.JiaotaiVesselCard) return;
    await window.JiaotaiVesselCard.download(state);
    setMark("finish");
    toast("器物卡已保存");
  }

  async function shareVesselCard() {
    if (!window.JiaotaiVesselCard) return;
    try {
      const mode = await window.JiaotaiVesselCard.share(state);
      setMark("finish");
      toast(mode === "shared" ? "已打开转发" : "器物卡已保存，可再转发图片");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast("转发未完成，请改用保存");
    }
  }

  async function copyHomeLink() {
    const url = (window.JiaotaiVesselCard && window.JiaotaiVesselCard.HOME) || J.HOME_URL;
    try {
      await navigator.clipboard.writeText(url);
      toast("礼匣链接已复制");
    } catch {
      toast(url);
    }
  }

  // boot
  settleTimedStage();
  ensureCloseupHost();
  $("jKicker").textContent = `第 ${meta.no} 关 · ${meta.verb}`;
  $("jTitle").textContent = meta.title;
  $("jDesc").textContent = meta.desc;
  const prev = J.prevFile(stepId);
  const next = J.nextFile(stepId);
  const btnPrev = $("jPrev");
  const btnNext = $("jNext");
  if (btnPrev) {
    if (!prev) btnPrev.textContent = "返回启程";
    btnPrev.addEventListener("click", () => {
      if (btnPrev.disabled) return;
      location.href = prev ? `./${prev}` : "../index.html?enter=1";
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (btnNext.disabled) return;
      if (stepId === "finish") {
        restartJourney();
        return;
      }
      if (!stageComplete() || !next) return;
      location.href = `./${next}`;
    });
  }
  syncNav();

  const mark = $("jMark");
  if (mark) mark.textContent = `印记 ${(state.marks || []).length}/9`;

  buildRail();
  renderPanel();
  scheduleDraw(stepId === "fire" && state.fireDone ? { fireGlow: true } : {});
  bindVizGestures();

  // 进入关卡时展示当前选项特写；选土关不自动收起，方便连点对比
  if (stepId === "soil") showCloseup("soil", state.soil);
  if (stepId === "twist") showCloseup("twist", state.twist);
  if (stepId === "form") showCloseup("form", state.form);
  if (stepId === "glaze") showCloseup("glaze", state.glaze);
  if (stepId === "dry") showCloseup("dry", state.dry);
  if (["twist", "form", "glaze", "dry"].includes(stepId)) hideCloseupSoon();

  persist();
})();
