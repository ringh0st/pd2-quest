import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useRoute, go } from './hooks/useRoute.js';
import { useStore } from './state/store.js';
import { useReducedMotion } from './hooks/useMotionPrefs.js';
import { useSystemDark } from './hooks/useSystemDark.js';
import { useIsFocusMode } from './hooks/useFocusMode.js';
import { setSoundEnabled } from './audio/sfx.js';
import { setHapticsEnabled } from './audio/haptics.js';
import { dueCardCount } from './state/selectors.js';
import { FeedbackProvider } from './components/Feedback.jsx';
import { CelebrationLayer } from './components/CelebrationLayer.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { SplashScreen } from './components/splash/SplashScreen.jsx';
import { Home } from './screens/Home.jsx';
// Secondary screens load when first opened (smaller start-up); the service worker caches them for offline use.
const screen = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const WorldMap = screen(() => import('./screens/WorldMap.jsx'), 'WorldMap');
const World = screen(() => import('./screens/World.jsx'), 'World');
const Shop = screen(() => import('./screens/Shop.jsx'), 'Shop');
const Bolt = screen(() => import('./screens/Bolt.jsx'), 'Bolt');
const Cards = screen(() => import('./screens/Cards.jsx'), 'Cards');
const Exam = screen(() => import('./screens/Exam.jsx'), 'Exam');
const Me = screen(() => import('./screens/Me.jsx'), 'Me');
const Settings = screen(() => import('./screens/Settings.jsx'), 'Settings');
const Resources = screen(() => import('./screens/Resources.jsx'), 'Resources');
const Placement = screen(() => import('./screens/Placement.jsx'), 'Placement');
const Plan = screen(() => import('./screens/Plan.jsx'), 'Plan');
import { Play } from './screens/Play.jsx';
import { THEMES } from './game/economy.js';
import { Lesson } from './screens/Lesson.jsx';
import { Sprint } from './screens/Sprint.jsx';
import { Onboarding } from './screens/Onboarding.jsx';
import { scrollToTop } from './lib/scroller.js';
import { setMusicSettings } from './audio/music.js';
import { setPreferredVoice } from './lib/speech.js';
import { setScreenFill } from './lib/screenFit.js';
import { setSplashUp } from './lib/updates.js';
import { UpdateBanner } from './components/UpdateBanner.jsx';

const FOCUS_ROUTES = /^\/(lesson|sprint|welcome|play|bolt|placement)/;

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
    root.dataset.motion = reduced ? 'reduced' : 'full';
    // Accent theme from the shop (each pair checked for AA contrast in economy.js)
    const th = THEMES.find((t) => t.id === accent) ?? THEMES[0];
    const [p, ledge, on, soft] = theme === 'dark' ? th.dark : th.light;
    root.style.setProperty('--primary', p);
    root.style.setProperty('--primary-ledge', ledge);
    root.style.setProperty('--on-primary', on);
    root.style.setProperty('--primary-soft', soft);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#161412' : '#FFF9F2');
    setSoundEnabled(st.sound);
    setMusicSettings({ sound: st.sound, music: st.music });
    setHapticsEnabled(st.haptics);
    setPreferredVoice(st.voice);
    setScreenFill(st.fillScreen || 'off');
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
    case 'plan': return <Plan />;
    case 'placement': return <Placement a={b} b={route.parts[2]} key={route.path} />;
    default: return <Home />;
  }
}

const TITLES = {
  '': 'Home', map: 'Adventure map', learn: 'Adventure map', world: 'World', section: 'World', play: 'Level', shop: 'Shop', bolt: 'Daily Bolt',
  lesson: 'Lesson', sprint: 'Practice sprint', cards: 'Flashcards', exam: 'Exam simulator', me: 'Me', settings: 'Settings',
  resources: 'Resources', welcome: 'Welcome', placement: 'Placement', plan: 'Study plan',
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
      scrollToTop();
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

  // The opening splash shows once each time the app opens; the app loads underneath it.
  // Automated test browsers (navigator.webdriver) skip it so tests can drive the app straight away.
  const [splash, setSplash] = useState(() => !navigator.webdriver || window.__PD2_SHOW_SPLASH === true);
  const hideSplash = useCallback(() => {
    setSplash(false);
    document.getElementById('boot-splash')?.remove();
  }, []);
  useEffect(() => { if (!splash) document.getElementById('boot-splash')?.remove(); setSplashUp(splash); }, [splash]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <FeedbackProvider>
        <a href="#main" className="sr-only skip-link">Skip to content</a>
        <div className="app">
          <ErrorBoundary key={route.path}>
            <Suspense fallback={<main className="screen" id="main" aria-busy="true"><p className="sr-only">Loading…</p></main>}>
              <Screen route={route} />
            </Suspense>
          </ErrorBoundary>
        </div>
        {!focus && onboarded && <BottomNav path={route.path} dueCards={dueCardCount(cards)} />}
        <CelebrationLayer />
        {!splash && <UpdateBanner />}
        {splash && <SplashScreen onDone={hideSplash} />}
      </FeedbackProvider>
    </MotionConfig>
  );
}
