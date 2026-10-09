/* TKC Coding Alpha 3 acceptance tests — no external dependencies.
   Run: node --test tests/alpha3.test.js */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "alpha3.css"), "utf8");
const js = fs.readFileSync(path.join(root, "js", "alpha3.js"), "utf8");
const originalJS = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");

function harness() {
  const watchers = [];
  const frames = [];
  const documentEvents = {};
  const windowEvents = {};
  let now = 100;
  let windowRef;

  function node(options = {}) {
    const attrs = { ...(options.attrs || {}) };
    const classes = new Set(options.classes || []);
    const events = {};
    const element = {
      id: options.id,
      hidden: Boolean(options.hidden),
      dataset: options.dataset || {},
      textContent: options.text || "",
      isConnected: true,
      focused: false,
      scrollLeft: 0,
      offsetWidth: options.width ?? 300,
      getBoundingClientRect() {
        return { width: options.width ?? 300, height: options.height ?? 76,
          top: (options.top ?? 0) - windowRef.scrollY };
      },
      getClientRects() { return this.hidden ? [] : [{}]; },
      setAttribute(name, value) { attrs[name] = String(value); },
      getAttribute(name) { return attrs[name] ?? null; },
      removeAttribute(name) { delete attrs[name]; },
      hasAttribute(name) { return Object.hasOwn(attrs, name); },
      classList: {
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        contains(name) { return classes.has(name); },
        toggle(name, force) {
          const state = force === undefined ? !classes.has(name) : force;
          if (state) classes.add(name);
          else classes.delete(name);
          return state;
        }
      },
      addEventListener(name, fn) { (events[name] ??= []).push(fn); },
      emit(name, props = {}) {
        for (const callback of events[name] || []) {
          callback({ target: this, key: props.key,
            button: props.button, pointerType: props.pointerType, pointerId: props.pointerId,
            clientX: props.clientX, shiftKey: props.shiftKey,
            relatedTarget: props.relatedTarget, preventDefault() {} });
        }
      },
      closest(selector) {
        return this.matchSelectors?.includes(selector) ? this : null;
      },
      focus() { this.focused = true; doc.activeElement = this; },
      contains(el) { return el === this; },
      scrollBy({ left }) { this.scrollLeft += left; },
      setPointerCapture() {},
      querySelector(sel) { return this.map?.[sel] || null; },
      querySelectorAll(sel) { return this.list?.[sel] || []; },
      cloneNode() { throw new Error("override cloneNode on carousel slides"); }
    };
    return element;
  }

  const nav = node({ height: 76 });
  const desktop = ["#", "#about", "#capabilities", "#brands", "#projects", "#contact"]
    .map(href => node({ attrs: { href }, classes: ["tkc-link"] }));
  const mobile = ["#", "#about", "#capabilities-detail", "#projects", "#brands", "#customers", "#csr", "#contact"]
    .map(href => node({ attrs: { href }, classes: ["tkc-mobile-menu-link"] }));
  const sections = ["capabilities", "about", "business", "capabilities-detail",
    "projects", "brands", "customers", "csr", "contact"]
    .map((id, i) => node({ id, top: 650 + i * 650 }));
  sections.forEach(el => {
    const original = el.getBoundingClientRect.bind(el);
    el.getBoundingClientRect = () => ({ ...original(), top: el.getBoundingClientRectTop() });
    el.getBoundingClientRectTop = () => el.topValue - windowRef.scrollY;
    el.topValue = 650 + sections.indexOf(el) * 650;
  });

  const track = node();
  track.items = [];
  track.prepend = (...elements) => { track.items.unshift(...elements); };
  track.append = (...elements) => { track.items.push(...elements); };
  function slide(i) {
    const el = node({ width: 300, attrs: { "data-service-index": i } });
    Object.defineProperty(el, "offsetLeft", {
      get() { return track.items.indexOf(el) * 300; }
    });
    el.cloneNode = () => slide(i);
    return el;
  }
  const slides = Array.from({ length: 4 }, (_, index) => slide(index));
  track.items = slides.slice();
  track.list = { ".tkc-service-card": slides };
  const viewport = node();
  viewport.map = { ".tkc-service-track": track };
  viewport.list = { ".tkc-service-card": slides };
  const pauseIcon = node({ text: "Ⅱ" });
  const pauseButton = node({ attrs: { "aria-pressed": "false" } });
  pauseButton.map = { "[aria-hidden]": pauseIcon };

  const overlay = node({ hidden: true });
  const dialog = node();
  const close = node();
  const title = node(), client = node(), image = node();
  dialog.list = { 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])': [close] };
  overlay.map = { '[role="dialog"]': dialog, ".tkc-project-modal-close": close };
  const body = node();
  const heading = node({ text: "TIG Body Machine" });
  const customer = node({ text: "PT YUTAKA" });
  const projectImage = node({ attrs: { src: "project-2.png", alt: "TIG Body Machine" } });
  const card = node();
  card.matchSelectors = [".tkc-project-card[data-project-id]"];
  card.map = { ".tkc-project-name": heading, ".tkc-project-client": customer,
    ".tkc-project-image": projectImage };

  const doc = {
    visibilityState: "visible", body, activeElement: body,
    querySelector(selector) {
      if (selector === "#tkc-primary-nav") return nav;
      if (selector === "#tkc-services-carousel") return viewport;
      if (selector === ".tkc-service-carousel-pause") return pauseButton;
      if (selector === "#tkc-project-modal") return overlay;
      if (selector === "#tkc-project-modal-title") return title;
      if (selector === "#tkc-project-modal-client") return client;
      if (selector === "#tkc-project-modal-image") return image;
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes(".tkc-links .tkc-link")) return desktop;
      if (selector.includes(".tkc-mobile-menu-link")) return mobile;
      if (selector === "main > section[id]") return sections;
      return [];
    },
    addEventListener(name, callback) { (documentEvents[name] ??= []).push(callback); },
    emit(name, target, extra = {}) {
      for (const callback of documentEvents[name] || []) {
        callback({ target, key: extra.key, shiftKey: extra.shiftKey,
          preventDefault() {} });
      }
    }
  };

  class Observer {
    constructor(callback, settings) {
      this.callback = callback;
      this.settings = settings;
      watchers.push(this);
    }
    observe(el) { this.target = el; }
    disconnect() {}
  }

  windowRef = {
    scrollY: 0, innerHeight: 900, innerWidth: 1280,
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    matchMedia() { return { matches: false }; },
    addEventListener(name, callback) { (windowEvents[name] ??= []).push(callback); },
    emit(name) { for (const f of windowEvents[name] || []) f(); }
  };
  const performance = { now() { return now; } };

  vm.runInNewContext(js, {
    document: doc, window: windowRef, IntersectionObserver: Observer, performance
  }, { filename: "js/alpha3.js", timeout: 1500 });

  const frame = (elapsed = 16) => {
    now += elapsed;
    const current = frames.splice(0);
    for (const callback of current) callback(now);
  };

  return { frame, nav, desktop, mobile, sections, viewport, track, pauseButton, pauseIcon,
    slides, overlay, dialog, close, title, client, image, card, body,
    doc, window: windowRef, watchers, setNow(value) { now = value; },
    fireDoc: (name, target, extra) => doc.emit(name, target, extra) };
}

test("Alpha 3: separate motion layer, sticky navbar, hover feedback and floating contact", () => {
  assert.match(html, /href="css\/alpha3\.css"/);
  assert.match(html, /src="js\/alpha3\.js" defer/);
  assert.match(css, /\.tkc-nav\s*\{[^}]*position:\s*sticky/);
  assert.match(css, /\.tkc-links \.tkc-link:hover::after/);
  assert.match(html, /class="tkc-contact-fab" href="#contact"/);
  assert.match(html, /aria-label="Go to the TKC Contact Us section"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Alpha 3: service strip retains four cards without previous/next buttons", () => {
  const section = html.split('<section id="capabilities" class="tkc-service-strip">')[1]
    .split('<section id="about"')[0];
  assert.equal((section.match(/class="tkc-service-card"/g) || []).length, 4);
  assert.doesNotMatch(section, /tkc-service-carousel-arrow|tkc-service-carousel-controls/);
  assert.equal((section.match(/class="tkc-service-carousel-pause"/g) || []).length, 1);
  assert.match(section, /aria-roledescription="carousel"/);
});

test("Alpha 3: all six project cards are keyboard-accessible dialog launchers", () => {
  assert.equal((html.match(/class="tkc-project-card" tabindex="0" role="button"/g) || []).length, 6);
  assert.equal((html.match(/aria-controls="tkc-project-modal"/g) || []).length, 6);
  assert.match(html, /id="tkc-project-modal" hidden/);
  assert.match(html, /aria-modal="true"/);
  for (const field of ["Application / Background", "Engineering Scope",
    "Technical Specifications", "Project Outcome"]) assert.ok(html.includes(field));
});

test("Alpha 3: sticky navigation reacts to current section and scroll position", () => {
  const h = harness();
  h.frame();
  assert.equal(h.desktop[0].getAttribute("aria-current"), "location");
  h.window.scrollY = 1900;
  h.window.emit("scroll");
  h.frame();
  assert.equal(h.nav.classList.contains("tkc-nav--scrolled"), true);
  assert.equal(h.desktop[2].getAttribute("aria-current"), "location");
  assert.equal(h.desktop[0].hasAttribute("aria-current"), false);
  h.window.scrollY = 3300;
  h.window.emit("scroll");
  h.frame();
  assert.equal(h.desktop[4].getAttribute("aria-current"), "location");
});

test("Alpha 3: carousel loops, supports keyboard and resets its scroll seamlessly", () => {
  const h = harness();
  assert.equal(h.track.items.length, 12);
  assert.equal(h.track.items.filter(el => el.getAttribute("aria-hidden") === "true").length, 8);
  assert.equal(h.viewport.scrollLeft, 1200);
  h.viewport.emit("keydown", { key: "ArrowRight" });
  assert.equal(h.viewport.scrollLeft, 1500);
  h.viewport.emit("keydown", { key: "ArrowLeft" });
  assert.equal(h.viewport.scrollLeft, 1200);
  h.viewport.scrollLeft = 1950;
  h.viewport.emit("scroll");
  assert.equal(h.viewport.scrollLeft, 750);
});

test("Alpha 3: carousel moves on page load and does not freeze when hovered", () => {
  const h = harness();
  h.setNow(9000); h.frame();
  const initial = h.viewport.scrollLeft;
  h.frame();
  assert.ok(h.viewport.scrollLeft > initial);
  h.viewport.emit("mouseenter");
  const hoverValue = h.viewport.scrollLeft;
  h.frame();
  assert.ok(h.viewport.scrollLeft > hoverValue);
});
test("Alpha 3: visitors can pause and resume automatic scrolling", () => {
  const h = harness();
  h.setNow(9000); h.frame();
  h.frame();
  h.pauseButton.emit("click");
  assert.equal(h.pauseButton.getAttribute("aria-pressed"), "true");
  assert.equal(h.pauseIcon.textContent, "▶");
  const paused = h.viewport.scrollLeft;
  h.frame();
  assert.equal(h.viewport.scrollLeft, paused);
  h.pauseButton.emit("click");
  assert.equal(h.pauseButton.getAttribute("aria-pressed"), "false");
  h.frame();
  assert.ok(h.viewport.scrollLeft > paused);
});
test("Alpha 3: desktop navbar follows the physical Projects then Brands section order", () => {
  const nav = html.split('<div class="tkc-links">')[1].split("</div>")[0];
  assert.ok(nav.indexOf('href="#capabilities"') < nav.indexOf('href="#projects"'));
  assert.ok(nav.indexOf('href="#projects"') < nav.indexOf('href="#brands"'));
  assert.ok(nav.indexOf('href="#brands"') < nav.indexOf('href="#contact"'));
});

test("Alpha 3: projects open the modal, populate verified fields and restore focus", () => {
  const h = harness();
  h.fireDoc("click", h.card);
  assert.equal(h.overlay.hidden, false);
  assert.equal(h.title.textContent, "TIG Body Machine");
  assert.equal(h.client.textContent, "PT YUTAKA");
  assert.equal(h.image.src, "project-2.png");
  assert.equal(h.body.classList.contains("tkc-dialog-open"), true);
  h.fireDoc("keydown", h.close, { key: "Escape" });
  assert.equal(h.overlay.hidden, true);
  assert.equal(h.body.classList.contains("tkc-dialog-open"), false);
  assert.equal(h.card.focused, true);
});

test("Alpha 3: existing content, PDF placeholders and previous Alpha 2 animations remain", () => {
  assert.equal((html.match(/class="tkc-project-card"/g) || []).length, 6);
  assert.equal((html.match(/class="tkc-profile-download-action"/g) || []).length, 2);
  assert.match(originalJS, /IntersectionObserver/);
  assert.doesNotMatch(originalJS, /tkc-service-card, \.tkc-business-card/);
  assert.match(html, /Stocker Out engineering project for PT Astra Honda Motor/);
  assert.doesNotMatch(html, /<li class="tkc-client-name">PT Astra Honda Motor<\/li>/);
});
