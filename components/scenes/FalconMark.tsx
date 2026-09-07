/**
 * FalconMark — the company's actual logo.
 *
 * This used to be a hand-traced SVG approximation, which was the wrong call. The
 * client's artwork is a falcon in profile — head, hooked beak, eye, and wings
 * built from separated feathers — and the trace was a blunt chevron with a bump
 * in the middle. It was never going to be their mark, and it was not.
 *
 * `/assets/falcon-mark.png` is extracted from the supplied `falcon-logo.png`:
 * the wings cropped away from the arced wordmark above them, flattened to the
 * logo's own red plus its alpha mask, and downscaled to 900px. The source is a
 * glossy presentation render, and its per-pixel colour noise was most of its
 * weight — 1.26 MB became 35 kB with the silhouette untouched.
 *
 * ── Why the wordmark is not here ──────────────────────────────────────────
 *
 * In the supplied file the arced "FALCON INTERNATIONAL" is #382D30 — near-black.
 * The site is navy almost everywhere, so it would be invisible. The name is set
 * in the site's own display face beside the mark instead, which is legible on
 * every background and costs nothing.
 *
 * Decorative by default: `alt=""`. Every call site that needs the company name
 * announced supplies it as real text or as an `sr-only` span.
 */

/** The exported asset's intrinsic size. Declared so the box is reserved. */
const MARK_W = 900;
const MARK_H = 337;

export function FalconMark({
  className,
  /** Above the fold — the nav and the preloader. Skips lazy-loading. */
  eager = false,
}: {
  className?: string;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/falcon-mark.png"
      alt=""
      width={MARK_W}
      height={MARK_H}
      data-falcon-mark
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      className={className}
    />
  );
}
