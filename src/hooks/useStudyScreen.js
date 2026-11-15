// A study screen (lesson, practice, Hard/Boss, Bolt, flashcards, placement) while it is open:
// asks for the soft background music and counts active study time for break reminders.
// Mock exams don't use it (silent, like the real test).
import { useEffect } from 'react';
import { wantMusic } from '../audio/music.js';
import { studyScreenOpen } from '../lib/studyClock.js';

export function useStudyScreen(on = true) {
  useEffect(() => {
    if (!on) return undefined;
    const releaseMusic = wantMusic();
    const releaseClock = studyScreenOpen();
    return () => { releaseMusic(); releaseClock(); };
  }, [on]);
}
