// Public web addresses of the app and its study pages, from site.json (one place to change the domain).
import site from '../../site.json';
import { track } from './track.js';

export const SITE_URL = site.url.endsWith('/') ? site.url : `${site.url}/`;
export const SHARE_TEXT = site.shareText;

/** The study guide for the exam being studied, or all guides when that exam has no guide page. */
export function guidesUrl() {
  const slug = site.exams[track.id]?.slug;
  return `${SITE_URL}guides/${slug ? `${slug}/` : ''}`;
}

export const INFO_LINKS = [
  { id: 'about', label: 'About', href: `${SITE_URL}about/` },
  { id: 'privacy', label: 'Privacy', href: `${SITE_URL}privacy/` },
  { id: 'terms', label: 'Terms', href: `${SITE_URL}terms/` },
];
