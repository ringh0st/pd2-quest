// Re-renders when admin edits change what content says (lib/contentEdits.js).
import { useSyncExternalStore } from 'react';
import { contentVersion, subscribeContent } from '../lib/contentEdits.js';

export function useContentVersion() {
  return useSyncExternalStore(subscribeContent, contentVersion, contentVersion);
}
