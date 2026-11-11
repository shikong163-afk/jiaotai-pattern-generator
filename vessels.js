/**
 * 传统瓶型轮廓库（参考公开陶瓷瓶型资料）
 * 容量上限 500：当前已实现可绘制轮廓；后续可继续增补。
 */
window.JIAOTAI_VESSEL_CAP = 500;
window.JIAOTAI_VESSEL_GROUPS = [
  { id: "all", name: "全部" },
  { id: "starter", name: "入门稳形" },
  { id: "fengjian", name: "丰肩" },
  { id: "scurve", name: "S 曲" },
  { id: "changjing", name: "长颈" },
  { id: "yuanfu", name: "圆腹" },
  { id: "ganlan", name: "橄榄" },
  { id: "tongshi", name: "筒式" },
  { id: "fangzheng", name: "方正" },
  { id: "bianyuan", name: "扁圆" },
  { id: "xichang", name: "细长" },
  { id: "yixing", name: "异形观赏" },
];

window.JIAOTAI_VESSELS = [
  { id: "meiping", name: "梅瓶", group: "丰肩", level: "starter", hint: "小口丰肩收胫" },
  { id: "yuhuchun", name: "玉壶春瓶", group: "S 曲", level: "starter", hint: "撇口垂腹" },
  { id: "danping", name: "胆瓶", group: "长颈", level: "starter", hint: "细颈垂胆腹" },
  { id: "tianqiu", name: "天球瓶", group: "圆腹", level: "starter", hint: "直颈天球腹" },
  { id: "ganlan", name: "橄榄瓶", group: "橄榄", level: "starter", hint: "两头收中间鼓" },
  { id: "guanyin", name: "观音瓶", group: "S 曲", level: "starter", hint: "端庄收腰" },
  { id: "denglong", name: "灯笼瓶", group: "筒式", level: "starter", hint: "上下略收" },
  { id: "bangchui", name: "棒槌瓶", group: "筒式", level: "starter", hint: "平肩筒腹" },
  { id: "pankou", name: "盘口瓶", group: "长颈", level: "standard", hint: "盘口，丰肩" },
  { id: "huakou", name: "花口瓶", group: "长颈", level: "standard", hint: "花瓣口沿" },
  { id: "biqi", name: "荸荠瓶", group: "长颈", level: "standard", hint: "长颈扁圆腹" },
  { id: "laifu", name: "莱菔瓶", group: "长颈", level: "standard", hint: "萝卜形长颈" },
  { id: "suantou", name: "蒜头瓶", group: "长颈", level: "standard", hint: "蒜头口" },
  { id: "jingping", name: "净瓶", group: "长颈", level: "advanced", hint: "细长颈 + 侧流" },
  { id: "donggua", name: "冬瓜瓶", group: "橄榄", level: "standard", hint: "长圆如冬瓜" },
  { id: "gualeng", name: "瓜棱瓶", group: "橄榄", level: "standard", hint: "纵向瓜棱" },
  { id: "liuye", name: "柳叶瓶", group: "细长", level: "standard", hint: "修长如柳叶" },
  { id: "xiangtui", name: "象腿瓶", group: "筒式", level: "standard", hint: "粗直筒式" },
  { id: "congshi", name: "琮式瓶", group: "方正", level: "advanced", hint: "外方内圆感" },
  { id: "guaner", name: "贯耳瓶", group: "方正", level: "advanced", hint: "颈部贯耳" },
  { id: "baoyue", name: "抱月瓶", group: "扁圆", level: "advanced", hint: "圆月腹，双耳" },
  { id: "hulu", name: "葫芦瓶", group: "异形观赏", level: "advanced", hint: "双球束腰" },
  { id: "duoguan", name: "多管瓶", group: "异形观赏", level: "advanced", hint: "圆腹 + 多管口" },
  { id: "panlong", name: "蟠龙瓶", group: "异形观赏", level: "advanced", hint: "筒腹，肩饰蟠龙感" },
  { id: "zhuanxin", name: "转心瓶", group: "筒式", level: "advanced", hint: "镂空窗，套心" },
];

/**
 * 返回归一化高度 t∈[0,1]（顶→底）处的半宽半径（约 0.05–0.55）
 * belly/rim/foot: 0–1 微调系数
 */
window.jiaotaiVesselRadius = function vesselRadius(t, id, belly, rim, foot) {
  const clamp = (v, a = 0.03, b = 0.56) => Math.max(a, Math.min(b, v));
  const mix = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => u * u * (3 - 2 * u);
  const B = 0.75 + belly * 0.55;
  const R = 0.7 + rim * 0.6;
  const F = 0.7 + foot * 0.55;

  switch (id) {
    case "duoguan": {
      if (t < 0.16) return clamp(0.06 * R); // tubes cluster width
      if (t < 0.28) return clamp(mix(0.1, 0.28 * B, (t - 0.16) / 0.12));
      if (t < 0.78) return clamp(0.3 * B * (0.95 + 0.05 * Math.sin(((t - 0.28) / 0.5) * Math.PI)));
      return clamp(mix(0.28 * B, 0.14 * F, (t - 0.78) / 0.22));
    }
    case "panlong": {
      if (t < 0.12) return clamp(0.14 * R);
      if (t < 0.22) return clamp(mix(0.14 * R, 0.26 * B, (t - 0.12) / 0.1));
      return clamp(0.26 * B);
    }
    case "jingping": {
      if (t < 0.08) return clamp(0.12 * R); // dish mouth
      if (t < 0.45) return clamp(mix(0.05 * R, 0.07, (t - 0.08) / 0.37)); // slender neck
      if (t < 0.78) return clamp(mix(0.08, 0.26 * B, smooth((t - 0.45) / 0.33)));
      return clamp(mix(0.26 * B, 0.12 * F, (t - 0.78) / 0.22));
    }
    case "pankou": {
      if (t < 0.07) return clamp(0.16 * R);
      if (t < 0.14) return clamp(mix(0.16 * R, 0.07, (t - 0.07) / 0.07));
      if (t < 0.38) return clamp(mix(0.07, 0.3 * B, smooth((t - 0.14) / 0.24)));
      if (t < 0.82) return clamp(mix(0.3 * B, 0.16 * B, (t - 0.38) / 0.44));
      return clamp(mix(0.16 * B, 0.12 * F, (t - 0.82) / 0.18));
    }
    case "huakou": {
      if (t < 0.08) return clamp(0.18 * R); // flower flare
      if (t < 0.42) return clamp(mix(0.06, 0.08, (t - 0.08) / 0.34));
      if (t < 0.8) return clamp(mix(0.09, 0.24 * B, smooth((t - 0.42) / 0.38)));
      return clamp(mix(0.24 * B, 0.1 * F, (t - 0.8) / 0.2));
    }
    case "baoyue": {
      // circular moon body
      const cy = 0.55;
      const rr = 0.28 * B;
      const dy = (t - cy) / rr;
      if (Math.abs(dy) > 1) {
        if (t < 0.22) return clamp(0.06 * R);
        return clamp(0.05 * F);
      }
      return clamp(rr * Math.sqrt(Math.max(0, 1 - dy * dy)));
    }
    case "zhuanxin": {
      if (t < 0.1) return clamp(0.16 * R);
      if (t < 0.18) return clamp(mix(0.16 * R, 0.24 * B, (t - 0.1) / 0.08));
      if (t < 0.85) return clamp(0.24 * B);
      return clamp(mix(0.24 * B, 0.14 * F, (t - 0.85) / 0.15));
    }
    case "donggua": {
      const u = (t - 0.5) * 2;
      return clamp(0.22 * B * (1 - 0.35 * u * u) + 0.04);
    }
    case "congshi": {
      if (t < 0.1) return clamp(0.1 * R);
      if (t < 0.18) return clamp(mix(0.1 * R, 0.22 * B, (t - 0.1) / 0.08));
      if (t < 0.86) return clamp(0.22 * B); // square-ish constant
      return clamp(mix(0.22 * B, 0.12 * F, (t - 0.86) / 0.14));
    }
    case "biqi": {
      if (t < 0.48) return clamp(0.055 * R + t * 0.02);
      if (t < 0.78) {
        const u = (t - 0.48) / 0.3;
        return clamp(0.08 + 0.26 * B * Math.sin(u * Math.PI));
      }
      return clamp(mix(0.18 * B, 0.12 * F, (t - 0.78) / 0.22));
    }
    case "denglong": {
      if (t < 0.08) return clamp(0.14 * R);
      if (t < 0.16) return clamp(mix(0.14 * R, 0.23 * B, (t - 0.08) / 0.08));
      if (t < 0.84) {
        const u = (t - 0.16) / 0.68;
        return clamp(0.23 * B * (0.92 + 0.08 * Math.sin(u * Math.PI)));
      }
      return clamp(mix(0.2 * B, 0.12 * F, (t - 0.84) / 0.16));
    }
    case "tianqiu": {
      if (t < 0.28) return clamp(0.1 * R);
      const cy = 0.62;
      const rr = 0.3 * B;
      const dy = (t - cy) / rr;
      if (dy < -1) return clamp(0.1 * R);
      if (dy > 1) return clamp(0.12 * F);
      return clamp(rr * Math.sqrt(Math.max(0, 1 - dy * dy)));
    }
    case "yuhuchun": {
      if (t < 0.08) return clamp(0.14 * R);
      if (t < 0.4) return clamp(mix(0.05, 0.07, (t - 0.08) / 0.32));
      if (t < 0.82) {
        const u = (t - 0.4) / 0.42;
        return clamp(0.08 + 0.24 * B * Math.sin(u * Math.PI));
      }
      return clamp(mix(0.16 * B, 0.1 * F, (t - 0.82) / 0.18));
    }
    case "meiping": {
      if (t < 0.05) return clamp(0.065 * R);
      if (t < 0.18) return clamp(mix(0.065 * R, 0.31 * B, smooth((t - 0.05) / 0.13)));
      if (t < 0.86) return clamp(mix(0.31 * B, 0.125 * B, smooth(Math.pow((t - 0.18) / 0.68, 1.05))));
      return clamp(mix(0.125 * B, 0.095 * F, smooth((t - 0.86) / 0.14)));
    }
    case "ganlan":
    case "gualeng": {
      const u = (t - 0.5) * 2;
      return clamp(0.24 * B * (1 - 0.55 * u * u) + 0.05);
    }
    case "danping": {
      if (t < 0.42) return clamp(0.05 * R + t * 0.03);
      if (t < 0.85) {
        const u = (t - 0.42) / 0.43;
        return clamp(0.07 + 0.22 * B * Math.sin(u * Math.PI * 0.9));
      }
      return clamp(mix(0.14 * B, 0.09 * F, (t - 0.85) / 0.15));
    }
    case "liuye": {
      if (t < 0.1) return clamp(0.09 * R);
      const u = (t - 0.15) / 0.75;
      return clamp(0.14 * B * (1 - 0.75 * Math.max(0, u)) + 0.04);
    }
    case "laifu": {
      if (t < 0.4) return clamp(0.055 * R + t * 0.025);
      if (t < 0.82) {
        const u = (t - 0.4) / 0.42;
        return clamp(0.08 + 0.2 * B * Math.sin(u * Math.PI));
      }
      return clamp(mix(0.12 * B, 0.08 * F, (t - 0.82) / 0.18));
    }
    case "guaner": {
      if (t < 0.1) return clamp(0.12 * R);
      if (t < 0.22) return clamp(0.1 * R);
      if (t < 0.86) return clamp(0.22 * B);
      return clamp(mix(0.22 * B, 0.12 * F, (t - 0.86) / 0.14));
    }
    case "hulu": {
      if (t < 0.38) {
        const cy = 0.2;
        const rr = 0.14 * B * (0.85 + rim * 0.2);
        const dy = (t - cy) / rr;
        if (Math.abs(dy) <= 1) return clamp(rr * Math.sqrt(1 - dy * dy));
        return clamp(0.05);
      }
      if (t < 0.46) return clamp(0.07); // waist
      const cy = 0.68;
      const rr = 0.26 * B;
      const dy = (t - cy) / rr;
      if (Math.abs(dy) <= 1) return clamp(rr * Math.sqrt(1 - dy * dy));
      return clamp(0.1 * F);
    }
    case "suantou": {
      if (t < 0.1) {
        const cy = 0.05;
        const rr = 0.09 * R;
        const dy = (t - cy) / rr;
        if (Math.abs(dy) <= 1) return clamp(rr * Math.sqrt(1 - dy * dy));
      }
      if (t < 0.45) return clamp(0.055 + t * 0.02);
      if (t < 0.82) {
        const u = (t - 0.45) / 0.37;
        return clamp(0.08 + 0.24 * B * Math.sin(u * Math.PI));
      }
      return clamp(mix(0.14 * B, 0.1 * F, (t - 0.82) / 0.18));
    }
    case "bangchui": {
      if (t < 0.08) return clamp(0.16 * R);
      if (t < 0.15) return clamp(mix(0.16 * R, 0.12, smooth((t - 0.08) / 0.07)));
      if (t < 0.24) return clamp(mix(0.12, 0.24 * B, smooth((t - 0.15) / 0.09)));
      if (t < 0.88) return clamp(0.24 * B);
      return clamp(mix(0.24 * B, 0.14 * F, smooth((t - 0.88) / 0.12)));
    }
    case "guanyin": {
      if (t < 0.08) return clamp(0.12 * R);
      if (t < 0.28) return clamp(mix(0.07, 0.26 * B, smooth((t - 0.08) / 0.2)));
      if (t < 0.55) return clamp(mix(0.26 * B, 0.14 * B, (t - 0.28) / 0.27));
      if (t < 0.85) return clamp(mix(0.14 * B, 0.18 * B, (t - 0.55) / 0.3));
      return clamp(mix(0.18 * B, 0.12 * F, (t - 0.85) / 0.15));
    }
    case "xiangtui": {
      if (t < 0.08) return clamp(0.2 * R);
      if (t < 0.16) return clamp(mix(0.2 * R, 0.26 * B, smooth((t - 0.08) / 0.08)));
      return clamp(0.26 * B);
    }
    default:
      return clamp(0.22 * B);
  }
};

function softDisk(dx, dy, rx, ry) {
  const d = Math.sqrt((dx / rx) * (dx / rx) + (dy / ry) * (dy / ry));
  if (d >= 1.15) return 0;
  return Math.max(0, Math.min(1, (1.15 - d) / 0.28));
}

/** 局部附件：多管、贯耳、抱月耳、净瓶侧流等（带软边 alpha） */
window.jiaotaiVesselAccessory = function vesselAccessory(nx, ny, id, belly) {
  const cx = 0.5;
  if (id === "duoguan" && ny < 0.24) {
    let best = 0;
    let kBest = 0;
    for (let k = -2; k <= 2; k++) {
      const tx = cx + k * 0.045;
      const a = softDisk(nx - tx, ny - 0.11, 0.02, 0.095);
      if (a > best) {
        best = a;
        kBest = k;
      }
    }
    if (best > 0.05) return { u: 0.5 + kBest * 0.08, v: ny, shade: 0.9, alpha: best * 0.95 };
  }
  if (id === "guaner" && ny > 0.08 && ny < 0.26) {
    for (const side of [-1, 1]) {
      const ex = cx + side * 0.16;
      const a = softDisk(nx - ex, ny - 0.17, 0.032, 0.065);
      if (a > 0.05) return { u: side > 0 ? 0.85 : 0.15, v: ny, shade: 0.84, alpha: a * 0.92 };
    }
  }
  if (id === "baoyue" && ny > 0.16 && ny < 0.34) {
    for (const side of [-1, 1]) {
      const ex = cx + side * (0.1 + belly * 0.04);
      const dx = nx - ex;
      const dy = ny - 0.25;
      const r = Math.hypot(dx * 2.2, dy * 1.4);
      const ring = Math.max(0, 1 - Math.abs(r - 0.042) / 0.018);
      if (ring > 0.05) return { u: side > 0 ? 0.8 : 0.2, v: ny, shade: 0.82, alpha: ring * 0.9 };
    }
  }
  if (id === "jingping") {
    const sx = (nx - (cx + 0.12)) / 0.11;
    const sy = (ny - 0.42) / 0.055;
    if (sx > -0.2 && sx < 1.35) {
      const half = 0.48 - Math.max(0, sx) * 0.16;
      const a = Math.max(0, 1 - Math.abs(sy) / Math.max(half, 0.08));
      const soft = a * a * (0.85 + 0.15 * Math.max(0, 1 - Math.abs(sx - 0.4)));
      if (soft > 0.08) return { u: 0.75 + sx * 0.1, v: ny, shade: 0.88, alpha: soft };
    }
  }
  if (id === "panlong" && ny > 0.18 && ny < 0.4) {
    const dx = nx - cx;
    const wave = Math.sin((ny - 0.18) * 22) * 0.035;
    const d = Math.abs(dx - wave) - 0.12;
    const a = Math.max(0, 1 - Math.abs(d) / 0.04);
    if (a > 0.08 && Math.abs(dx) > 0.1) {
      return { u: 0.5 + dx, v: ny, shade: 0.8, alpha: a * 0.75 };
    }
  }
  return null;
};
