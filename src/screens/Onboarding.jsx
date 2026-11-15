// One short screen: pick a daily goal, optionally a name and exam date, then straight into lesson 1.
import { useState } from 'react';
import { motion } from 'motion/react';
import { setState, updateSettings } from '../state/store.js';
import { FEEL_PRESETS } from '../state/feelPresets.js';
import { Segmented } from '../components/Controls.jsx';
import { replace } from '../hooks/useRoute.js';
import { sections } from '../data/index.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const GOALS = [[20, '😌 20'], [50, '🙂 50'], [100, '💪 100'], [150, '🔥 150']];

export function Onboarding() {
  const [goal, setGoal] = useState(50);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [feel, setFeel] = useState('balanced');
  const reduced = useReducedMotion();
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
        <motion.div style={{ fontSize: 72 }} aria-hidden="true" animate={reduced ? {} : { rotate: [0, -10, 10, -5, 0], y: [0, -8, 0] }} transition={{ duration: 1.2, delay: 0.4 }}>🚀</motion.div>
        <h1>PD2 Quest</h1>
        <p className="muted">Pass Salesforce Platform Developer II in tiny, fun bites. Built for brains that love quick wins.</p>
      </motion.div>
      <motion.ul className="list-plain card stack-s small" {...anim(1)}>
        <li>⚡ 2–4 minute lessons, one idea per card</li>
        <li>🔥 Streaks that forgive you, with freezes</li>
        <li>🧠 Smart reviews that come back at the right time</li>
        <li>🏁 Real-exam mock tests with full explanations</li>
        <li>🅿️ “Park it” button for wandering thoughts</li>
      </motion.ul>
      <motion.div className="card stack" {...anim(2)}>
        <Segmented label="Daily goal (XP, about 1 min per 10 XP)" value={goal} onChange={setGoal} options={GOALS} />
        <Segmented
          label="How do you like it? (sound, buzz, confetti, motion)" value={feel}
          onChange={setFeel}
          options={Object.entries(FEEL_PRESETS).map(([k, p]) => [k, p.label])}
        />
        <p className="small muted">You can change this any time in Settings.</p>
        <div className="field">
          <label htmlFor="ob-name">What should we call you? (optional)</label>
          <input id="ob-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </div>
        <div className="field">
          <label htmlFor="ob-date">Exam date, if booked (optional)</label>
          <input id="ob-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </motion.div>
      <motion.div {...anim(3)}>
        <button className="btn primary block big" onClick={() => start()}>Start my first lesson ▶</button>
        <button className="btn block" style={{ marginTop: 10 }} onClick={() => start(`/placement/${sections[0].id}`)}>
          I have PD1 or Apex experience: skip what I know
        </button>
      </motion.div>
    </main>
  );
}
