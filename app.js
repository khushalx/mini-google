(() => {
  'use strict';

  const pages = window.miniGooglePages;
  const { createSearchIndex, words } = window.miniGoogleSearch;
  const { ranked, search, iterations } = createSearchIndex(pages);
  const byId = new Map(ranked.map(page => [page.id, page]));
  const main = document.getElementById('main');
  const form = document.getElementById('search-form');
  const input = document.getElementById('query');
  const clear = document.getElementById('clear');
  const shortcut = document.querySelector('.shortcut');
  const inlineSubmit = document.querySelector('.inline-submit');
  const headerBrand = document.querySelector('.header-brand');
  const foundersPhoto = document.querySelector('.founders-photo');
  const results = document.getElementById('results');
  const article = document.getElementById('page');

  function el(tag, className = '', value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const element = document.createElementNS(ns, 'svg');
    const use = document.createElementNS(ns, 'use');
    element.setAttribute('class', 'icon');
    element.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', `#${name}-icon`);
    element.append(use);
    return element;
  }

  function link(label, href, className) {
    const anchor = el('a', className, label);
    anchor.href = href;
    return anchor;
  }

  function wordmark(target) {
    const colors = ['blue', 'red', 'yellow', 'blue', 'blue', 'red', 'yellow', 'blue', 'green', 'red'];
    let index = 0;
    const brand = el('span', 'wordmark');
    brand.setAttribute('aria-hidden', 'true');
    for (const word of ['Mini', 'Google']) {
      const group = el('span');
      for (const letter of word) group.append(el('span', colors[index++], letter));
      brand.append(group);
    }
    target.append(brand);
  }

  function routeTo(query = '', id, lucky = false) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (id) params.set('page', id);
    if (lucky) params.set('lucky', '1');
    return `#${params}`;
  }

  function title(page) {
    return page.domain.split('.')[0].split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
  }

  function highlighted(text, query) {
    const terms = new Set(words(query));
    return text.split(/([\p{L}\p{N}]+)/gu).map(part => terms.has(part.toLowerCase()) ? el('strong', '', part) : document.createTextNode(part));
  }

  function updateSearchControls() {
    clear.hidden = !input.value;
    shortcut.hidden = Boolean(input.value) || main.dataset.view !== 'home';
  }

  function renderRanking(matches, query, method) {
    const isKeyword = method === 'keyword';
    const panel = el('section', `ranking-panel ranking-${method}`);
    const heading = el('h2', 'ranking-title', isKeyword ? 'Keyword frequency' : 'PageRank');
    heading.id = `ranking-${method}`;
    panel.setAttribute('aria-labelledby', heading.id);
    const header = el('div', 'ranking-header');
    header.append(el('span', 'ranking-label', isKeyword ? 'The old way' : 'The link-based way'), heading,
      el('p', '', isKeyword ? 'More keyword hits move a page up.' : 'Links from important pages carry more weight.'));
    panel.append(header);
    if (!matches.length) {
      panel.append(el('p', 'panel-empty', 'No matching pages.'));
      return panel;
    }

    const list = el('ol', 'results-list');
    list.setAttribute('role', 'list');
    matches.forEach((page, index) => {
      const item = el('li', 'result');
      const position = el('span', 'rank-position', `#${index + 1}`);
      const details = el('div', 'result-details');
      const site = el('div', 'result-site');
      const mark = el('span', `site-mark site-mark-${page.id}`, page.domain[0].toUpperCase());
      mark.setAttribute('aria-hidden', 'true');
      const siteInfo = el('div');
      siteInfo.append(el('span', 'site-domain', page.domain), el('span', 'site-id', `Page ${page.id} in the demo index`));
      site.append(mark, siteInfo);
      const resultTitle = el('h3', 'result-title');
      resultTitle.append(link(title(page), routeTo(query, page.id)));
      const snippet = el('p', 'snippet');
      snippet.append(...highlighted(page.text, query));
      const metric = isKeyword ? `${page.keywordHits} keyword ${page.keywordHits === 1 ? 'hit' : 'hits'}` : `PageRank ${page.score.toFixed(4)}`;
      details.append(site, resultTitle, snippet, el('span', 'score ranking-score', metric));
      item.append(position, details);
      list.append(item);
    });
    panel.append(list);
    return panel;
  }

  function renderResults(query) {
    const { byKeyword, byPageRank } = search(query);
    const count = byPageRank.length;
    const heading = el('h1', 'results-heading', 'Compare rankings');
    heading.setAttribute('aria-label', `Compare rankings for ${query}`);
    heading.tabIndex = -1;
    const bar = el('div', 'results-bar');
    const intro = el('div');
    const meta = el('p', 'results-count', `${count} matching ${count === 1 ? 'page' : 'pages'} · Two ways to rank`);
    intro.append(heading, meta);
    bar.append(intro, foundersPhoto.cloneNode(true));
    const elements = [bar];
    const terms = words(query);

    if (terms.length >= 3 && terms.every(term => term === 'pizza')) {
      elements.push(el('p', 'notice', '🍕 Pizza chant detected. You can summon the toppings, but the rankings stay the same.'));
    }

    const comparison = el('div', 'ranking-comparison');
    comparison.append(renderRanking(byKeyword, query, 'keyword'), renderRanking(byPageRank, query, 'pagerank'));
    elements.push(comparison);

    if (!count) {
      const empty = el('div', 'empty');
      const message = el('p');
      message.append('No pages matched ', el('strong', '', query), '.');
      const suggestion = el('p');
      suggestion.append('This mini web has six pages. Try ', link('pizza', routeTo('pizza')), ' or ', link('pune', routeTo('pune')), '.');
      empty.append(message, suggestion);
      elements.push(empty);
    }

    results.replaceChildren(...elements);
    return heading;
  }

  function relatedPages(label, linkedPages, query) {
    const section = el('section', 'related');
    section.append(el('h2', '', `${label} (${linkedPages.length})`));
    if (!linkedPages.length) {
      section.append(el('p', '', 'None in this index.'));
      return section;
    }
    const list = el('ul');
    for (const page of linkedPages) {
      const item = el('li');
      item.append(link(page.domain, routeTo(query, page.id)), el('span', 'related-score', page.score.toFixed(4)));
      list.append(item);
    }
    section.append(list);
    return section;
  }

  function renderPage(page, query, lucky) {
    const back = link(query ? 'Back to search results' : 'Back to Mini Google', routeTo(query), 'back-link');
    back.prepend(icon('back'));
    const heading = el('h1', 'page-title', title(page));
    heading.tabIndex = -1;
    const source = link(page.domain, page.url, 'source-link');
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.append(icon('external'));
    const content = el('p', 'indexed-text');
    content.append(...highlighted(page.text, query));
    const panel = el('div', 'page-panel');
    const graph = el('div', 'page-graph');
    graph.append(
      relatedPages('Links to this page', ranked.filter(candidate => candidate.linksTo.includes(page.id)), query),
      relatedPages('Links from this page', page.linksTo.map(id => byId.get(id)), query),
    );
    panel.append(el('span', 'eyebrow', `Page ${page.id} · Indexed text`), content, graph);
    const metadata = el('div', 'page-meta');
    metadata.append(source, el('span', 'score', `PageRank ${page.score.toFixed(4)}`));
    article.replaceChildren(back, heading, metadata);
    if (lucky) article.append(el('p', 'notice', '🍀 Lucky pick! You skipped straight to the top-ranked match.'));
    article.append(panel);
    return heading;
  }

  function render({ focus = false } = {}) {
    const params = new URLSearchParams(location.hash.slice(1));
    const query = (params.get('q') ?? '').slice(0, 200).trim();
    const page = byId.get(Number(params.get('page')));
    const view = page ? 'page' : query ? 'results' : 'home';
    main.dataset.view = view;
    document.body.dataset.view = view;
    headerBrand.hidden = view === 'home';
    inlineSubmit.hidden = view === 'home';
    results.hidden = view !== 'results';
    article.hidden = view !== 'page';
    input.value = query;
    updateSearchControls();
    document.title = page ? `${title(page)} · Mini Google` : query ? `${query} · Mini Google Search` : 'Mini Google';
    const heading = page ? renderPage(page, query, params.get('lucky') === '1') : query ? renderResults(query) : input;
    if (focus) {
      window.scrollTo(0, 0);
      heading.focus({ preventScroll: true });
    }
  }

  function navigate(hash) {
    if (hash === location.hash) render({ focus: true });
    else location.hash = hash;
  }

  function renderRankTable() {
    const table = el('table', 'rank-table');
    const thead = el('thead');
    const header = el('tr');
    for (const label of ['Page', 'PageRank', 'Links to', '“pizza” count']) {
      const cell = el('th', '', label);
      cell.scope = 'col';
      header.append(cell);
    }
    thead.append(header);
    const tbody = el('tbody');
    ranked.forEach(page => {
      const row = el('tr');
      const name = el('th');
      name.scope = 'row';
      name.append(link(page.domain, routeTo('', page.id)), el('span', 'table-id', `Page ${page.id}`));
      const count = page.termCounts.get('pizza') ?? 0;
      row.append(name, el('td', 'table-score', page.score.toFixed(4)), el('td', '', page.linksTo.join(', ')), el('td', '', String(count)));
      tbody.append(row);
    });
    table.append(thead, tbody);
    document.getElementById('rank-table').append(table);
    const note = document.getElementById('rank-note');
    const best = ranked[0];
    const last = ranked.at(-1);
    note.append(
      el('p', '', `🍕 Page ${last.id} says “pizza” ${last.termCounts.get('pizza') ?? 0} times and still comes last. Page ${best.id} takes first place because of the links pointing to it.`),
      el('p', 'rank-info', `Damping factor: 0.85 · Converged in ${iterations} iterations`),
    );
  }

  wordmark(document.querySelector('.home-brand'));
  wordmark(headerBrand);
  renderRankTable();
  render();

  input.addEventListener('input', updateSearchControls);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) {
      input.value = '';
      updateSearchControls();
      input.reportValidity();
      return;
    }
    navigate(routeTo(query));
  });
  clear.addEventListener('click', () => {
    input.value = '';
    updateSearchControls();
    input.focus();
  });
  document.getElementById('lucky').addEventListener('click', () => {
    const query = input.value.trim() || 'pizza';
    const first = search(query).byPageRank[0];
    navigate(routeTo(query, first?.id, Boolean(first)));
  });
  window.addEventListener('hashchange', () => render({ focus: true }));
  document.querySelectorAll('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
  });
  document.getElementById('rank').addEventListener('click', event => {
    if (event.target.closest('a')) event.currentTarget.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey || event.isComposing ||
      document.querySelector('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    input.focus();
  });
})();
