/* ═══════════════════════════════════════════════
   engine/autolink.js — automatikus linkelés egy content/<locale>/glossary.json
   fájl alapján. Content-agnosztikus: bármelyik projekt használhatja, ha van
   glossary.json-je a content mappájában ugyanezzel a formátummal:
     { "Kifejezés": { "page": "oldal-kulcs", "id": "section-id", "variants": [...] } }
   ═══════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';

const WORD_CHAR = "A-Za-zÀ-ÖØ-öø-ÿŐőŰű0-9_";
const SKIP_TAGS = new Set(['pre', 'code', 'a', 'h2', 'h3']);

export function loadGlossary(contentDir) {
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
        const linkHtml = `<a href="#${entry.id}" data-goto-page="${entry.page}" data-goto-id="${entry.id}" class="auto-link">${matched}</a>`;
        tokens[i] = before + linkHtml + after;
        return { html: tokens.join(''), linked: true };
      }
    }
  }
  return { html: sectionHtml, linked: false };
}

/**
 * Bejárja az összes oldal HTML-jét, és a glossary.json alapján beszúr
 * automatikus kereszthivatkozásokat. Minden glossary-kifejezés a TELJES
 * site-on csak egyszer kap automatikus linket (nem oldalanként), hogy ne
 * legyen túllinkelve a tartalom.
 *
 * @param {Object} pages - { [pageKey]: { html, frontmatter, sidebar, version } }
 * @param {string} contentDir - a content/<locale> mappa (innen jön a glossary.json)
 */
export function applyAutoLinks(pages, contentDir) {
  const glossary = loadGlossary(contentDir);
  if (!glossary.length) return;
  const linked = new Set();

  for (const key of Object.keys(pages)) {
    let html = pages[key].html;

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
    pages[key].html = result;
  }
}
