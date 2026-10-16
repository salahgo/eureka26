import { encodeSequenceParam } from './codec';
import { isDefaultSequence } from './config';

/** Site base path ("/eureka26/"), always with a trailing slash. */
export const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');

/** Canonical public URL of the questionnaire, fixed at build time (never localhost in production). */
export const PUBLIC_URL: string = (() => {
  const site = (import.meta.env.SITE ?? 'https://salahgo.github.io').replace(/\/$/, '');
  return `${site}${BASE}`;
})();

export const route = (path: '' | 'qr' | 'results' | 'sources' | 'admin') => (path ? `${BASE}${path}/` : BASE);

/** Invitation URL encoded in the big QR code: carries the presenter's question subset when it differs from the default. */
export function invitationUrl(sequence: string[], override?: string | null, phoneFeedback = true): string {
  const base = override || PUBLIC_URL;
  const custom = sequence.length > 0 && !isDefaultSequence(sequence);
  if (!custom && phoneFeedback) return base;
  const url = new URL(base);
  if (custom) url.searchParams.set('s', encodeSequenceParam(sequence));
  if (!phoneFeedback) url.searchParams.set('f', '0');
  return url.toString();
}

export function isLocalhost(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local');
  } catch {
    return false;
  }
}
