// "Report a problem" for one exact thing: a lesson card, a word meaning, a question, an explanation, a flashcard or
// the app itself. The report carries the thing's location (lib/feedbackLocation.js) so the owner can open the very
// same spot, and is saved on the device until it reaches the feedback table (lib/feedbackSend.js).
import { useCallback, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { Icon } from './icons/Icon.jsx';
import { Segmented } from './Controls.jsx';
import { useFeedback } from './Feedback.jsx';
import { locationOf } from '../lib/feedbackLocation.js';
import { sendFeedback } from '../lib/feedbackSend.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const CATEGORIES = [
  ['wrong', 'Wrong'], ['confusing', 'Confusing'], ['typo', 'Typo'], ['bug', 'Bug'], ['idea', 'Idea'], ['other', 'Other'],
];
// Not about one card or question ("Contact us", or anywhere outside a specific spot): a general message
const GENERAL_CATEGORIES = [['question', 'Question'], ['problem', 'Problem'], ['idea', 'Idea'], ['other', 'Other']];
const PROMPTS = {
  question: 'What would you like to know?',
  problem: 'What happened, and what did you expect?',
  wrong: 'What’s wrong, and what should it say? A doc link helps.',
  confusing: 'Which part didn’t make sense?',
  typo: 'What’s the typo? (optional)',
  bug: 'What happened, and what did you expect?',
  idea: 'What would make this better?',
  other: 'Tell us anything.',
};

/**
 * `kind` and `where` describe the thing (see locationOf). `label` names the button for screen readers.
 * `variant="row"` shows a full-width row with text instead of the small icon button.
 */
export function FeedbackButton({ kind, where = {}, label = 'Report a problem with this', variant = 'icon' }) {
  const [open, setOpen] = useState(false);
  const general = kind === 'app';
  const [category, setCategory] = useState(general ? 'question' : 'wrong');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useFeedback();
  const close = useCallback(() => setOpen(false), []);
  const location = open ? locationOf(kind, where) : null;

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendFeedback({ location, category, message, contact });
    setSending(false);
    setOpen(false);
    setMessage('');
    sfx.park(); haptic('success');
    showToast(result === 'sent'
      ? <><Icon name="ok" /> Thanks! Your note was sent.</>
      : <><Icon name="ok" /> Thanks! Saved, it’ll send when you’re online.</>);
  };

  return (
    <>
      {variant === 'row' ? (
        <button type="button" className="btn block" onClick={() => setOpen(true)} aria-haspopup="dialog"><Icon name={general ? 'chat' : 'report'} /> {label}</button>
      ) : (
        <button type="button" className="icon-btn feedback-btn" onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label={label} title={label} aria-haspopup="dialog">
          <Icon name="report" />
        </button>
      )}
      <Sheet open={open} onClose={close} labelledBy="feedback-title">
        {location && (
          <form className="stack" onSubmit={submit}>
            <div className="row" style={{ alignItems: 'center', gap: 10 }}>
              <h2 id="feedback-title" className="pq-head grow"><span className="pq-tile" data-tone={general ? 'teal' : 'flame'}><Icon name={general ? 'chat' : 'report'} /></span><span>{general ? 'Contact us' : 'Tell us what’s off'}</span></h2>
              <button type="button" className="icon-btn" onClick={close} aria-label="Close"><Icon name="close" /></button>
            </div>
            {general
              ? <p className="small muted">Questions, problems, ideas: anything. We read every message, and our answer shows up on your Me screen under Replies.</p>
              : <p className="small muted feedback-where"><Icon name="target" /> {location.label}</p>}
            <Segmented label={general ? 'What is it about?' : 'What kind of problem?'} value={category} onChange={setCategory} options={general ? GENERAL_CATEGORIES : CATEGORIES} />
            <div className="field">
              <label htmlFor="feedback-message">{general ? 'Your message' : 'Your note'}</label>
              <textarea id="feedback-message" className="input" rows={4} maxLength={2000} data-autofocus value={message}
                onChange={(e) => setMessage(e.target.value)} placeholder={PROMPTS[category]} />
            </div>
            <div className="field">
              <label htmlFor="feedback-contact">{general ? 'Email, if you’d also like the answer by email (optional)' : 'Email, if you’d like a reply (optional)'}</label>
              <input id="feedback-contact" className="input" type="email" autoComplete="email" maxLength={200} value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <p className="small muted">{general ? 'Sent with your device type and app version. No name, no account.' : 'Sent with the spot you’re on and your device type. No name, no account.'}</p>
            <button className="btn primary block" type="submit" disabled={sending || (!message.trim() && category !== 'typo')}>
              {sending ? 'Sending…' : <><Icon name={general ? 'chat' : 'report'} /> Send</>}
            </button>
          </form>
        )}
      </Sheet>
    </>
  );
}
