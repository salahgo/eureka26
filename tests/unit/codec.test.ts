import { describe, expect, it } from 'vitest';
import {
  checksum,
  CodeError,
  decodeResponse,
  decodeSequenceParam,
  encodeBatch,
  encodeResponse,
  encodeSequenceParam,
  extractCodes,
  packDigits,
  parseBatchHeader,
  randomId,
  unpackDigits,
} from '../../src/lib/codec';
import { DEFAULT_SEQUENCE, FULL_SEQUENCE, QUESTIONS } from '../../src/data/questions';
import type { ChoiceIndex } from '../../src/data/types';

const QR_ALNUM = /^[0-9A-Z $%*+\-./:]+$/;

function allAnswers(seed = 1) {
  const answers: Record<string, ChoiceIndex> = {};
  QUESTIONS.forEach((q, i) => (answers[q.id] = ((i * seed) % 4) as ChoiceIndex));
  return answers;
}

describe('response codes', () => {
  it('round-trips a complete response', () => {
    const answers = allAnswers(3);
    const code = encodeResponse({ id: 'K7F3QX9A', answers, complete: true });
    const d = decodeResponse(code);
    expect(d.id).toBe('K7F3QX9A');
    expect(d.complete).toBe(true);
    expect(d.answers).toEqual(answers);
  });

  it('round-trips a partial response and keeps unanswered questions absent', () => {
    const code = encodeResponse({ id: '00000000', answers: { Q01: 2, Q10: 1 }, complete: false });
    const d = decodeResponse(code);
    expect(d.complete).toBe(false);
    expect(d.answers).toEqual({ Q01: 2, Q10: 1 });
  });

  it('is short and uses only the QR alphanumeric charset', () => {
    const code = encodeResponse({ id: randomId(), answers: allAnswers(5), complete: true });
    expect(code).toMatch(QR_ALNUM);
    expect(code.length).toBeLessThanOrEqual(30);
  });

  it('accepts lowercase and surrounding whitespace', () => {
    const code = encodeResponse({ id: 'ABCDEFGH', answers: { Q05: 3 }, complete: true });
    expect(decodeResponse(`  ${code.toLowerCase()}\n`).answers).toEqual({ Q05: 3 });
  });

  it('detects tampering through the checksum', () => {
    const code = encodeResponse({ id: 'ABCDEFGH', answers: allAnswers(1), complete: true });
    const parts = code.split('-');
    const payload = parts[3];
    const swapped = payload.slice(0, -1) + (payload.at(-1) === '0' ? '1' : '0');
    const tampered = [parts[0], parts[1], parts[2], swapped, parts[4]].join('-');
    expect(() => decodeResponse(tampered)).toThrow(CodeError);
    try {
      decodeResponse(tampered);
    } catch (e) {
      expect((e as CodeError).reason).toBe('checksum');
    }
  });

  it('rejects malformed codes, unknown versions and empty answers', () => {
    expect(() => decodeResponse('hello')).toThrow(/Format/);
    const body = 'E26-9C-ABCDEFGH-1T0000000000000';
    expect(() => decodeResponse(`${body}-${checksum(body)}`)).toThrow(/Version/);
    const empty = encodeResponse({ id: 'ABCDEFGH', answers: {}, complete: false });
    expect(() => decodeResponse(empty)).toThrow(/Aucune réponse/);
  });

  it('extracts several codes from noisy text without duplicates', () => {
    const a = encodeResponse({ id: 'AAAAAAAA', answers: { Q01: 0 }, complete: true });
    const b = encodeResponse({ id: 'BBBBBBBB', answers: { Q02: 1 }, complete: true });
    const text = `Bonjour ! voici ${a}, et ${b.toLowerCase()} ; encore ${a}`;
    expect(extractCodes(text)).toEqual([a, b]);
  });

  it('packs and unpacks base-5 digits losslessly', () => {
    for (let t = 0; t < 50; t++) {
      for (const n of [10, 29]) {
        const digits = Array.from({ length: n }, (_, i) => (i * 7 + t * 13) % 5);
        expect(unpackDigits(packDigits(digits), n)).toEqual(digits);
      }
    }
  });

  it('generates Crockford base32 anonymous ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => randomId()));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id).toMatch(/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{8}$/);
  });

  it('batch payloads are parseable and stay in the alphanumeric charset', () => {
    const codes = ['AAAAAAAA', 'BBBBBBBB'].map((id) => encodeResponse({ id, answers: { Q03: 2 }, complete: true }));
    const payload = encodeBatch(codes, 2, 5);
    expect(payload).toMatch(QR_ALNUM);
    expect(parseBatchHeader(payload)).toEqual({ page: 2, total: 5 });
    expect(extractCodes(payload)).toEqual(codes);
  });
});

describe('sequence URL parameter', () => {
  it('round-trips the default and full sequences', () => {
    for (const seq of [DEFAULT_SEQUENCE, FULL_SEQUENCE]) {
      expect(decodeSequenceParam(encodeSequenceParam(seq))).toEqual(seq);
    }
  });

  it('rejects unknown indices and ignores repeats', () => {
    expect(decodeSequenceParam('Z')).toBeNull();
    expect(decodeSequenceParam('')).toBeNull();
    expect(decodeSequenceParam('112')).toEqual(['Q01', 'Q02']);
  });
});
