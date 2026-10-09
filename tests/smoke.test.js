/* Run with: node --test tests/smoke.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = p=>fs.readFileSync(path.join(root,p),"utf8");
const html=read("index.html"),css=read("css/styles.css"),js=read("js/main.js");
test("one semantic main and navigation landmarks",()=>{
 assert.equal((html.match(/<main(?: |>|\n)/g)||[]).length,1);
 assert.match(html,/<nav(?: |>|\n)/);assert.match(html,/<footer(?: |>|\n)/);
});
test("key Webflow sections exist",()=>{
 for(const section of ["about","business","capabilities-detail","projects","brands","customers","csr","contact"])assert.match(html,new RegExp('id="'+section+'"'));
});
test("all six engineering images are available",()=>{
 for(let i=1;i<=6;i++){assert.match(html,new RegExp('src="project-'+i+'\\.png"'));assert.ok(fs.existsSync(path.join(root,'project-'+i+'.png')));}
});
test("TKC logos and metadata are available",()=>{
 assert.ok(fs.existsSync(path.join(root,"tkc-logo-refined.svg")));
 assert.ok(fs.existsSync(path.join(root,"tkc-cover.jpg")));
 assert.match(html,/application\/ld\+json/);assert.match(html,/og:image/);
});
test("both native category groups have three tabs",()=>{
 assert.equal((html.match(/role="tablist"/g)||[]).length,2);
 assert.equal((html.match(/role="tabpanel"/g)||[]).length,6);
 assert.equal((html.match(/role="tab"/g)||[]).length,6);
 assert.match(js,/ArrowRight/);assert.match(js,/aria-selected/);
});
test("mobile navigation and anchor destinations are configured",()=>{
 assert.match(js,/aria-expanded/);assert.match(js,/Escape/);
 assert.match(html,/href="#main-content"/);
 const anchors = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
 for(const m of html.matchAll(/href="#([^"]+)"/g))if(m[1])assert.ok(anchors.has(m[1]),"missing anchor "+m[1]);
});
test("PDF placeholders stay disabled",()=>{
 assert.equal((html.match(/class="tkc-profile-download-action"/g)||[]).length,2);
 assert.match(js,/setAttribute\("disabled"/);
});
test("brand and customer filtering assets not missing",()=>{
 assert.match(html,/NTN/);assert.match(html,/SICK/);assert.match(html,/Adi Cikwarman/);
 assert.match(html,/6281242004643/);
});
test("responsive settings preserved",()=>{
 assert.match(css,/max-width:991px/);
 assert.match(css,/max-width:767px/);
 assert.match(css,/max-width:479px/);
 assert.match(css,/tkc-projects-grid/);
});


test("Alpha 1 acceptance: About grid fits within its container",()=>{
 assert.match(css,/grid-template-columns:minmax\(0,45fr\) minmax\(0,55fr\)/);
 assert.doesNotMatch(css,/grid-template-columns:45% 55%/);
 assert.match(css,/tkc-about-grid > \.tkc-about-visual/);
});
test("Alpha 1 acceptance: hero and About headings are readable",()=>{
 assert.match(html,/Your Partner in <span class="tkc-highlight">Industrial Solutions<\/span>/);
 assert.match(html,/PRODUCTS\. AUTOMATION\. ENGINEERING\./);
 assert.match(html,/INDUSTRIAL SUPPORT<\/strong>/);
 assert.match(css,/\.tkc-note-title\s*\{[^}]*overflow-wrap:break-word/);
});
test("Alpha 1 acceptance: omit PT AHM only from customer list",()=>{
 const customers=html.split('id="customers"')[1].split('id="csr"')[0];
 assert.doesNotMatch(customers,/PT Astra Honda Motor/);
 assert.match(html,/>PT AHM<\/span>/);  // Stocker Out project is preserved.
 assert.match(html,/Stocker Out engineering project for PT Astra Honda Motor/);
});
