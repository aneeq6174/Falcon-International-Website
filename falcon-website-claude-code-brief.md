# BUILD BRIEF — Falcon International Scrollytelling Website

> Paste this entire file into Claude Code as your first message, in an empty project directory.
> Then say: **"Read the brief. Confirm the plan back to me in 10 lines, then build Phase 0 and Phase 1 only."**
> Do not let it build all 14 sections in one pass.

---

## 1. What we are building

A single-page marketing website for **Falcon International**, an industrial contracting company in Lahore, Pakistan (founded 1997). The site is a **scroll-scrubbed narrative** — as the user scrolls, pinned sections play through animated sequences frame by frame, like scrubbing a video. Content is laid into each frame rather than sitting in static blocks.

Reference behaviour: Apple product pages, Rolls-Royce, Igloo Inc. Scroll drives a GSAP timeline via `ScrollTrigger` with `pin: true` and `scrub`.

**This is a credibility site, not a showreel.** The client sells heavy industrial work to Unilever, OGDCL and Lucky Core Industries. The animation must read as engineered and precise, never bouncy, playful or "startup". Every motion should feel like machinery: weighted, mechanical, deliberate.

---

## 2. The central creative device — THE RED LINE

There is **one continuous red line** (`#E23327`) that runs the entire length of the page. It is drawn as SVG `stroke-dashoffset` scrubbed by scroll. It is the through-line of the whole story and it never breaks — it only transforms.

Its states, in order:

| Section | What the line becomes |
|---|---|
| Hero | A blueprint construction line drawing a plant |
| At a Glance | Splits into 4 branches, one per statistic |
| The Journey | The ground/pipeline the camera travels along through time |
| Where We Work | The route across Pakistan, shooting out to each province |
| Values | Coils into an 8-cell grid |
| Mission & Vision | Forks into two, then reconverges |
| Leadership | A single vertical spine down the org |
| Capabilities | A manifold header pipe with 6 valves feeding 6 services |
| Clients | Flattens into rails carrying logos |
| Track Record | The timeline axis of the project index |
| Quality | Forms a checkmark path through certifications |
| Safety | Curves and closes into a giant **0** |
| Contact | Rises and redraws itself into the Falcon logo — the loop closes |

This single device is what makes the site feel like one animated film instead of fourteen separate animated sections. **Do not lose the line between sections.** It must exit the bottom of one section at the same x-position it enters the next.

---

## 3. Brand system (extracted from the client's own profile deck — do not invent alternatives)

```
--navy:        #1B2A4A   /* primary — backgrounds, headings */
--red:         #E23327   /* accent — THE LINE, numbers, rules, CTAs */
--ink:         #221F1F   /* body text on light */
--grey:        #5E5F5F   /* secondary text */
--paper:       #F3F4F3   /* light section background */
--white:       #FFFFFF
```

- **Red is structural, never decorative.** It is the line, key numerals, and CTAs. Nothing else.
- Typography: a tight industrial grotesk. Use **Archivo** or **Inter Tight** for headings (uppercase, tracking-tight, weight 600–700) and **Inter** for body. Load via `next/font` with `display: swap`.
- Numerals in stats are huge (`clamp(4rem, 12vw, 11rem)`), red, tabular-nums.
- Section eyebrows are small uppercase navy with wide tracking, exactly like the deck.
- Logo is at `/public/assets/falcon-logo.png` (red falcon with spread wings, "FALCON INTERNATIONAL" arced above). Its wing geometry is the source for the loading animation and the final Contact reveal.

---

## 4. Tech stack — use exactly this

```
Next.js 14 (App Router) + TypeScript
Tailwind CSS
GSAP 3 core + ScrollTrigger        (animation engine)
Lenis (studio-freight)             (smooth scroll — MIT, no licensing risk)
SVG for ALL scene artwork          (not PNG sequences, not video)
next/image for photography (AVIF + WebP)
```

Static export (`output: 'export'`) so it can deploy to Cloudflare Pages / Netlify / Vercel free tier, or a cheap Pakistani host.

**Explicitly do NOT use:**
- Three.js / React Three Fiber — kills mobile performance in Pakistan on mid-range Android, and requires 3D assets nobody has. Not in scope.
- PNG/JPG image sequences (the Apple technique) — 200+ frames is 30MB+ of assets. Unacceptable on 4G.
- Framer Motion for the scrubbed sequences — it does not do scroll-scrubbed pinning well. (It's fine for small UI micro-interactions only.)
- Any animation library not listed above.

**All scene artwork is hand-authored inline SVG**, animated with GSAP. Pipes, plants, scaffolds, solar panels, cranes, the Pakistan map — all vector line-art in navy/white/red. This keeps the whole site under ~400KB of scene assets and lets every element be individually animated.

---

## 5. Section-by-section storyboard

Build in this order. Each section below lists **the frame**, **the motion**, and **the copy** (copy is final — use it verbatim).

---

### S0 — Preloader (max 2.0s, hard timeout)
**Frame:** Navy full screen. **Motion:** Falcon logo draws in as stroke paths — the arced wordmark first, then the wings sweeping outward from the body. A red progress rule fills left-to-right underneath with a `00 → 100` tabular counter. On complete, the mark scales down and flies into the top-left nav position.
**Rule:** If assets aren't loaded in 2s, dismiss anyway. Never trap the user.

### S1 — Hero (pinned, 150vh scroll distance)
**Frame:** Navy field with a faint white blueprint grid. **Motion:** As the user scrolls, a technical line-drawing of an industrial plant *constructs itself* — foundation lines, then vertical columns rising, then pipe runs connecting, then a boiler stack, then a distillation tower. Around 60% progress the blueprint linework transitions to solid silhouette (stroke→fill crossfade) and a horizon glow rises behind it. At 100%, the red line is born at the base of the structure and begins descending toward S2.

**Copy:**
- Eyebrow: `EST. 1997 · LAHORE, PAKISTAN`
- H1: `FALCON INTERNATIONAL`
- Sub: `Your Industrial Contracting Partner`
- Rule, then: `Manpower · General Orders · Electrical · Mechanical · Fabrication`
- CTA: `Start a project` / secondary `Download profile`

### S2 — At a Glance (pinned, 100vh)
**Frame:** Paper background. The red line drops from S1 and splits into four branches.
**Motion:** Each branch reaches a stat, which then counts up (GSAP, ~1.2s, ease `power2.out`, tabular numerals so width doesn't jitter). The fourth is special: the counter runs *down* to `0` and holds, and the whole section pauses for a beat before the branches reunite into one line.

| Number | Label | Sub |
|---|---|---|
| `29` | Years in operation | Established 1997, Pakistan |
| `80+` | Projects delivered | Industrial contracts since 1997 |
| `450+` | Team strength | 50+ staff · 400+ site workforce |
| `0` | Work fatalities | Zero since founding |

Below, two quiet blocks:
- `SECTORS SERVED` — Textile · Chemicals · Paper & Pulp · Steel · Automotive · Power Generation · Food Processing · FMCG · Retail
- `KEY CLIENTS` — Unilever Pakistan Foods · Lucky Core Industries (Polyester, Soda Ash, Paints) · OGDCL · Habib Metro (Pvt.) Ltd. · Nutrico Morinaga (Pvt.) Ltd.

### S3 — The Journey ★ THE CENTREPIECE (pinned, 600vh scroll distance)
**This is the section that makes or breaks the site. Budget the most time here.**

**Frame:** A horizontal world. The red line is the *ground*. The viewport is a camera tracking left-to-right along it. As scroll progresses, the camera travels 1997 → 2026, and industrial structures **build themselves** along the line as they enter frame, then recede into a growing skyline behind.

**Motion:** One master GSAP timeline, `scrub: 1`. Camera x-translation is linear; each milestone has its own nested build animation triggered by camera proximity. Structures that pass behind the camera shrink and desaturate into a parallax back-layer, so by the end you're looking at everything Falcon has ever built, standing together.

Milestones in order — each gets a year, a title, one line of body, and a structure that assembles:

1. **1997 — Founded in Lahore.** A small workshop shed erects: 4 columns, a truss, a roof. *Established as a specialist piping and steel-structure fabrication crew for process industries.*
2. **1998 — First LCI Polyester line.** Pipe spools fly in and weld together into Line 4; weld flashes at each joint. *First major industrial contract: fabrication and erection of Polyester Line 4 for LCI.*
3. **2005 — Polyester Line 6.** A second identical line assembles beside the first — repeat business made visual. *Complete fabrication and erection of Polyester Line 6 — repeat business earned at LCI.*
4. **2010 — LCI Polyester manpower.** 50 small hard-hat figures walk in and take positions along the line. *Manpower services began at LCI Polyester — grown to 50+ workers on site today.*
5. **2013 — Entry into power.** A CFB power house rises; the stack draws upward and vents. *Fabrication of a CFB power house; structural, mechanical and piping works.*
6. **2015 — LCI Soda Ash manpower.** The figure crowd multiplies to 150. *Manpower services began at LCI Soda Ash — 150+ workers deployed on site today.*
7. **2016 — 18 MW CFB power plant.** Pylons rise and an electric charge visibly travels *along the red line itself*, lighting it white for a moment. *Electrical & instrumentation package for an 18 MW CFB plant — valued at PKR 38.5 million.*
8. **2019 — Oil & gas milestones.** A wellhead/derrick and a DCS console screen. *DCS works for OGDCL and services at the MOL gas field; entry into the upstream sector.*
9. **2019 — Nutrico Morinaga.** Packaging line, 100 figures. *Approved manpower supplier to Nutrico Morinaga (Pvt.) Ltd. — 100+ workers on site today.*
10. **2024 — Second 1 MW solar EPC.** A solar array unfolds panel by panel and tilts to track the sun; the red line briefly warms to gold. *Engineering, procurement and construction of the company's second 1 MW solar power project.*
11. **2025 — LCI Soda Ash projects.** Biomass silo + boiler assemble. *Biomass project (2024) and boiler project (2024–25) delivered at LCI Soda Ash.*
12. **2026 — Habib Metro approved vendor.** The red line **becomes an armoured cable** — its stroke thickens and gains a braided texture — laid into a trench. *Approved vendor of Habib Metro Pakistan (Pvt.) Ltd., armoured cable laying project delivered.*
13. **2026 — Unilever Foods partnership.** *Approved vendor and manpower supplier to Unilever Foods Pakistan Ltd. — 10+ workers deployed.*
14. **TODAY — Every client, still a client.** Camera pulls back. The entire 29-year skyline is revealed in one wide shot. *Our relationship doesn't end when the deal is done. We believe every client deserves the same level of attention, respect, and commitment, whether they are working with us for the first time, or have been with us for years.*

**Mobile (<768px):** Do NOT pin. Convert to a vertical scroll timeline — the red line runs top-to-bottom, each milestone reveals its structure on entry with a simple 400ms build. Same content, same artwork, no scrubbing.

### S4 — Where We Work (pinned, 150vh)
**Frame:** Navy. A vector map of Pakistan with provincial borders.
**Motion:** Map outline draws itself (stroke-dashoffset). The red line arrives from S3, plants a pulsing HQ marker at Lahore, then fires three routes outward; each terminus drops a pin and a counter spins up. Finally two thin dashed arcs leave the frame's western edge toward the Gulf and Egypt.

- `65+` Projects in Punjab · `10+` Projects in Sindh · `5+` Projects in KPK
- `HEAD OFFICE` marker: Lahore
- `BEYOND PAKISTAN` — Business process outsourcing services delivered to clients in the Gulf and Egypt.

### S5 — Values (not pinned — deliberate pacing relief)
**Frame:** Paper. 8-cell grid, 4×2 desktop / 2×4 mobile.
**Motion:** The red line coils into the grid gutters. Each card's line-art icon draws itself on entry, staggered 80ms. Keep this section calm — the user has just been through 600vh of the Journey and needs to breathe.

Excellence · *Quality and superior service in everything we do.*
Integrity · *Honesty, transparency and ethical conduct.*
Reliability · *Delivering on promises, consistently.*
Safety · *Our people, clients and communities come first.*
Innovation · *Creativity and continuous improvement.*
Customer Focus · *Understanding and exceeding client expectations.*
Teamwork · *Collaboration across diverse skills.*
Professionalism · *Respect and courtesy in every interaction.*

### S6 — Mission & Vision (light parallax)
**Frame:** Two full-height panels, navy and paper. The line forks at the top and reconverges at the bottom.
**Motion:** Text rises on a mask-reveal per line, offset between the two panels so they feel like a conversation.

- **OUR MISSION** — To be the preferred partner for our clients — delivering tailored industrial solutions that exceed expectations, and building long-lasting relationships based on trust, integrity and mutual respect.
- **OUR VISION** — To be a global leader in innovative, reliable and sustainable business solutions — setting new benchmarks for excellence and redefining industry standards.

### S7 — Leadership
**Frame:** Founder's message, then a 3-card management row.
**Motion:** Portrait revealed by a vertical mask wipe travelling with scroll. The pull-quote scales up from 0.94 with a slight blur-out→in.

- **Ijaz Ahmad — Founder & Chief Executive Officer.** Pull quote: *"Your continued trust and partnership are the foundation of everything we build."* Full letter available behind a "Read the founder's message" expander (keep the long text in the DOM for SEO, collapsed with CSS).
  - 30+ years of experience in the electrical & instrumentation industry
  - Sets the company's strategic direction and drives long-term growth
  - Leads key client relationships and major contract commitments
- **Inaam Ul Rehman Ijaz — Chief Financial Officer · Finance & Accounts.** 5+ years in finance & accounts · BS Accounting & Finance | CA | LLB · Oversees financial planning, reporting, compliance and cash flow.
- **Aneeq Ur Rehman Ijaz — Chief Digital Officer · IT & Automation.** 3 years in IT & automation · BS Computer Science · Drives digitalisation, systems automation and IT infrastructure.

Then a **Talent Management** block: *Our people are our greatest asset.* The skill and commitment of our 450+ site workforce is why every client we have ever served still works with us today. Three pillars — **Challenge**, **Dedication**, **Integrity**.

### S8 — Capabilities ★ SECOND CENTREPIECE (pinned, 500vh)
**Frame:** The red line runs horizontally across the top as a **manifold header pipe with six valves**.
**Motion:** Each scroll step rotates open the next valve; red flows down that branch; the corresponding service scene takes over the stage below with a scene-specific animation. Previous scene exits on a downward wipe.

1. **MANPOWER** — Hard-hat figures assemble into a supervised site team; a `450+` counter runs.
   *Dependable manpower solutions for industrial projects and operating facilities across Pakistan — trained, safety-conscious personnel supplied as individual deployments or fully supervised site teams.*
   Scope: Electrical & mechanical technicians · Certified welders & fabricators · Riggers & scaffolders · Equipment operators & drivers · Site supervisors & QA/QC inspectors · Helpers & general labour
2. **GENERAL ORDER SUPPLY** — Crates travel a conveyor and stack into a warehouse bay.
   *Timely availability of essential materials, consumables and operational requirements — sourcing, procurement and delivery through dependable supply networks.*
   Scope: Industrial tools & equipment · Electrical & mechanical materials · Welding & fabrication consumables · Safety equipment & PPE · Maintenance & operational supplies · General site & plant requirements
3. **ELECTRICAL** — An MCC cabinet opens; current traces run through the circuit diagram; a switchgear busbar energises.
   *Professional electrical installation, maintenance and technical support delivered by skilled technicians under structured supervision.*
   Scope: Motor Control Centres · Grid stations & M.V. switchgear · Transformers · L.V. distribution boards · Motor starters, inverters & converters · Battery chargers & bus ties
4. **MECHANICAL** — A boiler and HVAC unit section-cut open; an impeller spins; airflow arrows circulate.
   *Professional mechanical installation, maintenance and technical support ensuring safe and efficient plant operation.*
   Scope: HVAC systems · Lifts & escalators · Compressed air installations · Boilers & ancillary equipment · Laundry systems · Laboratory ventilation & air conditioning
5. **PIPING, FABRICATION & ERECTION** — Pipe spools rotate into alignment, weld beads run along the joints with spark bursts, then a steel frame erects column by column.
   *Piping, fabrication and erection delivered by skilled technicians and qualified welders with structured supervision.*
   Scope: Piping fabrication & erection · Steel structure fabrication & erection · Tank & vessel fabrication · Shed fabrication & erection · Repair & maintenance works
6. **SCAFFOLDING RENTAL** — A scaffold tower builds itself pole by pole, level by level; a `70,000 sq ft` inventory counter runs.
   *Professional scaffolding rental for industrial, commercial and construction projects, with roughly 70,000 sq. ft. of inventory and additional capacity available. Registered provider to Lucky Core Industries Ltd. and Habib Metro (Pvt.) Ltd.*
   Scope: Scaffolding components & accessories · Erection & dismantling support · Scaffolding rental & supply · Industrial & commercial scaffolding

**Mobile:** unpin. Each service becomes a full-width stacked panel with its scene animating once on entry.

### S9 — Clients
**Frame:** Paper. The line flattens into three horizontal rails.
**Motion:** Client logos slide in along the rails and lock into a grid. Rails then drift slowly in opposite directions (infinite marquee, pauses on hover). Logos are greyscale at rest, full colour on hover.

Unilever Pakistan Foods · Lucky Core Industries (LCI) · OGDCL · Habib Metro (Pvt.) Ltd. · Nutrico Morinaga · Metro Pakistan · Atlas Honda · PARCO · Magnum Ice Cream Company · Habib Metropolitan Bank · Ittehad Chemicals · Asia Flour Mills · Umair Rice Mills · Shahzad & Company · IIL · Danial Synthetic

Headline: `EVERY CLIENT WE HAVE EVER STARTED WITH IS STILL AN ACTIVE CLIENT TODAY.`

### S10 — Track Record
**Frame:** A filterable project index (filters: All · Piping & Fabrication · Electrical & Instrumentation · Manpower · Power & Energy).
**Motion:** Rows stagger in; filtering uses GSAP FLIP-style reordering, not a re-render flash.

Projects (year · client · scope):
- 1998 LCI — Piping & steel structure, Polyester Line 4
- 2002 LCI — Piping & steel structure, Line 5
- 2005 LCI — Piping & steel structure, Line 6
- 2007 Paper & Pulp — Piping & tank fabrication for pulp plant
- 2008 Steel Alise Mill — Overhead crane fabrication & erection
- 2008 Atlas Honda — Piping & flare works at powerhouse
- 2013–14 CFB Power House — Piping, steel structure & tank
- 2015 Ittehad Chemical — Calcium plant fabrication & erection
- 2015 Asia Flour Mill — Vertical tower & bridge
- 2015 Oil & Gas — Gas separator, piping & skid assembly
- 2016 Umair Rice Mills — Fabrication & erection, Muridke Road
- 2016 Javed Nagar — Shed fabrication & erection
- 2016 IIL — Material yard shed, Qila Sattar Shah
- 2016 18 MW CFB Plant — Electrical & instrumentation package, PKR 38.5M
- 2017 Vibrator fabrication & erection
- 2017 PARCO — Shed & overhead crane works, Qasba Gujrat
- 2018 Powerhouse & oil heater installation
- 2018 Danial Synthetic — Fire-water pipeline, diesel tank & flare
- 2019 Soda ash plant, Quaidabad
- 2019 OGDCL — DCS works, upstream oil & gas fields
- 2019 Piping & steel structure, Karak gas field
- 2020–21 Float Glass Plant 2 — Gas pipeline
- 2021 LCI — TCC project
- 2022 LCI — R-PET project
- 2024 Solar — 1 MW solar EPC, second project delivered
- 2024 LCI Soda Ash — Biomass project
- 2024–25 LCI Soda Ash — Boiler project
- 2026 Metro — Armoured cable laying
- 2010–present LCI Polyester — Manpower services, 50+ workers
- 2015–present LCI Soda Ash — Manpower services, 150+ workers
- 2019–present Nutrico Morinaga — Manpower supply, 100+ workers
- 2026–present Unilever Foods — Manpower supply, 10+ workers

### S11 — Quality & Compliance
**Frame:** Paper. Certification badges in a grid.
**Motion:** Each badge **stamps** onto the page — scales from 1.4 → 1.0 with a 2° rotation settle and a soft shadow bloom, staggered 120ms, with a subtle screen-shake of 2px on each impact. Mechanical, not bouncy: use `ease: "power4.out"`, no overshoot/back easing.

Intro: *We adhere to rigorous quality control measures at every stage of our projects, meeting or exceeding industry standards and client expectations.*
- **ISO 9001** — Quality Management
- **PEC** — Pakistan Engineering Council
- **FBR** — Sales Tax & Income Tax · Active
- **PRA** — Sales Tax · Active
- **Unilever** — Approved vendor, registered contractor & manpower supplier
- **OGDCL** — Approved vendor & registered contractor
- **Habib Metro (Pvt.) Ltd.** — Approved vendor & registered contractor
- **Lucky Core Industries Ltd.** — Approved vendor, registered contractor & manpower supplier

### S12 — Safety / ZERO ★ THE EMOTIONAL PEAK (pinned, 200vh)
**Frame:** Everything goes to full navy. All other content is gone. This is the quietest section on the site.
**Motion:** The red line curves and closes into a single enormous `0` occupying most of the viewport (one SVG path, drawn by stroke-dashoffset over the full scroll). When it closes, a day-counter beneath it runs from 0 up to the actual days since 1997 and stops. Then, and only then, the four HSE points fade in one by one at 400ms intervals.

**Restraint is the point.** No particles, no camera moves, no flourish. The confidence is in the stillness. This is your strongest sales argument and over-animating it will destroy it.

Headline: `ZERO` / `Work fatalities since founding`
Sub: *The safety of our employees, clients and communities is paramount in everything we do.*
- Comprehensive safety protocols and procedures to minimise risks and hazards on job sites
- Regular safety training and education for all site personnel
- Continuous improvement driven by feedback from clients, employees and stakeholders
- Performance metrics and key indicators monitored by dedicated quality & safety teams

### S13 — Contact (pinned, 150vh) — THE LOOP CLOSES
**Frame:** Navy.
**Motion:** The red line rises from the bottom of S12 and, over the scroll, **redraws itself into the Falcon logo** — the body, then each wing feather sweeping outward, then the arced wordmark. When the mark completes, the contact panel fades up beneath it.

- **HEAD OFFICE** — Etihad Town, Raiwind Road, Lahore, Pakistan
- **CONTACT** — +92 304 4114454 · +92 316 4199198
- **EMAIL** — business@falconinternational.net.pk · accounts@falconinternational.net.pk
- **WEB** — falconinternational.net.pk
- Enquiry form: Name · Company · Email · Phone · Service required (select: Manpower / General Orders / Electrical / Mechanical / Piping & Fabrication / Scaffolding) · Message
- Footer: `FALCON INTERNATIONAL — Your Industrial Contracting Partner` · `Manpower | General Orders | Electrical | Mechanical | Fabrication` · `© Falcon International. All rights reserved.`

---

## 6. Non-negotiable engineering constraints

**Performance budget — enforce these, do not exceed:**
- JS bundle ≤ 300KB gzipped total
- LCP ≤ 2.5s on simulated Fast 3G
- Sustained 60fps during scroll on a mid-range Android (test with 4× CPU throttle in DevTools)
- Total page weight ≤ 3MB including all imagery

**How to hit them:**
- Animate **only** `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `box-shadow` in a scroll-driven timeline.
- Apply `will-change: transform` only to currently-animating elements; remove it in the ScrollTrigger `onLeave`.
- Lazy-mount heavy sections. Sections S3 and S8 should only instantiate their GSAP timelines when within 1 viewport of entry, and `kill()` them when 2 viewports away.
- Use one master ScrollTrigger per pinned section, not dozens of independent ones.
- Batch all `ScrollTrigger.refresh()` calls; debounce resize handling to 250ms.
- All SVG scenes must be optimised (SVGO) and inlined as React components, not fetched.

**Accessibility and robustness:**
- Full `prefers-reduced-motion: reduce` implementation. When set: kill Lenis, disable all pinning and scrubbing, disable counters (show final values immediately), and serve the site as a clean static scrolling page. It must still look intentional and complete, not broken.
- All content must be in the server-rendered DOM. **Nothing may be injected by JS on scroll** — text that only appears after animation is invisible to Google.
- Semantic headings h1 → h2 → h3 in order. One h1 (hero).
- Keyboard navigable. Visible focus rings. Skip-to-content link.
- The pinned sections must be escapable by keyboard (Tab moves past them; don't trap focus in a pinned container).

**Mobile strategy — this is where scrollytelling sites usually die:**
- Below 768px: **disable ALL pinning and scrubbing.** Replace every pinned sequence with a simple on-enter reveal of the same artwork. Same content, same story, no scrub. A janky scrubbed pin on mobile is far worse than a clean static reveal.
- Never rely on `100vh` (mobile browser chrome shifts it). Use `100dvh` with a `100vh` fallback.
- Disable Lenis on touch devices — native scroll momentum is better.
- Test with the URL bar showing and hidden.

**SEO / meta:**
- Full metadata, Open Graph, and JSON-LD `Organization` + `LocalBusiness` schema (address: Etihad Town, Raiwind Road, Lahore, PK; founded 1997; the two phone numbers; the service list).
- Descriptive alt text on every image and `role="img"` + `<title>` on every meaningful SVG scene.

---

## 7. Project structure

```
/app
  layout.tsx            # fonts, metadata, JSON-LD, Lenis provider
  page.tsx              # composes all sections in order
/components
  /sections             # S0Preloader … S13Contact — one file each
  /scenes               # inline SVG scene components (Plant, Timeline structures,
                        # PakistanMap, Manifold, ScaffoldTower, ZeroPath, FalconMark)
  /ui                   # Nav, StatCounter, ScopeList, ProjectRow, Badge, Button
/lib
  gsap.ts               # single registration point for GSAP + ScrollTrigger
  useScrollScene.ts     # hook: creates a scrubbed timeline, handles mobile bypass,
                        # reduced-motion bypass, and cleanup on unmount
  redline.ts            # shared geometry/state for the continuous red line
/public/assets
  falcon-logo.png
/content
  site.ts               # ALL copy as typed constants — no hardcoded strings in components
```

Put every string in `/content/site.ts`. The client will want copy edits and they must not require touching animation code.

---

## 8. Build order — do these as separate phases, stopping for review after each

- **Phase 0** — Scaffold: Next.js + TS + Tailwind, brand tokens, fonts, Lenis, GSAP registration, `useScrollScene` hook, `/content/site.ts` populated with all copy above. Static placeholder versions of all 14 sections (correct copy, correct layout, zero animation). **Deliver a complete, readable, correctly-structured site with no motion at all.** This is also the reduced-motion fallback, so it must stand on its own.
- **Phase 1** — The red line system: the continuous SVG path spanning all sections, scrubbed drawing, and correct hand-off geometry between sections. Nothing else.
- **Phase 2** — S1 Hero + S2 At a Glance.
- **Phase 3** — S3 The Journey. Expect this to take as long as everything else combined.
- **Phase 4** — S8 Capabilities.
- **Phase 5** — S4 Map, S12 Zero, S13 Falcon reveal.
- **Phase 6** — S5, S6, S7, S9, S10, S11 (the lighter sections).
- **Phase 7** — S0 Preloader, mobile pass, reduced-motion pass, performance audit against the budget in §6, Lighthouse run.

After each phase, run the dev server and report what to check.

---

## 9. Things that will make this look cheap — avoid

- Bouncy or elastic easing (`back`, `elastic`, `bounce`). Use `power2`/`power4`/`expo` only. This is heavy industry, not a toy.
- Fade-up-on-scroll applied uniformly to every element. If everything animates the same way, nothing feels animated.
- Parallax on more than 3 layers — it reads as mush.
- Gradient blobs, glassmorphism, neon glows, floating 3D shapes. None of these belong on an industrial contractor's site.
- Text that animates in letter by letter for whole paragraphs. Headlines only, and sparingly.
- Sections that all animate at the same intensity. **Pacing matters more than any individual effect** — S3 and S8 are loud, S5 and S6 are quiet, S12 is silent. Build the rhythm deliberately.
- Scroll-jacking that fights the user. Scrub, never snap the user to a position they didn't scroll to.

---

## 10. Placeholder assets

The client has not yet supplied production photography. For every photo slot, use a labelled navy placeholder block with the required aspect ratio and a caption of what belongs there (e.g. `[SITE PHOTO — welders on LCI Polyester line, 3:2]`), driven from `/content/site.ts` so swapping in real images later is a one-line change per slot. **Do not pull in stock photos or generate images.**
