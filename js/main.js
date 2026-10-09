/* TKC Website V1.0 — Coding Alpha 1. Vanilla JavaScript; no external framework. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Native-equivalent category tabs, with keyboard arrow/Home/End support.
  $$("[data-tabs]").forEach(group => {
    const tabs = $$('[role="tab"]', group);
    if (!tabs.length) return;
    const activate = (tab, shouldFocus = false) => {
      tabs.forEach(t => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        const pane = document.getElementById(t.getAttribute("aria-controls"));
        if (pane) pane.hidden = !selected;
      });
      if (shouldFocus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    });
    activate(tabs[0]);
  });

  // Responsive menu mirrors Webflow native dropdown behavior.
  const dropdown = $('[data-dropdown="tkc-mobile"]');
  if (dropdown) {
    const toggle = $(".tkc-mobile-dropdown-toggle", dropdown);
    const panel = $(".tkc-mobile-dropdown-list", dropdown);
    const close = (returnFocus = false) => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
      if (returnFocus) toggle.focus();
    };
    const open = () => {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    };
    toggle?.addEventListener("click", () => panel.hidden ? open() : close());
    $$("a", panel).forEach(link => link.addEventListener("click", () => close()));
    document.addEventListener("pointerdown", event => {
      if (!dropdown.contains(event.target) && !panel.hidden) close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) close(true);
    });
    window.addEventListener("resize", () => {
      if (innerWidth > 1240 && !panel.hidden) close();
    });
  }

  // Disabled PDFs remain disabled until the real assets arrive.
  $$(".tkc-profile-download-action").forEach(button => {
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("disabled", "");
    button.addEventListener("click", event => event.preventDefault());
  });
  // Navigation scroll state is now handled by js/alpha3.js.

  /* =============================================================
     Coding Alpha 2: one-time scroll reveals
     Progressive enhancement — baseline content remains visible
     without JS, IntersectionObserver, or animation preference.
     ============================================================= */
  const motionPreference = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  if (!motionPreference.matches && "IntersectionObserver" in window) {
    const root = document.documentElement;
    const targets = [];
    const added = new Set();

    const register = (selector, kind) => {
      $$(selector).forEach(element => {
        if (added.has(element) || element.hasAttribute("hidden")) return;
        added.add(element);
        element.setAttribute("data-tkc-reveal", kind);
        targets.push(element);
      });
    };

    // Section titles, selected introductory copy and key content.
    register(
      ".tkc-about-title, .tkc-business-title, .tkc-cap-title, " +
      ".tkc-projects-title, .tkc-brands-compact-title, " +
      ".tkc-eng-customers-title, .tkc-csr-title, .tkc-contact-title",
      "heading"
    );
    register(
      ".tkc-about-lead, .tkc-projects-intro, .tkc-contact-intro, " +
      ".tkc-business-intro, .tkc-cap-intro, .tkc-eng-customers-intro",
      "fade"
    );
    register(
      " .tkc-business-card, .tkc-cap-row, " +
      ".tkc-projects-grid .tkc-project-card",
      "card"
    );
    register(
      ".tkc-brand-mini:not([hidden]), .tkc-client-name:not([hidden])",
      "fade"
    );
    register(".tkc-about-visual, .tkc-csr-visual", "image");

    // Keep a restrained project-card sequence, without delayed
    // animations on narrow single-column screens.
    $$(".tkc-projects-grid .tkc-project-card").forEach((card, index) => {
      const delay = window.matchMedia("(max-width: 767px)").matches
        ? 0 : (index % 3) * 85;
      card.style.setProperty("--tkc-reveal-delay", delay + "ms");
    });

    // Mark already-visible elements before enabling hidden reveal states,
    // avoiding an initial flash of disappearing content.
    targets.forEach(element => {
      if (!element.getClientRects().length) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom >= 0 && bounds.top <= window.innerHeight * .9) {
        element.classList.add("tkc-is-visible");
      }
    });

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("tkc-is-visible");
        revealObserver.unobserve(entry.target); // never replay on scroll
      });
    }, {
      threshold: .12,
      rootMargin: "0px 0px -6% 0px"
    });

    targets.forEach(element => {
      if (!element.classList.contains("tkc-is-visible")) {
        revealObserver.observe(element);
      }
    });
    root.classList.add("tkc-motion-ready");

    // If accessibility preferences change mid-session, stop hiding content.
    if (typeof motionPreference.addEventListener === "function") {
      motionPreference.addEventListener("change", event => {
        if (!event.matches) return;
        revealObserver.disconnect();
        targets.forEach(element => element.classList.add("tkc-is-visible"));
        root.classList.remove("tkc-motion-ready");
      });
    }
  }

})();
