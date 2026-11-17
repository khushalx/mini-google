# Mini Google

Open `index.html` in a browser. Keep it in the same folder as the CSS and JavaScript files. The search and demo pages run offline and require no setup.

## Class demo

1. Search **pizza**. All six pages match. The left column puts page 6 first because it says “pizza” ten times. The right column puts page 2 (`best-pizza-pune.com`) first with a PageRank of **0.3929** and page 6 last at **0.0250**.
2. Open **PageRank** to compare scores, outgoing links, and keyword counts. Select page 2 to see the four pages that point to it. Result titles open a local preview of the supplied text and its links. The original URL is available in that preview.
3. Try **chai** for a one-result search, **I'm Feeling Lucky** on the homepage to skip to the top match, and **pizza pizza pizza** for a surprise.

## How it works

`pages.js` holds exactly the six supplied texts, URLs, and directed links. It does not fetch the websites. `search.js` computes PageRank across the full six-page graph once when the app loads. Each page starts with a score of `1/6`. In every round, it splits 85% of its score among its outgoing links; the remaining 15% is spread evenly across the index. The algorithm repeats until the total change is at most `10⁻¹²`. A page with no outgoing links would distribute its score evenly to all pages.

For each query, Mini Google finds pages containing all query words, regardless of case. Both columns use those same matches. The keyword column adds up the occurrences of each distinct query word and sorts by that total. The PageRank column sorts by the precomputed link scores. Both break ties by page number.

The homepage and results show an AI parody of Sergey Brin and Larry Page judging pizza.

Reference: [*The Anatomy of a Large-Scale Hypertextual Web Search Engine*](https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/), Sergey Brin and Lawrence Page.
