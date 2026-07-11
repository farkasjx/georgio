/* ═══════════════════════════════════════════════
   AI HUB — app.js
   ═══════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ── */
const pages = ['map', 'roadmap', 'tools', 'prompting', 'ollama', 'aiconfig', 'security'];

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
  }

  window.location.hash = id;
}

/* ── OLDALVÁLTÓ DROPDOWN (sidebar tetején) ── */
function togglePageSwitcher() {
  const panel = document.getElementById('page-switcher-panel');
  const trigger = document.getElementById('ps-trigger');
  const isOpen = panel.classList.toggle('open');
  trigger.setAttribute('aria-expanded', String(isOpen));
}

function closePageSwitcher() {
  const panel = document.getElementById('page-switcher-panel');
  const trigger = document.getElementById('ps-trigger');
  if (!panel) return;
  panel.classList.remove('open');
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
   ROADMAP MAP
───────────────────────────────────────────── */
/* roadmap[] és edges[] most a roadmap-data.js-ben él (külön betöltve) */

let mapInitialized = false;
let activeFilter = 'all';

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const shell  = document.getElementById('map-shell');
  const canvas = document.getElementById('map-canvas');
  const svgEl  = document.getElementById('map-svg');
  const panel  = document.getElementById('map-panel');

  const W = 2200, H = 1400;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.style.width  = W + 'px';
  svgEl.style.height = H + 'px';

  // draw edges
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  svgEl.appendChild(defs);
  edges.forEach(([a,b]) => {
    const na = roadmap.find(n=>n.id===a), nb = roadmap.find(n=>n.id===b);
    if (!na || !nb) return;
    const ax = na.x+115, ay = na.y+70, bx = nb.x+115, by = nb.y+70;
    const mx = (ax+bx)/2, my = (ay+by)/2;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', `M${ax},${ay} C${mx},${ay} ${mx},${by} ${bx},${by}`);
    path.setAttribute('class','path');
    svgEl.appendChild(path);
  });

  // create nodes
  roadmap.forEach((node, i) => {
    const el = document.createElement('div');
    el.className = 'map-node';
    el.id = `node-${node.id}`;
    el.style.cssText = `left:${node.x}px;top:${node.y}px;--node-color:${node.color}`;

    el.innerHTML = `
      <span class="node-time">${node.tag}</span>
      <div class="node-label">${node.title}</div>
      <div class="node-desc">${node.short}</div>
      <div class="node-pills">
        ${node.tools.slice(0,3).map(t=>`<span class="pill">${t}</span>`).join('')}
      </div>`;

    el.addEventListener('click', () => openPanel(node));
    canvas.appendChild(el);
  });

  // pan & zoom
  let tx = -200, ty = -180, scale = 0.55;
  let dragging = false, startX, startY, startTx, startTy;

  function applyTransform(animate) {
    canvas.style.transition = animate ? 'transform 0.4s cubic-bezier(.18,.89,.32,1.08)' : 'none';
    canvas.style.transform  = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  applyTransform(false);

  shell.addEventListener('mousedown', e => {
    if (e.target.closest('.map-node')) return;
    dragging = true; shell.classList.add('dragging');
    startX = e.clientX; startY = e.clientY;
    startTx = tx; startTy = ty;
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx = startTx + (e.clientX - startX);
    ty = startTy + (e.clientY - startY);
    applyTransform(false);
  });

  window.addEventListener('mouseup', () => { dragging = false; shell.classList.remove('dragging'); });

  shell.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    scale = Math.max(0.25, Math.min(2, scale * factor));
    applyTransform(false);
  }, { passive: false });

  // zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click',  () => { scale = Math.min(2, scale*1.2); applyTransform(true); });
  document.getElementById('btn-zoom-out').addEventListener('click', () => { scale = Math.max(0.25, scale*0.83); applyTransform(true); });
  document.getElementById('btn-reset').addEventListener('click',    () => { tx=-200; ty=-180; scale=0.55; applyTransform(true); });

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
  });
}

function filterNodes(filter) {
  roadmap.forEach(n => {
    const el = document.getElementById(`node-${n.id}`);
    if (!el) return;
    const show = filter === 'all' ||
      (filter === '1-3' && n.progress <= 3) ||
      (filter === '4-6' && n.progress >= 4 && n.progress <= 6) ||
      (filter === '7-10' && n.progress >= 7);
    el.style.opacity = show ? '1' : '0.2';
    el.style.pointerEvents = show ? 'auto' : 'none';
  });
}

function openPanel(node) {
  const panel = document.getElementById('map-panel');
  document.getElementById('panel-title').textContent = node.title;
  document.getElementById('panel-phase').textContent = node.phase + ' · ' + node.tag;
  document.getElementById('panel-desc').innerHTML = node.description.map(p => `<p>${p}</p>`).join('');
  document.getElementById('panel-skills').innerHTML = node.skills.map(s => `<li>${s}</li>`).join('');
  document.getElementById('panel-tools').innerHTML = node.tools.map(t => `<li>${t}</li>`).join('');
  document.getElementById('panel-project').textContent = node.project;
  panel.classList.add('open');
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hash = (window.location.hash || '#roadmap').replace('#', '');
  const startPage = pages.includes(hash) ? hash : 'roadmap';
  showPage(startPage);

  document.querySelectorAll('.ps-item').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  // panel bezárása kattintásra kívülre, vagy Escape-re
  document.addEventListener('click', (e) => {
    const switcher = document.getElementById('page-switcher');
    if (switcher && !switcher.contains(e.target)) closePageSwitcher();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePageSwitcher();
  });
});

/* ── TÉMA-VÁLTÁS (világos / sötét) ── */
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('aihub-theme', next); } catch (e) {}
}
