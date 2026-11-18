import { useStore, unparkThought } from '../state/store.js';
import { levelFor, rankFor } from '../engine/xp.js';
import { liveStreak } from '../engine/streak.js';
import { sectionMastery, readiness, accuracy } from '../engine/mastery.js';
import { dayKey } from '../engine/dates.js';
import { sections, exam } from '../data/index.js';
import { totalLessons } from '../state/selectors.js';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { CountUp } from '../components/CountUp.jsx';
import { sfx } from '../audio/sfx.js';
import { BADGES } from '../game/badges.js';
import { totalStars } from '../game/worlds.js';
import { Zap } from '../components/game/Zap.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { BadgeMedal } from '../components/art/BadgeMedal.jsx';
import { FeedbackButton } from '../components/FeedbackButton.jsx';

function lastDays(n) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(); d.setDate(d.getDate() - k);
    out.push({ key: dayKey(d.getTime()), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) });
  }
  return out;
}

export function Me() {
  const s = useStore();
  const lv = levelFor(s.xp);
  const streak = liveStreak(s.streak);
  const ready = readiness(sections, s.items);
  const acc = accuracy(s.items);
  const days = lastDays(7);
  const today = dayKey();

  return (
    <main className="screen" id="main">
      <div className="spread">
        <h1 className="me-title"><span className="ic-tile" aria-hidden="true"><Icon name="me" /></span><span>{s.name || 'Your progress'}</span></h1>
        <ThemeToggle />
        <a className="icon-btn" href="#/settings" aria-label="Settings" onClick={() => sfx.tap()}><Icon name="settings" /></a>
      </div>

      <section className="hero me-hero" aria-label="Level">
        <ProgressRing value={lv.progress} size={96} stroke={11} color="var(--gold-meter)" label={`Level ${lv.level}, ${Math.round(lv.progress * 100)}% to next`}>
          <div><div style={{ fontSize: 'calc(13px * var(--text-scale))', fontWeight: 700 }} className="muted">LEVEL</div><div style={{ fontSize: 30, fontWeight: 700 }}>{lv.level}</div></div>
        </ProgressRing>
        <div className="stack-s grow">
          <strong style={{ fontSize: 19 }}>{rankFor(lv.level, exam.ranks)}</strong>
          <span className="muted small"><CountUp value={s.xp} /> XP total · {lv.span - lv.into} XP to level {lv.level + 1}</span>
        </div>
        <span className="me-zap"><Zap size={64} mood="happy" /></span>
        <div className="me-chips"><span className="chip me-star-chip"><span className="ic-gold-fill"><Icon name="star" /></span>{totalStars(s.stars)}<span className="sr-only"> stars</span></span><CoinChip /></div>
      </section>

      <div className="stat-row">
        <div className="stat"><span className="num ic-label"><span className="ic-flame"><Icon name="flame" /></span>{streak}</span><span className="lbl">Day streak</span></div>
        <div className="stat"><span className="num">{acc ?? '–'}{acc != null && '%'}</span><span className="lbl">Accuracy</span></div>
        <div className="stat"><span className="num">{Object.keys(s.lessons).length}/{totalLessons()}</span><span className="lbl">Lessons</span></div>
      </div>

      <section className="card stack" aria-label="Last 7 days">
        <div className="spread"><strong>This week</strong><span className="small muted ic-label me-week-meta"><span>Best {s.streak.best}</span><span aria-hidden="true">·</span><span className="ic-freeze"><Icon name="freeze" /></span>{s.streak.freezes} freeze{s.streak.freezes === 1 ? '' : 's'}</span></div>
        <div className="week">
          {days.map((d) => {
            const xp = s.history[d.key] || 0;
            const lvl = xp === 0 ? '' : xp < s.dailyGoal / 2 ? 'lvl1' : xp < s.dailyGoal ? 'lvl2' : 'lvl3';
            return (
              <div className="day" key={d.key}>
                <div className={`cell ${lvl} ${d.key === today ? 'today' : ''}`} role="img" aria-label={`${d.key}: ${xp} XP${xp >= s.dailyGoal ? ', goal met' : ''}`}>{xp >= s.dailyGoal ? <Icon name="flame" className="week-flame" /> : null}</div>
                <span aria-hidden="true">{d.label}</span>
              </div>
            );
          })}
        </div>
        <p className="small muted">Any study keeps your streak. Freezes cover missed days automatically. You earn one every 7 days.</p>
      </section>

      <CalibrationCard calibration={s.calibration} />

      <section className="card stack" aria-label="Mastery by section">
        <div className="spread"><strong className="ic-label"><span className="ic-gold"><Icon name="brain" /></span>Memory strength</strong><strong>{ready}%</strong></div>
        {sections.map((sec) => {
          const m = Math.round(sectionMastery(sec, s.items) * 100);
          return (
            <a key={sec.id} href={`#/world/${sec.id}`} className="stack-s" style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="spread small"><span className="ic-label me-sec" style={{ '--sec-accent': sec.accent }}><span className="ic-sec"><Icon name={sec.icon} /></span><span>{sec.title} <span className="muted">({sec.weight}%)</span></span></span><strong>{m}%</strong></div>
              <div className="bar"><span style={{ width: `${Math.max(2, m)}%`, background: sec.accent }} /></div>
            </a>
          );
        })}
        <p className="small muted">Mastery grows when you answer questions right across spaced reviews, not just once.</p>
      </section>

      <section className="card stack" aria-labelledby="badges-title">
        <div className="spread"><h2 id="badges-title" className="ic-label" style={{ fontSize: 'calc(18px * var(--text-scale))' }}><span className="ic-gold"><Icon name="medal" /></span>Badges</h2><span className="chip">{Object.keys(s.badges).length}/{BADGES.length}</span></div>
        <ul className="list-plain badge-grid">
          {BADGES.map((b) => {
            const got = !!s.badges[b.id];
            return (
              <li key={b.id} className={`badge ${got ? 'got' : ''}`}>
                <BadgeMedal id={b.id} earned={got} size={60} />
                <strong className="small">{b.name}</strong>
                <span className="small muted">{b.about}</span>
                <span className="sr-only">{got ? 'Earned' : 'Not earned yet'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card stack" aria-label="Parked thoughts">
        <strong className="ic-label"><span className="ic-sec" style={{ '--sec-accent': 'var(--correct)' }}><Icon name="park" /></span>Parked thoughts</strong>
        {s.parked.length === 0
          ? <p className="small muted">Nothing parked. When a distracting thought pops up mid-study, tap the Park button to drop it here.</p>
          : (
            <ul className="list-plain">
              {s.parked.map((p) => (
                <li key={p.id} className="spread">
                  <span className="grow">{p.text}</span>
                  <button className="btn small" onClick={() => { sfx.done(); unparkThought(p.id); }} aria-label={`Done: ${p.text}`}><Icon name="check" /> Done</button>
                </li>
              ))}
            </ul>
          )}
      </section>

      <nav className="me-links" aria-label="More">
        <a className="btn" href="#/shop" onClick={() => sfx.tap()}><Icon name="shirt" /> Shop</a>
        <a className="btn" href="#/resources" onClick={() => sfx.tap()}><Icon name="book" /> Resources</a>
        <a className="btn" href="#/settings" onClick={() => sfx.tap()}><Icon name="settings" /> Settings</a>
      </nav>
      <FeedbackButton kind="app" where={{ route: '/me' }} variant="row" label="Send feedback or an idea" />
    </main>
  );
}

/** "When you're sure, you're right X%": from the Check · Sure / Check · Guessing taps in practice. */
function CalibrationCard({ calibration = {} }) {
  const { sureRight = 0, sureWrong = 0, guessRight = 0, guessWrong = 0 } = calibration;
  const sure = sureRight + sureWrong;
  const guess = guessRight + guessWrong;
  if (sure + guess < 5) return null;
  const pct = (a, n) => (n ? Math.round((100 * a) / n) : null);
  const sureP = pct(sureRight, sure);
  const guessP = pct(guessRight, guess);
  const tip = sureP == null ? null
    : sureP >= 90 ? 'Your "sure" is trustworthy. Keep going!'
    : sureP >= 75 ? 'Mostly right when sure. The misses you were sure about are the gold: reread their whys.'
    : 'You often feel sure but miss. Slow down on those topics and read the explanations closely.';
  return (
    <section className="card stack-s" aria-labelledby="cal-title">
      <strong id="cal-title" className="ic-label"><span className="ic-gold"><Icon name="target" /></span>How well you know what you know</strong>
      <div className="spread small"><span>When you were <strong>sure</strong></span><strong>{sureP == null ? '–' : `${sureP}% right`} <span className="muted">({sure})</span></strong></div>
      <div className="spread small"><span>When you were <strong>guessing</strong></span><strong>{guessP == null ? '–' : `${guessP}% right`} <span className="muted">({guess})</span></strong></div>
      {tip && <p className="small muted">{tip}</p>}
    </section>
  );
}
