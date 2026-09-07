/**
 * THE RED LINE — shared geometry and state.
 *
 * One continuous red line runs the entire length of the page. It is the
 * through-line of the whole story and it never breaks; it only transforms.
 *
 * ── How continuity is guaranteed ──────────────────────────────────────────
 *
 * The line is not one enormous DOM path — a single page-height path cannot stay
 * glued to sections that grow and reflow independently. Instead each section
 * owns one segment, and continuity is enforced by contract:
 *
 *     segment[i].exitX  MUST EQUAL  segment[i + 1].entryX
 *
 * `assertContinuity()` checks this — and checks that each segment's declared
 * entry/exit actually match its own first and last waypoint — then throws in
 * development. Change a path without changing its neighbour's hand-off and the
 * build tells you.
 *
 * ── Why waypoints instead of hand-written path strings ────────────────────
 *
 * The obvious approach is a normalised 100×100 viewBox stretched to each
 * section with `preserveAspectRatio="none"`. It does not work, for two reasons
 * that only show up once the line is on screen:
 *
 *   1. Non-uniform scale distorts every curve. Section heights vary widely,
 *      to 600vh, so a corner authored as a quarter-circle renders as a smeared
 *      ellipse in the tall ones. On a site whose whole claim is precision, that
 *      is the wrong kind of wrong.
 *   2. Dash-based drawing breaks. `vector-effect="non-scaling-stroke"` is the
 *      only way to hold stroke weight constant under that scale, but it makes
 *      the browser evaluate stroke-dasharray in SCREEN space while
 *      `getTotalLength()` reports USER units. Set dasharray from getTotalLength
 *      and you get a repeating dash pattern instead of a line being drawn.
 *      `pathLength` normalisation does not rescue it.
 *
 * So segments are stored as normalised waypoints (0–1 of the section box) and
 * the `d` string is generated in real pixels from the section's measured size.
 * Positions stay responsive, corner radii stay circular at any section height,
 * the viewBox maps 1:1 to CSS pixels, and `getTotalLength()` returns exactly the
 * number the dash animation needs.
 *
 * ── What each phase owns ──────────────────────────────────────────────────
 *
 * Each segment declares a SPINE: one continuous route with correct entry/exit
 * geometry, drawn by stroke-dashoffset. A segment may also declare a measured
 * elaboration of that spine — branching into the four statistics, coiling
 * through the values grid, becoming the timeline's rail. Those must preserve
 * `entryX` and `exitX`; `assertContinuity()` catches it when they do not.
 */

/** The one red. Structural only — the line, key numerals, rules and CTAs. */
export const RED = '#E23327';

/** Stroke width in CSS pixels. Exact, because the viewBox is in CSS pixels. */
export const STROKE_WIDTH = 2;

/** Heavier stroke for the sections where the line is a pipe or a cable. */
export const STROKE_WIDTH_HEAVY = 3;

/** Corner radius in CSS pixels, clamped to fit short runs. */
export const CORNER_RADIUS = 32;

export type SegmentId =
  | 'hero'
  | 'glance'
  | 'journey'
  | 'map'
  | 'values'
  | 'mission-vision'
  | 'leadership'
  | 'capabilities'
  | 'clients'
  | 'track-record'
  | 'quality'
  | 'safety'
  | 'contact';

/**
 * A waypoint in normalised section space: x and y both run 0 → 1, left → right
 * and top → bottom of the section box.
 */
export type PointNode = { kind: 'point'; x: number; y: number };

/**
 * A closed ring the line draws through — S12's zero. `radius` is a fraction of
 * the section's SHORTER side, so the zero stays circular rather than becoming an
 * oval on a wide viewport.
 */
export type RingNode = { kind: 'ring'; cx: number; cy: number; radius: number };

export type LineNode = PointNode | RingNode;

const p = (x: number, y: number): PointNode => ({ kind: 'point', x, y });

/**
 * One drawable stroke within a segment.
 *
 * Most segments are a single strand — the spine. Sections where the line forks
 * (S2's four branches, S8's six valve drops) declare several, each with a
 * stable `id` so a section's master timeline can sequence them by name.
 *
 * A fork is not a break: the strands meet at shared points, so the eye reads one
 * continuous line that divides and rejoins.
 */
export type LineStrand = {
  id: string;
  nodes: LineNode[];
  heavy?: boolean;
};

/**
 * What a strand builder gets to measure against. `section` is the element the
 * line is drawn into, which is how a fork can land exactly on the content it
 * points at rather than on a guessed fraction of the width.
 */
export type StrandContext = {
  width: number;
  height: number;
  section: HTMLElement | null;
  host: HTMLElement;
};

/**
 * Elaborates a segment's spine into multiple strands using live measurements.
 *
 * Builders run in the browser after layout. They MUST start at the segment's
 * `entryX` and end at its `exitX` — the static `nodes` spine remains the
 * canonical contract that `assertContinuity()` checks at build time, and a
 * builder that cannot measure what it needs should fall back to that spine.
 */
export type StrandBuilder = (ctx: StrandContext) => LineStrand[];

export type LineSegment = {
  id: SegmentId;
  /** x where the line enters at the top of this section (0–1). */
  entryX: number;
  /** x where the line leaves at the bottom of this section (0–1). */
  exitX: number;
  /**
   * The canonical spine. Always present, always the thing the continuity
   * contract is checked against, and the fallback when a builder cannot run.
   */
  nodes: LineNode[];
  /** Optional measured elaboration of the spine. See StrandBuilder. */
  strands?: StrandBuilder;
  /** What the line becomes here — brief §2. Documentation, not behaviour. */
  becomes: string;
  /** Heavier stroke where the line reads as a pipe, cable or manifold. */
  heavy?: boolean;
  /** The line is born here rather than arriving from the section above. */
  origin?: boolean;
  /** The line terminates here — the loop closes. */
  terminal?: boolean;
};

/* ------------------------------------------------------------------ */
/* S2 — the four-way split                                             */
/* ------------------------------------------------------------------ */

/** Below this horizontal spread the stats are stacked, so there is no fork. */
const MIN_FORK_SPREAD = 0.3;

/** Tolerance, as a fraction of section height, for "on the same row". */
const SAME_ROW_TOLERANCE = 0.04;

/**
 * S2's line: drops in, forks to the four statistics, then rejoins below them.
 *
 * Branch endpoints are measured off the numerals themselves (`[data-stat-anchor]`)
 * rather than assumed from the grid, because the shell's max-width means column
 * centres move with the viewport — a fixed fraction lands correctly at exactly
 * one window size.
 *
 * The fork is a desktop composition. When the stats wrap to two rows or stack
 * into one column, there is nothing to fan across and this returns the spine.
 */
export const glanceStrands: StrandBuilder = ({ width, height, section, host }) => {
  if (!section || width <= 0 || height <= 0) return [];

  const anchors = Array.from(
    section.querySelectorAll<HTMLElement>('[data-stat-anchor]'),
  );
  if (anchors.length < 2) return [];

  const hostRect = host.getBoundingClientRect();

  /**
   * Branch x comes from the numeral, so a branch points at the figure. The
   * REJOIN point comes from the whole stat block — numeral, label and sub —
   * because a fork that closes level with the numeral drags its diagonals
   * straight through the label text underneath.
   */
  const cols = anchors.map((el) => {
    const r = el.getBoundingClientRect();
    const block = el.closest('[data-stat-block]') ?? el;
    const br = block.getBoundingClientRect();
    return {
      x: (r.left - hostRect.left + r.width / 2) / width,
      top: (r.top - hostRect.top) / height,
      bottom: (br.bottom - hostRect.top) / height,
    };
  });

  const xs = cols.map((c) => c.x);
  const tops = cols.map((c) => c.top);

  const spread = Math.max(...xs) - Math.min(...xs);
  const rowSpread = Math.max(...tops) - Math.min(...tops);

  // Stacked or wrapped: no fork to draw.
  if (spread < MIN_FORK_SPREAD || rowSpread > SAME_ROW_TOLERANCE) return [];

  const reachY = Math.min(...tops) - 0.015;
  const returnY = Math.max(...cols.map((c) => c.bottom)) + 0.025;

  // The fork opens well above the numerals, so the diagonals read as takeoffs
  // rather than as an underline.
  const splitY = Math.max(0.05, reachY - 0.14);

  /**
   * The branches gather into a horizontal collector rather than fanning back to
   * centre on long diagonals. Diagonals wide enough to reach the outer columns
   * are also wide enough to drag straight through the sectors and clients copy
   * below — the collector sits in the gap above it and crosses nothing.
   *
   * Its position is measured off that block, so it stays correct as the copy
   * changes rather than being a tuned constant that silently goes stale.
   */
  const footer = section.querySelector<HTMLElement>('[data-glance-footer]');
  const footerTop = footer
    ? (footer.getBoundingClientRect().top - hostRect.top) / height
    : returnY + 0.08;
  const collectorY = Math.max(returnY + 0.02, footerTop - 0.035);

  if (splitY >= reachY || collectorY >= 0.98) return [];

  const xs2 = cols.map((c) => c.x);

  const strands: LineStrand[] = [
    { id: 'trunk-in', nodes: [p(0.5, 0), p(0.5, splitY)] },
  ];

  // Out: diagonal takeoff from the split, then straight down to the numeral.
  cols.forEach((c, i) => {
    strands.push({
      id: `out-${i}`,
      nodes: [p(0.5, splitY), p(c.x, splitY + (reachY - splitY) * 0.6), p(c.x, reachY)],
    });
  });

  // In: a straight drop from under each stat to the collector.
  cols.forEach((c, i) => {
    strands.push({ id: `in-${i}`, nodes: [p(c.x, returnY), p(c.x, collectorY)] });
  });

  // The collector, then one line onward.
  strands.push({
    id: 'collector',
    nodes: [p(Math.min(...xs2), collectorY), p(Math.max(...xs2), collectorY)],
  });
  strands.push({ id: 'trunk-out', nodes: [p(0.5, collectorY), p(0.5, 1)] });

  return strands;
};

/* ------------------------------------------------------------------ */
/* S3 — the line becomes the ground                                    */
/* ------------------------------------------------------------------ */

/**
 * Where the horizon sits in the pinned viewport, as a fraction of its height.
 * Shared with S3Journey so the ground line, the structures' baseline and the
 * red line's stubs all land on the same horizon.
 */
export const JOURNEY_GROUND_Y = 0.72;

/**
 * S3's line: it becomes the timeline's rail.
 *
 * The section is a vertical list of fourteen dated milestones, and the line runs
 * down the left of that list so each milestone's top rule meets it as a tick.
 *
 * The rail's x is MEASURED off the list element rather than guessed, because the
 * list is padded away from the line by a fixed amount in CSS. If this used a
 * fraction instead, one change to that padding would silently put the line
 * through the middle of the years. Measuring means the two cannot disagree.
 *
 * It enters and leaves at the centre — `entryX`/`exitX` are 0.5 and the segments
 * above and below meet it there — so the excursion to the left and back is part
 * of the strand, not a break in the line.
 */
export const journeyStrands: StrandBuilder = ({ width, height, section, host }) => {
  if (!section || width < 768 || height <= 0) return [];

  const list = section.querySelector<HTMLElement>('[data-journey-rail]');
  if (!list) return [];

  const hostRect = host.getBoundingClientRect();
  const railX = (list.getBoundingClientRect().left - hostRect.left) / width;
  // A rail outside the middle band means an unexpected layout; take the spine.
  if (!(railX > 0.02 && railX < 0.45)) return [];

  const top = (list.getBoundingClientRect().top - hostRect.top) / height;
  const enter = Math.min(Math.max(top, 0.06), 0.4);

  // Right-angle elbows, not a diagonal. Everywhere else on this page the line
  // reads as pipework or conduit; a long swooping diagonal reads as decoration
  // and belongs to a different site.
  return [
    {
      id: 'rail',
      heavy: true,
      nodes: [
        p(0.5, 0),
        p(0.5, enter),
        p(railX, enter),
        p(railX, 0.95),
        p(0.5, 0.95),
        p(0.5, 1),
      ],
    },
  ];
};

/* ------------------------------------------------------------------ */
/* S5 — the line coils into the values grid                            */
/* ------------------------------------------------------------------ */

/**
 * S5's line: down one side, along the grid's own row gutter, and away.
 *
 * The horizontal run is placed on the measured gutter between the two rows of
 * cards rather than at a guessed fraction, so it reads as the line threading
 * through the grid instead of crossing it. If the grid collapses to a single
 * column there is no row gutter to thread and this declines.
 *
 * Deliberately simple: this section is the brief's pacing relief and the line
 * should be doing the least work it does anywhere.
 */
export const valuesStrands: StrandBuilder = ({ width, height, section, host }) => {
  if (!section || width < 768 || height <= 0) return [];

  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-value-card]'));
  if (cards.length < 4) return [];

  const hostRect = host.getBoundingClientRect();
  const tops = cards.map((c) => c.getBoundingClientRect().top);
  const firstRowTop = Math.min(...tops);
  const secondRowTop = Math.min(...tops.filter((t) => t > firstRowTop + 8));
  if (!Number.isFinite(secondRowTop)) return [];

  // The gutter sits between the bottom of row one and the top of row two.
  const firstRowBottom = Math.max(
    ...cards
      .filter((c) => c.getBoundingClientRect().top < firstRowTop + 8)
      .map((c) => c.getBoundingClientRect().bottom),
  );
  const gutterY = ((firstRowBottom + secondRowTop) / 2 - hostRect.top) / height;
  if (gutterY <= 0.05 || gutterY >= 0.95) return [];

  return [{ id: 'coil', nodes: [p(0.72, 0), p(0.72, gutterY), p(0.28, gutterY), p(0.28, 1)] }];
};

/* ------------------------------------------------------------------ */
/* S4 — the line reaches the head office                               */
/* ------------------------------------------------------------------ */

/**
 * S4's line: down the centre, across to the HQ marker on the map, then away.
 *
 * The junction is measured off the marker itself (`[data-hq]`) rather than
 * assumed, because the map is centred in its column and its position moves with
 * the viewport. The three routes that fan out from the HQ are drawn inside the
 * map's own SVG, not here — they have to sit in the map's coordinate space to
 * land on the provincial pins.
 *
 * Declines below the breakpoint, where the map sits under the text rather than
 * beside it and there is no sensible lateral run to make.
 */
export const mapStrands: StrandBuilder = ({ width, height, section, host }) => {
  if (!section || width < 768 || height <= 0) return [];

  const svg = section.querySelector<SVGSVGElement>('[data-map-svg]');
  const point = svg?.dataset.hqPoint?.split(/\s+/).map(Number);
  if (!svg || !point || point.length !== 2 || point.some((n) => !Number.isFinite(n))) return [];

  /**
   * Resolved through the SVG's own coordinate system, NOT by measuring the
   * marker element. The section's build sets that marker to scale 0 in a layout
   * effect, which runs before this measure pass — a zero-size rect would make
   * this decline and silently fall back to the spine.
   */
  const ctm = svg.getScreenCTM();
  if (!ctm) return [];
  const pt = svg.createSVGPoint();
  [pt.x, pt.y] = point;
  const screen = pt.matrixTransform(ctm);

  const hostRect = host.getBoundingClientRect();
  const hqX = (screen.x - hostRect.left) / width;
  const hqY = (screen.y - hostRect.top) / height;

  // Only worth routing to if the marker is somewhere sane inside the frame.
  if (hqX < 0.15 || hqX > 0.95 || hqY < 0.12 || hqY > 0.88) return [];

  return [
    { id: 'entry', nodes: [p(0.5, 0), p(0.5, hqY), p(hqX, hqY)] },
    { id: 'exit', nodes: [p(hqX, hqY), p(0.72, hqY), p(0.72, 1)] },
  ];
};

/* ------------------------------------------------------------------ */
/* S12 — the line closes into the zero                                 */
/* ------------------------------------------------------------------ */

/**
 * S12's line: down the centre, around one enormous closed ring, and away.
 *
 * On the pinned desktop composition everything else is cleared out, so the ring
 * grows to occupy most of the frame — the brief's giant 0. The stacked mobile
 * version keeps the smaller ring from the spine, where it shares the frame with
 * the copy.
 *
 * The retrace that lets a closed ring still be one continuous stroke is in
 * `buildPath`; see the ring branch there.
 */
export const safetyStrands: StrandBuilder = ({ width }) => {
  if (width < 768) return [];
  return [
    {
      id: 'zero',
      nodes: [p(0.5, 0), { kind: 'ring', cx: 0.5, cy: 0.44, radius: 0.3 }, p(0.5, 1)],
      heavy: true,
    },
  ];
};

/* ------------------------------------------------------------------ */
/* S8 — the line becomes a manifold                                    */
/* ------------------------------------------------------------------ */

/**
 * Where the header pipe runs, as a fraction of the pinned viewport's height.
 * Set below the section heading — at 0.2 the pipe cut straight through it.
 */
export const MANIFOLD_HEADER_Y = 0.25;

/** How far the valve branches drop below the header before reaching the stage. */
export const MANIFOLD_DROP_Y = 0.35;

/** Six valves, evenly spread along the header's run. */
export const MANIFOLD_VALVE_X = [0.185, 0.315, 0.445, 0.575, 0.705, 0.835];

/**
 * S8's line: a riser down the outside of the six services.
 *
 * This was a header pipe with six valves, each branch charging as its service
 * came up. That only worked while the six panels were stacked in one pinned
 * frame and revealed one at a time. They are now an ordinary list down the page,
 * so a manifold has nothing to feed: the line runs down beside them instead and
 * returns to centre to hand off to S9.
 */
export const capabilitiesStrands: StrandBuilder = ({ width }) => {
  if (width < 768) return [];
  return [
    {
      id: 'riser',
      heavy: true,
      // Elbows rather than diagonals — see journeyStrands for why.
      nodes: [p(0.5, 0), p(0.5, 0.05), p(0.08, 0.05), p(0.08, 0.95), p(0.5, 0.95), p(0.5, 1)],
    },
  ];
};

/* ------------------------------------------------------------------ */
/* S13 — the line becomes the mark                                     */
/* ------------------------------------------------------------------ */

/** Where the falcon's apex sits in the pinned frame. */
export const CONTACT_MARK_Y = 0.16;

/**
 * S13's line: rises from S12 and stops at the falcon's apex, where the mark
 * takes over and redraws itself. The line does not continue past it — this is
 * the terminal segment, and the loop closes on the logo.
 */
export const contactStrands: StrandBuilder = ({ width }) => {
  if (width < 768) return [];
  return [{ id: 'rise', nodes: [p(0.5, 0), p(0.5, CONTACT_MARK_Y)], heavy: true }];
};

/**
 * The fourteen states of the line, in page order.
 *
 * Read the entry/exit pairs down the list: each exit matches the next entry.
 * The lateral drift through map → values → mission → leadership is deliberate.
 * A line that only ever runs down the centre reads as a divider rule, not as a
 * route being travelled.
 */
export const SEGMENTS: LineSegment[] = [
  {
    id: 'hero',
    entryX: 0.5,
    exitX: 0.5,
    origin: true,
    becomes: 'A blueprint construction line drawing a plant',
    // Born at the base of the structure, descends toward S2.
    nodes: [p(0.5, 0.58), p(0.5, 1)],
  },
  {
    id: 'glance',
    entryX: 0.5,
    exitX: 0.5,
    becomes: 'Splits into 4 branches, one per statistic',
    // Spine is the fallback for stacked/wrapped layouts; glanceStrands forks it
    // across the four numerals when they sit on one row.
    nodes: [p(0.5, 0), p(0.5, 1)],
    strands: glanceStrands,
  },
  {
    id: 'journey',
    entryX: 0.5,
    exitX: 0.5,
    heavy: true,
    becomes: 'The ground/pipeline the camera travels along through time',
    // Spine is the mobile fallback: a plain vertical run down the stacked
    // milestones. journeyStrands replaces it with entry/exit stubs on desktop,
    // where the long horizontal ground lives inside the moving world instead.
    nodes: [p(0.5, 0), p(0.5, 1)],
    strands: journeyStrands,
  },
  {
    id: 'map',
    entryX: 0.5,
    exitX: 0.72,
    becomes: 'The route across Pakistan, shooting out to each province',
    // Spine is the mobile fallback; mapStrands routes it through the measured
    // HQ marker on desktop.
    nodes: [p(0.5, 0), p(0.5, 0.38), p(0.72, 0.38), p(0.72, 1)],
    strands: mapStrands,
  },
  {
    id: 'values',
    entryX: 0.72,
    exitX: 0.28,
    becomes: 'Coils into an 8-cell grid',
    // Runs the grid gutter across and settles on the left. valuesStrands puts
    // the horizontal run on the grid's real row gutter.
    nodes: [p(0.72, 0), p(0.72, 0.32), p(0.28, 0.32), p(0.28, 1)],
    strands: valuesStrands,
  },
  {
    id: 'mission-vision',
    entryX: 0.28,
    exitX: 0.5,
    becomes: 'Forks into two, then reconverges',
    nodes: [p(0.28, 0), p(0.28, 0.4), p(0.5, 0.4), p(0.5, 1)],
  },
  {
    id: 'leadership',
    entryX: 0.5,
    exitX: 0.08,
    becomes: 'A single vertical spine down the org',
    // Ends hard left so the manifold header below can run the full width in one
    // stroke instead of doubling back over itself.
    nodes: [p(0.5, 0), p(0.5, 0.48), p(0.08, 0.48), p(0.08, 1)],
  },
  {
    id: 'capabilities',
    entryX: 0.08,
    exitX: 0.5,
    heavy: true,
    becomes: 'A manifold header pipe with 6 valves feeding 6 services',
    // Spine is the mobile fallback. capabilitiesStrands splits it into the
    // header, six valve branches and the outgoing trunk on desktop.
    nodes: [
      p(0.08, 0),
      p(0.08, MANIFOLD_HEADER_Y),
      p(0.92, MANIFOLD_HEADER_Y),
      p(0.92, 0.92),
      p(0.5, 0.92),
      p(0.5, 1),
    ],
    strands: capabilitiesStrands,
  },
  {
    id: 'clients',
    entryX: 0.5,
    exitX: 0.5,
    becomes: 'Flattens into rails carrying logos',
    /*
     * The descent used to run down the centre from y=0 to y=0.26 and then cut
     * left along y=0.26. Measured, the header block occupies y 0.18-0.43 at
     * x 0.09-0.72 — so BOTH of those went straight through the headline, which
     * read as a line scribbled over the text rather than threaded behind it.
     *
     * It now steps out to the left gutter inside the section's top padding,
     * above the heading entirely, and only comes back across at y=0.5, which is
     * the logo rail it is supposed to be carrying.
     */
    nodes: [
      p(0.5, 0),
      p(0.5, 0.1),
      p(0.02, 0.1),
      p(0.02, 0.5),
      p(0.98, 0.5),
      p(0.98, 0.78),
      p(0.5, 0.78),
      p(0.5, 1),
    ],
  },
  {
    id: 'track-record',
    entryX: 0.5,
    exitX: 0.5,
    becomes: 'The timeline axis of the project index',
    // The long vertical at x=0.1 is the index's timeline axis.
    nodes: [p(0.5, 0), p(0.5, 0.24), p(0.1, 0.24), p(0.1, 0.9), p(0.5, 0.9), p(0.5, 1)],
  },
  {
    id: 'quality',
    entryX: 0.5,
    exitX: 0.5,
    becomes: 'A clean route down the outside of the certifications',
    /*
     * This was a checkmark: three short diagonals between y 0.18 and 0.42. It
     * did not read as one. Each leg was under 200px while the corner radius is
     * a fixed 32px, so the rounding ate most of every segment and what rendered
     * was a wobble — and it sat on x 0.42-0.72, y 0.18-0.42, directly over the
     * measured intro paragraph at x 0.09-0.63, y 0.26-0.38.
     *
     * A shape that needs explaining is not working. This is the same clean
     * gutter route the project index uses, which is the one on this page that
     * reads correctly.
     */
    nodes: [
      p(0.5, 0),
      p(0.5, 0.1),
      p(0.04, 0.1),
      p(0.04, 0.88),
      p(0.5, 0.88),
      p(0.5, 1),
    ],
  },
  {
    id: 'safety',
    entryX: 0.5,
    exitX: 0.5,
    becomes: 'Curves and closes into a giant 0',
    // Spine is the stacked mobile version, where the ring shares the frame with
    // the copy. safetyStrands grows it to fill the pinned desktop frame.
    nodes: [
      p(0.5, 0),
      { kind: 'ring', cx: 0.5, cy: 0.38, radius: 0.26 },
      p(0.5, 1),
    ],
    strands: safetyStrands,
  },
  {
    id: 'contact',
    entryX: 0.5,
    exitX: 0.5,
    terminal: true,
    becomes: 'Rises and redraws itself into the Falcon logo — the loop closes',
    // Spine is the mobile fallback; contactStrands stops the line at the mark's
    // apex on desktop, where the falcon takes over.
    nodes: [p(0.5, 0), p(0.5, 0.62)],
    strands: contactStrands,
  },
];

export const SEGMENT_BY_ID = new Map<SegmentId, LineSegment>(
  SEGMENTS.map((segment) => [segment.id, segment]),
);

export function getSegment(id: SegmentId): LineSegment {
  const segment = SEGMENT_BY_ID.get(id);
  if (!segment) throw new Error(`[redline] no segment registered for "${id}"`);
  return segment;
}

/* ------------------------------------------------------------------ */
/* Path generation                                                     */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number };

const dist = (a: Pt, b: Pt): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Point at distance `d` from `from`, travelling toward `to`. */
function along(from: Pt, to: Pt, d: number): Pt {
  const len = dist(from, to);
  if (len === 0) return { ...from };
  const t = Math.min(1, d / len);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

/**
 * Generates the segment's `d` string in CSS pixels for a section measured at
 * `width` × `height`.
 *
 * Corners are rounded with a real circular radius (clamped so it can never eat
 * more than half of either adjacent run), which is the whole reason this is
 * generated rather than authored — a fixed radius survives a section being
 * 100vh or 600vh tall.
 */
export function buildPath(
  nodes: LineNode[],
  width: number,
  height: number,
  radius: number = CORNER_RADIUS,
): string {
  if (width <= 0 || height <= 0) return '';

  const minSide = Math.min(width, height);

  // Resolve every node to pixels first. A ring contributes its top and bottom
  // as the points the straight runs connect to.
  type Resolved =
    | { kind: 'point'; pt: Pt }
    | { kind: 'ring'; top: Pt; bottom: Pt; r: number };

  const resolved: Resolved[] = nodes.map((node) => {
    if (node.kind === 'ring') {
      const r = node.radius * minSide;
      const cx = node.cx * width;
      const cy = node.cy * height;
      return {
        kind: 'ring',
        top: { x: cx, y: cy - r },
        bottom: { x: cx, y: cy + r },
        r,
      };
    }
    return { kind: 'point', pt: { x: node.x * width, y: node.y * height } };
  });

  // Flatten to the sequence of anchor points, remembering where rings sit.
  const anchors: Pt[] = [];
  const ringAt = new Map<number, { r: number }>();

  resolved.forEach((node) => {
    if (node.kind === 'ring') {
      anchors.push(node.top);
      // The ring is traversed between its top and bottom anchors.
      ringAt.set(anchors.length - 1, { r: node.r });
      anchors.push(node.bottom);
    } else {
      anchors.push(node.pt);
    }
  });

  if (anchors.length < 2) return '';

  let d = `M ${fmt(anchors[0].x)} ${fmt(anchors[0].y)}`;

  for (let i = 1; i < anchors.length; i += 1) {
    const ring = ringAt.get(i - 1);

    if (ring) {
      /**
       * Four commands, one unbroken stroke:
       *   1. right semicircle, top → bottom
       *   2. left semicircle, bottom → top — the zero is now closed
       *   3. left semicircle again, top → bottom, retracing exactly over itself
       *      so the pen can leave from the BOTTOM of the ring
       *
       * Step 3 is invisible — identical geometry, identical stroke. It is what
       * lets the zero be a closed ring AND the line stay a single path.
       */
      const top = anchors[i - 1];
      const bottom = anchors[i];
      const r = fmt(ring.r);
      d += ` A ${r} ${r} 0 0 1 ${fmt(bottom.x)} ${fmt(bottom.y)}`;
      d += ` A ${r} ${r} 0 0 1 ${fmt(top.x)} ${fmt(top.y)}`;
      d += ` A ${r} ${r} 0 0 0 ${fmt(bottom.x)} ${fmt(bottom.y)}`;
      continue;
    }

    const isLast = i === anchors.length - 1;
    const corner = anchors[i];

    // The final anchor, and any anchor immediately before a ring, is a plain
    // line-to: there is no outgoing straight run to round against.
    if (isLast || ringAt.has(i)) {
      d += ` L ${fmt(corner.x)} ${fmt(corner.y)}`;
      continue;
    }

    const prev = anchors[i - 1];
    const next = anchors[i + 1];

    const r = Math.min(radius, dist(prev, corner) / 2, dist(corner, next) / 2);

    if (r < 0.5) {
      d += ` L ${fmt(corner.x)} ${fmt(corner.y)}`;
      continue;
    }

    const a = along(corner, prev, r);
    const b = along(corner, next, r);

    d += ` L ${fmt(a.x)} ${fmt(a.y)}`;
    d += ` Q ${fmt(corner.x)} ${fmt(corner.y)} ${fmt(b.x)} ${fmt(b.y)}`;
  }

  return d;
}

/* ------------------------------------------------------------------ */
/* Strand resolution                                                   */
/* ------------------------------------------------------------------ */

/**
 * Resolves a segment to its drawable strands.
 *
 * Falls back to the canonical spine whenever there is no builder, or the
 * builder declines (returns nothing usable) because the layout it needs is not
 * there — a stacked mobile grid, for instance, has no four-column fork to point
 * at, and the honest answer is the plain spine.
 */
/**
 * Where the line runs on a narrow screen: a left gutter, clear of the copy.
 *
 * On desktop the line threads between and around content. On a phone every
 * section is one stacked column, so a line at the declared entry x — 0.5 for
 * most segments — runs straight down the middle of the text. It renders behind
 * the words and stays legible, but it reads as a mistake.
 *
 * Every segment uses the SAME gutter below the breakpoint, so the hand-off from
 * one section to the next is trivially continuous. The desktop entry/exit values
 * still govern the desktop composition and are what `assertContinuity` checks.
 */
const MOBILE_GUTTER_X = 0.055;

function mobileSpine(segment: LineSegment): LineStrand[] {
  // The hero still births the line partway down; contact still terminates on
  // the mark. Everything else runs the full height of its section.
  const from = segment.origin ? 0.58 : 0;
  const to = segment.terminal ? 0.62 : 1;
  return [
    {
      id: 'spine',
      nodes: [p(MOBILE_GUTTER_X, from), p(MOBILE_GUTTER_X, to)],
      heavy: segment.heavy,
    },
  ];
}

export function resolveStrands(segment: LineSegment, ctx: StrandContext): LineStrand[] {
  if (ctx.width > 0 && ctx.width < 768) return mobileSpine(segment);

  const spine: LineStrand[] = [
    { id: 'spine', nodes: segment.nodes, heavy: segment.heavy },
  ];

  if (!segment.strands) return spine;

  try {
    const built = segment.strands(ctx);
    return built.length > 0 ? built : spine;
  } catch {
    // A measurement failure must never take the line off the page.
    return spine;
  }
}

/* ------------------------------------------------------------------ */
/* DOM helpers                                                         */
/* ------------------------------------------------------------------ */

/**
 * Every strand declares `pathLength={DASH_UNITS}`, so dash maths is in a fixed
 * synthetic unit rather than in measured pixels.
 *
 * This is what keeps the animation independent of layout. Reading
 * `getTotalLength()` and baking it into a tween means every resize — including
 * the one ScrollTrigger itself causes when it pins a section — invalidates the
 * timeline, and rebuilding the timeline re-pins, which resizes again. That loop
 * is not theoretical; it tore the page apart the first time this was wired up.
 *
 * With a declared pathLength the numbers never change, so a section's timeline
 * survives any amount of resizing and only has to be rebuilt when the set of
 * strands itself changes shape.
 *
 * 100 rather than 1: some engines have been unreliable with sub-unit dash
 * values, and there is nothing to gain from the smaller number.
 */
export const DASH_UNITS = 100;

/**
 * Puts a strand in its undrawn state.
 *
 * Plain style writes rather than gsap.set so this can live in the shared module
 * without pulling the animation runtime into anything that imports it.
 */
export function hideStrand(path: SVGPathElement): void {
  path.style.strokeDasharray = String(DASH_UNITS);
  path.style.strokeDashoffset = String(DASH_UNITS);
}

/** Draws a strand fully and drops the dash entirely. The resting state. */
export function revealStrand(path: SVGPathElement): void {
  path.style.strokeDasharray = 'none';
  path.style.strokeDashoffset = '0';
  path.style.willChange = 'auto';
}

/* ------------------------------------------------------------------ */
/* Continuity contract                                                 */
/* ------------------------------------------------------------------ */

const EPSILON = 1e-6;

/**
 * The line must exit the bottom of one section at the same x it enters the
 * next — brief §2, "Do not lose the line between sections."
 *
 * Also verifies each segment's declared entry/exit against its own first and
 * last waypoint, so the declaration cannot silently drift from the geometry.
 *
 * Returns the breaks rather than throwing, so callers choose how loud to be.
 */
export function findContinuityBreaks(segments: LineSegment[] = SEGMENTS): string[] {
  const breaks: string[] = [];

  const edgeX = (segment: LineSegment, edge: 'first' | 'last'): number | null => {
    const node = edge === 'first' ? segment.nodes[0] : segment.nodes[segment.nodes.length - 1];
    if (!node) return null;
    return node.kind === 'ring' ? node.cx : node.x;
  };

  segments.forEach((segment) => {
    const first = edgeX(segment, 'first');
    const last = edgeX(segment, 'last');

    if (first !== null && Math.abs(first - segment.entryX) > EPSILON) {
      breaks.push(
        `"${segment.id}" declares entryX=${segment.entryX} but its first waypoint ` +
          `is at x=${first}.`,
      );
    }
    if (last !== null && Math.abs(last - segment.exitX) > EPSILON) {
      breaks.push(
        `"${segment.id}" declares exitX=${segment.exitX} but its last waypoint ` +
          `is at x=${last}.`,
      );
    }
  });

  for (let i = 0; i < segments.length - 1; i += 1) {
    const current = segments[i];
    const next = segments[i + 1];
    if (Math.abs(current.exitX - next.entryX) > EPSILON) {
      breaks.push(
        `"${current.id}" exits at x=${current.exitX} but "${next.id}" enters at ` +
          `x=${next.entryX}. The red line would visibly jump between them.`,
      );
    }
  }

  const first = segments[0];
  if (first && !first.origin) {
    breaks.push(`"${first.id}" is the first segment but is not marked origin.`);
  }

  const last = segments[segments.length - 1];
  if (last && !last.terminal) {
    breaks.push(`"${last.id}" is the last segment but is not marked terminal.`);
  }

  return breaks;
}

/** Throws on any break. Called once from the page in development. */
export function assertContinuity(segments: LineSegment[] = SEGMENTS): void {
  const breaks = findContinuityBreaks(segments);
  if (breaks.length > 0) {
    throw new Error(
      `[redline] the red line is broken in ${breaks.length} place(s):\n  - ` +
        breaks.join('\n  - '),
    );
  }
}

