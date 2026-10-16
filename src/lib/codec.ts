/**
 * Compact, anonymous response codes.
 *
 *   E26-1C-7K3QX9AB-T0F3K2M1P0QW3RA-9F
 *   │   ││ │        │ │             └─ checksum (2 × base36)
 *   │   ││ │        │ └─ answers packed in base 36 (one base-5 digit per question: 0 = no answer, 1–4 = A–D)
 *   │   ││ │        └─ number of question slots (2 × base36)
 *   │   ││ └─ random anonymous submission id (8 × Crockford base32)
 *   │   │└─ C = questionnaire complete, P = partial
 *   │   └─ format version
 *   └─ magic
 *
 * Only uppercase letters, digits and "-" are used so QR codes are generated in the compact
 * alphanumeric mode. The code contains no personal data and no timestamp.
 */
import { MAX_INDEX, QUESTION_BY_INDEX } from '../data/questions';
import type { ChoiceIndex } from '../data/types';

export const CODE_VERSION = '1';
const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32
export const CODE_REGEX = /E26-[0-9A-Z]{2}-[0-9A-Z]{8}-[0-9A-Z]{3,}-[0-9A-Z]{2}/g;

export type AnswerMap = Record<string, ChoiceIndex>;

export interface DecodedResponse {
  code: string;
  id: string;
  complete: boolean;
  /** Answers keyed by question id (e.g. "Q07"). */
  answers: AnswerMap;
  /** Number of question slots declared by the code. */
  slots: number;
}

export class CodeError extends Error {
  constructor(
    message: string,
    public readonly reason: 'format' | 'checksum' | 'version' | 'payload',
  ) {
    super(message);
  }
}

export function randomId(length = 8): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ID_ALPHABET[b % 32];
  return out;
}

/** 2-character base36 checksum (FNV-1a 32-bit, reduced mod 36²). */
export function checksum(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h % 1296).toString(36).toUpperCase().padStart(2, '0');
}

function packedLength(slots: number): number {
  // Smallest L such that 36^L >= 5^slots.
  let L = 1;
  let cap = 36n;
  const target = 5n ** BigInt(slots);
  while (cap < target) {
    cap *= 36n;
    L++;
  }
  return L;
}

export function packDigits(digits: number[]): string {
  let value = 0n;
  for (let i = digits.length - 1; i >= 0; i--) {
    const d = digits[i];
    if (!Number.isInteger(d) || d < 0 || d > 4) throw new CodeError(`Chiffre invalide : ${d}`, 'payload');
    value = value * 5n + BigInt(d);
  }
  return value.toString(36).toUpperCase().padStart(packedLength(digits.length), '0');
}

export function unpackDigits(packed: string, slots: number): number[] {
  let value = 0n;
  for (const ch of packed.toLowerCase()) {
    const v = parseInt(ch, 36);
    if (Number.isNaN(v)) throw new CodeError('Caractère invalide', 'payload');
    value = value * 36n + BigInt(v);
  }
  if (value >= 5n ** BigInt(slots)) throw new CodeError('Réponses hors limites', 'payload');
  const digits: number[] = [];
  for (let i = 0; i < slots; i++) {
    digits.push(Number(value % 5n));
    value /= 5n;
  }
  return digits;
}

export function encodeResponse(input: { id: string; answers: AnswerMap; complete: boolean }): string {
  if (!/^[0-9A-Z]{8}$/.test(input.id)) throw new CodeError('Identifiant invalide', 'format');
  const slots = MAX_INDEX;
  const digits = new Array<number>(slots).fill(0);
  for (const [qid, choice] of Object.entries(input.answers)) {
    const idx = Number(qid.replace(/^Q/, ''));
    if (!QUESTION_BY_INDEX[idx]) throw new CodeError(`Question inconnue : ${qid}`, 'payload');
    digits[idx - 1] = choice + 1;
  }
  const body = `E26-${CODE_VERSION}${input.complete ? 'C' : 'P'}-${input.id}-${slots
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')}${packDigits(digits)}`;
  return `${body}-${checksum(body)}`;
}

export function decodeResponse(raw: string): DecodedResponse {
  const code = raw.trim().toUpperCase();
  const m = /^E26-([0-9A-Z])([CP])-([0-9A-Z]{8})-([0-9A-Z]{2})([0-9A-Z]+)-([0-9A-Z]{2})$/.exec(code);
  if (!m) throw new CodeError('Format de code non reconnu', 'format');
  const [, version, flag, id, slotsRaw, packed, ck] = m;
  if (version !== CODE_VERSION) throw new CodeError(`Version de code non prise en charge (${version})`, 'version');
  const body = code.slice(0, code.lastIndexOf('-'));
  if (checksum(body) !== ck) throw new CodeError('Somme de contrôle invalide (code altéré ou mal recopié)', 'checksum');
  const slots = parseInt(slotsRaw, 36);
  if (!Number.isInteger(slots) || slots < 1 || slots > 400) throw new CodeError('Nombre de questions invalide', 'payload');
  if (packed.length !== packedLength(slots)) throw new CodeError('Longueur des réponses incohérente', 'payload');
  const digits = unpackDigits(packed, slots);
  const answers: AnswerMap = {};
  digits.forEach((d, i) => {
    if (d === 0) return;
    const q = QUESTION_BY_INDEX[i + 1];
    if (!q) return; // question slot unknown to this build: ignored
    answers[q.id] = (d - 1) as ChoiceIndex;
  });
  if (Object.keys(answers).length === 0) throw new CodeError('Aucune réponse dans ce code', 'payload');
  return { code, id, complete: flag === 'C', answers, slots };
}

/** Extracts every response code found in arbitrary text (QR batch, pasted list, JSON…). */
export function extractCodes(text: string): string[] {
  const found = text.toUpperCase().match(CODE_REGEX);
  return found ? Array.from(new Set(found)) : [];
}

/** Batch payload used to move many codes from one device to another via a sequence of QR codes. */
export function encodeBatch(codes: string[], page: number, total: number): string {
  return `E26LOT-${page}-${total} ${codes.join(' ')}`;
}

export function parseBatchHeader(text: string): { page: number; total: number } | null {
  const m = /E26LOT-(\d+)-(\d+)/.exec(text.toUpperCase());
  return m ? { page: Number(m[1]), total: Number(m[2]) } : null;
}

/** Ordered question subset carried in the invitation URL (?s=…): one base36 char per question index. */
export function encodeSequenceParam(ids: string[]): string {
  return ids
    .map((id) => {
      const n = Number(id.replace(/^Q/, ''));
      if (!Number.isInteger(n) || n < 1 || n > 35) throw new Error(`Index hors plage pour l'URL : ${id}`);
      return n.toString(36).toUpperCase();
    })
    .join('');
}

export function decodeSequenceParam(param: string | null | undefined): string[] | null {
  if (!param) return null;
  const ids: string[] = [];
  for (const ch of param.trim()) {
    const n = parseInt(ch, 36);
    const q = QUESTION_BY_INDEX[n];
    if (!q) return null;
    if (!ids.includes(q.id)) ids.push(q.id);
  }
  return ids.length ? ids : null;
}
