'use client';

/**
 * Shared scene machinery — the build vocabulary and the counters.
 *
 * ── The build vocabulary ──────────────────────────────────────────────────
 *
 * Artwork declares HOW each element arrives, and `buildScene` animates it
 * without knowing anything about the drawing:
 *
 *   data-build="draw"    stroke draws on — pipe runs, circuit traces, outlines
 *   data-build="rise"    scales up from its own base — columns, cabinets, silos
 *   data-build="swing"   rotates into alignment — spools, solar panels, doors
 *   data-build="walk"    translates in from the left — crews arriving on site
 *   data-build="grow"    scales from its centre — vessels, crates, pins
 *   data-build="flash"   a brief pulse — weld arcs, vents, sparks
 *   data-build="spin"    rotates through the scene's window — impellers, fans
 *
 * plus `data-order` for stagger. Add a new structure and it animates; no
 * timeline edit. Nothing here uses a plain fade: the brief is explicit that
 * things BUILD themselves rather than fading in.
 *
 * `spin` is scrubbed like everything else rather than looping. A free-running
 * loop would keep a compositor layer alive off-screen for no benefit, and a
 * scrubbed rotation reads as machinery driven by the reader instead of idling.
 */

import { gsap } from './gsap';

/** Everything a build touches, for resting/settle states. */
export const SCENE_BUILD_SELECTOR =
  '[data-build="draw"],[data-build="rise"],[data-build="swing"],[data-build="walk"],' +
  '[data-build="grow"],[data-build="flash"],[data-build="spin"]';

/**
 * Applies one scene's build to a timeline.
 *
 * @param at        position in the timeline, in its units
 * @param duration  how long the whole build takes, in the same units
 */
export function buildScene(
  tl: gsap.core.Timeline,
  root: Element,
  at: number,
  duration: number,
  ease = 'power2.out',
) {
  const pick = (kind: string) =>
    Array.from(root.querySelectorAll(`[data-build="${kind}"]`)).sort(
      (a, b) => Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order')),
    );

  const stagger = (n: number) => (n > 1 ? (duration * 0.55) / n : 0);

  const draw = pick('draw');
  if (draw.length) {
    gsap.set(draw, { strokeDasharray: 100, strokeDashoffset: 100 });
    tl.to(
      draw,
      { strokeDashoffset: 0, duration: duration * 0.7, ease, stagger: stagger(draw.length) },
      at,
    );
  }

  const rise = pick('rise');
  if (rise.length) {
    gsap.set(rise, { transformOrigin: '50% 100%', scaleY: 0 });
    tl.to(rise, { scaleY: 1, duration: duration * 0.6, ease, stagger: stagger(rise.length) }, at);
  }

  const swing = pick('swing');
  if (swing.length) {
    gsap.set(swing, { transformOrigin: '0% 100%', rotate: -78, opacity: 0 });
    tl.to(
      swing,
      { rotate: 0, opacity: 1, duration: duration * 0.65, ease, stagger: stagger(swing.length) },
      at + duration * 0.1,
    );
  }

  const walk = pick('walk');
  if (walk.length) {
    gsap.set(walk, { x: -70, opacity: 0 });
    tl.to(
      walk,
      { x: 0, opacity: 1, duration: duration * 0.55, ease, stagger: stagger(walk.length) },
      at + duration * 0.2,
    );
  }

  const grow = pick('grow');
  if (grow.length) {
    gsap.set(grow, { transformOrigin: '50% 50%', scale: 0 });
    tl.to(
      grow,
      { scale: 1, duration: duration * 0.5, ease, stagger: stagger(grow.length) },
      at + duration * 0.3,
    );
  }

  const spin = pick('spin');
  if (spin.length) {
    gsap.set(spin, { transformOrigin: '50% 50%', rotate: 0 });
    tl.to(spin, { rotate: 300, duration: duration * 1.6, ease: 'none' }, at + duration * 0.2);
  }

  // Weld arcs, sparks and vents: a pulse, not a state change.
  const flash = pick('flash');
  if (flash.length) {
    gsap.set(flash, { opacity: 0, transformOrigin: '50% 50%', scale: 0.5 });
    flash.forEach((el, i) => {
      const t = at + duration * 0.45 + i * (duration * 0.08);
      tl.to(el, { opacity: 1, scale: 1.15, duration: duration * 0.1, ease: 'power4.out' }, t).to(
        el,
        { opacity: 0.18, scale: 1, duration: duration * 0.22, ease: 'power2.out' },
        t + duration * 0.1,
      );
    });
  }
}

/** Puts every built element in its finished state. Used by `settle`. */
export function settleScene(targets: Element[]) {
  gsap.set(targets, {
    strokeDasharray: 'none',
    strokeDashoffset: 0,
    scaleY: 1,
    scale: 1,
    rotate: 0,
    x: 0,
    opacity: 1,
    clearProps: 'willChange',
  });
}

/* ------------------------------------------------------------------ */
/* Line splitting                                                      */
/* ------------------------------------------------------------------ */

/**
 * Wraps each rendered LINE of a text block so it can be masked and raised.
 *
 * Words are wrapped, measured, grouped by their vertical offset into the lines
 * the browser actually laid out, and each line is re-wrapped in an
 * overflow-hidden box with an inner span to translate. Returns the inner spans.
 *
 * ── Why it is safe ────────────────────────────────────────────────────────
 *
 * The copy is server-rendered and stays in the DOM; this only re-wraps existing
 * text, so nothing is injected on scroll and there is nothing for a crawler to
 * miss (§6). The wrapper carries no ARIA, so assistive technology reads the same
 * words in the same order.
 *
 * It must NOT run under reduced motion — there is nothing to reveal, and
 * splitting text for no reason is pure risk. Callers gate it.
 *
 * Returns an empty array if the block has already been split or looks unsafe to
 * touch, so calling it twice is harmless.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('[data-line-inner]'));
  }

  const text = el.textContent ?? '';
  if (!text.trim() || el.children.length > 0) return [];

  const words = text.trim().split(/\s+/);
  el.textContent = '';

  const probes = words.map((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + (i < words.length - 1 ? ' ' : '');
    el.appendChild(span);
    return span;
  });

  // Group by the top offset the browser gave each word.
  const lines: string[][] = [];
  let currentTop: number | null = null;
  probes.forEach((span) => {
    const top = span.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) > 2) {
      currentTop = top;
      lines.push([]);
    }
    lines[lines.length - 1].push(span.textContent ?? '');
  });

  el.textContent = '';
  const inners: HTMLElement[] = [];

  lines.forEach((line) => {
    const outer = document.createElement('span');
    outer.style.display = 'block';
    outer.style.overflow = 'hidden';

    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.dataset.lineInner = '';
    inner.textContent = line.join('');

    outer.appendChild(inner);
    el.appendChild(outer);
    inners.push(inner);
  });

  el.dataset.split = 'done';
  return inners;
}

/* ------------------------------------------------------------------ */
/* Counters                                                            */
/* ------------------------------------------------------------------ */

export type Counter = { el: HTMLElement; from: number; to: number };

export const formatCount = (n: number): string => Math.round(n).toLocaleString('en-US');

/**
 * Reads the count metadata the `Stat` primitive renders. The final value is
 * already in the server-rendered DOM; the count is an overlay on a number that
 * is there whether or not the animation runs.
 */
export function readCounters(nodes: Element[]): Counter[] {
  return nodes.flatMap((node) => {
    const el = node as HTMLElement;
    const to = Number(el.dataset.countTo);
    const from = Number(el.dataset.countFrom ?? '0');
    if (!Number.isFinite(to) || !Number.isFinite(from)) return [];
    return [{ el, from, to }];
  });
}

/**
 * A count as a tween on a proxy, writing textContent on update.
 *
 * `duration` is in TIMELINE units. Under scrub that reads as scroll distance
 * rather than seconds — a scrubbed counter running on a wall clock would finish
 * while the reader was still arriving.
 */
export function countTween(c: Counter, duration: number): gsap.core.Tween {
  const proxy = { v: c.from };
  return gsap.to(proxy, {
    v: c.to,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      c.el.textContent = formatCount(proxy.v);
    },
  });
}

/** Snaps counters to their final values — reduced motion, and settle states. */
export function settleCounters(counters: Counter[]) {
  counters.forEach((c) => {
    c.el.textContent = formatCount(c.to);
  });
}

/** Resets counters to their starting values before a build runs. */
export function resetCounters(counters: Counter[]) {
  counters.forEach((c) => {
    c.el.textContent = formatCount(c.from);
  });
}

/**
 * Failsafe for a reveal that never gets to run.
 *
 * Every reveal starts its content at `opacity: 0` and animates it in, which
 * makes the animation load-bearing: if it does not run, the content is not
 * merely un-animated, it is INVISIBLE. GSAP drives tweens off
 * requestAnimationFrame, and rAF can be starved — a background tab, an occluded
 * window, a device under load. A reader can otherwise arrive at a section that
 * simply is not there, which is unacceptable for a contact form.
 *
 * `setTimeout` does not depend on rAF. It is throttled in a background tab but
 * still fires, so this guarantees the finished state whatever happens to the
 * frame loop. In the normal case the animation completed long ago and this does
 * nothing.
 *
 * Attach as a ScrollTrigger's `onEnter`. Safe to fire more than once.
 */
export function guaranteeReveal(self: { animation?: gsap.core.Animation | null }): void {
  const anim = self.animation;
  if (!anim) return;
  setTimeout(() => {
    // The scene may have been reverted between the trigger firing and this
    // running — a breakpoint change, a rebuild, a navigation. Never let the
    // failsafe become the failure.
    try {
      if (anim.progress() < 1) anim.progress(1);
    } catch {
      /* the animation is gone; there is nothing left to guarantee */
    }
  }, 2500);
}

/**
 * ── Why no reveal uses `once: true` ───────────────────────────────────────
 *
 * It looks like exactly the right flag: play once, then stop caring. It is not,
 * and it took a crash to find out.
 *
 * GSAP implements `once` by calling `self.kill()` from inside the toggle
 * (ScrollTrigger.js:1772), and `kill()` splices the trigger out of the shared
 * `_triggers` array (:1890). Meanwhile `refresh()` walks that same array by
 * index and reads `_triggers[i].end` WITHOUT a bounds guard (:1365 — note the
 * neighbouring read at :1406 does guard it with `|| {}`). So a refresh that
 * activates several `once` triggers at the same moment shrinks the array
 * underneath its own loop and reads past the end:
 *
 *     TypeError: Cannot read properties of undefined (reading 'end')
 *
 * Which is precisely what a nav link does: the hash jump lands the reader deep
 * in the page, past a dozen triggers at once, and the refresh that follows
 * fires them all together.
 *
 * GSAP's DEFAULT `toggleActions` — "play none none none" — already does what we
 * want: play on first enter, never reverse, never replay backwards. Nothing is
 * killed, so nothing mutates the array mid-refresh. Do not add `once: true`.
 */


/**
 * Where a reveal fires.
 *
 * Most of these used to be `top 85%`, which puts the trigger only 15% of a
 * viewport above the fold. For a section 700 to 4,000px tall that meant the
 * reveal ran AND finished while the reader was still looking at the section
 * before it — they arrived to something already over, and never saw it.
 *
 * The hero never had this problem, because it is on screen at load. That is why
 * it was the one that felt right, and it is the feel these two values restore.
 *
 * Use SECTION for a trigger watching a whole section: it holds off until the
 * section is genuinely the thing on screen. Use ITEM for a row, card or panel
 * INSIDE a section the reader is already in — those are small, so they should
 * animate as they rise into view rather than waiting until they are centred.
 */
export const SECTION_REVEAL_START = 'top 62%';
export const ITEM_REVEAL_START = 'top 80%';
