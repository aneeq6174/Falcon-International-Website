import { DASH_UNITS } from '@/lib/redline';

/**
 * PlantScene — the industrial plant that constructs itself behind the hero.
 *
 * Hand-authored inline SVG line art, per brief §4: no PNG sequences, no 3D. The
 * whole scene is a few kilobytes of vector and every part is individually
 * animatable, which is what lets S1 build it in stages.
 *
 * ── Structure ─────────────────────────────────────────────────────────────
 *
 * Two stacked drawings of the same plant:
 *
 *   [data-plant-fill]    solid silhouette, hidden at rest
 *   [data-plant-stroke]  blueprint linework, grouped by build stage
 *
 * S1 draws the linework stage by stage, then crossfades stroke → fill at ~60%
 * so the blueprint resolves into a solid structure. The two groups are
 * deliberately the same shapes, so the crossfade lands registered.
 *
 * Build stages, in the order the brief specifies:
 *   foundation → columns → pipes → stack → tower
 *
 * Every stroked path carries `data-draw` so the timeline can collect them
 * without knowing the artwork. Add a path, it animates; no timeline edit.
 *
 * ── Colour ────────────────────────────────────────────────────────────────
 *
 * White at low alpha on navy. No red anywhere: red is structural on this site —
 * the line, key numerals, rules and CTAs — and a red plant would spend the one
 * accent the brand has on decoration.
 */

export function PlantScene({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      role="img"
      aria-labelledby="plant-scene-title"
      focusable="false"
    >
      <title id="plant-scene-title">
        Technical line drawing of an industrial process plant: structural steel
        columns, pipe runs, a boiler stack and a distillation tower.
      </title>

      <defs>
        {/* Horizon glow. A restrained light band at the ground line — not a
            gradient blob, which brief §9 rules out. */}
        <linearGradient id="plant-horizon" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rises and fades in behind the structure at ~60%. */}
      <rect
        data-plant-glow
        x="0"
        y="300"
        width="1200"
        height="320"
        fill="url(#plant-horizon)"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Silhouette — revealed by the stroke→fill crossfade                */}
      {/* ---------------------------------------------------------------- */}
      <g data-plant-fill fill="#FFFFFF" fillOpacity="0.09">
        <path d="M110 620V486l74-42 74 42v134Z" />
        <rect x="300" y="352" width="176" height="268" />
        <path d="M560 620V236l22-96h34l22 96v384Z" />
        <path d="M700 620V232a52 52 0 0 1 104 0v388Z" />
        <rect x="880" y="470" width="180" height="150" rx="8" />
        <rect x="300" y="300" width="176" height="18" />
      </g>

      {/* ---------------------------------------------------------------- */}
      {/* Blueprint linework                                                */}
      {/* ---------------------------------------------------------------- */}
      <g
        data-plant-stroke
        stroke="#FFFFFF"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        // butt, not square: a square cap paints even on a zero-length dash, so a
        // fully-hidden path would leave visible stubs at rest.
        strokeLinecap="butt"
        strokeLinejoin="round"
      >
        {/* Stage 1 — foundation */}
        <g data-plant-part="foundation">
          <path data-draw pathLength={DASH_UNITS} d="M40 620H1160" />
          <path data-draw pathLength={DASH_UNITS} d="M96 646H1104" strokeOpacity="0.22" />
          <path data-draw pathLength={DASH_UNITS} d="M110 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M258 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M300 620V590" />
          <path data-draw pathLength={DASH_UNITS} d="M476 620V590" />
          <path data-draw pathLength={DASH_UNITS} d="M560 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M638 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M700 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M804 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M880 620V596" />
          <path data-draw pathLength={DASH_UNITS} d="M1060 620V596" />
        </g>

        {/* Stage 2 — structural columns and trusses */}
        <g data-plant-part="columns">
          {/* Workshop shed, left */}
          <path data-draw pathLength={DASH_UNITS} d="M110 620V486" />
          <path data-draw pathLength={DASH_UNITS} d="M258 620V486" />
          <path data-draw pathLength={DASH_UNITS} d="M110 486l74-42 74 42" />
          <path data-draw pathLength={DASH_UNITS} d="M110 486H258" strokeOpacity="0.3" />
          <path data-draw pathLength={DASH_UNITS} d="M110 552H258" strokeOpacity="0.3" />

          {/* Main structure — four columns, three truss levels */}
          <path data-draw pathLength={DASH_UNITS} d="M300 620V352" />
          <path data-draw pathLength={DASH_UNITS} d="M358 620V352" />
          <path data-draw pathLength={DASH_UNITS} d="M418 620V352" />
          <path data-draw pathLength={DASH_UNITS} d="M476 620V352" />
          <path data-draw pathLength={DASH_UNITS} d="M300 352H476" />
          <path data-draw pathLength={DASH_UNITS} d="M300 436H476" strokeOpacity="0.34" />
          <path data-draw pathLength={DASH_UNITS} d="M300 528H476" strokeOpacity="0.34" />
          {/* Bracing */}
          <path data-draw pathLength={DASH_UNITS} d="M300 528L358 436M358 528L300 436" strokeOpacity="0.2" />
          <path data-draw pathLength={DASH_UNITS} d="M418 528L476 436M476 528L418 436" strokeOpacity="0.2" />
          {/* Deck */}
          <path data-draw pathLength={DASH_UNITS} d="M288 318H488V300H288Z" strokeOpacity="0.34" />
          <path data-draw pathLength={DASH_UNITS} d="M300 352V318M476 352V318" />
        </g>

        {/* Stage 3 — pipe runs connecting the units */}
        <g data-plant-part="pipes">
          <path data-draw pathLength={DASH_UNITS} d="M258 462H278a10 10 0 0 1 10 10v10" strokeOpacity="0.42" />
          <path data-draw pathLength={DASH_UNITS} d="M476 400H528a12 12 0 0 1 12 12v52" strokeOpacity="0.42" />
          <path data-draw pathLength={DASH_UNITS} d="M540 464h48" strokeOpacity="0.42" />
          <path data-draw pathLength={DASH_UNITS} d="M616 500H676a12 12 0 0 1 12 12v40" strokeOpacity="0.42" />
          <path data-draw pathLength={DASH_UNITS} d="M804 372h44a12 12 0 0 1 12 12v72a12 12 0 0 0 12 12h20" strokeOpacity="0.42" />
          <path data-draw pathLength={DASH_UNITS} d="M804 300h72a14 14 0 0 1 14 14v96" strokeOpacity="0.3" />
          <path data-draw pathLength={DASH_UNITS} d="M476 560h84" strokeOpacity="0.3" />
          {/* Flanges */}
          <path data-draw pathLength={DASH_UNITS} d="M534 458v12M594 458v12" strokeOpacity="0.5" />
          <path data-draw pathLength={DASH_UNITS} d="M682 546h12" strokeOpacity="0.5" />
        </g>

        {/* Stage 4 — boiler stack */}
        <g data-plant-part="stack">
          <path data-draw pathLength={DASH_UNITS} d="M560 620V236l22-96h34l22 96v384" />
          <path data-draw pathLength={DASH_UNITS} d="M560 236h100" strokeOpacity="0.34" />
          <path data-draw pathLength={DASH_UNITS} d="M566 300h88" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M566 380h88" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M566 462h88" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M582 140h34" />
        </g>

        {/* Stage 5 — distillation tower and vessel */}
        <g data-plant-part="tower">
          <path data-draw pathLength={DASH_UNITS} d="M700 620V232a52 52 0 0 1 104 0v388" />
          <path data-draw pathLength={DASH_UNITS} d="M700 292h104" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M700 360h104" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M700 428h104" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M700 496h104" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M700 564h104" strokeOpacity="0.24" />
          {/* Horizontal vessel on saddles */}
          <path data-draw pathLength={DASH_UNITS} d="M888 470h164a8 8 0 0 1 8 8v134H880V478a8 8 0 0 1 8-8Z" />
          <path data-draw pathLength={DASH_UNITS} d="M880 540h180" strokeOpacity="0.24" />
          <path data-draw pathLength={DASH_UNITS} d="M920 470v-28M1020 470v-28" strokeOpacity="0.34" />
          <path data-draw pathLength={DASH_UNITS} d="M906 442h28M1006 442h28" strokeOpacity="0.34" />
        </g>
      </g>
    </svg>
  );
}
