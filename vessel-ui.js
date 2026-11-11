(() => {
  const CAP = () => window.JIAOTAI_VESSEL_CAP || 500;
  const LIST = () => window.JIAOTAI_VESSELS || [];
  const GROUPS = () => window.JIAOTAI_VESSEL_GROUPS || [{ id: "all", name: "全部" }];
  const radiusFn = () => window.jiaotaiVesselRadius;

  function drawVesselThumb(canvas, id, opts = {}) {
    const g = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const radiusAt = radiusFn();
    g.clearRect(0, 0, w, h);
    if (opts.bg !== false) {
      g.fillStyle = opts.bg || "rgba(28,26,23,0.03)";
      g.fillRect(0, 0, w, h);
    }
    if (!radiusAt) return;
    const top = opts.pad ?? 4;
    const bot = h - (opts.pad ?? 4);
    const cx = w / 2;
    const scale = w * (opts.scale ?? 0.88);
    const belly = opts.belly ?? 0.68;
    const rim = opts.rim ?? 0.48;
    const foot = opts.foot ?? 0.14;
    const steps = opts.steps ?? 56;
    g.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = radiusAt(t, id, belly, rim, foot) * scale;
      const yy = top + (bot - top) * t;
      if (i === 0) g.moveTo(cx + r, yy);
      else g.lineTo(cx + r, yy);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const r = radiusAt(t, id, belly, rim, foot) * scale;
      const yy = top + (bot - top) * t;
      g.lineTo(cx - r, yy);
    }
    g.closePath();
    g.fillStyle = opts.fill || "#d7e1d5";
    g.fill();
    g.strokeStyle = opts.stroke || "rgba(61,90,72,0.38)";
    g.lineWidth = opts.lineWidth ?? 1.2;
    g.lineJoin = "round";
    g.stroke();
  }

  function filterVessels(groupId) {
    const all = LIST();
    if (!groupId || groupId === "all") return all.slice();
    if (groupId === "starter") return all.filter((v) => v.level === "starter");
    const g = GROUPS().find((x) => x.id === groupId);
    const name = g?.name;
    return all.filter((v) => v.group === name);
  }

  function mountVesselPicker(root, options = {}) {
    if (!root) return { refresh() {} };
    const {
      selectedId = "meiping",
      onSelect = () => {},
      compact = false,
    } = options;

    let currentGroup = "starter";
    let currentId = selectedId;

    root.classList.add("vessel-picker");
    if (compact) root.classList.add("is-compact");

    root.innerHTML = `
      <div class="vp-head">
        <div class="vp-title-row">
          <strong>器型选型</strong>
          <span class="vp-cap">已收录 ${LIST().length} / 上限 ${CAP()}</span>
        </div>
        <p class="vp-note">从 0 开始：先选入门稳形，再按分类浏览。图文对照，客观认形。</p>
        <div class="vp-groups" role="tablist" aria-label="器型分类"></div>
      </div>
      <div class="vp-grid" role="listbox" aria-label="瓶型列表"></div>
      <p class="vp-hint"></p>
    `;

    const groupsEl = root.querySelector(".vp-groups");
    const gridEl = root.querySelector(".vp-grid");
    const hintEl = root.querySelector(".vp-hint");

    function renderGroups() {
      groupsEl.innerHTML = "";
      GROUPS().forEach((g) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vp-group" + (g.id === currentGroup ? " active" : "");
        btn.textContent = g.name;
        btn.dataset.group = g.id;
        btn.addEventListener("click", () => {
          currentGroup = g.id;
          renderGroups();
          renderGrid();
        });
        groupsEl.appendChild(btn);
      });
    }

    function renderGrid() {
      const list = filterVessels(currentGroup);
      gridEl.innerHTML = "";
      if (!list.length) {
        gridEl.innerHTML = `<p class="vp-empty">该分类暂无器型</p>`;
        return;
      }
      list.forEach((v) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vp-card" + (v.id === currentId ? " active" : "");
        btn.dataset.vessel = v.id;
        btn.setAttribute("role", "option");
        btn.setAttribute("aria-selected", v.id === currentId ? "true" : "false");
        btn.title = `${v.name} · ${v.hint}`;

        const thumb = document.createElement("canvas");
        thumb.width = compact ? 64 : 84;
        thumb.height = compact ? 78 : 104;
        drawVesselThumb(thumb, v.id);

        const meta = document.createElement("div");
        meta.className = "vp-meta";
        meta.innerHTML = `<strong>${v.name}</strong><span>${v.hint}</span><em>${v.group}${v.level === "starter" ? " · 入门" : v.level === "advanced" ? " · 进阶" : ""}</em>`;

        btn.appendChild(thumb);
        btn.appendChild(meta);
        btn.addEventListener("click", () => {
          currentId = v.id;
          hintEl.textContent = `${v.name}：${v.hint}`;
          onSelect(v);
          renderGrid();
        });
        gridEl.appendChild(btn);
      });

      const cur = LIST().find((v) => v.id === currentId);
      if (cur) hintEl.textContent = `${cur.name}：${cur.hint}`;
    }

    renderGroups();
    renderGrid();

    return {
      setSelected(id) {
        currentId = id;
        renderGrid();
      },
      refresh() {
        root.querySelector(".vp-cap").textContent = `已收录 ${LIST().length} / 上限 ${CAP()}`;
        renderGroups();
        renderGrid();
      },
    };
  }

  /** Decorative vessel silhouettes for intro backgrounds */
  function paintBgSilhouettes(canvas, seed = 1) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const ids = [
      "meiping",
      "yuhuchun",
      "danping",
      "tianqiu",
      "ganlan",
      "guanyin",
      "hulu",
      "liuye",
      "fengwei",
      "huagu",
      "jiangjun",
      "yaoling",
      "shangping",
      "congshi",
    ];
    const spots = [
      { x: 0.08, y: 0.22, s: 0.11, a: 0.07, rot: -6 },
      { x: 0.9, y: 0.18, s: 0.1, a: 0.06, rot: 8 },
      { x: 0.14, y: 0.72, s: 0.13, a: 0.065, rot: 4 },
      { x: 0.86, y: 0.68, s: 0.12, a: 0.055, rot: -5 },
      { x: 0.5, y: 0.86, s: 0.09, a: 0.045, rot: 0 },
      { x: 0.72, y: 0.4, s: 0.08, a: 0.05, rot: 10 },
    ];

    spots.forEach((sp, i) => {
      const id = ids[(i + seed) % ids.length];
      const tw = Math.floor(w * sp.s);
      const th = Math.floor(tw * 1.35);
      const off = document.createElement("canvas");
      off.width = tw;
      off.height = th;
      drawVesselThumb(off, id, {
        bg: false,
        fill: "rgba(61,90,72,0.55)",
        stroke: "rgba(61,90,72,0.25)",
        lineWidth: 1,
        scale: 0.9,
      });
      ctx.save();
      ctx.translate(w * sp.x, h * sp.y);
      ctx.rotate((sp.rot * Math.PI) / 180);
      ctx.globalAlpha = sp.a;
      ctx.drawImage(off, -tw / 2, -th / 2);
      ctx.restore();
    });
  }

  window.JiaotaiVesselUI = {
    drawVesselThumb,
    mountVesselPicker,
    paintBgSilhouettes,
    filterVessels,
  };
})();
