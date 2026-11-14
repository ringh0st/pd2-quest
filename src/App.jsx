import { useEffect, useState } from 'react';
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
import { Home } from './screens/Home.jsx';
import { Learn } from './screens/Learn.jsx';
import { Section } from './screens/Section.jsx';
import { Lesson } from './screens/Lesson.jsx';
import { Sprint } from './screens/Sprint.jsx';
import { Cards } from './screens/Cards.jsx';
import { Exam } from './screens/Exam.jsx';
import { Me } from './screens/Me.jsx';
import { Settings } from './screens/Settings.jsx';
import { Resources } from './screens/Resources.jsx';
import { Onboarding } from './screens/Onboarding.jsx';

const FOCUS_ROUTES = /^\/(lesson|sprint|welcome)/;

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
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14111C' : '#FFF9F2');
    setSoundEnabled(st.sound);
    setHapticsEnabled(st.haptics);
  }, [st, sysDark, reduced]);
  return reduced;
}

function Screen({ route }) {
  const [a, b] = route.parts;
  switch (a) {
    case undefined: return <Home />;
    case 'learn': return <Learn />;
    case 'section': return <Section id={b} key={b} />;
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

export default function App() {
  const route = useRoute();
  const onboarded = useStore((s) => s.onboarded);
  const cards = useStore((s) => s.cards);
  const reduced = useApplySettings();
  const focusFromScreen = useIsFocusMode();
  const focus = FOCUS_ROUTES.test(route.path) || focusFromScreen;

  useEffect(() => {
    if (!onboarded && route.path !== '/welcome' && !route.path.startsWith('/lesson')) go('/welcome');
  }, [onboarded, route.path]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <FeedbackProvider>
        <a href="#main" className="sr-only">Skip to content</a>
        <div className="app">
          <Screen route={route} />
        </div>
        {!focus && onboarded && <BottomNav path={route.path} dueCards={dueCardCount(cards)} />}
        <CelebrationLayer />
      </FeedbackProvider>
    </MotionConfig>
  );
}
