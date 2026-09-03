/**
 * PakistanMap — the map S4 draws itself onto.
 *
 * ── Where the geometry comes from ─────────────────────────────────────────
 *
 * Every vertex is a real boundary coordinate, projected linearly:
 *
 *     y = (37.4 - lat) * 31.0 + 12
 *     x = (lon - 60.9) * 31.0 * cos(30°) + 12
 *
 * Latitude sets the vertical scale; longitude is scaled by cos(mean latitude),
 * because a degree of longitude at 30°N is only ~0.87 of a degree of latitude.
 * Skip that factor and the country is squashed horizontally and its natural
 * southwest-to-northeast lean turns into a diagonal shard. The outline's bounding
 * box comes out at 1.00 : 1, which is Pakistan's real proportion.
 *
 * Forty-nine points around the national border — the Kashmir tip, the Indian
 * border stepping down to the Rann of Kutch, the Makran coast running west to
 * Iran, the western border north, then the Afghan border back up through Chaman
 * and Chitral. Simplified, but simplified from the real thing.
 *
 * That matters more than it looks: a map of the client's own country is the one
 * drawing on this site a Pakistani reader will check against what they know.
 *
 * ── What animates, and how ────────────────────────────────────────────────
 *
 * The outline and provincial borders carry `data-build="draw"`, so the shared
 * `buildScene` handles them. Everything the brief sequences by hand — the HQ
 * marker, the three routes, their pins, the two arcs leaving for the Gulf and
 * Egypt — is addressed explicitly by the section, because each has to land in
 * step with its own counter.
 *
 * Routes and markers are RED: this is the line arriving and fanning out across
 * the country, not decoration. The land itself is white line on navy.
 */

export const MAP_VIEWBOX = { width: 548, height: 455 } as const;

/** Lahore. Where the line meets the map, and the company's head office. */
export const HQ = { x: 368, y: 196 } as const;

/** The three provincial termini, in the order the brief lists them. */
export const REGION_PINS = [
  { id: 'punjab', x: 321, y: 223, label: 'Punjab' },
  { id: 'sindh', x: 235, y: 356, label: 'Sindh' },
  { id: 'kpk', x: 291, y: 130, label: 'KPK' },
] as const;

/** The national border, clockwise from the northern tip. */
const OUTLINE =
  'M377 23L401 26L417 58L444 71L442 96L391 99L369 96L361 114L372 136L382 156L401 170' +
  'L380 207L361 235L348 244L337 266L318 279L307 306L272 306L259 347L243 344L272 375' +
  'L280 418L224 437L187 427L173 403L160 384L135 384L111 390L82 390L50 390L31 393' +
  'L36 359L52 328L63 294L39 272L55 260L98 257L157 244L160 214L197 204L238 182' +
  'L243 148L264 136L254 117L286 114L286 90L299 80L289 52L337 28Z';

/**
 * Jammu & Kashmir east of the Line of Control.
 *
 * Gilgit-Baltistan and Azad Jammu & Kashmir are inside the national outline
 * above, west of the LoC. This is the remainder of the territory: drawn dashed,
 * at low opacity, and labelled disputed — which is both the convention on
 * Pakistani maps and the factual position, the region being under UN-recognised
 * dispute rather than settled.
 *
 * It starts and ends ON the national outline, so the LoC is the outline's own
 * edge and is never double-stroked.
 */
const KASHMIR = 'M401 170L431 155L471 167L498 148L530 111L506 90L476 74L444 71';

/** Provincial divisions, simplified to four regions. */
const BORDERS = [
  'M307 99L315 130L299 167L280 192L264 198', // KPK / Punjab
  'M238 182L246 235L238 285L213 328L184 378', // Balochistan / Punjab + Sindh
  'M240 294L267 300L307 306', // Punjab / Sindh
];

export function PakistanMap({ className }: { className?: string }) {
  return (
    <svg
      data-map-svg
      /*
       * The HQ's coordinates in this SVG's own user space, published for the red
       * line's strand builder. It resolves them through getScreenCTM() rather
       * than measuring the marker, because the marker is scaled to zero by the
       * section's build before any measuring happens.
       */
      data-hq-point={`${HQ.x} ${HQ.y}`}
      className={`overflow-visible ${className ?? ''}`}
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-labelledby="pakistan-map-title"
      focusable="false"
    >
      <title id="pakistan-map-title">
        Map of Pakistan showing Falcon International&rsquo;s head office in Lahore and project
        routes into Punjab, Sindh and Khyber Pakhtunkhwa, with outbound links to the Gulf and
        Egypt. Jammu and Kashmir east of the Line of Control is marked as disputed territory.
      </title>

      <g stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="butt" strokeLinejoin="round">
        <path data-build="draw" data-order={0} pathLength={100} d={OUTLINE} strokeOpacity="0.55" />
        {BORDERS.map((d, i) => (
          <path
            key={i}
            data-build="draw"
            data-order={i + 1}
            pathLength={100}
            d={d}
            strokeOpacity="0.24"
          />
        ))}
      </g>

      {/* Routes fired outward from the head office. */}
      <g stroke="#E23327" strokeWidth="2" fill="none" strokeLinecap="butt">
        {REGION_PINS.map((pin, i) => (
          <path
            key={pin.id}
            data-route={i}
            pathLength={100}
            d={`M${HQ.x} ${HQ.y}L${pin.x} ${pin.y}`}
          />
        ))}
      </g>

      {/* Provincial pins */}
      <g fill="#E23327">
        {REGION_PINS.map((pin, i) => (
          <g key={pin.id} data-pin={i}>
            <circle cx={pin.x} cy={pin.y} r="5" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r="11"
              fill="none"
              stroke="#E23327"
              strokeWidth="1.4"
              strokeOpacity="0.45"
            />
          </g>
        ))}
      </g>

      {/* Head office. The pulse ring is separate so it can breathe without
          disturbing the marker itself. */}
      <g data-hq>
        <circle data-hq-pulse cx={HQ.x} cy={HQ.y} r="20" fill="#E23327" opacity="0.18" />
        <circle cx={HQ.x} cy={HQ.y} r="7" fill="#E23327" />
        <circle cx={HQ.x} cy={HQ.y} r="14" fill="none" stroke="#E23327" strokeWidth="1.6" />
      </g>

      {/* Jammu & Kashmir, east of the Line of Control. */}
      <g stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinejoin="round">
        <path
          data-build="draw"
          data-order={4}
          pathLength={100}
          d={KASHMIR}
          strokeOpacity="0.3"
          strokeDasharray="6 6"
        />
      </g>
      <text
        data-kashmir-label
        x="470"
        y="118"
        textAnchor="middle"
        fill="#FFFFFF"
        fillOpacity="0.4"
        fontSize="13"
        letterSpacing="1.4"
        style={{ textTransform: 'uppercase' }}
      >
        <tspan x="470" dy="0">Jammu &amp; Kashmir</tspan>
        <tspan x="470" dy="16" fontSize="11" fillOpacity="0.3">Disputed territory</tspan>
      </text>

      {/* Beyond Pakistan: two thin dashed arcs leaving the western edge.
          Dashed paths cannot be drawn on with stroke-dashoffset — the dash
          pattern IS the offset — so these fade in and their dashes travel. */}
      <g stroke="#E23327" strokeWidth="1.4" fill="none" strokeDasharray="5 7" strokeOpacity="0.7">
        <path data-arc={0} pathLength={100} d="M48 336Q-8 316-68 330" />
        <path data-arc={1} pathLength={100} d="M34 372Q-20 384-68 408" />
      </g>
    </svg>
  );
}
