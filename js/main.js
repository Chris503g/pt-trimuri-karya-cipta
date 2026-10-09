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
      if (innerWidth >= 992 && !panel.hidden) close();
    });
  }

  // Disabled PDFs remain disabled until the real assets arrive.
  $$(".tkc-profile-download-action").forEach(button => {
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("disabled", "");
    button.addEventListener("click", event => event.preventDefault());
  });
})();
