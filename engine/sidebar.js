/* ═══════════════════════════════════════════════
   engine/sidebar.js — a collector.sections[] csoportosítása
   sidebar-groups szerint. Content-agnosztikus.
   ═══════════════════════════════════════════════ */

/**
 * @param {Array} sections - a markdown ::: section blokkokból gyűjtött nav-elemek
 * @param {string[]} [groupOrder] - a frontmatter sidebar_groups tömbje (megadja a sorrendet)
 * @returns {Array<{label: string, links: Array}>}
 */
export function groupSidebar(sections, groupOrder) {
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
