/* ═══════════════════════════════════════════════
   build.js — AI Hub statikus build
   content/*.md  ->  public/index.html  (+ public/assets/*)

   Használat:
     npm run build          egyszeri build
     npm run build -- --watch   figyeli a content/ változásait
   ═══════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';
import mdAttrs from 'markdown-it-attrs';
import hljs from 'highlight.js';
import { registerContainers } from './containers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');

/* ── OLDALSORREND ──
   A topbar és a lapváltás sorrendje. A `key` = MD-fájl neve kiterjesztés nélkül,
   a `dot` = a navigációs pötty színe, a `label` = topbar felirat. */
const PAGE_ORDER = [
  { key: 'map',       label: 'Interaktív térkép',   dot: '#7dd3fc', special: 'map' },
  { key: 'roadmap',   label: 'Roadmap',             dot: '#7c3aed' },
  { key: 'tools',     label: 'AI Eszközök',         dot: '#4ecb8d' },
  { key: 'prompting', label: 'Prompt Engineering',  dot: '#e8a84a' },
  { key: 'ollama',    label: 'Lokális LLM',         dot: '#4ec9c9' },
  { key: 'aiconfig',  label: 'AI Config fájlok',    dot: '#f472b6' },
  { key: 'security',  label: 'Biztonság & OWASP',   dot: '#e06c75' },
];

/* ─────────────────────────────────────────────
   Markdown motor felépítése (per-oldal új példány,
   hogy a section-collector ne szivárogjon át)
───────────────────────────────────────────── */
function makeMd(collector) {
  const md = new MarkdownIt({
    html: true,          // engedjük az inline HTML-t (pl. <em>, <strong> a szövegben)
    linkify: false,
    typographer: false,
    highlight(code, lang) {
      const language = (lang || '').split(/\s+/)[0]; // "python foo" -> "python"
      if (language && hljs.getLanguage(language)) {
        try {
          const out = hljs.highlight(code, { language, ignoreIllegals: true }).value;
          return `<pre data-lang="${language}"><code class="hljs">${out}</code></pre>`;
        } catch { /* fall through */ }
      }
      const escaped = md.utils.escapeHtml(code);
      const dl = language ? ` data-lang="${language}"` : '';
      return `<pre${dl}><code>${escaped}</code></pre>`;
    },
  });

  md.use(mdAttrs, { leftDelimiter: '{', rightDelimiter: '}' });
  registerContainers(md, mdContainer, collector);
  return md;
}

/* ─────────────────────────────────────────────
   Egy oldal (MD-fájl) renderelése
   Visszaad: { html, frontmatter, sidebar }
───────────────────────────────────────────── */
function renderPage(key) {
  const file = path.join(CONTENT, `${key}.md`);
  if (!fs.existsSync(file)) {
    return { html: `<div class="page" id="page-${key}"><p style="padding:40px">Hiányzó tartalom: content/${key}.md</p></div>`, frontmatter: {}, sidebar: [] };
  }

  const raw = fs.readFileSync(file, 'utf8');
  const { data: fm, content } = matter(raw);

  const collector = { sections: [] };
  const md = makeMd(collector);

  // ::: raw blokkok kiemelése render előtt, placeholderrel, majd visszaillesztés
  const rawBlocks = [];
  const guarded = content.replace(
    /^:::\s*raw[^\n]*\n([\s\S]*?)^:::\s*$/gm,
    (_, inner) => {
      const token = `<!--RAWBLOCK_${rawBlocks.length}-->`;
      rawBlocks.push(inner);
      return token;
    }
  );

  let body = md.render(guarded);
  body = body.replace(/<!--RAWBLOCK_(\d+)-->/g, (_, i) => rawBlocks[Number(i)]);

  // sidebar: elsődlegesen a frontmatter `sidebar` (raw-oldalakhoz),
  // különben a section-ökből gyűjtött nav-adat
  const sidebar = Array.isArray(fm.sidebar) && fm.sidebar.length
    ? fm.sidebar
    : groupSidebar(collector.sections, fm.sidebar_groups);

  const activeClass = key === PAGE_ORDER[1].key ? ' active' : '';
  const html = `<div id="page-${key}" class="page${activeClass}">\n${
    fm.hero ? renderHero(fm.hero, key) : ''
  }${body}\n${
    fm.footer ? renderFooter(fm.footer) : ''
  }</div><!-- /page-${key} -->`;

  return { html, frontmatter: fm, sidebar };
}

/* ── HERO blokk a frontmatterből ── */
function renderHero(hero, key) {
  const stats = (hero.stats || [])
    .map(s => `<div class="hero-stat"><span class="val">${s.val}</span><span class="lbl">${s.lbl}</span></div>`)
    .join('\n');
  return `<div class="page-hero" id="${key}-overview">
  ${hero.eyebrow ? `<div class="hero-eyebrow">${hero.eyebrow}</div>` : ''}
  <h1>${hero.title || ''}</h1>
  ${hero.lead ? `<p class="lead">${hero.lead}</p>` : ''}
  ${stats ? `<div class="hero-stats">\n${stats}\n</div>` : ''}
</div>\n`;
}

function renderFooter(footer) {
  const left = footer.left || '';
  const right = footer.right || '';
  return `<div class="page-footer"><span>${left}</span><span>${right}</span></div>\n`;
}

/* ── sidebar section-ök csoportokba rendezése ──
   A `group` attribútum értéke a csoport-címke. Ha nincs, a
   `sidebar_groups[0]` (frontmatter) vagy "Tartalom" a fallback. */
function groupSidebar(sections, groupOrder) {
  if (!sections.length) return [];
  const defaultLabel = (groupOrder && groupOrder[0]) || 'Tartalom';
  const map = new Map();
  for (const s of sections) {
    const label = s.group || defaultLabel;
    if (!map.has(label)) map.set(label, []);
    map.get(label).push({ href: s.href, text: s.text, num: s.num, sub: s.sub });
  }
  // ha van megadott sorrend, azt tartjuk
  const labels = groupOrder && groupOrder.length
    ? groupOrder.filter(l => map.has(l))
    : [...map.keys()];
  // a listában maradt, de sorrendben nem szereplő csoportok a végére
  for (const l of map.keys()) if (!labels.includes(l)) labels.push(l);
  return labels.map(label => ({ label, links: map.get(label) }));
}

/* ─────────────────────────────────────────────
   index.html sablon összeállítása
───────────────────────────────────────────── */
function buildIndex(pages) {
  const nav = PAGE_ORDER.filter(p => p.key !== 'map' ? true : true); // mind

  const topbarNav = PAGE_ORDER.map(p => {
    const isDefault = p.key === 'roadmap';
    return `    <button class="tnav-item${isDefault ? ' active' : ''}" data-page="${p.key}">
      <span class="tnav-dot" style="background:${p.dot}"></span>${p.label}
    </button>`;
  }).join('\n');

  // csak a nem-térkép oldalak HTML-je kerül a shellbe
  const pagesHtml = PAGE_ORDER
    .filter(p => p.key !== 'map')
    .map(p => pages[p.key].html)
    .join('\n\n');

  // sidebar-adat JSON-ként az app.js-nek
  const sidebarData = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    sidebarData[p.key] = pages[p.key].sidebar;
  }

  const mapPage = fs.readFileSync(path.join(__dirname, 'map-page.html'), 'utf8');

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Hub — Roadmap, Eszközök, Prompt Engineering</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/highlight.css" />
  <link rel="stylesheet" href="assets/style.css" />
</head>
<body>

<!-- ════════ TOP NAVIGATION ════════ -->
<nav class="topbar">
  <a class="topbar-brand" href="#" onclick="showPage('roadmap');return false;">
    <div class="brand-icon">⬡</div>
    <span class="brand-name">AI Hub<span class="brand-version">v2.0</span></span>
  </a>
  <div class="topbar-nav">
${topbarNav}
  </div>
  <div class="topbar-right">
    <span class="topbar-tag">2026 · Magyar</span>
  </div>
</nav>

${mapPage}

<!-- ════════ MAIN SHELL ════════ -->
<div class="shell" id="shell">
  <aside class="sidebar"><nav id="sidebar-nav"></nav></aside>
  <main class="content">

${pagesHtml}

  </main>
</div><!-- /shell -->

<!-- Generált adat: sidebar-navigáció (MD frontmatterből és section-ökből) -->
<script>
window.__SIDEBAR__ = ${JSON.stringify(sidebarData, null, 2)};
</script>
<script src="assets/roadmap-data.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────────
   Fő futás
───────────────────────────────────────────── */
function build() {
  const t0 = Date.now();
  const pages = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    pages[p.key] = renderPage(p.key);
  }
  const html = buildIndex(pages);

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'index.html'), html, 'utf8');

  // highlight.js CSS kiírása (egyszer, ha még nincs)
  const hlCss = path.join(PUBLIC, 'assets', 'highlight.css');
  if (!fs.existsSync(hlCss)) {
    // minimál, a style.css sötét témájához illő highlight
    fs.writeFileSync(hlCss, HLJS_CSS, 'utf8');
  }

  const ms = Date.now() - t0;
  const count = Object.keys(pages).length;
  console.log(`✓ Build kész — ${count} oldal, ${ms} ms → public/index.html`);
}

/* Sötét témához hangolt, minimál highlight.js paletta,
   ami a style.css --bg / --text változóival harmonizál. */
const HLJS_CSS = `/* highlight.js — AI Hub sötét téma */
.hljs { color: #d7dce5; background: transparent; }
.hljs-comment, .hljs-quote { color: #6b7280; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-type { color: #c4a0ff; }
.hljs-string, .hljs-attr, .hljs-template-tag { color: #6ee7b7; }
.hljs-number, .hljs-symbol, .hljs-bullet { color: #e8a84a; }
.hljs-function, .hljs-title, .hljs-section { color: #7dd3fc; }
.hljs-variable, .hljs-name, .hljs-tag { color: #e06c75; }
.hljs-built_in, .hljs-class .hljs-title { color: #4ec9c9; }
.hljs-meta { color: #9aa4b2; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
`;

/* ── watch mód ── */
if (process.argv.includes('--watch')) {
  build();
  console.log('👀 Figyelem a content/ mappát… (Ctrl+C a leállításhoz)');
  let timer = null;
  fs.watch(CONTENT, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { build(); } catch (e) { console.error('✗ Build hiba:', e.message); }
    }, 120);
  });
} else {
  build();
}
