---
name: AC Milan Squad
description: One club's season as a dressing room of hung shirts, every player found by shirt and number.
colors:
  l0: "#0b0a0b"
  l1: "#121011"
  l2: "#1a1718"
  l3: "#262122"
  l4: "#38322f"
  l5: "#58514d"
  l6: "#7a736d"
  l7: "#9e978f"
  l8: "#c9c2b8"
  ink: "#f2ede4"
  kit-black: "#0e0d0e"
  red: "#c8102e"
  red-hover: "#de1636"
  red-tx: "#ff5468"
  series-b: "#6cb4ee"
  win: "#3fae7d"
  draw: "#6a635e"
  warn: "#e0a93b"
typography:
  display:
    fontFamily: "Saira Extra Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(36px, 4.4vw, 64px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Saira Extra Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 48px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.005em"
  numeral:
    fontFamily: "Saira Extra Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0em"
  title:
    fontFamily: "Saira Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  label:
    fontFamily: "Saira Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Saira Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  tag: "3px"
  tile: "8px"
  soft: "10px"
  shirt: "12px"
  pill: "999px"
  disc: "50%"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  gutter: "40px"
  gutter-phone: "16px"
  max-width: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.red-hover}"
  competition-segment:
    backgroundColor: "{colors.l2}"
    rounded: "{rounded.pill}"
    padding: "3px"
  competition-option:
    textColor: "{colors.l8}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  competition-option-active:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
  competition-option-disabled:
    textColor: "{colors.l5}"
  section-tab:
    textColor: "{colors.l8}"
    typography: "{typography.title}"
    height: "52px"
  section-tab-active:
    textColor: "{colors.ink}"
  filter-pill:
    textColor: "{colors.l8}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  filter-pill-active:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
  player-chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px 4px 4px"
    height: "38px"
  player-chip-selected:
    backgroundColor: "{colors.l2}"
  select:
    backgroundColor: "{colors.l1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 40px 0 16px"
    height: "44px"
  kit-number:
    textColor: "#ffffff"
    typography: "{typography.numeral}"
    rounded: "{rounded.disc}"
    size: "34px"
  kit-number-pitch:
    rounded: "{rounded.disc}"
    size: "48px"
  hanging-card:
    rounded: "{rounded.shirt}"
    width: "150px"
  rail-arrow:
    backgroundColor: "{colors.l0}"
    rounded: "{rounded.disc}"
    size: "44px"
  tooltip:
    backgroundColor: "{colors.l2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.soft}"
    padding: "10px 12px"
---

# Design System: AC Milan Squad

## Overview

**Creative North Star: "The Dressing Room"**

The squad is a row of hung shirts in the San Siro dressing room. Every player is found by shirt and number, printed like kit lettering, and the rest of the page reads like the lettering and signage of that room: condensed caps, numbers set large, warm locker-black walls and one red that belongs to the club. The system refuses the category default of a dark dashboard built from identical rounded cards with one accent; there are no boxes. Sections are separated by type, space, hairlines and a 2px red rule, never by a filled container.

Density is that of a data tool: tables, charts and lists sit close, but every block opens on a large condensed headline or numeral so the eye finds the number first. The one physical object in the world is the peg rail at the top: a steel pole edge to edge with shirts hanging from it, the focused shirt larger and outlined in kit-print white. Everything below the rail is flat print on the dark wall.

Honesty is visual too: players without minutes recede to grey, missing values read "n/a" in the support grey, and colour never decorates. Red marks Milan and the current selection; nothing else gets it.

**Key Characteristics:**
- Warm locker-black ground on one numbered neutral ramp (l0 to l8, plus ink).
- Milan red only for Milan fields and selection; a lighter red for red as text or as a data series.
- Saira Extra Condensed for numerals and headings, Saira Condensed tracked caps for labels and navigation, the platform UI face for reading and tables.
- The kit-number token (number in kit lettering on a rossoneri-striped disc) identifies a player everywhere.
- No boxes: hairlines, 2px red top rules and space.
- One authored motion moment (the shirts dropping onto their pegs); data draws in once; numbers never count up.

## Colors

A warm, almost brown black stepped in a numbered ramp, with kit-print white for text and a single club red held back for meaning.

### Primary
- **Rossoneri Red** (`red`): fills only. The selected competition pill, the selected filter pill, the primary "Open player card" pill, the 2px top rule over highlight lists, the active section tab underline, the Milan side of match stat bars, the red stripes of every kit disc and shirt. Hover on the primary pill brightens to **Floodlit Red** (`red-hover`).
- **Signal Red** (`red-tx`): red as text or line on dark, where `red` would fail contrast. Leader values (first row of a highlight list, lead tile), the Milan score in the matchday line, losses (ring, not fill), red cards, "OUT" marks, the sorted-column arrow, the first series in every chart and radar, percentile bars.

### Secondary
- **Curva Sky** (`series-b`): the second data series only (xG/xGA dashed line, the second player in the comparator radar, drawn dashed). Never used for UI chrome.

### Tertiary (result and status semantics)
- **Pitch Green** (`win`): wins (filled disc with dark text), "ok" validation badges.
- **Terrace Grey** (`draw`): draws (filled disc with white text).
- **Card Amber** (`warn`): yellow cards and "note" validation badges.

### Neutral
- **Locker Black** (`l0`): page, sticky bar, sticky table header and columns.
- **Bench Shadow** (`l1`): hover wash on rows and matchday cells, select fill, top of the rail gradient.
- **Locker Panel** (`l2`): competition segment track, tooltip, selected chip.
- **Hairline** (`l3`): every divider, every table rule, section top borders.
- **Steel Edge** (`l4`): rings on kit discs, pill outlines, unfilled difficulty bars, the sticky header's bottom rule, scrollbar thumb.
- **Worn Grey** (`l5`) and **Chalk Grey** (`l6`): disabled options, hover underline on tabs, dotted glossary underline, chip hover outline.
- **Support Grey** (`l7`): labels, captions, secondary facts, "n/a" values, players without minutes in the table.
- **Kit Stone** (`l8`): secondary text, table body text, inactive tabs and pills, axis labels.
- **Kit-Print White** (`ink`): primary text, numerals, focus ring, the focused shirt's outline, selected token ring.
- **Kit Black** (`kit-black`): the dark stripe of the rossoneri pattern on discs, shirts and the coach portrait. It is part of the kit, not a surface.

### Named Rules
**The Club Colour Rule.** Red appears only for Milan and for the current selection. An opponent, a neutral control, a heading or a decoration never gets red. If it is not Milan's and not selected, it is on the neutral ramp.

**The Two Reds Rule.** `red` fills, `red-tx` speaks. Red text, red lines and red data marks on the dark ground always use `red-tx`; `red` is never set as small text on l0.

**The Grey Bench Rule.** Grey (grayscale filter, `l7` text) is reserved for players without minutes and for missing values. A player who has played is never greyed for any other reason.

**The Numbered Ramp Rule.** Every neutral is one of l0 to l8 or ink. A new grey is not invented; it snaps to the nearest step.

## Typography

**Display Font:** Saira Extra Condensed 700/800 (with Arial Narrow, Roboto Condensed)
**Label Font:** Saira Condensed 600/700 (with Arial Narrow, Roboto Condensed)
**Body Font:** system-ui (with -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)

**Character:** Kit lettering for numbers and names, tracked condensed caps like dressing-room signage for labels, and the platform face wherever a fan has to read a sentence or scan a table.

The scale is a perfect fourth: 11, 13, 15, 20, 28, 36, 48, 64 (px). Nothing is set below 11px.

### Hierarchy
- **Display** (800, clamp 36 to 64px, line-height 0.9, uppercase): the focused player's name under the rail, the player card name, the match score.
- **Headline** (800, clamp 28 to 48px, line-height 0.95, uppercase): section headings (h2); the masthead title is the same face at 28px (20px on phones).
- **Numeral** (800, 36px, line-height 1): quick numbers under the rail, coach facts; 48px for team tiles, 28px for list values and form results, 20px for match stat values. Always tabular in tables.
- **Title** (Saira Condensed 700, 13px, 0.14em tracking, uppercase, `l8`): subsection headings (h3), section tabs, primary pill text, names on shirts.
- **Label** (Saira Condensed 600, 12px, 0.12 to 0.14em tracking, uppercase, `l7`): field labels, table headers, quick-number captions, form labels.
- **Body** (system-ui 400, 15px, line-height 1.5): sentences and notes, capped at 64ch; tables at 13.5 to 14px.
- **Micro** (Saira Condensed 700, 11px, 0.08em tracking): competition tags, position badges, "OUT" marks, rating badges, source tags. The floor.

### Named Rules
**The Kit Lettering Rule.** Any number a fan came for (shirt, score, goals, rating, position) is set in Saira Extra Condensed 800. A key number in the body face is a mistake.

**The Eleven Floor Rule.** No text below 11px, chart axis labels included.

**The Signage Caps Rule.** Labels and navigation are tracked condensed caps; sentences are never set in caps.

## Layout

A single column, max 1280px, with a 40px gutter (16px on phones). The rail and the sticky bar run full bleed; everything else sits in the container.

Spacing is a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Sections open 96px apart (64px on phones); headings sit 24px above their content; blocks inside a section are 48px apart; rows inside a list are 8px of padding with a hairline.

- **Chrome:** a 56px masthead row (title, season, updated date) that scrolls away, and one sticky 52px sign bar under it: competition pills left, section tabs right. On phones the section tabs move to a fixed bottom bar within thumb reach.
- **Rail band:** full-bleed, the active shirt centred by scroll-snap, the caption (name, five quick numbers, primary pill) centred below it, left-aligned on phones.
- **Matchday line:** a four-column ruled strip (1.15 / 1.15 / 1 / 0.7) between two hairlines; two columns under 1100px, one under 640px.
- **Grids:** highlights in three columns (two under 900px, one under 640px); team overview 1.5 / 1; squad, match and player bodies pair a main column with a fixed side column (460, 420, 380 or 320px) and stack under 900px.
- **Breakpoints:** 1180px (tab strip fades at the edge), 1100px, 900px, 640px.

**The Sign Band Rule.** There is exactly one sticky line of wayfinding. Nothing else sticks except table headers and identity columns inside their own scroll box.

## Elevation & Depth

Flat print by default. Depth exists only in the rail, because the rail is the one physical object: the pole is a lit steel bar, the shirts hang and cast shadow, the focused shirt comes forward. Below the rail, surfaces are flat and separated by hairlines; the only lifted elements are things that float over content (tooltip, selected pitch token).

### Shadow Vocabulary
- **Hung shirt** (`box-shadow: 0 12px 26px rgba(0,0,0,.6)`): every shirt on the rail.
- **Focused shirt** (`box-shadow: 0 22px 44px rgba(0,0,0,.75), 0 0 0 2px #f2ede4`): the selected shirt, outlined in ink.
- **Pole** (`box-shadow: 0 3px 8px rgba(0,0,0,.7)`): the steel pole.
- **Floating tip** (`box-shadow: 0 12px 32px rgba(0,0,0,.65)`): glossary and chart tooltips.
- **Selected token** (`box-shadow: 0 0 0 2.5px #f2ede4, 0 6px 18px rgba(0,0,0,.6)`): the selected player on the pitch.
- **Kit ring** (`box-shadow: 0 0 0 1px #38322f`): the hairline ring around every kit disc and portrait (a ring, not elevation).

### Named Rules
**The No Box Rule.** Content is never placed in a filled, bordered, rounded container. A section, card or panel is a top hairline (`l3`) or a 2px red top rule plus space. Rounded fills are for controls (pills, chips, select) and for kit objects (disc, shirt, avatar, pitch).

**The Only Object Rule.** Physical shadow belongs to the rail and to what floats. A flat block below the rail never gets a drop shadow to look important.

## Shapes

Two families. Controls are pills (999px) or discs (50%): competition and filter pills, the primary button, chips, select, rail arrows, rating and result badges. Kit objects carry the rossoneri stripe: the kit-number disc, the hanging shirt and player avatar (12px corners), the coach portrait (disc). Small soft corners (10px) are for the tooltip, heatmap and pitch token hit area; 8px for form results; 3px for source and event tags. Lines are hairlines (1px `l3`); the only heavy rules are the 2px red top rule and the 3px red tab underline.

The stripe is always vertical: red and kit black in equal widths on shirts and avatars, a 20%-period red-on-dark pattern on number discs, 4px stripes behind photo discs.

## Components

### Kit-Number Token (signature)
The player's identity everywhere: highlight rows (34px), matchday "out" list (30px), bench chips (28px), pitch tokens (48px, 38px on phones). A disc of vertical rossoneri stripes, a 1px `l4` ring, the shirt number in Saira Extra Condensed 800 white with a dark text halo so it reads over the red.
- **Photo variant:** when the player has a photo, the disc shows the cut-out's face on fine 4px stripes, and the number drops to a small 20px kit badge (l0 fill, `l4` ring, 13px numeral) at the lower right.
- **Selected (pitch):** ink ring plus lift; the plain disc turns solid red; the name pill inverts to ink on l0.
- **Unused:** grayscale and 70% opacity (the Grey Bench Rule).

### Peg Rail and Hanging Cards (signature)
- **Pole:** full-bleed 7px steel gradient with a shadow, 22px from the top of the band.
- **Shirt:** 150px wide, 3:4, 12px corners, 1px black edge, striped red and kit black, hanging on a 2px hanger wire. Name in Title type at the top, number at 56px at the bottom; with a photo, the cut-out fills the shirt under a top and bottom shade and the number moves to the lower right at 36px. Position as a Micro pill at the lower left.
- **States:** rest is scale 0.8 with a slight tilt, 60% opacity and desaturated; hover lifts to 0.86 and swings the tilt the other way; focused is scale 1.16, full colour, ink outline; a player without minutes is grayscale.
- **Arrows:** 44px discs at the bottom corners of the band, translucent l0 with an `l4` ring and an ink SVG chevron; hidden on phones (swipe).

### Matchday Line
Four ruled cells: last result, next fixture, who is out, league position. Each cell has a Label, a large condensed line (Milan's score in `red-tx`, a result disc, a difficulty meter) and a 13px `l8` sub-line. Cells are links or buttons with a faint l1 wash on hover. Always one line of data, never a card row.

### Sections and Lists
- **Section:** an uppercase Headline with a muted 12.5px note on the same baseline, then content. No container.
- **Highlight list:** a 2px red top rule, a Title header with an "All" text link, then rows separated by hairlines: kit-number, name, value in Numeral 28px. The leader's value is `red-tx`.
- **Tiles:** a strip of label / Numeral 48px / note between two hairlines; the lead tile's value in `red-tx`.

### Buttons
- **Primary:** red pill, 44px tall, 22px side padding, Title type in white. Hover brightens to `red-hover`; active nudges down 1px. Only one primary per view (open player card).
- **Ghost circle:** 44px disc with an `l4` ring and an ink SVG chevron (rail arrows, previous / next match). Hover turns the ring ink; disabled at 35%.
- **Text action:** `l7` text, ink on hover ("All").

### Pills (competition, filters)
- **Competition segment:** a l2 pill track holding option pills; selected is solid red with white text; disabled options drop to `l5`.
- **Filter pills:** 1px `l4` outline, `l8` text, 36px (44px on phones); hover outline `l6`; selected solid red.
- **Chips (bench):** 1px `l3` outline pill holding a kit-number token and name; selected has an ink outline on l2.
- **Tags:** competition and position tags are Micro pills with an `l4` outline.

### Inputs / Fields
- **Select:** pill, l1 fill, 1px `l4` outline, 44px tall, a `l8` SVG chevron at the right, body text. Hover outline `l6`. Focus is the global ink ring.

### Navigation
- **Sign bar (desktop):** section tabs in Title type, `l8`, 52px tall; hover goes ink with a 2px `l5` underline; current section ink with a 3px red underline (inset shadow, no layout shift). The strip fades at its right edge under 1180px.
- **Bottom bar (phones):** the same tabs fixed to the bottom on l0 with a top hairline, the current tab marked by a 3px red rule on top; the body reserves 53px plus the safe area.

### Tables
Header row in Label type on l0, sticky with a `l4` bottom rule; body 13.5 to 14px, numbers right-aligned and tabular, hairline rows. In the squad table the number and name columns are sticky with a right hairline, the number set in kit lettering. Sort state: the header goes ink with a small `red-tx` arrow, and the sorted column takes a 12% red wash with bold ink. Milan's standings row and the selected match row take a 16 to 18% red wash. Missing values and players without minutes use `l7`.

### Charts
Hand-built SVG on the bare ground: `l3` gridlines, 11px axis text in `l7`, 2px rounded lines. Series one is `red-tx` solid; series two is `series-b` dashed. End values are labelled in ink 12px bold beside a 4px dot with an l0 halo. Results along the base use the result marks (green fill, grey fill, red ring). Hover and focus reveal a `l7` guide line and dots, with a tooltip. Radar: `l3` web with a dashed p50 ring, fills at 16% opacity. Match stat bars: 6px rounded bars, Milan in `red`, the opponent in `l5`.

### Tooltip
l2 fill, 1px `l5` outline, 10px corners, 13px body with a Title-type heading, the floating-tip shadow; max 300px.

### Motion Grammar

Progressive enhancement only: everything is visible and usable without the motion libraries and nothing animates under reduced motion. Lenis smooths page scrolling (lerp 0.12); the rail, scroll boxes, the section bar and selects keep native scroll.

- **State transitions:** 150ms for colour, outline and background; 250ms for opacity and filter; 450ms for the rail's transform, on `cubic-bezier(.2,.8,.2,1)`. Longest token is 700ms.
- **The one authored moment:** the pole draws out from the centre (550ms, power2.inOut), then the shirts drop onto their pegs from the focused shirt outward (30px drop, alternating 6 degree swing, 1s elastic.out(1, 0.5), 35ms stagger), then the caption rises in (14px, 500ms, 70ms stagger). The primary pill is never hidden during the entrance, and the shirts are held hidden for at most 1.2s while the library loads.
- **Data draws once:** trend lines trace left to right (1.2s power2.out), dashed lines fade in (900ms, 300ms delay), match stat bars grow from the centre line (800ms power3.out, 25ms stagger). The player card settles in with a 12px rise (450ms).

**The Honest Numbers Rule.** Numbers are never animated through intermediate values. A count-up shows figures that were never true.

## Do's and Don'ts

### Do:
- **Do** identify every player with the kit-number token (or its photo variant) wherever a player is listed.
- **Do** separate sections with a hairline (`l3`), a 2px red top rule or space, never a filled container.
- **Do** keep red for Milan fields and the current selection; use `red-tx` for red text, lines and series.
- **Do** set every key number in Saira Extra Condensed 800 and every label in tracked Saira Condensed caps.
- **Do** grey out (grayscale, `l7`) players without minutes and nothing else; show missing values as "n/a" in `l7`.
- **Do** snap every neutral to the l0 to l8 ramp or ink.
- **Do** give every control a 44px touch target on phones and the 2px ink focus ring.
- **Do** keep the one sticky sign bar on desktop and the fixed bottom section bar on phones.

### Don't:
- **Don't** wrap content in dark rounded cards with borders; that is the dashboard default this world refuses.
- **Don't** use red for opponents, headings, decoration or anything that is neither Milan nor selected.
- **Don't** set any text below 11px.
- **Don't** animate a number through intermediate values or add count-ups.
- **Don't** add drop shadows to flat blocks below the rail.
- **Don't** add an eyebrow or kicker label above a heading; a heading stands on its own.
- **Don't** use glyph or emoji icons; icons are inline SVG strokes in ink.
- **Don't** add crests or logos as decoration, or player photos beyond the supplied set.
