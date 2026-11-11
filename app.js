(() => {
  const VESSELS = window.JIAOTAI_VESSELS;
  const vesselRadius = window.jiaotaiVesselRadius;
  const vesselAccessory = window.jiaotaiVesselAccessory;

  const canvas = document.getElementById("pattern");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const texCanvas = document.createElement("canvas");
  texCanvas.width = 512;
  texCanvas.height = 512;
  const texCtx = texCanvas.getContext("2d", { willReadFrequently: true });

  const state = {
    style: "feather",
    vessel: "meiping",
    view: "vessel",
    seed: 20261111,
    twist: 55,
    density: 48,
    sharpness: 62,
    colorCount: 2,
    belly: 68,
    rim: 48,
    foot: 14,
    sheen: 55,
  };

  const styleNames = {
    feather: "鸟羽纹",
    weave: "编织纹",
    marble: "大理石绞",
    ribbon: "带状绞",
  };

  const vesselMap = Object.fromEntries(VESSELS.map((v) => [v.id, v]));
  const $ = (id) => document.getElementById(id);
  const vesselName = () => vesselMap[state.vessel]?.name || state.vessel;

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(x, y, seed) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothNoise(x, y, seed) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(x0, y0, seed);
    const b = hash2(x0 + 1, y0, seed);
    const c = hash2(x0, y0 + 1, seed);
    const d = hash2(x0 + 1, y0 + 1, seed);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbm(x, y, seed, octaves = 4) {
    let v = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
      v += amp * smoothNoise(x * freq, y * freq, seed + i * 19);
      amp *= 0.5;
      freq *= 2;
    }
    return v;
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function getColors() {
    const count = Number($("colorCount").value);
    return ["c1", "c2", "c3", "c4"].slice(0, count).map((id) => hexToRgb($(id).value));
  }

  function pickColor(t, colors) {
    const n = colors.length;
    const x = ((t % 1) + 1) % 1;
    const scaled = x * (n - 1);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const a = colors[i];
    const b = colors[Math.min(i + 1, n - 1)];
    const sharp = state.sharpness / 100;
    const ff = Math.pow(f, 0.35 + sharp * 1.4);
    return {
      r: Math.round(a.r + (b.r - a.r) * ff),
      g: Math.round(a.g + (b.g - a.g) * ff),
      b: Math.round(a.b + (b.b - a.b) * ff),
    };
  }

  function patternValue(nx, ny, style, seed, twist, density) {
    const tw = twist / 100;
    const dens = 0.8 + density / 40;
    let x = nx;
    let y = ny;
    const w1 = fbm(x * dens, y * dens, seed, 3);
    const w2 = fbm(x * dens + 5.2, y * dens + 1.3, seed + 7, 3);
    x += (w1 - 0.5) * tw * 1.35;
    y += (w2 - 0.5) * tw * 1.35;

    if (style === "feather") {
      const angle = Math.atan2(y - 0.5, x - 0.5);
      const radius = Math.hypot(x - 0.5, y - 0.5);
      const scales = Math.sin(radius * dens * 28 + Math.sin(angle * 6) * 2);
      const ribs = Math.sin((angle + radius * 3) * dens * 18);
      return (scales * 0.55 + ribs * 0.45 + 1) / 2;
    }
    if (style === "weave") {
      const cell = dens * 10;
      const u = x * cell;
      const v = y * cell;
      const iu = Math.floor(u);
      const iv = Math.floor(v);
      const fu = u - iu;
      const fv = v - iv;
      const parity = (iu + iv) % 2 === 0;
      const bar = parity ? Math.abs(fu - 0.5) * 2 : Math.abs(fv - 0.5) * 2;
      const stripe = Math.sin((parity ? fv : fu) * Math.PI * (6 + dens));
      return (1 - bar) * 0.65 + (stripe * 0.5 + 0.5) * 0.35;
    }
    if (style === "ribbon") {
      const bands = Math.sin((x * 2 + y) * dens * 14 + fbm(x * 3, y * 3, seed) * 6);
      const edge = Math.sin((y - x) * dens * 20);
      return (bands * 0.7 + edge * 0.3 + 1) / 2;
    }
    const m =
      Math.sin((x + fbm(x * 2, y * 2, seed) * tw) * dens * 16) *
      Math.cos((y + fbm(x * 2.4, y * 1.7, seed + 3) * tw) * dens * 12);
    return (m + 1) / 2;
  }

  function buildTexture() {
    const w = texCanvas.width;
    const h = texCanvas.height;
    const colors = getColors();
    const img = texCtx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = patternValue(x / w, y / h, state.style, state.seed, state.twist, state.density);
        const c = pickColor(t, colors);
        const i = (y * w + x) * 4;
        img.data[i] = c.r;
        img.data[i + 1] = c.g;
        img.data[i + 2] = c.b;
        img.data[i + 3] = 255;
      }
    }
    texCtx.putImageData(img, 0, 0);
    return texCtx.getImageData(0, 0, w, h);
  }

  function sampleTex(tex, u, v) {
    const w = tex.width;
    const h = tex.height;
    const x = ((u % 1) + 1) % 1;
    const y = ((v % 1) + 1) % 1;
    const ix = Math.min(w - 1, Math.floor(x * w));
    const iy = Math.min(h - 1, Math.floor(y * h));
    const i = (iy * w + ix) * 4;
    return { r: tex.data[i], g: tex.data[i + 1], b: tex.data[i + 2] };
  }

  function rawRadiusAt(t, id = state.vessel) {
    return vesselRadius(
      Math.max(0, Math.min(1, t)),
      id,
      state.belly / 100,
      state.rim / 100,
      state.foot / 100
    );
  }

  /** 多点平滑，去掉瓶口/肩/足的折角 */
  function radiusAt(t, id = state.vessel) {
    const t0 = Math.max(0, Math.min(1, t));
    const d = 0.012;
    const a = rawRadiusAt(t0 - d, id);
    const b = rawRadiusAt(t0, id);
    const c = rawRadiusAt(t0 + d, id);
    return (a + b * 2 + c) / 4;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function lobeShade(nx) {
    if (state.vessel !== "gualeng" && state.vessel !== "congshi") return 1;
    if (state.vessel === "congshi") {
      const ang = Math.asin(Math.max(-1, Math.min(1, (nx - 0.5) * 2)));
      return 0.9 + 0.1 * Math.abs(Math.cos(ang * 2));
    }
    const lobes = 8;
    return 0.88 + 0.12 * (0.5 + 0.5 * Math.cos((nx - 0.5) * Math.PI * lobes));
  }

  function ceramicShade(xn, sheen) {
    // 圆润体积光：避开硬高光块
    const wrap = 0.5 + 0.5 * Math.sqrt(Math.max(0, 1 - xn * xn));
    const fresnel = Math.pow(1 - Math.abs(xn), 2.2) * (0.12 + sheen * 0.22);
    const gloss = Math.exp(-Math.pow((xn + 0.22) / 0.38, 2)) * sheen * 0.28;
    return Math.min(1.35, 0.58 + wrap * 0.38 + fresnel + gloss);
  }

  function blendPixel(img, i, r, g, b, a, bg) {
    if (a <= 0.002) return;
    const aa = Math.max(0, Math.min(1, a));
    const inv = 1 - aa;
    img.data[i] = Math.min(255, r * aa + bg[0] * inv);
    img.data[i + 1] = Math.min(255, g * aa + bg[1] * inv);
    img.data[i + 2] = Math.min(255, b * aa + bg[2] * inv);
    img.data[i + 3] = 255;
  }

  function bgAt(y, h) {
    const u = y / h;
    return [
      44 + (11 - 44) * u,
      42 + (10 - 42) * u,
      38 + (9 - 38) * u,
    ];
  }

  function drawStudioBackground() {
    const w = canvas.width;
    const h = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2c2a26");
    g.addColorStop(0.55, "#161411");
    g.addColorStop(1, "#0b0a09");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const floor = ctx.createRadialGradient(w * 0.5, h * 0.82, 10, w * 0.5, h * 0.82, w * 0.42);
    floor.addColorStop(0, "rgba(255,255,255,0.10)");
    floor.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = floor;
    ctx.fillRect(0, 0, w, h);
  }

  function renderFlat(tex) {
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = sampleTex(tex, x / w, y / h);
        const i = (y * w + x) * 4;
        img.data[i] = c.r;
        img.data[i + 1] = c.g;
        img.data[i + 2] = c.b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function renderSection(tex) {
    drawStudioBackground();
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const cx = w * 0.5;
    const top = h * 0.12;
    const bot = h * 0.88;
    const scale = w * 0.95;
    const feather = 2.8;

    for (let y = 0; y < h; y++) {
      const t = (y - top) / (bot - top);
      if (t < -0.02 || t > 1.02) continue;
      const r = radiusAt(Math.max(0, Math.min(1, t))) * scale;
      const bg = bgAt(y, h);
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dist = r - Math.abs(dx);
        const a = smoothstep(-feather, feather * 0.6, dist) *
          smoothstep(-0.02, 0.02, t) *
          smoothstep(1.02, 0.98, t);
        if (a <= 0.01) continue;
        const u = 0.5 + dx / Math.max(r * 2, 1);
        const c = sampleTex(tex, u + 0.08, Math.max(0, Math.min(1, t)));
        const xn = dx / Math.max(r, 1);
        const shade = ceramicShade(Math.max(-1, Math.min(1, xn)), 0.45) * (dx > 0 ? 1.06 : 1);
        const i = (y * w + x) * 4;
        blendPixel(img, i, c.r * shade, c.g * shade, c.b * shade, a, bg);
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, bot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(247,243,235,0.8)";
    ctx.font = "600 16px Source Sans 3, sans-serif";
    ctx.fillText("外表", cx - 90, top - 10);
    ctx.fillText("截面 · 表里如一", cx + 12, top - 10);
  }

  function renderVessel(tex) {
    drawStudioBackground();
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const cx = w * 0.5;
    const top = h * 0.08;
    const bot = h * 0.9;
    const scale = w * 0.95;
    const sheen = state.sheen / 100;
    const bellyN = state.belly / 100;
    const feather = 3.2; // 边缘柔化宽度（像素）

    for (let y = Math.floor(top) - 6; y < Math.ceil(bot) + 6; y++) {
      if (y < 0 || y >= h) continue;
      const t = (y - top) / (bot - top);
      const tClamped = Math.max(0, Math.min(1, t));
      // 纵向也平滑半径，减少肩线锯齿
      const rY = radiusAt(tClamped) * scale;
      const rUp = radiusAt(Math.max(0, tClamped - 1 / (bot - top))) * scale;
      const rDn = radiusAt(Math.min(1, tClamped + 1 / (bot - top))) * scale;
      const r = (rUp + rY * 2 + rDn) / 4;
      const bg = bgAt(y, h);
      const topFade = smoothstep(-0.015, 0.02, t);
      const botFade = smoothstep(1.02, 0.97, t);

      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        const dx = x - cx;
        const acc = vesselAccessory(nx, ny, state.vessel, bellyN);
        let u;
        let v;
        let shade;
        let a = 0;

        if (acc) {
          a = (acc.alpha != null ? acc.alpha : 0.92);
          u = acc.u;
          v = acc.v;
          shade = acc.shade * 0.96;
        } else {
          const dist = r - Math.abs(dx);
          a = smoothstep(-feather, feather * 0.85, dist) * topFade * botFade;
          if (a > 0.01) {
            const xn = Math.max(-1, Math.min(1, dx / Math.max(r, 1)));
            u = 0.5 + Math.asin(xn) / Math.PI;
            v = tClamped * 0.9 + 0.05;
            shade = ceramicShade(xn, sheen) * lobeShade(nx);
            // 近缘更润：釉边柔光，而不是硬描边
            const rimGlow = Math.pow(smoothstep(feather * 2.5, 0, dist), 1.4) * (0.08 + sheen * 0.12);
            shade = Math.min(1.4, shade + rimGlow);
          }
        }

        if (a <= 0.01) continue;
        const c = sampleTex(tex, u, v);
        const i = (y * w + x) * 4;
        blendPixel(img, i, c.r * shade, c.g * shade, c.b * shade, a, bg);
      }
    }

    ctx.putImageData(img, 0, 0);

    // 口沿柔椭圆高光（替代硬描边）
    const rimT = 0.045;
    const rimY = top + (bot - top) * rimT;
    const rimR = radiusAt(rimT) * scale;
    const rimGrad = ctx.createRadialGradient(cx - rimR * 0.15, rimY - 2, 2, cx, rimY, rimR * 1.05);
    rimGrad.addColorStop(0, `rgba(255,255,255,${0.1 + sheen * 0.12})`);
    rimGrad.addColorStop(0.55, "rgba(255,255,255,0.03)");
    rimGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, rimY, rimR * 0.98, Math.max(5, rimR * 0.16), 0, 0, Math.PI * 2);
    ctx.fill();

    // 外轮廓轻柔光晕
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255,248,235,${0.045 + sheen * 0.04})`;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const tt = i / steps;
      const rr = radiusAt(tt) * scale;
      const yy = top + (bot - top) * tt;
      if (i === 0) ctx.moveTo(cx + rr, yy);
      else ctx.lineTo(cx + rr, yy);
    }
    for (let i = steps; i >= 0; i--) {
      const tt = i / steps;
      const rr = radiusAt(tt) * scale;
      const yy = top + (bot - top) * tt;
      ctx.lineTo(cx - rr, yy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    const shadow = ctx.createRadialGradient(cx, bot + 8, 4, cx, bot + 8, scale * 0.35);
    shadow.addColorStop(0, "rgba(0,0,0,0.28)");
    shadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(cx, bot + 10, scale * 0.28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    const tex = buildTexture();
    if (state.view === "flat") renderFlat(tex);
    else if (state.view === "section") renderSection(tex);
    else renderVessel(tex);

    $("seedLabel").textContent = `种子 ${state.seed}`;
    $("styleLabel").textContent = `${styleNames[state.style]} · ${vesselName()}`;
    $("vesselHint").textContent = vesselMap[state.vessel]?.hint || "";
    updateVerdict();
    updatePrompt();
  }

  function updateVerdict() {
    const reasons = [];
    let level = "ok";
    let label = "可手工绞制（建议试点）";
    const hardForms = new Set(["duoguan", "panlong", "zhuanxin", "baoyue", "gualeng"]);

    if (state.colorCount >= 4) {
      reasons.push("四色泥同步控制难度高，建议先做双色或三色试验片。");
      level = "warn";
      label = "需简化后再手工";
    }
    if (state.density > 78) {
      reasons.push("纹路过密，手工编织易碎裂；可降密度或改 3D 多通道挤出。");
      level = level === "ok" ? "hard" : level;
      label = "偏 3D / 需降密";
    }
    if (hardForms.has(state.vessel)) {
      reasons.push(`「${vesselName()}」附件/异形较多，绞胎成型与粘接要求高，建议先做简化素胎验证。`);
      if (level === "ok") {
        level = "warn";
        label = "器型偏难，建议分段";
      }
    }
    if (state.vessel === "meiping" && state.rim > 70) {
      reasons.push("梅瓶口沿过大，会削弱经典小口丰肩识别度。");
    }
    if (state.sharpness > 88 && state.density > 70) {
      reasons.push("锐利细线 + 高密度，接近不可手工实现。");
      level = "no";
      label = "不可实现（当前参数）";
    }
    if (reasons.length === 0) {
      reasons.push(`瓶型「${vesselName()}」轮廓清晰，适合作为绞胎文创传播样张。`);
      reasons.push("建议同时导出「瓷器器型」与「截面证明」，给匠人核对表里连续性。");
    }

    const badge = $("verdictBadge");
    badge.className = `verdict-badge ${level}`;
    badge.textContent = label;
    $("verdictList").innerHTML = reasons.map((r) => `<li>${r}</li>`).join("");
  }

  function updatePrompt() {
    const colors = getColors()
      .map((c) => `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`)
      .join(" / ");
    const style = styleNames[state.style];
    const vessel = vesselName();
    const zh = [
      `当阳峪绞胎瓷产品设计图，传统瓶型：${vessel}，纹样：${style}，`,
      `腹径 ${state.belly}、口沿 ${state.rim}、足高 ${state.foot}，`,
      `泥色 ${colors}，绞扭 ${state.twist}，密度 ${state.density}，`,
      `表里如一绞泥胎体（非表面彩绘），柔和窑光产品摄影，深色工作室背景，`,
      `无文字无水印无Logo。种子 ${state.seed}。供匠人筛选可成型性。`,
    ].join("");
    const en = [
      `Dangyangyu jiaotai porcelain, classic Chinese ${state.vessel} vase form (${vessel}) with ${state.style} through-body marbled clay,`,
      `belly ${state.belly}, rim ${state.rim}, foot ${state.foot}, colors ${colors},`,
      `not painted glaze, kiln product lighting, dark studio, no text, seed ${state.seed}.`,
    ].join(" ");
    $("promptOut").value = `【中文】\n${zh}\n\n【English】\n${en}`;
  }

  function syncInputsFromState() {
    ["seed", "twist", "density", "sharpness", "colorCount", "belly", "rim", "foot", "sheen"].forEach((k) => {
      $(k).value = state[k];
    });
    $("twistVal").textContent = state.twist;
    $("densityVal").textContent = state.density;
    $("sharpVal").textContent = state.sharpness;
    $("colorCountVal").textContent = state.colorCount;
    $("bellyVal").textContent = state.belly;
    $("rimVal").textContent = state.rim;
    $("footVal").textContent = state.foot;
    $("sheenVal").textContent = state.sheen;
  }

  function readStateFromInputs() {
    state.seed = Number($("seed").value) || 1;
    state.twist = Number($("twist").value);
    state.density = Number($("density").value);
    state.sharpness = Number($("sharpness").value);
    state.colorCount = Number($("colorCount").value);
    state.belly = Number($("belly").value);
    state.rim = Number($("rim").value);
    state.foot = Number($("foot").value);
    state.sheen = Number($("sheen").value);
    syncInputsFromState();
  }

  function drawThumb(c, id) {
    const g = c.getContext("2d");
    const w = c.width;
    const h = c.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,0.03)";
    g.fillRect(0, 0, w, h);
    const top = 4;
    const bot = h - 4;
    const cx = w / 2;
    const scale = w * 0.9;
    const steps = 64;
    g.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r =
        (vesselRadius(Math.max(0, t - 0.01), id, 0.68, 0.48, 0.14) +
          vesselRadius(t, id, 0.68, 0.48, 0.14) * 2 +
          vesselRadius(Math.min(1, t + 0.01), id, 0.68, 0.48, 0.14)) /
        4 *
        scale;
      const yy = top + (bot - top) * t;
      if (i === 0) g.moveTo(cx + r, yy);
      else g.lineTo(cx + r, yy);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const r =
        (vesselRadius(Math.max(0, t - 0.01), id, 0.68, 0.48, 0.14) +
          vesselRadius(t, id, 0.68, 0.48, 0.14) * 2 +
          vesselRadius(Math.min(1, t + 0.01), id, 0.68, 0.48, 0.14)) /
        4 *
        scale;
      const yy = top + (bot - top) * t;
      g.lineTo(cx - r, yy);
    }
    g.closePath();
    g.fillStyle = "#d9e3d7";
    g.fill();
    g.strokeStyle = "rgba(61,90,72,0.35)";
    g.lineWidth = 1.25;
    g.lineJoin = "round";
    g.lineCap = "round";
    g.stroke();
  }

  function buildVesselGrid() {
    const grid = $("vesselGrid");
    grid.innerHTML = "";
    VESSELS.forEach((v) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vessel-cell" + (v.id === state.vessel ? " active" : "");
      btn.dataset.vessel = v.id;
      btn.setAttribute("role", "option");
      btn.title = `${v.name} · ${v.hint}`;
      const thumb = document.createElement("canvas");
      thumb.width = 72;
      thumb.height = 88;
      drawThumb(thumb, v.id);
      const label = document.createElement("span");
      label.textContent = v.name;
      btn.appendChild(thumb);
      btn.appendChild(label);
      btn.addEventListener("click", () => {
        state.vessel = v.id;
        grid.querySelectorAll(".vessel-cell").forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
      grid.appendChild(btn);
    });
  }

  document.querySelectorAll("#styleChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#styleChips .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.style = chip.dataset.style;
      render();
    });
  });

  document.querySelectorAll(".view-toggle .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".view-toggle .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.view = chip.dataset.view;
      render();
    });
  });

  [
    "twist", "density", "sharpness", "colorCount",
    "c1", "c2", "c3", "c4", "seed",
    "belly", "rim", "foot", "sheen",
  ].forEach((id) => {
    $(id).addEventListener("input", () => {
      readStateFromInputs();
      clearTimeout(window.__genTimer);
      window.__genTimer = setTimeout(render, 50);
    });
  });

  let lastAiAt = 0;
  function generateAiImage() {
    readStateFromInputs();
    const panel = $("aiPanel");
    const img = $("aiImage");
    const status = $("aiStatus");
    const btn = $("btnAiGen");
    const wait = 45000 - (Date.now() - lastAiAt);
    if (lastAiAt && wait > 0) {
      panel.hidden = false;
      status.textContent = `免费额度冷却中，约 ${Math.ceil(wait / 1000)} 秒后再试`;
      return;
    }
    const colors = getColors()
      .map((c) => `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`)
      .join(", ");
    const prompt = [
      "Original product photo of Dangyangyu jiaotai porcelain,",
      `${vesselNames[state.vessel] || state.vessel} vase, through-body ${styleNames[state.style]} marbled clay,`,
      `colors ${colors}, twist ${state.twist}, density ${state.density},`,
      "thin clear glaze, dark studio backdrop, ceramic product photography,",
      "not painted decoration, no text no logo, square composition",
    ].join(" ");
    const seed = state.seed % 1000000;
    const url =
      "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(prompt) +
      `?width=768&height=768&seed=${seed}&nologo=true&enhance=true&referrer=jiaotai-pattern-generator`;
    panel.hidden = false;
    status.textContent = "正在生成…";
    btn.disabled = true;
    const token = String(Date.now());
    img.dataset.token = token;
    img.onload = () => {
      if (img.dataset.token !== token) return;
      status.textContent = `AI 样张完成 · 种子 ${seed}`;
      btn.disabled = false;
      lastAiAt = Date.now();
    };
    img.onerror = () => {
      if (img.dataset.token !== token) return;
      status.textContent = "生成失败或限流，请 45 秒后重试";
      btn.disabled = false;
    };
    img.src = url;
  }

  $("btnGenerate").addEventListener("click", () => {
    readStateFromInputs();
    state.seed = (state.seed + Math.floor(mulberry32(state.seed)() * 9973) + 17) % 100000000;
    $("seed").value = state.seed;
    render();
  });
  $("btnAiGen").addEventListener("click", generateAiImage);

  $("btnRandomSeed").addEventListener("click", () => {
    state.seed = Math.floor(Math.random() * 1e8);
    $("seed").value = state.seed;
    render();
  });

  $("btnExport").addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = `jiaotai-${state.vessel}-${state.style}-${state.seed}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  });

  $("btnCopyPrompt").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("promptOut").value);
      $("btnCopyPrompt").textContent = "已复制";
      setTimeout(() => ($("btnCopyPrompt").textContent = "复制提示词"), 1200);
    } catch {
      $("promptOut").select();
      document.execCommand("copy");
    }
  });

  $("btnRefreshPrompt").addEventListener("click", updatePrompt);

  const variantsGrid = $("variantsGrid");
  function ensureEmptyHint() {
    if (!variantsGrid.querySelector(".variant")) {
      variantsGrid.innerHTML = `<div class="empty-hint">还没有对照样张。生成后点「收入对照」，开会时按瓶型给匠人勾选。</div>`;
    }
  }

  $("btnSaveVariant").addEventListener("click", () => {
    const empty = variantsGrid.querySelector(".empty-hint");
    if (empty) empty.remove();
    const card = document.createElement("article");
    card.className = "variant";
    card.innerHTML = `
      <img src="${canvas.toDataURL("image/png")}" alt="瓶型设计样张" />
      <div class="meta">
        <div>${vesselName()} · ${styleNames[state.style]} · ${state.seed}</div>
        <select aria-label="匠人筛选">
          <option value="hand">能手工绞</option>
          <option value="simplify">需简化</option>
          <option value="print3d">仅 3D</option>
          <option value="no">不可实现</option>
        </select>
        <button type="button" class="remove">移除</button>
      </div>
    `;
    card.querySelector(".remove").addEventListener("click", () => {
      card.remove();
      ensureEmptyHint();
    });
    variantsGrid.prepend(card);
  });

  ensureEmptyHint();
  buildVesselGrid();
  syncInputsFromState();
  render();
})();
