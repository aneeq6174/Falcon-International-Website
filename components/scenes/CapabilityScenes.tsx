/**
 * CapabilityScenes — the six things Falcon does, as line art.
 *
 * Same build vocabulary as the Journey structures (see lib/scene.ts): every
 * element declares `data-build` and `data-order`, and `buildScene` animates it
 * without knowing what it is drawing.
 *
 * Authored in a 400 × 300 box with the floor at y = 268. Unlike the Journey,
 * these are not all standing on one horizon — each is its own stage — so the
 * floor is a reference, not a constraint.
 *
 * White line on navy. No red: red is the manifold and the valves above.
 */

import type { ReactNode } from 'react';

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
const Spin = ({ o, children }: BuildProps) => (
  <g data-build="spin" data-order={o}>
    {children}
  </g>
);

const D = ({ d, o, ...rest }: { d: string; o: number } & React.SVGProps<SVGPathElement>) => (
  <path data-build="draw" data-order={o} pathLength={100} d={d} {...rest} />
);

/** Positional translate on an outer group the timeline never touches. */
const At = ({ x, y = 0, children }: { x: number; y?: number; children: ReactNode }) => (
  <g transform={`translate(${x},${y})`}>{children}</g>
);

const FLOOR = 268;

/** One hard-hatted worker. */
const Worker = ({ x, o, s = 1 }: { x: number; o: number; s?: number }) => (
  <At x={x}>
    <Walk o={o}>
      <g transform={`scale(${s})`}>
        <circle cx="0" cy="242" r="4" />
        <path d="M-6.5 237.5h13M0 246v12M-6 268l6-10 6 10M-6.5 250l6.5 2.5 6.5-2.5" />
      </g>
    </Walk>
  </At>
);

/* ------------------------------------------------------------------ */
/* 1 — MANPOWER                                                        */
/* ------------------------------------------------------------------ */

function CrewScene() {
  return (
    <>
      <D o={0} d="M30 268h340" strokeOpacity="0.28" />
      {/* Supervised site team: a supervisor on the platform, crew below. */}
      <Rise o={1}>
        <path d="M150 240V196h100v44" strokeOpacity="0.4" />
      </Rise>
      <D o={3} d="M140 240h120" strokeOpacity="0.4" />
      {[70, 108, 146, 184, 222, 260, 298, 336].map((x, i) => (
        <Worker key={x} x={x} o={5 + i} s={0.95 + (i % 3) * 0.06} />
      ))}
      {/* Supervisor, raised, with a board. */}
      <At x={200} y={-46}>
        <Walk o={4}>
          <circle cx="0" cy="242" r="4.5" />
          <path d="M-7 237h14M0 247v13M-7 268l7-8 7 8M0 251h14v10h-14" strokeOpacity="0.75" />
        </Walk>
      </At>
      <Grow o={14}>
        <circle cx="200" cy="150" r="17" strokeOpacity="0.35" />
        <path d="M192 150h16M200 142v16" strokeOpacity="0.35" />
      </Grow>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2 — GENERAL ORDER SUPPLY                                            */
/* ------------------------------------------------------------------ */

function ConveyorScene() {
  return (
    <>
      {/* Conveyor */}
      <D o={0} d="M20 214h210" strokeWidth="3" strokeOpacity="0.5" />
      {[40, 92, 144, 196].map((x, i) => (
        <Rise key={x} o={1 + i}>
          <path d={`M${x} 268v-54`} strokeOpacity="0.4" />
        </Rise>
      ))}
      {[36, 80, 124, 168].map((x, i) => (
        <At key={x} x={x}>
          <Grow o={6 + i}>
            <path d="M0 214v-30h34v30z" strokeOpacity="0.7" />
            <path d="M0 199h34M17 184v30" strokeOpacity="0.3" />
          </Grow>
        </At>
      ))}
      {/* Warehouse bay: racking that fills */}
      <Rise o={11}>
        <path d="M252 268V96h128v172" strokeOpacity="0.45" />
      </Rise>
      <D o={13} d="M252 152h128M252 210h128" strokeOpacity="0.3" />
      {[
        [262, 158],
        [304, 158],
        [346, 158],
        [262, 216],
        [304, 216],
        [346, 216],
      ].map(([x, y], i) => (
        <At key={i} x={x} y={y}>
          <Grow o={15 + i}>
            <path d="M0 52V0h26v52z" strokeOpacity="0.65" />
          </Grow>
        </At>
      ))}
      <D o={22} d="M20 268h360" strokeOpacity="0.28" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3 — ELECTRICAL                                                      */
/* ------------------------------------------------------------------ */

function MccScene() {
  return (
    <>
      {/* MCC cabinet, door swinging open */}
      <Rise o={0}>
        <path d="M60 268V80h150v188" />
      </Rise>
      <D o={2} d="M60 128h150M60 176h150M60 222h150" strokeOpacity="0.25" />
      <At x={210}>
        <Swing o={3}>
          <path d="M0 90v168l52-22V112z" strokeOpacity="0.35" />
          <path d="M12 150h28M12 176h28" strokeOpacity="0.25" />
        </Swing>
      </At>
      {/* Circuit traces running through the cabinet */}
      <D o={5} d="M78 106h44a8 8 0 0 1 8 8v34h48" strokeOpacity="0.75" />
      <D o={6} d="M78 154h30a8 8 0 0 1 8 8v40h74" strokeOpacity="0.6" />
      <D o={7} d="M78 200h22a8 8 0 0 1 8 8v42h84" strokeOpacity="0.45" />
      {[
        [130, 148],
        [186, 202],
        [108, 250],
      ].map(([x, y], i) => (
        <At key={i} x={x} y={y}>
          <Flash o={9 + i}>
            <circle cx="0" cy="0" r="5" strokeOpacity="0.9" />
          </Flash>
        </At>
      ))}
      {/* Switchgear busbar energising */}
      <D o={12} d="M252 120h116" strokeWidth="4" strokeOpacity="0.6" />
      <D o={13} d="M252 140h116" strokeWidth="4" strokeOpacity="0.4" />
      {[268, 300, 332, 360].map((x, i) => (
        <Rise key={x} o={15 + i}>
          <path d={`M${x} 268v-128`} strokeOpacity="0.35" />
        </Rise>
      ))}
      <D o={20} d="M20 268h360" strokeOpacity="0.28" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4 — MECHANICAL                                                      */
/* ------------------------------------------------------------------ */

function BoilerScene() {
  return (
    <>
      {/* Boiler, section-cut */}
      <Rise o={0}>
        <path d="M48 268V116a44 44 0 0 1 88 0v152" />
      </Rise>
      <D o={2} d="M48 168h88M48 216h88" strokeOpacity="0.25" />
      <D o={3} d="M62 196q16-22 30 0t30 0" strokeOpacity="0.5" />
      <D o={4} d="M62 232q16-22 30 0t30 0" strokeOpacity="0.35" />
      <D o={5} d="M92 72V50" />
      <Flash o={6}>
        <path d="M84 44q8-14 16 0" strokeOpacity="0.5" />
      </Flash>
      {/* HVAC unit with a spinning impeller */}
      <Rise o={7}>
        <path d="M196 268V112h164v156" strokeOpacity="0.5" />
      </Rise>
      <D o={9} d="M196 160h164" strokeOpacity="0.25" />
      <At x={278} y={196}>
        <Spin o={10}>
          <circle cx="0" cy="0" r="42" strokeOpacity="0.3" />
          <path d="M0-38a38 38 0 0 1 26 12L0 0zM33 27a38 38 0 0 1-28 11L0 0zM-33 27A38 38 0 0 1-38-5L0 0z" strokeOpacity="0.6" />
          <circle cx="0" cy="0" r="7" strokeOpacity="0.7" />
        </Spin>
      </At>
      {/* Airflow circulating */}
      <D o={12} d="M206 136q40-18 78 0t70-4" strokeOpacity="0.4" />
      <D o={13} d="M348 132l8 4-8 5" strokeOpacity="0.5" />
      <D o={14} d="M150 190h34" strokeOpacity="0.35" />
      <D o={15} d="M178 186l7 4-7 4" strokeOpacity="0.5" />
      <D o={16} d="M20 268h360" strokeOpacity="0.28" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5 — PIPING, FABRICATION & ERECTION                                  */
/* ------------------------------------------------------------------ */

function SpoolsScene() {
  return (
    <>
      {/* Spools rotating into alignment */}
      {[30, 116, 202].map((x, i) => (
        <At key={x} x={x}>
          <Swing o={i}>
            <path d="M0 120h80" strokeWidth="5" strokeOpacity="0.6" />
            <path d="M0 110v20M80 110v20" />
          </Swing>
        </At>
      ))}
      {/* Weld beads with spark bursts at the joints */}
      {[112, 198, 284].map((x, i) => (
        <At key={x} x={x} y={120}>
          <Flash o={4 + i}>
            <circle cx="0" cy="0" r="7" strokeOpacity="0.9" />
            <path d="M-12 0h24M0-12v24M-8-8l16 16M8-8l-16 16" strokeOpacity="0.85" />
          </Flash>
        </At>
      ))}
      {/* Steel frame erecting column by column */}
      {[236, 288, 340].map((x, i) => (
        <Rise key={x} o={8 + i}>
          <path d={`M${x} 268v-92`} />
        </Rise>
      ))}
      <D o={12} d="M228 176h120" />
      <D o={13} d="M236 224h104" strokeOpacity="0.3" />
      <D o={14} d="M236 224l52-48M288 224l-52-48M288 224l52-48M340 224l-52-48" strokeOpacity="0.2" />
      <D o={15} d="M20 268h360" strokeOpacity="0.28" />
      <Rise o={16}>
        <path d="M60 268v-90M140 268v-90" strokeOpacity="0.3" />
      </Rise>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6 — SCAFFOLDING RENTAL                                              */
/* ------------------------------------------------------------------ */

function ScaffoldScene() {
  /** Four levels, built bottom-up: standards, then ledgers, then braces. */
  const levels = [268, 222, 176, 130];
  return (
    <>
      <D o={0} d="M20 268h360" strokeOpacity="0.28" />
      {/* Standards (verticals) */}
      {[120, 180, 240, 300].map((x, i) => (
        <Rise key={x} o={1 + i}>
          <path d={`M${x} 268V84`} />
        </Rise>
      ))}
      {/* Ledgers (horizontals), level by level */}
      {levels.map((y, i) => (
        <D key={y} o={6 + i} d={`M112 ${y - 8}h196`} strokeOpacity={i === 0 ? 0.5 : 0.42} />
      ))}
      <D o={10} d="M112 84h196" strokeOpacity="0.5" />
      {/* Braces */}
      {levels.slice(0, 3).map((y, i) => (
        <D
          key={y}
          o={12 + i}
          d={`M120 ${y - 8}L180 ${y - 54}M180 ${y - 8}L120 ${y - 54}M240 ${y - 8}L300 ${y - 54}M300 ${y - 8}L240 ${y - 54}`}
          strokeOpacity="0.2"
        />
      ))}
      {/* Boards on the top lift */}
      <D o={16} d="M112 76h196v8h-196z" strokeOpacity="0.5" />
      <Worker x={148} o={18} s={0.9} />
      <Worker x={272} o={19} s={0.9} />
      {/* Stacked components waiting to go up */}
      {[40, 40, 40].map((x, i) => (
        <At key={i} x={x} y={-i * 14}>
          <Grow o={21 + i}>
            <path d="M0 258h56v10h-56z" strokeOpacity="0.4" />
          </Grow>
        </At>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

const SCENES: Record<string, () => JSX.Element> = {
  crew: CrewScene,
  conveyor: ConveyorScene,
  mcc: MccScene,
  boiler: BoilerScene,
  spools: SpoolsScene,
  scaffold: ScaffoldScene,
};

export function CapabilityScene({ scene, className }: { scene: string; className?: string }) {
  const Scene = SCENES[scene] ?? CrewScene;

  return (
    <svg
      className={`overflow-visible ${className ?? ''}`}
      viewBox="0 0 400 300"
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
      <Scene />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The manifold valves                                                 */
/* ------------------------------------------------------------------ */

/**
 * One valve on the header pipe. The handle quarter-turns open and the body
 * fills red as the branch below it charges.
 *
 * The positional transform is a CSS `left` offset on the wrapper, never a
 * translate — GSAP owns the handle's transform and would overwrite it.
 */
export function ManifoldValve() {
  return (
    <svg
      className="h-9 w-9 overflow-visible"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Body, seated on the pipe */}
      <rect x="11" y="14" width="18" height="12" stroke="#E23327" strokeWidth="2" />
      {/* Fills as red flows through */}
      <rect data-valve-fill x="11" y="14" width="18" height="12" fill="#E23327" opacity="0" />
      {/* Handle: closed across the pipe, open along it */}
      <g data-valve-handle>
        <path d="M20 14V4M13 4h14" stroke="#E23327" strokeWidth="2" strokeLinecap="butt" />
      </g>
    </svg>
  );
}
