// A settings button for lessons, practice, flashcards and mock exams: opens a sheet with what you might want to
// change mid-level (sound, music, voice, text size, look) without leaving, so your place is kept.
// The full list is still in Settings; this sheet links there.
import { useCallback, useState } from 'react';
import { Sheet } from '../Sheet.jsx';
import { Icon } from '../icons/Icon.jsx';
import { LookSettings, ReadingSettings, SoundSettings } from './SettingsGroups.jsx';

export function QuickSettings() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Settings" title="Settings" aria-haspopup="dialog">
        <Icon name="settings" />
      </button>
      <Sheet open={open} onClose={close} labelledBy="quick-settings-title">
        <div className="stack quick-settings">
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <h2 id="quick-settings-title" className="pq-head grow"><span className="pq-tile" data-tone="muted"><Icon name="settings" /></span><span>Settings</span></h2>
            <button className="icon-btn" onClick={close} aria-label="Close settings"><Icon name="close" /></button>
          </div>
          <p className="small muted">Changes apply right away. Your place is kept.</p>
          <SoundSettings />
          <ReadingSettings />
          <LookSettings confetti={false} />
          <button className="btn primary block" onClick={close}>Back to it</button>
        </div>
      </Sheet>
    </>
  );
}
