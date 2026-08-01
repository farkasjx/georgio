/* ═══════════════════════════════════════════════
   site/map-page.js — az interaktív kapcsolati térkép fix HTML-váza,
   most már nyelvesítve: a szövegeket a locale `ui` objektuma adja
   (lásd site/build.js LOCALES.ui.map* kulcsok).
   ═══════════════════════════════════════════════ */

export function renderMapPage(ui) {
  return `<div id="page-map" class="active">
  <div class="map-shell" id="map-shell">
    <div class="canvas" id="map-canvas">
      <svg class="connections" id="map-svg"></svg>
    </div>

    <div class="map-toolbar">
      <button class="map-btn" id="btn-zoom-in">${ui.mapZoomIn}</button>
      <button class="map-btn" id="btn-zoom-out">${ui.mapZoomOut}</button>
      <button class="map-btn" id="btn-reset">${ui.mapReset}</button>
      <button class="map-btn" id="btn-overlap">${ui.mapOverlapButton}</button>
      <button class="map-btn map-filter-toggle" id="map-filter-toggle">${ui.mapFilterToggleLabel}</button>
      <div class="map-chip-group" id="map-chip-group">
        <button class="map-btn map-chip chip-active" data-filter="all">${ui.mapFilterAll}</button>
        <button class="map-btn map-chip" data-filter="fundamentals">${ui.mapFilterFundamentals}</button>
        <button class="map-btn map-chip" data-filter="training">${ui.mapFilterTraining}</button>
        <button class="map-btn map-chip" data-filter="infra">${ui.mapFilterInfra}</button>
        <button class="map-btn map-chip" data-filter="knowledge">${ui.mapFilterKnowledge}</button>
        <button class="map-btn map-chip" data-filter="safety">${ui.mapFilterSafety}</button>
        <button class="map-btn map-chip" data-filter="practice">${ui.mapFilterPractice}</button>
        <button class="map-btn map-chip" data-filter="context">${ui.mapFilterContext}</button>
      </div>
    </div>

    <button class="map-hint-btn" id="map-hint-btn" aria-label="${ui.mapHintButtonLabel}" title="${ui.mapHintButtonLabel}">?</button>

    <!-- haszálati hint popup: első látogatáskor automatikusan megjelenik,
         utána csak a "?" gombbal nyitható meg újra (lásd initMapHint) -->
    <div class="map-hint-popup" id="map-hint-popup">
      <button class="panel-close" id="map-hint-popup-close">✕</button>
      <p class="map-hint-popup-text">${ui.mapHint}</p>
      <button class="map-btn map-hint-popup-gotit" id="map-hint-popup-gotit">${ui.mapHintGotIt}</button>
    </div>

    <!-- detail panel -->
    <div class="map-panel" id="map-panel">
      <button class="panel-close" id="panel-close">✕</button>
      <div class="panel-title" id="panel-title"></div>
      <div class="panel-time" id="panel-phase"></div>
      <div class="panel-desc" id="panel-desc"></div>
      <div class="panel-section-h">${ui.mapRelatedTopics}</div>
      <ul class="panel-list" id="panel-related"></ul>
      <button class="map-btn panel-open-btn" id="panel-open-btn">${ui.mapOpenButton}</button>
    </div>

    <!-- klaszter-átfedés panel: statikus, előre kiszámolt ábra arról, mennyire
         fonódnak össze a fő témakörök egymással (nem a JS-ből, futásidőben
         generált — ritkán változó adat, nem éri meg minden betöltéskor újraszámolni) -->
    <div class="overlap-panel" id="overlap-panel">
      <button class="panel-close" id="overlap-panel-close">✕</button>
      <div class="panel-title">${ui.mapOverlapTitle}</div>
      <p class="overlap-panel-intro">${ui.mapOverlapIntro}</p>
      <svg viewBox="0 0 520 520" class="overlap-diagram" role="img" aria-label="${ui.mapOverlapTitle}">
        <line x1="260" y1="50" x2="130" y2="140" stroke="#7F77DD" stroke-width="6.5" opacity="0.55"/>
        <line x1="260" y1="50" x2="390" y2="140" stroke="#7F77DD" stroke-width="6" opacity="0.52"/>
        <line x1="390" y1="140" x2="390" y2="330" stroke="#7F77DD" stroke-width="4.5" opacity="0.42"/>
        <line x1="260" y1="50" x2="390" y2="330" stroke="#7F77DD" stroke-width="4" opacity="0.4"/>
        <line x1="130" y1="140" x2="260" y2="470" stroke="#7F77DD" stroke-width="2.5" opacity="0.32"/>
        <line x1="130" y1="140" x2="390" y2="330" stroke="#7F77DD" stroke-width="2.5" opacity="0.32"/>
        <line x1="130" y1="330" x2="390" y2="140" stroke="#7F77DD" stroke-width="2.5" opacity="0.32"/>
        <line x1="130" y1="330" x2="390" y2="330" stroke="#7F77DD" stroke-width="2" opacity="0.28"/>
        <line x1="260" y1="50" x2="130" y2="330" stroke="#7F77DD" stroke-width="2" opacity="0.28"/>
        <line x1="130" y1="140" x2="130" y2="330" stroke="#7F77DD" stroke-width="1.5" opacity="0.22"/>
        <rect x="180" y="24" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="260" y="44" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapFundamentals}</text>
        <text x="260" y="60" text-anchor="middle" class="overlap-node-sub">12</text>
        <rect x="50" y="116" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="130" y="136" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapTraining}</text>
        <text x="130" y="152" text-anchor="middle" class="overlap-node-sub">5</text>
        <rect x="310" y="116" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="390" y="136" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapPractice}</text>
        <text x="390" y="152" text-anchor="middle" class="overlap-node-sub">12</text>
        <rect x="50" y="306" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="130" y="326" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapInfra}</text>
        <text x="130" y="342" text-anchor="middle" class="overlap-node-sub">5</text>
        <rect x="310" y="306" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="390" y="326" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapKnowledge}</text>
        <text x="390" y="342" text-anchor="middle" class="overlap-node-sub">9</text>
        <rect x="180" y="396" width="160" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="260" y="416" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapSafety}</text>
        <text x="260" y="432" text-anchor="middle" class="overlap-node-sub">3</text>
        <rect x="180" y="470" width="160" height="40" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="260" y="488" text-anchor="middle" class="overlap-node-title" style="font-size:10.5px">${ui.mapOverlapContext}</text>
        <text x="260" y="502" text-anchor="middle" class="overlap-node-sub">4</text>
      </svg>
      <p class="overlap-panel-foot">${ui.mapOverlapFoot}</p>
    </div>
  </div>
</div>`;
}
