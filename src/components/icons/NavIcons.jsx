// Chunky, toy-like tab bar icons: rounded filled shapes with a soft two-tone fill and a bold outline,
// drawn in currentColor so they follow the app's colours (accent when active, muted otherwise).
const FILL_ON = 0.32;
const FILL_OFF = 0.14;

function Svg({ children, on }) {
  return (
    <svg viewBox="0 0 28 28" width="1em" height="1em" aria-hidden="true" focusable="false" className={`nav-svg${on ? ' on' : ''}`}
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const tone = (on) => ({ fill: 'currentColor', fillOpacity: on ? FILL_ON : FILL_OFF });

export function HomeIcon({ on }) {
  return (
    <Svg on={on}>
      <path d="M4.5 12.6 14 5l9.5 7.6V22a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 22Z" {...tone(on)} />
      <path d="M11.2 24.5v-6a2.8 2.8 0 0 1 5.6 0v6" fill="currentColor" fillOpacity={on ? 0.85 : 0.5} />
      <path d="M19.5 5.5v3.2" />
    </Svg>
  );
}

export function CardsIcon({ on }) {
  return (
    <Svg on={on}>
      <rect x="3" y="8" width="12.5" height="16.5" rx="3" transform="rotate(-12 9 16)" {...tone(on)} />
      <rect x="11" y="4" width="13.5" height="17.5" rx="3.2" fill="var(--surface)" stroke="none" />
      <rect x="11" y="4" width="13.5" height="17.5" rx="3.2" fill="currentColor" fillOpacity={on ? 0.5 : 0.24} />
      <path d="M17.75 8.6l1.35 2.75 3.03.44-2.19 2.14.52 3.02-2.71-1.43-2.71 1.43.52-3.02-2.19-2.14 3.03-.44z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ExamIcon({ on }) {
  return (
    <Svg on={on}>
      <rect x="5" y="5" width="18" height="20" rx="3.2" {...tone(on)} />
      <rect x="10" y="3" width="8" height="4.4" rx="1.6" fill="currentColor" fillOpacity={on ? 0.85 : 0.5} />
      <path d="m9.5 13.6 2.3 2.3 4.6-4.8" strokeWidth="2.6" />
      <path d="M9.5 20.5h9" />
    </Svg>
  );
}

export function MeIcon({ on }) {
  return (
    <Svg on={on}>
      <circle cx="14" cy="10" r="5" fill="currentColor" fillOpacity={on ? 0.55 : 0.28} />
      <path d="M4.8 24.2c.9-4.6 4.6-7.4 9.2-7.4s8.3 2.8 9.2 7.4a1.3 1.3 0 0 1-1.3 1.5H6.1a1.3 1.3 0 0 1-1.3-1.5Z" {...tone(on)} />
    </Svg>
  );
}

/** Admin (only the owner sees this tab): an inbox tray with a speech bubble, for learners' reports. */
export function AdminIcon({ on }) {
  return (
    <Svg on={on}>
      <path d="M4 15.5 6.6 7.4A2.5 2.5 0 0 1 9 5.6h10a2.5 2.5 0 0 1 2.4 1.8l2.6 8.1V22a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 4 22Z" {...tone(on)} />
      <path d="M4 15.5h5.5l1.6 2.8h5.8l1.6-2.8H24" />
      <path d="M10.5 10.5h7" />
    </Svg>
  );
}

/** The big Play glyph inside the raised center tile: a rounded, solid triangle. */
export function PlayGlyph() {
  return (
    <svg viewBox="0 0 28 28" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d="M9.5 6.6c0-1.6 1.7-2.5 3-1.7l11 7.4a2 2 0 0 1 0 3.4l-11 7.4c-1.3.8-3-.1-3-1.7Z" fill="currentColor" />
    </svg>
  );
}

export const NAV_ICONS = { home: HomeIcon, cards: CardsIcon, exam: ExamIcon, me: MeIcon, admin: AdminIcon };
