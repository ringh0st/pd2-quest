// Study screens ask for the soft background music while they are open (it plays only if Sound
// effects and Music are both on). Mock exams don't use it, like the real test.
import { useEffect } from 'react';
import { wantMusic } from '../audio/music.js';

export function useStudyMusic(on = true) {
  useEffect(() => (on ? wantMusic() : undefined), [on]);
}
