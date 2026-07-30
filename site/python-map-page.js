/* ═══════════════════════════════════════════════
   site/python-map-page.js — a Python-réteg egyszerűsített,
   statikus mini-térképe. Szándékosan EGYSZERŰBB, mint a fő
   interaktív térkép (nincs pan/zoom/drag, nincs szűrő, nincs
   hint-popup) — 4 node-nál ez felesleges komplexitás lenne.
   Csak a lényeg maradt: node-ok, élek, kattintásra megnyíló
   panel, és egy "vissza a fő térképre" gomb.
   ═══════════════════════════════════════════════ */

export function renderPythonMapPage(ui) {
  return `<div id="page-python-map">
  <div class="pymap-shell" id="pymap-shell">
    <a class="pymap-back" href="#" id="pymap-back-btn">${ui.pyMapBackToMain}</a>
    <div class="pymap-header">
      <div class="pymap-title">${ui.pyMapTitle}</div>
      <p class="pymap-intro">${ui.pyMapIntro}</p>
    </div>

    <div class="pymap-canvas" id="pymap-canvas">
      <svg class="pymap-connections" id="pymap-svg" viewBox="0 0 1120 600"></svg>
      <!-- a node-okat a python-map.js generálja futásidőben, a
           PYTHON_MAP_NODES adatból, hogy egy helyen (JS) legyen
           karbantartva a cím/leírás, ne duplikálva HTML-ben is -->
    </div>

    <!-- detail panel — ugyanaz a vizuális minta, mint a fő térkép
         .map-panel-je, de saját, egyszerűbb id-kkel -->
    <div class="pymap-panel" id="pymap-panel">
      <button class="panel-close" id="pymap-panel-close">✕</button>
      <div class="panel-title" id="pymap-panel-title"></div>
      <div class="panel-desc" id="pymap-panel-desc"></div>
      <button class="map-btn panel-open-btn" id="pymap-panel-open-btn">${ui.mapOpenButton}</button>
    </div>
  </div>
</div>`;
}
