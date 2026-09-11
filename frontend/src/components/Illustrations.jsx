// Hand-drawn flat illustrations that share the store palette so every empty
// state, hero and auth screen reads as one family. All are pure SVG so they
// scale cleanly and add nothing to the bundle beyond a few KB of markup.

const INK = '#14213d';
const INK_2 = '#3b4a6b';
const AMBER = '#f4a11d';
const AMBER_SOFT = '#fff1d6';
const CREAM = '#f5f2ec';
const CREAM_2 = '#ece7dd';
const SKY = '#dce6f5';
const WHITE = '#ffffff';
const GREEN = '#1e8a5b';

const svgProps = (viewBox, props) => ({
  viewBox,
  xmlns: 'http://www.w3.org/2000/svg',
  role: 'img',
  ...props,
});

/* ---------- Brand mark ---------- */
export function LogoMark(props) {
  return (
    <svg {...svgProps('0 0 40 40', props)} aria-label="Nova">
      <rect width="40" height="40" rx="11" fill={INK} />
      <path d="M20 7c1.2 6.5 6.5 11.8 13 13-6.5 1.2-11.8 6.5-13 13-1.2-6.5-6.5-11.8-13-13 6.5-1.2 11.8-6.5 13-13Z" fill={WHITE} />
      <circle cx="20" cy="20" r="3.2" fill={AMBER} />
    </svg>
  );
}

/* ---------- Hero: a tidy desk setup ---------- */
export function HeroIllustration(props) {
  return (
    <svg {...svgProps('0 0 560 420', props)} aria-label="A desk with a monitor, keyboard, headphones and a plant">
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#233461" />
          <stop offset="1" stopColor="#0f1a36" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={AMBER} />
          <stop offset="1" stopColor="#ffd27a" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <rect x="20" y="20" width="520" height="380" rx="36" fill={CREAM} />
      <circle cx="440" cy="110" r="70" fill={AMBER_SOFT} />
      <circle cx="120" cy="80" r="6" fill={AMBER} />
      <path d="M470 50l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={AMBER} />
      <path d="M90 160l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={INK_2} opacity="0.4" />

      {/* desk */}
      <rect x="40" y="308" width="480" height="16" rx="6" fill={INK} />
      <rect x="70" y="324" width="12" height="70" rx="4" fill={INK_2} />
      <rect x="478" y="324" width="12" height="70" rx="4" fill={INK_2} />
      <rect x="60" y="392" width="440" height="6" rx="3" fill={CREAM_2} />

      {/* monitor */}
      <rect x="270" y="262" width="60" height="14" rx="4" fill={INK_2} />
      <rect x="292" y="220" width="16" height="48" fill={INK_2} />
      <rect x="160" y="88" width="280" height="176" rx="14" fill={INK} />
      <rect x="172" y="100" width="256" height="152" rx="8" fill="url(#screen)" />
      {/* screen UI */}
      <rect x="186" y="114" width="60" height="8" rx="4" fill={WHITE} opacity="0.85" />
      <rect x="186" y="128" width="110" height="5" rx="2.5" fill={WHITE} opacity="0.35" />
      <rect x="186" y="150" width="104" height="70" rx="8" fill={WHITE} opacity="0.08" />
      <rect x="198" y="196" width="18" height="14" rx="3" fill="url(#glow)" />
      <rect x="222" y="184" width="18" height="26" rx="3" fill="url(#glow)" opacity="0.8" />
      <rect x="246" y="170" width="18" height="40" rx="3" fill="url(#glow)" />
      <rect x="270" y="162" width="10" height="48" rx="3" fill={SKY} opacity="0.6" />
      <rect x="302" y="150" width="112" height="32" rx="8" fill={WHITE} opacity="0.1" />
      <circle cx="318" cy="166" r="8" fill={AMBER} />
      <rect x="332" y="160" width="60" height="5" rx="2.5" fill={WHITE} opacity="0.6" />
      <rect x="332" y="169" width="40" height="4" rx="2" fill={WHITE} opacity="0.3" />
      <rect x="302" y="190" width="112" height="30" rx="8" fill={WHITE} opacity="0.1" />
      <circle cx="318" cy="205" r="8" fill={SKY} />
      <rect x="332" y="199" width="52" height="5" rx="2.5" fill={WHITE} opacity="0.6" />
      <rect x="332" y="208" width="34" height="4" rx="2" fill={WHITE} opacity="0.3" />
      <rect x="186" y="232" width="228" height="8" rx="4" fill={WHITE} opacity="0.12" />
      <rect x="186" y="232" width="150" height="8" rx="4" fill={AMBER} />

      {/* keyboard */}
      <rect x="182" y="280" width="200" height="24" rx="7" fill={WHITE} stroke={INK} strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <rect key={`k1-${i}`} x={190 + i * 15.5} y="285" width="11" height="6" rx="2" fill={INK_2} opacity="0.8" />
      ))}
      <rect x="216" y="294" width="130" height="6" rx="2" fill={INK_2} opacity="0.5" />
      <rect x="190" y="294" width="20" height="6" rx="2" fill={AMBER} />

      {/* mouse */}
      <path d="M404 282c0-9 8-14 16-14s16 5 16 14v10c0 8-7 12-16 12s-16-4-16-12v-10Z" fill={WHITE} stroke={INK} strokeWidth="3" />
      <path d="M420 270v12" stroke={INK} strokeWidth="3" />

      {/* headphones on stand */}
      <rect x="96" y="222" width="8" height="86" rx="3" fill={INK_2} />
      <rect x="80" y="300" width="40" height="8" rx="4" fill={INK} />
      <path d="M62 236c0-22 17-38 38-38s38 16 38 38" stroke={INK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <rect x="54" y="232" width="20" height="30" rx="8" fill={INK} />
      <rect x="126" y="232" width="20" height="30" rx="8" fill={INK} />
      <rect x="60" y="238" width="8" height="18" rx="3" fill={AMBER} />
      <rect x="132" y="238" width="8" height="18" rx="3" fill={AMBER} />

      {/* mug */}
      <rect x="470" y="272" width="30" height="34" rx="6" fill={WHITE} stroke={INK} strokeWidth="3" />
      <path d="M500 282h6a7 7 0 0 1 0 14h-6" stroke={INK} strokeWidth="3" fill="none" />
      <rect x="476" y="278" width="18" height="4" rx="2" fill={AMBER} />
      <path d="M480 262c0-4 4-4 4-8M488 264c0-4 4-4 4-8" stroke={INK_2} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

      {/* plant */}
      <path d="M448 246c-14-2-22 10-20 22 10 4 22-6 20-22Z" fill={GREEN} />
      <path d="M470 236c14-4 26 6 26 20-12 6-26-4-26-20Z" fill="#2aa66f" />
      <path d="M458 226c4-14 18-18 26-10-4 12-16 18-26 10Z" fill={GREEN} />
      <path d="M462 250v30M470 236c-4 12-6 26-8 44M458 230c4 12 4 26 4 46" stroke="#175f41" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M440 280h44l-4 28h-36l-4-28Z" fill={AMBER} />
      <rect x="436" y="276" width="52" height="10" rx="4" fill={INK} />

      {/* floating price tag */}
      <g transform="rotate(-8 100 120)">
        <rect x="52" y="104" width="96" height="40" rx="10" fill={WHITE} stroke={INK} strokeWidth="3" />
        <circle cx="70" cy="124" r="6" fill={AMBER} />
        <rect x="84" y="114" width="48" height="6" rx="3" fill={INK} />
        <rect x="84" y="126" width="32" height="5" rx="2.5" fill={INK_2} opacity="0.5" />
      </g>

      {/* floating check badge */}
      <g>
        <circle cx="470" cy="180" r="22" fill={WHITE} stroke={INK} strokeWidth="3" />
        <path d="m460 181 7 7 13-14" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/* ---------- Empty states ---------- */
export function EmptyBagIllustration(props) {
  return (
    <svg {...svgProps('0 0 260 220', props)} aria-label="An empty shopping bag">
      <ellipse cx="130" cy="196" rx="86" ry="10" fill={CREAM_2} />
      <circle cx="200" cy="52" r="26" fill={AMBER_SOFT} />
      <path d="M62 78h136l12 104H50L62 78Z" fill={WHITE} stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeDasharray="10 8" />
      <path d="M96 78V62a34 34 0 0 1 68 0v16" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M76 100h108" stroke={CREAM_2} strokeWidth="4" strokeLinecap="round" />
      <circle cx="130" cy="136" r="18" fill={AMBER_SOFT} />
      <path d="M124 136h12M130 130v12" stroke={AMBER} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M212 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={AMBER} />
      <circle cx="42" cy="70" r="4" fill={SKY} />
      <circle cx="226" cy="120" r="5" fill={SKY} />
    </svg>
  );
}

export function EmptyWishlistIllustration(props) {
  return (
    <svg {...svgProps('0 0 260 220', props)} aria-label="An empty wishlist">
      <ellipse cx="130" cy="196" rx="80" ry="10" fill={CREAM_2} />
      <circle cx="66" cy="60" r="22" fill={AMBER_SOFT} />
      <path d="M130 178S48 130 48 84a34 34 0 0 1 62-19l20 24 20-24a34 34 0 0 1 62 19c0 46-82 94-82 94Z" fill={WHITE} stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeDasharray="10 8" />
      <path d="M78 84a20 20 0 0 1 20-20" stroke={SKY} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M200 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={AMBER} />
      <path d="M36 140l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={INK_2} opacity="0.5" />
      <circle cx="228" cy="150" r="5" fill={SKY} />
      <circle cx="110" cy="118" r="4" fill={AMBER} />
      <circle cx="150" cy="118" r="4" fill={AMBER} />
      <path d="M118 136c6 6 18 6 24 0" stroke={AMBER} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function EmptyOrdersIllustration(props) {
  return (
    <svg {...svgProps('0 0 260 220', props)} aria-label="No orders yet">
      <ellipse cx="130" cy="200" rx="84" ry="10" fill={CREAM_2} />
      <circle cx="196" cy="60" r="28" fill={AMBER_SOFT} />
      <path d="M74 28h112v148l-14-10-14 10-14-10-14 10-14-10-14 10-14-10-14 10V28Z" fill={WHITE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="92" y="48" width="44" height="8" rx="4" fill={INK} />
      <rect x="92" y="70" width="76" height="6" rx="3" fill={CREAM_2} />
      <rect x="92" y="86" width="60" height="6" rx="3" fill={CREAM_2} />
      <rect x="92" y="102" width="70" height="6" rx="3" fill={CREAM_2} />
      <rect x="92" y="126" width="30" height="8" rx="4" fill={INK_2} opacity="0.6" />
      <rect x="140" y="126" width="28" height="8" rx="4" fill={AMBER} />
      <circle cx="180" cy="150" r="26" fill={WHITE} stroke={INK} strokeWidth="4" />
      <path d="M199 169l18 18" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M172 150h16M180 142v16" stroke={AMBER} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="46" cy="110" r="5" fill={SKY} />
      <path d="M52 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={AMBER} />
    </svg>
  );
}

export function OrderSuccessIllustration(props) {
  return (
    <svg {...svgProps('0 0 300 240', props)} aria-label="Order placed successfully">
      <ellipse cx="150" cy="218" rx="96" ry="10" fill={CREAM_2} />
      <circle cx="150" cy="120" r="88" fill={AMBER_SOFT} />
      {/* confetti */}
      <rect x="40" y="60" width="10" height="10" rx="2" fill={AMBER} transform="rotate(20 45 65)" />
      <rect x="250" y="80" width="10" height="10" rx="2" fill={SKY} transform="rotate(-30 255 85)" />
      <circle cx="60" cy="150" r="5" fill={GREEN} />
      <circle cx="248" cy="160" r="5" fill={AMBER} />
      <path d="M70 100l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={INK_2} opacity="0.5" />
      <path d="M232 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={AMBER} />
      {/* box */}
      <path d="M150 90l64 30v66l-64 30-64-30v-66l64-30Z" fill="#e8c48a" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M86 120l64 30 64-30" stroke={INK} strokeWidth="4" strokeLinejoin="round" fill="none" />
      <path d="M150 150v66" stroke={INK} strokeWidth="4" />
      <path d="M150 90l64 30 22-14-64-30-22 14Z" fill="#f1d7a8" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M150 90 86 120l-22-14 64-30 22 14Z" fill="#f1d7a8" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M150 150v66M118 135v66" stroke={AMBER} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      {/* check badge */}
      <circle cx="214" cy="80" r="30" fill={GREEN} stroke={WHITE} strokeWidth="6" />
      <path d="m200 81 9 9 19-20" stroke={WHITE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ---------- Auth (drawn for a dark background) ---------- */
export function StorefrontIllustration(props) {
  return (
    <svg {...svgProps('0 0 380 300', props)} aria-label="A small storefront">
      <ellipse cx="190" cy="282" rx="150" ry="10" fill="rgba(255,255,255,0.08)" />
      <rect x="60" y="120" width="260" height="150" rx="8" fill="#f5f2ec" />
      <rect x="60" y="120" width="260" height="14" fill="#ece7dd" />
      {/* awning */}
      <path d="M40 92h300l-18 50H58L40 92Z" fill={AMBER} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${40 + i * 43} 92h21l-2 50h-19z`} fill={WHITE} opacity={i % 2 ? 0.9 : 0} />
      ))}
      <path d="M40 92h300" stroke={INK} strokeWidth="4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={`s-${i}`} cx={62 + i * 37} cy="142" r="6" fill={AMBER} />
      ))}
      {/* sign */}
      <rect x="130" y="40" width="120" height="44" rx="10" fill={WHITE} />
      <path d="M190 48c.9 5 5 9 10 10-5 .9-9 5-10 10-.9-5-5-9-10-10 5-.9 9-5 10-10Z" fill={INK} />
      <rect x="152" y="58" width="24" height="6" rx="3" fill={INK} />
      <rect x="204" y="58" width="24" height="6" rx="3" fill={INK} />
      {/* door */}
      <rect x="164" y="170" width="52" height="100" rx="6" fill={INK} />
      <rect x="172" y="180" width="36" height="46" rx="4" fill={SKY} />
      <circle cx="206" cy="236" r="3" fill={AMBER} />
      {/* windows */}
      <rect x="82" y="170" width="62" height="60" rx="6" fill={SKY} stroke={INK} strokeWidth="4" />
      <rect x="236" y="170" width="62" height="60" rx="6" fill={SKY} stroke={INK} strokeWidth="4" />
      <path d="M82 200h62M236 200h62" stroke={INK} strokeWidth="4" />
      {/* window contents */}
      <rect x="92" y="208" width="14" height="16" rx="3" fill={AMBER} />
      <rect x="112" y="204" width="22" height="20" rx="3" fill={INK_2} />
      <circle cx="256" cy="214" r="9" fill={AMBER} />
      <rect x="272" y="206" width="18" height="18" rx="3" fill={INK_2} />
      {/* plants */}
      <path d="M68 270h24l-3-26H71l-3 26Z" fill={AMBER} />
      <path d="M80 244c-8-14 0-26 8-30 6 10 4 22-8 30Z" fill="#2aa66f" />
      <path d="M288 270h24l-3-26h-18l-3 26Z" fill={AMBER} />
      <path d="M300 244c8-14 0-26-8-30-6 10-4 22 8 30Z" fill="#2aa66f" />
      {/* open sign */}
      <rect x="220" y="182" width="0" height="0" />
      <path d="M340 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={AMBER} />
      <circle cx="36" cy="150" r="5" fill={SKY} />
    </svg>
  );
}

export function LockedIllustration(props) {
  return (
    <svg {...svgProps('0 0 260 220', props)} aria-label="Sign in required">
      <ellipse cx="130" cy="200" rx="80" ry="10" fill={CREAM_2} />
      <circle cx="130" cy="110" r="76" fill={AMBER_SOFT} />
      <rect x="82" y="96" width="96" height="78" rx="14" fill={INK} />
      <path d="M100 96V74a30 30 0 0 1 60 0v22" stroke={INK} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="130" cy="130" r="11" fill={AMBER} />
      <rect x="126" y="134" width="8" height="18" rx="3" fill={AMBER} />
      <g transform="rotate(-30 206 150)">
        <circle cx="206" cy="132" r="14" fill={WHITE} stroke={INK} strokeWidth="4" />
        <circle cx="206" cy="132" r="4" fill={INK} />
        <rect x="203" y="144" width="6" height="40" rx="2" fill={INK} />
        <rect x="203" y="170" width="14" height="6" rx="2" fill={INK} />
        <rect x="203" y="180" width="10" height="6" rx="2" fill={INK} />
      </g>
      <path d="M50 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill={AMBER} />
      <circle cx="220" cy="70" r="5" fill={SKY} />
    </svg>
  );
}

export function NotFoundIllustration(props) {
  return (
    <svg {...svgProps('0 0 320 220', props)} aria-label="Page not found">
      <ellipse cx="160" cy="200" rx="110" ry="10" fill={CREAM_2} />
      <circle cx="160" cy="100" r="80" fill={AMBER_SOFT} />
      {/* left plug */}
      <path d="M20 118c30 0 40-20 70-20" stroke={INK} strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="86" y="82" width="44" height="32" rx="8" fill={INK} />
      <rect x="130" y="88" width="16" height="6" rx="3" fill={INK_2} />
      <rect x="130" y="102" width="16" height="6" rx="3" fill={INK_2} />
      {/* right socket */}
      <path d="M300 118c-30 0-40-20-70-20" stroke={INK} strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="190" y="78" width="44" height="40" rx="8" fill={WHITE} stroke={INK} strokeWidth="4" />
      <rect x="196" y="88" width="10" height="6" rx="2" fill={INK} />
      <rect x="196" y="102" width="10" height="6" rx="2" fill={INK} />
      {/* spark */}
      <path d="M160 74l4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" fill={AMBER} />
      <path d="M156 122l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" fill={AMBER} />
      <text x="160" y="176" textAnchor="middle" fontFamily="Sora, Inter, sans-serif" fontWeight="700" fontSize="34" fill={INK}>404</text>
    </svg>
  );
}

/* ---------- Product image placeholder ---------- */
export function ImagePlaceholder(props) {
  return (
    <svg {...svgProps('0 0 120 120', props)} aria-label="No image available">
      <rect x="14" y="22" width="92" height="76" rx="12" fill={WHITE} stroke={INK_2} strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
      <circle cx="44" cy="48" r="8" fill={AMBER} />
      <path d="M24 88l24-26 16 16 12-10 20 20" stroke={INK_2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    </svg>
  );
}

/* ---------- Category icons ---------- */
function IconFrame({ children, ...props }) {
  return (
    <svg {...svgProps('0 0 48 48', props)} fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
export const KeyboardIcon = (p) => (
  <IconFrame {...p} aria-label="Keyboards">
    <rect x="4" y="14" width="40" height="22" rx="5" fill={WHITE} />
    <path d="M11 21h2M17 21h2M23 21h2M29 21h2M35 21h2M11 27h2M17 27h2M29 27h2M35 27h2" />
    <path d="M17 31h14" stroke={AMBER} strokeWidth="3" />
  </IconFrame>
);
export const MonitorIcon = (p) => (
  <IconFrame {...p} aria-label="Monitors">
    <rect x="5" y="9" width="38" height="25" rx="4" fill={WHITE} />
    <path d="M18 40h12M24 34v6" />
    <rect x="10" y="14" width="12" height="9" rx="2" fill={AMBER} stroke="none" />
    <path d="M26 16h12M26 21h8" stroke={INK_2} opacity="0.6" />
  </IconFrame>
);
export const HeadphonesIcon = (p) => (
  <IconFrame {...p} aria-label="Audio">
    <path d="M9 28v-4a15 15 0 0 1 30 0v4" />
    <rect x="6" y="26" width="9" height="14" rx="4" fill={AMBER} />
    <rect x="33" y="26" width="9" height="14" rx="4" fill={AMBER} />
  </IconFrame>
);
export const MouseIcon = (p) => (
  <IconFrame {...p} aria-label="Mice">
    <path d="M24 6c8 0 13 6 13 14v10c0 8-5 13-13 13S11 38 11 30V20c0-8 5-14 13-14Z" fill={WHITE} />
    <path d="M24 6v14M11 22h26" />
    <rect x="21" y="11" width="6" height="6" rx="3" fill={AMBER} stroke="none" />
  </IconFrame>
);
export const BoxIcon = (p) => (
  <IconFrame {...p} aria-label="Accessories">
    <path d="M8 16l16-8 16 8v18l-16 8-16-8V16Z" fill={WHITE} />
    <path d="M8 16l16 8 16-8M24 24v18" />
    <path d="M16 12l16 8" stroke={AMBER} strokeWidth="3" />
  </IconFrame>
);

// Picks an icon from a category name/slug; falls back to a box.
export function CategoryIcon({ category, ...props }) {
  const key = `${category?.slug || ''} ${category?.name || ''}`.toLowerCase();
  if (/key|periph/.test(key)) return <KeyboardIcon {...props} />;
  if (/monitor|display|screen/.test(key)) return <MonitorIcon {...props} />;
  if (/audio|head|sound|speaker/.test(key)) return <HeadphonesIcon {...props} />;
  if (/mouse|mice/.test(key)) return <MouseIcon {...props} />;
  return <BoxIcon {...props} />;
}

/* ---------- Value-prop icons ---------- */
function ValueFrame({ children, ...props }) {
  return (
    <svg {...svgProps('0 0 48 48', props)} fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="22" fill={AMBER_SOFT} stroke="none" />
      {children}
    </svg>
  );
}
export const TruckIcon = (p) => (
  <ValueFrame {...p} aria-label="Delivery">
    <rect x="8" y="16" width="20" height="14" rx="2" fill={WHITE} />
    <path d="M28 20h7l5 6v4h-12v-10Z" fill={WHITE} />
    <circle cx="15" cy="32" r="3" fill={AMBER} />
    <circle cx="35" cy="32" r="3" fill={AMBER} />
  </ValueFrame>
);
export const ShieldIcon = (p) => (
  <ValueFrame {...p} aria-label="Secure">
    <path d="M24 9l12 4v10c0 8-5 13-12 16-7-3-12-8-12-16V13l12-4Z" fill={WHITE} />
    <path d="m18 24 4 4 8-8" stroke={AMBER} strokeWidth="3" />
  </ValueFrame>
);
export const RefreshIcon = (p) => (
  <ValueFrame {...p} aria-label="Returns">
    <path d="M13 24a11 11 0 0 1 19-7.5M35 24a11 11 0 0 1-19 7.5" />
    <path d="M32 10v7h-7M16 38v-7h7" stroke={AMBER} strokeWidth="3" />
  </ValueFrame>
);
export const HeadsetIcon = (p) => (
  <ValueFrame {...p} aria-label="Support">
    <path d="M12 28v-4a12 12 0 0 1 24 0v4" />
    <rect x="10" y="26" width="7" height="10" rx="3" fill={AMBER} />
    <rect x="31" y="26" width="7" height="10" rx="3" fill={AMBER} />
    <path d="M34 36c0 3-3 4-8 4" />
  </ValueFrame>
);

/* ---------- Generic payment glyphs (no brand marks) ---------- */
export function PaymentGlyphs() {
  const base = { viewBox: '0 0 40 26', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true };
  return (
    <>
      <svg {...base}><rect width="40" height="26" rx="5" fill="#fff" /><rect x="6" y="8" width="10" height="7" rx="2" fill={AMBER} /><rect x="6" y="18" width="20" height="3" rx="1.5" fill={INK_2} /></svg>
      <svg {...base}><rect width="40" height="26" rx="5" fill="#fff" /><circle cx="16" cy="13" r="6" fill={INK} /><circle cx="24" cy="13" r="6" fill={AMBER} opacity="0.9" /></svg>
      <svg {...base}><rect width="40" height="26" rx="5" fill="#fff" /><path d="M10 13c3-4 7-4 10 0s7 4 10 0" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" /></svg>
      <svg {...base}><rect width="40" height="26" rx="5" fill="#fff" /><path d="M14 8v10M26 8v10M14 13h12" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /><circle cx="20" cy="13" r="2.5" fill={AMBER} /></svg>
    </>
  );
}
