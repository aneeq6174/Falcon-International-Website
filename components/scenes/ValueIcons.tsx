/**
 * ValueIcons — one line-art mark per value.
 *
 * Deliberately plain. S5 is the brief's pacing relief: the reader has just come
 * through 600vh of the Journey, and these draw themselves in an 80ms stagger and
 * then stop. Each is authored in a 48 × 48 box, white line on paper's navy.
 *
 * Keyed by the value's title so `content/site.ts` stays the source of truth —
 * an unknown title falls back to the plain rule rather than throwing.
 */

const P = ({ d, o }: { d: string; o: number }) => (
  <path data-build="draw" data-order={o} pathLength={100} d={d} />
);

const ICONS: Record<string, () => JSX.Element> = {
  // A rising measure — quality held above the standard.
  Excellence: () => (
    <>
      <P o={0} d="M6 42h36" />
      <P o={1} d="M12 42V28M22 42V20M32 42V12" />
      <P o={2} d="M8 16l8-6 8 5 10-9" />
    </>
  ),
  // Balance.
  Integrity: () => (
    <>
      <P o={0} d="M24 8v34" />
      <P o={1} d="M10 16h28" />
      <P o={2} d="M10 16l-5 12h10zM38 16l-5 12h10z" />
      <P o={3} d="M16 42h16" />
    </>
  ),
  // A repeat cycle that closes.
  Reliability: () => (
    <>
      <P o={0} d="M24 10a14 14 0 1 1-13 19" />
      <P o={1} d="M24 4l6 6-6 6" />
      <P o={2} d="M24 17v8l6 4" />
    </>
  ),
  // Hard hat.
  Safety: () => (
    <>
      <P o={0} d="M8 32a16 16 0 0 1 32 0" />
      <P o={1} d="M4 32h40" />
      <P o={2} d="M18 17V9h12v8" />
      <P o={3} d="M10 38h28" />
    </>
  ),
  // A gear that has been turned.
  Innovation: () => (
    <>
      <P o={0} d="M24 15a9 9 0 1 1 0 18a9 9 0 0 1 0-18" />
      <P o={1} d="M24 6v6M24 36v6M6 24h6M36 24h6" />
      <P o={2} d="M11 11l4 4M37 37l-4-4M37 11l-4 4M11 37l4-4" />
    </>
  ),
  // A target, struck.
  'Customer Focus': () => (
    <>
      <P o={0} d="M24 8a16 16 0 1 1 0 32a16 16 0 0 1 0-32" />
      <P o={1} d="M24 16a8 8 0 1 1 0 16a8 8 0 0 1 0-16" />
      <P o={2} d="M24 22v4M22 24h4" />
    </>
  ),
  // Linked crew.
  Teamwork: () => (
    <>
      <P o={0} d="M14 18a5 5 0 1 1 0 10a5 5 0 0 1 0-10M34 18a5 5 0 1 1 0 10a5 5 0 0 1 0-10" />
      <P o={1} d="M6 42v-4a8 8 0 0 1 16 0v4M26 42v-4a8 8 0 0 1 16 0v4" />
      <P o={2} d="M19 23h10" />
    </>
  ),
  // A mark of standing.
  Professionalism: () => (
    <>
      <P o={0} d="M24 6l14 6v12c0 9-6 15-14 18c-8-3-14-9-14-18V12z" />
      <P o={1} d="M17 24l5 5l10-10" />
    </>
  ),
};

export function ValueIcon({ title }: { title: string }) {
  const Icon = ICONS[title];

  return (
    <svg
      className="h-10 w-10"
      viewBox="0 0 48 48"
      fill="none"
      stroke="#1B2A4A"
      strokeWidth="1.6"
      strokeLinecap="butt"
      strokeLinejoin="round"
      strokeOpacity="0.7"
      aria-hidden="true"
      focusable="false"
    >
      {Icon ? <Icon /> : <P o={0} d="M8 24h32" />}
    </svg>
  );
}
