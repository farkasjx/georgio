/* ═══════════════════════════════════════════════
   AI HUB — app.js
   ═══════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ── */
const pages = [
  'map', 'tools', 'glossary', 'prompting', 'aiconfig', 'mcp', 'security', 'reasoning', 'vibecoding', 'agentic-coding', 'multimodal', 'diffusion', 'base-vs-instruct',
  'architecture', 'tokenization', 'randomness', 'ai-safety', 'agent-architecture', 'ai-history',
  'huggingface', 'enterprise-ai', 'harness-engineering', 'ai-code-review', 'ai-workflow-automation',
  'ollama', 'hardware', 'model-size', 'quantization-quality', 'dense-moe', 'kv-cache',
  'latency', 'model-routing', 'model-training', 'fine-tuning', 'evaluation', 'model-types', 'open-weight', 'llmops',
  'rag', 'vectordb', 'memory', 'okf', 'hallucination', 'knowledge-cutoff', 'rlhf', 'embedding-models', 'graphrag'
];

/* ── Kereszthivatkozás más oldal egy adott szekciójára (pl. Fogalomtár linkjei) ──
   Egy <a href="#szekcio-id" data-goto-page="oldal-kulcs"> előbb átvált a
   megfelelő oldalra (showPage), majd a DOM-frissülés után az adott
   szekcióhoz görget — sima horgony-linkkel ez nem működne, mert a showPage()
   csak a hash induláskori (DOMContentLoaded) értékét olvassa ki oldal-kulcsként. */
function initCrossPageSectionLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-goto-page]');
    if (!link || link.classList.contains('auto-link')) return; // az .auto-link linkeknek saját, preview-first kattintás-logikájuk van (lásd initTermPreviews)
    e.preventDefault();
    const targetPage = link.dataset.gotoPage;
    const targetId = link.dataset.gotoId || link.getAttribute('href').replace('#', '');
    showPage(targetPage);
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function showPage(id) {
  // oldalváltó gomb frissítése (dot + felirat) a kattintott elem adataiból
  const trigger = document.getElementById('ps-trigger');
  const matchingItem = document.querySelector(`.ps-item[data-page="${id}"]`);
  if (trigger && matchingItem) {
    document.getElementById('ps-current-dot').style.background = matchingItem.dataset.dot;
    document.getElementById('ps-current-label').textContent = matchingItem.dataset.label;
  }
  document.querySelectorAll('.ps-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === id);
  });
  closePageSwitcher();

  // map page is fullscreen fixed; other pages live in shell
  const mapPage = document.getElementById('page-map');
  const shell   = document.getElementById('shell');
  const sidebar = document.getElementById('sidebar-nav');

  if (id === 'map') {
    mapPage.classList.add('active');
    shell.style.display = 'none';
    initMap();
  } else {
    mapPage.classList.remove('active');
    shell.style.display = 'flex';

    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === `page-${id}`);
    });

    // update sidebar
    sidebar.innerHTML = buildSidebar(id);
    attachSidebarLinks();

    // új témára váltáskor mindig a cikk tetejéről induljunk, ne ott
    // maradjunk, ahol az előző oldalon görgetve voltunk
    window.scrollTo(0, 0);
  }

  window.location.hash = id;
}

/* ── OLDALVÁLTÓ DROPDOWN (sidebar tetején, mobilon bottom-sheet) ── */
function togglePageSwitcher() {
  const panel = document.getElementById('page-switcher-panel');
  const backdrop = document.getElementById('ps-backdrop');
  const trigger = document.getElementById('ps-trigger');
  const isOpen = panel.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('open', isOpen);
  trigger.setAttribute('aria-expanded', String(isOpen));
}

function closePageSwitcher() {
  const panel = document.getElementById('page-switcher-panel');
  const backdrop = document.getElementById('ps-backdrop');
  const trigger = document.getElementById('ps-trigger');
  if (!panel) return;
  panel.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

/* ── Ugrás egy adott oldal adott section-jéhez (pl. keresésből) ──
   Lapváltás + görgetés a section-höz, akkor is, ha az más oldalon van. */
function goToSection(page, id) {
  showPage(page);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

/* ─────────────────────────────────────────────
   FOGALOM-ELŐNÉZET — hover (desktop) / tap (mobil) kártya
   az automatikusan linkelt kifejezéseknél (.auto-link).

   Cél: ne kelljen azonnal elnavigálni egy másik cikkre csak azért,
   mert egy előfeltétel-fogalom felbukkan a szövegben — a kártya a
   content-graph-data.js-ben már meglévő rövid leírást (short) mutatja,
   és csak explicit kattintásra navigál tovább a teljes cikkhez.
───────────────────────────────────────────── */
let termPreviewEl = null;
let termPreviewShowTimer = null;
let termPreviewHideTimer = null;

function ensureTermPreview() {
  if (termPreviewEl) return termPreviewEl;
  const el = document.createElement('div');
  el.className = 'term-preview';
  el.innerHTML = `
    <div class="term-preview-title"></div>
    <div class="term-preview-desc"></div>
    <button type="button" class="term-preview-open"></button>
  `;
  document.body.appendChild(el);
  // ha a kártyára visz az egér (pl. hogy megnyomd a gombot), ne tűnjön el
  el.addEventListener('mouseenter', () => clearTimeout(termPreviewHideTimer));
  el.addEventListener('mouseleave', scheduleHideTermPreview);
  termPreviewEl = el;
  return el;
}

function positionTermPreview(el, link) {
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  el.classList.toggle('term-preview-sheet', isMobile);
  if (isMobile) {
    el.style.left = '';
    el.style.top = '';
    return;
  }

  const margin = 10;
  const rect = link.getBoundingClientRect();
  el.style.visibility = 'hidden';
  el.style.left = (rect.left + window.scrollX) + 'px';
  el.style.top = (rect.bottom + margin + window.scrollY) + 'px';

  // ha kilógna a viewportból, igazítsuk vissza
  const elRect = el.getBoundingClientRect();
  let left = rect.left + window.scrollX;
  let top = rect.bottom + margin + window.scrollY;
  if (elRect.right > window.innerWidth - 12) {
    left = window.innerWidth - elRect.width - 12 + window.scrollX;
  }
  if (elRect.bottom > window.innerHeight - 12) {
    top = rect.top + window.scrollY - elRect.height - margin;
  }
  el.style.left = Math.max(12, left) + 'px';
  el.style.top = top + 'px';
  el.style.visibility = '';
}

function showTermPreview(link) {
  const pageKey = link.dataset.gotoPage;
  const sectionId = link.dataset.gotoId;
  if (!pageKey || typeof graphNodes === 'undefined') return;
  const node = graphNodes.find(n => n.id === pageKey);
  if (!node) return; // nincs gráf-adat ehhez a témához, nem mutatunk kártyát

  const el = ensureTermPreview();
  el.querySelector('.term-preview-title').textContent = node.title;
  el.querySelector('.term-preview-desc').textContent = node.short;
  const openBtn = el.querySelector('.term-preview-open');
  const i18n = window.__I18N__ || {};
  openBtn.textContent = i18n.termPreviewOpenLabel || 'Open →';
  openBtn.onclick = () => {
    hideTermPreview(true);
    goToSection(pageKey, sectionId);
  };

  positionTermPreview(el, link);
  el.classList.add('open');
}

function hideTermPreview(immediate) {
  if (!termPreviewEl) return;
  clearTimeout(termPreviewHideTimer);
  if (immediate) {
    termPreviewEl.classList.remove('open');
  } else {
    termPreviewHideTimer = setTimeout(() => termPreviewEl.classList.remove('open'), 200);
  }
}
function scheduleHideTermPreview() { hideTermPreview(false); }

function initTermPreviews() {
  // desktop: hover — rövid késleltetéssel, hogy véletlen átmozgásra ne ugorjon fel
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('.auto-link');
    if (!link) return;
    clearTimeout(termPreviewHideTimer);
    clearTimeout(termPreviewShowTimer);
    termPreviewShowTimer = setTimeout(() => showTermPreview(link), 250);
  });
  document.addEventListener('mouseout', (e) => {
    const link = e.target.closest('.auto-link');
    if (!link) return;
    clearTimeout(termPreviewShowTimer);
    scheduleHideTermPreview();
  });

  // mobil / kattintás: sosem navigál azonnal, mindig előbb a kártyát mutatja
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.auto-link');
    if (link) {
      e.preventDefault();
      clearTimeout(termPreviewShowTimer);
      showTermPreview(link);
      return;
    }
    if (termPreviewEl && termPreviewEl.classList.contains('open') && !termPreviewEl.contains(e.target)) {
      hideTermPreview(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTermPreview(true);
  });
}


/* ── SIDEBAR — a build által generált adatból (window.__SIDEBAR__) ── */
function buildSidebar(id) {
  const sections = (window.__SIDEBAR__ && window.__SIDEBAR__[id]) || [];
  return sections.map(sec => `
    <div class="sidebar-section-label">${sec.label}</div>
    ${sec.links.map(l => `
      <a href="${l.href}" class="${l.sub ? 'sub' : ''}">
        ${l.num ? `<span class="sn">${l.num}</span>` : ''}
        ${l.text}
      </a>`).join('')}
  `).join('');
}

function attachSidebarLinks() {
  document.querySelectorAll('#sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => {
      setTimeout(() => {
        document.querySelectorAll('#sidebar-nav a').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      }, 80);
    });
  });

  // scroll spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        document.querySelectorAll('#sidebar-nav a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('section[id], .tech[id], div[id]').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   TARTALMI KAPCSOLATI TÉRKÉP (kezdőoldal)
───────────────────────────────────────────── */
/* graphNodes[] és graphEdges[] a content-graph-data.js-ben élnek (külön betöltve).
   Ez a gráf a site összes tartalmi oldalát mutatja, és ez adja a kezdőoldalt. */

/* graphClusterLabels a content-graph-data.js-ből jön, már a megfelelő nyelven
   (a window.__LOCALE__ alapján állt össze — lásd ott) */
const clusterLabels = graphClusterLabels;

let mapInitialized = false;
let activeFilter = 'all';

/* Node-méret + a régió-padding, amivel a klaszter háttere körülveszi a hozzá
   tartozó csomópontokat (lásd .map-node CSS: width 250px, min-height 150px). */
const NODE_W = 250, NODE_H = 150, REGION_PAD = 70;

/* A 4 klaszter fix sorrendje és a hozzá tartozó, halvány háttérszín — a node-ok
   színesek maradnak, a régió csak egy nagyon finom, elkülönítő "buborék". */
const CLUSTER_REGION_COLOR = {
  practice:  '#60a5fa',
  workflow:  '#fb923c',
  model:     '#98d016',
  knowledge: '#1613d4',
  context:   '#eab308',
};

function drawClusterRegions(svgEl) {
  const byCluster = {};
  graphNodes.forEach(n => {
    if (!byCluster[n.cluster]) byCluster[n.cluster] = [];
    byCluster[n.cluster].push(n);
  });

  Object.keys(byCluster).forEach(cluster => {
    const nodes = byCluster[cluster];
    const minX = Math.min(...nodes.map(n => n.x)) - REGION_PAD;
    const minY = Math.min(...nodes.map(n => n.y)) - REGION_PAD;
    const maxX = Math.max(...nodes.map(n => n.x + NODE_W)) + REGION_PAD;
    const maxY = Math.max(...nodes.map(n => n.y + NODE_H)) + REGION_PAD;
    const color = CLUSTER_REGION_COLOR[cluster] || '#888';

    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('class', 'cluster-region');
    rect.dataset.cluster = cluster;
    rect.setAttribute('x', minX);
    rect.setAttribute('y', minY);
    rect.setAttribute('width', maxX - minX);
    rect.setAttribute('height', maxY - minY);
    rect.setAttribute('rx', 36);
    rect.setAttribute('fill', color);
    rect.setAttribute('fill-opacity', '0.05');
    rect.setAttribute('stroke', color);
    rect.setAttribute('stroke-opacity', '0.28');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '10 8');
    svgEl.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('class', 'cluster-region-label');
    label.dataset.cluster = cluster;
    label.setAttribute('x', minX + 28);
    label.setAttribute('y', minY + 46);
    label.setAttribute('fill', color);
    label.textContent = (clusterLabels[cluster] || '').toUpperCase();
    svgEl.appendChild(label);
  });
}


function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const shell  = document.getElementById('map-shell');
  const canvas = document.getElementById('map-canvas');
  const svgEl  = document.getElementById('map-svg');
  const panel  = document.getElementById('map-panel');

  const W = 3150, H = 2900;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.style.width  = W + 'px';
  svgEl.style.height = H + 'px';

  // draw cluster background regions (a node-ok és élek MÖGÖTT, hogy a 4 klaszter
  // vizuálisan is elkülönüljön, ne csak a szűrőgombokkal lehessen szétválasztani)
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  svgEl.appendChild(defs);
  drawClusterRegions(svgEl);

  // draw edges (a pontos 'd' útvonalat az updateAllEdges() számolja ki)
  graphEdges.forEach(([a,b]) => {
    const na = graphNodes.find(n=>n.id===a), nb = graphNodes.find(n=>n.id===b);
    if (!na || !nb) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('class','path');
    path.dataset.a = a;
    path.dataset.b = b;
    svgEl.appendChild(path);
  });
  updateAllEdges();

  // create nodes
  graphNodes.forEach((node) => {
    const el = document.createElement('div');
    el.className = 'map-node';
    el.id = `node-${node.id}`;
    el.style.cssText = `left:${node.x}px;top:${node.y}px;--node-color:${node.color}`;

    el.innerHTML = `
      <span class="node-time">${clusterLabels[node.cluster] || ''}</span>
      <div class="node-label">${node.title}</div>
      <div class="node-desc">${node.short}</div>`;

    canvas.appendChild(el);
  });

  /* ── egységes koordináta-kinyerés egér- és touch-eseményekhez, hogy a
     pan/zoom/drag logikát ne kelljen duplikálni mobil és desktop között ── */
  function pointFromEvent(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  /* ── node mozgatás egérrel/érintéssel — mousedown-tól figyeljük, elmozdult-e,
     hogy meg tudjuk különböztetni a kattintást (panel nyitás) a húzástól ── */
  let draggingNode = null, nodeMoved = false;
  let nodeDragStartX, nodeDragStartY, nodeOrigX, nodeOrigY;

  function startNodeDrag(node, el, e) {
    draggingNode = node;
    nodeMoved = false;
    const p = pointFromEvent(e);
    nodeDragStartX = p.x;
    nodeDragStartY = p.y;
    nodeOrigX = node.x;
    nodeOrigY = node.y;
    el.classList.add('dragging');
  }

  graphNodes.forEach(node => {
    const el = document.getElementById(`node-${node.id}`);
    el.addEventListener('mousedown', e => { e.preventDefault(); startNodeDrag(node, el, e); });
    el.addEventListener('touchstart', e => { startNodeDrag(node, el, e); }, { passive: true });
  });

  // pan & zoom
  let tx = -100, ty = -100, scale = 0.5;
  let dragging = false, startX, startY, startTx, startTy;
  let pinchStartDist = null, pinchStartScale = null;

  function applyTransform(animate) {
    canvas.style.transition = animate ? 'transform 0.4s cubic-bezier(.18,.89,.32,1.08)' : 'none';
    canvas.style.transform  = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  applyTransform(false);

  function startPan(e) {
    if (e.target.closest('.map-node')) return;
    dragging = true; shell.classList.add('dragging');
    const p = pointFromEvent(e);
    startX = p.x; startY = p.y;
    startTx = tx; startTy = ty;
  }

  function movePan(e) {
    if (draggingNode) {
      const p = pointFromEvent(e);
      const dx = (p.x - nodeDragStartX) / scale;
      const dy = (p.y - nodeDragStartY) / scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) nodeMoved = true;
      draggingNode.x = nodeOrigX + dx;
      draggingNode.y = nodeOrigY + dy;
      const el = document.getElementById(`node-${draggingNode.id}`);
      el.style.left = draggingNode.x + 'px';
      el.style.top  = draggingNode.y + 'px';
      updateEdgesForNode(draggingNode.id);
      return;
    }
    if (!dragging) return;
    const p = pointFromEvent(e);
    tx = startTx + (p.x - startX);
    ty = startTy + (p.y - startY);
    applyTransform(false);
  }

  function endPan() {
    if (draggingNode) {
      const el = document.getElementById(`node-${draggingNode.id}`);
      if (el) el.classList.remove('dragging');
      if (!nodeMoved) selectNode(draggingNode);
      draggingNode = null;
    }
    dragging = false; shell.classList.remove('dragging');
    pinchStartDist = null;
  }

  function touchDist(e) {
    const [a, b] = e.touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  shell.addEventListener('mousedown', startPan);
  window.addEventListener('mousemove', movePan);
  window.addEventListener('mouseup', endPan);

  /* mobil: egyujjas érintés = pan/node-mozgatás (ugyanaz a logika, mint egérrel),
     kétujjas csippentés = zoom. passive:false kell a preventDefault-hoz, hogy az
     oldal ne görgessen/zoomoljon a böngésző natív gesztusával egyszerre. */
  shell.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinchStartDist = touchDist(e);
      pinchStartScale = scale;
      return;
    }
    startPan(e);
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchStartDist) {
      e.preventDefault();
      const factor = touchDist(e) / pinchStartDist;
      scale = Math.max(0.25, Math.min(2, pinchStartScale * factor));
      applyTransform(false);
      return;
    }
    if (dragging || draggingNode) e.preventDefault();
    movePan(e);
  }, { passive: false });

  window.addEventListener('touchend', endPan);
  window.addEventListener('touchcancel', endPan);

  shell.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    scale = Math.max(0.25, Math.min(2, scale * factor));
    applyTransform(false);
  }, { passive: false });

  // zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click',  () => { scale = Math.min(2, scale*1.2); applyTransform(true); });
  document.getElementById('btn-zoom-out').addEventListener('click', () => { scale = Math.max(0.25, scale*0.83); applyTransform(true); });
  document.getElementById('btn-reset').addEventListener('click',    () => {
    tx=-100; ty=-100; scale=0.5; applyTransform(true);
    clearHighlight();
    panel.classList.remove('open');
  });

  // filter chips
  document.querySelectorAll('.map-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      activeFilter = f;
      document.querySelectorAll('.map-chip').forEach(c => c.classList.toggle('chip-active', c.dataset.filter === f));
      filterNodes(f);
    });
  });

  document.getElementById('panel-close').addEventListener('click', () => {
    panel.classList.remove('open');
    clearHighlight();
  });
}

/* ── él-útvonalak kiszámítása a node középpontjai alapján (mozgatható node-ok miatt dinamikus) ── */
function edgePathD(na, nb) {
  const ax = na.x+125, ay = na.y+75, bx = nb.x+125, by = nb.y+75;
  const mx = (ax+bx)/2, my = (ay+by)/2;
  return `M${ax},${ay} C${mx},${ay} ${mx},${by} ${bx},${by}`;
}

function updateAllEdges() {
  document.querySelectorAll('.path').forEach(p => {
    const na = graphNodes.find(n => n.id === p.dataset.a);
    const nb = graphNodes.find(n => n.id === p.dataset.b);
    if (na && nb) p.setAttribute('d', edgePathD(na, nb));
  });
}

function updateEdgesForNode(id) {
  document.querySelectorAll('.path').forEach(p => {
    if (p.dataset.a !== id && p.dataset.b !== id) return;
    const na = graphNodes.find(n => n.id === p.dataset.a);
    const nb = graphNodes.find(n => n.id === p.dataset.b);
    if (na && nb) p.setAttribute('d', edgePathD(na, nb));
  });
}

/* ── kijelölés: kiszínezi a csomóponthoz tartozó éleket és a szomszédos node-okat ── */
function clearHighlight() {
  document.querySelectorAll('.path').forEach(p => p.classList.remove('highlight'));
  document.querySelectorAll('.map-node').forEach(n => n.classList.remove('node-active', 'node-related'));
}

function selectNode(node) {
  clearHighlight();
  const el = document.getElementById(`node-${node.id}`);
  if (el) el.classList.add('node-active');
  document.querySelectorAll('.path').forEach(p => {
    if (p.dataset.a !== node.id && p.dataset.b !== node.id) return;
    p.classList.add('highlight');
    const otherId = p.dataset.a === node.id ? p.dataset.b : p.dataset.a;
    const otherEl = document.getElementById(`node-${otherId}`);
    if (otherEl) otherEl.classList.add('node-related');
  });
  openPanel(node);
}

function filterNodes(filter) {
  graphNodes.forEach(n => {
    const el = document.getElementById(`node-${n.id}`);
    if (!el) return;
    const show = filter === 'all' || n.cluster === filter;
    el.style.opacity = show ? '1' : '0.15';
    el.style.pointerEvents = show ? 'auto' : 'none';
  });

  document.querySelectorAll('.path').forEach(p => {
    const a = graphNodes.find(n => n.id === p.dataset.a);
    const b = graphNodes.find(n => n.id === p.dataset.b);
    const show = filter === 'all' || (a && a.cluster === filter) || (b && b.cluster === filter);
    p.style.opacity = show ? '1' : '0.08';
  });

  document.querySelectorAll('.cluster-region, .cluster-region-label').forEach(el => {
    const show = filter === 'all' || el.dataset.cluster === filter;
    el.style.opacity = show ? '1' : '0.12';
  });
}

/* related csomópontok az élek alapján, dinamikusan (nincs kézzel karbantartott lista) */
function getRelatedNodes(id) {
  const relatedIds = new Set();
  graphEdges.forEach(([a, b]) => {
    if (a === id) relatedIds.add(b);
    if (b === id) relatedIds.add(a);
  });
  return [...relatedIds].map(rid => graphNodes.find(n => n.id === rid)).filter(Boolean);
}

function openPanel(node) {
  const panel = document.getElementById('map-panel');
  document.getElementById('panel-title').textContent = node.title;
  document.getElementById('panel-phase').textContent = clusterLabels[node.cluster] || '';
  document.getElementById('panel-desc').innerHTML = node.desc.map(p => `<p>${p}</p>`).join('');

  const related = getRelatedNodes(node.id);
  document.getElementById('panel-related').innerHTML = related
    .map(r => `<li data-goto="${r.id}" style="cursor:pointer">${r.title}</li>`).join('');
  document.querySelectorAll('#panel-related li').forEach(li => {
    li.addEventListener('click', () => {
      const target = graphNodes.find(n => n.id === li.dataset.goto);
      if (target) selectNode(target);
    });
  });

  const openBtn = document.getElementById('panel-open-btn');
  openBtn.onclick = () => showPage(node.id);

  panel.classList.add('open');
}

/* ─────────────────────────────────────────────
   TARTALOM-FRISSÍTÉS FIGYELÉS (localStorage)
   Minden .md tartalomhoz épül egy hash (lásd build.js), amit a
   window.__CONTENT_VERSIONS__ tartalmaz. Ezt hasonlítjuk össze azzal,
   amit korábban elmentettünk a böngészőben, hogy megmutassuk, mi
   változott az előző látogatás óta.
───────────────────────────────────────────── */
/* Nyelvenként külön kulcs — a HU és EN tartalom hash-e magától is eltér
   (más a szöveg), szóval ha egy közös kulcsot használnánk, minden
   nyelvváltás "mindenhol változott" hamis riasztást adna. */
const VERSION_STORAGE_KEY = 'aihub-content-versions-' + (window.__LOCALE__ || 'hu');

function initVersionTracking() {
  const current = window.__CONTENT_VERSIONS__ || {};
  if (!Object.keys(current).length) return;

  let stored = null;
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch (e) { stored = null; }

  if (!stored) {
    // első alkalom — nincs mihez viszonyítani, csak jelezzük, hogy mostantól figyeljük
    showVersionPopup({ intro: true, changed: [] });
  } else {
    const changed = [];
    Object.keys(current).forEach(key => {
      const prev = stored[key];
      if (!prev) {
        changed.push({ key, title: current[key].title, type: 'new' });
      } else if (prev.version !== current[key].version) {
        changed.push({ key, title: current[key].title, type: 'updated' });
      }
    });
    if (changed.length) showVersionPopup({ intro: false, changed });
  }

  try { localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(current)); } catch (e) {}
}

function showVersionPopup({ intro, changed }) {
  const overlay = document.getElementById('version-popup-overlay');
  const titleEl = document.getElementById('version-popup-title');
  const bodyEl  = document.getElementById('version-popup-body');
  if (!overlay || !titleEl || !bodyEl) return;
  const i18n = window.__I18N__ || {};

  if (intro) {
    titleEl.textContent = i18n.versionPopupTitleIntro || '';
    bodyEl.innerHTML = `<p>${i18n.versionPopupBodyIntro || ''}</p>`;
  } else {
    titleEl.textContent = i18n.versionPopupTitleUpdate || '';
    const items = changed.map(c => `
      <li data-goto="${c.key}">
        <span class="version-item-tag ${c.type}">${c.type === 'new' ? (i18n.versionPopupNewTag || '') : (i18n.versionPopupUpdatedTag || '')}</span>
        <span class="version-item-title">${c.title}</span>
        <span class="version-item-open">${i18n.versionPopupOpenLabel || ''} →</span>
      </li>`).join('');
    bodyEl.innerHTML = `<p>${i18n.versionPopupBodyUpdate || ''}</p><ul class="version-popup-list">${items}</ul>`;
    bodyEl.querySelectorAll('li[data-goto]').forEach(li => {
      li.addEventListener('click', () => {
        closeVersionPopup();
        showPage(li.dataset.goto);
      });
    });
  }

  overlay.classList.add('open');
}

function closeVersionPopup() {
  const overlay = document.getElementById('version-popup-overlay');
  if (overlay) overlay.classList.remove('open');
}

/* ─────────────────────────────────────────────
   COOKIE / ANALYTICS CONSENT (Google Analytics, Consent Mode v2)
   Alapból minden gtag consent 'denied' (lásd a <head>-ben). Ez a
   kód csak azt dönti el, mutassuk-e a bannert, és ha a látogató már
   döntött korábban, minden oldalbetöltéskor újra alkalmazza azt a
   döntést — a Google Consent Mode API-ja NEM perzisztál automatikusan
   lapváltás/újratöltés között, ezt nekünk kell megtennünk.
───────────────────────────────────────────── */
const COOKIE_CONSENT_KEY = 'aihub-cookie-consent'; // 'granted' | 'denied'

function applyStoredConsent() {
  let stored = null;
  try { stored = localStorage.getItem(COOKIE_CONSENT_KEY); } catch (e) { stored = null; }
  if (stored === 'granted' || stored === 'denied') {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: stored });
    }
  }
  return stored;
}

function setConsent(value) {
  try { localStorage.setItem(COOKIE_CONSENT_KEY, value); } catch (e) {}
  if (typeof gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: value });
  }
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('open');
}

function initCookieConsent() {
  const decided = applyStoredConsent();
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  if (!decided) {
    banner.classList.add('open');
  }

  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', () => setConsent('granted'));
  if (declineBtn) declineBtn.addEventListener('click', () => setConsent('denied'));
}

/* ── VISSZA A TETEJÉRE gomb — csak akkor látszik, ha van mit görgetni vissza,
   és nem a teljes képernyős map oldalon (ott nincs window-scroll) ── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    const onMap = document.getElementById('page-map')?.classList.contains('active');
    btn.classList.toggle('visible', !onMap && window.scrollY > 400);
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hash = (window.location.hash || '#map').replace('#', '');
  const startPage = pages.includes(hash) ? hash : 'map';
  showPage(startPage);

  document.querySelectorAll('.ps-item').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  initVersionTracking();
  initTermPreviews();
  initCrossPageSectionLinks();
  initCookieConsent();
  initBackToTop();

  // panel bezárása kattintásra kívülre, vagy Escape-re
  document.addEventListener('click', (e) => {
    const switcher = document.getElementById('page-switcher');
    if (switcher && !switcher.contains(e.target)) closePageSwitcher();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePageSwitcher(); closeVersionPopup(); }
  });
});

/* ── TÉMA-VÁLTÁS (világos / sötét) ── */
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('aihub-theme', next); } catch (e) {}
}
