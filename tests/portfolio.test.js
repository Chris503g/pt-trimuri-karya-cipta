/* TKC portfolio imagery and naming acceptance checks.
   Run locally: node --test tests/portfolio.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "portfolio.css"), "utf8");
const js = fs.readFileSync(path.join(root, "js", "alpha3.js"), "utf8");
const cards = [...html.matchAll(/<article class="tkc-project-card"[^>]*>[\s\S]*?<\/article>/g)]
  .map(match => match[0]);
const projectMap = [
  ["TIG Body Machine", "project-1.png", "PT YUTAKA"],
  ["Broaching Machine", "project-5.png", "PT IPM"],
  ["Auto Transfer Hole Punching Machine", "project-3.png", "PT DENSO"],
  ["Cabin Robot", "project-4.png", "PT YUTAKA"],
  ["Free Length Check Machine", "project-6.png", "PT ASTEMO"],
  ["Stocker Out", "project-2.png", null]
];

test("All six project titles match the company-profile images", () => {
  assert.equal(cards.length, 6);
  for (let i = 0; i < projectMap.length; i++) {
    const [name, image, client] = projectMap[i];
    assert.match(cards[i], new RegExp('<h3 class="tkc-project-name">' + name + '</h3>'));
    assert.ok(cards[i].includes('src="' + image + '"'), name + " should use " + image);
    assert.ok(cards[i].includes('alt="' + name), name + " should have matching image alt text");
    if (client) {
      assert.ok(cards[i].includes('<span class="tkc-project-client">' + client + '</span>'));
    } else {
      assert.doesNotMatch(cards[i], /tkc-project-client|PT AHM|Astra Honda Motor/);
    }
    assert.equal(fs.existsSync(path.join(root, image)), true, image + " is present");
  }
});

test("Stocker Out modal hides customer row and uses the chosen photo", () => {
  assert.match(js, /if \(!name \|\| !image\) return/);
  assert.match(js, /clientRow.hidden = !company/);
  assert.match(js, /modalImage.src = image.getAttribute\("src"\)/);
  assert.match(cards[5], /src="project-2.png"/);
});

test("All featured trading brands have locally stored image badges", () => {
  const section = html.split('<section id="brands"')[1].split('<section id="customers"')[0];
  const images = [...section.matchAll(/<img class="tkc-brand-tile-image" src="([^"]+)" alt=""[^>]*>/g)]
    .map(match => match[1]);
  assert.equal(images.length, 14);
  assert.equal(new Set(images).size, 14);
  for (const file of images) {
    assert.ok(file.startsWith("assets/trading/"));
    const target = path.join(root, file);
    assert.ok(fs.existsSync(target), "missing image " + file);
    assert.match(fs.readFileSync(target, "utf8"), /<svg/);
  }
});

test("Featured engineering customers have local visual badges and accurate names", () => {
  const section = html.split('<section id="customers"')[1].split('<section id="csr"')[0];
  const images = [...section.matchAll(/<img class="tkc-client-tile-image" src="([^"]+)" alt=""[^>]*>/g)]
    .map(match => match[1]);
  assert.equal(images.length, 7);
  assert.equal(new Set(images).size, 7);
  for (const file of images) {
    assert.ok(file.startsWith("assets/customers/"));
    const target = path.join(root, file);
    assert.ok(fs.existsSync(target), "missing customer badge " + file);
    assert.match(fs.readFileSync(target, "utf8"), /<svg/);
  }
  assert.match(section, /PT Yutaka Manufacturing Indonesia/);
  assert.match(section, /Toyota Tsusho/);
  assert.match(section, /PT Indolakto/);
});

test("Hidden entries stay hidden, filters unchanged, and image labels remain accessible", () => {
  assert.equal((html.match(/role="tablist"/g) || []).length, 2);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 6);
  assert.match(html, /<div hidden class="tkc-brand-mini">IKO<\/div>/);
  assert.match(html, /<li hidden class="tkc-client-name">KYB<\/li>/);
  assert.match(html, /class="tkc-client-tile-name">DENSO<\/span>/);
  assert.match(html, /class="tkc-brand-tile-name">NTN<\/span>/);
  assert.match(css, /@media \(max-width: 479px\)/);
});
