// ==========================================================
// RB Drinks — versão escura · interações
// ==========================================================

// Número de WhatsApp (somente dígitos: 55 + DDD + número). Troque pelo real.
const WHATSAPP = "5500000000000";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

document.getElementById("year").textContent = new Date().getFullYear();
$$(".js-wa").forEach((a) => (a.href = `https://wa.me/${WHATSAPP}`));

// ---------- Intro ----------
const loader = $("#loader");
const start = () => {
  loader.classList.add("is-done");
  document.body.classList.remove("is-loading");
  setTimeout(() => document.body.classList.add("is-ready"), 250);
  setTimeout(() => loader.remove(), 1400);
};
window.addEventListener("load", () => setTimeout(start, reduce ? 0 : 900));
setTimeout(() => document.body.classList.contains("is-loading") && start(), 3500); // segurança

// ---------- Nav ----------
const nav = $("#nav");
let lastY = 0;
const toggle = $("#navToggle");
const links = $("#navLinks");
const setMenu = (open) => {
  links.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
$$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ---------- Revelações ----------
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }),
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
$$(".reveal").forEach((el) => io.observe(el));
// .clip começa recortado (área visível zero), então observamos o elemento pai
const clipIO = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$(":scope > .clip", e.target).forEach((c) => c.classList.add("is-visible"));
      clipIO.unobserve(e.target);
    }),
  { threshold: 0.2 }
);
new Set($$(".clip").map((c) => c.parentElement)).forEach((p) => clipIO.observe(p));
$$("#gallery figure").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});
$$("#steps li").forEach((el, i) => (el.style.transitionDelay = `${i * 120}ms`));

// ---------- Texto palavra por palavra ----------
const wordBlocks = $$("[data-words]").map((el) => {
  el.innerHTML = el.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`)
    .join(" ");
  return { el, words: $$(".w", el) };
});

// ---------- Prévia de imagem na carta ----------
const preview = $("#menuPreview");
const pImg = $("img", preview);
let px = 0, py = 0, cx = 0, cy = 0;
if (matchMedia("(hover: hover)").matches) {
  $$(".menu__item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      pImg.src = item.dataset.img;
      preview.classList.add("is-on");
    });
    item.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
  });
  window.addEventListener("mousemove", (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
}
// pré-carrega as imagens da carta
$$(".menu__item").forEach((i) => (new Image().src = i.dataset.img));

// ---------- Scroll horizontal (serviços) ----------
const hs = $("#servicos");
const track = $("#hsTrack");
const hsBar = $("#hsBar");
const isDesktop = () => innerWidth > 860;
const sizeHS = () => {
  hs.style.height = isDesktop() ? `${track.scrollWidth - innerWidth + innerHeight}px` : "auto";
};
window.addEventListener("resize", sizeHS);
window.addEventListener("load", sizeHS);
sizeHS();

// ---------- Loop de animação (rolagem) ----------
const steps = $("#steps");
const parallax = $$("[data-speed]");

function frame() {
  const y = scrollY;
  const vh = innerHeight;

  // nav: esconde ao descer, mostra ao subir
  nav.classList.toggle("is-scrolled", y > 40);
  if (!links.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > lastY && y > vh * 0.8);
  lastY = y;
  $(".wa-float").classList.toggle("is-on", y > vh * 0.6);

  if (!reduce) {
    // palavras do manifesto/citação
    wordBlocks.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    });

    // serviços horizontal
    if (isDesktop()) {
      const r = hs.getBoundingClientRect();
      const max = hs.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -r.top / max));
      track.style.transform = `translate3d(${-p * (track.scrollWidth - innerWidth)}px,0,0)`;
      hsBar.style.transform = `scaleX(${p})`;
    }

    // linha do processo
    const sr = steps.getBoundingClientRect();
    steps.style.setProperty("--p", Math.min(1, Math.max(0, (vh * 0.8 - sr.top) / (vh * 0.5))).toFixed(3));

    // parallax suave
    parallax.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const off = (r.top + r.height / 2 - vh / 2) * -parseFloat(img.dataset.speed);
      img.style.translate = `0 ${off}px`;
    });

    // prévia segue o mouse com atraso
    cx += (px - cx) * 0.14;
    cy += (py - cy) * 0.14;
    preview.style.left = `${cx}px`;
    preview.style.top = `${cy}px`;
  } else {
    $$(".w").forEach((w) => w.classList.add("on"));
    steps.style.setProperty("--p", 1);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- Lightbox ----------
const imgs = $$("#gallery img");
const lb = $("#lightbox");
const lbImg = $("img", lb);
const lbCount = $("#lbCount");
let cur = 0;
const show = (i) => {
  cur = (i + imgs.length) % imgs.length;
  lbImg.src = imgs[cur].src;
  lbImg.alt = imgs[cur].alt;
  lbCount.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(imgs.length).padStart(2, "0")}`;
};
const openLB = (i) => { show(i); lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
const closeLB = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
imgs.forEach((img, i) => img.parentElement.addEventListener("click", () => openLB(i)));
$(".lightbox__close").addEventListener("click", closeLB);
$(".lightbox__prev").addEventListener("click", () => show(cur - 1));
$(".lightbox__next").addEventListener("click", () => show(cur + 1));
lb.addEventListener("click", (e) => e.target === lb && closeLB());
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLB();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});
// gesto de deslizar no celular
let tx = 0;
lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
});

// ---------- Formulário → WhatsApp ----------
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = f.get("data") ? new Date(f.get("data") + "T12:00").toLocaleDateString("pt-BR") : "a definir";
  const msg =
    `Olá, RB Drinks! Meu nome é ${f.get("nome")}.\n` +
    `Gostaria de um orçamento:\n` +
    `• Evento: ${f.get("tipo")}\n` +
    `• Data: ${data}\n` +
    `• Convidados: ${f.get("convidados") || "a definir"}` +
    (f.get("mensagem") ? `\n\n${f.get("mensagem")}` : "");
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
});
