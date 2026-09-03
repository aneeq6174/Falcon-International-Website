/**
 * JourneyStructures — the fourteen things Falcon built, as line art.
 *
 * ── The build vocabulary ──────────────────────────────────────────────────
 *
 * Structures assemble themselves as they enter frame. Rather than a bespoke
 * timeline per structure, every animatable element declares HOW it arrives:
 *
 *   data-build="draw"    stroke draws on, bottom-up or left-right
 *   data-build="rise"    scales up from its own base — columns, sheds, silos
 *   data-build="swing"   rotates into alignment — pipe spools, solar panels
 *   data-build="walk"    translates in from the left — crews arriving on site
 *   data-build="grow"    scales from its centre — vessels, crates, pins
 *   data-build="flash"   a brief pulse — weld arcs, vents
 *
 * plus `data-order` for stagger. S3Journey reads these and knows nothing about
 * the artwork, so a new structure only needs correct markup — no timeline edit.
 *
 * Nothing here uses a plain fade. The brief is explicit: structures BUILD
 * themselves, they do not fade in.
 *
 * ── Geometry ──────────────────────────────────────────────────────────────
 *
 * Every structure is authored in a 320 × 280 box with the ground line at
 * y = 250, so all fourteen sit on the same horizon. The 30 units below ground
 * are for trenches and foundations; the SVG renders with overflow visible.
 *
 * ── Colour ────────────────────────────────────────────────────────────────
 *
 * White line on navy. No red: red is structural on this site — the line, key
 * numerals, rules and CTAs — and here the red IS the ground the camera travels
 * along. Painting the structures red would spend the accent on decoration.
 */

import type { ReactNode } from 'react';

export const STRUCTURE_VIEWBOX = { width: 320, height: 280, ground: 250 } as const;

/* ------------------------------------------------------------------ */
/* Build wrappers                                                      */
/* ------------------------------------------------------------------ */

type BuildProps = { o: number; children: ReactNode };

const Rise = ({ o, children }: BuildProps) => (
  <g data-build="rise" data-order={o}>
    {children}
  </g>
);
const Swing = ({ o, children }: BuildProps) => (
  <g data-build="swing" data-order={o}>
    {children}
  </g>
);
const Walk = ({ o, children }: BuildProps) => (
  <g data-build="walk" data-order={o}>
    {children}
  </g>
);
const Grow = ({ o, children }: BuildProps) => (
  <g data-build="grow" data-order={o}>
    {children}
  </g>
);
const Flash = ({ o, children }: BuildProps) => (
  <g data-build="flash" data-order={o}>
    {children}
  </g>
);

/** A drawn stroke. pathLength is mandatory — see DASH_UNITS in lib/redline.ts. */
const D = ({ d, o, ...rest }: { d: string; o: number } & React.SVGProps<SVGPathElement>) => (
  <path data-build="draw" data-order={o} pathLength={100} d={d} {...rest} />
);

/**
 * Positional translate lives on an OUTER group that the timeline never touches,
 * so GSAP is free to own the inner group's transform completely.
 */
const At = ({ x, y = 0, children }: { x: number; y?: number; children: ReactNode }) => (
  <g transform={`translate(${x},${y})`}>{children}</g>
);

/** One hard-hatted worker, as a reusable symbol. Two elements per figure. */
const Worker = ({ x, o, s = 1 }: { x: number; o: number; s?: number }) => (
  <At x={x}>
    <Walk o={o}>
      <g transform={`scale(${s})`}>
        <circle cx="0" cy="228" r="3.4" />
        <path d="M-5.5 224.5h11M0 231.5v10M-5 250l5-8.5 5 8.5M-5.5 235l5.5 2 5.5-2" />
      </g>
    </Walk>
  </At>
);

/** A run of workers, spread across a span. */
const Crew = ({ from, to, count, o }: { from: number; to: number; count: number; o: number }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Worker
        key={i}
        x={from + ((to - from) * i) / Math.max(1, count - 1)}
        o={o + i}
        s={0.9 + (i % 3) * 0.08}
      />
    ))}
  </>
);

/* ------------------------------------------------------------------ */
/* 1997 — Founded in Lahore                                            */
/* ------------------------------------------------------------------ */

function Workshop() {
  return (
    <>
      {[70, 122, 198, 250].map((x, i) => (
        <Rise key={x} o={i}>
          <path d={`M${x} 250V152`} />
        </Rise>
      ))}
      <D o={4} d="M62 152H258" />
      <D o={5} d="M62 152L160 112L258 152" />
      <D o={6} d="M62 152L258 152" strokeOpacity="0.25" />
      <D o={7} d="M100 250V196H140V250" strokeOpacity="0.5" />
      <D o={8} d="M180 250V210H228V250" strokeOpacity="0.35" />
      <D o={9} d="M70 178H250" strokeOpacity="0.22" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 1998 — First LCI Polyester line (spools weld together)              */
/* ------------------------------------------------------------------ */

const Spool = ({ x, o, w = 54 }: { x: number; o: number; w?: number }) => (
  <At x={x}>
    <Swing o={o}>
      <path d={`M0 190h${w}`} strokeWidth="4" strokeOpacity="0.6" />
      <path d="M0 182v16" />
      <path d={`M${w} 182v16`} />
    </Swing>
  </At>
);

function PolyesterLine({ second = false }: { second?: boolean }) {
  const joints = [54, 116, 178, 240];
  return (
    <>
      {/* Existing line, already standing, when this is the repeat contract */}
      {second ? (
        <g strokeOpacity="0.28">
          <path d="M50 140h216" strokeWidth="4" />
          <path d="M80 250v-110M180 250v-110M250 250v-110" />
        </g>
      ) : null}

      {[0, 1, 2, 3].map((i) => (
        <Spool key={i} x={50 + i * 56} o={i} />
      ))}

      {joints.map((x, i) => (
        <At key={x} x={x}>
          <Flash o={6 + i}>
            <circle cx="0" cy="190" r="6" strokeOpacity="0.9" />
            <path d="M-9 190h18M0 181v18" strokeOpacity="0.9" />
          </Flash>
        </At>
      ))}

      {[70, 150, 230].map((x, i) => (
        <Rise key={x} o={10 + i}>
          <path d={`M${x} 250v-60`} />
        </Rise>
      ))}
      <D o={14} d="M40 250H280" strokeOpacity="0.2" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2010 / 2015 — Manpower on site                                      */
/* ------------------------------------------------------------------ */

function CrewSite({ dense = false }: { dense?: boolean }) {
  return (
    <>
      {/* The plant they are working on, already standing */}
      <g strokeOpacity="0.3">
        <path d="M60 250v-96M120 250v-96M200 250v-96M260 250v-96" />
        <path d="M52 154h216M52 200h216" />
        <path d="M96 154v-34h48v34" />
      </g>
      <Crew from={44} to={276} count={dense ? 14 : 8} o={0} />
      {dense ? <Crew from={64} to={256} count={9} o={16} /> : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2013 — CFB power house                                              */
/* ------------------------------------------------------------------ */

function PowerHouse() {
  return (
    <>
      <Rise o={0}>
        <path d="M56 250V148h132v102" />
      </Rise>
      <D o={2} d="M56 186h132M56 218h132" strokeOpacity="0.25" />
      <D o={3} d="M206 250V96h40v154" />
      <D o={4} d="M204 96h44" />
      <D o={5} d="M210 130h32M210 166h32" strokeOpacity="0.28" />
      <Flash o={6}>
        <path d="M212 86q14-16 24 0t-2 -22" strokeOpacity="0.55" />
      </Flash>
      <Flash o={7}>
        <path d="M232 74q12-14 20 0" strokeOpacity="0.35" />
      </Flash>
      <D o={8} d="M188 172h18a10 10 0 0 1 10 10" strokeOpacity="0.4" />
      <Grow o={9}>
        <circle cx="112" cy="212" r="17" strokeOpacity="0.4" />
        <path d="M95 212h34" strokeOpacity="0.25" />
      </Grow>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2016 — 18 MW CFB plant, electrical & instrumentation                */
/* ------------------------------------------------------------------ */

const Pylon = ({ x, o, h = 130 }: { x: number; o: number; h?: number }) => (
  <At x={x}>
    <Rise o={o}>
      <path d={`M-22 250L-7 ${250 - h}h14L22 250`} />
      <path d={`M-16 ${250 - h * 0.42}h32M-11 ${250 - h * 0.72}h22`} strokeOpacity="0.5" />
      <path d={`M-14 250L14 ${250 - h * 0.6}M14 250L-14 ${250 - h * 0.6}`} strokeOpacity="0.22" />
      <path d={`M-26 ${250 - h}h52`} />
    </Rise>
  </At>
);

function Pylons() {
  return (
    <>
      <Pylon x={78} o={0} h={128} />
      <Pylon x={172} o={1} h={150} />
      <Pylon x={262} o={2} h={120} />
      <D o={4} d="M52 122q47 26 94 0" strokeOpacity="0.45" />
      <D o={5} d="M146 100q47 30 94 6" strokeOpacity="0.45" />
      <D o={6} d="M52 134q47 26 94 0" strokeOpacity="0.25" />
      <D o={7} d="M146 112q47 30 94 6" strokeOpacity="0.25" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2019 — OGDCL / MOL, upstream                                        */
/* ------------------------------------------------------------------ */

function Wellhead() {
  return (
    <>
      <Rise o={0}>
        <path d="M46 250L86 108l40 142" />
        <path d="M60 200h52M68 168h36M76 140h20" strokeOpacity="0.45" />
        <path d="M56 224L116 168M116 224L56 168" strokeOpacity="0.2" />
      </Rise>
      <D o={3} d="M86 108v-18" />
      <Grow o={4}>
        <circle cx="86" cy="84" r="6" strokeOpacity="0.7" />
      </Grow>
      {/* DCS console */}
      <Rise o={5}>
        <path d="M168 250v-72h108v72" />
      </Rise>
      <D o={7} d="M180 190h84v40h-84z" strokeOpacity="0.5" />
      <D o={8} d="M188 200h30M188 210h56M188 220h40" strokeOpacity="0.8" />
      <D o={9} d="M126 214h42" strokeOpacity="0.35" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2019 — Nutrico Morinaga, packaging line                             */
/* ------------------------------------------------------------------ */

function PackagingLine() {
  return (
    <>
      <D o={0} d="M40 206h240" strokeWidth="3" strokeOpacity="0.55" />
      {[62, 130, 198, 262].map((x, i) => (
        <Rise key={x} o={1 + i}>
          <path d={`M${x} 250v-44`} />
        </Rise>
      ))}
      {[54, 106, 158, 210].map((x, i) => (
        <At key={x} x={x}>
          <Grow o={6 + i}>
            <path d="M0 206v-26h34v26z" strokeOpacity="0.7" />
            <path d="M0 192h34" strokeOpacity="0.35" />
          </Grow>
        </At>
      ))}
      <Rise o={11}>
        <path d="M244 180v-52h48v52" strokeOpacity="0.45" />
      </Rise>
      <Crew from={70} to={200} count={5} o={13} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2024 — 1 MW solar EPC                                               */
/* ------------------------------------------------------------------ */

const Panel = ({ x, o }: { x: number; o: number }) => (
  <At x={x}>
    <Swing o={o}>
      <path d="M0 250v-26" strokeOpacity="0.5" />
      <path d="M-20 224h40v-22h-40z" />
      <path d="M-20 213h40M0 224v-22" strokeOpacity="0.3" />
    </Swing>
  </At>
);

function SolarArray() {
  return (
    <>
      <D o={0} d="M30 250h260" strokeOpacity="0.25" />
      {[56, 106, 156, 206, 256].map((x, i) => (
        <Panel key={x} x={x} o={1 + i} />
      ))}
      <Grow o={8}>
        <circle cx="252" cy="86" r="16" strokeOpacity="0.5" />
        <path d="M252 60v-10M252 122v10M226 86h-10M288 86h10" strokeOpacity="0.35" />
      </Grow>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2025 — LCI Soda Ash: biomass silo + boiler                          */
/* ------------------------------------------------------------------ */

function BiomassSilo() {
  return (
    <>
      <Rise o={0}>
        <path d="M58 250V128a34 34 0 0 1 68 0v122" />
      </Rise>
      <D o={2} d="M58 168h68M58 206h68" strokeOpacity="0.25" />
      <Rise o={3}>
        <path d="M172 250v-96h94v96" />
      </Rise>
      <D o={5} d="M172 186h94" strokeOpacity="0.25" />
      <D o={6} d="M126 152h24a12 12 0 0 1 12 12v14" strokeOpacity="0.45" />
      <D o={7} d="M228 154v-46h20v46" />
      <Flash o={8}>
        <path d="M232 100q10-14 16 0" strokeOpacity="0.45" />
      </Flash>
      <D o={9} d="M186 210h30v26h-30z" strokeOpacity="0.5" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2026 — Habib Metro, armoured cable laying                           */
/* ------------------------------------------------------------------ */

function ArmouredCable() {
  return (
    <>
      {/* Trench, below the ground line */}
      <D o={0} d="M40 250v22h240v-22" strokeOpacity="0.5" />
      <D o={1} d="M40 272h240" strokeOpacity="0.25" />
      {/* The cable itself, braided */}
      <D o={2} d="M46 262h228" strokeWidth="6" strokeOpacity="0.35" />
      <D o={3} d="M52 262q10-7 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" strokeOpacity="0.7" />
      {/* Drum */}
      <Grow o={5}>
        <circle cx="104" cy="204" r="40" />
        <circle cx="104" cy="204" r="14" strokeOpacity="0.4" />
        <path d="M104 164v80M64 204h80" strokeOpacity="0.2" />
      </Grow>
      <D o={7} d="M144 204h26a12 12 0 0 1 12 12v34" strokeOpacity="0.4" />
      <Crew from={216} to={262} count={2} o={9} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2026 — Unilever Foods                                               */
/* ------------------------------------------------------------------ */

function UnileverSite() {
  return (
    <>
      <Rise o={0}>
        <path d="M52 250V150h176v100" />
      </Rise>
      <D o={2} d="M44 150L140 108l96 42" />
      <D o={3} d="M52 194h176" strokeOpacity="0.22" />
      <D o={4} d="M96 250v-40h48v40" strokeOpacity="0.5" />
      {[168, 200].map((x, i) => (
        <At key={x} x={x}>
          <Grow o={6 + i}>
            <path d="M0 250v-30h24v30z" strokeOpacity="0.55" />
          </Grow>
        </At>
      ))}
      <D o={9} d="M244 250v-56h34v56" strokeOpacity="0.35" />
      <Crew from={64} to={90} count={2} o={11} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* TODAY — the wide shot                                               */
/* ------------------------------------------------------------------ */

function TodayMarker() {
  return (
    <>
      <D o={0} d="M160 250v-96" strokeOpacity="0.3" />
      <Grow o={1}>
        <circle cx="160" cy="142" r="10" strokeOpacity="0.6" />
        <circle cx="160" cy="142" r="22" strokeOpacity="0.22" />
      </Grow>
      <D o={3} d="M40 250h240" strokeOpacity="0.2" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

const STRUCTURES: Record<string, () => JSX.Element> = {
  workshop: Workshop,
  'polyester-line': () => <PolyesterLine />,
  'polyester-line-2': () => <PolyesterLine second />,
  'crew-50': () => <CrewSite />,
  'power-house': PowerHouse,
  'crew-150': () => <CrewSite dense />,
  pylons: Pylons,
  wellhead: Wellhead,
  'packaging-line': PackagingLine,
  'solar-array': SolarArray,
  'biomass-silo': BiomassSilo,
  'armoured-cable': ArmouredCable,
  unilever: UnileverSite,
  skyline: TodayMarker,
};

/**
 * Renders one milestone's structure. `preserveAspectRatio="xMidYMax meet"`
 * pins the artwork's bottom edge to the container's, which is what puts all
 * fourteen on the same horizon regardless of how tall each one is.
 */
export function JourneyStructure({ scene, className }: { scene: string; className?: string }) {
  const Structure = STRUCTURES[scene] ?? TodayMarker;

  return (
    <svg
      className={`overflow-visible ${className ?? ''}`}
      viewBox={`0 0 ${STRUCTURE_VIEWBOX.width} ${STRUCTURE_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      stroke="#FFFFFF"
      strokeOpacity="0.55"
      strokeWidth="1.6"
      strokeLinecap="butt"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Structure />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Back layer — the accumulating skyline                               */
/* ------------------------------------------------------------------ */

/**
 * Simplified silhouettes of the same fourteen structures, at fixed positions
 * across the viewport. Each is revealed as its foreground counterpart passes the
 * camera, so by the end everything Falcon has built is standing together — the
 * brief's closing wide shot.
 *
 * Fixed positions rather than a second scrolling world: the point is
 * accumulation, and a back layer that scrolled away would empty out exactly
 * when it is supposed to be full.
 */
export const SKYLINE: Array<{ x: number; h: number; d: string }> = [
  { x: 3, h: 42, d: 'M0 100V44l18-14 18 14v56z' },
  { x: 10, h: 58, d: 'M0 100V26h30v74z' },
  { x: 17, h: 52, d: 'M0 100V34h26v66zM30 100V52h14v48z' },
  { x: 24, h: 46, d: 'M0 100V40h34v60z' },
  { x: 31, h: 72, d: 'M0 100V52h26v48zM32 100V8h16v92z' },
  { x: 38, h: 50, d: 'M0 100V44h40v56z' },
  { x: 45, h: 78, d: 'M14 100L4 18h20l-10 82zM40 100L30 30h16l-6 70z' },
  { x: 52, h: 66, d: 'M0 100L18 18l18 82zM44 100V56h22v44z' },
  { x: 60, h: 44, d: 'M0 100V48h48v52z' },
  { x: 67, h: 34, d: 'M0 100V72h22v28zM26 100V72h22v28zM52 100V72h22v28z' },
  { x: 76, h: 70, d: 'M0 100V30a14 14 0 0 1 28 0v70zM34 100V46h26v54z' },
  { x: 84, h: 30, d: 'M0 100V80h60v20z' },
  { x: 90, h: 54, d: 'M0 100V40l22-16 22 16v60z' },
  { x: 96, h: 40, d: 'M0 100V50h20v50z' },
];

export function SkylineSilhouette({ item }: { item: (typeof SKYLINE)[number] }) {
  return (
    <svg
      className="absolute bottom-0 overflow-visible"
      style={{ left: `${item.x}%`, height: `${item.h}%`, width: 'auto', aspectRatio: '1 / 1.4' }}
      viewBox="0 0 74 100"
      preserveAspectRatio="xMinYMax meet"
      fill="#FFFFFF"
      fillOpacity="0.07"
      aria-hidden="true"
      focusable="false"
    >
      <path d={item.d} />
    </svg>
  );
}
