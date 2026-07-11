/* ═══════════════════════════════════════════════
   containers.js — a ::: blokkok definíciói
   Minden blokk a meglévő CSS-osztályokra képződik le,
   így a generált HTML stílus-kompatibilis a style.css-szel.
   ═══════════════════════════════════════════════ */

/**
 * Egy ::: fenced-div fejlécének feldolgozása.
 * Formátum:  ::: name kulcs=érték kulcs="idézett érték" flag
 * Visszaad:  { name, attrs: { kulcs: érték, ... }, flags: [flag, ...] }
 */
export function parseHeader(info) {
  const trimmed = info.trim();
  const tokens = trimmed.match(/(?:[^\s"]+="[^"]*")|(?:[^\s"]+='[^']*')|\S+/g) || [];
  const name = tokens.shift() || '';
  const attrs = {};
  const flags = [];
  for (const tok of tokens) {
    const eq = tok.indexOf('=');
    if (eq === -1) {
      flags.push(tok);
    } else {
      const key = tok.slice(0, eq);
      let val = tok.slice(eq + 1);
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      attrs[key] = val;
    }
  }
  return { name, attrs, flags };
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Regisztrálja az összes container-típust a markdown-it példányra.
 * A `collector` egy objektum, amibe a section-öket gyűjtjük a sidebarhoz.
 */
export function registerContainers(md, mdContainer, collector) {

  // ── ::: section id=... num=... nav="..." class=... ──
  // A fő tartalmi blokk. Ha van `nav`, bekerül a sidebar-adatba.
  md.use(mdContainer, 'section', {
    validate: (params) => parseHeader(params).name === 'section',
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const { attrs, flags } = parseHeader(t.info);
        const id = attrs.id || '';
        // notopic flag: a "topic" osztály nélküli sima section (ollama-szintek)
        const noTopic = flags.includes('notopic');
        const cls = [noTopic ? null : 'topic', attrs.class].filter(Boolean).join(' ');
        const style = attrs.style ? ` style="${esc(attrs.style)}"` : '';

        // sidebar-adat gyűjtése
        if (attrs.nav) {
          collector.sections.push({
            href: `#${id}`,
            text: attrs.nav,
            num: attrs.num || null,
            sub: attrs.sub === 'true' || false,
            group: attrs.group || null,
          });
        }

        let out = `<section${cls ? ` class="${cls}"` : ''}${id ? ` id="${id}"` : ''}${style}>\n`;
        if (attrs.num) {
          out += `<span class="topic-marker">&lt;${esc(attrs.num)}&gt; TOPIC</span>\n`;
        }
        // heading="..." -> <div class="section-heading"> (ollama-szintek fejléce)
        if (attrs.heading) {
          out += `<div class="section-heading">${esc(attrs.heading)}</div>\n`;
        }
        return out;
      }
      return '</section>\n';
    },
  });

  // ── ::: callout [danger|warning|success] label="..." ──
  md.use(mdContainer, 'callout', {
    validate: (params) => parseHeader(params).name === 'callout',
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const { attrs, flags } = parseHeader(t.info);
        const variant = flags.find(f => ['danger', 'warning', 'success'].includes(f)) || '';
        const cls = ['callout', variant].filter(Boolean).join(' ');
        const label = attrs.label
          ? `<div class="callout-label">${esc(attrs.label)}</div>\n`
          : '';
        return `<div class="${cls}">\n${label}`;
      }
      return '</div>\n';
    },
  });

  // ── ::: stack-grid ... (belül ::: card-ok) ──
  md.use(mdContainer, 'stack-grid', {
    validate: (params) => parseHeader(params).name === 'stack-grid',
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const { attrs } = parseHeader(t.info);
        const style = attrs.style ? ` style="${esc(attrs.style)}"` : '';
        return `<div class="stack-grid"${style}>\n`;
      }
      return '</div>\n';
    },
  });

  // ── ::: card label="..." color="#..." ──
  md.use(mdContainer, 'card', {
    validate: (params) => parseHeader(params).name === 'card',
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const { attrs } = parseHeader(t.info);
        const color = attrs.color ? ` style="color:${esc(attrs.color)}"` : '';
        const label = attrs.label
          ? `<div class="sc-label"${color}>${esc(attrs.label)}</div>\n`
          : '';
        return `<div class="stack-card">\n${label}<div class="sc-items">\n`;
      }
      return '</div>\n</div>\n';
    },
  });

  // ── ::: compare ... (belül ::: bad és ::: good) ──
  md.use(mdContainer, 'compare', {
    validate: (params) => parseHeader(params).name === 'compare',
    render(tokens, idx) {
      return tokens[idx].nesting === 1 ? `<div class="compare">\n` : `</div>\n`;
    },
  });

  // ── ::: bad label="× Naiv" ──  /  ::: good label="✓ Strukturált" ──
  for (const kind of ['bad', 'good']) {
    md.use(mdContainer, kind, {
      validate: (params) => parseHeader(params).name === kind,
      render(tokens, idx) {
        const t = tokens[idx];
        if (t.nesting === 1) {
          const { attrs } = parseHeader(t.info);
          const dflt = kind === 'bad' ? '× Rossz' : '✓ Jó';
          const label = `<div class="label">${esc(attrs.label || dflt)}</div>\n`;
          return `<div class="compare-card ${kind}">\n${label}`;
        }
        return `</div>\n`;
      },
    });
  }

  // ── ::: tech id=... num=03.01 name="Zero-shot" ──
  md.use(mdContainer, 'tech', {
    validate: (params) => parseHeader(params).name === 'tech',
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const { attrs } = parseHeader(t.info);
        const id = attrs.id ? ` id="${attrs.id}"` : '';
        const num = attrs.num
          ? `<span class="tech-num">${esc(attrs.num)}</span>`
          : '';
        const name = attrs.name
          ? `<h3 class="tech-name">${esc(attrs.name)}</h3>`
          : '';
        // sidebar (technikák al-listája)
        if (attrs.nav && attrs.id) {
          collector.sections.push({
            href: `#${attrs.id}`,
            text: attrs.nav,
            sub: true,
            group: attrs.group || null,
          });
        }
        return `<div class="tech"${id}>\n<div class="tech-head">${num}${name}</div>\n`;
      }
      return `</div>\n`;
    },
  });

  // ── ::: raw ──  minden érintetlenül átmegy (escape-hatch a ritka HTML-hez)
  md.use(mdContainer, 'raw', {
    validate: (params) => parseHeader(params).name === 'raw',
    render(tokens, idx) {
      // a raw blokk tartalmát a build.js kezeli külön (lásd ott)
      return tokens[idx].nesting === 1 ? '' : '';
    },
  });
}
