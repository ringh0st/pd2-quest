/** Who makes the app and which version this is (shown on the splash screen and in Settings). */
import { track } from './track.js';

/** The app as a whole (opening screen, Home Screen icon); each exam inside it is a Quest. */
export const BRAND_NAME = 'Dev Quest';
export const BRAND_TAGLINE = 'Salesforce certification prep';
export const APP_NAME = track.name;
export const APP_TAGLINE = track.exam;
export const STUDIO_NAME = 'Ringhost’s Games';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev';
export const COPYRIGHT_YEAR = 2026;
