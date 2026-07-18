/* ═══════════════════════════════════════════════
   engine/markdown.js — markdown-it motor felépítése
   Ez a fájl NEM tud semmit erről a konkrét site-ról (nincs benne
   PAGE_ORDER, LOCALES, stb.) — csak azt tudja, hogyan kell egy .md
   szöveget HTML-lé alakítani a projekt egyedi ::: blokkjaival együtt.
   Ha ezt a mappát (engine/) átviszed egy másik markdown-alapú
   projektbe, ez a fájl változtatás nélkül újrahasználható.
   ═══════════════════════════════════════════════ */

import MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';
import mdAttrs from 'markdown-it-attrs';
import hljs from 'highlight.js';
import { registerContainers } from './containers.js';

/**
 * Egy új markdown-it példányt épít fel, saját section-collectorral.
 * Minden oldalhoz új példány kell, hogy a collector ne szivárogjon át
 * a következő oldal renderelésébe.
 *
 * @param {{sections: Array}} collector - ide gyűlnek a nav="..." section-ök a sidebarhoz
 */
export function makeMd(collector) {
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

/* highlight.js sötét-téma CSS — a build ezt írja ki assets/highlight.css néven.
   Ide került, mert a szintaxis-kiemelés a markdown-motor (nem a site-specifikus
   build) felelőssége. */
export const HLJS_CSS = `/* highlight.js — sötét téma */
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
