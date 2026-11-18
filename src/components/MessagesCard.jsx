// Me screen: your messages in one card with two tabs, so the page stays short.
// Replies: answers to your reports and to Contact us (with the same counter as the Me tab), plus Contact us.
// Parked thoughts: the distracting thoughts you parked while studying.
import { useRef, useState, useSyncExternalStore } from 'react';
import { useStore, unparkThought } from '../state/store.js';
import { unreadReplies, subscribeReplies } from '../lib/feedbackReplies.js';
import { RepliesList } from './RepliesList.jsx';
import { FeedbackButton } from './FeedbackButton.jsx';
import { Icon } from './icons/Icon.jsx';
import { sfx } from '../audio/sfx.js';

export function MessagesCard() {
  const parked = useStore((s) => s.parked);
  const unread = useSyncExternalStore(subscribeReplies, unreadReplies, unreadReplies);
  const [tab, setTab] = useState(() => (unread > 0 || !parked.length ? 'replies' : 'parked'));
  const tabs = [
    { id: 'replies', label: 'Replies', icon: 'chat', count: unread, countLabel: 'new' },
    { id: 'parked', label: 'Parked thoughts', icon: 'park', count: parked.length, countLabel: 'parked', quiet: true },
  ];
  const refs = useRef([]);
  const onKey = (e, k) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (k + d + tabs.length) % tabs.length;
    setTab(tabs[next].id); refs.current[next]?.focus();
  };

  return (
    <section className="card stack-s messages-card" aria-label="Messages">
      <div className="msg-tabs" role="tablist" aria-label="Messages">
        {tabs.map((t, k) => (
          <button
            key={t.id} ref={(el) => { refs.current[k] = el; }} type="button" role="tab" id={`msg-tab-${t.id}`}
            aria-selected={tab === t.id} aria-controls={`msg-panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
            className={`msg-tab${tab === t.id ? ' on' : ''}`}
            onClick={() => { sfx.select(); setTab(t.id); }} onKeyDown={(e) => onKey(e, k)}
          >
            <Icon name={t.icon} /> {t.label}
            {t.count > 0 && <span className={t.quiet ? 'msg-count' : 'nav-badge msg-badge'}><span aria-hidden="true">{t.count > 9 ? '9+' : t.count}</span><span className="sr-only">, {t.count} {t.countLabel}</span></span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="msg-panel-replies" aria-labelledby="msg-tab-replies" hidden={tab !== 'replies'} className="stack-s">
        {tab === 'replies' && <RepliesList />}
        <FeedbackButton kind="app" where={{ route: '/me' }} variant="row" label="Contact us" />
      </div>

      <div role="tabpanel" id="msg-panel-parked" aria-labelledby="msg-tab-parked" hidden={tab !== 'parked'}>
        {parked.length === 0
          ? <p className="small muted">Nothing parked. When a distracting thought pops up mid-study, tap the Park button to drop it here.</p>
          : (
            <ul className="list-plain">
              {parked.map((p) => (
                <li key={p.id} className="spread">
                  <span className="grow">{p.text}</span>
                  <button className="btn small" onClick={() => { sfx.done(); unparkThought(p.id); }} aria-label={`Done: ${p.text}`}><Icon name="check" /> Done</button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </section>
  );
}
