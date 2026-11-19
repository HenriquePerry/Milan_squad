---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: index.html (AC Milan Squad 2026/27)

Mode: Operate (a data tool fans browse and read; portfolio visitors judge craft on the first viewport).
Audience: Milan fans first, often on phones mid-week; portfolio visitors second; owner audits via ?debug.
Job: find the number you came for (next match, who is out, form, a player's season) and trust it.
Scope: visual redesign of the whole page plus approved a11y/mobile fixes; behaviour and every number unchanged; no new features. Public "Updated <date>" line; validation/methodology stay owner-only.
Approved additions: matchday line from existing data; player photo (CONFIG.photos) in #card; bottom section bar + scroll-spy on phones; repetition removed (header subtitle, Mister matches/W-D-L).

## Direction contract
THESIS: The squad is a row of hung shirts in the San Siro dressing room: every player is found by shirt and number, printed like kit lettering. Refuses the category default of a dark dashboard of identical rounded cards with one accent.
OWN-WORLD: Warm locker-black ground on a numbered ten-step neutral ramp (l0 #0b0a0b to l8 #c9c2b8, ink #f2ede4 kit-print white); Milan red #c8102e only for Milan fields and selection, #ff5468 as red text/series, sky #6cb4ee as the second series. Saira Extra Condensed for numerals and headings, Saira Condensed tracked caps for labels and nav, system-ui for body and tables. No boxes: hairlines, 2px red top rules and space. Signature: the kit-number token (number in kit lettering on a rossoneri-striped disc) identifies a player everywhere.
STORY: The fan lands on the dressing-room rail, sees who is focused and their season in five numbers, reads the matchday line (last result, next fixture, who is out, league position, updated date), then drills into team, trends, matches, squad, compare and the table, trusting every n/a and source mark.
FIRST VIEWPORT: Compact masthead (h1 AC Milan Squad, season, updated date), one sticky bar (competition pills left, section tabs with red underline). Below, the full-bleed peg rail: steel pole edge to edge, shirts hanging, focused shirt larger with ink outline; under it the focused player's name in display type, five quick numbers and the red "Open player card" pill. Then the four-column matchday line across the container. Phones: competition pills in a one-row top bar, sections in a fixed bottom bar.
FORM: The Dressing Room, candidate 6 of my ordered list of 7 grounded directions; seed:c0596b4e46a88d82. Raises from declined challengers: nothing labelled twice (catalog sleeve); one-line sticky sign band (terminal wayfinding); type and space separate sections (metro tiles); players without minutes recede to grey (character roster); stepped ramps with at least 3:1 between steps (star atlas); greys snapped to a numbered ramp (darkroom record).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion grammar
Shirts drop onto their pegs from the focused one outward on load with a small settling swing; the pole draws first; the player name and quick numbers rise in while "Open player card" stays visible from the first frame. On scroll, once: chart lines draw and match stat bars grow (no generic per-section reveals: one authored moment, per the craft floor). No animated counting. Lenis for page scroll only; everything static under reduced motion or if the CDN fails.
