/* ═══════════════════════════════════════════════
   site/build.js — AI Hub statikus build (többnyelvű)
   content/<locale>/*.md  ->  public/[<locale>/]index.html

   Ez a fájl a SITE-SPECIFIKUS rész: oldal-sorrend, nyelvek, HTML-sablon,
   navigáció. A tényleges markdown → HTML feldolgozás az ../engine/
   mappában él, ami content-agnosztikus és más projektbe is átvihető
   (lásd engine/index.js fejléce).

   Használat:
     npm run build              egyszeri build (minden locale)
     npm run build -- --watch   figyeli a content/ változásait
   ═══════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage, applyAutoLinks, buildSearchIndex, HLJS_CSS } from '../engine/index.js';
import { renderMapPage } from './map-page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC = path.join(ROOT, 'public');

/* ── GOOGLE ANALYTICS (GA4) ──
   Ide írd be a saját Measurement ID-det (a G- kezdetű kód, amit a GA4
   Admin → Data Streams → [a te web stream-ed] alatt találsz).
   A tracking csak akkor küld ténylegesen adatot, ha a látogató elfogadta
   a cookie-bannert (lásd Consent Mode a <head>-ben és a bannert lejjebb). */
const GA_MEASUREMENT_ID = 'G-HLRPY0MH9C';

/* ── OLDALSORREND ──
   A topbar és a lapváltás sorrendje. A `key` = MD-fájl neve kiterjesztés nélkül,
   a `dot` = a navigációs pötty színe. `label`/`labelEn` a topbar felirat nyelvenként.

   A sorrend ugyanazt a három klasztert követi, mint a kezdőoldali kapcsolati
   térkép (assets/js/content-graph-data.js) — Alapok & munkafolyamat → Modell
   & hardver → Tudás & kontextus —, hogy a dropdown és a térkép ugyanazt a
   logikát kövesse. */
const PAGE_ORDER = [
  { key: 'map',                   label: 'Interaktív térkép',       labelEn: 'Interactive Map',         dot: '#7dd3fc', special: 'map' },
  { key: 'glossary',              label: 'Fogalomtár',              labelEn: 'Glossary',                 dot: '#eab308' },

  /* ── Alapelmélet & architektúra ── */
  { key: 'architecture',          label: 'Egy modell anatómiája',   labelEn: 'Anatomy of a Model',       dot: '#818cf8' },
  { key: 'tokenization',          label: 'Tokenizáció',             labelEn: 'Tokenization',             dot: '#2dd4bf' },
  { key: 'reasoning',             label: 'Reasoning',               labelEn: 'Reasoning',                dot: '#fb923c' },
  { key: 'randomness',            label: 'Véletlenszerűség',        labelEn: 'Randomness',               dot: '#fb7185' },
  { key: 'base-vs-instruct',      label: 'Base vs. Instruct',       labelEn: 'Base vs. Instruct',        dot: '#f87171' },
  { key: 'dense-moe',             label: 'Dense vs MoE modellek',   labelEn: 'Dense vs Moe modells',      dot: '#6160a3' },
  { key: 'diffusion',             label: 'Diffúziós modellek',      labelEn: 'Diffusion Models',         dot: '#facc15' },
  { key: 'multimodal',            label: 'Multimodális modellek',   labelEn: 'Multimodal Models',        dot: '#c084fc' },
  { key: 'model-types',           label: 'Modelltípusok térképe',   labelEn: 'Model Types Map',           dot: '#a3e635' },
  { key: 'model-size',            label: 'Model paraméterek',       labelEn: 'Model parameters',         dot: '#98d016' },
  { key: 'ml-fundamentals',       label: 'Gépi tanulás alapjai',    labelEn: 'ML Fundamentals',           dot: '#0284c7' },
  { key: 'neural-network-basics', label: 'Neurális hálók alapjai',  labelEn: 'Neural Network Basics',     dot: '#16a34a' },

  /* ── Tanítás & finomhangolás ── */
  { key: 'model-training',        label: 'Modelltanítás',           labelEn: 'Model Training',           dot: '#d97706' },
  { key: 'fine-tuning',           label: 'Fine-tuning technikák',   labelEn: 'Fine-Tuning Techniques',  dot: '#0ea5e9' },
  { key: 'rlhf',                  label: 'RLHF',                    labelEn: 'RLHF',                     dot: '#2b2426' },
  { key: 'open-weight',           label: 'Nyílt súlyú modellek',    labelEn: 'Open Weight Models',        dot: '#38bdf8' },
  { key: 'huggingface',           label: 'Hugging Face',            labelEn: 'Hugging Face',             dot: '#fdba74' },
  { key: 'diy-model-training',    label: 'Saját, puritán modell',   labelEn: 'Building a Minimal Model', dot: '#84a98c' },
  { key: 'code-llm-architecture', label: 'Kódoló modellek',         labelEn: 'Code-Generation Models',   dot: '#5eaaa8' },
  { key: 'domain-specific-models', label: 'Speciális területre tanított modellek', labelEn: 'Domain-Specific Models', dot: '#9d4edd' },

  /* ── Infrastruktúra & optimalizálás ── */
  { key: 'hardware',              label: 'Hardware',                labelEn: 'Hardware',                 dot: '#f0edeb' },
  { key: 'quantization-quality',  label: 'Kvantálás és minőség',    labelEn: 'Quantization and quality', dot: '#00ff55' },
  { key: 'kv-cache',              label: 'KV-cache',                labelEn: 'KV-cache',                 dot: '#432604' },
  { key: 'latency',               label: 'Latency',                 labelEn: 'Latency',                  dot: '#523986' },
  { key: 'model-routing',         label: 'Model routing',           labelEn: 'Model routing',            dot: '#496b8f' },

  /* ── Megbízhatóság & biztonság ── */
  { key: 'ai-safety',             label: 'Alignment és red teaming', labelEn: 'Alignment and Red Teaming', dot: '#ef4444' },
  { key: 'security',              label: 'Biztonság & OWASP',       labelEn: 'Security & OWASP',         dot: '#e06c75' },
  { key: 'evaluation',            label: 'Evaluation & benchmarkok', labelEn: 'Evaluation & Benchmarks',  dot: '#84cc16' },

  /* ── Kontextus & szabályozás ── */
  { key: 'ai-history',            label: 'AI történelem',           labelEn: 'AI History',               dot: '#fcd34d' },
  { key: 'enterprise-ai',         label: 'Vállalati AI',            labelEn: 'Enterprise AI',            dot: '#dc2626' },
  { key: 'ai-copyright-law',      label: 'AI és szerzői jog',       labelEn: 'AI and Copyright Law',     dot: '#b45309' },
  { key: 'ai-regulation-liability', label: 'AI szabályozás és felelősség', labelEn: 'AI Regulation and Legal Liability', dot: '#6d28d9' },
  { key: 'conversation-data-training', label: 'Beszélgetés-adat és tanítás', labelEn: 'Conversation Data and Training', dot: '#2a9d8f' },

  /* ── Gyakorlat & eszközök ── */
  { key: 'tools',                 label: 'AI Eszközök',             labelEn: 'AI Tools',                 dot: '#4ecb8d' },
  { key: 'prompting',             label: 'Prompt Engineering',      labelEn: 'Prompt Engineering',       dot: '#e8a84a' },
  { key: 'aiconfig',              label: 'AI Config fájlok',        labelEn: 'AI Config Files',          dot: '#f472b6' },
  { key: 'vibecoding',            label: 'Vibe coding',             labelEn: 'Vibe Coding',              dot: '#60a5fa' },
  { key: 'agentic-coding',        label: 'Agentic kódolás',         labelEn: 'Agentic Coding',           dot: '#34d399' },
  { key: 'agent-architecture',    label: 'Agent architektúra',      labelEn: 'Agent Architecture',       dot: '#22d3ee' },
  { key: 'multi-agent-systems',   label: 'Multi-agent rendszerek',  labelEn: 'Multi-Agent Systems',      dot: '#6f9c8a' },
  { key: 'harness-engineering',   label: 'Harness engineering',     labelEn: 'Harness Engineering',      dot: '#0d9488' },
  { key: 'ai-code-review',        label: 'AI code review',          labelEn: 'AI Code Review',           dot: '#8b5cf6' },
  { key: 'ai-workflow-automation', label: 'Workflow automatizáció', labelEn: 'Workflow Automation',      dot: '#f43f5e' },
  { key: 'mcp',                   label: 'MCP',                     labelEn: 'MCP',                      dot: '#359a9c' },
  { key: 'llmops',                label: 'LLMOps',                  labelEn: 'LLMOps',                    dot: '#65a30d' },
  { key: 'ollama',                label: 'Lokális LLM',             labelEn: 'Local LLM',                dot: '#4ec9c9' },
  { key: 'cost-optimization',     label: 'Költség-optimalizálás',   labelEn: 'Cost Optimization',        dot: '#c77dff' },
  { key: 'fine-tuning-workflow',  label: 'Fine-tuning workflow',    labelEn: 'Fine-Tuning Workflow',     dot: '#588157' },
  { key: 'browser-agents',        label: 'Böngésző-ügynökök',       labelEn: 'AI Browser Agents',        dot: '#e76f51' },
  { key: 'prompt-versioning',     label: 'Prompt-verziózás',        labelEn: 'Prompt Versioning',        dot: '#457b9d' },
  { key: 'llm-observability',     label: 'Observability & monitoring', labelEn: 'Observability & Monitoring', dot: '#bc6c25' },

  /* ── Tudás & kontextus ── */
  { key: 'rag',                   label: 'RAG',                     labelEn: 'RAG',                      dot: '#1613d4' },
  { key: 'rag-architectures',     label: 'RAG architektúrák',       labelEn: 'RAG Architectures',         dot: '#0891b2' },
  { key: 'graphrag',              label: 'GraphRAG',                labelEn: 'GraphRAG',                  dot: '#c026d3' },
  { key: 'vectordb',              label: 'Vector adatbázisok',      labelEn: 'Vector databases',         dot: '#17cb11' },
  { key: 'embedding-models',      label: 'Embedding modellek',      labelEn: 'Embedding Models',          dot: '#f59e0b' },
  { key: 'memory',                label: 'Memory',                 labelEn: 'Memory',                   dot: '#e1c9cb' },
  { key: 'okf',                   label: 'Open Knowledge Format',   labelEn: 'Open Knowledge Format',    dot: '#a78bfa' },
  { key: 'knowledge-cutoff',      label: 'Tudás limit',             labelEn: 'Knowledge cutoff',         dot: '#896671' },
  { key: 'hallucination',         label: 'Hallucináció',            labelEn: 'Hallucination',            dot: '#a3ce40' },
];

/* ── NYELVEK ──
   A `dir` a content/<dir> almappa. Az `assetPrefix` a public/ gyökeréhez
   viszonyított relatív útvonal az assets/ eléréséhez (hu a gyökérben van,
   en egy almappában, ezért ../). A képek ehhez képest az assets/images/
   alá kerülnek — lásd imageBaseUrl lejjebb. */
const LOCALES = [
  {
    code: 'hu', htmlLang: 'hu', dir: 'hu', outDir: PUBLIC, assetPrefix: 'assets/',
    otherHref: 'en/index.html',
    ui: {
      title: 'AI Hub — Tudástérkép, Eszközök, Prompt Engineering',
      tag: '2026 · Magyar',
      searchLabel: 'Keresés',
      glossaryLabel: 'Fogalomtár',
      glossaryTitle: 'Fogalomtár — kifejezések gyors magyarázattal',
      searchPlaceholder: 'Keress a teljes tartalomban…',
      searchHint: 'Kezdj el gépelni a kereséshez…',
      searchNoResults: 'Nincs találat.',
      themeTitle: 'Világos / sötét mód',
      searchTitle: 'Keresés (Ctrl+K)',
      pagesLabel: 'Oldalak',
      versionPopupTitleIntro: 'Új funkció: tartalom-frissítés jelzés',
      versionPopupBodyIntro: 'Ha bármilyen tartalom változott az előző látogatásod óta, felugró ablakban megjelenik, mely tartalmat érintette a változás.',
      versionPopupTitleUpdate: 'Frissült tartalom',
      versionPopupBodyUpdate: 'Az előző látogatásod óta az alábbi anyagok változtak:',
      versionPopupNewTag: 'új',
      versionPopupUpdatedTag: 'frissült',
      versionPopupOpenLabel: 'Megnyitás',
      versionPopupGotIt: 'Rendben',
      backToTopLabel: 'Vissza a tetejére',
      mapCardTitle: 'AI Engineering Tudástár',
      mapCardIntro: 'Böngéssz a témák közt klaszterek szerint — kattints egy kártyára a rövid leíráshoz, onnan a teljes cikkhez.',
      termPreviewOpenLabel: 'Teljes cikk megnyitása →',
      cookieBannerTitle: 'Sütik és látogatottság-mérés',
      cookieBannerBody: 'Az oldal Google Analytics-et használ, hogy lássuk, mely tartalmak hasznosak — ehhez a böngésződben sütiket helyezne el. Ez csak akkor aktiválódik, ha elfogadod.',
      cookieBannerAccept: 'Elfogadom',
      cookieBannerDecline: 'Elutasítom',
    },
  },
  {
    code: 'en', htmlLang: 'en', dir: 'en', outDir: path.join(PUBLIC, 'en'), assetPrefix: '../assets/',
    otherHref: '../index.html',
    ui: {
      title: 'AI Hub — Knowledge Map, Tools, Prompt Engineering',
      tag: '2026 · English',
      searchLabel: 'Search',
      glossaryLabel: 'Glossary',
      glossaryTitle: 'Glossary — quick term explanations',
      searchPlaceholder: 'Search all content…',
      searchHint: 'Start typing to search…',
      searchNoResults: 'No results.',
      themeTitle: 'Light / dark mode',
      searchTitle: 'Search (Ctrl+K)',
      pagesLabel: 'Pages',
      versionPopupTitleIntro: 'New feature: content update alerts',
      versionPopupBodyIntro: 'If any content has changed since your last visit, a pop-up window will appear showing which content has been updated.',
      versionPopupTitleUpdate: 'Updated content',
      versionPopupBodyUpdate: 'The following topics have changed since your last visit:',
      versionPopupNewTag: 'new',
      versionPopupUpdatedTag: 'updated',
      versionPopupOpenLabel: 'Open',
      versionPopupGotIt: 'Got it',
      backToTopLabel: 'Back to top',
      mapCardTitle: 'AI Engineering Knowledge Hub',
      mapCardIntro: 'Browse topics by cluster — click a card for a short description, then open the full article.',
      termPreviewOpenLabel: 'Open full article →',
      cookieBannerTitle: 'Cookies & analytics',
      cookieBannerBody: 'This site uses Google Analytics to see which content is useful — this would place cookies in your browser. It only activates if you accept.',
      cookieBannerAccept: 'Accept',
      cookieBannerDecline: 'Decline',
    },
  },
];

/* ─────────────────────────────────────────────
   index.html sablon összeállítása egy adott locale-hoz
───────────────────────────────────────────── */
function buildHtml(pages, locale) {
  // az oldalváltó dropdown elemei (a sidebar tetején jelenik meg, nem a topbarban)
  const defaultPage = PAGE_ORDER.find(p => p.key === 'map');
  const pageSwitcherItems = PAGE_ORDER.filter(p => !p.hideFromMenu).map(p => {
    const isDefault = p.key === 'map';
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

  // tartalom-verziók a "mi frissült" popuphoz — hash minden .md fájl nyers tartalmából
  const contentVersions = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    const label = locale.code === 'hu' ? p.label : p.labelEn;
    contentVersions[p.key] = { version: pages[p.key].version, title: label };
  }

  const ui = locale.ui;
  const mapPage = renderMapPage(ui);

  const pageList = PAGE_ORDER
    .filter(p => p.key !== 'map')
    .map(p => ({ key: p.key, title: locale.code === 'hu' ? p.label : p.labelEn }));
  const searchIndex = buildSearchIndex(pages, pageList);

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

  <!-- ════════ GOOGLE ANALYTICS (GA4) — Consent Mode v2 ════════
       Alapból MINDEN tárolás 'denied' — a gtag.js csak cookie-mentes,
       modellezett pingeket küld, tényleges méréshez a látogatónak el
       kell fogadnia a bannert (lásd assets/js/app.js initCookieConsent). -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  </script>
</head>
<body>

<!-- ════════ COOKIE / ANALYTICS CONSENT BANNER ════════ -->
<div class="cookie-banner" id="cookie-banner">
  <div class="cookie-banner-text">
    <strong>${ui.cookieBannerTitle}</strong>
    <p>${ui.cookieBannerBody}</p>
  </div>
  <div class="cookie-banner-actions">
    <button class="map-btn" id="cookie-decline">${ui.cookieBannerDecline}</button>
    <button class="map-btn cookie-accept" id="cookie-accept">${ui.cookieBannerAccept}</button>
  </div>
</div>

<!-- ════════ TOP NAVIGATION ════════ -->
<nav class="topbar">
  <a class="topbar-brand" href="#" onclick="showPage('map');return false;">
    <div class="brand-icon">⬡</div>
    <span class="brand-name">AI Hub<span class="brand-version">v2.0</span></span>
  </a>
  <div class="topbar-spacer"></div>
  <div class="topbar-right">
    <a class="glossary-link" href="#" onclick="showPage('glossary');return false;" title="${ui.glossaryTitle}">${ui.glossaryLabel}</a>
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

<!-- ════════ TARTALOM-FRISSÍTÉS POPUP ════════ -->
<div class="version-popup-overlay" id="version-popup-overlay" onclick="if(event.target===this) closeVersionPopup()">
  <div class="version-popup">
    <button class="popup-close" id="version-popup-close" onclick="closeVersionPopup()" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    <div class="version-popup-icon">🔔</div>
    <div class="version-popup-title" id="version-popup-title"></div>
    <div class="version-popup-body" id="version-popup-body"></div>
    <button class="map-btn version-popup-gotit" id="version-popup-gotit" onclick="closeVersionPopup()">${ui.versionPopupGotIt}</button>
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
      <div class="ps-backdrop" id="ps-backdrop" onclick="closePageSwitcher()"></div>
      <div class="page-switcher-panel" id="page-switcher-panel">
        <div class="ps-panel-header">
          <span>${ui.pagesLabel}</span>
          <button class="ps-close" onclick="closePageSwitcher()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
${pageSwitcherItems}
      </div>
    </div>
    <nav id="sidebar-nav"></nav>
  </aside>
  <main class="content">

${pagesHtml}

  </main>
</div><!-- /shell -->

<button class="back-to-top" id="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="${ui.backToTopLabel}" title="${ui.backToTopLabel}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
</button>

<!-- Generált adat: sidebar-navigáció, keresés, i18n UI-szövegek -->
<script>
window.__LOCALE__ = ${JSON.stringify(locale.code)};
window.__SIDEBAR__ = ${JSON.stringify(sidebarData, null, 2)};
window.__SEARCH__ = ${JSON.stringify(searchIndex)};
window.__I18N__ = ${JSON.stringify(ui)};
window.__CONTENT_VERSIONS__ = ${JSON.stringify(contentVersions)};
</script>
<script src="${AP}content-graph-data.js"></script>
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
  // a képek elérési útja ehhez a locale-hoz — ez cserélődik be a .md-kben
  // szereplő __IMG__ placeholder helyére (lásd engine/render-page.js)
  const imageBaseUrl = locale.assetPrefix + 'images';

  const pages = {};
  for (const p of PAGE_ORDER) {
    if (p.key === 'map') continue;
    pages[p.key] = renderPage(p.key, contentDir, missingMsg, imageBaseUrl);
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
  const publicAssets = path.join(PUBLIC, 'assets');
  const publicImages = path.join(publicAssets, 'images');
  fs.mkdirSync(publicImages, { recursive: true });

  // CSS + JS assetek bemásolása lapos szerkezetben (assets/style.css stb.),
  // a képek pedig az assets/images/ alá — így a public/ TELJESEN generált,
  // bármikor törölhető és újraépíthető.
  for (const sub of ['css', 'js']) {
    const dir = path.join(ASSETS, sub);
    for (const file of fs.readdirSync(dir)) {
      fs.copyFileSync(path.join(dir, file), path.join(publicAssets, file));
    }
  }
  const imagesDir = path.join(ASSETS, 'images');
  for (const file of fs.readdirSync(imagesDir)) {
    fs.copyFileSync(path.join(imagesDir, file), path.join(publicImages, file));
  }

  // highlight.js CSS mindig újragenerálva (a forrás az engine/markdown.js-ben él)
  fs.writeFileSync(path.join(publicAssets, 'highlight.css'), HLJS_CSS, 'utf8');

  const results = LOCALES.map(locale => `${locale.code}:${buildLocale(locale)}`);
  const ms = Date.now() - t0;
  console.log(`✓ Build kész — ${results.join(', ')} oldal, ${ms} ms`);
}

if (process.argv.includes('--watch')) {
  build();
  console.log('👀 Figyelem a content/ és az assets/ mappát… (Ctrl+C a leállításhoz)');
  let timer = null;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { build(); } catch (e) { console.error('✗ Build hiba:', e.message); }
    }, 120);
  };
  fs.watch(CONTENT, { recursive: true }, rebuild);
  fs.watch(ASSETS, { recursive: true }, rebuild);
} else {
  build();
}
