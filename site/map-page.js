/* ═══════════════════════════════════════════════
   site/map-page.js — a kezdőoldal statikus, klaszterenkénti
   kártya-nézete. A korábbi, canvas/SVG-alapú, pan/zoom-olható
   kapcsolati térképet (184 él, 59 node) egy egyszerű, görgethető,
   klaszter-szekciókra bontott kártyalistára váltottuk — nagy
   tartalommennyiségnél (60+ cikk) a szabad gráf-nézet inkább
   zavaró volt, mint hasznos, és mobilon nehezen kezelhető.
   A klaszter-hovatartozás és a szövegek (graphText) továbbra is
   a content-graph-data.js-ből jönnek, csak a megjelenítés más.
   ═══════════════════════════════════════════════ */

export function renderMapPage(ui) {
  return `<div id="page-map" class="active">
  <div class="cardmap-shell" id="cardmap-shell">
    <div class="cardmap-header">
      <div class="cardmap-title">${ui.mapCardTitle}</div>
      <p class="cardmap-intro">${ui.mapCardIntro}</p>
    </div>

    <div class="cardmap-clusters" id="cardmap-clusters">
      <!-- a klaszter-szekciókat és a cikk-kártyákat az app.js renderCardMap()
           generálja futásidőben, a graphNodes/graphClusterLabels adatból,
           hogy egy helyen (JS) legyen karbantartva a cím/leírás, ne
           duplikálva HTML-ben is. Kattintásra közvetlenül a cikkre navigál
           (showPage), nincs köztes részlet-panel. -->
    </div>
  </div>
</div>`;
}
