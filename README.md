# Falcon International — marketing site

Single-page marketing site for Falcon International, industrial contractor, Lahore, est. 1997.
Built against `falcon-website-claude-code-brief.md`. Read that first — it is the spec.

```bash
npm run dev
```

`npm run build` produces a Next server app for Vercel. Pages are still
prerendered to static HTML; only `/api/contact` runs on demand. See HANDOVER.md
for the SMTP variables it needs, and `next.config.mjs` for how to revert to a
pure static export.

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold, tokens, fonts, GSAP, `useScrollScene`, all copy, 14 static sections | **Done** |
| 1 | The red line system — continuous path, draw-on-entry, hand-off geometry | **Done** |
| 2 | S1 Hero + S2 At a Glance | **Done** |
| 3 | S3 The Journey ★ | **Done** |
| 4 | S8 Capabilities ★ | **Done** |
| 5 | S4 Map, S12 Zero, S13 Falcon reveal | **Done** |
| 6 | S5, S6, S7, S9, S10, S11 | **Done** |
| 7 | S0 Preloader, mobile pass, reduced-motion pass, perf audit | **Done** |

S4–S7 were pulled forward out of phase order to close the static gap between the
two centrepieces; the rest followed. **All seven phases are complete.** What is
left is listed under Open items — all of it needs the client, a real device, or a
hosting decision.

## The motion model — read this first

**Nothing on this page pins, and nothing scrubs.** Every scene plays ONCE when it
comes into view, over its own short duration, and leaves the result on screen.

It did not start this way. Seven sections were pinned and scrubbed — S3 alone held
600vh — which added up to **1,850vh, eighteen screen-heights, of scrolling that
produced no downward movement.** Worse, scrubbing ties a sentence to one exact
scroll offset: read it at a natural speed and it flies past, and getting it back
means hunting for the pixel it lives at. Fourteen dated milestones went by in a
blur nobody could stop.

That is a design mistake, not a tuning problem, and the fix was to delete the
mechanism rather than slow it down:

| Was | Is |
|---|---|
| S3 Journey — 600vh pin, horizontal camera | vertical timeline, red line as its rail |
| S8 Capabilities — 500vh pin, six panels cross-faded in place | six panels, one after another |
| S1/S2/S4/S12/S13 — 100–200vh pins | ordinary sections |
| Red line scrubbed (un-drew on scroll up) | draws once, stays drawn |
| Lenis smooth scroll | native scrolling |

**The rule to keep:** if a reader has to scroll precisely to see something, it is
broken. Motion is punctuation. It must never be the thing that makes content exist.

### Reveals must not be load-bearing

Every reveal starts its content at `opacity: 0`, which makes the animation
load-bearing — if it does not run, the content is not un-animated, it is
**invisible**. GSAP drives tweens off `requestAnimationFrame`, and rAF can be
starved (a background tab, an occluded window, a device under load). This was not
theoretical: the contact form was caught sitting at `opacity: 0` with its trigger
active and its tween at progress 0.

So every play-once trigger carries `onEnter: guaranteeReveal` (`lib/scene.ts`),
which uses `setTimeout` — not rAF — to force the finished state after 2.5s if the
animation has not got there on its own. **Add it to any new reveal.**

## Architecture

```
/app        layout.tsx (fonts, metadata, JSON-LD) · page.tsx (composes S0–S13) · globals.css
/components sections/S0…S13 (one file each) · RedLine.tsx · ui/
/lib        gsap.ts (single registration point) · useScrollScene.ts · redline.ts · scene.ts
/content    site.ts — ALL copy
```

### Three rules that keep the site honest

**All copy lives in `/content/site.ts`.** No hardcoded strings in components. The client will
request wording changes and they must not require touching animation code.

**Import GSAP only from `/lib/gsap.ts`.** Registering ScrollTrigger in more than one module
causes duplicate-instance bugs and silent refresh failures. That module also sets the house
easing default and owns the debounced `requestRefresh()`.

**Animate through `useScrollScene`.** It is the single place that handles reduced motion,
one motion path at every width, and cleanup. Its `settle` callback is how a section declares
its resting appearance — that callback is why the reduced-motion site looks deliberate rather
than like the animated site with the motion torn out.

### The red line

`lib/redline.ts` holds all fourteen segments as **normalised waypoints**, not hand-written path
strings, and generates each `d` in real pixels from the section's measured size.

That indirection is load-bearing. The obvious approach — a 100×100 viewBox stretched per section
with `preserveAspectRatio="none"` — fails twice: non-uniform scale smears every corner (sections
here range from ~100vh to 600vh), and `vector-effect="non-scaling-stroke"` makes the browser
evaluate `stroke-dasharray` in screen space while `getTotalLength()` reports user units, so the
draw renders as a repeating dash instead of a line, and under that scaling `pathLength` cannot
rescue it either. Generating in pixel space makes the viewBox map 1:1 to CSS pixels, so corners
stay circular and stroke weight needs no compensation.

A segment may also declare a `StrandBuilder`, which elaborates the spine into
several strands using live measurements — S2's fork lands on the statistics
because it measures the numerals, not because it guesses at column fractions. A
builder that cannot measure what it needs returns nothing and the spine is used,
which is what happens when the stats wrap to two rows.

**Dash maths uses a declared `pathLength`, never `getTotalLength()`.** Baking a
measured length into a tween couples the timeline to layout: every resize
invalidates it, including the resize ScrollTrigger itself causes when it pins a
section — and rebuilding the timeline re-pins, which resizes again. With a fixed
`pathLength` the numbers never change, so a timeline only needs rebuilding when
the set of strands actually changes shape.

Continuity is a contract, checked at build time by `assertContinuity()`:

```
segment[i].exitX === segment[i + 1].entryX
```

It also verifies each segment's declared entry/exit against its own first and last waypoint, so
the declaration cannot drift from the geometry. Change a path and the build tells you if you
broke the hand-off.

Later phases replace individual node lists with the real states from brief §2 (four-way split,
the values coil, the manifold's six valves, the falcon redraw). **Preserve `entryX`/`exitX` when
you do.**

### Pinned sections

A pinned section owns exactly one master ScrollTrigger (§6). Its red line is
therefore passed `driven`, meaning `RedLine` sets up no motion of its own and the
section's timeline tweens the strands — in all three conditions, including mobile
and reduced motion.

Pinned triggers must be refreshed once the DOM they measured against has settled.
The red line only renders its SVG after an async measure pass, and a pinned
trigger created before that lands with an uncomputed `end` and silently never
scrubs. `useScrollScene` calls the debounced `requestRefresh()` after every build.

### Two traps worth remembering

`overflow-x: hidden` on `body` makes it a scroll container and breaks the
`position: fixed` that pinning relies on. `app/globals.css` uses `overflow-x: clip`,
which suppresses the same overflow without creating a scroll container.

**Never run `next build` while `next dev` is running.** They share `.next`, and
the build overwrites the dev server's chunk manifest — the page then loads with
no client bundle at all, so nothing hydrates and every animation appears dead for
reasons that have nothing to do with the code. Stop the dev server first.

### The map

`PakistanMap` is built from real boundary coordinates, projected:

```
y = (37.4 - lat) * 31.0 + 12
x = (lon - 60.9) * 31.0 * cos(30°) + 12
```

**The cos(latitude) factor is not optional.** A degree of longitude at 30°N is
~0.87 of a degree of latitude; drop it and Pakistan is squashed horizontally and
its natural southwest-to-northeast lean becomes a diagonal shard. Two passes were
wrong before this one — first from guessed vertices, then from a projection
missing that factor. The outline's bounding box now comes out at 1.00 : 1, which
is the real proportion. Forty-nine boundary points; fewer reads as a blob.

Jammu & Kashmir east of the Line of Control is drawn dashed at low opacity and
labelled **disputed territory** — the convention on Pakistani maps and the
factual position. Gilgit-Baltistan and Azad Kashmir are inside the national
outline, so the LoC is the outline's own edge and is never double-stroked.

`mapStrands` resolves the HQ's screen position through the SVG's `getScreenCTM()`,
NOT by measuring the marker element. The section's build sets that marker to
`scale: 0` in a layout effect, which runs BEFORE RedLine's measure effect — a
zero-size rect makes the builder decline and silently fall back to the spine.
Any strand builder that keys off an animated element has this hazard.

### The scene vocabulary

`lib/scene.ts` is shared by S3 and S8. Artwork declares HOW each element arrives
— `data-build="rise|draw|swing|walk|grow|flash|spin"` plus `data-order` — and
`buildScene()` animates it without knowing what it is drawing. A new structure
needs markup and no timeline edit. Nothing fades in.

`spin` is scrubbed rather than looping: a free-running loop keeps a compositor
layer alive off-screen for nothing, and scrubbed rotation reads as machinery the
reader is driving rather than idling.

The counter helpers live here too. Durations are in TIMELINE units, so under
scrub they read as scroll distance — a scrubbed counter on a wall clock finishes
while the reader is still arriving.

### S8 — the manifold

500vh pinned. The red line runs across the top as a header pipe with six valves;
each step quarter-turns the next valve, red charges down that branch, and the
service takes the stage while the previous one wipes downward.

Valves stay open once turned, so by the last step the manifold is visibly feeding
all six — which is the only reason to draw it as a manifold.

Panels are stacked absolutely on one stage and animate with transform and opacity
only; the "wipe" is a translate, never clip-path or height. Same duration-pinned
discipline as S3: `stepAt(i)` is the single source of truth and `tl.set({}, {}, 1)`
holds the duration at exactly 1.

`MANIFOLD_HEADER_Y` sits at 0.25 because at 0.2 the pipe cut through the section
heading.

### S3 — the camera

Vertical scroll input, lateral world movement. The world is fourteen stations
wide (`1400%`), one viewport each, and the entire camera move is a single tween
on a single element:

```
xPercent: 0 → -(13 / 14) * 100     // thirteen viewport widths
```

As a percentage of the world's own width this needs no measurement, so it
survives any viewport and any resize without the timeline being rebuilt — which
matters more here than anywhere, because rebuilding a 600vh pin mid-page throws
the reader's scroll position.

**Everything is authored as a fraction of a timeline whose duration is exactly 1**,
and `stationAt(i)` is the single source of truth for where milestone `i` sits.
A cue placed past 1 stretches the duration and silently shifts every other cue —
that bug put every milestone off-centre by a growing margin until it was found.
`tl.set({}, {}, 1)` pins the duration; cues near the end are clamped.

`INTRO` holds the camera still at the start. Station 0 fills the screen at
progress 0, so without a held beat its structure would have nowhere to build.

Structures declare HOW they arrive (`data-build="rise|draw|swing|walk|grow|flash"`
plus `data-order`) and `buildStructure()` reads only that vocabulary — it animates
artwork it knows nothing about, so a new structure needs markup and no timeline
edit. Nothing fades in; the brief is explicit that structures build themselves.

The back layer is at FIXED viewport positions, not a second scrolling world. The
point is accumulation: a back layer that scrolled would empty out exactly when it
is supposed to be full.

### Statistic numerals

`.stat-numeral` in `globals.css`, NOT the `text-stat` token.

The brief's `clamp(4rem, 12vw, 11rem)` is right for a numeral that owns the frame
— S12's ZERO still uses `text-stat`. It is wrong inside a multi-column grid,
because the shell caps at 80rem: past a 1280px viewport the columns stop growing
at ~262px while a vw-based font keeps growing. At 11rem, "450" alone is 295px and
laps into the next column.

`.stat-numeral` is budgeted per column count against the widest value the grid
carries — "450+". At the four-up ceiling that measures ~218px in a 262px column.
**A wider value will not fit; lower the ceiling rather than letting it overflow.**
Stat blocks also carry `min-w-0`, because a grid track's default `min-width: auto`
lets over-wide content push its neighbours instead of being contained.

### The falcon mark

`FalconMark` traces `/public/assets/falcon-logo.png` as vector, because the brief
has the red line REDRAW itself into the logo — the wing geometry has to be
animatable. It is ~2KB against the PNG's 1.26MB, which is the other reason.

Two things that were wrong first and are worth not repeating:

**The body must extend down to where the wings meet.** Stopping it at its own
baseline leaves a V-shaped notch bitten out of the middle of the mark.

**The wordmark rides a quadratic, not an elliptical arc.** With `A`, the sweep
flag decides which way the curve bulges, and the wrong one sends the text off the
side of the mark instead of over the top of it. A control point above the
endpoints is unambiguous.

### The preloader

`S0Preloader` is defended three ways, because a preloader that fails to dismiss
is worse than no preloader at all (§5, "Never trap the user"):

1. A 2.0s hard timeout, plus an unconditional unmount at 3.2s. Both are
   `setTimeout` — **never `gsap.delayedCall`**, which rides the GSAP ticker and
   would hang the overlay forever if the ticker ever stalled. That is not
   hypothetical: the verification browser throttles rAF, and the first version
   hung there.
2. A CSS keyframe hides it at 2.5s with no JavaScript at all.
3. It is server-rendered but `display: none` until the layout's inline script
   adds `.js`, so with JavaScript disabled it never appears.

It never runs under reduced motion, and only once per session — the same inline
script sets `.preloaded` from sessionStorage before first paint.

### Mobile: the line runs in a gutter

Below 768px `resolveStrands` returns a spine at x = 0.055 for EVERY segment,
ignoring the desktop entry/exit values. On a phone each section is one stacked
column, so a line at the declared x — 0.5 for most segments — runs straight down
the middle of the copy. Using the same gutter everywhere also makes the
section-to-section hand-off trivially continuous.

### RedLine layering

`layer="above"` for sections built from full-bleed opaque panels (S6). The
default `behind` is right almost everywhere — content sits on top and the line
threads the gaps — but behind two solid panels the line is simply never seen.

### Verifying a scene

**Every scene must be confirmed by looking at the rendered output.** Reading
timeline values is necessary but not sufficient: a tween sitting correctly at 0
can still paint, and that whole class of bug is invisible to numeric checks. The
first version of the hero shipped exactly that — the plant paths were given
`stroke-dasharray: 100` without declaring `pathLength`, so 100 meant 100 *user
units* on a 1120-unit path and the "hidden" artwork rendered as a repeating dash
across the viewport. Every number said 0% drawn, and it was.

`/dev/hero` renders one section alone. Add a sibling route per scene as phases
land. They 404 in production and `npm run build` deletes them from `out/`.

Four things make captures reliable, and all four are needed:

1. **Use the harness, not the real page.** The full page is ~20,000px with many
   promoted layers and captures come back blank or stale.
2. **Front the Browser pane.** Hidden panes throttle `requestAnimationFrame`, so
   the GSAP ticker stalls, the scrub never catches up, and captures time out.
3. **Capture pinned sections at scrollY 0 only.** The pane snapshots the
   *document* at the scroll offset, not the viewport — so a `position: fixed`
   pinned section is absent from the capture at any non-zero scroll. Drive the
   timeline instead of scrolling.
4. **Disable the trigger without reverting**, so the scrub cannot pull the
   parked frame back. Do NOT sleep the GSAP ticker to achieve this — no rAF
   means no new frames, and the capture times out instead.

```js
const ST = __ScrollTrigger, t = ST.getAll().find(x => x.pin);
__lenis.scrollTo(0, { immediate: true });   // Lenis owns scroll; scrollTo() is reverted
t.disable(false);                           // stop the scrub; keep current state
t.animation.progress(0.5);                  // park on any frame, then capture
```

At scrollY 0 a pinned section fills the viewport whether or not the pin is
engaged, which is what makes this safe.

**`?reduced=1` forces the reduced-motion path** in development, in both
`useScrollScene` and `SmoothScroll`. It exists because no browser available here
will emulate `prefers-reduced-motion`, and a fallback nobody has watched run is a
fallback nobody knows works. Stripped from production.

**requestAnimationFrame is throttled in the Browser pane** — measured at zero
ticks per second even with `document.hidden === false`. Scrubbed timelines still
work, because scroll events drive them. Time-based ones (the mobile on-enter
builds) never advance, and that is the harness, not the code. Verify those by
driving them instead of waiting:

```js
__ScrollTrigger.getAll()
  .filter(t => t.trigger?.hasAttribute?.('data-capability-panel'))
  .forEach(t => t.animation.progress(1));
```

**Give SVG scenes an explicit height at breakpoints where they are their own grid
row.** In a single-column mobile layout the row is content-driven, so an
`h-full` SVG resolves against zero and silently collapses to nothing.

`window.__gsap`, `window.__ScrollTrigger` and `window.__lenis` are exposed in
development only and stripped from production.

### Drawn artwork: two rules

**Declare `pathLength={DASH_UNITS}` on every path that will be dash-drawn.**
Without it the dash values are in real user units and the stroke paints a
repeating pattern instead of hiding.

**Use `stroke-linecap: butt` on dash-drawn paths.** Square and round caps still
paint on a zero-length dash, leaving visible stubs at rest.

The undrawn state is declared in CSS (`globals.css`), not only set by the
timeline, because the timeline runs after hydration *and* after an async measure
pass — several frames in which the artwork would otherwise paint fully drawn and
then snap away. It is scoped to `.js` so the artwork still renders complete with
JavaScript off, and to `prefers-reduced-motion: no-preference` so a reduced-motion
reader gets the finished frame with no flash.

## Verified in this build

- Typecheck and production build clean.
- All 12 section hand-offs match to the pixel, zero gap at every boundary.
- Every word server-rendered, including the founder's letter (collapsed in `<details>`, not
  conditionally rendered) and all 32 project rows behind the filter.
- Heading order h1 → h2 → h3 → h4, one h1.
- JSON-LD `Organization` + `LocalBusiness` in the static HTML.
- Mobile (375px): Lenis off, no scrub, line draws on entry.
- Both pinned triggers compute on load: hero 0 → 1350 (150vh), glance 2250 → 3150
  (100vh), with matching pin spacers.
- Hero choreography sampled at six points: foundation → columns → pipes → stack →
  tower, crossfade at 0.6, red line born at the end.
- S2 sampled at nine points, including the beat — nothing moves between 0.6 and
  0.7, and it lands on `29 | 80 | 450 | 0`.
- Statistics are server-rendered at their FINAL values; the count is an overlay.
- Real scrolling drives trigger progress in sync through Lenis.
- Hero confirmed **visually** at rest and at progress 1.0: at scrollY 0 nothing
  paints (0/53 plant paths, 0/22 line strands, fill and glow at 0); at progress 1
  the plant is drawn, resolved to silhouette, glow risen, red line born.
- `npm run build` strips the `/dev` harness from `out/`.
- S3: all fourteen milestones confirmed by rendered capture at `/dev/journey`,
  plus the three line moments (2016 charge, 2024 gold, 2026 armoured cable) and
  the closing pull-back to the full skyline.
- S3 mobile (375px): no pin, stations stacked, spine strand, per-milestone build.
- S2 numerals confirmed at 820 / 1500 / 1600 / 1920px, at rest and mid-count:
  no column overlap, tabular widths stable, fork declining to the spine when the
  stats wrap to two rows.
- All fourteen milestone titles server-rendered; 14 stations, 138 build elements.
- S8: all six services confirmed by rendered capture at `/dev/capabilities` —
  valves opening in turn, branches charging, scenes building, counters landing on
  450+ and exactly 70,000.
- S8 mobile (375px): no pin, panels stacked, valves hidden, spine strand, builds
  verified by driving them past the pane's rAF throttling.
- S2 and S3 re-verified after moving onto `lib/scene.ts`: fork and counters land,
  station centring and duration unchanged.
- S4: map, Kashmir, HQ, three routes with pins and counters, and the outbound
  arcs confirmed by capture; content measured to fit the pinned viewport.
- S5: eight icons drawn, and the coil verified sitting on the grid's real row
  gutter rather than a guessed fraction.
- S6: per-line split (4 + 4 lines) with the line on the panel seam.
- S7: portrait wipe, pull-quote settle, cards revealed, letter still in the DOM.
- Five pins on the real page, continuity intact across all 13 segments.
- S9: three rails, cells duplicated for a seamless wrap, marquee drifting in
  opposite directions and paused while the section is off-screen.
- S10: filter verified VISUALLY, not just by count — see the `[hidden]` note below.
- S11: stamp sampled mid-flight (badges still arriving at 1.09) and at rest.
- S12: the sequence sampled at six points — ring closed at 0.6, **nothing between
  0.6 and 0.68**, counter to 10,837, then the four points one at a time.
- S13: body → wings → wordmark → panel, each waiting for the last.
- Seven pins on the real page; all thirteen segments resolving; continuity intact.
- Preloader: shows, dismisses, marks the session, and dismisses even with the
  ticker stalled.
- Reduced motion (`?reduced=1`): 0 pins, 0 ScrollTriggers, 0/32 line strands
  hidden, 0/53 artwork hidden, nothing faded, every counter at its final value.
- Mobile (375px): 0 pins, all 13 line segments in the left gutter at x=21px,
  Lenis off, no horizontal overflow.
- **Measured on the production export, not the dev bundle**: 19 requests,
  839 kB uncompressed — 549 kB JS (169 kB gzipped), 82 kB fonts, **0 kB images**.
- 0 elements carry `will-change` at rest, down from 54.
- Zero `<img>` tags; the nav mark and favicon are vector.

### `[hidden]` must be forced

`globals.css` carries `[hidden] { display: none !important }`.

The UA rule is only `[hidden] { display: none }`, which ANY author display
declaration beats — including a Tailwind `grid` or `flex` class on the same
element. S10's filtered-out rows carried both, so the filter updated the count
and the DOM while every row stayed on screen. It had been wrong since Phase 0 and
survived because the count was checked and the render was not.

## Open items

**A purpose-made social card is still wanted.** `falcon-logo.png` (1.26MB,
1536×1024) is no longer fetched by the page — the nav mark, the favicon and S13's
reveal are all vector now — but it is still the Open Graph image. It is the raw
logo, not a 1200×630 card, so link previews will letterbox it. Replacing it is a
design task, not a code one; the reference is one line in `app/layout.tsx`.

**The contact form has no endpoint.** Static export means no server. Markup is complete and
correct; set a `<form action>` before launch.

**S3 is not lazy-mounted, deliberately.** Brief §6 asks for S3 and S8 to
instantiate their timelines within one viewport and `kill()` at two. Killing a
600vh pin mid-page removes its pin-spacer, which changes document height and
jumps the reader's scroll position — worse than the cost it saves. An inactive
ScrollTrigger only compares scroll offsets; the scrubbed tweens do not update
while off-screen, so the runtime cost is already near zero. Revisit in Phase 7
with the profiler rather than reinstating it blind.

**LCP and sustained 60fps are the two budget items still unverified.** Everything
measurable here passes with room: JS is 169 kB against 300 kB, and total page
weight is well under 3 MB. LCP on simulated Fast 3G and 60fps at 4× CPU throttle
need a real Lighthouse run and a real mid-range Android — neither is available in
this environment, and estimating them would be guessing.

**S12's day counter is computed at build time** and drifts one day per day between deploys.
Phase 5 should recompute it client-side.

**Client logo artwork has not been supplied.** S9 renders wordmarks in the display face; the
rail structure will not change when files arrive.

**Photography has not been supplied.** Photo slots render as labelled navy placeholders at the
correct aspect ratio. Set `src` on the slot in `site.ts` to swap one in — one line per slot.
