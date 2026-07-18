/* ═══════════════════════════════════════════════
   engine/index.js — a markdown-feldolgozó motor belépési pontja.

   Ez a mappa (engine/) semmit nem tud erről a konkrét site-ról
   (nincs benne PAGE_ORDER, LOCALES, HTML-sablon). Ha egy másik
   projektbe akarod átvinni a .md → HTML feldolgozást, elég ezt az
   egy mappát átmásolni, és a saját build szkriptedből importálni
   innen a szükséges függvényeket:

     import { renderPage, groupSidebar, applyAutoLinks, buildSearchIndex, HLJS_CSS } from './engine/index.js';

   A site-specifikus rész (oldal-sorrend, nyelvek, HTML-sablon,
   navigáció) a site/build.js-ben él, és ezt a motort hívja meg
   oldalanként.
   ═══════════════════════════════════════════════ */

export { makeMd, HLJS_CSS } from './markdown.js';
export { renderPage } from './render-page.js';
export { groupSidebar } from './sidebar.js';
export { loadGlossary, applyAutoLinks } from './autolink.js';
export { buildSearchIndex } from './search-index.js';
