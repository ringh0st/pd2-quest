// Settings section for the opt-in study reminder: calendar event (reliable) + optional phone notification.
import { useId, useState } from 'react';
import { Switch, Segmented } from './Controls.jsx';
import { useFeedback } from './Feedback.jsx';
import {
  canOfferNotifications, downloadReminderIcs, notificationPermission, readReminder, requestNotificationPermission, saveReminder,
} from '../lib/reminders.js';

export function ReminderSettings() {
  const { showToast } = useFeedback();
  const [reminder, setReminder] = useState(readReminder);
  const [permission, setPermission] = useState(notificationPermission);
  const timeId = useId();
  const offerNotify = canOfferNotifications();
  const update = (patch) => setReminder(saveReminder(patch));

  const addToCalendar = () => {
    downloadReminderIcs(reminder);
    showToast('📅 Calendar file ready');
  };

  const toggleNotify = async (on) => {
    if (!on) { update({ notify: false }); return; }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      update({ notify: true });
      showToast('🔔 Nudge set');
    } else {
      showToast('No problem. The calendar option still works.');
    }
  };

  return (
    <section className="card stack">
      <h2>⏰ Study reminder</h2>
      <p className="small muted">Optional, and off unless you turn it on. A gentle nudge for a few minutes of practice, never a nag about streaks.</p>
      <div className="field">
        <label htmlFor={timeId}>Nudge me at</label>
        <input
          id={timeId} className="input" type="time" step="60" value={reminder.time}
          onChange={(e) => e.target.value && update({ time: e.target.value })}
        />
      </div>
      <Segmented label="On which days?" value={reminder.days} onChange={(v) => update({ days: v })} options={[['daily', 'Every day'], ['weekdays', 'Weekdays']]} />
      <button type="button" className="btn primary" onClick={addToCalendar}>📅 Add to my calendar</button>
      <p className="small muted">Adds a repeating 5-minute event with an alert to your calendar app. This is the most reliable option: it rings even when PD2 Quest is closed. Change or delete it any time in your calendar.</p>
      {offerNotify && (
        <Switch
          label="Also notify me on this phone"
          hint={permission === 'denied'
            ? 'Notifications are blocked for PD2 Quest. You can allow them in your phone’s settings.'
            : 'Only works while PD2 Quest is open or still running in the background. Phones may close it, so keep the calendar reminder too.'}
          checked={reminder.notify && permission === 'granted'}
          disabled={permission === 'denied'}
          onChange={toggleNotify}
        />
      )}
    </section>
  );
}
