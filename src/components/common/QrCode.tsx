import { useMemo } from 'react';
import { encode } from 'uqr';

interface Props {
  value: string;
  /** Rendered size (CSS length). The SVG scales crisply at any size. */
  size?: string | number;
  ecc?: 'L' | 'M' | 'Q' | 'H';
  /** Quiet zone in modules (4 is the standard minimum). */
  quiet?: number;
  dark?: string;
  light?: string;
  label: string;
  className?: string;
  testId?: string;
}

/** Builds one SVG path from the QR matrix, merging horizontal runs of dark modules. */
export function qrPath(data: boolean[][], offset: number): string {
  let d = '';
  for (let y = 0; y < data.length; y++) {
    const row = data[y];
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run]) run++;
      d += `M${x + offset} ${y + offset}h${run}v1h-${run}z`;
      x += run;
    }
  }
  return d;
}

export default function QrCode({ value, size = 256, ecc = 'M', quiet = 4, dark = '#050b18', light = '#ffffff', label, className, testId }: Props) {
  const qr = useMemo(() => encode(value, { ecc, border: 0 }), [value, ecc]);
  const total = qr.size + quiet * 2;
  const path = useMemo(() => qrPath(qr.data, quiet), [qr, quiet]);
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      data-testid={testId}
      data-qr-version={qr.version}
      data-qr-value={value}
    >
      <rect width={total} height={total} fill={light} />
      <path d={path} fill={dark} />
    </svg>
  );
}
