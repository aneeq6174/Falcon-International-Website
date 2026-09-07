# Falcon International — handover

The site is built. Fourteen sections, the continuous red line, the preloader, and
the mobile, reduced-motion and performance passes.

**The site is three pages.** `/` carries the story; `/capabilities` and
`/track-record` hold the detail that was making the home page 21 screens long.
The home page summarises each and links to it. Internal links are root-relative
so the shared nav works from all three.

**One thing to know before you touch the animation:** nothing pins
and nothing scrubs. Every scene plays once when it comes into view and stays.
It used to hold 1,850vh of pinned scrolling, which meant content flew past at a
speed nobody could read and could only be recovered by scrolling to an exact
pixel. If you are tempted to reintroduce a pinned section, read the motion-model
section at the top of `README.md` first.

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

These need the client, not a developer. The form and the company mark are done.

### 1. The contact form — DONE, but know how to fix it

Live and delivering to `business@falconinternational.net.pk` via **Zoho Mail**
over SMTP. No form service, no third party holding the leads. Replies work
naturally: the mail arrives from the site but `Reply-To` is the enquirer, so
hitting reply in the inbox goes straight to them.

Configured in **Vercel → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp.zoho.com` — follows the Zoho data centre (`.eu`, `.in`) |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `business@falconinternational.net.pk` |
| `SMTP_PASS` | a Zoho **app password**, not the account login password |

Two things that will otherwise cost an afternoon:

- **Zoho refuses SMTP with the login password** when 2FA is on. It needs an app
  password from *Zoho → My Account → Security → App Passwords*. Rotating the
  Zoho password does not invalidate it; deleting it there does.
- **Vercel attaches environment variables at build time.** Editing a value
  changes nothing until you *redeploy*. This is the single most likely reason a
  working form stops working.

**Diagnosing it: open `/api/contact/` in a browser.** It reports whether each
variable is present — names only, never values, so it is safe on a public URL:

```json
{"configured":true,"hasHost":true,"hasUser":true,"hasPass":true,
 "port":"465","smtpKeysPresent":["SMTP_HOST",…],"vercelEnv":"production"}
```

- `configured: false` with `smtpKeysPresent: []` → not attached to this
  deployment. Wrong Environment, or it was built before the variables existed.
- `configured: false` but the keys **are** listed → they exist with blank
  values. This actually happened; Vercel masks values, so it looks identical to
  a correct setup.
- `configured: true` but sending fails → the browser console prints nodemailer's
  error code. `EAUTH` is a rejected password (Zoho's free plan blocks SMTP
  entirely — Mail Lite is the cheapest fix); `ECONNECTION`/`ETIMEDOUT` is the
  wrong host or port.

There is deliberately **no `mailto:` fallback**. An earlier version opened the
visitor's mail app when the endpoint failed, which turned a misconfiguration into
a baffling "choose an application" dialog. It now says it failed and points at
WhatsApp.

`.env.example` is the template. **Never commit real values** — `.env` is
gitignored.

### 2. The company mark — done, and how it was made

The nav, the preloader, the favicon and S13's closing reveal all use
`/public/assets/falcon-mark.png`. That is **the client's own artwork**, not an
interpretation: the falcon cropped out of the supplied `falcon-logo.png`,
flattened to the logo's red plus its alpha mask, and downscaled to 900px —
1.26 MB to 35 kB with the silhouette untouched. `app/icon.png` is the same crop
at 180x180.

The arced "FALCON INTERNATIONAL" wordmark in the source file is **#382D30, which
is near-black**, so it disappears on the navy this site uses almost everywhere.
The name is set in the site's own display face beside the mark instead. If the
client supplies a reversed (white) wordmark, it can go back in.

To regenerate either file after new artwork arrives, the extraction is described
in the header of `components/scenes/FalconMark.tsx`.

### 3. Client logo artwork

`content/site.ts → clients.logos` lists sixteen clients as text. S9 renders each
as a wordmark in the display face. When the artwork arrives, swap the contents of
the cell in `S9Clients.tsx`; the rails and the marquee do not change.

### 4. Photography

Every photo slot renders as a labelled navy placeholder at the correct aspect
ratio, captioned with what belongs there. To swap one in, set `src` on the slot in
`content/site.ts` — **one line per slot, no component changes.** The slots are the
founder's portrait and the two management portraits.

Per brief §10, no stock photography was used and none was generated.

### 5. A social card

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

Taken from the **production build**, not the dev bundle. Removing Lenis and
every pinned timeline took first-load JS from 169 kB to 162 kB gzipped.

| Budget (§6) | Target | Measured | |
|---|---|---|---|
| JS bundle | ≤ 300 kB gzipped | **162 kB** | ✅ |
| Total page weight | ≤ 3 MB | **~283 kB** gzipped (839 kB raw) | ✅ |
| LCP, simulated Fast 3G | ≤ 2.5s | not measured | ⚠️ |
| Sustained 60fps, 4× CPU throttle | 60fps | not measured | ⚠️ |

511 kB JS raw across 14 chunks, 82 kB fonts, **39 kB images** — the company mark
(35 kB) and the favicon (4 kB), and nothing else. The supplied 1.26 MB
`falcon-logo.png` is never fetched by the page. The nav mark, the favicon and S13's closing reveal all use one 35 kB crop of
the client's own logo instead of the 1.26 MB original.

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
  expander. Nothing pins, so nothing traps focus or hides content behind a
  scroll offset.
- Counting numerals are `aria-hidden` with the true value in an `sr-only`
  sibling, so a screen reader never reads a mid-animation number.
- **Reduced motion is fully implemented and has been exercised**: no animation
  and no counters — the complete static site, with every figure at its final
  value. Verified with `?reduced=1`: 0 ScrollTriggers, 0/24 line strands hidden,
  0/262 artwork elements hidden, every counter final.

---

## Known limitations

**The map is stylised.** `PakistanMap` is built from 49 real boundary
coordinates on a cos(latitude)-corrected projection, and its bounding box is
1.00 : 1 — Pakistan's true proportion. It is not survey-accurate and is not meant
to be. Jammu & Kashmir east of the Line of Control is drawn dashed and labelled
disputed territory, which is both the convention on Pakistani maps and the factual
position. **Worth a look from the client before launch.**

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
