// Runs synchronously in <head>, before first paint.
// Marks that JS is available (so animation start-states only apply when JS can finish them)
// and decides whether to show the one-time brand curtain.
(function () {
  var h = document.documentElement;
  h.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('fl-seen') === '1'; sessionStorage.setItem('fl-seen', '1'); } catch (e) { /* storage blocked */ }
  if (!reduce && !seen && !location.hash) h.classList.add('has-curtain');
  if (reduce) h.classList.add('reduce-motion');
  // Fail-safe: never leave the page hidden if main.js fails to load.
  setTimeout(function () { h.classList.add('is-ready'); }, 4000);
})();
