(function (root) {
  'use strict';

  // The six documents and directed links supplied for the class project.
  const pages = [
    { id: 1, url: 'http://pune-food-guide.com', text: 'Where to eat in Pune - vada pav and biryani and pizza', linksTo: [2] },
    { id: 2, url: 'http://best-pizza-pune.com', text: 'Fresh wood-fired pizza made daily - try our cheese pizza', linksTo: [1, 3] },
    { id: 3, url: 'http://college-canteen-blog.com', text: 'Student reviews of canteen food and chai and Friday pizza', linksTo: [2, 4] },
    { id: 4, url: 'http://pizza-recipes-home.com', text: 'Make pizza at home - pizza dough and pizza sauce', linksTo: [2, 5] },
    { id: 5, url: 'http://cheap-eats-pune.com', text: 'Good food under 100 rupees - misal and dosa and pizza slices', linksTo: [2] },
    { id: 6, url: 'http://pizza-pizza-pizza.com', text: 'pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza', linksTo: [1] },
  ].map(page => ({ ...page, domain: new URL(page.url).hostname }));

  if (typeof module === 'object' && module.exports) module.exports = pages;
  else root.miniGooglePages = pages;
})(globalThis);
