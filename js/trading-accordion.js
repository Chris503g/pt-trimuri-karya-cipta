/* TKC trading category accordions. Keep only one category open within each division. */
(() => {
  "use strict";
  document.querySelectorAll("[data-tkc-trading-accordion]").forEach(accordion => {
    const categories = Array.from(accordion.querySelectorAll("details.tkc-trading-category"));
    categories.forEach(category => {
      category.addEventListener("toggle", () => {
        if (!category.open) return;
        categories.forEach(other => { if (other !== category && other.open) other.open = false; });
      });
    });
  });
})();