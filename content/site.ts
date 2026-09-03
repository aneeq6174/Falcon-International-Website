/**
 * SINGLE SOURCE OF TRUTH FOR ALL COPY.
 *
 * Every user-visible string on the site lives here. Components must not contain
 * hardcoded copy. The client will request wording changes and those edits must
 * never require touching animation code.
 *
 * Photography is not yet supplied. Photo slots are declared as `PhotoSlot`
 * objects and render as labelled navy placeholder blocks. To swap in a real
 * image later, set `src` on the slot — one line per slot, no component changes.
 */

export type PhotoSlot = {
  /** Description of what belongs here, shown on the placeholder block. */
  caption: string;
  /** Aspect ratio, e.g. '3:2'. Drives the placeholder box. */
  ratio: string;
  /** Alt text for the real image, and the accessible name of the placeholder. */
  alt: string;
  /** Set this to a real file in /public/assets to replace the placeholder. */
  src?: string;
};

/* ------------------------------------------------------------------ */
/* Organisation                                                        */
/* ------------------------------------------------------------------ */

export const org = {
  name: 'Falcon International',
  tagline: 'Your Industrial Contracting Partner',
  founded: '1997',
  foundedISO: '1997-01-01',
  city: 'Lahore',
  country: 'Pakistan',
  address: {
    street: 'Etihad Town, Raiwind Road',
    locality: 'Lahore',
    country: 'PK',
    full: 'Etihad Town, Raiwind Road, Lahore, Pakistan',
  },
  phones: ['+92 304 4114454', '+92 316 4199198'],
  emails: ['business@falconinternational.net.pk', 'accounts@falconinternational.net.pk'],
  web: 'falconinternational.net.pk',
  url: 'https://falconinternational.net.pk',
  /**
   * The dedicated WhatsApp Business number, digits only with country code —
   * that is the format wa.me requires. Displayed separately below.
   */
  whatsapp: '923014438752',
  whatsappDisplay: '+92 301 4438752',
  services: ['Manpower', 'General Orders', 'Electrical', 'Mechanical', 'Fabrication'],
} as const;

export const meta = {
  title: 'Falcon International — Your Industrial Contracting Partner',
  description:
    'Industrial contracting in Pakistan since 1997. Manpower, general order supply, electrical, mechanical, piping, fabrication and scaffolding for Unilever, Lucky Core Industries, OGDCL and Habib Metro. Zero work fatalities since founding.',
  keywords: [
    'industrial contractor Pakistan',
    'manpower services Lahore',
    'piping fabrication erection',
    'electrical instrumentation contractor',
    'scaffolding rental Pakistan',
    'industrial contracting Lahore',
  ],
  ogAlt: 'Falcon International — industrial contracting partner since 1997',
} as const;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const nav = {
  skipToContent: 'Skip to content',
  logoAlt: 'Falcon International',
  cta: 'Start a project',
  items: [
    { label: 'Journey', href: '#journey' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Clients', href: '#clients' },
    { label: 'Track record', href: '#track-record' },
    { label: 'Safety', href: '#safety' },
    { label: 'Contact', href: '#contact' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S0 — Preloader                                                      */
/* ------------------------------------------------------------------ */

export const preloader = {
  label: 'Loading',
  wordmark: 'FALCON INTERNATIONAL',
} as const;

/* ------------------------------------------------------------------ */
/* S1 — Hero                                                           */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: 'EST. 1997 · LAHORE, PAKISTAN',
  h1: 'FALCON INTERNATIONAL',
  sub: 'Your Industrial Contracting Partner',
  disciplines: 'Manpower · General Orders · Electrical · Mechanical · Fabrication',
  ctaPrimary: 'Start a project',
  ctaSecondary: 'Download profile',
} as const;

/* ------------------------------------------------------------------ */
/* S2 — At a Glance                                                    */
/* ------------------------------------------------------------------ */

export type Stat = {
  /** Numeric target for the count-up. */
  value: number;
  /** Suffix rendered after the numeral, e.g. '+'. */
  suffix?: string;
  /** Counts down to the value instead of up (the zero-fatalities stat). */
  countDown?: boolean;
  /**
   * Where the count starts. Up-counters start at 0; the zero-fatalities stat
   * counts DOWN, so it needs somewhere to fall from. Ten is short enough to land
   * hard on the zero rather than turning into a long spin.
   */
  countFrom?: number;
  label: string;
  sub: string;
};

export const glance = {
  eyebrow: 'AT A GLANCE',
  stats: [
    { value: 29, label: 'Years in operation', sub: 'Established 1997, Pakistan' },
    { value: 80, suffix: '+', label: 'Projects delivered', sub: 'Industrial contracts since 1997' },
    { value: 450, suffix: '+', label: 'Team strength', sub: '50+ staff · 400+ site workforce' },
    { value: 0, countDown: true, countFrom: 10, label: 'Work fatalities', sub: 'Zero since founding' },
  ] as Stat[],
  sectorsTitle: 'SECTORS SERVED',
  sectors: [
    'Textile',
    'Chemicals',
    'Paper & Pulp',
    'Steel',
    'Automotive',
    'Power Generation',
    'Food Processing',
    'FMCG',
    'Retail',
  ],
  clientsTitle: 'KEY CLIENTS',
  keyClients: [
    'Unilever Pakistan Foods',
    'Lucky Core Industries (Polyester, Soda Ash, Paints)',
    'OGDCL',
    'Habib Metro (Pvt.) Ltd.',
    'Nutrico Morinaga (Pvt.) Ltd.',
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S3 — The Journey                                                    */
/* ------------------------------------------------------------------ */

export type Milestone = {
  year: string;
  title: string;
  body: string;
  /** Key for the scene component that assembles at this milestone. */
  scene: string;
};

export const journey = {
  eyebrow: 'THE JOURNEY',
  title: '1997 — 2026',
  milestones: [
    {
      year: '1997',
      title: 'Founded in Lahore.',
      body: 'Established as a specialist piping and steel-structure fabrication crew for process industries.',
      scene: 'workshop',
    },
    {
      year: '1998',
      title: 'First LCI Polyester line.',
      body: 'First major industrial contract: fabrication and erection of Polyester Line 4 for LCI.',
      scene: 'polyester-line',
    },
    {
      year: '2005',
      title: 'Polyester Line 6.',
      body: 'Complete fabrication and erection of Polyester Line 6 — repeat business earned at LCI.',
      scene: 'polyester-line-2',
    },
    {
      year: '2010',
      title: 'LCI Polyester manpower.',
      body: 'Manpower services began at LCI Polyester — grown to 50+ workers on site today.',
      scene: 'crew-50',
    },
    {
      year: '2013',
      title: 'Entry into power.',
      body: 'Fabrication of a CFB power house; structural, mechanical and piping works.',
      scene: 'power-house',
    },
    {
      year: '2015',
      title: 'LCI Soda Ash manpower.',
      body: 'Manpower services began at LCI Soda Ash — 150+ workers deployed on site today.',
      scene: 'crew-150',
    },
    {
      year: '2016',
      title: '18 MW CFB power plant.',
      body: 'Electrical & instrumentation package for an 18 MW CFB plant — valued at PKR 38.5 million.',
      scene: 'pylons',
    },
    {
      year: '2019',
      title: 'Oil & gas milestones.',
      body: 'DCS works for OGDCL and services at the MOL gas field; entry into the upstream sector.',
      scene: 'wellhead',
    },
    {
      year: '2019',
      title: 'Nutrico Morinaga.',
      body: 'Approved manpower supplier to Nutrico Morinaga (Pvt.) Ltd. — 100+ workers on site today.',
      scene: 'packaging-line',
    },
    {
      year: '2024',
      title: 'Second 1 MW solar EPC.',
      body: "Engineering, procurement and construction of the company's second 1 MW solar power project.",
      scene: 'solar-array',
    },
    {
      year: '2025',
      title: 'LCI Soda Ash projects.',
      body: 'Biomass project (2024) and boiler project (2024–25) delivered at LCI Soda Ash.',
      scene: 'biomass-silo',
    },
    {
      year: '2026',
      title: 'Habib Metro approved vendor.',
      body: 'Approved vendor of Habib Metro Pakistan (Pvt.) Ltd., armoured cable laying project delivered.',
      scene: 'armoured-cable',
    },
    {
      year: '2026',
      title: 'Unilever Foods partnership.',
      body: 'Approved vendor and manpower supplier to Unilever Foods Pakistan Ltd. — 10+ workers deployed.',
      scene: 'unilever',
    },
    {
      year: 'TODAY',
      title: 'Every client, still a client.',
      body: "Our relationship doesn't end when the deal is done. We believe every client deserves the same level of attention, respect, and commitment, whether they are working with us for the first time, or have been with us for years.",
      scene: 'skyline',
    },
  ] as Milestone[],
} as const;

/* ------------------------------------------------------------------ */
/* S4 — Where We Work                                                  */
/* ------------------------------------------------------------------ */

export const map = {
  eyebrow: 'WHERE WE WORK',
  title: 'Nationwide reach, Lahore roots',
  regions: [
    { value: 65, suffix: '+', label: 'Projects in Punjab' },
    { value: 10, suffix: '+', label: 'Projects in Sindh' },
    { value: 5, suffix: '+', label: 'Projects in KPK' },
  ],
  headOfficeLabel: 'HEAD OFFICE',
  headOffice: 'Lahore',
  beyondTitle: 'BEYOND PAKISTAN',
  beyond: 'Business process outsourcing services delivered to clients in the Gulf and Egypt.',
  mapAlt:
    'Map of Pakistan showing Falcon International project locations across Punjab, Sindh and KPK, with head office in Lahore.',
} as const;

/* ------------------------------------------------------------------ */
/* S5 — Values                                                         */
/* ------------------------------------------------------------------ */

export const values = {
  eyebrow: 'OUR VALUES',
  items: [
    { title: 'Excellence', body: 'Quality and superior service in everything we do.' },
    { title: 'Integrity', body: 'Honesty, transparency and ethical conduct.' },
    { title: 'Reliability', body: 'Delivering on promises, consistently.' },
    { title: 'Safety', body: 'Our people, clients and communities come first.' },
    { title: 'Innovation', body: 'Creativity and continuous improvement.' },
    { title: 'Customer Focus', body: 'Understanding and exceeding client expectations.' },
    { title: 'Teamwork', body: 'Collaboration across diverse skills.' },
    { title: 'Professionalism', body: 'Respect and courtesy in every interaction.' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S6 — Mission & Vision                                               */
/* ------------------------------------------------------------------ */

export const missionVision = {
  mission: {
    eyebrow: 'OUR MISSION',
    body: 'To be the preferred partner for our clients — delivering tailored industrial solutions that exceed expectations, and building long-lasting relationships based on trust, integrity and mutual respect.',
  },
  vision: {
    eyebrow: 'OUR VISION',
    body: 'To be a global leader in innovative, reliable and sustainable business solutions — setting new benchmarks for excellence and redefining industry standards.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* S7 — Leadership                                                     */
/* ------------------------------------------------------------------ */

export const leadership = {
  eyebrow: 'LEADERSHIP',
  founder: {
    name: 'Ijaz Ahmad',
    role: 'Founder & Chief Executive Officer',
    pullQuote:
      'Your continued trust and partnership are the foundation of everything we build.',
    points: [
      '30+ years of experience in the electrical & instrumentation industry',
      "Sets the company's strategic direction and drives long-term growth",
      'Leads key client relationships and major contract commitments',
    ],
    expanderLabel: "Read the founder's message",
    /**
     * Kept in the server-rendered DOM at all times and collapsed with CSS so it
     * remains indexable. Never conditionally rendered.
     */
    letter: [
      'On behalf of everyone at Falcon International, thank you for your interest in our work.',
      'When I founded this company in Lahore in 1997, it was a small crew of fabricators and pipe fitters taking on work that larger contractors would not. What we had was a willingness to be held to the standard our clients set, and the discipline to meet it on every shift.',
      'Twenty-nine years later, the scope has widened — manpower, general order supply, electrical and mechanical works, piping and fabrication, scaffolding — but the standard has not moved. We still measure ourselves by whether the client calls us back.',
      'That measure is the one I am proudest of. Every client we have ever started with is still an active client today. Lucky Core Industries has trusted us across Polyester, Soda Ash and Paints since 1998. OGDCL, Habib Metro, Nutrico Morinaga and Unilever Foods have each brought us onto their sites and kept us there.',
      'Equally, in twenty-nine years of heavy industrial work we have never lost a worker. Zero fatalities is not a marketing line; it is the result of protocols, training and supervision that we treat as non-negotiable, and it is the commitment I make to every family whose member walks onto one of our sites.',
      'Your continued trust and partnership are the foundation of everything we build. We look forward to earning it again on your next project.',
    ],
    portrait: {
      caption: '[PORTRAIT — Ijaz Ahmad, Founder & CEO, 4:5]',
      ratio: '4:5',
      alt: 'Ijaz Ahmad, Founder and Chief Executive Officer of Falcon International.',
    } as PhotoSlot,
  },
  team: [
    {
      name: 'Inaam Ul Rehman Ijaz',
      role: 'Chief Financial Officer · Finance & Accounts',
      experience: '5+ years in finance & accounts',
      credentials: 'BS Accounting & Finance | CA | LLB',
      body: 'Oversees financial planning, reporting, compliance and cash flow.',
      portrait: {
        caption: '[PORTRAIT — Inaam Ul Rehman Ijaz, CFO, 1:1]',
        ratio: '1:1',
        alt: 'Inaam Ul Rehman Ijaz, Chief Financial Officer of Falcon International.',
      } as PhotoSlot,
    },
    {
      name: 'Aneeq Ur Rehman Ijaz',
      role: 'Chief Digital Officer · IT & Automation',
      experience: '3 years in IT & automation',
      credentials: 'BS Computer Science',
      body: 'Drives digitalisation, systems automation and IT infrastructure.',
      portrait: {
        caption: '[PORTRAIT — Aneeq Ur Rehman Ijaz, CDO, 1:1]',
        ratio: '1:1',
        alt: 'Aneeq Ur Rehman Ijaz, Chief Digital Officer of Falcon International.',
      } as PhotoSlot,
    },
  ],
  talent: {
    eyebrow: 'TALENT MANAGEMENT',
    title: 'Our people are our greatest asset.',
    body: 'The skill and commitment of our 450+ site workforce is why every client we have ever served still works with us today.',
    pillars: [
      { title: 'Challenge', body: 'We put our people on work that stretches them, and back them while they do it.' },
      { title: 'Dedication', body: 'Crews stay with the client and the site, building knowledge that transfers to every shift.' },
      { title: 'Integrity', body: 'The standard on site is the same whether or not anyone is watching.' },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* S8 — Capabilities                                                   */
/* ------------------------------------------------------------------ */

export type Capability = {
  id: string;
  title: string;
  body: string;
  scope: string[];
  /** Key for the scene component behind this valve. */
  scene: string;
  /** Optional counter shown inside the scene. */
  counter?: { value: number; suffix?: string; label: string };
};

export const capabilities = {
  eyebrow: 'CAPABILITIES',
  title: 'Six disciplines, one contractor',
  items: [
    {
      id: 'manpower',
      title: 'MANPOWER',
      body: 'Dependable manpower solutions for industrial projects and operating facilities across Pakistan — trained, safety-conscious personnel supplied as individual deployments or fully supervised site teams.',
      scope: [
        'Electrical & mechanical technicians',
        'Certified welders & fabricators',
        'Riggers & scaffolders',
        'Equipment operators & drivers',
        'Site supervisors & QA/QC inspectors',
        'Helpers & general labour',
      ],
      scene: 'crew',
      counter: { value: 450, suffix: '+', label: 'Personnel' },
    },
    {
      id: 'general-order-supply',
      title: 'GENERAL ORDER SUPPLY',
      body: 'Timely availability of essential materials, consumables and operational requirements — sourcing, procurement and delivery through dependable supply networks.',
      scope: [
        'Industrial tools & equipment',
        'Electrical & mechanical materials',
        'Welding & fabrication consumables',
        'Safety equipment & PPE',
        'Maintenance & operational supplies',
        'General site & plant requirements',
      ],
      scene: 'conveyor',
    },
    {
      id: 'electrical',
      title: 'ELECTRICAL',
      body: 'Professional electrical installation, maintenance and technical support delivered by skilled technicians under structured supervision.',
      scope: [
        'Motor Control Centres',
        'Grid stations & M.V. switchgear',
        'Transformers',
        'L.V. distribution boards',
        'Motor starters, inverters & converters',
        'Battery chargers & bus ties',
      ],
      scene: 'mcc',
    },
    {
      id: 'mechanical',
      title: 'MECHANICAL',
      body: 'Professional mechanical installation, maintenance and technical support ensuring safe and efficient plant operation.',
      scope: [
        'HVAC systems',
        'Lifts & escalators',
        'Compressed air installations',
        'Boilers & ancillary equipment',
        'Laundry systems',
        'Laboratory ventilation & air conditioning',
      ],
      scene: 'boiler',
    },
    {
      id: 'piping-fabrication-erection',
      title: 'PIPING, FABRICATION & ERECTION',
      body: 'Piping, fabrication and erection delivered by skilled technicians and qualified welders with structured supervision.',
      scope: [
        'Piping fabrication & erection',
        'Steel structure fabrication & erection',
        'Tank & vessel fabrication',
        'Shed fabrication & erection',
        'Repair & maintenance works',
      ],
      scene: 'spools',
    },
    {
      id: 'scaffolding-rental',
      title: 'SCAFFOLDING RENTAL',
      body: 'Professional scaffolding rental for industrial, commercial and construction projects, with roughly 70,000 sq. ft. of inventory and additional capacity available. Registered provider to Lucky Core Industries Ltd. and Habib Metro (Pvt.) Ltd.',
      scope: [
        'Scaffolding components & accessories',
        'Erection & dismantling support',
        'Scaffolding rental & supply',
        'Industrial & commercial scaffolding',
      ],
      scene: 'scaffold',
      counter: { value: 70000, label: 'sq ft inventory' },
    },
  ] as Capability[],
  scopeLabel: 'Scope of work',
} as const;

/* ------------------------------------------------------------------ */
/* S9 — Clients                                                        */
/* ------------------------------------------------------------------ */

export const clients = {
  eyebrow: 'CLIENTS',
  headline: 'EVERY CLIENT WE HAVE EVER STARTED WITH IS STILL AN ACTIVE CLIENT TODAY.',
  logos: [
    'Unilever Pakistan Foods',
    'Lucky Core Industries (LCI)',
    'OGDCL',
    'Habib Metro (Pvt.) Ltd.',
    'Nutrico Morinaga',
    'Metro Pakistan',
    'Atlas Honda',
    'PARCO',
    'Magnum Ice Cream Company',
    'Habib Metropolitan Bank',
    'Ittehad Chemicals',
    'Asia Flour Mills',
    'Umair Rice Mills',
    'Shahzad & Company',
    'IIL',
    'Danial Synthetic',
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S10 — Track Record                                                  */
/* ------------------------------------------------------------------ */

export type ProjectCategory =
  | 'piping-fabrication'
  | 'electrical-instrumentation'
  | 'manpower'
  | 'power-energy';

export type Project = {
  year: string;
  client: string;
  scope: string;
  category: ProjectCategory;
};

export const trackRecord = {
  eyebrow: 'TRACK RECORD',
  title: 'Project index',
  filters: [
    { id: 'all', label: 'All' },
    { id: 'piping-fabrication', label: 'Piping & Fabrication' },
    { id: 'electrical-instrumentation', label: 'Electrical & Instrumentation' },
    { id: 'manpower', label: 'Manpower' },
    { id: 'power-energy', label: 'Power & Energy' },
  ],
  columns: { year: 'Year', client: 'Client', scope: 'Scope' },
  projects: [
    { year: '1998', client: 'LCI', scope: 'Piping & steel structure, Polyester Line 4', category: 'piping-fabrication' },
    { year: '2002', client: 'LCI', scope: 'Piping & steel structure, Line 5', category: 'piping-fabrication' },
    { year: '2005', client: 'LCI', scope: 'Piping & steel structure, Line 6', category: 'piping-fabrication' },
    { year: '2007', client: 'Paper & Pulp', scope: 'Piping & tank fabrication for pulp plant', category: 'piping-fabrication' },
    { year: '2008', client: 'Steel Alise Mill', scope: 'Overhead crane fabrication & erection', category: 'piping-fabrication' },
    { year: '2008', client: 'Atlas Honda', scope: 'Piping & flare works at powerhouse', category: 'piping-fabrication' },
    { year: '2013–14', client: 'CFB Power House', scope: 'Piping, steel structure & tank', category: 'power-energy' },
    { year: '2015', client: 'Ittehad Chemical', scope: 'Calcium plant fabrication & erection', category: 'piping-fabrication' },
    { year: '2015', client: 'Asia Flour Mill', scope: 'Vertical tower & bridge', category: 'piping-fabrication' },
    { year: '2015', client: 'Oil & Gas', scope: 'Gas separator, piping & skid assembly', category: 'piping-fabrication' },
    { year: '2016', client: 'Umair Rice Mills', scope: 'Fabrication & erection, Muridke Road', category: 'piping-fabrication' },
    { year: '2016', client: 'Javed Nagar', scope: 'Shed fabrication & erection', category: 'piping-fabrication' },
    { year: '2016', client: 'IIL', scope: 'Material yard shed, Qila Sattar Shah', category: 'piping-fabrication' },
    { year: '2016', client: '18 MW CFB Plant', scope: 'Electrical & instrumentation package, PKR 38.5M', category: 'electrical-instrumentation' },
    { year: '2017', client: 'Vibrator', scope: 'Fabrication & erection', category: 'piping-fabrication' },
    { year: '2017', client: 'PARCO', scope: 'Shed & overhead crane works, Qasba Gujrat', category: 'piping-fabrication' },
    { year: '2018', client: 'Powerhouse', scope: 'Powerhouse & oil heater installation', category: 'power-energy' },
    { year: '2018', client: 'Danial Synthetic', scope: 'Fire-water pipeline, diesel tank & flare', category: 'piping-fabrication' },
    { year: '2019', client: 'Soda ash plant', scope: 'Soda ash plant, Quaidabad', category: 'piping-fabrication' },
    { year: '2019', client: 'OGDCL', scope: 'DCS works, upstream oil & gas fields', category: 'electrical-instrumentation' },
    { year: '2019', client: 'Karak gas field', scope: 'Piping & steel structure', category: 'piping-fabrication' },
    { year: '2020–21', client: 'Float Glass Plant 2', scope: 'Gas pipeline', category: 'piping-fabrication' },
    { year: '2021', client: 'LCI', scope: 'TCC project', category: 'piping-fabrication' },
    { year: '2022', client: 'LCI', scope: 'R-PET project', category: 'piping-fabrication' },
    { year: '2024', client: 'Solar', scope: '1 MW solar EPC, second project delivered', category: 'power-energy' },
    { year: '2024', client: 'LCI Soda Ash', scope: 'Biomass project', category: 'power-energy' },
    { year: '2024–25', client: 'LCI Soda Ash', scope: 'Boiler project', category: 'power-energy' },
    { year: '2026', client: 'Metro', scope: 'Armoured cable laying', category: 'electrical-instrumentation' },
    { year: '2010–present', client: 'LCI Polyester', scope: 'Manpower services, 50+ workers', category: 'manpower' },
    { year: '2015–present', client: 'LCI Soda Ash', scope: 'Manpower services, 150+ workers', category: 'manpower' },
    { year: '2019–present', client: 'Nutrico Morinaga', scope: 'Manpower supply, 100+ workers', category: 'manpower' },
    { year: '2026–present', client: 'Unilever Foods', scope: 'Manpower supply, 10+ workers', category: 'manpower' },
  ] as Project[],
} as const;

/* ------------------------------------------------------------------ */
/* S11 — Quality & Compliance                                          */
/* ------------------------------------------------------------------ */

export const quality = {
  eyebrow: 'QUALITY & COMPLIANCE',
  intro:
    'We adhere to rigorous quality control measures at every stage of our projects, meeting or exceeding industry standards and client expectations.',
  badges: [
    { title: 'ISO 9001', body: 'Quality Management' },
    { title: 'PEC', body: 'Pakistan Engineering Council' },
    { title: 'FBR', body: 'Sales Tax & Income Tax · Active' },
    { title: 'PRA', body: 'Sales Tax · Active' },
    { title: 'Unilever', body: 'Approved vendor, registered contractor & manpower supplier' },
    { title: 'OGDCL', body: 'Approved vendor & registered contractor' },
    { title: 'Habib Metro (Pvt.) Ltd.', body: 'Approved vendor & registered contractor' },
    { title: 'Lucky Core Industries Ltd.', body: 'Approved vendor, registered contractor & manpower supplier' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S12 — Safety / ZERO                                                 */
/* ------------------------------------------------------------------ */

export const safety = {
  eyebrow: 'SAFETY',
  headline: 'ZERO',
  headlineSub: 'Work fatalities since founding',
  sub: 'The safety of our employees, clients and communities is paramount in everything we do.',
  /** The day counter runs from 0 to the days elapsed since this date. */
  since: '1997-01-01',
  dayCounterLabel: 'Days without a work fatality',
  points: [
    'Comprehensive safety protocols and procedures to minimise risks and hazards on job sites',
    'Regular safety training and education for all site personnel',
    'Continuous improvement driven by feedback from clients, employees and stakeholders',
    'Performance metrics and key indicators monitored by dedicated quality & safety teams',
  ],
} as const;

/* ------------------------------------------------------------------ */
/* S13 — Contact                                                       */
/* ------------------------------------------------------------------ */

export const whatsapp = {
  label: 'Chat on WhatsApp',
  /** Prefilled so the first message already says why they are writing. */
  message: "Hello Falcon International — I'd like to discuss a project.",
} as const;

export const contact = {
  eyebrow: 'CONTACT',
  title: 'Start a project',
  blocks: {
    headOfficeLabel: 'HEAD OFFICE',
    headOffice: 'Etihad Town, Raiwind Road, Lahore, Pakistan',
    contactLabel: 'CONTACT',
    emailLabel: 'EMAIL',
    webLabel: 'WEB',
  },
  form: {
    legend: 'Project enquiry',
    fields: {
      name: { label: 'Name', placeholder: 'Your name', required: true },
      company: { label: 'Company', placeholder: 'Company name', required: true },
      email: { label: 'Email', placeholder: 'name@company.com', required: true },
      phone: { label: 'Phone', placeholder: '+92 300 0000000', required: false },
      service: { label: 'Service required', required: true },
      message: { label: 'Message', placeholder: 'Tell us about the scope, site and timeline.', required: true },
    },
    serviceOptions: [
      'Manpower',
      'General Orders',
      'Electrical',
      'Mechanical',
      'Piping & Fabrication',
      'Scaffolding',
    ],
    submit: 'Send enquiry',
    sending: 'Sending…',
    sent: 'Sent',
    sentNote: 'Thank you — your enquiry is with us. We reply within one working day.',
    note: 'We reply to project enquiries within one working day.',
    /**
     * The enquiry is delivered by composing an email in the sender's own mail
     * app — see the mailto note in S13Contact. This is the subject line and the
     * fallback shown if their device has no mail client configured.
     */
    mailSubject: 'Project enquiry',
    noMailClient:
      'Your device has no email app set up. Please WhatsApp us or email business@falconinternational.net.pk directly.',
  },
  footer: {
    line1: 'FALCON INTERNATIONAL — Your Industrial Contracting Partner',
    line2: 'Manpower | General Orders | Electrical | Mechanical | Fabrication',
    line3: '© Falcon International. All rights reserved.',
  },
} as const;
