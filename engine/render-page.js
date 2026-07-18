/* ═══════════════════════════════════════════════
   engine/render-page.js — egy .md fájl → HTML oldal renderelése.
   Content-agnosztikus: nem tud semmit a PAGE_ORDER-ről vagy a site
   sablonjáról, csak azt tudja, hogyan lesz egy markdown fájlból
   egy <div class="page">...</div> HTML blokk.

   Képek: a markdownban __IMG__/fajlnev.jpg formában hivatkozz a
   képekre (pl. ![alt](__IMG__/kv-01-mechanism.jpg)). Az __IMG__
   placeholdert ez a modul cseréli le az imageBaseUrl paraméterre,
   így a .md fájlok maguk nem tartalmaznak semmilyen konkrét,
   projekt-specifikus relatív útvonalat — ha átviszed őket egy másik
   projektbe, csak az imageBaseUrl paramétert kell máshogy megadni.
   ═══════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { makeMd } from './markdown.js';
import { groupSidebar } from './sidebar.js';

const IMAGE_TOKEN = '__IMG__';

/**
 * @param {string} key - a .md fájl neve kiterjesztés nélkül (pl. "mcp")
 * @param {string} contentDir - a content/<locale> mappa
 * @param {string} missingMsg - hiányzó fájl esetén megjelenő szöveg
 * @param {string} imageBaseUrl - a képek elérési útjának előtagja (pl. "assets/images" vagy "../assets/images")
 * @returns {{html: string, frontmatter: object, sidebar: Array, version: string|null}}
 */
export function renderPage(key, contentDir, missingMsg, imageBaseUrl = '') {
  const file = path.join(contentDir, `${key}.md`);
  if (!fs.existsSync(file)) {
    return { html: `<div class="page" id="page-${key}"><p style="padding:40px">${missingMsg}: ${key}.md</p></div>`, frontmatter: {}, sidebar: [], version: null };
  }

  const raw = fs.readFileSync(file, 'utf8');
  const version = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 10);
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
  body = body.split(IMAGE_TOKEN).join(imageBaseUrl);

  const sidebar = Array.isArray(fm.sidebar) && fm.sidebar.length
    ? fm.sidebar
    : groupSidebar(collector.sections, fm.sidebar_groups);

  const html = `<div id="page-${key}" class="page">\n${
    fm.hero ? renderHero(fm.hero, key) : ''
  }${body}\n${
    fm.footer ? renderFooter(fm.footer) : ''
  }</div><!-- /page-${key} -->`;

  return { html, frontmatter: fm, sidebar, version };
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
