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
      <button class="map-btn map-chip chip-active" data-filter="all">${ui.mapFilterAll}</button>
      <button class="map-btn map-chip" data-filter="practice">${ui.mapFilterPractice}</button>
      <button class="map-btn map-chip" data-filter="workflow">${ui.mapFilterWorkflow}</button>
      <button class="map-btn map-chip" data-filter="model">${ui.mapFilterModel}</button>
      <button class="map-btn map-chip" data-filter="knowledge">${ui.mapFilterKnowledge}</button>
    </div>

    <div class="map-hint">${ui.mapHint}</div>

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
  </div>
</div>`;
}
