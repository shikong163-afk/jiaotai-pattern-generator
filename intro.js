(() => {
  const gate = document.getElementById("gate");
  const stages = {
    1: document.getElementById("stage1"),
    2: document.getElementById("stage2"),
  };
  const dots = [...document.querySelectorAll(".progress .dot")];
  const unlocked = new Set([1]);
  let stage = 1;
  let giftBusy = false;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(n, { force = false } = {}) {
    if (!force && !unlocked.has(n)) return;
    stage = n;
    gate.dataset.stage = String(n);
    Object.entries(stages).forEach(([k, el]) => {
      if (!el) return;
      const on = Number(k) === n;
      el.hidden = !on;
      el.classList.toggle("is-active", on);
    });
    dots.forEach((dot) => {
      const id = Number(dot.dataset.go);
      dot.classList.toggle("active", id === n);
      dot.disabled = !unlocked.has(id);
    });
    document.body.classList.toggle("gate-boot", n === 1);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    paintIntroBg(n);
  }

  function paintIntroBg(n) {
    const canvas = document.getElementById("bgVessels");
    if (!canvas || !window.JiaotaiVesselUI) return;
    window.JiaotaiVesselUI.paintBgSilhouettes(canvas, n * 5 + 2);
  }
  window.addEventListener("resize", () => paintIntroBg(stage));

  const backGift = document.getElementById("backGift");
  if (backGift) {
    backGift.addEventListener("click", () => go(1, { force: true }));
  }
  dots.forEach((dot) => {
    dot.addEventListener("click", () => go(Number(dot.dataset.go)));
  });

  // Lid 950ms + pause 400ms, then stage-2 fade 850ms. Same numbers as intro.css.
  const giftBox = document.getElementById("giftBox");
  const giftLid = document.getElementById("giftLid");
  const giftStageEl = document.getElementById("stage1");
  const tReveal = reduced ? 0 : 1350;
  const tEnter = reduced ? 0 : 850;

  function resetGift() {
    giftBusy = false;
    giftBox.classList.remove("is-open", "is-sucking");
    giftStageEl.classList.remove("is-sucking");
  }

  function openGift() {
    if (giftBusy) return;
    giftBusy = true;
    unlocked.add(2);
    giftBox.classList.add("is-open");

    setTimeout(() => {
      go(2, { force: true });
      setTimeout(() => {
        resetGift();
      }, tEnter);
    }, tReveal);
  }

  giftLid.addEventListener("click", (e) => {
    e.stopPropagation();
    openGift();
  });
  giftBox.addEventListener("click", () => {
    if (!giftBusy) openGift();
  });

  // Animate journey map chips
  const map = document.getElementById("journeyMap");
  if (map) {
    [...map.children].forEach((li, i) => {
      li.style.setProperty("--i", String(i));
    });
  }

  const params = new URLSearchParams(location.search);
  if (params.get("skip") === "1" || params.get("enter") === "1") {
    unlocked.add(2);
    go(2, { force: true });
  } else {
    go(1, { force: true });
  }
})();
