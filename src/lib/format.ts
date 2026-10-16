/** French formatting helpers. */

const NNBSP = ' ';

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function formatPct(ratio: number | null | undefined, decimals = 0): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return '—';
  return `${formatNumber(ratio * 100, decimals)}${NNBSP}%`;
}

/**
 * French typography: typographic apostrophe, narrow no-break space before ? ! ; : % and inside « »,
 * thin grouping of thousands written with a plain space ("35 000" never breaks across lines).
 */
export function fr(text: string): string {
  return text
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿŒœ])'(?=[A-Za-zÀ-ÖØ-öø-ÿŒœ])/g, '$1’')
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${NNBSP}$2`)
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${NNBSP}$2`)
    .replace(/ ([?!;:%»])/g, `${NNBSP}$1`)
    .replace(/« /g, `«${NNBSP}`);
}

export function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n)}${NNBSP}${n > 1 ? many : one}`;
}

export function formatTime(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(ts);
}
