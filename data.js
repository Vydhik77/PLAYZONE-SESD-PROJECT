// ==================== DATA CATALOGS, RBAC CONFIG & INITIAL STATE ====================

function makeArt(bg1, bg2, accent, title, tag, iconPath) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="150" fill="url(#g)"/>
    <circle cx="270" cy="30" r="70" fill="${accent}" fill-opacity="0.18"/>
    <g transform="translate(225, 38)" stroke="${accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconPath}</g>
    <rect x="18" y="20" width="76" height="20" rx="6" fill="${accent}" fill-opacity="0.22"/>
    <text x="56" y="34" font-family="sans-serif" font-size="10" font-weight="700" fill="${accent}" text-anchor="middle">${tag}</text>
    <text x="18" y="102" font-family="sans-serif" font-size="22" font-weight="800" fill="#ffffff">${title}</text>
    <line x1="18" y1="116" x2="90" y2="116" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const GAME_CATALOG = [
  {
    title: 'GTA V',
    zone: 'PC Zone',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg',
    fallback: makeArt('#06281e', '#0f172a', '#34d399', 'GTA V ONLINE', 'ACTION', '<rect x="8" y="14" width="48" height="36" rx="8"/><circle cx="22" cy="32" r="6"/><circle cx="42" cy="32" r="6"/>')
  },
  {
    title: 'Valorant',
    zone: 'PC Zone',
    img: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/1a0c7f22223823b8f91378122f9d5f471636446c-1920x1080.jpg',
    fallback: makeArt('#2a0815', '#0f172a', '#fb7185', 'VALORANT', '5V5 FPS', '<polygon points="12 4 36 36 24 36 6 12"/><polygon points="52 4 28 36 40 36 58 12"/>')
  },
  {
    title: 'CS2',
    zone: 'PC Zone',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
    fallback: makeArt('#291805', '#0f172a', '#fbbf24', 'COUNTER-STRIKE 2', 'ESPORTS', '<circle cx="32" cy="32" r="22"/><line x1="32" y1="4" x2="32" y2="60"/><line x1="4" y1="32" x2="60" y2="32"/>')
  },
  {
    title: 'FC 26',
    zone: 'PS5 Lounge',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2669320/header.jpg',
    fallback: makeArt('#062c22', '#091526', '#10b981', 'EA SPORTS FC 26', 'PS5 4K', '<circle cx="32" cy="32" r="24"/><polygon points="32 18 44 27 39 41 25 41 20 27"/>')
  },
  {
    title: 'Cricket 26',
    zone: 'PS5 Lounge',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2358260/header.jpg',
    fallback: makeArt('#08203e', '#0f172a', '#38bdf8', 'CRICKET 26', 'STADIUM', '<line x1="16" y1="52" x2="48" y2="12"/><circle cx="44" cy="46" r="9"/>')
  },
  {
    title: 'Tekken 8',
    zone: 'PS5 Lounge',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1778820/header.jpg',
    fallback: makeArt('#2e1065', '#09090b', '#c084fc', 'TEKKEN 8', 'ARCADE', '<polygon points="32 6 42 26 60 28 45 42 50 60 32 50 14 60 19 42 4 28 22 26"/>')
  },
  {
    title: 'Forza Horizon 6',
    zone: 'Racing Sim',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1551360/header.jpg',
    fallback: makeArt('#3b0764', '#18181b', '#f472b6', 'FORZA HORIZON 6', 'SIM RIG', '<path d="M8 42 L16 24 L48 24 L56 42 Z"/><circle cx="20" cy="44" r="6"/><circle cx="44" cy="44" r="6"/>')
  },
  {
    title: 'F1 25',
    zone: 'Racing Sim',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2488620/header.jpg',
    fallback: makeArt('#3f0d12', '#09090b', '#f87171', 'F1 25 GP', 'WHEEL SIM', '<rect x="10" y="24" width="44" height="16" rx="6"/><circle cx="16" cy="20" r="5"/><circle cx="48" cy="20" r="5"/><circle cx="16" cy="44" r="5"/><circle cx="48" cy="44" r="5"/>')
  },
  {
    title: 'Beat Saber',
    zone: 'VR Booth',
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/620980/header.jpg',
    fallback: makeArt('#1e1b4b', '#09090b', '#22d3ee', 'BEAT SABER VR', 'QUEST 3', '<rect x="10" y="20" width="44" height="24" rx="8"/><line x1="14" y1="54" x2="50" y2="10"/>')
  }
];

const SNACK_MENU = [
  {
    name: 'Iced Cold Coffee',
    price: 90,
    img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#27180c', '#121216', '#f59e0b', 'COLD COFFEE', 'CHILLED', '<path d="M18 16 H46 L42 54 H22 Z"/>')
  },
  {
    name: 'Peri-Peri Fries',
    price: 110,
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#331a05', '#121216', '#fb923c', 'PERI FRIES', 'CRISPY', '<path d="M16 28 H48 L44 54 H20 Z"/>')
  },
  {
    name: 'Red Bull Energy',
    price: 125,
    img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#0a1e3d', '#121216', '#38bdf8', 'RED BULL CAN', 'BOOST', '<rect x="20" y="10" width="24" height="44" rx="4"/>')
  },
  {
    name: 'Cheese Nachos',
    price: 150,
    img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#302104', '#121216', '#facc15', 'CHEESE NACHOS', 'LOADED', '<polygon points="32 12 52 48 12 48"/>')
  },
  {
    name: 'Chicken Burger',
    price: 180,
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#361509', '#121216', '#f87171', 'CHICKEN BURGER', 'HOT', '<rect x="14" y="24" width="36" height="18" rx="6"/>')
  },
  {
    name: 'Paneer Pizza',
    price: 210,
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    fallback: makeArt('#3b1206', '#121216', '#fb7185', 'PAN PIZZA', '8 INCH', '<polygon points="32 10 54 50 10 50"/>')
  }
];

function getGameObj(title) {
  return GAME_CATALOG.find(x => x.title === title) || GAME_CATALOG[0];
}

const DEFAULT_USERS = [
  { id: 'Vydhik', email: 'vydhik@playzone.in', password: 'Vydhik@77', name: 'M Vydhik', role: 'manager' },
  { id: 'desk_op_49', email: 'desk49@playzone.in', password: 'Desk#892', name: 'Arjun B (Desk)', role: 'desk' },
  { id: 'tech_fix_73', email: 'tech73@playzone.in', password: 'Tech#641', name: 'Akash K (Tech)', role: 'tech' }
];

const ROLE_CONFIG = {
  gamer: {
    label: 'Gamer',
    tabs: [
      { id: 'gamer-home', label: 'My Profile & History' },
      { id: 'gamer-browse', label: 'Pick Game & Book Rig' },
      { id: 'gamer-session', label: 'Active Session & Pay' }
    ]
  },
  desk: {
    label: 'Desk Operator',
    tabs: [
      { id: 'desk-timers', label: 'Live Timers & Approvals' },
      { id: 'desk-walkin', label: 'Walk-In Booking' },
      { id: 'desk-report', label: 'Report Faulty Gear' }
    ]
  },
  tech: {
    label: 'Hardware Tech',
    tabs: [
      { id: 'tech-queue', label: 'Repair Queue' }
    ]
  },
  manager: {
    label: 'Cafe Manager',
    tabs: [
      { id: 'mgr-overview', label: 'Arena & Approvals' },
      { id: 'mgr-rigs', label: 'Stations & Gamers' },
      { id: 'mgr-logs', label: 'Bills & Audit Logs' }
    ]
  }
};

const DEFAULT_STATIONS = [
  { id: 'PC-01', name: 'RTX Phantom 01', zone: 'PC Zone', specs: 'RTX 4070 • 240Hz', rate: 150, status: 'Available', games: ['GTA V', 'Valorant', 'CS2'] },
  { id: 'PC-02', name: 'RTX Phantom 02', zone: 'PC Zone', specs: 'RTX 4070 • 240Hz', rate: 150, status: 'Available', games: ['GTA V', 'Valorant', 'CS2'] },
  { id: 'PC-03', name: 'RTX Striker 03', zone: 'PC Zone', specs: 'RTX 4060 Ti • 165Hz', rate: 120, status: 'Available', games: ['GTA V', 'Valorant', 'Cricket 26'] },
  { id: 'PS5-01', name: 'PS5 Pro Bay 1', zone: 'PS5 Lounge', specs: 'PS5 • 65" 4K OLED', rate: 250, status: 'Available', games: ['FC 26', 'Cricket 26', 'Tekken 8'] },
  { id: 'PS5-02', name: 'PS5 Pro Bay 2', zone: 'PS5 Lounge', specs: 'PS5 • 55" 4K TV', rate: 220, status: 'Available', games: ['FC 26', 'Cricket 26', 'Tekken 8'] },
  { id: 'SIM-01', name: 'F1 Apex Sim Rig', zone: 'Racing Sim', specs: 'Logitech G923 Wheel', rate: 300, status: 'Available', games: ['Forza Horizon 6', 'F1 25'] },
  { id: 'VR-01', name: 'Meta Quest VR Pod', zone: 'VR Booth', specs: 'Meta Quest 3', rate: 350, status: 'Available', games: ['Beat Saber'] }
];

const STORE_KEY = 'playzone_arena_v7';
const SYNC_TOPIC = 'sru/playzone/vydhik77/arena_state_v7';
const CLIENT_ID = 'pz_' + Math.random().toString(16).slice(2, 10);

function initialData() {
  return {
    updatedAt: 0,
    users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
    stations: JSON.parse(JSON.stringify(DEFAULT_STATIONS)),
    sessions: [],
    pendingPayments: [],
    tickets: [],
    invoices: {
      'PZ-2026-1001': { id: 'PZ-2026-1001', gamer: 'M Vydhik', gamerId: 'Vydhik', station: 'PS5 Pro Bay 1', game: 'Cricket 26', hours: 1, rate: 250, stationFee: 250, foodCost: 0, total: 250, payMethod: 'Online UPI', txnRef: '432910004812', screenshot: '', date: '25 Nov 2026' }
    },
    auditLogs: [
      { time: 'Ready', actor: 'PlayZone OS', action: 'Arena initialized with 7 gaming rigs' }
    ],
    totalRevenue: 0
  };
}
