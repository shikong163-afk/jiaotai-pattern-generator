(() => {
  const J = () => window.JiaotaiJourney;
  const HOME = "https://jiaotai-pattern-generator.pages.dev/";
  const CSS_HREF = document.currentScript
    ? new URL("./vessel-card.css", document.currentScript.src).href
    : "";

  function kilnLines(note) {
    const text = String(note || "");
    const cut = text.indexOf("。");
    if (cut < 0) return [text, ""];
    return [text.slice(0, cut + 1), text.slice(cut + 1)];
  }

  function summaryOf(state) {
    const lib = J();
    return [
      lib.labelOf(lib.SOILS, state.soil),
      lib.labelOf(lib.TWISTS, state.twist),
      lib.vesselName(state),
      lib.labelOf(lib.FIRES, state.fire),
    ].join(" · ");
  }

  function cropVessel(state) {
    const src = document.createElement("canvas");
    src.width = 900;
    src.height = 900;
    J().drawPreview(src, state, { cutout: true });
    const ctx = src.getContext("2d");
    const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 16) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    const pad = 4;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);
    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;
    const out = document.createElement("canvas");
    out.width = cw;
    out.height = ch;
    out.getContext("2d").drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);
    let boxH = 389;
    let boxW = Math.max(1, Math.round(boxH * (cw / ch)));
    if (boxW > 700) {
      boxW = 700;
      boxH = Math.max(1, Math.round(boxW * (ch / cw)));
    }
    return { url: out.toDataURL("image/png"), canvas: out, width: boxW, height: boxH };
  }

  function qrCanvas() {
    if (typeof qrcode !== "function") throw new Error("qrcode generator missing");
    if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs["UTF-8"]) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
    }
    const qr = qrcode(0, "M");
    qr.addData(HOME);
    qr.make();
    const n = qr.getModuleCount();
    const cell = 6;
    const canvas = document.createElement("canvas");
    canvas.width = n * cell;
    canvas.height = n * cell;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1c1a17";
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (qr.isDark(row, col)) ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
    return canvas;
  }

  function node(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function build(state) {
    const lib = J();
    const author = String(state.author || "").trim();
    const wish = String(state.wish || "").trim();
    const lines = kilnLines(lib.KILN_NOTE);
    const card = node("div", "vc-card");
    card.setAttribute("role", "img");
    card.setAttribute("aria-label", "出窑器物卡");

    const edgeTop = node("i", "edge-top");
    const edgeRight = node("i", "edge-right");
    const face = node("div", "face");
    const brass = node("div", "brass");
    const inner = node("div", "inner");

    const kicker = node("div", "kicker");
    kicker.textContent = "当阳峪 · 出窑";

    const niche = node("div", "niche");
    niche.append(
      node("i", "tray-outer-r"),
      node("i", "tray-back"),
      node("i", "tray-side-l"),
      node("i", "tray-side-r"),
      node("i", "tray-floor"),
      node("i", "tray-lip"),
      node("i", "glow")
    );
    const shot = cropVessel(state);
    const vessel = node("img", "vessel");
    vessel.alt = "";
    if (shot) {
      vessel.src = shot.url;
      vessel.style.width = `${shot.width}px`;
      vessel.style.height = `${shot.height}px`;
    }
    niche.appendChild(vessel);

    const archive = node("div", "archive");
    archive.textContent = lib.dossierId(state);

    const authorEl = node("div", "author");
    authorEl.textContent = author || "未署名";

    const summary = node("div", "summary");
    summary.textContent = summaryOf(state);

    const kiln = node("div", "kiln");
    kiln.append(document.createTextNode(lines[0]), document.createElement("br"), document.createTextNode(lines[1]));

    const seal = node("div", "seal-slot");
    seal.dataset.reserved = "nine-seals";

    const footer = node("div", "footer");
    const colophon = node("div", "colophon");
    const name = node("div", "name");
    name.textContent = "当阳峪";
    const sub = node("div", "sub");
    sub.textContent = lib.KILN_NOTE_SUB;
    colophon.append(name, sub);

    const qrWrap = node("div", "qr");
    const qrImg = node("img");
    qrImg.alt = "礼匣首页二维码";
    const qr = qrCanvas();
    qrImg.src = qr.toDataURL("image/png");
    const qrCap = node("span");
    qrCap.textContent = "扫码打开礼匣";
    qrWrap.append(qrImg, qrCap);
    footer.append(colophon, qrWrap);

    inner.append(kicker, niche, archive, authorEl);
    if (wish) {
      const wishEl = node("div", "wish");
      wishEl.textContent = wish;
      inner.appendChild(wishEl);
    }
    inner.append(summary, kiln, seal, footer);
    face.append(brass, inner);
    card.append(edgeTop, edgeRight, face);

    fitAuthor(authorEl);
    return card;
  }

  function fitAuthor(el) {
    el.classList.remove("is-shrink", "is-wrap");
    if (el.scrollWidth > 900) el.classList.add("is-shrink");
    if (el.scrollWidth > 900) el.classList.add("is-wrap");
  }

  function fitFrame(frame, scale) {
    const apply = () => {
      const w = frame.clientWidth || 420;
      scale.style.transform = `scale(${w / 1080})`;
    };
    apply();
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(apply);
      ro.observe(frame);
    }
  }

  function mount(host, state) {
    host.replaceChildren();
    const frame = node("div", "vc-frame");
    const scale = node("div", "vc-scale");
    const card = build(state);
    scale.appendChild(card);
    frame.appendChild(scale);
    host.appendChild(frame);
    fitFrame(frame, scale);
    const author = card.querySelector(".author");
    const refit = () => fitAuthor(author);
    requestAnimationFrame(refit);
    if (document.fonts) document.fonts.ready.then(refit);
    return card;
  }

  async function paintFonts() {
    if (!document.fonts) return;
    try {
      await document.fonts.load('500 22px "Noto Serif SC"');
      await document.fonts.load('700 40px "Noto Serif SC"');
      await document.fonts.load('700 36px "Noto Serif SC"');
      await document.fonts.load('400 24px "Noto Serif SC"');
      await document.fonts.load('500 24px "Noto Serif SC"');
      await document.fonts.load('400 20px "Noto Serif SC"');
      await document.fonts.load('400 18px "Noto Serif SC"');
      await document.fonts.load('600 20px "Source Sans 3"');
      await document.fonts.load('400 16px "Source Sans 3"');
    } catch {
      /* fall back to the next family in the stack */
    }
    await document.fonts.ready;
  }

  function fillPoly(ctx, pts, color) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function wrapText(ctx, text, maxWidth, maxLines) {
    const chars = Array.from(text);
    const lines = [];
    let line = "";
    let used = 0;
    for (let i = 0; i < chars.length; i++) {
      const next = line + chars[i];
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        used = i;
        line = chars[i];
        if (lines.length === maxLines - 1) {
          let rest = chars.slice(i).join("");
          while (rest && ctx.measureText(`${rest}…`).width > maxWidth) rest = Array.from(rest).slice(0, -1).join("");
          if (chars.slice(i).join("") !== rest) rest += "…";
          lines.push(rest);
          return lines;
        }
      } else {
        line = next;
        used = i + 1;
      }
    }
    if (line) lines.push(line);
    if (used < chars.length && lines.length) {
      let last = lines[lines.length - 1];
      while (last && ctx.measureText(`${last}…`).width > maxWidth) last = Array.from(last).slice(0, -1).join("");
      lines[lines.length - 1] = `${last}…`;
    }
    return lines;
  }

  function drawSpaced(ctx, text, x, y, align) {
    const spacing = ctx.letterSpacing && ctx.letterSpacing !== "0px" ? null : 0;
    if (spacing === null && ctx.letterSpacing) {
      ctx.textAlign = align || "left";
      ctx.fillText(text, x, y);
      return;
    }
    ctx.textAlign = "left";
    const widths = Array.from(text).map((ch) => ctx.measureText(ch).width);
    const gap = 0;
    const total = widths.reduce((s, w) => s + w, 0) + gap * Math.max(0, widths.length - 1);
    let cursor = align === "center" ? x - total / 2 : x;
    Array.from(text).forEach((ch, i) => {
      ctx.fillText(ch, cursor, y);
      cursor += widths[i] + gap;
    });
  }

  async function renderCanvas(state) {
    await paintFonts();
    const lib = J();
    const card = document.createElement("canvas");
    card.width = 1080;
    card.height = 1440;
    const ctx = card.getContext("2d");
    ctx.fillStyle = "#553422";
    ctx.fillRect(0, 0, 1080, 1440);

    const topGrad = ctx.createLinearGradient(18, 0, 1080, 0);
    topGrad.addColorStop(0, "#a2714e");
    topGrad.addColorStop(1, "#8c5e40");
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(1080, 0);
    ctx.lineTo(1062, 18);
    ctx.lineTo(18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,232,204,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, 17.5);
    ctx.lineTo(1062, 17.5);
    ctx.stroke();

    ctx.fillStyle = "#553422";
    ctx.fillRect(1062, 18, 18, 1422);

    const face = ctx.createLinearGradient(0, 18, 0, 1440);
    face.addColorStop(0, "#7e4c32");
    face.addColorStop(1, "#6a3f28");
    ctx.fillStyle = face;
    ctx.fillRect(0, 18, 1062, 1422);

    ctx.strokeStyle = "#b08a4f";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22 + 0.75, 18 + 22 + 0.75, 1062 - 44 - 1.5, 1422 - 44 - 1.5);

    const inner = ctx.createLinearGradient(0, 44, 0, 1414);
    inner.addColorStop(0, "#f4efe6");
    inner.addColorStop(1, "#ece2d0");
    ctx.fillStyle = inner;
    ctx.fillRect(26, 44, 1010, 1370);

    const cx = 26 + 1010 / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#8a6a3a";
    ctx.font = '500 22px "Noto Serif SC", serif';
    ctx.letterSpacing = "0.42em";
    drawSpaced(ctx, "当阳峪 · 出窑", cx + 4, 92, "center");
    ctx.letterSpacing = "0px";

    const nicheX = 26 + (1010 - 900) / 2;
    const nicheY = 92 + 26 + 28;
    paintNiche(ctx, nicheX, nicheY, state);

    let y = nicheY + 540 + 32;
    ctx.fillStyle = "#7a7368";
    ctx.font = '600 20px "Source Sans 3", sans-serif';
    ctx.letterSpacing = "0.16em";
    ctx.fillText(lib.dossierId(state), cx, y);
    ctx.letterSpacing = "0px";
    y += 24;

    const author = String(state.author || "").trim() || "未署名";
    ctx.fillStyle = "#1c1a17";
    ctx.font = '700 40px "Noto Serif SC", serif';
    ctx.letterSpacing = "0.08em";
    let authorSize = 40;
    if (ctx.measureText(author).width > 900) {
      authorSize = 32;
      ctx.font = '700 32px "Noto Serif SC", serif';
    }
    y += 18;
    const authorLines = ctx.measureText(author).width > 900 ? wrapText(ctx, author, 900, 2) : [author];
    authorLines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += authorSize * 1.2;
    });
    ctx.letterSpacing = "0px";

    const wish = String(state.wish || "").trim();
    if (wish) {
      y += 12;
      ctx.fillStyle = "rgba(28,26,23,0.62)";
      ctx.font = '400 24px "Noto Serif SC", serif';
      const wishLines = wrapText(ctx, wish, 800, 3);
      wishLines.forEach((line) => {
        ctx.fillText(line, cx, y);
        y += 24 * 1.55;
      });
    }

    y += 28;
    ctx.fillStyle = "#1c1a17";
    ctx.font = '500 24px "Noto Serif SC", serif';
    ctx.letterSpacing = "0.06em";
    const summary = summaryOf(state);
    const summaryLines = ctx.measureText(summary).width > 900 ? wrapText(ctx, summary, 900, 2) : [summary];
    summaryLines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += 24 * 1.55;
    });
    ctx.letterSpacing = "0px";

    y += 16;
    ctx.fillStyle = "rgba(28,26,23,0.62)";
    ctx.font = '400 20px "Noto Serif SC", serif';
    const lines = kilnLines(lib.KILN_NOTE);
    lines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += 20 * 1.7;
    });

    const footerTop = 1414 - 40 - 8 - 168 - 8 - 20;
    if (footerTop - y < 72) {
      /* 文字已经顶到预留带。底栏仍钉在内边距下沿，不把二维码上移。 */
    }

    const footerX = nicheX;
    const qrSize = 168;
    const qrX = footerX + 900 - qrSize;
    const qrY = footerTop + 8;
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.drawImage(qrCanvas(), qrX + 9, qrY + 9, qrSize - 18, qrSize - 18);
    ctx.strokeStyle = "#b08a4f";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(qrX + 0.75, qrY + 0.75, qrSize - 1.5, qrSize - 1.5);
    ctx.fillStyle = "#7a7368";
    ctx.font = '400 16px "Source Sans 3", sans-serif';
    ctx.letterSpacing = "0.12em";
    ctx.textAlign = "center";
    ctx.fillText("扫码打开礼匣", qrX + qrSize / 2, qrY + qrSize + 8);
    ctx.letterSpacing = "0px";

    ctx.textAlign = "left";
    ctx.fillStyle = "#1c1a17";
    ctx.font = '700 36px "Noto Serif SC", serif';
    ctx.letterSpacing = "0.28em";
    const nameY = qrY + qrSize - 36 - 10 - 18;
    ctx.fillText("当阳峪", footerX + 3, nameY);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = "#8a6a3a";
    ctx.font = '400 18px "Noto Serif SC", serif';
    ctx.letterSpacing = "0.18em";
    ctx.fillText(lib.KILN_NOTE_SUB, footerX, nameY + 36 + 10);
    ctx.letterSpacing = "0px";

    return card;
  }

  function paintNiche(ctx, x, y, state) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 900, 540);
    ctx.clip();

    const back = ctx.createLinearGradient(0, y, 0, y + 540 - 97);
    back.addColorStop(0, "#ece2d0");
    back.addColorStop(1, "#dccaaa");
    ctx.fillStyle = back;
    ctx.fillRect(x, y, 900 - 14, 540 - 97);
    ctx.fillStyle = "#7a4a30";
    ctx.fillRect(x, y, 900 - 14, 4);

    const sideH = 540 - 4;
    const sideTop = y + 4;
    fillPoly(ctx, [
      [x, sideTop],
      [x + 150, sideTop + sideH * 0.82],
      [x + 150, y + 540],
      [x, y + 540],
    ], "#d4c09e");
    const rx = x + 900 - 14 - 150;
    fillPoly(ctx, [
      [rx, sideTop + sideH * 0.82],
      [rx + 150, sideTop],
      [rx + 150, y + 540],
      [rx, y + 540],
    ], "#c9b38f");

    const floorTop = y + 540 - 97 - 70;
    const floorW = 900 - 14;
    fillPoly(ctx, [
      [x + floorW * 0.16, floorTop],
      [x + floorW * 0.84, floorTop],
      [x + floorW, floorTop + 70],
      [x, floorTop + 70],
    ], "#cdb894");

    ctx.fillStyle = "#7a4a30";
    ctx.fillRect(x, y + 540 - 97, floorW, 97);
    ctx.fillStyle = "rgba(255,232,204,0.2)";
    ctx.fillRect(x, y + 540 - 97, floorW, 1);

    ctx.fillStyle = "#553422";
    ctx.fillRect(x + 900 - 14, y, 14, 540);

    const glow = ctx.createRadialGradient(x + 443, y + 540 * 0.42, 20, x + 443, y + 540 * 0.42, 280);
    glow.addColorStop(0, "rgba(255,244,224,0.55)");
    glow.addColorStop(1, "rgba(255,244,224,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x + 72, y + 43, 900 * 0.92 - 24, 540 * 0.72);

    const shot = cropVessel(state);
    if (shot) {
      const vx = x + 450 - 7 - shot.width / 2;
      const vy = y + 540 - 99 - shot.height;
      ctx.drawImage(shot.canvas, vx, vy, shot.width, shot.height);
    }
    ctx.restore();
  }

  function downloadUrl(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function rasterize(card) {
    await paintFonts();
    let css = "";
    try {
      if (CSS_HREF) css = await (await fetch(CSS_HREF)).text();
    } catch {
      css = "";
    }
    const body = new XMLSerializer().serializeToString(card);
    const xhtml =
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:1080px;height:1440px;margin:0;padding:0;background:#553422">` +
      `<style><![CDATA[${css}]]></style>${body}</div>`;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440">` +
      `<foreignObject width="1080" height="1440">${xhtml}</foreignObject></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("raster"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440;
      canvas.getContext("2d").drawImage(img, 0, 0);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function canvasHasInk(canvas) {
    const pixel = canvas.getContext("2d").getImageData(200, 120, 1, 1).data;
    return pixel[3] > 200 && pixel[0] > 80;
  }

  async function pngBlob(state) {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-5000px;top:0;width:1080px;height:1440px;pointer-events:none;";
    const card = build(state);
    holder.appendChild(card);
    document.body.appendChild(holder);
    await paintFonts();
    fitAuthor(card.querySelector(".author"));
    let canvas;
    try {
      canvas = await rasterize(card);
      if (!canvasHasInk(canvas)) canvas = await renderCanvas(state);
    } catch {
      canvas = await renderCanvas(state);
    } finally {
      holder.remove();
    }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return { canvas, blob, filename: `${J().dossierId(state)}.png` };
  }

  async function download(state) {
    const { blob, filename, canvas } = await pngBlob(state);
    downloadUrl(canvas.toDataURL("image/png"), filename);
    return blob;
  }

  async function share(state) {
    const { blob, filename } = await pngBlob(state);
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "当阳峪 · 出窑",
        text: J().GIFT_OPEN_VOICE,
      });
      return "shared";
    }
    downloadUrl(URL.createObjectURL(blob), filename);
    return "saved";
  }

  window.JiaotaiVesselCard = {
    HOME,
    kilnLines,
    summaryOf,
    mount,
    renderCanvas,
    download,
    share,
    qrCanvas,
  };
})();
