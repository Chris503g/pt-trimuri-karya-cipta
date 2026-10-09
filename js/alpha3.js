/* TKC Website V1.0 — Coding Alpha 3
   Sticky navigation, manual + continuous carousel, engineering project modal.
   Framework-free for easy independent hosting. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* -----------------------------------------------------------
     1. Active navigation and sticky-header feedback.
     Scroll states reflect visible sections, including divisions
     without their own top-level desktop navigation item.
     ----------------------------------------------------------- */
  const navbar = $("#tkc-primary-nav");
  const desktopLinks = $$('.tkc-links .tkc-link[href^="#"]');
  const mobileLinks = $$('.tkc-mobile-menu-link[href^="#"]:not(.tkc-mobile-cta)');
  const trackedLinks = desktopLinks.concat(mobileLinks);
  const sections = $$('main > section[id]');

  if (navbar && trackedLinks.length && sections.length) {
    const hrefBySection = {
      capabilities: ["#capabilities", "#capabilities-detail"],
      about: ["#about"],
      business: ["#capabilities", "#capabilities-detail"],
      "capabilities-detail": ["#capabilities", "#capabilities-detail"],
      projects: ["#projects"],
      brands: ["#brands"],
      customers: ["#brands", "#customers"],
      csr: ["#contact", "#csr"],
      contact: ["#contact"]
    };
    let scheduled = false;

    const refreshNavigation = () => {
      scheduled = false;
      navbar.classList.toggle("tkc-nav--scrolled", window.scrollY > 6);

      const navHeight = navbar.getBoundingClientRect().height || 76;
      const line = navHeight + Math.min(window.innerHeight * .22, 175);
      let current = ["#"]; // Hero / uppermost part of the homepage

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) {
          current = hrefBySection[section.id] || current;
        } else {
          break;
        }
      }

      trackedLinks.forEach(link => {
        const active = current.includes(link.getAttribute("href"));
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        if (link.classList.contains("tkc-link")) {
          link.classList.toggle("tkc-link-active", active);
        }
      });
    };

    const scheduleRefresh = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(refreshNavigation);
    };
    window.addEventListener("scroll", scheduleRefresh, { passive: true });
    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("hashchange", scheduleRefresh);
    scheduleRefresh();
  }

  /* -----------------------------------------------------------
     2. Continuous, seamless looping industrial service carousel.
     The original four cards are kept intact in the central copy.
     Cloned side copies are aria-hidden so screen readers only
     encounter the original cards once.
     ----------------------------------------------------------- */
  const viewport = $("#tkc-services-carousel");
  const track = viewport ? $(".tkc-service-track", viewport) : null;

  if (viewport && track) {
    const originals = $$(".tkc-service-card", track);
    const pauseButton = $(".tkc-service-carousel-pause");
    if (originals.length > 1) {
      const clones = () => originals.map(card => {
        const copy = card.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.removeAttribute("id");
        return copy;
      });
      const before = clones();
      const after = clones();
      track.prepend(...before);
      track.append(...after);

      let groupWidth = 0;
      let explicitlyPaused = false;
      let dragging = false;
      let dragLastX = 0;
      let lastTime = 0;
      let pauseUntil = 0;
      const reducedMotion = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

      const measure = () => {
        const widthFromOffsets = originals[0].offsetLeft - before[0].offsetLeft;
        const widthFromCards = originals.reduce((total, card) => {
          return total + card.getBoundingClientRect().width;
        }, 0);
        groupWidth = widthFromOffsets > 0 ? widthFromOffsets : widthFromCards;
        if (groupWidth > 0) viewport.scrollLeft = groupWidth;
      };

      const normalizeScroll = () => {
        if (!groupWidth) return;
        // Shift by one identical copy before reaching either end.
        if (viewport.scrollLeft < groupWidth * .5) {
          viewport.scrollLeft += groupWidth;
        } else if (viewport.scrollLeft > groupWidth * 1.5) {
          viewport.scrollLeft -= groupWidth;
        }
      };

      const pauseForInteraction = (ms = 3600) => {
        pauseUntil = Math.max(pauseUntil, performance.now() + ms);
      };
      const scrollOne = direction => {
        pauseForInteraction(5000);
        const step = originals[0].getBoundingClientRect().width || 290;
        viewport.scrollBy({
          left: step * direction,
          behavior: reducedMotion.matches ? "auto" : "smooth"
        });
      };

      // A single pause control replaces the previous/next arrow buttons.
      // The carousel keeps moving on ordinary hover; otherwise people
      // arriving with their pointer over the strip see a static carousel.
      if (pauseButton) {
        const icon = $("[aria-hidden]", pauseButton);
        pauseButton.addEventListener("click", () => {
          explicitlyPaused = !explicitlyPaused;
          pauseButton.setAttribute("aria-pressed", String(explicitlyPaused));
          pauseButton.setAttribute("aria-label", explicitlyPaused
            ? "Resume automatic service scrolling"
            : "Pause automatic service scrolling");
          pauseButton.title = explicitlyPaused
            ? "Resume automatic scrolling" : "Pause automatic scrolling";
          if (icon) icon.textContent = explicitlyPaused ? "▶" : "Ⅱ";
          if (!explicitlyPaused) pauseUntil = 0;
        });
      }

      viewport.addEventListener("keydown", event => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        scrollOne(event.key === "ArrowRight" ? 1 : -1);
      });
      viewport.addEventListener("focusin", () => pauseForInteraction(2500));
      viewport.addEventListener("wheel", event => {
        // Normal vertical page scrolling should not stop the carousel.
        if (Math.abs(event.deltaX || 0) > Math.abs(event.deltaY || 0)) {
          pauseForInteraction(2200);
        }
      }, { passive: true });
      viewport.addEventListener("touchstart", () => pauseForInteraction(5500), { passive: true });
      viewport.addEventListener("scroll", normalizeScroll, { passive: true });

      viewport.addEventListener("pointerdown", event => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        dragging = true;
        dragLastX = event.clientX;
        viewport.classList.add("tkc-service-is-dragging");
        pauseForInteraction(6000);
        if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
      });

      viewport.addEventListener("pointermove", event => {
        if (!dragging) return;
        viewport.scrollLeft -= event.clientX - dragLastX;
        dragLastX = event.clientX;
        normalizeScroll();
      });

      const finishDrag = () => {
        dragging = false;
        viewport.classList.remove("tkc-service-is-dragging");
        pauseForInteraction(3500);
      };
      viewport.addEventListener("pointerup", finishDrag);
      viewport.addEventListener("pointercancel", finishDrag);
      viewport.addEventListener("lostpointercapture", finishDrag);

      // Use viewport geometry rather than a persistent intersection flag.
      // It avoids an observer callback leaving autoplay stopped unexpectedly.
      measure();
      let resizeScheduled = false;
      window.addEventListener("resize", () => {
        if (resizeScheduled) return;
        resizeScheduled = true;
        window.requestAnimationFrame(() => {
          resizeScheduled = false;
          measure();
          pauseForInteraction(700);
        });
      });

      const tick = now => {
        const elapsed = lastTime ? Math.min(now - lastTime, 75) : 0;
        lastTime = now;
        const bounds = viewport.getBoundingClientRect();
        const bottom = bounds.bottom ?? bounds.top + bounds.height;
        const onScreen = bounds.top < window.innerHeight && bottom > 0;
        const active = !reducedMotion.matches && !dragging && !explicitlyPaused &&
          onScreen && document.visibilityState !== "hidden" &&
          now >= pauseUntil && groupWidth > 0;
        if (active) {
          viewport.scrollLeft += elapsed * .052; // 52 pixels per second
          normalizeScroll();
        }
        window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    }
  }

  /* -----------------------------------------------------------
     3. Accessible engineering project details modal.
     Project metadata comes from the cards. Unprovided content is
     intentionally left as "coming soon".
     ----------------------------------------------------------- */
  const overlay = $("#tkc-project-modal");
  const dialog = overlay ? $('[role="dialog"]', overlay) : null;
  const closeButton = overlay ? $(".tkc-project-modal-close", overlay) : null;

  if (overlay && dialog && closeButton) {
    const title = $("#tkc-project-modal-title");
    const client = $("#tkc-project-modal-client");
    const modalImage = $("#tkc-project-modal-image");
    let lastFocused = null;

    const openProject = card => {
      const name = $(".tkc-project-name", card);
      const company = $(".tkc-project-client", card);
      const image = $(".tkc-project-image", card);
      if (!name || !company || !image) return;
      lastFocused = card; // Return to the originating project tile on close

      title.textContent = name.textContent.trim();
      client.textContent = company.textContent.trim();
      modalImage.src = image.getAttribute("src");
      modalImage.alt = image.getAttribute("alt") || title.textContent;

      overlay.hidden = false;
      document.body.classList.add("tkc-dialog-open");
      closeButton.focus();
    };

    const closeProject = () => {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove("tkc-dialog-open");
      if (lastFocused && lastFocused.isConnected) lastFocused.focus();
    };

    document.addEventListener("click", event => {
      const card = event.target.closest(".tkc-project-card[data-project-id]");
      if (card && overlay.hidden) openProject(card);
    });

    document.addEventListener("keydown", event => {
      const card = event.target.closest
        ? event.target.closest(".tkc-project-card[data-project-id]") : null;
      if (overlay.hidden && card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openProject(card);
        return;
      }
      if (overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeProject();
      }
      if (event.key !== "Tab") return;
      const tabbable = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', dialog)
        .filter(element => element.getClientRects().length);
      if (!tabbable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = tabbable[0];
      const last = tabbable[tabbable.length-1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    closeButton.addEventListener("click", closeProject);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeProject();
    });
  }
})();
