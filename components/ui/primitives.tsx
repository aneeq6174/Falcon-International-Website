/**
 * Shared presentational primitives.
 *
 * All of these are server components — no 'use client'. Phase 0's requirement is
 * that every word is in the server-rendered DOM, because text that only appears
 * after an animation is invisible to Google (brief §6).
 */

import type { PhotoSlot } from '@/content/site';

/* ------------------------------------------------------------------ */
/* Section shell                                                       */
/* ------------------------------------------------------------------ */

type Tone = 'navy' | 'paper' | 'white';

const toneClasses: Record<Tone, string> = {
  navy: 'bg-navy text-white',
  paper: 'bg-paper text-ink',
  white: 'bg-white text-ink',
};

/**
 * Static sections use this shell. Animated ones (S1, S2) write their own
 * <section> so they can attach a ref for the pin trigger — this module is
 * imported by Server Components too, and forwardRef is not available there.
 * `SECTION_SHELL` keeps the class list in one place regardless.
 */
export const SECTION_SHELL = 'relative isolate overflow-hidden py-section';

export function Section({
  id,
  tone = 'paper',
  children,
  className,
  labelledBy,
}: {
  id: string;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${SECTION_SHELL} ${toneClasses[tone]} ${className ?? ''}`}
    >
      {children}
    </section>
  );
}

/** Tone class lookup, exported for sections that build their own shell. */
export const sectionTone = toneClasses;

/** Wraps section content so it sits above the red line's absolute layer. */
export function SectionBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`shell relative z-10 ${className ?? ''}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Type                                                                */
/* ------------------------------------------------------------------ */

/**
 * Small uppercase label with wide tracking, exactly like the deck.
 *
 * `as` exists because several sections carry no display headline — the eyebrow
 * IS the section title. Rendering those as <p> would leave their h3 children
 * with no h2 above them and break the h1 → h2 → h3 order the brief requires
 * (§6). Pass `as="h2"` whenever the eyebrow is a section's only title.
 */
export function Eyebrow({
  children,
  tone = 'navy',
  className,
  as: Tag = 'p',
  id,
}: {
  children: React.ReactNode;
  tone?: 'navy' | 'white';
  className?: string;
  as?: 'p' | 'h2' | 'h3';
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`eyebrow ${tone === 'white' ? 'text-white/70' : 'text-navy/70'} ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  id,
  children,
  className,
  as: Tag = 'h2',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}) {
  return (
    <Tag id={id} className={`text-h2 uppercase ${className ?? ''}`}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

/**
 * The final value is what renders on the server — the count-up is a visual
 * overlay on a number that is already in the DOM, so the figures survive with JS
 * off and are what a crawler sees.
 *
 * The counting numeral is aria-hidden with the true value carried by an sr-only
 * sibling. Otherwise a screen reader arriving mid-scrub would read whatever
 * intermediate number happened to be on screen.
 *
 * `data-stat-anchor` is what the S2 strand builder measures to place the fork.
 */
export function Stat({
  value,
  suffix,
  countFrom = 0,
  label,
  sub,
  tone = 'ink',
  size = 'primary',
}: {
  value: number | string;
  suffix?: string;
  /** Where the count starts. The zero-fatalities stat counts DOWN to its value. */
  countFrom?: number;
  label: string;
  sub?: string;
  tone?: 'ink' | 'white';
  /** `compact` for secondary figures that share a frame with other content. */
  size?: 'primary' | 'compact';
}) {
  const display = typeof value === 'number' ? value.toLocaleString('en-US') : value;

  return (
    // min-w-0: a grid track's default `min-width: auto` lets an over-wide
    // numeral push its neighbours instead of being contained.
    <div className="flex min-w-0 flex-col gap-3" data-stat-block>
      <p
        className={`tabular font-display font-bold text-red ${
          size === "compact" ? "stat-numeral-compact" : "stat-numeral"
        }`}
        data-stat-anchor
      >
        <span className="sr-only">
          {display}
          {suffix ?? ''}
        </span>
        <span
          aria-hidden="true"
          data-count-to={typeof value === 'number' ? value : undefined}
          data-count-from={countFrom}
        >
          {display}
        </span>
        {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      </p>
      <div className="flex flex-col gap-1">
        <p
          className={`font-display text-h3 font-semibold uppercase tracking-tight ${
            tone === 'white' ? 'text-white' : 'text-navy'
          }`}
        >
          {label}
        </p>
        {sub ? (
          <p className={`text-sm ${tone === 'white' ? 'text-white/60' : 'text-grey'}`}>{sub}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function Button({
  href,
  children,
  variant = 'primary',
  type,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors duration-200';

  const variants = {
    primary: 'bg-red text-white hover:bg-[#c72b20]',
    secondary: 'border border-current text-current hover:bg-current/10',
    ghost: 'text-current underline underline-offset-4 hover:text-red',
  };

  const classes = `${base} ${variants[variant]} ${className ?? ''}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type ?? 'button'} className={classes}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

export function ScopeList({
  items,
  label,
  tone = 'ink',
}: {
  items: readonly string[];
  label?: string;
  tone?: 'ink' | 'white';
}) {
  return (
    <div className="flex flex-col gap-3">
      {label ? <Eyebrow tone={tone === 'white' ? 'white' : 'navy'}>{label}</Eyebrow> : null}
      <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className={`flex gap-3 text-sm leading-relaxed ${
              tone === 'white' ? 'text-white/75' : 'text-grey'
            }`}
          >
            <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-red" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Inline dot-separated run of terms, as used for sectors and disciplines. */
export function TermRun({
  items,
  tone = 'ink',
  className,
}: {
  items: readonly string[];
  tone?: 'ink' | 'white';
  className?: string;
}) {
  return (
    <p
      className={`text-sm leading-relaxed ${
        tone === 'white' ? 'text-white/70' : 'text-grey'
      } ${className ?? ''}`}
    >
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 ? <span aria-hidden="true" className="px-2 text-red">·</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Photography placeholders                                            */
/* ------------------------------------------------------------------ */

const ratioToPadding = (ratio: string): string => {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return '66.66%';
  return `${(h / w) * 100}%`;
};

/**
 * The client has not supplied production photography. Every photo slot renders
 * as a labelled navy block at the correct aspect ratio, captioned with what
 * belongs there. To swap in a real image set `src` on the slot in site.ts —
 * one line per slot, no component changes. No stock photos (brief §10).
 */
export function PhotoPlaceholder({ slot, className }: { slot: PhotoSlot; className?: string }) {
  if (slot.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slot.src}
        alt={slot.alt}
        className={`w-full object-cover ${className ?? ''}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={`relative w-full bg-navy ${className ?? ''}`}
      style={{ paddingBottom: ratioToPadding(slot.ratio) }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-white/10 p-6 text-center">
        <span aria-hidden="true" className="rule-red" />
        <span className="font-display text-xs uppercase tracking-widest text-white/50">
          {slot.caption}
        </span>
        <span className="text-[0.625rem] uppercase tracking-widest text-white/25">
          {slot.ratio}
        </span>
      </div>
    </div>
  );
}
