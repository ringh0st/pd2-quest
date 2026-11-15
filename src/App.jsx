import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useRoute, go } from './hooks/useRoute.js';
import { useStore } from './state/store.js';
import { useReducedMotion } from './hooks/useMotionPrefs.js';
import { useIsFocusMode } from './hooks/useFocusMode.js';
import { setSoundEnabled } from './audio/sfx.js';
import { setHapticsEnabled } from './audio/haptics.js';
import { dueCardCount } from './state/selectors.js';
import { FeedbackProvider } from './components/Feedback.jsx';
import { CelebrationLayer } from './components/CelebrationLayer.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Home } from './screens/Home.jsx';
import { WorldMap } from './screens/WorldMap.jsx';
import { World } from './screens/World.jsx';
import { Play } from './screens/Play.jsx';
import { Shop } from './screens/Shop.jsx';
import { Bolt } from './screens/Bolt.jsx';
import { THEMES } from './game/economy.js';
import { Lesson } from './screens/Lesson.jsx';
import { Sprint } from './screens/Sprint.jsx';
import { Cards } from './screens/Cards.jsx';
import { Exam } from './screens/Exam.jsx';
import { Me } from './screens/Me.jsx';
import { Settings } from './screens/Settings.jsx';
import { Resources } from './screens/Resources.jsx';
import { Onboarding } from './screens/Onboarding.jsx';

const FOCUS_ROUTES = /^\/(lesson|sprint|welcome|play|bolt)/;

function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const fn = () => setDark(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return dark;
}

function useApplySettings() {
  const st = useStore((s) => s.settings);
  const accent = useStore((s) => s.equipped?.theme ?? 'magenta');
  const sysDark = useSystemDark();
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = document.documentElement;
    const theme = st.theme === 'system' ? (sysDark ? 'dark' : 'light') : st.theme;
    root.dataset.theme = theme;
    root.dataset.calm = String(!!st.calm);
    root.dataset.font = st.font;
    root.style.setProperty('--text-scale', String(st.textScale));
    root.classList.toggle('reduced', reduced);
    // Accent theme from the shop (each pair checked for AA contrast in economy.js)
    const th = THEMES.find((t) => t.id === accent) ?? THEMES[0];
    const [p, ledge, on, soft] = theme === 'dark' ? th.dark : th.light;
    root.style.setProperty('--primary', p);
    root.style.setProperty('--primary-ledge', ledge);
    root.style.setProperty('--on-primary', on);
    root.style.setProperty('--primary-soft', soft);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14111C' : '#FFF9F2');
    setSoundEnabled(st.sound);
    setHapticsEnabled(st.haptics);
  }, [st, sysDark, reduced, accent]);
  return reduced;
}

function Screen({ route }) {
  const [a, b] = route.parts;
  switch (a) {
    case undefined: return <Home />;
    case 'map': case 'learn': return <WorldMap />;
    case 'world': case 'section': return <World id={b} key={b} />;
    case 'play': return <Play id={b} key={b} />;
    case 'shop': return <Shop />;
    case 'bolt': return <Bolt />;
    case 'lesson': return <Lesson id={b} key={b} />;
    case 'sprint': return <Sprint query={route.query} key={JSON.stringify(route.query)} />;
    case 'cards': return <Cards query={route.query} key={JSON.stringify(route.query)} />;
    case 'exam': return <Exam />;
    case 'me': return <Me />;
    case 'settings': return <Settings />;
    case 'resources': return <Resources />;
    case 'welcome': return <Onboarding />;
    default: return <Home />;
  }
}

const TITLES = {
  '': 'Home', map: 'Adventure map', learn: 'Adventure map', world: 'World', section: 'World', play: 'Level', shop: 'Shop', bolt: 'Daily Bolt',
  lesson: 'Lesson', sprint: 'Practice sprint', cards: 'Flashcards', exam: 'Exam simulator', me: 'Me', settings: 'Settings',
  resources: 'Resources', welcome: 'Welcome',
};

/** On every screen change: a page title for the tab/screen reader, and focus on the new screen's heading. */
function useRouteFocus(path) {
  const first = useRef(true);
  useEffect(() => {
    const key = path.split('/')[1] || '';
    document.title = `${TITLES[key] ?? 'PD2 Quest'} · PD2 Quest`;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      const main = document.getElementById('main');
      if (!main || main.contains(document.activeElement)) return;
      const h = main.querySelector('h1') || main;
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }, 60);
    return () => clearTimeout(t);
  }, [path]);
}

export default function App() {
  const route = useRoute();
  const onboarded = useStore((s) => s.onboarded);
  const cards = useStore((s) => s.cards);
  const reduced = useApplySettings();
  const focusFromScreen = useIsFocusMode();
  const focus = FOCUS_ROUTES.test(route.path) || focusFromScreen;
  useRouteFocus(route.path);

  useEffect(() => {
    if (!onboarded && route.path !== '/welcome' && !route.path.startsWith('/lesson')) go('/welcome');
  }, [onboarded, route.path]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <FeedbackProvider>
        <a href="#main" className="sr-only skip-link">Skip to content</a>
        <div className="app">
          <ErrorBoundary key={route.path}><Screen route={route} /></ErrorBoundary>
        </div>
        {!focus && onboarded && <BottomNav path={route.path} dueCards={dueCardCount(cards)} />}
        <CelebrationLayer />
      </FeedbackProvider>
    </MotionConfig>
  );
}
