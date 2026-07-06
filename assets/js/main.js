/* ============================================================
   PittalCo — motion & interaction layer
   GSAP + ScrollTrigger + Lenis. Every animation is opt-in via
   data-attributes so the markup stays clean and maintainable.
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     Utility: split an element's text into lines / words / chars
     Wraps words so we can animate with masked overflow.
     --------------------------------------------------------- */
  function splitWords(el) {
    // Preserve inline markup (e.g. .brass-text spans) and explicit <br> line breaks.
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((token) => {
          if (token.trim() === "") { el.appendChild(document.createTextNode(token)); return; }
          const w = document.createElement("span");
          w.className = "word";
          w.textContent = token;
          el.appendChild(w);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "BR") { el.appendChild(node); return; } // keep breaks in flow
        node.classList.add("word");
        el.appendChild(node);
      }
    });
    return el.querySelectorAll(".word");
  }

  /* Split into masked lines: wraps content in .line-mask > span for each visual line */
  function splitLines(el) {
    const words = splitWords(el);
    // group words by their offsetTop (visual line)
    const lines = [];
    let current = null;
    let lastTop = null;
    words.forEach((w) => {
      const top = w.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(w);
    });
    // rebuild with line masks
    el.innerHTML = "";
    const inners = [];
    lines.forEach((lineWords) => {
      const mask = document.createElement("span");
      mask.className = "line-mask";
      const inner = document.createElement("span");
      inner.style.display = "block";
      inner.style.willChange = "transform";
      lineWords.forEach((w, i) => {
        inner.appendChild(w);
        if (i < lineWords.length - 1) inner.appendChild(document.createTextNode(" "));
      });
      mask.appendChild(inner);
      el.appendChild(mask);
      inners.push(inner);
    });
    return inners;
  }

  /* ---------------------------------------------------------
     Custom cursor
     --------------------------------------------------------- */
  function initCursor() {
    if (isTouch || prefersReduced) return;
    const dot = document.querySelector(".cursor");
    const ring = document.querySelector(".cursor-ring");
    const label = ring.querySelector(".cursor-label");
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });

    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      gsap.set(ring, { x: rx, y: ry });
    });

    const hoverables = document.querySelectorAll("a, button, [data-magnetic], [data-hover]");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
        const l = el.getAttribute("data-cursor");
        label.textContent = l || (el.closest(".product, .gallery__tile") ? "View" : "");
        if (!label.textContent) document.body.classList.remove("cursor-hover");
      });
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* ---------------------------------------------------------
     Magnetic buttons
     --------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch || prefersReduced) return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3.out" });
        const label = el.querySelector(".btn__label");
        if (label) gsap.to(el.querySelectorAll(".btn__label"), { x: x * strength * 0.35, y: y * strength * 0.35, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        gsap.to(el.querySelectorAll(".btn__label"), { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------------------------------------------------------
     Preloader
     --------------------------------------------------------- */
  function initPreloader(onDone) {
    const pre = document.getElementById("preloader");
    if (!pre || prefersReduced || !hasGSAP) {
      if (pre) pre.remove();
      document.body.classList.remove("is-locked");
      onDone && onDone();
      return;
    }

    const countEl = pre.querySelector(".preloader__count");
    const bar = pre.querySelector(".preloader__bar i");
    const mark = pre.querySelectorAll(".preloader__mark svg [fill='none']");
    const word = pre.querySelector(".preloader__word span");
    const curtains = pre.querySelectorAll(".preloader__curtain span");

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        pre.remove();
        document.body.classList.remove("is-locked");
        onDone && onDone();
      },
    });

    gsap.set(word, { yPercent: 110 });

    tl.to(mark, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(word, { yPercent: 0, duration: 1, ease: "expo.out" }, 0.3)
      .to(counter, {
        v: 100, duration: 1.8, ease: "power2.inOut",
        onUpdate: () => { countEl.textContent = Math.round(counter.v); },
      }, 0.2)
      .to(bar, { scaleX: 1, duration: 1.8, ease: "power2.inOut" }, 0.2)
      .to(pre.querySelector(".preloader__inner"), { y: -40, opacity: 0, duration: 0.8, ease: "power3.inOut" }, "+=0.2")
      // lift the ink panels to unveil the page beneath
      .to(curtains, {
        scaleY: 0, duration: 1.1, ease: "expo.inOut",
        stagger: { each: 0.08, from: "start" },
        transformOrigin: "top",
      }, "-=0.35");

    return tl;
  }

  /* ---------------------------------------------------------
     Lenis smooth scroll wired to GSAP ScrollTrigger
     --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // anchor links → lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      });
    });
  }

  /* ---------------------------------------------------------
     Reveal animations (run after preloader)
     --------------------------------------------------------- */
  function initReveals() {
    if (!hasGSAP) return;

    if (prefersReduced) {
      document.querySelectorAll("[data-reveal],[data-fade],[data-split-lines],[data-words]").forEach((el) => {
        gsap.set(el, { opacity: 1, clearProps: "all" });
      });
      return;
    }

    // Split-line headings
    document.querySelectorAll("[data-split-lines]").forEach((el) => {
      const inners = splitLines(el);
      gsap.set(el, { opacity: 1 });
      gsap.set(inners, { yPercent: 115 });
      gsap.to(inners, {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // Simple fades / rises
    document.querySelectorAll("[data-fade]").forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.set(el, { opacity: 0, y: 26 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "expo.out", delay,
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    });

    // Generic reveal blocks (stagger children slightly by their order)
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });

    // Word-by-word colour reveal (manifesto & quote)
    document.querySelectorAll("[data-words]").forEach((el) => {
      const words = splitWords(el);
      const ivory = getComputedStyle(document.documentElement).getPropertyValue("--ivory").trim() || "#f4ecdc";
      gsap.set(el, { opacity: 1 });
      words.forEach((w) => { if (!w.classList.contains("brass-text")) w.style.color = "rgba(244,236,220,0.18)"; });
      gsap.to(words, {
        color: ivory,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 58%", scrub: true },
      });
      // keep gradient spans golden throughout
      el.querySelectorAll(".brass-text").forEach((b) => { b.style.color = "transparent"; });
    });

    // Image clip reveals
    document.querySelectorAll("[data-img-reveal]").forEach((el) => {
      gsap.set(el, { clipPath: "inset(100% 0 0 0)" });
      const inner = el.querySelector("svg, img");
      if (inner) gsap.set(inner, { scale: 1.2 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } })
        .to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.out" })
        .to(inner, { scale: 1, duration: 1.6, ease: "expo.out" }, 0);
    });

    // Parallax depth
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed || 0.1);
      gsap.to(el, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Animated counters
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(obj, {
          v: target, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = prefix + Math.round(obj.v) + suffix; },
        }),
      });
    });
  }

  /* ---------------------------------------------------------
     Craft — horizontal scroll storytelling (pinned)
     --------------------------------------------------------- */
  function initCraft() {
    if (!hasGSAP || prefersReduced) return;
    const track = document.querySelector("[data-craft-track]");
    const section = document.querySelector(".craft");
    const progress = document.querySelector("[data-craft-progress]");
    if (!track || !section) return;

    ScrollTrigger.matchMedia({
      "(min-width: 861px)": function () {
        const getScroll = () => track.scrollWidth - track.parentElement.clientWidth + 20;
        const tween = gsap.to(track, {
          x: () => -getScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + getScroll(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => { if (progress) gsap.set(progress, { scaleX: self.progress }); },
          },
        });
        return () => tween.kill();
      },
      "(max-width: 860px)": function () {
        // On mobile the track scrolls horizontally by touch — reveal progress as it scrolls
        if (progress) gsap.set(progress, { scaleX: 0.2 });
      },
    });
  }

  /* ---------------------------------------------------------
     Marquee (seamless loop, reacts subtly to scroll velocity)
     --------------------------------------------------------- */
  function initMarquee() {
    if (!hasGSAP || prefersReduced) return;
    document.querySelectorAll("[data-marquee]").forEach((track) => {
      const loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 28, ease: "none" });
      if (lenis) {
        lenis.on("scroll", (e) => {
          const v = 1 + Math.min(Math.abs(e.velocity) * 0.06, 4);
          gsap.to(loop, { timeScale: v * (loop.reversed() ? -1 : 1), duration: 0.4, overwrite: true });
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Metallic sheet — sweeping reflection on scroll
     --------------------------------------------------------- */
  function initMetallic() {
    if (!hasGSAP || prefersReduced) return;
    const sheet = document.querySelector("[data-metallic-sheet]");
    if (!sheet) return;
    const sweep = { p: 0 };
    gsap.to(sweep, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: ".metallic", start: "top bottom", end: "bottom top", scrub: true },
      onUpdate: () => { sheet.style.setProperty("--sweep", sweep.p.toFixed(4)); },
    });
  }

  /* ---------------------------------------------------------
     Header: reveal, hide on scroll down, condense on scroll
     --------------------------------------------------------- */
  function initHeader() {
    const header = document.getElementById("header");
    if (!header) return;
    header.classList.add("is-ready");
    let last = 0;
    const onScroll = (y) => {
      if (y > 60) header.classList.add("is-scrolled"); else header.classList.remove("is-scrolled");
      if (y > last && y > 400 && !document.body.classList.contains("menu-open")) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
      last = y;
    };
    if (lenis) lenis.on("scroll", (e) => onScroll(e.scroll));
    else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  }

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  function closeMenu() {
    document.body.classList.remove("menu-open");
    const t = document.getElementById("menuToggle");
    if (t) { t.setAttribute("aria-expanded", "false"); t.setAttribute("aria-label", "Open menu"); }
    if (lenis) lenis.start();
  }
  function initMenu() {
    const toggle = document.getElementById("menuToggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) { if (lenis) lenis.stop(); } else { if (lenis) lenis.start(); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------------------------------------------------------
     Boot sequence
     --------------------------------------------------------- */
  function boot() {
    document.getElementById("year").textContent = new Date().getFullYear();
    initLenis();
    initHeader();
    initMenu();
    initCursor();
    initMagnetic();
    initMarquee();

    initPreloader(() => {
      // Reveal hero content on entry
      initReveals();
      initCraft();
      initMetallic();
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    });

    // Fallback: if reduced motion, still run reveals
    if (prefersReduced) { initReveals(); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Refresh triggers once fonts settle (line splitting depends on layout)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (hasGSAP && window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 60);
    });
  }
})();
