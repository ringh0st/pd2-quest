// The signed-in account (or null), whether the check has finished, and whether this account may read feedback.
import { useSyncExternalStore } from 'react';
import { authSnapshot, subscribeAuth } from '../lib/auth.js';

export function useAuth() {
  return useSyncExternalStore(subscribeAuth, authSnapshot, authSnapshot);
}
