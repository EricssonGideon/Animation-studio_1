document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const siteShell = document.querySelector(".site-shell");
  const topLoader = document.getElementById("topLoader");
  const routeOrder = ["index.html", "playground.html"];

  if (!siteShell || !window.gsap) {
    return;
  }

  const state = {
    active: false,
    currentUrl: new URL(window.location.href),
    transitionData: null
  };

  function currentTheme() {
    return document.body.getAttribute("data-theme") || "dark";
  }

  function pageName(urlLike = window.location.href) {
    const pathname = new URL(urlLike, window.location.href).pathname;
    return pathname.split("/").pop() || "index.html";
  }

  function transitionDirection(url) {
    const currentIndex = routeOrder.indexOf(pageName(window.location.href));
    const nextIndex = routeOrder.indexOf(pageName(url));
    if (currentIndex === -1 || nextIndex === -1) return "forward";
    return nextIndex >= currentIndex ? "forward" : "reverse";
  }

  function neighborRoute(direction) {
    const currentIndex = routeOrder.indexOf(pageName(window.location.href));
    if (currentIndex === -1) return null;
    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= routeOrder.length) return null;
    return new URL(routeOrder[nextIndex], window.location.href).href;
  }

  function createOverlay() {
    let layer = document.querySelector(".page-transition-layer");
    if (layer) return layer;

    // Dedicated transition overlay injected at runtime to avoid polluting page markup.
    layer = document.createElement("div");
    layer.className = "page-transition-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <div class="page-transition-shadow"></div>
      <div class="page-transition-sheet" data-side="right">
        <div class="page-transition-fabric"></div>
      </div>
      <div class="page-transition-rope" data-side="right"></div>
      <div class="page-transition-character" data-side="right">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <g class="transition-character-body">
            <ellipse cx="80" cy="136" rx="32" ry="10" fill="rgba(8, 12, 24, 0.28)"></ellipse>
            <rect x="42" y="38" width="76" height="84" rx="28" fill="#9dd6ff"></rect>
            <rect x="52" y="48" width="56" height="44" rx="18" fill="#0e1732"></rect>
            <rect x="34" y="66" width="18" height="50" rx="9" fill="#94c8ff"></rect>
            <rect x="108" y="66" width="18" height="50" rx="9" fill="#94c8ff"></rect>
            <rect x="58" y="114" width="16" height="30" rx="8" fill="#94c8ff"></rect>
            <rect x="86" y="114" width="16" height="30" rx="8" fill="#94c8ff"></rect>
            <rect x="77" y="14" width="6" height="30" rx="3" fill="#9dd6ff"></rect>
            <circle cx="80" cy="12" r="10" fill="#ffd75d"></circle>
            <circle cx="66" cy="69" r="8" fill="#65e6ff" class="transition-eye"></circle>
            <circle cx="94" cy="69" r="8" fill="#65e6ff" class="transition-eye"></circle>
            <path d="M64 92 Q80 105 96 92" fill="none" stroke="#65e6ff" stroke-width="5" stroke-linecap="round"></path>
            <circle cx="50" cy="90" r="5" fill="rgba(255, 130, 190, 0.4)"></circle>
            <circle cx="110" cy="90" r="5" fill="rgba(255, 130, 190, 0.4)"></circle>
            <circle cx="34" cy="98" r="8" fill="#ffd75d"></circle>
          </g>
        </svg>
      </div>
    `;
    document.body.appendChild(layer);
    return layer;
  }

  function setOverlaySide(layer, direction) {
    const side = direction === "forward" ? "right" : "left";
    layer.dataset.theme = currentTheme();
    layer.querySelector(".page-transition-sheet")?.setAttribute("data-side", side);
    layer.querySelector(".page-transition-rope")?.setAttribute("data-side", side);
    layer.querySelector(".page-transition-character")?.setAttribute("data-side", side);
  }

  function persistEntryState(direction) {
    sessionStorage.setItem("automatex-transition-entry", JSON.stringify({
      direction,
      theme: currentTheme(),
      timestamp: Date.now()
    }));
  }

  function fetchPage(url) {
    return fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-cache"
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Transition fetch failed: ${response.status}`);
      }
      return response.text();
    });
  }

  function writeFetchedDocument(url, html) {
    // Persist entry state so the destination page can play the reveal half of the transition.
    persistEntryState(transitionDirection(url));
    window.history.pushState({}, "", url);
    document.open();
    document.write(html);
    document.close();
  }

  function fallbackNavigate(url, direction) {
    persistEntryState(direction);
    window.location.href = url;
  }

  function animateLeave(direction, onCovered) {
    const layer = createOverlay();
    const shadow = layer.querySelector(".page-transition-shadow");
    const sheet = layer.querySelector(".page-transition-sheet");
    const rope = layer.querySelector(".page-transition-rope");
    const character = layer.querySelector(".page-transition-character");
    const characterBody = layer.querySelector(".transition-character-body");
    const eyes = layer.querySelectorAll(".transition-eye");
    const sideSign = direction === "forward" ? 1 : -1;
    const entryX = direction === "forward" ? 180 : -180;
    const pullX = direction === "forward" ? -window.innerWidth * 0.12 : window.innerWidth * 0.12;
    const sheetStretch = direction === "forward" ? -window.innerWidth * 0.06 : window.innerWidth * 0.06;

    state.active = true;
    setOverlaySide(layer, direction);
    layer.classList.add("is-active");
    siteShell.classList.add("transition-stretch");
    if (topLoader) topLoader.classList.remove("visible");

    // Pull current page away using transforms only, then fully cover before swapping documents.
    const timeline = window.gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: onCovered
    });

    window.gsap.set(layer, { opacity: 1, visibility: "visible" });
    window.gsap.set(shadow, { opacity: 0 });
    window.gsap.set(sheet, { scaleX: 0, x: 0 });
    window.gsap.set(rope, { scaleX: 0, opacity: 0 });
    window.gsap.set(character, { x: entryX, opacity: 1 });
    window.gsap.set(siteShell, { x: 0, rotation: 0, scaleX: 1, scaleY: 1, boxShadow: "none" });

    if (!prefersReducedMotion) {
      window.gsap.to(characterBody, { y: -4, repeat: -1, yoyo: true, duration: 0.4, ease: "sine.inOut" });
      timeline
        .to(eyes, { scaleY: 0.15, duration: 0.08, transformOrigin: "center center" }, 0.08)
        .to(eyes, { scaleY: 1, duration: 0.12 }, 0.16);
    }

    timeline
      .to(character, { x: 0, duration: prefersReducedMotion ? 0.16 : 0.28, ease: "back.out(1.5)" }, 0)
      .to(rope, { opacity: 1, scaleX: 1, duration: prefersReducedMotion ? 0.14 : 0.24 }, 0.08)
      .to(shadow, { opacity: 1, duration: prefersReducedMotion ? 0.18 : 0.34 }, 0.06)
      .to(siteShell, {
        x: pullX,
        rotation: sideSign * -1.25,
        scaleX: 0.975,
        scaleY: 0.995,
        duration: prefersReducedMotion ? 0.18 : 0.3,
        ease: "power2.out"
      }, 0.08)
      .to(sheet, {
        scaleX: 1,
        x: sheetStretch,
        duration: prefersReducedMotion ? 0.22 : 0.54,
        ease: prefersReducedMotion ? "power2.inOut" : "elastic.out(0.78, 0.74)"
      }, 0.12)
      .to(siteShell, {
        x: sideSign * -window.innerWidth * 1.02,
        rotation: sideSign * -2.2,
        scaleX: 0.95,
        duration: prefersReducedMotion ? 0.2 : 0.5,
        ease: "power4.in"
      }, 0.18)
      .to(character, {
        x: sideSign * -window.innerWidth * 0.12,
        duration: prefersReducedMotion ? 0.18 : 0.48,
        ease: prefersReducedMotion ? "power2.inOut" : "elastic.out(0.9, 0.76)"
      }, 0.16);
  }

  function playEntryTransition() {
    const raw = sessionStorage.getItem("automatex-transition-entry");
    if (!raw) return;

    sessionStorage.removeItem("automatex-transition-entry");

    let entry;
    try {
      entry = JSON.parse(raw);
    } catch (error) {
      console.log("[AutomateX Transition] Invalid entry payload", error);
      return;
    }

    // The next page starts covered and then gets revealed by the same character animation.
    const direction = entry?.direction === "reverse" ? "reverse" : "forward";
    const layer = createOverlay();
    const shadow = layer.querySelector(".page-transition-shadow");
    const sheet = layer.querySelector(".page-transition-sheet");
    const rope = layer.querySelector(".page-transition-rope");
    const character = layer.querySelector(".page-transition-character");
    const characterBody = layer.querySelector(".transition-character-body");
    const eyes = layer.querySelectorAll(".transition-eye");
    const sideSign = direction === "forward" ? 1 : -1;
    const exitX = direction === "forward" ? 180 : -180;

    setOverlaySide(layer, direction);
    layer.dataset.theme = entry?.theme || currentTheme();
    layer.classList.add("is-active");
    siteShell.classList.add("transition-stretch");

    window.gsap.set(layer, { opacity: 1, visibility: "visible" });
    window.gsap.set(shadow, { opacity: 1 });
    window.gsap.set(sheet, { scaleX: 1, x: 0 });
    window.gsap.set(rope, { opacity: 1, scaleX: 1 });
    window.gsap.set(character, { x: 0, opacity: 1 });

    const timeline = window.gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        layer.classList.remove("is-active");
        siteShell.classList.remove("transition-stretch");
        window.gsap.set(layer, { clearProps: "all" });
        window.gsap.set(siteShell, { clearProps: "all" });
      }
    });

    if (!prefersReducedMotion) {
      window.gsap.to(characterBody, { y: -3, repeat: 1, yoyo: true, duration: 0.24, ease: "sine.inOut" });
      timeline
        .to(eyes, { scaleY: 0.2, duration: 0.08, transformOrigin: "center center" }, 0.04)
        .to(eyes, { scaleY: 1, duration: 0.12 }, 0.12);
    }

    timeline
      .to(character, {
        x: exitX,
        duration: prefersReducedMotion ? 0.2 : 0.5,
        ease: prefersReducedMotion ? "power2.out" : "elastic.inOut(0.8, 0.72)"
      }, 0)
      .to(rope, { scaleX: 0, opacity: 0, duration: prefersReducedMotion ? 0.14 : 0.26 }, 0.08)
      .to(sheet, {
        scaleX: 0,
        x: sideSign * window.innerWidth * 0.08,
        duration: prefersReducedMotion ? 0.2 : 0.52,
        ease: prefersReducedMotion ? "power2.inOut" : "elastic.inOut(0.82, 0.72)"
      }, 0.08)
      .to(shadow, { opacity: 0, duration: prefersReducedMotion ? 0.16 : 0.34 }, 0.18);
  }

  function shouldHandleLink(anchor, event) {
    if (!anchor) return false;
    if (state.active) return false;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return false;
    }

    const url = new URL(anchor.href, window.location.href);
    const sameOrigin = url.origin === state.currentUrl.origin || (url.protocol === "file:" && state.currentUrl.protocol === "file:");
    if (!sameOrigin) return false;
    if (!url.pathname.endsWith(".html")) return false;
    if (url.pathname === state.currentUrl.pathname && url.hash) return false;
    if (url.pathname === state.currentUrl.pathname && !url.search && !url.hash) return false;
    return true;
  }

  function beginNavigation(url, direction) {
    if (state.active) return;

    animateLeave(direction, () => {
      fetchPage(url)
        .then((html) => {
          writeFetchedDocument(url, html);
        })
        .catch((error) => {
          console.log("[AutomateX Transition] Fetch fallback", error);
          fallbackNavigate(url, direction);
        });
    });
  }

  function initLinkTransitions() {
    // Intercept same-origin HTML navigation only. In-page anchors keep default behavior.
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a");
      if (!shouldHandleLink(anchor, event)) return;
      event.preventDefault();
      const url = new URL(anchor.href, window.location.href).href;
      beginNavigation(url, transitionDirection(url));
    });
  }

  function initSwipeNavigation() {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    // Mobile gesture support: swipe left for next page, swipe right for previous page.
    let startX = 0;
    let startY = 0;
    let tracking = false;

    document.addEventListener("touchstart", (event) => {
      if (state.active) return;
      const target = event.target.closest("a, button, input, textarea, select");
      if (target) return;
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    document.addEventListener("touchend", (event) => {
      if (!tracking || state.active) return;
      tracking = false;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (Math.abs(deltaY) > 50 || Math.abs(deltaX) < 70) return;

      if (deltaX < 0) {
        const next = neighborRoute("forward");
        if (next) beginNavigation(next, "forward");
      } else {
        const previous = neighborRoute("reverse");
        if (previous) beginNavigation(previous, "reverse");
      }
    }, { passive: true });
  }

  initLinkTransitions();
  initSwipeNavigation();
  playEntryTransition();
});
