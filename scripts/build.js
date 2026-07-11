/* ═══════════════════════════════════════════════
   build.js — AI Hub statikus build (többnyelvű)
   content/<locale>/*.md  ->  public/[<locale>/]index.html

   Használat:
     npm run build              egyszeri build (minden locale)
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
   a `dot` = a navigációs pötty színe. `label`/`labelEn` a topbar felirat nyelvenként. */
const PAGE_ORDER = [
  { key: 'map',       label: 'Interaktív térkép',   labelEn: 'Interactive Map', dot: '#7dd3fc', special: 'map' },
  { key: 'roadmap',   label: 'Roadmap',             labelEn: 'Roadmap',         dot: '#7c3aed' },
  { key: 'tools',     label: 'AI Eszközök',         labelEn: 'AI Tools',        dot: '#4ecb8d' },
  { key: 'prompting', label: 'Prompt Engineering',  labelEn: 'Prompt Engineering', dot: '#e8a84a' },
  { key: 'ollama',    label: 'Lokális LLM',         labelEn: 'Local LLM',       dot: '#4ec9c9' },
  { key: 'aiconfig',  label: 'AI Config fájlok',    labelEn: 'AI Config Files', dot: '#f472b6' },
  { key: 'security',  label: 'Biztonság & OWASP',   labelEn: 'Security & OWASP', dot: '#e06c75' },
  { key: 'memory',    label: 'Memory',              labelEn: 'Memory',          dot: '#e1c9cb' },
  { key: 'vectordb',  label: 'Vector adatbázisok',  labelEn: 'Vector databases', dot: '#17cb11' },
  { key: 'dense-moe',  label: 'Dense vs MoE modellek',  labelEn: 'Dense vs Moe modells', dot: '#6160a3' },
];

/* ── NYELVEK ──
   A `dir` a content/<dir> almappa. Az `assetPrefix` a public/ gyökeréhez
   viszonyított relatív útvonal az assets/ eléréséhez (hu a gyökérben van,
   en egy almappában, ezért ../). */
const LOCALES = [
  {
    code: 'hu', htmlLang: 'hu', dir: 'hu', outDir: PUBLIC, assetPrefix: 'assets/',
    otherHref: 'en/index.html',
    ui: {
      title: 'AI Hub — Roadmap, Eszközök, Prompt Engineering',
      tag: '2026 · Magyar',
      searchLabel: 'Keresés',
      searchPlaceholder: 'Keress a teljes tartalomban…',
      searchHint: 'Kezdj el gépelni a kereséshez…',
      searchNoResults: 'Nincs találat.',
      themeTitle: 'Világos / sötét mód',
      searchTitle: 'Keresés (Ctrl+K)',
    },
  },
  {
    code: 'en', htmlLang: 'en', dir: 'en', outDir: path.join(PUBLIC, 'en'), assetPrefix: '../assets/',
    otherHref: '../index.html',
    ui: {
      title: 'AI Hub — Roadmap, Tools, Prompt Engineering',
      tag: '2026 · English',
      searchLabel: 'Search',
      searchPlaceholder: 'Search all content…',
      searchHint: 'Start typing to search…',
      searchNoResults: 'No results.',
      themeTitle: 'Light / dark mode',
      searchTitle: 'Search (Ctrl+K)',
    },
  },
];

/* ─────────────────────────────────────────────
   Markdown motor felépítése (per-oldal új példány,
   hogy a section-collector ne szivárogjon át)
───────────────────────────────────────────── */
function makeMd(collector) {
  const md = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: false,
    highlight(code, lang) {
      const language = (lang || '').split(/\s+/)[0];
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
   Egy oldal (MD-fájl) renderelése egy adott locale content-mappájából
───────────────────────────────────────────── */
function renderPage(key, contentDir, missingMsg) {
  const file = path.join(contentDir, `${key}.md`);
  if (!fs.existsSync(file)) {
    return { html: `<div class="page" id="page-${key}"><p style="padding:40px">${missingMsg}: ${key}.md</p></div>`, frontmatter: {}, sidebar: [] };
  }

  const raw = fs.readFileSync(file, 'utf8');
  const { data: fm, content } = matter(raw);

  const collector = { sections: [] };
  const md = makeMd(collector);

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

function groupSidebar(sections, groupOrder) {
  if (!sections.length) return [];
  const defaultLabel = (groupOrder && groupOrder[0]) || 'Tartalom';
  const map = new Map();
  for (const s of sections) {
    const label = s.group || defaultLabel;
    if (!map.has(label)) map.set(label, []);
    map.get(label).push({ href: s.href, text: s.text, num: s.num, sub: s.sub });
  }
  const labels = groupOrder && groupOrder.length
    ? groupOrder.filter(l => map.has(l))
    : [...map.keys()];
  for (const l of map.keys()) if (!labels.includes(l)) labels.push(l);
  return labels.map(label => ({ label, links: map.get(label) }));
}

/* ─────────────────────────────────────────────
   Automatikus linkelés — a content/<locale>/glossary.json alapján
───────────────────────────────────────────── */
const WORD_CHAR = "A-Za-zÀ-ÖØ-öø-ÿŐőŰű0-9_";

function loadGlossary(contentDir) {
  const file = path.join(contentDir, 'glossary.json');
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const terms = [];
  for (const [term, def] of Object.entries(raw)) {
    if (term === '_comment') continue;
    const variants = [term, ...(def.variants || [])];
    terms.push({ term, page: def.page, id: def.id, variants });
  }
  terms.sort((a, b) => b.term.length - a.term.length);
  return terms;
}

function tokenizeHtml(html) {
  return html.match(/<[^>]+>|[^<]+/g) || [];
}

function tagName(token) {
  const m = token.match(/^<\/?([a-zA-Z0-9-]+)/);
  return m ? m[1].toLowerCase() : null;
}

const SKIP_TAGS = new Set(['pre', 'code', 'a', 'h2', 'h3']);

function tryLinkInSection(sectionHtml, entry, currentSectionId) {
  if (entry.page && entry.id === currentSectionId) return { html: sectionHtml, linked: false };

  const tokens = tokenizeHtml(sectionHtml);
  const skipStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok[0] === '<') {
      const name = tagName(tok);
      const isClose = tok.startsWith('</');
      const isSelfClose = /\/>$/.test(tok);
      if (name && SKIP_TAGS.has(name) && !isSelfClose) {
        if (isClose) { if (skipStack[skipStack.length - 1] === name) skipStack.pop(); }
        else skipStack.push(name);
      }
      continue;
    }
    if (skipStack.length > 0) continue;

    for (const variant of entry.variants) {
      const esc = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?<![${WORD_CHAR}])(${esc})(?![${WORD_CHAR}])`, 'i');
      const m = tok.match(re);
      if (m) {
        const before = tok.slice(0, m.index);
        const matched = m[1];
        const after = tok.slice(m.index + matched.length);
        const linkHtml = `<a href="#${entry.id}" onclick="goToSection('${entry.page}','${entry.id}');return false;" class="auto-link">${matched}</a>`;
        tokens[i] = before + linkHtml + after;
        return { html: tokens.join(''), linked: true };
      }
    }
  }
  return { html: sectionHtml, linked: false };
}

function applyAutoLinks(pages, contentDir) {
  const glossary = loadGlossary(contentDir);
  if (!glossary.length) return;
  const linked = new Set();

  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    let html = pages[p.key].html;

    let result = '';
    let lastIndex = 0;
    const sectionRe = /<section\b[^>]*>[\s\S]*?<\/section>/g;
    let m;
    while ((m = sectionRe.exec(html))) {
      result += html.slice(lastIndex, m.index);
      let sectionHtml = m[0];
      const idMatch = sectionHtml.match(/id="([^"]*)"/);
      const sectionId = idMatch ? idMatch[1] : null;

      for (const entry of glossary) {
        if (linked.has(entry.term)) continue;
        const { html: newHtml, linked: didLink } = tryLinkInSection(sectionHtml, entry, sectionId);
        if (didLink) {
          sectionHtml = newHtml;
          linked.add(entry.term);
        }
      }
      result += sectionHtml;
      lastIndex = sectionRe.lastIndex;
    }
    result += html.slice(lastIndex);
    pages[p.key].html = result;
  }
}

/* ─────────────────────────────────────────────
   Keresési index
───────────────────────────────────────────── */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function buildSearchIndex(pages) {
  const index = [];
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    const html = pages[p.key].html;
    const pageTitle = pages[p.key].frontmatter.title || p.label;

    const sectionRe = /<section\b([^>]*)>([\s\S]*?)<\/section>/g;
    let m;
    while ((m = sectionRe.exec(html))) {
      const attrs = m[1];
      const inner = m[2];
      const idMatch = attrs.match(/id="([^"]*)"/);
      if (!idMatch) continue;
      const id = idMatch[1];

      let heading = null;
      const shMatch = inner.match(/<div class="section-heading">([\s\S]*?)<\/div>/);
      const h2Match = inner.match(/<h2>([\s\S]*?)<\/h2>/);
      if (shMatch) heading = stripTags(shMatch[1]);
      else if (h2Match) heading = stripTags(h2Match[1]);
      else heading = pageTitle;

      const text = stripTags(inner).slice(0, 1500);
      if (!text) continue;

      index.push({ page: p.key, pageTitle, id, heading, text });
    }
  }
  return index;
}

/* ─────────────────────────────────────────────
   index.html sablon összeállítása egy adott locale-hoz
───────────────────────────────────────────── */
function buildHtml(pages, locale) {
  // az oldalváltó dropdown elemei (a sidebar tetején jelenik meg, nem a topbarban)
  const defaultPage = PAGE_ORDER.find(p => p.key === 'roadmap');
  const pageSwitcherItems = PAGE_ORDER.map(p => {
    const isDefault = p.key === 'roadmap';
    const label = locale.code === 'hu' ? p.label : p.labelEn;
    return `      <button class="ps-item${isDefault ? ' active' : ''}" data-page="${p.key}" data-label="${label}" data-dot="${p.dot}">
        <span class="ps-dot" style="background:${p.dot}"></span>${label}
      </button>`;
  }).join('\n');
  const defaultLabel = locale.code === 'hu' ? defaultPage.label : defaultPage.labelEn;

  const pagesHtml = PAGE_ORDER
    .filter(p => p.key !== 'map')
    .map(p => pages[p.key].html)
    .join('\n\n');

  const sidebarData = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    sidebarData[p.key] = pages[p.key].sidebar;
  }

  const mapPage = fs.readFileSync(path.join(__dirname, 'map-page.html'), 'utf8');
  const searchIndex = buildSearchIndex(pages);
  const ui = locale.ui;
  const AP = locale.assetPrefix;
  const otherLangLabel = locale.code === 'hu' ? 'EN' : 'HU';

  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ui.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${AP}highlight.css" />
  <link rel="stylesheet" href="${AP}style.css" />
  <link rel="stylesheet" href="${AP}theme-light.css" />
  <link rel="stylesheet" href="${AP}search.css" />
  <script>
    (function () {
      try {
        var saved = localStorage.getItem('aihub-theme');
        var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  </script>
</head>
<body>

<!-- ════════ TOP NAVIGATION ════════ -->
<nav class="topbar">
  <a class="topbar-brand" href="#" onclick="showPage('roadmap');return false;">
    <div class="brand-icon">⬡</div>
    <span class="brand-name">AI Hub<span class="brand-version">v2.0</span></span>
  </a>
  <div class="topbar-spacer"></div>
  <div class="topbar-right">
    <a class="lang-switch" href="${locale.otherHref}" onclick="event.preventDefault(); location.href='${locale.otherHref}'+location.hash;" title="${otherLangLabel === 'EN' ? 'Switch to English' : 'Váltás magyarra'}">${otherLangLabel}</a>
    <button class="search-trigger" onclick="openSearch()" aria-label="${ui.searchLabel}" title="${ui.searchTitle}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <span class="search-trigger-label">${ui.searchLabel}</span>
      <span class="search-trigger-kbd">Ctrl K</span>
    </button>
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="${ui.themeTitle}" title="${ui.themeTitle}">
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    </button>
    <span class="topbar-tag">${ui.tag}</span>
  </div>
</nav>

<!-- ════════ KERESÉS MODAL ════════ -->
<div class="search-overlay" id="search-overlay" onclick="if(event.target===this) closeSearch()">
  <div class="search-modal">
    <div class="search-input-row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="search-input" placeholder="${ui.searchPlaceholder}" autocomplete="off" />
      <kbd>Esc</kbd>
    </div>
    <div class="search-results" id="search-results"></div>
  </div>
</div>

${mapPage}

<!-- ════════ MAIN SHELL ════════ -->
<div class="shell" id="shell">
  <aside class="sidebar">
    <div class="page-switcher" id="page-switcher">
      <button class="ps-trigger" id="ps-trigger" onclick="togglePageSwitcher()" aria-haspopup="true" aria-expanded="false">
        <span class="ps-dot" id="ps-current-dot" style="background:${defaultPage.dot}"></span>
        <span class="ps-current-label" id="ps-current-label">${defaultLabel}</span>
        <svg class="ps-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <div class="page-switcher-panel" id="page-switcher-panel">
${pageSwitcherItems}
      </div>
    </div>
    <nav id="sidebar-nav"></nav>
  </aside>
  <main class="content">

${pagesHtml}

  </main>
</div><!-- /shell -->

<!-- Generált adat: sidebar-navigáció, keresés, i18n UI-szövegek -->
<script>
window.__SIDEBAR__ = ${JSON.stringify(sidebarData, null, 2)};
window.__SEARCH__ = ${JSON.stringify(searchIndex)};
window.__I18N__ = ${JSON.stringify(ui)};
</script>
<script src="${AP}roadmap-data.js"></script>
<script src="${AP}app.js"></script>
<script src="${AP}search.js"></script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────────
   Fő futás — minden locale-t lebuildel
───────────────────────────────────────────── */
function buildLocale(locale) {
  const contentDir = path.join(CONTENT, locale.dir);
  const missingMsg = locale.code === 'hu' ? 'Hiányzó tartalom' : 'Missing content';
  const pages = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    pages[p.key] = renderPage(p.key, contentDir, missingMsg);
  }
  applyAutoLinks(pages, contentDir);
  const html = buildHtml(pages, locale);

  fs.mkdirSync(locale.outDir, { recursive: true });
  fs.writeFileSync(path.join(locale.outDir, 'index.html'), html, 'utf8');
  return Object.keys(pages).length;
}

function build() {
  const t0 = Date.now();

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true });

  // közös, kézzel karbantartott assetek bemásolása a forrásból —
  // így a public/ TELJESEN generált, bármikor törölhető és újraépíthető
  const ASSETS_SRC = path.join(ROOT, 'assets-src');
  for (const file of fs.readdirSync(ASSETS_SRC)) {
    fs.copyFileSync(path.join(ASSETS_SRC, file), path.join(PUBLIC, 'assets', file));
  }

  // highlight.js CSS mindig újragenerálva (a forrás a build.js-ben él)
  fs.writeFileSync(path.join(PUBLIC, 'assets', 'highlight.css'), HLJS_CSS, 'utf8');

  const results = LOCALES.map(locale => `${locale.code}:${buildLocale(locale)}`);
  const ms = Date.now() - t0;
  console.log(`✓ Build kész — ${results.join(', ')} oldal, ${ms} ms`);
}

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
