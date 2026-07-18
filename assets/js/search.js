/* ═══════════════════════════════════════════════
   search.js — kliens-oldali teljes-szöveges keresés
   Az adat a build-ből jön: window.__SEARCH__
   [{ page, pageTitle, id, heading, text }, …]
   ═══════════════════════════════════════════════ */

(function () {
  let activeIndex = -1;
  let currentResults = [];

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // ékezet-független kereséshez
  }

  function tokenize(q) {
    return normalize(q).split(/\s+/).filter(Boolean);
  }

  /* ── pontozás ── */
  function scoreEntry(entry, query, tokens) {
    const heading = normalize(entry.heading);
    const text = normalize(entry.text);
    let score = 0;

    if (heading.includes(query)) score += 50;
    if (text.includes(query)) score += 10;

    for (const t of tokens) {
      if (heading.includes(t)) score += 12;
      const occurrences = text.split(t).length - 1;
      score += Math.min(occurrences, 5) * 2;
    }
    return score;
  }

  function search(query) {
    const data = window.__SEARCH__ || [];
    const q = normalize(query.trim());
    if (!q) return [];
    const tokens = tokenize(query);

    const scored = data
      .map(entry => ({ entry, score: scoreEntry(entry, q, tokens) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return scored.map(x => x.entry);
  }

  /* ── snippet kiemeléssel ── */
  function makeSnippet(text, tokens) {
    const norm = normalize(text);
    let pos = -1;
    for (const t of tokens) {
      const i = norm.indexOf(t);
      if (i !== -1 && (pos === -1 || i < pos)) pos = i;
    }
    const start = Math.max(0, (pos === -1 ? 0 : pos) - 60);
    let snippet = text.slice(start, start + 220);
    if (start > 0) snippet = '… ' + snippet;
    if (start + 220 < text.length) snippet += ' …';

    // kiemelés
    let html = escapeHtml(snippet);
    for (const t of tokens) {
      if (t.length < 2) continue;
      const re = new RegExp('(' + escapeRegex(t) + ')', 'ig');
      html = html.replace(re, '<mark>$1</mark>');
    }
    return html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ── renderelés ── */
  function renderResults(results, tokens) {
    const box = document.getElementById('search-results');
    const i18n = window.__I18N__ || {};
    activeIndex = results.length ? 0 : -1;
    currentResults = results;

    if (!results.length) {
      const hasQuery = box.dataset.hasQuery === '1';
      box.innerHTML = hasQuery
        ? `<div class="search-hint">${escapeHtml(i18n.searchNoResults || 'No results.')}</div>`
        : `<div class="search-hint">${escapeHtml(i18n.searchHint || 'Start typing to search…')}</div>`;
      return;
    }

    box.innerHTML = results.map((r, i) => `
      <a class="search-result${i === 0 ? ' active' : ''}" data-index="${i}" data-page="${r.page}" data-id="${r.id}">
        <div class="search-result-meta">${escapeHtml(r.pageTitle)}</div>
        <div class="search-result-heading">${escapeHtml(r.heading)}</div>
        <div class="search-result-snippet">${makeSnippet(r.text, tokens)}</div>
      </a>
    `).join('');

    box.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        goToSection(el.dataset.page, el.dataset.id);
        closeSearch();
      });
    });
  }

  function updateActive() {
    const box = document.getElementById('search-results');
    box.querySelectorAll('.search-result').forEach((el, i) => {
      el.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ── globális API (a build.js onclick-jei hívják) ── */
  window.openSearch = function () {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const i18n = window.__I18N__ || {};
    overlay.classList.add('open');
    input.value = '';
    input.dataset.hasQuery = '0';
    document.getElementById('search-results').innerHTML =
      `<div class="search-hint">${escapeHtml(i18n.searchHint || 'Start typing to search…')}</div>`;
    setTimeout(() => input.focus(), 30);
  };

  window.closeSearch = function () {
    document.getElementById('search-overlay').classList.remove('open');
  };

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const box = document.getElementById('search-results');
    if (!input) return;

    input.addEventListener('input', () => {
      const q = input.value;
      box.dataset.hasQuery = q.trim() ? '1' : '0';
      const tokens = tokenize(q);
      renderResults(search(q), tokens);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < currentResults.length - 1) { activeIndex++; updateActive(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) { activeIndex--; updateActive(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const r = currentResults[activeIndex];
        if (r) { goToSection(r.page, r.id); closeSearch(); }
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // globális gyorsbillentyű: Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });
  });
})();
