/**
 * 传统瓷器器形轮廓库（据公开陶瓷器形资料整理）
 * 容量上限 500：当前为可绘制经典器形；后续可继续增补。
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
  { id: "zunlei", name: "尊类" },
  { id: "guanlei", name: "罐类" },
  { id: "hulei", name: "壶类" },
  { id: "guxi", name: "觚洗" },
  { id: "yixing", name: "异形观赏" },
];

window.JIAOTAI_VESSELS = [
  /* —— 入门稳形 —— */
  { id: "meiping", name: "梅瓶", group: "丰肩", level: "starter", hint: "小口丰肩收胫" },
  { id: "yuhuchun", name: "玉壶春瓶", group: "S 曲", level: "starter", hint: "撇口垂腹" },
  { id: "danping", name: "胆瓶", group: "长颈", level: "starter", hint: "细颈垂胆腹" },
  { id: "tianqiu", name: "天球瓶", group: "圆腹", level: "starter", hint: "直颈天球腹" },
  { id: "ganlan", name: "橄榄瓶", group: "橄榄", level: "starter", hint: "两头收中间鼓" },
  { id: "guanyin", name: "观音瓶", group: "S 曲", level: "starter", hint: "端庄收腰" },
  { id: "denglong", name: "灯笼瓶", group: "筒式", level: "starter", hint: "上下略收" },
  { id: "bangchui", name: "棒槌瓶", group: "筒式", level: "starter", hint: "平肩筒腹" },
  { id: "shangping", name: "赏瓶", group: "长颈", level: "starter", hint: "撇口长颈丰肩" },
  { id: "zhijing", name: "直颈瓶", group: "长颈", level: "starter", hint: "直颈圆腹" },

  /* —— 丰肩 / S 曲 / 长颈 —— */
  { id: "pankou", name: "盘口瓶", group: "长颈", level: "standard", hint: "盘口丰肩" },
  { id: "huakou", name: "花口瓶", group: "长颈", level: "standard", hint: "花瓣口沿" },
  { id: "xikou", name: "洗口瓶", group: "长颈", level: "standard", hint: "洗式敞口" },
  { id: "juankou", name: "卷口瓶", group: "长颈", level: "standard", hint: "口沿外卷" },
  { id: "biqi", name: "荸荠瓶", group: "长颈", level: "standard", hint: "长颈扁圆腹" },
  { id: "laifu", name: "莱菔瓶", group: "长颈", level: "standard", hint: "萝卜形长颈" },
  { id: "suantou", name: "蒜头瓶", group: "长颈", level: "standard", hint: "蒜头口" },
  { id: "hejing", name: "鹤颈瓶", group: "长颈", level: "standard", hint: "极细长颈" },
  { id: "ejing", name: "鹅颈瓶", group: "长颈", level: "standard", hint: "细颈鼓腹" },
  { id: "youchui", name: "油锤瓶", group: "圆腹", level: "standard", hint: "细长颈圆腹" },
  { id: "xianwen", name: "弦纹瓶", group: "长颈", level: "standard", hint: "长颈弦纹感" },
  { id: "jingping", name: "净瓶", group: "长颈", level: "advanced", hint: "细长颈 + 侧流" },
  { id: "junchi", name: "军持", group: "长颈", level: "advanced", hint: "僧侣净水瓶" },
  { id: "zangcao", name: "藏草瓶", group: "长颈", level: "advanced", hint: "直颈鼓腹喇叭足" },
  { id: "chuandai", name: "穿带瓶", group: "长颈", level: "advanced", hint: "腹侧可穿带" },

  /* —— 橄榄 / 细长 / 筒式 —— */
  { id: "donggua", name: "冬瓜瓶", group: "橄榄", level: "standard", hint: "长圆如冬瓜" },
  { id: "gualeng", name: "瓜棱瓶", group: "橄榄", level: "standard", hint: "纵向瓜棱" },
  { id: "liuye", name: "柳叶瓶", group: "细长", level: "standard", hint: "修长如柳叶" },
  { id: "fengwei", name: "凤尾瓶", group: "S 曲", level: "standard", hint: "喇叭口外撇足" },
  { id: "xiangtui", name: "象腿瓶", group: "筒式", level: "standard", hint: "粗直筒式" },
  { id: "tongping", name: "筒瓶", group: "筒式", level: "standard", hint: "直筒敞口" },
  { id: "zhuanxin", name: "转心瓶", group: "筒式", level: "advanced", hint: "镂空窗套心" },
  { id: "jiaotai_ping", name: "交泰瓶", group: "筒式", level: "advanced", hint: "内外套合" },
  { id: "maotong", name: "帽筒", group: "筒式", level: "standard", hint: "直筒立式" },

  /* —— 方正 / 扁圆 —— */
  { id: "congshi", name: "琮式瓶", group: "方正", level: "advanced", hint: "外方内圆感" },
  { id: "guaner", name: "贯耳瓶", group: "方正", level: "advanced", hint: "颈部贯耳" },
  { id: "fangping", name: "方瓶", group: "方正", level: "advanced", hint: "方形瓶身" },
  { id: "sifang", name: "四方倭角瓶", group: "方正", level: "advanced", hint: "方腹倭角" },
  { id: "bafang", name: "八方瓶", group: "方正", level: "advanced", hint: "八角腹壁" },
  { id: "baoyue", name: "抱月瓶", group: "扁圆", level: "advanced", hint: "圆月腹双耳" },
  { id: "bianhu", name: "扁壶", group: "扁圆", level: "advanced", hint: "扁腹双系" },
  { id: "jixinbian", name: "鸡心扁壶", group: "扁圆", level: "advanced", hint: "扁腹凸脐" },

  /* —— 异形观赏瓶 —— */
  { id: "hulu", name: "葫芦瓶", group: "异形观赏", level: "advanced", hint: "双球束腰" },
  { id: "duoguan", name: "多管瓶", group: "异形观赏", level: "advanced", hint: "圆腹多管口" },
  { id: "panlong", name: "蟠龙瓶", group: "异形观赏", level: "advanced", hint: "肩饰蟠龙感" },
  { id: "shuangliang", name: "双联瓶", group: "异形观赏", level: "advanced", hint: "双瓶并联" },
  { id: "duolian", name: "多联瓶", group: "异形观赏", level: "advanced", hint: "多瓶并联" },
  { id: "shuanglu", name: "双陆瓶", group: "异形观赏", level: "advanced", hint: "双腹并联" },
  { id: "fenger", name: "凤耳瓶", group: "异形观赏", level: "advanced", hint: "颈侧凤耳" },
  { id: "shier", name: "狮耳瓶", group: "异形观赏", level: "advanced", hint: "肩饰狮耳" },
  { id: "ruyier", name: "如意耳瓶", group: "异形观赏", level: "advanced", hint: "如意形双耳" },
  { id: "longer", name: "龙耳瓶", group: "异形观赏", level: "advanced", hint: "龙形双耳" },
  { id: "biping", name: "壁瓶", group: "异形观赏", level: "advanced", hint: "半瓶可贴壁" },

  /* —— 尊类 —— */
  { id: "guanyinzun", name: "观音尊", group: "尊类", level: "standard", hint: "侈口收腹撇足" },
  { id: "fengweizun", name: "凤尾尊", group: "尊类", level: "standard", hint: "喇叭口外撇足" },
  { id: "yaoling", name: "摇铃尊", group: "尊类", level: "standard", hint: "形似摇铃" },
  { id: "yulou", name: "鱼篓尊", group: "尊类", level: "standard", hint: "大口圆腹如篓" },
  { id: "shiliu", name: "石榴尊", group: "尊类", level: "standard", hint: "口似开裂石榴" },
  { id: "taibai", name: "太白尊", group: "尊类", level: "standard", hint: "小口广腹水盂" },
  { id: "pingguo", name: "苹果尊", group: "尊类", level: "standard", hint: "无颈如苹果" },
  { id: "mati", name: "马蹄尊", group: "尊类", level: "standard", hint: "广口似马蹄" },
  { id: "niutou", name: "牛头尊", group: "尊类", level: "advanced", hint: "大口垂腹" },
  { id: "bailu", name: "百鹿尊", group: "尊类", level: "advanced", hint: "牛头式尊形" },
  { id: "chuji", name: "出戟尊", group: "尊类", level: "advanced", hint: "仿古出戟" },
  { id: "wudang", name: "无挡尊", group: "尊类", level: "advanced", hint: "上下贯通筒状" },
  { id: "luozi", name: "络子尊", group: "尊类", level: "advanced", hint: "腹饰络纹感" },
  { id: "haitang", name: "海棠尊", group: "尊类", level: "advanced", hint: "海棠式口腹" },
  { id: "biqizun", name: "荸荠尊", group: "尊类", level: "standard", hint: "扁圆如荸荠" },
  { id: "lianhua", name: "莲花尊", group: "尊类", level: "advanced", hint: "仰覆莲瓣感" },
  { id: "huazun", name: "花尊", group: "尊类", level: "standard", hint: "敞口花插尊" },
  { id: "laifuzun", name: "萝卜尊", group: "尊类", level: "standard", hint: "细颈丰肩长腹" },

  /* —— 罐类 —— */
  { id: "jiangjun", name: "将军罐", group: "罐类", level: "starter", hint: "直口丰肩宝珠盖" },
  { id: "gaiguan", name: "盖罐", group: "罐类", level: "starter", hint: "大口鼓腹有盖" },
  { id: "riyueguan", name: "日月罐", group: "罐类", level: "standard", hint: "直口溜肩鼓腹" },
  { id: "jixin", name: "鸡心罐", group: "罐类", level: "standard", hint: "腹略如鸡心" },
  { id: "gualengguan", name: "瓜棱罐", group: "罐类", level: "standard", hint: "瓜棱罐身" },
  { id: "zhefang", name: "折方罐", group: "罐类", level: "advanced", hint: "折角方腹" },
  { id: "tianzi", name: "天字罐", group: "罐类", level: "standard", hint: "小口鼓腹" },
  { id: "zhuangguan", name: "撞罐", group: "罐类", level: "standard", hint: "子母口套盖" },
  { id: "yueyaguan", name: "月牙罐", group: "罐类", level: "standard", hint: "肩饰月牙" },
  { id: "gushiguan", name: "鼓式罐", group: "罐类", level: "standard", hint: "鼓腹短颈" },
  { id: "xishuaiguan", name: "蟋蟀罐", group: "罐类", level: "standard", hint: "矮腹广口" },
  { id: "duojiaoguan", name: "多角罐", group: "罐类", level: "advanced", hint: "肩饰多角" },

  /* —— 壶类 —— */
  { id: "zhizi", name: "执壶", group: "壶类", level: "standard", hint: "长流曲柄" },
  { id: "tiliang", name: "提梁壶", group: "壶类", level: "standard", hint: "肩连提梁" },
  { id: "sengmao", name: "僧帽壶", group: "壶类", level: "advanced", hint: "口如僧帽" },
  { id: "benba", name: "贲巴壶", group: "壶类", level: "advanced", hint: "磨盘口曲流" },
  { id: "huajiao", name: "花浇", group: "壶类", level: "standard", hint: "大口短流" },
  { id: "jishou", name: "鸡首壶", group: "壶类", level: "advanced", hint: "鸡首流龙柄" },
  { id: "fengtou", name: "凤头壶", group: "壶类", level: "advanced", hint: "凤首喇叭足" },
  { id: "pankouhu", name: "盘口壶", group: "壶类", level: "standard", hint: "盘口鼓腹" },
  { id: "pinang", name: "皮囊壶", group: "壶类", level: "advanced", hint: "仿皮囊扁体" },
  { id: "jiguan", name: "鸡冠壶", group: "壶类", level: "advanced", hint: "顶如鸡冠" },
  { id: "chuandaihu", name: "穿带壶", group: "壶类", level: "advanced", hint: "侧有穿带孔" },
  { id: "lihu", name: "梨壶", group: "壶类", level: "standard", hint: "腹如梨形" },
  { id: "huluhu", name: "葫芦壶", group: "壶类", level: "standard", hint: "葫芦式壶身" },
  { id: "duomu", name: "多穆壶", group: "壶类", level: "advanced", hint: "筒腹藏式" },
  { id: "tuohu", name: "唾壶", group: "壶类", level: "standard", hint: "洗口鼓腹" },

  /* —— 觚洗 —— */
  { id: "huagu", name: "花觚", group: "觚洗", level: "starter", hint: "喇叭口广底" },
  { id: "guxing", name: "觚形瓶", group: "觚洗", level: "starter", hint: "仿青铜觚" },
  { id: "zhadou", name: "渣斗", group: "觚洗", level: "standard", hint: "敞口鼓腹撇足" },
  { id: "huacha", name: "花插", group: "觚洗", level: "standard", hint: "小口花器" },
  { id: "huacang", name: "花囊", group: "觚洗", level: "standard", hint: "多孔插花" },
  { id: "lishi", name: "鬲式炉", group: "觚洗", level: "advanced", hint: "袋足鼎鬲感" },
  { id: "dingshi", name: "鼎式炉", group: "觚洗", level: "advanced", hint: "双耳三足" },
  { id: "tonglu", name: "筒式炉", group: "觚洗", level: "standard", hint: "直筒香炉" },
  { id: "bolu", name: "钵式炉", group: "觚洗", level: "standard", hint: "敛口如钵" },
  { id: "yuerlu", name: "鱼耳炉", group: "觚洗", level: "advanced", hint: "双鱼耳" },
];

(function () {
  const clamp = (v, a = 0.03, b = 0.56) => Math.max(a, Math.min(b, v));
  const mix = (a, b, u) => a + (b - a) * Math.max(0, Math.min(1, u));
  const smooth = (u) => {
    const x = Math.max(0, Math.min(1, u));
    return x * x * (3 - 2 * x);
  };
  const disk = (t, cy, rr) => {
    const dy = (t - cy) / rr;
    if (Math.abs(dy) > 1) return null;
    return rr * Math.sqrt(Math.max(0, 1 - dy * dy));
  };

  /** 关键关键：按高度段线性插值半径关键点 [[t,r],...] */
  function poly(t, pts) {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) {
        const u = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1e-6);
        return mix(pts[i - 1][1], pts[i][1], smooth(u));
      }
    }
    return pts[pts.length - 1][1];
  }

  function scaled(pts, B, R, F) {
    return pts.map(([t, r], i) => {
      if (i === 0) return [t, r * R];
      if (i === pts.length - 1) return [t, r * F];
      return [t, r * B];
    });
  }

  /**
   * 返回归一化高度 t∈[0,1]（顶→底）处的半宽半径（约 0.05–0.55）
   * belly/rim/foot: 0–1 微调系数
   */
  window.jiaotaiVesselRadius = function vesselRadius(t, id, belly, rim, foot) {
    const B = 0.75 + belly * 0.55;
    const R = 0.7 + rim * 0.6;
    const F = 0.7 + foot * 0.55;

    const P = {
      meiping: [
        [0, 0.065],
        [0.05, 0.07],
        [0.18, 0.31],
        [0.86, 0.125],
        [1, 0.095],
      ],
      yuhuchun: [
        [0, 0.14],
        [0.08, 0.12],
        [0.35, 0.06],
        [0.72, 0.28],
        [0.9, 0.14],
        [1, 0.1],
      ],
      danping: [
        [0, 0.05],
        [0.4, 0.07],
        [0.72, 0.26],
        [0.9, 0.12],
        [1, 0.09],
      ],
      tianqiu: [
        [0, 0.1],
        [0.26, 0.1],
        [0.45, 0.28],
        [0.62, 0.32],
        [0.85, 0.18],
        [1, 0.12],
      ],
      ganlan: [
        [0, 0.12],
        [0.15, 0.14],
        [0.5, 0.26],
        [0.85, 0.14],
        [1, 0.12],
      ],
      guanyin: [
        [0, 0.12],
        [0.12, 0.08],
        [0.3, 0.26],
        [0.55, 0.14],
        [0.82, 0.18],
        [1, 0.12],
      ],
      denglong: [
        [0, 0.14],
        [0.1, 0.2],
        [0.5, 0.24],
        [0.88, 0.2],
        [1, 0.12],
      ],
      bangchui: [
        [0, 0.16],
        [0.1, 0.12],
        [0.22, 0.24],
        [0.88, 0.24],
        [1, 0.14],
      ],
      shangping: [
        [0, 0.15],
        [0.08, 0.08],
        [0.35, 0.1],
        [0.5, 0.28],
        [0.85, 0.14],
        [1, 0.1],
      ],
      zhijing: [
        [0, 0.1],
        [0.32, 0.1],
        [0.55, 0.28],
        [0.88, 0.14],
        [1, 0.11],
      ],
      pankou: [
        [0, 0.16],
        [0.07, 0.16],
        [0.14, 0.07],
        [0.38, 0.3],
        [0.82, 0.16],
        [1, 0.12],
      ],
      huakou: [
        [0, 0.18],
        [0.08, 0.12],
        [0.35, 0.07],
        [0.7, 0.24],
        [1, 0.1],
      ],
      xikou: [
        [0, 0.2],
        [0.1, 0.16],
        [0.2, 0.08],
        [0.55, 0.26],
        [0.88, 0.14],
        [1, 0.11],
      ],
      juankou: [
        [0, 0.17],
        [0.06, 0.14],
        [0.28, 0.07],
        [0.65, 0.25],
        [1, 0.1],
      ],
      biqi: [
        [0, 0.055],
        [0.45, 0.07],
        [0.62, 0.3],
        [0.78, 0.18],
        [1, 0.12],
      ],
      laifu: [
        [0, 0.055],
        [0.38, 0.08],
        [0.65, 0.24],
        [0.88, 0.12],
        [1, 0.08],
      ],
      suantou: [
        [0, 0.09],
        [0.08, 0.1],
        [0.14, 0.06],
        [0.45, 0.07],
        [0.7, 0.26],
        [1, 0.1],
      ],
      hejing: [
        [0, 0.06],
        [0.55, 0.05],
        [0.75, 0.22],
        [0.92, 0.1],
        [1, 0.08],
      ],
      ejing: [
        [0, 0.07],
        [0.42, 0.06],
        [0.7, 0.27],
        [0.9, 0.12],
        [1, 0.09],
      ],
      youchui: [
        [0, 0.05],
        [0.48, 0.055],
        [0.7, 0.3],
        [0.9, 0.14],
        [1, 0.1],
      ],
      xianwen: [
        [0, 0.1],
        [0.4, 0.09],
        [0.6, 0.24],
        [0.9, 0.12],
        [1, 0.1],
      ],
      jingping: [
        [0, 0.12],
        [0.08, 0.1],
        [0.4, 0.055],
        [0.7, 0.26],
        [1, 0.12],
      ],
      junchi: [
        [0, 0.1],
        [0.35, 0.06],
        [0.65, 0.24],
        [0.85, 0.14],
        [1, 0.16],
      ],
      zangcao: [
        [0, 0.08],
        [0.25, 0.1],
        [0.35, 0.14],
        [0.55, 0.26],
        [0.78, 0.12],
        [1, 0.18],
      ],
      chuandai: [
        [0, 0.14],
        [0.12, 0.08],
        [0.5, 0.24],
        [0.88, 0.12],
        [1, 0.1],
      ],
      donggua: [
        [0, 0.12],
        [0.2, 0.18],
        [0.5, 0.24],
        [0.85, 0.16],
        [1, 0.1],
      ],
      gualeng: [
        [0, 0.12],
        [0.2, 0.16],
        [0.5, 0.26],
        [0.85, 0.14],
        [1, 0.11],
      ],
      liuye: [
        [0, 0.09],
        [0.12, 0.12],
        [0.35, 0.16],
        [0.9, 0.06],
        [1, 0.045],
      ],
      fengwei: [
        [0, 0.2],
        [0.15, 0.1],
        [0.4, 0.26],
        [0.7, 0.14],
        [1, 0.22],
      ],
      xiangtui: [
        [0, 0.2],
        [0.12, 0.26],
        [1, 0.26],
      ],
      tongping: [
        [0, 0.18],
        [0.08, 0.22],
        [0.92, 0.22],
        [1, 0.16],
      ],
      zhuanxin: [
        [0, 0.16],
        [0.12, 0.22],
        [0.85, 0.24],
        [1, 0.14],
      ],
      jiaotai_ping: [
        [0, 0.15],
        [0.12, 0.22],
        [0.5, 0.24],
        [0.88, 0.22],
        [1, 0.14],
      ],
      maotong: [
        [0, 0.2],
        [0.06, 0.22],
        [1, 0.22],
      ],
      congshi: [
        [0, 0.1],
        [0.12, 0.2],
        [0.88, 0.22],
        [1, 0.12],
      ],
      guaner: [
        [0, 0.12],
        [0.2, 0.1],
        [0.4, 0.22],
        [0.88, 0.22],
        [1, 0.12],
      ],
      fangping: [
        [0, 0.12],
        [0.15, 0.2],
        [0.88, 0.22],
        [1, 0.14],
      ],
      sifang: [
        [0, 0.11],
        [0.18, 0.2],
        [0.85, 0.22],
        [1, 0.13],
      ],
      bafang: [
        [0, 0.12],
        [0.2, 0.21],
        [0.85, 0.23],
        [1, 0.13],
      ],
      baoyue: null,
      bianhu: [
        [0, 0.08],
        [0.2, 0.1],
        [0.5, 0.28],
        [0.85, 0.12],
        [1, 0.08],
      ],
      jixinbian: [
        [0, 0.07],
        [0.25, 0.12],
        [0.55, 0.26],
        [0.85, 0.1],
        [1, 0.07],
      ],
      hulu: null,
      duoguan: [
        [0, 0.06],
        [0.16, 0.08],
        [0.28, 0.26],
        [0.78, 0.28],
        [1, 0.14],
      ],
      panlong: [
        [0, 0.14],
        [0.18, 0.24],
        [1, 0.26],
      ],
      shuangliang: [
        [0, 0.1],
        [0.2, 0.16],
        [0.5, 0.22],
        [0.85, 0.16],
        [1, 0.1],
      ],
      duolian: [
        [0, 0.12],
        [0.25, 0.18],
        [0.55, 0.24],
        [0.88, 0.16],
        [1, 0.1],
      ],
      shuanglu: [
        [0, 0.1],
        [0.3, 0.2],
        [0.55, 0.24],
        [0.85, 0.18],
        [1, 0.1],
      ],
      fenger: [
        [0, 0.12],
        [0.25, 0.1],
        [0.55, 0.26],
        [0.9, 0.12],
        [1, 0.1],
      ],
      shier: [
        [0, 0.14],
        [0.2, 0.12],
        [0.45, 0.28],
        [0.88, 0.14],
        [1, 0.11],
      ],
      ruyier: [
        [0, 0.12],
        [0.22, 0.1],
        [0.5, 0.26],
        [0.9, 0.12],
        [1, 0.1],
      ],
      longer: [
        [0, 0.13],
        [0.2, 0.11],
        [0.5, 0.28],
        [0.9, 0.13],
        [1, 0.11],
      ],
      biping: [
        [0, 0.08],
        [0.2, 0.14],
        [0.55, 0.22],
        [0.9, 0.1],
        [1, 0.06],
      ],
      guanyinzun: [
        [0, 0.16],
        [0.12, 0.1],
        [0.35, 0.28],
        [0.7, 0.14],
        [1, 0.2],
      ],
      fengweizun: [
        [0, 0.22],
        [0.18, 0.1],
        [0.42, 0.28],
        [0.72, 0.14],
        [1, 0.24],
      ],
      yaoling: [
        [0, 0.08],
        [0.2, 0.12],
        [0.55, 0.28],
        [0.9, 0.1],
        [1, 0.06],
      ],
      yulou: [
        [0, 0.22],
        [0.12, 0.2],
        [0.5, 0.3],
        [0.9, 0.22],
        [1, 0.18],
      ],
      shiliu: [
        [0, 0.18],
        [0.1, 0.12],
        [0.45, 0.3],
        [0.88, 0.14],
        [1, 0.12],
      ],
      taibai: [
        [0, 0.06],
        [0.12, 0.08],
        [0.4, 0.3],
        [0.9, 0.28],
        [1, 0.24],
      ],
      pingguo: [
        [0, 0.04],
        [0.08, 0.12],
        [0.45, 0.3],
        [0.9, 0.24],
        [1, 0.12],
      ],
      mati: [
        [0, 0.22],
        [0.15, 0.18],
        [0.55, 0.28],
        [1, 0.24],
      ],
      niutou: [
        [0, 0.22],
        [0.2, 0.26],
        [0.65, 0.32],
        [1, 0.16],
      ],
      bailu: [
        [0, 0.22],
        [0.2, 0.26],
        [0.65, 0.32],
        [1, 0.16],
      ],
      chuji: [
        [0, 0.2],
        [0.25, 0.12],
        [0.5, 0.22],
        [0.75, 0.14],
        [1, 0.22],
      ],
      wudang: [
        [0, 0.2],
        [0.5, 0.22],
        [1, 0.2],
      ],
      luozi: [
        [0, 0.14],
        [0.2, 0.18],
        [0.55, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      haitang: [
        [0, 0.16],
        [0.2, 0.14],
        [0.5, 0.26],
        [0.88, 0.14],
        [1, 0.12],
      ],
      biqizun: [
        [0, 0.1],
        [0.25, 0.14],
        [0.5, 0.3],
        [0.8, 0.16],
        [1, 0.1],
      ],
      lianhua: [
        [0, 0.18],
        [0.2, 0.22],
        [0.55, 0.26],
        [0.85, 0.16],
        [1, 0.2],
      ],
      huazun: [
        [0, 0.2],
        [0.25, 0.14],
        [0.6, 0.24],
        [1, 0.18],
      ],
      laifuzun: [
        [0, 0.08],
        [0.25, 0.08],
        [0.4, 0.24],
        [0.85, 0.12],
        [1, 0.08],
      ],
      jiangjun: [
        [0, 0.1],
        [0.08, 0.12],
        [0.25, 0.3],
        [0.75, 0.26],
        [0.92, 0.14],
        [1, 0.12],
      ],
      gaiguan: [
        [0, 0.16],
        [0.12, 0.2],
        [0.4, 0.3],
        [0.85, 0.16],
        [1, 0.14],
      ],
      riyueguan: [
        [0, 0.12],
        [0.15, 0.18],
        [0.5, 0.28],
        [0.9, 0.16],
        [1, 0.14],
      ],
      jixin: [
        [0, 0.1],
        [0.2, 0.16],
        [0.55, 0.28],
        [0.88, 0.12],
        [1, 0.1],
      ],
      gualengguan: [
        [0, 0.14],
        [0.25, 0.22],
        [0.55, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      zhefang: [
        [0, 0.12],
        [0.2, 0.2],
        [0.85, 0.22],
        [1, 0.14],
      ],
      tianzi: [
        [0, 0.08],
        [0.2, 0.16],
        [0.5, 0.28],
        [0.88, 0.14],
        [1, 0.12],
      ],
      zhuangguan: [
        [0, 0.14],
        [0.15, 0.2],
        [0.5, 0.28],
        [0.9, 0.16],
        [1, 0.14],
      ],
      yueyaguan: [
        [0, 0.12],
        [0.22, 0.2],
        [0.55, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      gushiguan: [
        [0, 0.16],
        [0.2, 0.26],
        [0.6, 0.3],
        [0.9, 0.22],
        [1, 0.18],
      ],
      xishuaiguan: [
        [0, 0.22],
        [0.2, 0.26],
        [0.7, 0.28],
        [1, 0.22],
      ],
      duojiaoguan: [
        [0, 0.12],
        [0.2, 0.22],
        [0.35, 0.26],
        [0.8, 0.24],
        [1, 0.14],
      ],
      zhizi: [
        [0, 0.1],
        [0.2, 0.08],
        [0.55, 0.26],
        [0.9, 0.12],
        [1, 0.1],
      ],
      tiliang: [
        [0, 0.08],
        [0.25, 0.14],
        [0.55, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      sengmao: [
        [0, 0.2],
        [0.12, 0.14],
        [0.35, 0.12],
        [0.6, 0.26],
        [1, 0.12],
      ],
      benba: [
        [0, 0.16],
        [0.12, 0.08],
        [0.4, 0.1],
        [0.6, 0.26],
        [0.82, 0.12],
        [1, 0.18],
      ],
      huajiao: [
        [0, 0.18],
        [0.2, 0.14],
        [0.55, 0.26],
        [0.9, 0.14],
        [1, 0.12],
      ],
      jishou: [
        [0, 0.1],
        [0.2, 0.12],
        [0.55, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      fengtou: [
        [0, 0.12],
        [0.18, 0.1],
        [0.5, 0.26],
        [0.8, 0.14],
        [1, 0.2],
      ],
      pankouhu: [
        [0, 0.16],
        [0.12, 0.12],
        [0.45, 0.28],
        [0.9, 0.14],
        [1, 0.12],
      ],
      pinang: [
        [0, 0.08],
        [0.2, 0.16],
        [0.55, 0.26],
        [0.9, 0.18],
        [1, 0.14],
      ],
      jiguan: [
        [0, 0.06],
        [0.15, 0.14],
        [0.5, 0.26],
        [0.9, 0.16],
        [1, 0.12],
      ],
      chuandaihu: [
        [0, 0.1],
        [0.2, 0.12],
        [0.55, 0.26],
        [0.9, 0.14],
        [1, 0.12],
      ],
      lihu: [
        [0, 0.08],
        [0.25, 0.12],
        [0.6, 0.28],
        [0.9, 0.12],
        [1, 0.09],
      ],
      huluhu: [
        [0, 0.1],
        [0.25, 0.16],
        [0.4, 0.08],
        [0.7, 0.26],
        [1, 0.1],
      ],
      duomu: [
        [0, 0.14],
        [0.15, 0.2],
        [0.85, 0.22],
        [1, 0.16],
      ],
      tuohu: [
        [0, 0.2],
        [0.15, 0.14],
        [0.5, 0.28],
        [0.9, 0.16],
        [1, 0.14],
      ],
      huagu: [
        [0, 0.24],
        [0.25, 0.1],
        [0.5, 0.16],
        [0.75, 0.12],
        [1, 0.24],
      ],
      guxing: [
        [0, 0.22],
        [0.28, 0.1],
        [0.5, 0.18],
        [0.72, 0.12],
        [1, 0.22],
      ],
      zhadou: [
        [0, 0.24],
        [0.2, 0.14],
        [0.5, 0.26],
        [0.8, 0.14],
        [1, 0.2],
      ],
      huacha: [
        [0, 0.08],
        [0.3, 0.1],
        [0.6, 0.2],
        [0.9, 0.1],
        [1, 0.08],
      ],
      huacang: [
        [0, 0.16],
        [0.2, 0.2],
        [0.6, 0.24],
        [0.9, 0.14],
        [1, 0.12],
      ],
      lishi: [
        [0, 0.16],
        [0.3, 0.22],
        [0.7, 0.2],
        [1, 0.1],
      ],
      dingshi: [
        [0, 0.14],
        [0.25, 0.22],
        [0.7, 0.2],
        [1, 0.08],
      ],
      tonglu: [
        [0, 0.18],
        [0.15, 0.2],
        [0.85, 0.2],
        [1, 0.16],
      ],
      bolu: [
        [0, 0.14],
        [0.3, 0.24],
        [0.8, 0.22],
        [1, 0.12],
      ],
      yuerlu: [
        [0, 0.14],
        [0.35, 0.24],
        [0.85, 0.2],
        [1, 0.12],
      ],
    };

    // 特殊：抱月（圆月腹）
    if (id === "baoyue") {
      const cy = 0.55;
      const rr = 0.28 * B;
      const d = disk(t, cy, rr);
      if (d != null) return clamp(d);
      if (t < 0.22) return clamp(0.06 * R);
      return clamp(0.05 * F);
    }

    // 特殊：葫芦（双球）
    if (id === "hulu" || id === "huluhu") {
      if (t < 0.38) {
        const d = disk(t, 0.2, 0.14 * B * (0.85 + rim * 0.2));
        if (d != null) return clamp(d);
        return clamp(0.05);
      }
      if (t < 0.46) return clamp(0.07);
      const d = disk(t, 0.68, 0.26 * B);
      if (d != null) return clamp(d);
      return clamp(0.1 * F);
    }

    // 天球强化圆腹
    if (id === "tianqiu") {
      if (t < 0.28) return clamp(0.1 * R);
      const d = disk(t, 0.62, 0.3 * B);
      if (d != null) return clamp(d);
      return clamp(0.12 * F);
    }

    const pts = P[id];
    if (!pts) return clamp(0.22 * B);
    return clamp(poly(t, scaled(pts, B, R, F)));
  };

  function softDisk(dx, dy, rx, ry) {
    const d = Math.sqrt((dx / rx) * (dx / rx) + (dy / ry) * (dy / ry));
    if (d >= 1.15) return 0;
    return Math.max(0, Math.min(1, (1.15 - d) / 0.28));
  }

  /** 局部附件：多管、贯耳、抱月耳、净瓶侧流、狮耳等 */
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
    if ((id === "guaner" || id === "chuandai" || id === "chuandaihu") && ny > 0.08 && ny < 0.3) {
      for (const side of [-1, 1]) {
        const ex = cx + side * 0.16;
        const a = softDisk(nx - ex, ny - 0.17, 0.032, 0.065);
        if (a > 0.05) return { u: side > 0 ? 0.85 : 0.15, v: ny, shade: 0.84, alpha: a * 0.92 };
      }
    }
    if (
      (id === "baoyue" || id === "fenger" || id === "shier" || id === "ruyier" || id === "longer") &&
      ny > 0.14 &&
      ny < 0.36
    ) {
      for (const side of [-1, 1]) {
        const ex = cx + side * (0.1 + belly * 0.04);
        const dx = nx - ex;
        const dy = ny - 0.25;
        const r = Math.hypot(dx * 2.2, dy * 1.4);
        const ring = Math.max(0, 1 - Math.abs(r - 0.042) / 0.018);
        if (ring > 0.05) return { u: side > 0 ? 0.8 : 0.2, v: ny, shade: 0.82, alpha: ring * 0.9 };
      }
    }
    if (id === "jingping" || id === "junchi" || id === "zhizi" || id === "huajiao") {
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
    if ((id === "tiliang" || id === "sengmao") && ny < 0.22) {
      const a = softDisk(nx - cx, ny - 0.08, 0.16, 0.05);
      if (a > 0.08) return { u: 0.5, v: ny, shade: 0.86, alpha: a * 0.7 };
    }
    return null;
  };
})();
