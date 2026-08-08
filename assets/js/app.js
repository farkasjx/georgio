/* ═══════════════════════════════════════════════
   AI HUB — app.js
   ═══════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ── */
const pages = [
  'map', 'tools', 'glossary', 'prompting', 'aiconfig', 'mcp', 'security', 'reasoning', 'vibecoding', 'agentic-coding', 'multimodal', 'diffusion', 'base-vs-instruct',
  'architecture', 'tokenization', 'randomness', 'ai-safety', 'agent-architecture', 'multi-agent-systems', 'ai-history', 'ml-fundamentals', 'neural-network-basics', 'cost-optimization', 'fine-tuning-workflow', 'browser-agents', 'prompt-versioning', 'llm-observability',
  'huggingface', 'enterprise-ai', 'harness-engineering', 'ai-code-review', 'ai-workflow-automation', 'diy-model-training', 'code-llm-architecture', 'domain-specific-models',
  'ollama', 'hardware', 'model-size', 'quantization-quality', 'dense-moe', 'kv-cache',
  'latency', 'model-routing', 'model-training', 'fine-tuning', 'evaluation', 'model-types', 'open-weight', 'llmops', 'ai-copyright-law', 'ai-regulation-liability',
  'rag', 'vectordb', 'memory', 'okf', 'hallucination', 'knowledge-cutoff', 'rlhf', 'embedding-models', 'graphrag', 'rag-architectures'
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
  fundamentals: '#60a5fa',
  training:     '#f472b6',
  infra:        '#98d016',
  knowledge:    '#1613d4',
  safety:       '#e06c75',
  practice:     '#fb923c',
  context:      '#eab308',
};

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const container = document.getElementById('cardmap-clusters');
  if (!container) return;

  // klaszter-sorrend úgy, ahogy a PAGE_ORDER/dropdown-ban is szerepelnek —
  // ez adja a kártya-szekciók megjelenési sorrendjét
  const clusterOrder = ['fundamentals', 'training', 'infra', 'safety', 'context', 'practice', 'knowledge'];

  const byCluster = {};
  graphNodes.forEach(n => {
    if (!byCluster[n.cluster]) byCluster[n.cluster] = [];
    byCluster[n.cluster].push(n);
  });

  clusterOrder.forEach(cluster => {
    const nodes = byCluster[cluster];
    if (!nodes || !nodes.length) return;

    const section = document.createElement('section');
    section.className = 'cardmap-section';
    section.dataset.cluster = cluster;

    const header = document.createElement('div');
    header.className = 'cardmap-section-header';
    const dot = document.createElement('span');
    dot.className = 'cardmap-section-dot';
    dot.style.background = CLUSTER_REGION_COLOR[cluster] || '#888';
    const title = document.createElement('span');
    title.className = 'cardmap-section-title';
    title.textContent = clusterLabels[cluster] || cluster;
    const count = document.createElement('span');
    count.className = 'cardmap-section-count';
    count.textContent = nodes.length;
    header.appendChild(dot);
    header.appendChild(title);
    header.appendChild(count);
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'cardmap-grid';
    nodes.forEach(node => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cardmap-card';
      card.style.setProperty('--card-color', node.color);
      card.innerHTML = `
        <div class="cardmap-card-dot" style="background:${node.color}"></div>
        <div class="cardmap-card-title">${node.title}</div>
        <div class="cardmap-card-desc">${node.short}</div>`;
      card.addEventListener('click', () => showPage(node.id));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
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
