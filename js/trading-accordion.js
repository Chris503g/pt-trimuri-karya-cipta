/* TKC Mechanical trading categories: progressive enhancement for native details.
   The name attribute provides single-open behavior in supporting browsers;
   the toggle handler preserves it in older browsers without a framework. */
(() => {
  "use strict";
  const accordion = document.querySelector("[data-tkc-trading-accordion]");
  if (!accordion) return;
  const categories = Array.from(accordion.querySelectorAll("details.tkc-trading-category"));
  categories.forEach(category => {
    category.addEventListener("toggle", () => {
      if (!category.open) return;
      categories.forEach(other => {
        if (other !== category && other.open) other.open = false;
      });
    });
  });
})();