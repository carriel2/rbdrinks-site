// ==========================================================
// RB Drinks — interações
// ==========================================================

// Número de WhatsApp (somente dígitos, com DDI 55 + DDD). Troque pelo número real.
const WHATSAPP = "5500000000000";

// Ano no rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Nav: fundo ao rolar
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menu mobile
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  })
);

// Animação de entrada
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  io.observe(el);
});

// Parallax suave no banner
const bannerImg = document.querySelector(".banner img");
if (bannerImg && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener(
    "scroll",
    () => {
      const r = bannerImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height) / (innerHeight + r.height);
        bannerImg.style.transform = `translateY(${(p - 1) * 16}%)`;
      }
    },
    { passive: true }
  );
}

// Lightbox da galeria
const imgs = [...document.querySelectorAll("#gallery img")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let current = 0;
const show = (i) => {
  current = (i + imgs.length) % imgs.length;
  lbImg.src = imgs[current].src;
  lbImg.alt = imgs[current].alt;
};
const open = (i) => { show(i); lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false"); };
const close = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); };
imgs.forEach((img, i) => img.parentElement.addEventListener("click", () => open(i)));
lb.querySelector(".lightbox__close").addEventListener("click", close);
lb.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
lb.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("is-open")) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});

// Formulário → mensagem pronta no WhatsApp
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = f.get("data") ? new Date(f.get("data") + "T12:00").toLocaleDateString("pt-BR") : "a definir";
  const msg =
    `Olá, RB Drinks! Meu nome é ${f.get("nome")}.\n` +
    `Gostaria de um orçamento:\n` +
    `• Evento: ${f.get("tipo")}\n` +
    `• Data: ${data}\n` +
    `• Convidados: ${f.get("convidados") || "a definir"}\n` +
    `• Chopp/cerveja: ${f.get("cerveja")}\n` +
    (f.get("mensagem") ? `\n${f.get("mensagem")}` : "");
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
});
