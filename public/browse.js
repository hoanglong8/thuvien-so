(() => {
  const $ = (s) => document.querySelector(s);
  const CFG = JSON.parse($("#cfg").textContent);
  const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const slugify = (s) => fold(s).replace(/&/g, " va ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "sach";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => n.toLocaleString(CFG.lang);
  const route = (k, s) => CFG.routes[k].replace("§", s);
  const PAGE = 40;

  let BOOKS = [];
  const st = { tab: "new", topic: "", q: "", lang: "", era: "", shown: PAGE };

  function hue(t) { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }

  function card(b) {
    const cover = b.c
      ? `<img class="cover" src="${esc(b.c)}" alt="" loading="lazy">`
      : `<div class="cover ph" style="background:hsl(${hue(b.t)} 35% 38%)" aria-hidden="true">${esc(b.t)}</div>`;
    const authors = (b.a || []).map((a) => `<a href="${route("author", slugify(a))}">${esc(a)}</a>`).join(", ");
    const tags = (b.f ? `<span class="tag free">${esc(CFG.t.free)} · ${b.f === "gdoc" ? "PDF" : b.f.toUpperCase()}</span>` : `<span class="tag">${esc(CFG.t.infoOnly)}</span>`)
      + (b.tp || []).map((x) => `<a class="tag" href="${route("topic", slugify(x))}">${esc(x)}</a>`).join("");
    return `<li class="book"><a href="${route("book", b.s)}" tabindex="-1">${cover}</a><div>
      <p class="t"><a href="${route("book", b.s)}">${esc(b.t)}</a></p>
      ${b.o ? `<p class="tv">${esc(b.o)}</p>` : ""}
      <p class="a">${authors}${b.y ? ` · ${b.y}` : ""}</p>
      <div class="tags">${tags}</div></div></li>`;
  }

  function chips() {
    $("#chips").innerHTML = [`<button data-t="" class="${st.topic ? "" : "on"}">${esc(CFG.t.allTopics)}</button>`]
      .concat(CFG.topics.slice(0, 40).map(([s, name, n]) => `<button data-t="${esc(s)}" class="${st.topic === s ? "on" : ""}">${esc(name)}<small>${fmt(n)}</small></button>`)).join("");
  }

  function filtered() {
    const words = fold(st.q).trim().split(/\s+/).filter(Boolean);
    const [y0, y1] = st.era ? st.era.split("-").map(Number) : [0, 0];
    let r = BOOKS.filter((b) =>
      (!st.topic || b._tp.includes(st.topic)) &&
      (!st.lang || b.l === st.lang) &&
      (!st.era || (b.y && b.y >= y0 && b.y <= y1)) &&
      words.every((w) => b._s.includes(w)));
    if (st.tab === "free") r = r.filter((b) => b.f);
    if (st.tab === "all") r = [...r].sort((a, b) => a.t.localeCompare(b.t, "vi"));
    return r;
  }

  function render() {
    const r = filtered();
    $("#count").textContent = r.length ? CFG.t.count.replace("§", fmt(r.length)) : CFG.t.empty;
    $("#list").innerHTML = `<ol class="list">${r.slice(0, st.shown).map(card).join("")}</ol>`;
    $("#more").hidden = r.length <= st.shown;
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === st.tab));
    const p = new URLSearchParams();
    if (st.tab !== "new") p.set("tab", st.tab);
    if (st.topic) p.set("chu-de", st.topic);
    if (st.q) p.set("q", st.q);
    if (st.lang) p.set("ngon-ngu", st.lang);
    if (st.era) p.set("nam", st.era);
    history.replaceState(null, "", p.toString() ? "#" + p : location.pathname);
  }

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    st.tab = p.get("tab") || "new"; st.topic = p.get("chu-de") || ""; st.q = p.get("q") || "";
    st.lang = p.get("ngon-ngu") || ""; st.era = p.get("nam") || "";
    $("#q").value = st.q; $("#lang").value = st.lang; $("#era").value = st.era;
  }

  const reset = () => { st.shown = PAGE; render(); };
  $("#tabs").onclick = (e) => { const t = e.target.closest("button")?.dataset.tab; if (t) { st.tab = t; reset(); } };
  $("#chips").onclick = (e) => { const b = e.target.closest("button"); if (b) { st.topic = b.dataset.t; chips(); reset(); } };
  let tm; $("#q").oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { st.q = e.target.value; reset(); }, 150); };
  $("#lang").onchange = (e) => { st.lang = e.target.value; reset(); };
  $("#era").onchange = (e) => { st.era = e.target.value; reset(); };
  $("#more").onclick = () => { st.shown += PAGE; render(); };

  fetch("/search-index.json").then((r) => r.json()).then((data) => {
    BOOKS = data.map((b) => ({ ...b, _tp: (b.tp || []).map(slugify), _s: fold([b.t, b.o, ...(b.a || []), ...(b.tr || []), b.p, b.i, b.sr, ...(b.tg || [])].join(" ")) }));
    readHash(); chips(); render();
  }).catch(() => {});
})();
