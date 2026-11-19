# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: AC Milan fans, often on a phone during the week between matches, checking form, the squad, who is unavailable, the last result and the next fixture, and digging into a player's numbers. Secondary: visitors to the owner's Sports Analytics portfolio (recruiters, analysts) who judge analytical craft and credibility in seconds, and the owner, who uses `?debug` to audit sources, collection dates and validation.

## Product Purpose

An interactive, English-language record of AC Milan's 2026/27 season in every official competition (Serie A, Europa League, Coppa Italia): squad, per-player stats, Serie A position percentiles, matches, trends and fixtures. It is refreshed automatically every day and refuses to publish when its own validation fails. Success: a fan finds the number they came for quickly and trusts it; a portfolio visitor sees a rigorous, well-made analytics product.

## Positioning

Every number is collected automatically, cross-checked against the team totals before publishing, and shown honestly: missing values stay "n/a", derived or inferred values carry ≈ and † marks, and every chart states its scope. It is one club's season told with the rigour of an analytics pipeline, not a generic stats aggregator.

## Operating Context

- Published as a static page on GitHub Pages; a GitHub Actions workflow runs `scripts/update.mjs` daily and commits only when data changes.
- Visitors arrive on desktop and mobile; the competition selector scopes most of the page (radar, position chart, fantamedia and distance keep their own fixed scope, stated in captions).
- Owner view: `?debug` reveals source tags (FM, FC, UEFA), the Validation section and the Methodology section. Decided 2026-11-19: the data collection date becomes public; validation and methodology stay owner-only.

## Capabilities and Constraints

- One self-contained `index.html` (vanilla JS, hand-written SVG charts); no build step.
- The DATA block between `/* DATA:START */` and `/* DATA:END */` is rewritten by `scripts/update.mjs` and must never be edited by hand; CONFIG keys, data shapes and the ids/classes the JS depends on must stay stable.
- Features that must keep working: competition selector, hanging-card rail (scroll-snap, arrow keys, open card), coach block, highlights, team overview (tiles, results, unavailable, standings, fixtures with difficulty), season trend charts, matches (per-match page, pitch, per-player match stats, match log, `#match-<id>` deep links), squad pitch + bench + player card (stats, percentile radar, touch heatmap), comparator, sortable/filterable table, glossary tooltips, validation and methodology panels, photos via `CONFIG.photos`, SEO meta tags.
- External libraries only from jsDelivr or cdnjs with pinned versions; the page must work if they fail to load.
- Scope of the 2026 redesign: visual redesign plus accessibility and mobile fixes; behaviour and numbers identical; no new features (no search, no player deep links).
- Single club (AC Milan) for now; multi-club support is a later, separate decision.

## Brand Commitments

- AC Milan red and black, dark, data-first, editorial sports-analytics feel; never a generic SaaS template.
- No Milan crests or logos added as decoration. Opponent and Milan crests on match pages are loaded from FotMob as data, as they are today.
- No player photos beyond those listed in `CONFIG.photos` (all in `img/`, owner-supplied with usage rights).
- Portfolio project with no affiliation to AC Milan, Lega Serie A, UEFA or the sources; the footer disclaimer stays.

## Evidence on Hand

- Real data: FotMob (Opta) squad, stats, standings, fixtures, match pages, injuries, touch maps; Fantacalcio fantamedia; UEFA distance and top speed (European matches only). Collected automatically.
- 27 player cut-out photos and one coach photo in `img/`; favicons in `icons/`.
- Validation checks recomputed on every load (owner view) plus dated manual cross-checks in CONFIG.
- Absent and not to be fabricated: progressive passes (shown as n/a), Serie A distance data, any testimonials or claims about the owner.

## Product Principles

1. Truth before polish: never invent, round away or hide a number; "n/a" and source marks stay visible.
2. The fan's question first: the next match, who is out, form, and the player they care about are always within reach, especially on a phone.
3. Every scope is explicit: what the competition selector changes and what it does not is stated where the number is.
4. Automation is the contract: anything the daily update rewrites stays machine-owned; design never depends on hand-edited data.

## Accessibility & Inclusion

WCAG 2.2 AA: text and non-text contrast, keyboard access to every interactive element (including table and match-log rows), visible focus, respect for `prefers-reduced-motion`, and usable touch targets on mobile.
