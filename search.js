(function (root) {
  'use strict';

  // The random surfer starts uniformly, then either follows a link (85%)
  // or jumps to any page (15%). Pages without links redistribute their share.
  function pageRank(pages, { damping = 0.85, tolerance = 1e-12, maxIterations = 250 } = {}) {
    const size = pages.length;
    if (size === 0) return { scores: new Map(), iterations: 0 };

    const indices = new Map(pages.map(({ id }, index) => [id, index]));
    const links = pages.map(page => [...new Set(page.linksTo)].filter(id => indices.has(id)).map(id => indices.get(id)));
    let ranks = new Array(size).fill(1 / size);
    let iterations = 0;

    while (iterations < maxIterations) {
      const dangling = ranks.reduce((sum, rank, index) => sum + (links[index].length ? 0 : rank), 0);
      const next = new Array(size).fill((1 - damping + damping * dangling) / size);
      links.forEach((targets, index) => {
        if (!targets.length) return;
        const share = damping * ranks[index] / targets.length;
        for (const target of targets) next[target] += share;
      });
      const delta = next.reduce((sum, rank, index) => sum + Math.abs(rank - ranks[index]), 0);
      ranks = next;
      iterations += 1;
      if (delta <= tolerance) break;
    }

    return { scores: new Map(pages.map(({ id }, index) => [id, ranks[index]])), iterations };
  }

  const words = text => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

  function createSearchIndex(pages) {
    const { scores, iterations } = pageRank(pages);
    const ranked = pages.map(page => {
      const termCounts = new Map();
      for (const word of words(page.text)) termCounts.set(word, (termCounts.get(word) ?? 0) + 1);
      return { ...page, score: scores.get(page.id), termCounts };
    }).sort((a, b) => b.score - a.score || a.id - b.id);

    function search(query) {
      const terms = [...new Set(words(query))];
      const byPageRank = terms.length ? ranked
        .filter(page => terms.every(term => page.termCounts.has(term)))
        .map(page => ({ ...page, keywordHits: terms.reduce((sum, term) => sum + page.termCounts.get(term), 0) })) : [];
      const byKeyword = [...byPageRank].sort((a, b) => b.keywordHits - a.keywordHits || a.id - b.id);
      return { byKeyword, byPageRank };
    }

    return { ranked, search, iterations };
  }

  const api = { pageRank, createSearchIndex, words };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.miniGoogleSearch = api;
})(globalThis);
