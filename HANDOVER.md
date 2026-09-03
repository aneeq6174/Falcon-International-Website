# Falcon International — handover

The site is built. All seven phases of `falcon-website-claude-code-brief.md` are
complete: fourteen sections, the continuous red line, the two centrepieces, the
preloader, and the mobile, reduced-motion and performance passes.

This document is what someone else needs to take it from here. `README.md` is the
engineering companion — architecture, the traps, and how to verify a scene.

---

## Run it

```bash
npm run dev
```

```bash
npm run build
```

`build` produces a Next server app. Deploy to **Vercel** (`git push`, or
`vercel` — it needs no configuration), or anywhere that runs Node.

Every page is still prerendered to static HTML at build time and served from the
CDN; only `/api/contact` runs on demand. The performance profile is unchanged.

The site is a server app rather than a static export **because the contact form
sends server-side** — a route handler cannot coexist with `output: 'export'`. To
go back to pure static, delete `app/api/contact/route.ts` and add
`output: 'export'` to `next.config.mjs`; the form falls back to the visitor's
mail app on its own.

The `/dev/*` verification harnesses return 404 in production — verified against a
production build, not assumed.

---

## What has to happen before launch

Three of these need the client, not a developer.

### 1. Add the SMTP credentials — BLOCKING

The contact form posts to `/api/contact`, which sends the enquiry through **your
own** `business@falconinternational.net.pk` mailbox. No form service, no third
party holding your leads.

It needs four values. Set them in **Vercel → Project → Settings → Environment
Variables** (and in a local `.env` if you want to test):

| Variable | Example |
|---|---|
| `SMTP_HOST` | `mail.falconinternational.net.pk` |
| `SMTP_PORT` | `587` (or `465`) |
| `SMTP_USER` | `business@falconinternational.net.pk` |
| `SMTP_PASS` | the mailbox password |

Get them from whoever hosts the email — in cPanel it's **Email Accounts →
Connect Devices**; on Google Workspace or Microsoft 365 it's in their SMTP docs.
`.env.example` in the repo is the template. **Never commit real values** — `.env`
is gitignored.

Until they are set the endpoint returns `503`, and the form quietly falls back to
composing the enquiry in the visitor's own mail app, addressed to you. So it is
never a dead control — but leads will be less reliable until this is done.

Replies work naturally: the email arrives from the site but `Reply-To` is the
enquirer, so hitting reply in your inbox goes straight to them.

**Test it after deploying:** submit the form on the live site and confirm the
email arrives. That is the one check worth doing by hand.

### 2. Client logo artwork

`content/site.ts → clients.logos` lists sixteen clients as text. S9 renders each
as a wordmark in the display face. When the artwork arrives, swap the contents of
the cell in `S9Clients.tsx`; the rails and the marquee do not change.

### 3. Photography

Every photo slot renders as a labelled navy placeholder at the correct aspect
ratio, captioned with what belongs there. To swap one in, set `src` on the slot in
`content/site.ts` — **one line per slot, no component changes.** The slots are the
founder's portrait and the two management portraits.

Per brief §10, no stock photography was used and none was generated.

### 4. A social card

`falcon-logo.png` is still the Open Graph image. It is the raw logo at 1536×1024,
not a 1200×630 card, so link previews will letterbox it. The page itself no longer
loads it at all. Replacing it is one line in `app/layout.tsx`.

---

## WhatsApp

A floating button, bottom-right on every screen, opens a chat with
**+92 301 4438752** and a prefilled first message. It is a plain link to `wa.me` —
no SDK, no embed, no third-party script.

The number and the prefilled text are in `content/site.ts` (`org.whatsapp`,
`whatsapp.message`). It is red rather than WhatsApp green because the brand
system is closed and red is the site's CTA colour; the glyph carries the
recognition. Say the word if you would rather have the green.

## Editing the copy

**Every user-visible string is in `content/site.ts`.** No component contains
hardcoded copy. Wording changes never require touching animation code — that was a
design constraint from the start, on the assumption the client would want edits.

One caveat, documented at the rule in `app/globals.css`: the four-up statistics
grid has about 40px of headroom at its ceiling. A value wider than `450+` — say
`1,200+` — will not fit, and the font ceiling must come down rather than being
allowed to overflow into the next column.

---

## Performance, measured

Taken from the **production export**, not the dev bundle.

| Budget (§6) | Target | Measured | |
|---|---|---|---|
| JS bundle | ≤ 300 kB gzipped | **169 kB** | ✅ |
| Total page weight | ≤ 3 MB | **~283 kB** gzipped (839 kB raw) | ✅ |
| LCP, simulated Fast 3G | ≤ 2.5s | not measured | ⚠️ |
| Sustained 60fps, 4× CPU throttle | 60fps | not measured | ⚠️ |

19 requests. 549 kB JS raw, 82 kB fonts, **0 kB images** — there is not a single
`<img>` on the page. The nav mark, the favicon and S13's closing reveal are all
vector, which removed the 1.26 MB logo PNG from the critical path entirely.

Zero elements carry `will-change` at rest, down from 54: `stroke-dashoffset` is
not a compositable property, so promoting it created no layer and only cost
memory.

**The two unverified rows need a real Lighthouse run and a real mid-range
Android.** Neither is available in the environment this was built in, and
estimating them would be guessing. Everything that could be measured here passes
with room to spare.

---

## Accessibility and SEO

- Every word is server-rendered. Nothing is injected on scroll — including the
  founder's full letter, which sits in a collapsed `<details>` rather than being
  conditionally rendered, and all 32 project rows behind the filter.
- One `h1`, heading order h1 → h2 → h3 → h4 with no skips.
- JSON-LD `Organization` + `LocalBusiness` in the static HTML.
- Skip-to-content link, visible focus rings, keyboard-operable filter and
  expander. Pinned sections do not trap focus.
- Counting numerals are `aria-hidden` with the true value in an `sr-only`
  sibling, so a screen reader never reads a mid-animation number.
- **Reduced motion is fully implemented and has been exercised**: no Lenis, no
  pinning, no scrubbing, no counters — the complete static site, with every
  figure at its final value.

---

## Known limitations

**The map is stylised.** `PakistanMap` is built from 49 real boundary
coordinates on a cos(latitude)-corrected projection, and its bounding box is
1.00 : 1 — Pakistan's true proportion. It is not survey-accurate and is not meant
to be. Jammu & Kashmir east of the Line of Control is drawn dashed and labelled
disputed territory, which is both the convention on Pakistani maps and the factual
position. **Worth a look from the client before launch.**

**S3 is not lazy-mounted.** Brief §6 asks for S3 and S8 to `kill()` their
timelines two viewports away. Killing a 600vh pin removes its spacer, changes
document height and jumps the reader's scroll position — worse than the cost it
saves. An inactive ScrollTrigger only compares scroll offsets and its tweens do
not update off-screen, so the runtime cost is already near zero. Revisit with a
profiler rather than reinstating it blind.

**The day counter in S12** is recomputed on the client on every load, so it does
not drift between deploys. The server-rendered value is the no-JS fallback and
will be as stale as the last build.

---

## If you change the red line

It is one continuous line across fourteen sections, and continuity is a contract
checked at build time:

```
segment[i].exitX === segment[i + 1].entryX
```

Change a path without changing its neighbour's hand-off and the build tells you.
`lib/redline.ts` has the full explanation, including two things that will
otherwise cost you an afternoon each: why the paths are generated in pixel space
rather than a normalised viewBox, and why dash maths uses a declared `pathLength`
instead of `getTotalLength()`.
