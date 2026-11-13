(() => {
  const STORAGE_KEY = "jiaotai_journey_v1";

  const STEPS = [
    { id: "soil", no: "01", file: "01-soil.html", title: "选土", verb: "采选泥脉", desc: "点选土源，为自己的君子瓷定下第一道底子。", tip: "研学现场多用已炼泥；这里记录你的原料偏好。" },
    { id: "refine", no: "02", file: "02-refine.html", title: "炼泥调色", verb: "揉出配色", desc: "把泥色拖进炼泥台，揉成你的专属色泥。", tip: "双色起步最稳；色差适中才易读纹。" },
    { id: "twist", no: "03", file: "03-twist.html", title: "绞泥编花", verb: "绞转成纹", desc: "滑动绞盘，让纹样从胎里长出来。", tip: "纹不在表面，而在胎骨之中。" },
    { id: "vessel", no: "04", file: "04-vessel.html", title: "选定器型", verb: "择形立器", desc: "从图文库挑选瓶型，微调腹径与口沿。", tip: "入门稳形优先；异形适合观赏。" },
    { id: "form", no: "05", file: "05-form.html", title: "成型修胎", verb: "塑形修坯", desc: "选定成型路径，感受不同手感与风险。", tip: "短课多用泥片；深度营可拉坯。" },
    { id: "dry", no: "06", file: "06-dry.html", title: "荫干打磨", verb: "静候干成", desc: "推动荫干进度，学会慢，才能不裂。", tip: "急干是开裂高发区。" },
    { id: "glaze", no: "07", file: "07-glaze.html", title: "施釉方案", verb: "薄釉显纹", desc: "点按施釉，让透明釉护纹而不盖纹。", tip: "君子瓷优先薄透明釉。" },
    { id: "fire", no: "08", file: "08-fire.html", title: "焙烧曲线", verb: "窑火考验", desc: "拨动窑温曲线，预演烧成风险。", tip: "真实烧窑仍由窑工执行。" },
    { id: "finish", no: "09", file: "09-finish.html", title: "出窑成瓷", verb: "开匣见瓷", desc: "生成唯一档案号与可带走的原创工艺卡。", tip: "数字预演增强现场，不替代窑火。" },
  ];

  const SOILS = [
    { id: "taihang", name: "太行矸石系", note: "骨感硬朗", hue: "#6b5a4a", form: "chunk" },
    { id: "local-kaolin", name: "本地高岭土", note: "细腻温润", hue: "#f0e6d4", form: "soft" },
    { id: "mix", name: "高岭+皂土", note: "可塑性好", hue: "#a89070", form: "swirl" },
  ];
  const TWISTS = [
    { id: "feather", name: "鸟羽纹", note: "经典识别度高", motif: "feather" },
    { id: "weave", name: "编织纹", note: "席编演示友好", motif: "weave" },
    { id: "marble", name: "大理石绞", note: "自然流纹", motif: "marble" },
    { id: "ribbon", name: "带状绞", note: "条带节奏", motif: "ribbon" },
  ];
  const FORMS = [
    { id: "slab", name: "泥片编贴", note: "短课首选", motif: "slab" },
    { id: "wheel", name: "拉坯成型", note: "完整体验", motif: "wheel" },
    { id: "hybrid", name: "绞片+修坯", note: "平衡成功率", motif: "hybrid" },
  ];
  const DRYS = [
    { id: "slow", name: "慢荫干", note: "4–5 天+", motif: "slow" },
    { id: "standard", name: "常规荫干", note: "工坊节奏", motif: "standard" },
    { id: "controlled", name: "控湿分段", note: "精细异形", motif: "controlled" },
  ];
  const GLAZES = [
    { id: "clear-thin", name: "薄透明釉", note: "护纹显纹", motif: "thin" },
    { id: "clear", name: "全器透明釉", note: "光泽更强", motif: "full" },
    { id: "none", name: "无釉素胎", note: "泥色本色", motif: "bisque" },
  ];
  const FIRES = [
    { id: "classic", name: "经典高温", note: "1340–1360℃", motif: "hot" },
    { id: "hold", name: "中温保温", note: "降急升风险", motif: "hold" },
    { id: "slow-cool", name: "缓冷优先", note: "降温更稳", motif: "cool" },
  ];

  const DEFAULTS = {
    author: "",
    wish: "",
    soil: "mix",
    colorCount: 2,
    c1: "#2a2a2a",
    c2: "#e8dcc8",
    c3: "#6b8f71",
    twist: "feather",
    density: 46,
    strength: 52,
    vessel: "meiping",
    belly: 340,
    rim: 230,
    form: "hybrid",
    dry: "slow",
    glaze: "clear-thin",
    fire: "hold",
    seed: Date.now() % 100000000,
    dryProgress: 0,
    fireTemp: 60,
    fireProgress: 0,
    fireDone: false,
    cleared: {},
    marks: [],
  };

function cloneState(base) {
  return {
    ...base,
    cleared: { ...(base.cleared || {}) },
    marks: Array.isArray(base.marks) ? base.marks.slice() : [],
  };
}

function freshState() {
  return cloneState({ ...DEFAULTS, seed: Date.now() % 100000000 });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    return cloneState({ ...DEFAULTS, ...JSON.parse(raw) });
  } catch {
    return freshState();
  }
}

function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
  return freshState();
}

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }

  function labelOf(list, id) {
    return list.find((x) => x.id === id)?.name || id;
  }

  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
  }

  function dossierId(state) {
    const payload = JSON.stringify({
      author: state.author.trim() || "匿名创作者",
      wish: state.wish.trim(),
      soil: state.soil,
      colors: [state.c1, state.c2, state.c3].slice(0, state.colorCount),
      twist: state.twist,
      density: state.density,
      strength: state.strength,
      vessel: state.vessel,
      belly: state.belly,
      rim: state.rim,
      form: state.form,
      dry: state.dry,
      glaze: state.glaze,
      fire: state.fire,
      seed: state.seed,
    });
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `DY-${day}-${hashStr(payload).slice(0, 8)}`;
  }

  function originalityScore(state) {
    let s = 40;
    s += state.colorCount * 8;
    s += Math.abs(state.density - 45) > 20 ? 8 : 4;
    s += ["duoguan", "zhuanxin", "baoyue", "panlong"].includes(state.vessel) ? 12 : 6;
    s += state.wish.trim().length > 8 ? 10 : 4;
    return Math.min(98, s);
  }

  function vesselName(state) {
    const list = window.JIAOTAI_VESSELS || [];
    return list.find((v) => v.id === state.vessel)?.name || state.vessel;
  }

  function hexToRgb(hex) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function hash2(x, y, seed) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453;
    return n - Math.floor(n);
  }

  function fbm(x, y, seed) {
    let v = 0,
      a = 0.5,
      f = 1;
    for (let i = 0; i < 4; i++) {
      const x0 = Math.floor(x * f),
        y0 = Math.floor(y * f);
      const fx = x * f - x0,
        fy = y * f - y0;
      const ux = fx * fx * (3 - 2 * fx),
        uy = fy * fy * (3 - 2 * fy);
      const aa = hash2(x0, y0, seed + i);
      const bb = hash2(x0 + 1, y0, seed + i);
      const cc = hash2(x0, y0 + 1, seed + i);
      const dd = hash2(x0 + 1, y0 + 1, seed + i);
      v += a * (aa + (bb - aa) * ux + (cc - aa) * uy + (aa - bb - cc + dd) * ux * uy);
      a *= 0.5;
      f *= 2;
    }
    return v;
  }

  function patternAt(state, nx, ny) {
    const dens = 0.8 + state.density / 40;
    const tw = state.strength / 100;
    let x = nx + (fbm(nx * dens, ny * dens, state.seed) - 0.5) * tw * 1.2;
    let y = ny + (fbm(nx * dens + 3.1, ny * dens + 1.7, state.seed + 9) - 0.5) * tw * 1.2;
    if (state.twist === "feather") {
      const ang = Math.atan2(y - 0.5, x - 0.5);
      const r = Math.hypot(x - 0.5, y - 0.5);
      return (Math.sin(r * dens * 26 + Math.sin(ang * 6) * 2) * 0.55 + Math.sin((ang + r * 3) * dens * 16) * 0.45 + 1) / 2;
    }
    if (state.twist === "weave") {
      const cell = dens * 10,
        u = x * cell,
        v = y * cell;
      const iu = Math.floor(u),
        iv = Math.floor(v),
        fu = u - iu,
        fv = v - iv;
      const parity = (iu + iv) % 2 === 0;
      const bar = parity ? Math.abs(fu - 0.5) * 2 : Math.abs(fv - 0.5) * 2;
      return (1 - bar) * 0.65 + (Math.sin((parity ? fv : fu) * Math.PI * 8) * 0.5 + 0.5) * 0.35;
    }
    if (state.twist === "ribbon") {
      return (
        (Math.sin((x * 2 + y) * dens * 14 + fbm(x * 3, y * 3, state.seed) * 5) * 0.7 +
          Math.sin((y - x) * dens * 18) * 0.3 +
          1) /
        2
      );
    }
    return (
      (Math.sin((x + fbm(x * 2, y * 2, state.seed) * tw) * dens * 15) *
        Math.cos((y + fbm(x * 2.2, y * 1.6, state.seed + 3) * tw) * dens * 12) +
        1) /
      2
    );
  }

  function pick(t, colors) {
    const x = (((t % 1) + 1) % 1) * (colors.length - 1);
    const i = Math.floor(x),
      f = x - i;
    const a = colors[i],
      b = colors[Math.min(i + 1, colors.length - 1)];
    const ff = Math.pow(f, 1.1);
    return {
      r: a.r + (b.r - a.r) * ff,
      g: a.g + (b.g - a.g) * ff,
      b: a.b + (b.b - a.b) * ff,
    };
  }

  function drawPreview(canvas, state, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width,
      h = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2b2925");
    g.addColorStop(1, "#0d0c0b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const radiusFn = window.jiaotaiVesselRadius;
    if (!radiusFn) return;

    const colors = [state.c1, state.c2, state.c3].slice(0, state.colorCount).map(hexToRgb);
    const img = ctx.createImageData(w, h);
    const cx = w * 0.5,
      top = h * 0.1,
      bot = h * 0.9,
      scale = w * 0.92;
    const feather = 3.0;
    const glazeBoost = state.glaze === "none" ? 0.92 : state.glaze === "clear" ? 1.08 : 1.02;
    const dryFade = 0.85 + (Number(state.dryProgress) || 0) / 100 * 0.15;

    for (let y = 0; y < h; y++) {
      const t = (y - top) / (bot - top);
      if (t < -0.02 || t > 1.02) continue;
      const tc = Math.max(0, Math.min(1, t));
      const r = radiusFn(tc, state.vessel, state.belly / 500, state.rim / 500, 0.14) * scale;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dist = r - Math.abs(dx);
        let a = Math.max(0, Math.min(1, (dist + feather) / (feather * 1.8)));
        a *= Math.max(0, Math.min(1, (t + 0.02) / 0.04)) * Math.max(0, Math.min(1, (1.02 - t) / 0.04));
        if (a <= 0.02) continue;
        const xn = Math.max(-1, Math.min(1, dx / Math.max(r, 1)));
        const u = 0.5 + Math.asin(xn) / Math.PI;
        const pv = patternAt(state, u, tc);
        const c = pick(pv, colors);
        let shade =
          0.62 +
          0.38 * Math.sqrt(Math.max(0, 1 - xn * xn)) +
          Math.exp(-Math.pow((xn + 0.2) / 0.4, 2)) * 0.12;
        shade *= glazeBoost * dryFade;
        if (opts.fireGlow) {
          shade += (Number(state.fireTemp) || 0) / 100 * 0.08;
        }
        const i = (y * w + x) * 4;
        const bg = 20;
        img.data[i] = c.r * shade * a + bg * (1 - a);
        img.data[i + 1] = c.g * shade * a + bg * (1 - a);
        img.data[i + 2] = c.b * shade * a + bg * (1 - a);
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function addMark(state, mark) {
    const marks = Array.isArray(state.marks) ? state.marks.slice() : [];
    if (!marks.includes(mark)) marks.push(mark);
    state.marks = marks;
    return state;
  }

  function stepIndex(id) {
    return STEPS.findIndex((s) => s.id === id);
  }

  function prevFile(id) {
    const i = stepIndex(id);
    return i > 0 ? STEPS[i - 1].file : null;
  }

  function nextFile(id) {
    const i = stepIndex(id);
    return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1].file : null;
  }

  window.JiaotaiJourney = {
    STEPS,
    SOILS,
    TWISTS,
    FORMS,
    DRYS,
    GLAZES,
    FIRES,
    loadState,
    saveState,
    resetState,
    labelOf,
    dossierId,
    originalityScore,
    vesselName,
    drawPreview,
    addMark,
    prevFile,
    nextFile,
    stepIndex,
  };
})();
