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
        <button class="map-btn map-chip" data-filter="context">${ui.mapFilterContext}</button>
        <button class="map-btn map-chip" data-filter="practice">${ui.mapFilterPractice}</button>
        <button class="map-btn map-chip" data-filter="workflow">${ui.mapFilterWorkflow}</button>
        <button class="map-btn map-chip" data-filter="model">${ui.mapFilterModel}</button>
        <button class="map-btn map-chip" data-filter="knowledge">${ui.mapFilterKnowledge}</button>
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
      <svg viewBox="0 0 460 430" class="overlap-diagram" role="img" aria-label="${ui.mapOverlapTitle}">
        <line x1="230" y1="70" x2="120" y2="220" stroke="#7F77DD" stroke-width="7" opacity="0.55"/>
        <line x1="230" y1="70" x2="340" y2="220" stroke="#7F77DD" stroke-width="5" opacity="0.5"/>
        <line x1="120" y1="220" x2="340" y2="220" stroke="#7F77DD" stroke-width="4.5" opacity="0.5"/>
        <line x1="340" y1="220" x2="340" y2="350" stroke="#7F77DD" stroke-width="4" opacity="0.45"/>
        <line x1="120" y1="220" x2="340" y2="350" stroke="#7F77DD" stroke-width="3" opacity="0.4"/>
        <line x1="230" y1="70" x2="120" y2="350" stroke="#7F77DD" stroke-width="2.5" opacity="0.35"/>
        <line x1="230" y1="70" x2="340" y2="350" stroke="#7F77DD" stroke-width="2" opacity="0.3"/>
        <line x1="120" y1="350" x2="340" y2="220" stroke="#7F77DD" stroke-width="2" opacity="0.3"/>
        <rect x="155" y="46" width="150" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="230" y="66" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapContext}</text>
        <text x="230" y="82" text-anchor="middle" class="overlap-node-sub">2</text>
        <rect x="20" y="196" width="180" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="110" y="216" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapPractice}</text>
        <text x="110" y="232" text-anchor="middle" class="overlap-node-sub">11</text>
        <rect x="255" y="196" width="180" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="345" y="216" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapWorkflow}</text>
        <text x="345" y="232" text-anchor="middle" class="overlap-node-sub">9</text>
        <rect x="20" y="326" width="180" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="110" y="346" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapModel}</text>
        <text x="110" y="362" text-anchor="middle" class="overlap-node-sub">14</text>
        <rect x="255" y="326" width="180" height="48" rx="10" fill="var(--bg-3)" stroke="#7F77DD" stroke-width="1"/>
        <text x="345" y="346" text-anchor="middle" class="overlap-node-title">${ui.mapOverlapKnowledge}</text>
        <text x="345" y="362" text-anchor="middle" class="overlap-node-sub">10</text>
      </svg>
      <p class="overlap-panel-foot">${ui.mapOverlapFoot}</p>
    </div>
  </div>
</div>`;
}
