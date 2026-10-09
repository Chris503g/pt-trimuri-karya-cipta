/* TKC Coding Alpha 2 — zero-dependency behavioral regression tests.
   Run with: node --test (or node --test tests/motion.test.js) */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(rootDir, "css", "motion.css"), "utf8");
const source = fs.readFileSync(path.join(rootDir, "js", "main.js"), "utf8");

function makeHarness(reduced = false) {
  let win;
  const make = (options = {}) => {
    const attrs = { ...(options.attrs || {}) };
    const classes = new Set(options.classes || []);
    const events = {};
    const el = {
      id: options.id,
      hidden: Boolean(options.hidden),
      offset: options.offset ?? 1800,
      tabIndex: 0,
      focused: false,
      style: {
        props: {},
        setProperty(key, val) { this.props[key] = val; }
      },
      classList: {
        add(key) { classes.add(key); },
        remove(key) { classes.delete(key); },
        contains(key) { return classes.has(key); },
        toggle(key, force) {
          const enabled = force === undefined ? !classes.has(key) : force;
          if (enabled) classes.add(key);
          else classes.delete(key);
          return enabled;
        }
      },
      setAttribute(key, val) { attrs[key] = String(val); },
      getAttribute(key) { return attrs[key] ?? null; },
      removeAttribute(key) { delete attrs[key]; },
      hasAttribute(key) { return Object.prototype.hasOwnProperty.call(attrs, key); },
      addEventListener(name, callback) { (events[name] ??= []).push(callback); },
      emit(name, extra = {}) {
        for (const callback of events[name] || []) {
          callback({ target: el, key: extra.key, preventDefault() {} });
        }
      },
      focus() { this.focused = true; },
      contains(target) { return target === el; },
      getClientRects() { return this.hidden ? [] : [{}]; },
      getBoundingClientRect() {
        const top = this.offset - win.scrollY;
        return { top, bottom: top + 40 };
      }
    };
    return el;
  };

  const panels = {};
  const groups = Array.from({ length: 2 }, (_, groupIndex) => {
    const tabs = Array.from({ length: 3 }, (_, tabIndex) => {
      const id = "pane-" + groupIndex + "-" + tabIndex;
      panels[id] = make({ hidden: tabIndex > 0 });
      return make({ attrs: { "aria-controls": id } });
    });
    return { tabs, querySelectorAll() { return tabs; } };
  });

  const toggle = make();
  const menu = make({ hidden: true });
  const dropdown = make();
  dropdown.querySelector = query => query.includes("toggle") ? toggle : menu;
  dropdown.contains = target => target === toggle || target === menu;
  menu.querySelectorAll = () => [make()];

  const home = make({ attrs: { href: "#" }, classes: ["tkc-link", "tkc-link-active"] });
  const about = make({ attrs: { href: "#about" }, classes: ["tkc-link"] });
  const projectNav = make({ attrs: { href: "#projects" }, classes: ["tkc-link"] });
  const sections = [
    make({ id: "about", offset: 600 }),
    make({ id: "projects", offset: 1800 })
  ];
  const cards = Array.from({ length: 6 }, (_, index) => make({ offset: 1500 + index * 50 }));
  const heading = make({ offset: 2000 });
  const introduction = make({ offset: 2200 });
  const brand = make({ offset: 2600 });
  const illustration = make({ offset: 2800 });
  const downloads = [make(), make()];
  const documentElement = make();
  const listeners = {};
  const rafQueue = [];
  const preferences = { matches: reduced, handler: null };

  win = {
    scrollY: 0,
    innerHeight: 800,
    requestAnimationFrame(callback) {
      rafQueue.push(callback);
      return rafQueue.length;
    },
    matchMedia(query) {
      if (query.includes("prefers-reduced-motion")) {
        return {
          matches: preferences.matches,
          addEventListener(_name, callback) { preferences.handler = callback; }
        };
      }
      return { matches: false };
    },
    addEventListener(name, callback) { (listeners[name] ??= []).push(callback); },
    emit(name) { (listeners[name] || []).forEach(callback => callback()); }
  };

  const document = {
    documentElement,
    listeners: {},
    querySelector(query) { return query.includes("data-dropdown") ? dropdown : null; },
    querySelectorAll(query) {
      if (query === "[data-tabs]") return groups;
      if (query === ".tkc-profile-download-action") return downloads;
      if (query.includes(".tkc-links .tkc-link")) return [home, about, projectNav];
      if (query === "main > section[id]") return sections;
      if (query === ".tkc-projects-grid .tkc-project-card") return cards;
      if (query.includes(".tkc-service-card")) return cards;
      if (query.includes(".tkc-brand-mini:not([hidden])")) return [brand];
      if (query.includes(".tkc-about-visual")) return [illustration];
      if (query.includes(".tkc-about-lead")) return [introduction];
      if (query.includes(".tkc-about-title")) return [heading];
      return [];
    },
    getElementById(id) { return panels[id] || null; },
    addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); },
    emit(name, event) { (this.listeners[name] || []).forEach(callback => callback(event)); }
  };

  const observers = [];
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.watching = new Set();
      this.disconnected = false;
      observers.push(this);
    }
    observe(element) { this.watching.add(element); }
    unobserve(element) { this.watching.delete(element); }
    disconnect() { this.watching.clear(); this.disconnected = true; }
    reveal(element) {
      this.callback([{ isIntersecting: true, target: element }], this);
    }
  }
  win.IntersectionObserver = Observer;

  function run() {
    vm.runInNewContext(source, {
      window: win,
      document,
      IntersectionObserver: Observer,
      innerWidth: 900
    }, { filename: "js/main.js", timeout: 2500 });
    while (rafQueue.length) rafQueue.shift()();
  }

  return {
    run, win, document, groups, panels, home, about, projectNav,
    toggle, menu, cards, downloads, documentElement, observers, preferences,
    flush() { while (rafQueue.length) rafQueue.shift()(); }
  };
}

test("Alpha 2 motion CSS is isolated, progressive and reduced-motion-safe", () => {
  assert.match(html, /href="css\/styles\.css"/);
  assert.match(html, /href="css\/motion\.css"/);
  assert.match(css, /\.tkc-motion-ready \[data-tkc-reveal\]/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /tkc-project-card:hover/);
  assert.match(css, /aria-current="location"/);
  assert.doesNotMatch(css, /grid-template-columns/);
});

test("existing tabs, keyboard navigation and PDF placeholders stay functional", () => {
  const h = makeHarness();
  h.run();
  assert.equal(h.panels["pane-0-0"].hidden, false);
  assert.equal(h.panels["pane-0-1"].hidden, true);
  h.groups[0].tabs[1].emit("click");
  assert.equal(h.panels["pane-0-1"].hidden, false);
  h.groups[0].tabs[1].emit("keydown", { key: "ArrowRight" });
  assert.equal(h.panels["pane-0-2"].hidden, false);
  assert.equal(h.groups[0].tabs[2].focused, true);
  assert.ok(h.downloads.every(el => el.hasAttribute("disabled")));
});

test("mobile menu toggles, closes by Escape and restores focus", () => {
  const h = makeHarness();
  h.run();
  h.toggle.emit("click");
  assert.equal(h.menu.hidden, false);
  assert.equal(h.toggle.getAttribute("aria-expanded"), "true");
  h.document.emit("keydown", { key: "Escape" });
  assert.equal(h.menu.hidden, true);
  assert.equal(h.toggle.focused, true);
});

test("project cards stagger, reveal exactly once and stop being observed", () => {
  const h = makeHarness();
  h.run();
  assert.equal(h.documentElement.classList.contains("tkc-motion-ready"), true);
  assert.ok(h.cards.every(card => card.getAttribute("data-tkc-reveal") === "card"));
  assert.equal(h.cards[0].style.props["--tkc-reveal-delay"], "0ms");
  assert.equal(h.cards[1].style.props["--tkc-reveal-delay"], "85ms");
  assert.equal(h.cards[2].style.props["--tkc-reveal-delay"], "170ms");
  assert.equal(h.observers.length, 1);
  const observer = h.observers[0];
  assert.equal(observer.watching.has(h.cards[0]), true);
  observer.reveal(h.cards[0]);
  assert.equal(h.cards[0].classList.contains("tkc-is-visible"), true);
  assert.equal(observer.watching.has(h.cards[0]), false);
});

// The active-section navigation test moved to Alpha 3's dedicated suite.

test("prefers-reduced-motion disables scroll reveals without hiding content", () => {
  const h = makeHarness(true);
  h.run();
  assert.equal(h.documentElement.classList.contains("tkc-motion-ready"), false);
  assert.equal(h.observers.length, 0);
  assert.ok(h.cards.every(el => !el.hasAttribute("data-tkc-reveal")));
});

test("mid-session switch to reduced motion reveals remaining items", () => {
  const h = makeHarness();
  h.run();
  assert.equal(h.observers.length, 1);
  h.preferences.handler({ matches: true });
  assert.equal(h.documentElement.classList.contains("tkc-motion-ready"), false);
  assert.ok(h.cards.every(el => el.classList.contains("tkc-is-visible")));
  assert.equal(h.observers[0].disconnected, true);
});
