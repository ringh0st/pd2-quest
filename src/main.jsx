import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/700.css';
import '@fontsource/jetbrains-mono/400.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { initInstallCapture } from './lib/install.js';
import { startReminderLoop } from './lib/reminders.js';
import { unlockAudioOnFirstGesture } from './audio/audioContext.js';

// Ask the browser to keep our saved progress (Safari may clear site data that isn't installed).
navigator.storage?.persist?.().catch(() => {});
// Focus rings for keyboard users only: a tap hides them (autofocused buttons looked "selected" on phones),
// any Tab/arrow key brings them back.
const root = document.documentElement;
root.dataset.input = window.matchMedia?.('(hover: none)').matches ? 'touch' : 'mouse';
window.addEventListener('pointerdown', (e) => { root.dataset.input = e.pointerType === 'mouse' ? 'mouse' : 'touch'; }, true);
window.addEventListener('keydown', (e) => { if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) root.dataset.input = 'key'; }, true);

unlockAudioOnFirstGesture(); // iPhone needs a tap before any sound
initInstallCapture(); // catch the browser's install prompt early
startReminderLoop(); // only does anything if the learner turned phone reminders on

createRoot(document.getElementById('root')).render(
  <StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>,
);
