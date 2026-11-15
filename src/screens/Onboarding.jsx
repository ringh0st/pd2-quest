// One short screen: pick a daily goal, optionally a name and exam date, then straight into lesson 1.
import { useState } from 'react';
import { motion } from 'motion/react';
import { setState, updateSettings, useStore } from '../state/store.js';
import { FEEL_PRESETS } from '../state/feelPresets.js';
import { InstallHelpButton } from '../components/InstallHelp.jsx';
import { Segmented } from '../components/Controls.jsx';
import { replace } from '../hooks/useRoute.js';
import { sections } from '../data/index.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { Icon } from '../components/icons/Icon.jsx';
import { HeroArt } from '../components/art/HeroArt.jsx';
import { iconOption } from './Settings.jsx';

const GOALS = [iconOption(20, 'leaf', '20'), iconOption(50, 'smile', '50'), iconOption(100, 'muscle', '100'), iconOption(150, 'flame', '150')];

const FEATURES = [
  ['bolt', 'primary', '2–4 minute lessons, one idea per card'],
  ['flame', 'flame', 'Streaks that forgive you, with freezes'],
  ['brain', 'teal', 'Smart reviews that come back at the right time'],
  ['exam', 'gold', 'Real-exam mock tests with full explanations'],
  ['park', 'green', '“Park it” button for wandering thoughts'],
];

export function Onboarding() {
  const [goal, setGoal] = useState(50);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [feel, setFeel] = useState('balanced');
  const reduced = useReducedMotion();
  const calm = useStore((st) => st.settings.calm);
  const still = reduced || calm;
  const anim = (i) => (reduced ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.2, 0, 0, 1] } });

  const start = (to = `/lesson/${sections[0].lessons[0].id}`) => {
    sfx.levelUp(); haptic('success');
    updateSettings(FEEL_PRESETS[feel].settings);
    setState({ onboarded: true, dailyGoal: goal, name: name.trim(), examDate: date });
    replace(to);
  };

  return (
    <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
      <motion.div className="center stack-s" {...anim(0)}>
        <motion.div className="pq-hero" aria-hidden="true" animate={still ? {} : { rotate: [0, -6, 6, -3, 0], y: [0, -8, 0] }} transition={{ duration: 1.2, delay: 0.4 }}>
          <HeroArt kind="welcome" size={112} />
        </motion.div>
        <h1>PD2 Quest</h1>
        <p className="muted">Pass Salesforce Platform Developer II in tiny, fun bites. Built for brains that love quick wins.</p>
      </motion.div>
      <motion.ul className="list-plain card pq-features small" {...anim(1)}>
        {FEATURES.map(([icon, tone, text]) => (
          <li key={icon}><span className="pq-tile s" data-tone={tone}><Icon name={icon} /></span><span>{text}</span></li>
        ))}
      </motion.ul>
      <motion.div className="card stack" {...anim(2)}>
        <div className="stack-s">
          <Segmented label="Daily XP goal" value={goal} onChange={setGoal} options={GOALS} />
          <p className="small muted pq-hint">10 XP is about 1 minute.</p>
        </div>
        <div className="stack-s">
          <Segmented
            label="How should it feel?" value={feel}
            onChange={setFeel}
            options={Object.entries(FEEL_PRESETS).map(([k, p]) => iconOption(k, p.icon, p.label))}
          />
          <p className="small muted pq-hint">Sounds, buzz, confetti and motion. Change it any time in Settings.</p>
        </div>
        <div className="field">
          <label htmlFor="ob-name">What should we call you?</label>
          <input id="ob-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Optional" />
        </div>
        <div className="field">
          <label htmlFor="ob-date">Exam date, if booked (optional)</label>
          <input id="ob-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </motion.div>
      <motion.div {...anim(3)}>
        <button className="btn primary block big" onClick={() => start()}>Start my first lesson <Icon name="play" fill /></button>
        <button className="btn block" style={{ marginTop: 10 }} onClick={() => start(`/placement/${sections[0].id}`)}>
          Know Apex? Skip ahead
        </button>
        <p className="small muted center" style={{ marginTop: 14 }}>On iPhone? Add it to your Home Screen first, so your progress lives in the app.</p>
        <div className="center" style={{ marginTop: 6 }}><InstallHelpButton /></div>
      </motion.div>
    </main>
  );
}
