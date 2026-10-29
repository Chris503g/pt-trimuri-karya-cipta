/* TKC portfolio and trading-library acceptance tests */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "js", "alpha3.js"), "utf8");
const cards = [...html.matchAll(/<article class="tkc-project-card"[^>]*>[\s\S]*?<\/article>/g)].map(m => m[0]);
const projectMap = [
  ["TIG Body Machine", "project-1.png", "PT YUTAKA"],
  ["Broaching Machine", "project-5.png", "PT IPM"],
  ["Auto Transfer Hole Punching Machine", "project-3.png", "PT DENSO"],
  ["Cabin Robot", "project-4.png", "PT YUTAKA"],
  ["Free Length Check Machine", "project-6.png", "PT ASTEMO"],
  ["Stocker Out", "project-2.png", null]
];
test("Six project cards use correctly grouped images", () => {
  assert.equal(cards.length, 6);
  for (let i = 0; i < projectMap.length; i++) {
    const [name, image, client] = projectMap[i];
    const file = "assets/projects/" + image;
    assert.ok(cards[i].includes('<h3 class="tkc-project-name">' + name + '</h3>'), name);
    assert.ok(cards[i].includes('src="' + file + '"'), file);
    assert.ok(cards[i].includes('alt="' + name), name);
    assert.ok(fs.existsSync(path.join(root, file)), file);
    if (client) assert.ok(cards[i].includes('<span class="tkc-project-client">' + client + '</span>'));
    else assert.doesNotMatch(cards[i], /tkc-project-client|PT AHM|Astra Honda Motor/);
  }
});
test("Stocker Out modal retains behavior", () => {
  assert.match(js, /if \(!name \|\| !image\) return/);
  assert.match(js, /clientRow.hidden = !company/);
  assert.match(js, /modalImage.src = image.getAttribute\("src"\)/);
  assert.ok(cards[5].includes('src="assets/projects/project-2.png"'));
});
test("All 166 trading cards across six divisions have valid local images", () => {
  const section = html.split('<section id="brands"')[1].split('<section id="customers"')[0];
  const panels = [...section.matchAll(/id="tkc-tabset-1-pane-\d+" role="tabpanel"/g)];
  const categories = [...section.matchAll(/<details class="tkc-trading-category"/g)];
  const brandCards = [...section.matchAll(/<div class="tkc-trading-brand-card" role="listitem">[\s\S]*?<\/div>/g)].map(m => m[0]);
  assert.equal(panels.length, 6);
  assert.equal(categories.length, 21);
  assert.equal(brandCards.length, 166);
  for (const card of brandCards) {
    const img = card.match(/<img class="tkc-trading-brand-mark"[^>]*src="([^"]+)"/);
    assert.ok(img, "brand card requires local image");
    assert.match(img[1], /^assets\/(?:official-logos|trading-brand-logos)\//);
    assert.ok(fs.existsSync(path.join(root, img[1])), "missing trading logo " + img[1]);
    assert.match(card, /class="tkc-trading-brand-name">[^<]+<\/span>/);
  }
  assert.doesNotMatch(section, /LOGO PENDING/);
});
test("Engineering customer artwork resolves locally", () => {
  const section = html.split('<section id="customers"')[1].split('<section id="csr"')[0];
  const images = [...section.matchAll(/<img class="tkc-client-tile-image(?: tkc-client-logo-image)?" src="([^"]+)"/g)].map(m => m[1]);
  assert.ok(images.length >= 7);
  for (const img of images) assert.ok(fs.existsSync(path.join(root,img)), "missing customer logo " + img);
  assert.match(section, /PT Yutaka Manufacturing Indonesia/);
  assert.match(section, /Toyota Tsusho/);
});
test("Page's internal CSS, JS and image URLs point to existing files", () => {
  const files = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]).filter(s => /^(assets\/|css\/|js\/)/.test(s));
  for (const file of files) assert.ok(fs.existsSync(path.join(root,file)), "missing site file " + file);
  assert.ok(fs.existsSync(path.join(root, "assets/site/tkc-logo-refined.svg")));
  assert.ok(fs.existsSync(path.join(root, "assets/site/tkc-cover.jpg")));
});
