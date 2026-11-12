(() => {
  const J = window.JiaotaiJourney;
  if (!J) return;

  const stepId = document.body.dataset.step;
  const meta = J.STEPS.find((s) => s.id === stepId);
  if (!meta) return;

  const state = J.loadState();
  const $ = (id) => document.getElementById(id);
  let drawTimer = 0;

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
    rail.innerHTML = J.STEPS.map((s, i) => {
      const cls = i === idx ? "now" : i < idx ? "done" : "";
      return `<a class="${cls}" href="./${s.file}" title="${s.title}">${s.no}</a>`;
    }).join("");
  }

  function setMark(name) {
    J.addMark(state, name);
    persist();
    const mark = $("jMark");
    if (mark) mark.textContent = `印记 ${state.marks.length}/9`;
  }

  function choiceHtml(list, key, iconFn) {
    return `<div class="j-choices">${list
      .map((item) => {
        const ico = iconFn ? iconFn(item) : "◆";
        return `<button type="button" class="j-choice ${state[key] === item.id ? "active" : ""}" data-key="${key}" data-id="${item.id}">
          <span class="ico">${ico}</span>
          <span><strong>${item.name}</strong><span>${item.note}</span></span>
          <span class="check" aria-hidden="true"></span>
        </button>`;
      })
      .join("")}</div>`;
  }

  function renderPanel() {
    const panel = $("jPanel");
    if (!panel) return;
    let html = "";

    if (stepId === "soil") {
      html = `
        <h3>点选你的泥脉</h3>
        ${choiceHtml(J.SOILS, "soil", (i) => i.emoji || "◆")}
        <div class="j-field"><label>署名</label><input type="text" id="author" maxlength="20" placeholder="例如：控" value="${state.author}" /></div>
        <div class="j-field"><label>一句心愿</label><textarea id="wish" maxlength="80" placeholder="想做一件送给谁的、怎样的瓷器？">${state.wish}</textarea></div>
        <div class="j-play"><button type="button" class="j-play-btn" id="actSoil">采掘这块土 · 收下印记</button></div>
        <p class="j-tip">${meta.tip}</p>`;
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
        <div class="j-play">
          <button type="button" class="j-play-btn" id="actKnead">揉泥一次</button>
          <button type="button" class="j-play-btn alt" id="actSwap">互换主次色</button>
        </div>
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "twist") {
      html = `
        <h3>绞盘 · 编花成纹</h3>
        ${choiceHtml(J.TWISTS, "twist")}
        <div class="j-field"><label>绞扭强度 <b id="strengthVal">${state.strength}</b></label>
          <input type="range" id="strength" min="20" max="90" value="${state.strength}" /></div>
        <div class="j-field"><label>纹路密度 <b id="densityVal">${state.density}</b></label>
          <input type="range" id="density" min="20" max="90" value="${state.density}" /></div>
        <div class="j-play"><button type="button" class="j-play-btn" id="actTwist">猛绞一记</button></div>
        <p class="j-tip">也可在预览区左右滑动，即时绞转。${meta.tip}</p>`;
    } else if (stepId === "vessel") {
      html = `
        <h3>器型库 · 图文选型</h3>
        <div id="vesselPicker" class="process-vessel-picker"></div>
        <div class="j-field"><label>腹径 <b id="bellyVal">${state.belly}</b></label>
          <input type="range" id="belly" min="0" max="500" value="${state.belly}" /></div>
        <div class="j-field"><label>口沿 <b id="rimVal">${state.rim}</b></label>
          <input type="range" id="rim" min="0" max="500" value="${state.rim}" /></div>
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "form") {
      html = `
        <h3>成型路径</h3>
        ${choiceHtml(J.FORMS, "form", (i) => i.icon || "◆")}
        <div class="j-play"><button type="button" class="j-play-btn" id="actForm">确认成型手法</button></div>
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "dry") {
      html = `
        <h3>荫干节奏</h3>
        ${choiceHtml(J.DRYS, "dry")}
        <div class="j-field"><label>荫干进度 <b id="dryVal">${state.dryProgress || 0}%</b></label></div>
        <div class="j-gauge"><i id="dryBar" style="width:${state.dryProgress || 0}%"></i></div>
        <div class="j-play">
          <button type="button" class="j-play-btn" id="actDry">推进荫干</button>
          <button type="button" class="j-play-btn alt" id="actDryReset">重新荫干</button>
        </div>
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "glaze") {
      html = `
        <h3>施釉方案</h3>
        ${choiceHtml(J.GLAZES, "glaze")}
        <div class="j-play"><button type="button" class="j-play-btn" id="actGlaze">点釉显纹</button></div>
        <p class="j-tip">${meta.tip}</p>`;
    } else if (stepId === "fire") {
      html = `
        <h3>窑火曲线</h3>
        ${choiceHtml(J.FIRES, "fire")}
        <div class="j-field"><label>窑温预感 <b id="fireVal">${state.fireTemp || 60}</b></label>
          <input type="range" id="fireTemp" min="20" max="100" value="${state.fireTemp || 60}" /></div>
        <div class="j-play"><button type="button" class="j-play-btn" id="actFire">点火焙烧预演</button></div>
        <p class="j-tip">${meta.tip}</p>`;
    } else {
      const id = J.dossierId(state);
      html = `
        <h3>出窑 · 原创档案</h3>
        <p class="j-finish-id">${id}</p>
        <p class="j-tip">创作者：${state.author.trim() || "未署名"} · 独特性 ${J.originalityScore(state)}/100</p>
        <p class="j-tip">心愿：${state.wish.trim() || "（未填写）"}</p>
        <div class="j-ai">
          <img id="aiImage" alt="AI 样张" hidden />
          <p class="j-ai-status" id="aiStatus">可生成 AI 产品摄影样张</p>
          <button type="button" class="j-play-btn" id="btnAiGen">生成 AI 样张</button>
          <button type="button" class="j-play-btn alt" id="btnExport" style="margin-top:8px">导出原创工艺卡</button>
        </div>
        <p class="j-tip">${meta.tip}</p>`;
    }

    panel.innerHTML = html;
    bindPanel();
  }

  function bindPanel() {
    panelChoices();
    bindInputs([
      "author",
      "wish",
      "colorCount",
      "c1",
      "c2",
      "c3",
      "strength",
      "density",
      "belly",
      "rim",
      "fireTemp",
    ]);

    const act = (id, fn) => {
      const el = $(id);
      if (el) el.addEventListener("click", fn);
    };

    act("actSoil", () => {
      setMark("soil");
      burstParticles();
      toast(`已采选 · ${J.labelOf(J.SOILS, state.soil)}`);
      scheduleDraw();
    });
    act("actKnead", () => {
      state.seed = (state.seed + 211) % 100000000;
      setMark("refine");
      toast("泥色已揉匀");
      persist();
      scheduleDraw();
      kneadPulse();
    });
    act("actSwap", () => {
      const t = state.c1;
      state.c1 = state.c2;
      state.c2 = t;
      persist();
      renderPanel();
      scheduleDraw();
      toast("主次色已互换");
    });
    act("actTwist", () => {
      state.strength = Math.min(90, state.strength + 8);
      state.seed = (state.seed + 97) % 100000000;
      setMark("twist");
      persist();
      renderPanel();
      scheduleDraw();
      toast("纹路更鲜明了");
    });
    act("actForm", () => {
      setMark("form");
      toast(`成型：${J.labelOf(J.FORMS, state.form)}`);
      scheduleDraw();
    });
    act("actDry", () => {
      const step = state.dry === "slow" ? 12 : state.dry === "controlled" ? 10 : 16;
      state.dryProgress = Math.min(100, (state.dryProgress || 0) + step);
      if (state.dryProgress >= 100) setMark("dry");
      persist();
      const bar = $("dryBar");
      const lab = $("dryVal");
      if (bar) bar.style.width = `${state.dryProgress}%`;
      if (lab) lab.textContent = `${state.dryProgress}%`;
      scheduleDraw();
      toast(state.dryProgress >= 100 ? "荫干完成" : `荫干 ${state.dryProgress}%`);
    });
    act("actDryReset", () => {
      state.dryProgress = 0;
      persist();
      renderPanel();
      scheduleDraw();
    });
    act("actGlaze", () => {
      setMark("glaze");
      glazeFlash();
      toast(`施釉：${J.labelOf(J.GLAZES, state.glaze)}`);
      scheduleDraw();
    });
    act("actFire", () => {
      setMark("fire");
      fireFlash();
      toast(`焙烧偏好：${J.labelOf(J.FIRES, state.fire)}`);
      scheduleDraw({ fireGlow: true });
    });
    act("btnAiGen", generateAi);
    act("btnExport", exportCard);

    if (stepId === "vessel" && window.JiaotaiVesselUI) {
      window.JiaotaiVesselUI.mountVesselPicker($("vesselPicker"), {
        selectedId: state.vessel,
        compact: true,
        onSelect: (v) => {
          state.vessel = v.id;
          setMark("vessel");
          persist();
          scheduleDraw();
          toast(`器型：${v.name}`);
        },
      });
    }
  }

  function panelChoices() {
    document.querySelectorAll(".j-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        state[key] = btn.dataset.id;
        if (key === "twist") state.seed = (state.seed + 137) % 100000000;
        persist();
        renderPanel();
        scheduleDraw(key === "fire" ? { fireGlow: true } : {});
        toast(`已选 · ${btn.querySelector("strong")?.textContent || ""}`);
      });
    });
  }

  function bindInputs(ids) {
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        if (id === "author" || id === "wish") state[id] = el.value;
        else if (id === "c1" || id === "c2" || id === "c3") state[id] = el.value;
        else if (id === "fireTemp") {
          state.fireTemp = Number(el.value);
          const lab = $("fireVal");
          if (lab) lab.textContent = state.fireTemp;
        } else {
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
        scheduleDraw(id === "fireTemp" ? { fireGlow: true } : {});
      });
    });
  }

  function burstParticles() {
    const fx = $("jFx");
    if (!fx) return;
    fx.innerHTML = "";
    for (let i = 0; i < 14; i++) {
      const d = document.createElement("i");
      d.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:${state.c2};left:50%;top:50%;opacity:0.9;transform:translate(-50%,-50%);transition:transform 0.7s ease,opacity 0.7s ease;`;
      fx.appendChild(d);
      requestAnimationFrame(() => {
        const ang = (Math.PI * 2 * i) / 14;
        const r = 80 + Math.random() * 70;
        d.style.transform = `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r}px))`;
        d.style.opacity = "0";
      });
    }
  }

  function kneadPulse() {
    const viz = $("jViz");
    if (!viz) return;
    viz.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.97)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "ease-out" }
    );
  }

  function glazeFlash() {
    const fx = $("jFx");
    if (!fx) return;
    fx.innerHTML = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0.35),transparent 55%);opacity:0;transition:opacity .5s ease"></div>`;
    const d = fx.firstChild;
    requestAnimationFrame(() => {
      d.style.opacity = "1";
      setTimeout(() => {
        d.style.opacity = "0";
      }, 500);
    });
  }

  function fireFlash() {
    const fx = $("jFx");
    if (!fx) return;
    fx.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 80%,rgba(255,120,40,0.35),transparent 55%);opacity:0;transition:opacity .45s ease"></div>`;
    const d = fx.firstChild;
    requestAnimationFrame(() => {
      d.style.opacity = "1";
      setTimeout(() => {
        d.style.opacity = "0";
      }, 700);
    });
  }

  // swipe twist on preview
  function bindVizGestures() {
    const viz = $("jViz");
    if (!viz || stepId !== "twist") return;
    let x0 = null;
    const onDown = (e) => {
      x0 = (e.touches ? e.touches[0].clientX : e.clientX);
    };
    const onMove = (e) => {
      if (x0 == null) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - x0;
      if (Math.abs(dx) > 18) {
        state.strength = Math.max(20, Math.min(90, state.strength + Math.sign(dx) * 2));
        state.seed = (state.seed + Math.sign(dx) * 13 + 100000000) % 100000000;
        x0 = x;
        persist();
        const lab = $("strengthVal");
        if (lab) lab.textContent = state.strength;
        const range = $("strength");
        if (range) range.value = state.strength;
        scheduleDraw();
      }
    };
    const onUp = () => {
      x0 = null;
    };
    viz.addEventListener("pointerdown", onDown);
    viz.addEventListener("pointermove", onMove);
    viz.addEventListener("pointerup", onUp);
    viz.addEventListener("pointercancel", onUp);
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
    const seed = (state.seed + serial * 97) % 1000000;
    const nonce = `j${serial}_${Date.now().toString(36)}`;
    try {
      const result = await window.JiaotaiAI.generateJiaotaiImage(prompt, { seed, nonce });
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

  function exportCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const id = J.dossierId(state);
    const pad = 72;
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#f8f4ec");
    bg.addColorStop(1, "#efe8da");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#3d5a48";
    ctx.fillRect(0, 0, canvas.width, 180);
    ctx.fillStyle = "#f7f3eb";
    ctx.font = "700 48px Noto Serif SC, serif";
    ctx.fillText("绞胎原创工艺卡", pad, 88);
    ctx.font = "400 22px Source Sans 3, sans-serif";
    ctx.fillText("当阳峪 · 九关定制旅程", pad, 132);
    ctx.fillStyle = "#1c1a17";
    ctx.font = "700 28px Source Sans 3, sans-serif";
    ctx.fillText(id, pad, 240);
    const rows = [
      ["创作者", state.author.trim() || "匿名创作者"],
      ["心愿", state.wish.trim() || "（未填写）"],
      ["选土", J.labelOf(J.SOILS, state.soil)],
      ["色泥", `${state.colorCount} 色`],
      ["编花", `${J.labelOf(J.TWISTS, state.twist)} · 密度 ${state.density}`],
      ["器型", `${J.vesselName(state)} · 腹 ${state.belly}`],
      ["成型", J.labelOf(J.FORMS, state.form)],
      ["荫干", J.labelOf(J.DRYS, state.dry)],
      ["施釉", J.labelOf(J.GLAZES, state.glaze)],
      ["焙烧", J.labelOf(J.FIRES, state.fire)],
      ["独特性", `${J.originalityScore(state)} / 100`],
    ];
    let y = 310;
    rows.forEach(([k, v]) => {
      ctx.fillStyle = "#7a7368";
      ctx.font = "600 22px Source Sans 3, sans-serif";
      ctx.fillText(k, pad, y);
      ctx.fillStyle = "#1c1a17";
      ctx.font = "500 24px Source Sans 3, sans-serif";
      ctx.fillText(String(v).slice(0, 28), pad + 170, y);
      y += 48;
    });
    const preview = $("jPreview");
    if (preview) {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(pad, y + 20, 460, 460);
      ctx.drawImage(preview, pad + 8, y + 28, 444, 444);
    }
    const a = document.createElement("a");
    a.download = `${id}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    setMark("finish");
    toast("工艺卡已导出");
  }

  // boot UI chrome
  $("jKicker").textContent = `第 ${meta.no} 关 · ${meta.verb}`;
  $("jTitle").textContent = meta.title;
  $("jDesc").textContent = meta.desc;
  const prev = J.prevFile(stepId);
  const next = J.nextFile(stepId);
  const btnPrev = $("jPrev");
  const btnNext = $("jNext");
  if (btnPrev) {
    if (prev) btnPrev.href = `./${prev}`;
    else {
      btnPrev.href = "../index.html?enter=1";
      btnPrev.textContent = "返回启程";
    }
  }
  if (btnNext) {
    if (next) {
      btnNext.href = `./${next}`;
      btnNext.textContent = "下一关";
      btnNext.addEventListener("click", () => {
        setMark(stepId);
        persist();
      });
    } else {
      btnNext.href = "./01-soil.html";
      btnNext.textContent = "再走一趟";
      btnNext.addEventListener("click", () => {
        setMark("finish");
        persist();
      });
    }
  }

  const mark = $("jMark");
  if (mark) mark.textContent = `印记 ${(state.marks || []).length}/9`;

  buildRail();
  renderPanel();
  scheduleDraw(stepId === "fire" ? { fireGlow: true } : {});
  bindVizGestures();
  persist();
})();
