/* ═══════════════════════════════════════════════
   engine/search-index.js — kereshető index építése a renderelt
   oldalak HTML-jéből. Content-agnosztikus: a hívó adja meg, mely
   oldalakat (és milyen címmel) kell indexelni.
   ═══════════════════════════════════════════════ */

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

/**
 * @param {Object} pages - { [pageKey]: { html, frontmatter, ... } }
 * @param {Array<{key: string, title: string}>} pageList - mely oldalakat indexeljük, milyen (locale-specifikus) címmel
 */
export function buildSearchIndex(pages, pageList) {
  const index = [];
  for (const p of pageList) {
    const page = pages[p.key];
    if (!page) continue;
    const html = page.html;
    const pageTitle = page.frontmatter.title || p.title;

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
