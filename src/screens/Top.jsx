// Weekly and Monthly Top lists: everyone who chose to join (under a nickname), ranked by XP earned in the period. The top 3 win coins when it ends. Medals carry their place as a number, never only a color.
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../components/icons/Icon.jsx';
import { Segmented } from '../components/Controls.jsx';
import { fetchTop, fetchMyStatus, joinTop, leaveTop, isOnTop, claimPrizes, periodEnds, sendPoints, guestsCantJoin, rememberMyPlace, timeLeft, TOP_PRIZES, MAX_POINTS_PER_DAY } from '../lib/topList.js';
import { sfx } from '../audio/sfx.js';
import { TopPlace } from '../components/game/TopPlace.jsx';

const KINDS = [['week', 'This week'], ['month', 'This month']];

export function Top() {
  const [joined, setJoined] = useState(isOnTop);
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);
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
      if (kind === 'week') rememberMyPlace(list.find((r) => r.me));
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
  const nickOk = nick.trim().length >= 2 && nick.trim().length <= 24;

  const join = async (e) => {
    e.preventDefault();
    if (!nickOk || busy) return;
    setBusy(true);
    try { await joinTop(nick); setJoined(true); sfx.tap(); await load(); }
    catch (err) { setFailed(/anonymous/i.test(String(err?.message)) ? 'guests' : 'offline'); }
    setBusy(false);
  };
  const leave = async () => {
    setBusy(true);
    try { await leaveTop(); setJoined(false); setMe(null); sfx.tap(); await load(); } catch { setFailed('offline'); }
    setBusy(false);
  };

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
            <span key={k} className="top-prize"><TopPlace n={k + 1} /><span className="top-prize-coins"><Icon name="coin" /> {coins}</span></span>
          ))}
        </div>
        <p className="small muted center">Top 3 win coins when the {kind} ends · <Icon name="timer" /> {timeLeft(ends)} left</p>
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
                  <TopPlace n={r.place} />
                  <span className="grow top-name">{r.name}{r.me && <span className="top-you"> (you)</span>}</span>
                  <span className="top-points"><strong>{r.points}</strong> <span className="small muted">XP</span></span>
                  {r.prize > 0 && <span className="top-row-prize" title={`${r.prize} coins if this holds`}><Icon name="coin" /> {r.prize}<span className="sr-only"> coins</span></span>}
                </li>
              ))}
            </ol>
          )}

          {joined ? (
            <section className="card stack-s" aria-label="You on the list">
              <p className="small">
                {mine ? <>You’re <strong>#{mine.place}</strong> this {kind} with <strong>{mine.points} XP</strong>.</>
                  : myPoints > 0 ? <>You have <strong>{myPoints} XP</strong> this {kind}.</>
                    : <>Earn XP in any lesson or practice round to climb the list.</>}
              </p>
              <p className="small muted">Shown as <strong>{me?.name || '…'}</strong>.</p>
              <button type="button" className="btn" onClick={leave} disabled={busy}>Leave the Top list</button>
              <p className="small muted">Leaving hides you right away. To delete your scores too, use Me → Delete my data.</p>
            </section>
          ) : (
            <form className="card stack-s" aria-labelledby="top-join-title" onSubmit={join}>
              <strong id="top-join-title">Join the Top list</strong>
              <p className="small muted">Pick a nickname. Everyone can see it with your XP, so <strong>don’t use your real name</strong>. Only XP you earn after joining counts, and you can leave at any time.</p>
              <label className="field">
                <span className="label">Nickname</span>
                <input className="input" type="text" value={nick} onChange={(e) => setNick(e.target.value)} minLength={2} maxLength={24} autoComplete="off" spellCheck={false} placeholder="e.g. Apex Otter" />
              </label>
              <button type="submit" className="btn primary" disabled={!nickOk || busy}><Icon name="trophy" /> Join</button>
            </form>
          )}
        </>
      )}

      <p className="small muted">Points are the XP you earn, up to {MAX_POINTS_PER_DAY} a day. Weeks start on Monday and months on the 1st (UTC).</p>
    </main>
  );
}
