// Weekly and Monthly Top lists: everyone who earned XP (guests by the name they chose, Google users too), ranked by
// XP earned in the period. The top 3 win coins when it ends. Medals carry their place as a number, never only a color.
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state/store.js';
import { Icon } from '../components/icons/Icon.jsx';
import { Segmented, Switch } from '../components/Controls.jsx';
import { fetchTop, fetchMyStatus, setShownOnTop, claimPrizes, periodEnds, sendPoints, guestsCantJoin, TOP_PRIZES, MAX_POINTS_PER_DAY } from '../lib/topList.js';
import { sfx } from '../audio/sfx.js';

const KINDS = [['week', 'This week'], ['month', 'This month']];
const MEDAL = ['gold', 'silver', 'bronze'];

function endsIn(date) {
  const ms = date - Date.now();
  const days = Math.floor(ms / 86400000);
  const hours = Math.max(1, Math.floor((ms % 86400000) / 3600000));
  return days >= 1 ? `${days} day${days === 1 ? '' : 's'} ${hours} h` : `${hours} hour${hours === 1 ? '' : 's'}`;
}

function Place({ n }) {
  return n <= 3
    ? <span className={`top-medal ${MEDAL[n - 1]}`}><Icon name="medal" /><span className="top-medal-n">{n}</span><span className="sr-only">Place {n}</span></span>
    : <span className="top-place"><span className="sr-only">Place </span>{n}</span>;
}

export function Top() {
  const name = useStore((s) => s.name);
  const [kind, setKind] = useState('week');
  const [rows, setRows] = useState(null);
  const [me, setMe] = useState(undefined);
  const [failed, setFailed] = useState('');
  const ends = periodEnds()[kind];

  const load = useCallback(async () => {
    setFailed('');
    try {
      await sendPoints();
      const [list, status] = await Promise.all([fetchTop(kind), fetchMyStatus()]);
      setRows(list); setMe(status);
      if (guestsCantJoin() && !status) setFailed('guests');
    } catch (e) {
      setRows([]); setMe(null);
      setFailed(/anonymous/i.test(String(e?.message)) ? 'guests' : 'offline');
    }
  }, [kind]);

  useEffect(() => { setRows(null); load(); }, [load]);
  useEffect(() => { claimPrizes(); }, []);

  const mine = rows?.find((r) => r.me);
  const myPoints = me ? (kind === 'week' ? me.week_points : me.month_points) : 0;
  const shown = me ? !me.hidden : true;

  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.hash = '#/'))} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s" data-tone="gold"><Icon name="trophy" /></span><span>Top players</span></h1>
      </div>

      <Segmented label="Show" options={KINDS} value={kind} onChange={setKind} />

      <section className="card stack-s top-prizes" aria-label="Prizes">
        <div className="top-prize-row">
          {TOP_PRIZES.map((coins, k) => (
            <span key={k} className="top-prize"><Place n={k + 1} /><span className="top-prize-coins"><Icon name="coin" /> {coins}</span></span>
          ))}
        </div>
        <p className="small muted center">Top 3 win coins when the {kind} ends · <Icon name="timer" /> {endsIn(ends)} left</p>
      </section>

      {rows === null && <div className="stack" aria-busy="true" aria-label="Loading the list">{[0, 1, 2, 3].map((k) => <div key={k} className="card top-skeleton" />)}</div>}

      {failed === 'guests' && <p className="card small"><Icon name="info" /> Guests can’t join the list yet. Sign in with Google on the Me screen to take part.</p>}
      {failed === 'offline' && <p className="card small"><Icon name="warn" /> Couldn’t load the list. Check the connection and try again.</p>}

      {rows && failed !== 'offline' && (
        <>
          {!rows.length && <p className="card small muted center"><Icon name="sparkles" className="ic-gold" /> Nobody has points yet this {kind}. Finish a lesson or a practice round and you’re #1!</p>}
          {rows.length > 0 && (
            <ol className="list-plain top-list">
              {rows.map((r) => (
                <li key={`${r.place}-${r.name}`} className={`top-row${r.me ? ' me' : ''}${r.place <= 3 ? ' podium' : ''}`}>
                  <Place n={r.place} />
                  <span className="grow top-name">{r.name}{r.me && <span className="top-you"> (you)</span>}</span>
                  <span className="top-points"><strong>{r.points}</strong> <span className="small muted">XP</span></span>
                  {r.prize > 0 && <span className="top-row-prize" title={`${r.prize} coins if this holds`}><Icon name="coin" /> {r.prize}<span className="sr-only"> coins</span></span>}
                </li>
              ))}
            </ol>
          )}

          <section className="card stack-s" aria-label="You on the list">
            <p className="small">
              {mine ? <>You’re <strong>#{mine.place}</strong> this {kind} with <strong>{mine.points} XP</strong>.</>
                : myPoints > 0 && !shown ? <>You have <strong>{myPoints} XP</strong> this {kind} (hidden from the list).</>
                  : <>Earn XP in any lesson or practice round to join the list.</>}
            </p>
            <p className="small muted">Shown as <strong>{me?.name || name || 'Learner'}</strong>. Change your name in Settings.</p>
            <Switch
              label="Show me on the Top list" hint="Hidden players keep their XP but don’t appear or win prizes."
              checked={shown}
              onChange={async (on) => { try { await setShownOnTop(on); sfx.tap(); load(); } catch { setFailed('offline'); } }}
            />
          </section>
        </>
      )}

      <p className="small muted">Points are the XP you earn, up to {MAX_POINTS_PER_DAY} a day. Weeks start on Monday and months on the 1st (UTC).</p>
    </main>
  );
}
