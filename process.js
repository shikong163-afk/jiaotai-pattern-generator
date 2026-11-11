(() => {
  const STEPS = [
    {
      id: "soil",
      title: "选土",
      desc: "先定原料气质。不同土源决定胎骨与发色底子，是原创的第一笔。",
      tip: "研学现场通常由工坊提供已炼好的泥；这里记录你的原料偏好，形成个性化工艺说明。",
    },
    {
      id: "refine",
      title: "炼泥调色",
      desc: "把土炼成可塑瓷泥，并调出属于你的色泥组合。色数越少越好控，越多越难烧。",
      tip: "建议双色起步。色差太近，纹路发糊；色差太极端，收缩差更容易裂。",
    },
    {
      id: "twist",
      title: "绞泥编花",
      desc: "纹样不是画上去的，而是编进胎里。选定技法与密度，生成你的原创纹路种子。",
      tip: "这一步决定“表里如一”的可读性。过高密度往往只适合数字预演或 3D，不宜直接强求手工。",
    },
    {
      id: "vessel",
      title: "选定器型",
      desc: "从分类图文库中选主器（容量上限 500），并微调腹径与口沿，形成个人器型方案。",
      tip: "从「入门稳形」起步；异形观赏器适合展示，研学短课优先梅瓶、玉壶春、胆瓶。",
    },
    {
      id: "form",
      title: "成型修胎",
      desc: "确定成型方式与修坯重点。同一纹样，不同成型路径，手感与成品风险完全不同。",
      tip: "研学短课多用泥片贴合/简化成型；完整拉坯更适合深度营。",
    },
    {
      id: "dry",
      title: "荫干打磨",
      desc: "慢干才能稳住多色泥。选择荫干节奏与打磨程度，写入你的工艺卡。",
      tip: "干得太快是开裂高发区。工艺卡会明确提醒：不可暴晒急干。",
    },
    {
      id: "glaze",
      title: "施釉方案",
      desc: "釉会改变最终观感，但不该盖住绞胎本身。选透明、薄釉或无釉，让纹路说话。",
      tip: "想突出“君子瓷”表里逻辑，优先薄透明釉或局部留白。",
    },
    {
      id: "fire",
      title: "焙烧曲线",
      desc: "烧成是风险最高的一段。这里只做个性化曲线偏好记录，真实烧制仍由窑工执行。",
      tip: "多色泥收缩不一致时，保温与缓冷比盲目追高温更重要。",
    },
    {
      id: "finish",
      title: "出窑成瓷",
      desc: "生成你的原创工艺档案：唯一档案号、全程选择、成瓷预览与可带走的设计说明。",
      tip: "现场仍可上手绞泥；本页产物是个性化预演与传播出口，不替代烧窑乐趣。",
    },
  ];

  const SOILS = [
    { id: "taihang", name: "太行矸石系", note: "骨感硬朗，适合沉稳双色" },
    { id: "local-kaolin", name: "本地高岭土", note: "细腻温润，适合鸟羽/编织" },
    { id: "mix", name: "高岭+皂土复配", note: "可塑性更好，研学友好" },
  ];

  const TWISTS = [
    { id: "feather", name: "鸟羽纹", note: "羽毛状排列，经典识别度高" },
    { id: "weave", name: "编织纹", note: "席编感，工坊演示友好" },
    { id: "marble", name: "大理石绞", note: "自然流纹，容错较高" },
    { id: "ribbon", name: "带状绞", note: "条带节奏，适合长器" },
  ];

  const FORMS = [
    { id: "slab", name: "泥片编贴成型", note: "研学短课首选" },
    { id: "wheel", name: "拉坯成型", note: "完整体验/深度营" },
    { id: "hybrid", name: "绞片+简易修坯", note: "平衡趣味与成功率" },
  ];

  const DRYS = [
    { id: "slow", name: "慢荫干 4–5 天+", note: "稳妥，适合多色泥" },
    { id: "standard", name: "常规荫干", note: "工坊常见节奏" },
    { id: "controlled", name: "控湿分段干", note: "精细件/异形件" },
  ];

  const GLAZES = [
    { id: "clear-thin", name: "薄透明釉", note: "护纹显纹，推荐" },
    { id: "clear", name: "全器透明釉", note: "光泽更强" },
    { id: "none", name: "无釉素胎感", note: "强调泥色本身" },
  ];

  const FIRES = [
    { id: "classic", name: "经典高温曲线", note: "约 1340–1360℃ 偏好" },
    { id: "hold", name: "中温保温加强", note: "降低急升开裂风险" },
    { id: "slow-cool", name: "缓冷优先", note: "强调降温稳定性" },
  ];

  const state = {
    step: 0,
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
  };

  const $ = (id) => document.getElementById(id);
  const vessels = window.JIAOTAI_VESSELS || [];
  const vesselRadius = window.jiaotaiVesselRadius;
  const vesselName = () => vessels.find((v) => v.id === state.vessel)?.name || state.vessel;

  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
  }

  function dossierId() {
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

  function originalityScore() {
    // 组合复杂度，不是质量分数
    let s = 40;
    s += state.colorCount * 8;
    s += Math.abs(state.density - 45) > 20 ? 8 : 4;
    s += ["duoguan", "zhuanxin", "baoyue", "panlong"].includes(state.vessel) ? 12 : 6;
    s += state.wish.trim().length > 8 ? 10 : 4;
    return Math.min(98, s);
  }

  function buildNav() {
    const nav = $("stepNav");
    nav.innerHTML = "";
    STEPS.forEach((step, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "step-dot" + (i === state.step ? " active" : "") + (i < state.step ? " done" : "");
      b.textContent = `${i + 1}.${step.title}`;
      b.addEventListener("click", () => {
        state.step = i;
        render();
      });
      nav.appendChild(b);
    });
  }

  function choiceGrid(list, key) {
    return `<div class="choice-grid">${list
      .map(
        (item) => `<button type="button" class="choice ${state[key] === item.id ? "active" : ""}" data-key="${key}" data-id="${item.id}">
        <strong>${item.name}</strong><span>${item.note}</span>
      </button>`
      )
      .join("")}</div>`;
  }

  function renderBody() {
    const step = STEPS[state.step];
    const body = $("stepBody");
    if (step.id === "soil") {
      body.innerHTML = `
        <div class="field"><label>你的署名（写入原创工艺卡）</label>
          <input type="text" id="author" maxlength="20" placeholder="例如：控 / 研学一团-小周" value="${state.author}" />
        </div>
        <div class="field"><label>一句个性化心愿（绝对原创叙述）</label>
          <textarea id="wish" maxlength="80" placeholder="例如：想做一件能送给外婆的、纹路像山风的梅瓶">${state.wish}</textarea>
        </div>
        ${choiceGrid(SOILS, "soil")}
        <div class="tip">${step.tip}</div>`;
    } else if (step.id === "refine") {
      body.innerHTML = `
        <div class="field"><label>启用色数：<span id="colorCountVal">${state.colorCount}</span></label>
          <input type="range" id="colorCount" min="2" max="3" value="${state.colorCount}" />
        </div>
        <div class="colors">
          <label class="color-item"><span>泥色1</span><input type="color" id="c1" value="${state.c1}" /></label>
          <label class="color-item"><span>泥色2</span><input type="color" id="c2" value="${state.c2}" /></label>
          <label class="color-item"><span>泥色3</span><input type="color" id="c3" value="${state.c3}" /></label>
        </div>
        <div class="tip">${step.tip}</div>`;
    } else if (step.id === "twist") {
      body.innerHTML = `
        ${choiceGrid(TWISTS, "twist")}
        <div class="field"><label>绞扭强度 <span id="strengthVal">${state.strength}</span></label>
          <input type="range" id="strength" min="20" max="90" value="${state.strength}" />
        </div>
        <div class="field"><label>纹路密度 <span id="densityVal">${state.density}</span></label>
          <input type="range" id="density" min="20" max="90" value="${state.density}" />
        </div>
        <div class="field"><label>纹样种子（保证可复现的原创编号）</label>
          <input type="number" id="seed" value="${state.seed}" />
        </div>
        <div class="tip">${step.tip}</div>`;
    } else if (step.id === "vessel") {
      body.innerHTML = `
        <div id="vesselPicker" class="process-vessel-picker" aria-label="绞胎瓷器型分类选型"></div>
        <input type="hidden" id="vessel" value="${state.vessel}" />
        <div class="field"><label>腹径 <span id="bellyVal">${state.belly}</span></label>
          <input type="range" id="belly" min="0" max="500" value="${state.belly}" />
        </div>
        <div class="field"><label>口沿 <span id="rimVal">${state.rim}</span></label>
          <input type="range" id="rim" min="0" max="500" value="${state.rim}" />
        </div>
        <div class="tip">${step.tip}</div>`;
    } else if (step.id === "form") {
      body.innerHTML = `${choiceGrid(FORMS, "form")}<div class="tip">${step.tip}</div>`;
    } else if (step.id === "dry") {
      body.innerHTML = `${choiceGrid(DRYS, "dry")}<div class="tip">${step.tip}</div>`;
    } else if (step.id === "glaze") {
      body.innerHTML = `${choiceGrid(GLAZES, "glaze")}<div class="tip">${step.tip}</div>`;
    } else if (step.id === "fire") {
      body.innerHTML = `${choiceGrid(FIRES, "fire")}<div class="tip">${step.tip}</div>`;
    } else {
      const id = dossierId();
      body.innerHTML = `
        <div class="tip"><strong>你的原创工艺档案已生成。</strong><br/>
        档案号 <code>${id}</code> 由你的全部选择与纹样种子哈希而成，他人无法通过简单复制得到同一编号。<br/>
        原创指数（组合独特性）：${originalityScore()} / 100</div>
        <div class="tip">建议带走：工艺卡 PNG + 现场简化绞泥体验。烧窑与成品仍以工坊实操为准。</div>`;
    }
    bindBodyEvents();
    if (step.id === "vessel" && window.JiaotaiVesselUI) {
      window.JiaotaiVesselUI.mountVesselPicker($("vesselPicker"), {
        selectedId: state.vessel,
        onSelect: (v) => {
          state.vessel = v.id;
          const hidden = $("vessel");
          if (hidden) hidden.value = v.id;
          updateSide();
          drawPreview();
          $("liveId").textContent = `档案号预览：${dossierId()}`;
        },
      });
    }
  }

  function bindBodyEvents() {
    document.querySelectorAll(".choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        state[btn.dataset.key] = btn.dataset.id;
        if (btn.dataset.key === "twist") state.seed = (state.seed + 137) % 100000000;
        render();
      });
    });
    ["author", "wish", "colorCount", "c1", "c2", "c3", "strength", "density", "seed", "vessel", "belly", "rim"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        if (id === "author" || id === "wish") state[id] = el.value;
        else if (id === "c1" || id === "c2" || id === "c3" || id === "vessel") state[id] = el.value;
        else state[id] = Number(el.value);
        if (["strength", "density", "colorCount", "belly", "rim"].includes(id)) {
          const map = { strength: "strengthVal", density: "densityVal", colorCount: "colorCountVal", belly: "bellyVal", rim: "rimVal" };
          const lab = document.getElementById(map[id]);
          if (lab) lab.textContent = state[id];
        }
        updateSide();
        drawPreview();
        $("liveId").textContent = `档案号预览：${dossierId()}`;
      });
    });
  }

  function labelOf(list, id) {
    return list.find((x) => x.id === id)?.name || id;
  }

  function updateSide() {
    const id = dossierId();
    $("liveId").textContent = `档案号预览：${id}`;
    $("dossier").innerHTML = `
      <h3>个性化工艺档案</h3>
      <dl>
        <div><dt>创作者</dt><dd>${state.author.trim() || "未署名（可补）"}</dd></div>
        <div><dt>心愿</dt><dd>${state.wish.trim() || "未填写"}</dd></div>
        <div><dt>选土</dt><dd>${labelOf(SOILS, state.soil)}</dd></div>
        <div><dt>色泥</dt><dd>${state.colorCount} 色 · ${[state.c1, state.c2, state.c3].slice(0, state.colorCount).join(" / ")}</dd></div>
        <div><dt>编花</dt><dd>${labelOf(TWISTS, state.twist)} · 密度 ${state.density} · 种子 ${state.seed}</dd></div>
        <div><dt>器型</dt><dd>${vesselName()} · 腹 ${state.belly} / 口 ${state.rim}</dd></div>
        <div><dt>成型</dt><dd>${labelOf(FORMS, state.form)}</dd></div>
        <div><dt>荫干</dt><dd>${labelOf(DRYS, state.dry)}</dd></div>
        <div><dt>施釉</dt><dd>${labelOf(GLAZES, state.glaze)}</dd></div>
        <div><dt>焙烧</dt><dd>${labelOf(FIRES, state.fire)}</dd></div>
        <div><dt>档案号</dt><dd>${id}</dd></div>
      </dl>`;
    $("btnExportCard").disabled = state.step < 3;
    $("previewCap").textContent = `${labelOf(TWISTS, state.twist)} · ${vesselName()} · ${id}`;
  }

  // --- lightweight pattern + vessel preview (original per seed) ---
  function hash2(x, y, seed) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453;
    return n - Math.floor(n);
  }
  function fbm(x, y, seed) {
    let v = 0, a = 0.5, f = 1;
    for (let i = 0; i < 4; i++) {
      const x0 = Math.floor(x * f), y0 = Math.floor(y * f);
      const fx = x * f - x0, fy = y * f - y0;
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      const aa = hash2(x0, y0, seed + i);
      const bb = hash2(x0 + 1, y0, seed + i);
      const cc = hash2(x0, y0 + 1, seed + i);
      const dd = hash2(x0 + 1, y0 + 1, seed + i);
      v += a * (aa + (bb - aa) * ux + (cc - aa) * uy + (aa - bb - cc + dd) * ux * uy);
      a *= 0.5; f *= 2;
    }
    return v;
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function pick(t, colors) {
    const x = ((t % 1) + 1) % 1 * (colors.length - 1);
    const i = Math.floor(x), f = x - i;
    const a = colors[i], b = colors[Math.min(i + 1, colors.length - 1)];
    const ff = Math.pow(f, 1.1);
    return {
      r: a.r + (b.r - a.r) * ff,
      g: a.g + (b.g - a.g) * ff,
      b: a.b + (b.b - a.b) * ff,
    };
  }
  function patternAt(nx, ny) {
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
      const cell = dens * 10, u = x * cell, v = y * cell;
      const iu = Math.floor(u), iv = Math.floor(v), fu = u - iu, fv = v - iv;
      const parity = (iu + iv) % 2 === 0;
      const bar = parity ? Math.abs(fu - 0.5) * 2 : Math.abs(fv - 0.5) * 2;
      return (1 - bar) * 0.65 + (Math.sin((parity ? fv : fu) * Math.PI * 8) * 0.5 + 0.5) * 0.35;
    }
    if (state.twist === "ribbon") {
      return (Math.sin((x * 2 + y) * dens * 14 + fbm(x * 3, y * 3, state.seed) * 5) * 0.7 + Math.sin((y - x) * dens * 18) * 0.3 + 1) / 2;
    }
    return (Math.sin((x + fbm(x * 2, y * 2, state.seed) * tw) * dens * 15) * Math.cos((y + fbm(x * 2.2, y * 1.6, state.seed + 3) * tw) * dens * 12) + 1) / 2;
  }

  function drawPreview() {
    const canvas = $("preview");
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2b2925"); g.addColorStop(1, "#0d0c0b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    const colors = [state.c1, state.c2, state.c3].slice(0, state.colorCount).map(hexToRgb);
    const img = ctx.createImageData(w, h);
    const cx = w * 0.5, top = h * 0.1, bot = h * 0.9, scale = w * 0.92;
    const feather = 3.0;

    for (let y = 0; y < h; y++) {
      const t = (y - top) / (bot - top);
      if (t < -0.02 || t > 1.02) continue;
      const tc = Math.max(0, Math.min(1, t));
      const r =
        vesselRadius(tc, state.vessel, state.belly / 500, state.rim / 500, 0.14) * scale;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dist = r - Math.abs(dx);
        let a = Math.max(0, Math.min(1, (dist + feather) / (feather * 1.8)));
        a *= Math.max(0, Math.min(1, (t + 0.02) / 0.04)) * Math.max(0, Math.min(1, (1.02 - t) / 0.04));
        if (a <= 0.02) continue;
        const xn = Math.max(-1, Math.min(1, dx / Math.max(r, 1)));
        const u = 0.5 + Math.asin(xn) / Math.PI;
        const pv = patternAt(u, tc);
        const c = pick(pv, colors);
        const shade = 0.62 + 0.38 * Math.sqrt(Math.max(0, 1 - xn * xn)) + Math.exp(-Math.pow((xn + 0.2) / 0.4, 2)) * 0.12;
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

  function buildAiPrompt() {
    const twist = labelOf(TWISTS, state.twist);
    const vessel = vesselName();
    const colors = [state.c1, state.c2, state.c3].slice(0, state.colorCount).join(", ");
    const glaze =
      state.glaze === "none"
        ? "unglazed biscuit-like porcelain surface"
        : state.glaze === "clear-thin"
          ? "thin clear glaze highlighting clay veins"
          : "clear glossy glaze";
    // English prompt works more reliably on free public models
    return [
      "Original product photo of Dangyangyu jiaotai porcelain,",
      `${vessel} vase form, through-body marbled clay pattern (${twist}),`,
      `clay colors ${colors}, pattern density ${state.density}, twist ${state.strength},`,
      `${glaze}, tableware studio lighting, dark seamless backdrop,`,
      "not painted surface decoration, elegant ceramic craftsmanship,",
      "no text, no watermark, no logo, square composition",
      state.wish.trim() ? `, inspired by: ${state.wish.trim()}` : "",
    ].join(" ");
  }

  let lastAiAt = 0;
  let aiBusy = false;
  let aiGenSerial = 0;
  async function generateAiImage() {
    const img = $("aiImage");
    const frame = $("aiFrame");
    const status = $("aiStatus");
    const btn = $("btnAiGen");
    const placeholder = frame.querySelector(".ai-placeholder");

    if (aiBusy) {
      status.textContent = "上一张仍在生成中，请稍候…";
      return;
    }
    const wait = 2500 - (Date.now() - lastAiAt);
    if (lastAiAt && wait > 0) {
      status.textContent = `请稍候约 ${Math.ceil(wait / 1000)} 秒再生成`;
      return;
    }

    aiBusy = true;
    aiGenSerial += 1;
    const serial = aiGenSerial;
    const nonce = `p${serial}_${Date.now().toString(36)}`;
    const seed = (state.seed + serial * 97) % 1000000;
    const prompt = buildAiPrompt();

    frame.classList.add("loading");
    const prefer = window.JIAOTAI_AI_PREFER || "agnes";
    status.textContent =
      prefer === "agnes" ? "正在请求 Agnes…" : "正在请求备用生图模型…";
    btn.disabled = true;
    const badge = $("aiBadge");
    if (badge) badge.textContent = prefer === "agnes" ? "Agnes · 本机代理" : "Pollinations · 线上备用";
    if (placeholder) placeholder.hidden = true;
    img.dataset.token = String(serial);

    try {
      const result = await window.JiaotaiAI.generateJiaotaiImage(prompt, { seed, nonce });
      if (img.dataset.token !== String(serial)) return;
      await window.JiaotaiAI.applyImage(img, result);
      if (img.dataset.token !== String(serial)) return;
      img.hidden = false;
      frame.classList.remove("loading");
      const via =
        result.provider === "agnes"
          ? "Agnes Image 2.5"
          : `备用 Pollinations（原因：${result.fallbackFrom || "代理不可用"}）`;
      status.textContent = `已生成 · ${via} · 第 ${serial} 次 · 可继续改参数再生成`;
      lastAiAt = Date.now();
    } catch (e) {
      if (img.dataset.token !== String(serial)) return;
      frame.classList.remove("loading");
      status.textContent = `生成失败（${e?.code || e?.message || "error"}），可改参数后重试；程序化预览仍可用。`;
      if (placeholder) placeholder.hidden = false;
    } finally {
      if (img.dataset.token === String(serial)) {
        btn.disabled = false;
        aiBusy = false;
      }
    }
  }

  function exportCard() {
    const canvas = $("cardCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const id = dossierId();
    const padX = 72;
    const colors = [state.c1, state.c2, state.c3].slice(0, state.colorCount);

    // paper background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#f8f4ec");
    bg.addColorStop(1, "#efe8da");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // soft side grain
    ctx.fillStyle = "rgba(61,90,72,0.04)";
    for (let i = 0; i < 18; i++) {
      ctx.fillRect(0, 80 + i * 100, W, 2);
    }

    // header band
    ctx.fillStyle = "#3d5a48";
    ctx.fillRect(0, 0, W, 188);
    ctx.fillStyle = "rgba(247,243,235,0.12)";
    ctx.beginPath();
    ctx.arc(W - 80, 20, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f7f3eb";
    ctx.font = "700 52px Noto Serif SC, serif";
    ctx.fillText("绞胎原创工艺卡", padX, 88);
    ctx.font = "400 24px Source Sans 3, sans-serif";
    ctx.fillStyle = "rgba(247,243,235,0.82)";
    ctx.fillText("当阳峪 · 选土到出窑个性化方案", padX, 136);

    // archive badge
    const badgeY = 228;
    roundRect(ctx, padX, badgeY, W - padX * 2, 78, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "rgba(61,90,72,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#3d5a48";
    ctx.font = "600 22px Source Sans 3, sans-serif";
    ctx.fillText("档案号", padX + 28, badgeY + 32);
    ctx.font = "700 28px Source Sans 3, sans-serif";
    ctx.fillStyle = "#1c1a17";
    ctx.fillText(id, padX + 28, badgeY + 62);

    // identity block
    let y = 360;
    y = drawSectionTitle(ctx, "创作者信息", padX, y);
    y += 18;
    y = drawParamRow(ctx, "创作者", state.author.trim() || "匿名创作者", padX, y, W);
    y += 28;
    y = drawParamRow(
      ctx,
      "心愿",
      state.wish.trim() || "（未填写，可现场补写）",
      padX,
      y,
      W,
      true
    );

    // process params
    y += 44;
    y = drawSectionTitle(ctx, "全流程参数", padX, y);
    y += 22;

    const params = [
      ["选土", labelOf(SOILS, state.soil)],
      ["炼泥调色", `${state.colorCount} 色原创配色`],
      ["绞泥编花", `${labelOf(TWISTS, state.twist)}    密度 ${state.density}    绞力 ${state.strength}`],
      ["纹样种子", String(state.seed)],
      ["器型", `${vesselName()}    腹径 ${state.belly}    口沿 ${state.rim}`],
      ["成型", labelOf(FORMS, state.form)],
      ["荫干", labelOf(DRYS, state.dry)],
      ["施釉", labelOf(GLAZES, state.glaze)],
      ["焙烧偏好", labelOf(FIRES, state.fire)],
    ];

    params.forEach(([label, value], i) => {
      y = drawParamRow(ctx, label, value, padX, y, W);
      // color chips after 炼泥调色
      if (i === 1) {
        y += 14;
        colors.forEach((hex, ci) => {
          const cx = padX + 196 + ci * 54;
          ctx.beginPath();
          ctx.arc(cx, y - 18, 16, 0, Math.PI * 2);
          ctx.fillStyle = hex;
          ctx.fill();
          ctx.strokeStyle = "rgba(28,26,23,0.18)";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      y += 30; // breathing space between params
    });

    // preview panel
    y += 28;
    y = drawSectionTitle(ctx, "成瓷预览", padX, y);
    y += 24;

    const preview = $("preview");
    const previewSize = 460;
    const previewX = padX;
    const previewY = y;

    roundRect(ctx, previewX - 8, previewY - 8, previewSize + 16, previewSize + 16, 22);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.drawImage(preview, previewX, previewY, previewSize, previewSize);

    // right meta
    const metaX = previewX + previewSize + 48;
    let metaY = previewY + 36;
    ctx.fillStyle = "#3d5a48";
    ctx.font = "700 28px Noto Serif SC, serif";
    ctx.fillText("个性化数字样张", metaX, metaY);
    metaY += 52;
    ctx.fillStyle = "#5a554c";
    ctx.font = "400 22px Source Sans 3, sans-serif";
    [
      "表里如一 · 全流程定制",
      `${labelOf(TWISTS, state.twist)} · ${vesselName()}`,
      `组合独特性  ${originalityScore()} / 100`,
      "",
      "扫码继续体验：",
      "jiaotai-pattern-generator.pages.dev",
    ].forEach((line) => {
      if (line) ctx.fillText(line, metaX, metaY);
      metaY += 40;
    });

    // footer notes with spacing
    const footY = previewY + previewSize + 56;
    roundRect(ctx, padX, footY, W - padX * 2, 168, 18);
    ctx.fillStyle = "rgba(61,90,72,0.08)";
    ctx.fill();
    ctx.fillStyle = "#3d5a48";
    ctx.font = "700 22px Noto Serif SC, serif";
    ctx.fillText("使用说明", padX + 28, footY + 42);
    ctx.fillStyle = "#4a463e";
    ctx.font = "400 20px Source Sans 3, sans-serif";
    ctx.fillText("原创声明：本方案由个人选择生成，不复刻他人作品。", padX + 28, footY + 84);
    ctx.fillText("使用边界：用于研学预演与传播；真实烧制以工坊为准。", padX + 28, footY + 124);

    const a = document.createElement("a");
    a.download = `${id}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
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

  function drawSectionTitle(ctx, title, x, y) {
    ctx.fillStyle = "#3d5a48";
    ctx.fillRect(x, y - 18, 8, 28);
    ctx.font = "700 28px Noto Serif SC, serif";
    ctx.fillText(title, x + 22, y + 6);
    return y + 8;
  }

  function drawParamRow(ctx, label, value, x, y, W, multiline = false) {
    const labelW = 168;
    ctx.fillStyle = "#7a7368";
    ctx.font = "600 22px Source Sans 3, sans-serif";
    ctx.fillText(label, x, y);

    ctx.fillStyle = "#1c1a17";
    ctx.font = "500 24px Source Sans 3, sans-serif";
    const maxW = W - x - labelW - 72;
    if (!multiline) {
      ctx.fillText(value, x + labelW, y);
      // subtle separator under each param
      ctx.strokeStyle = "rgba(28,26,23,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 18);
      ctx.lineTo(W - 72, y + 18);
      ctx.stroke();
      return y + 26;
    }

    const lines = wrapText(ctx, value, maxW);
    lines.forEach((line, i) => ctx.fillText(line, x + labelW, y + i * 34));
    const bottom = y + Math.max(1, lines.length) * 34;
    ctx.strokeStyle = "rgba(28,26,23,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, bottom - 10);
    ctx.lineTo(W - 72, bottom - 10);
    ctx.stroke();
    return bottom - 8;
  }

  function wrapText(ctx, text, maxW) {
    const chars = String(text).split("");
    const lines = [];
    let cur = "";
    chars.forEach((ch) => {
      const next = cur + ch;
      if (ctx.measureText(next).width > maxW && cur) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = next;
      }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  function render() {
    const step = STEPS[state.step];
    $("stepKicker").textContent = `步骤 ${state.step + 1} / ${STEPS.length}`;
    $("stepTitle").textContent = step.title;
    $("stepDesc").textContent = step.desc;
    $("btnPrev").disabled = state.step === 0;
    $("btnNext").textContent = state.step === STEPS.length - 1 ? "完成并导出工艺卡" : "下一步";
    buildNav();
    renderBody();
    updateSide();
    drawPreview();
  }

  $("btnPrev").addEventListener("click", () => {
    state.step = Math.max(0, state.step - 1);
    render();
  });
  $("btnNext").addEventListener("click", () => {
    if (state.step === STEPS.length - 1) {
      exportCard();
      return;
    }
    state.step += 1;
    render();
  });
  $("btnExportCard").addEventListener("click", exportCard);
  $("btnAiGen").addEventListener("click", generateAiImage);

  render();
})();
