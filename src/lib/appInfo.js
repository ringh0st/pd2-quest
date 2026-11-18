/** Who makes the app and which version this is (shown on the splash screen and in Settings). */
import { track } from './track.js';
import site from '../../site.json';

/** The app as a whole (opening screen, Home Screen icon); each exam inside it is a Quest. */
export const BRAND_NAME = site.name; // one place to rename: site.json
export const BRAND_WORDMARK = site.wordmark; // the name in two parts: the second is drawn in gold
export const BRAND_TAGLINE = 'Salesforce certification prep';
export const APP_NAME = track.name;
export const APP_TAGLINE = track.exam;
export const STUDIO_NAME = site.studio;
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev';
export const COPYRIGHT_YEAR = 2026;
