/**
 * FalconMark — the logo, as vector, for S13's closing redraw.
 *
 * Traced from `/public/assets/falcon-logo.png`: two swept wings forming a wide
 * downward chevron with feather notches along their undersides, a rounded body
 * dome between them, and FALCON INTERNATIONAL arced above.
 *
 * Vector rather than the PNG because the brief has the red line REDRAW itself
 * into this mark — the wing geometry has to be animatable. It also happens to be
 * ~2KB against the PNG's 1.26MB, which is the other reason to trace it.
 *
 * ── Parts, in the order the brief reveals them ────────────────────────────
 *
 *   [data-falcon-body]   the central dome
 *   [data-falcon-wing]   left then right, sweeping outward from the centre
 *   [data-falcon-word]   the arced wordmark
 *
 * Wings sweep from their INNER edge outward, so `transform-origin` is set per
 * side by the section rather than in the markup.
 *
 * Decorative: the company name is already in the nav, the footer and the page
 * title, so this carries aria-hidden rather than repeating it a fourth time.
 */

export const FALCON_VIEWBOX = { width: 400, height: 240 } as const;

/** Where the body dome's apex sits, for the line to arrive at. */
export const FALCON_APEX = { x: 200, y: 48 } as const;

/**
 * The dome AND the wedge below it, down to the point where the wings meet.
 * Stopping the body at its own baseline leaves a V-shaped notch bitten out of
 * the middle of the mark, because the wings converge below that line.
 */
const BODY =
  'M150 116C150 70 172 48 200 48C228 48 250 70 250 116L250 150L200 216L150 150Z';

/** Left wing: top edge out to the tip, in to the point, back along the feathers. */
const WING_LEFT =
  'M16 116L150 116L200 216L172 201L158 201L136 181L122 181L99 161L85 161L62 141L48 141Z';

/** Mirrored about x = 200. */
const WING_RIGHT =
  'M384 116L250 116L200 216L228 201L242 201L264 181L278 181L301 161L315 161L338 141L352 141Z';

export function FalconMark({
  className,
  wordmark = true,
}: {
  className?: string;
  /** The nav uses the glyph alone; the wordmark would be illegible at 36px. */
  wordmark?: boolean;
}) {
  return (
    <svg
      className={`overflow-visible ${className ?? ''}`}
      viewBox={wordmark ? `0 0 ${FALCON_VIEWBOX.width} ${FALCON_VIEWBOX.height}` : "8 40 384 184"}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/*
          The wordmark's baseline. Never stroked — it exists to carry text.
          A quadratic rather than an elliptical arc: with `A` the sweep flag
          decides which way the curve bulges, and the wrong one sends the text
          off the side of the mark instead of over the top of it. A control point
          above the endpoints is unambiguous.
        */}
        <path id="falcon-arc" d="M46 104Q200 -18 354 104" />
      </defs>

      <g fill="#E23327">
        <path data-falcon-body d={BODY} />
        <path data-falcon-wing data-side="left" d={WING_LEFT} />
        <path data-falcon-wing data-side="right" d={WING_RIGHT} />
      </g>

      {wordmark ? (
      <text
        data-falcon-word
        fill="#FFFFFF"
        fillOpacity="0.82"
        fontSize="21"
        letterSpacing="2.6"
        style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontWeight: 700 }}
      >
        <textPath href="#falcon-arc" startOffset="50%" textAnchor="middle">
          FALCON INTERNATIONAL
        </textPath>
      </text>
      ) : null}
    </svg>
  );
}
