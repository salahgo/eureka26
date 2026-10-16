import { describe, expect, it } from 'vitest';
import { encodeResponse } from '../../src/lib/codec';
import {
  codesFromJSON,
  emptySession,
  ingestCode,
  ingestText,
  mergeSessions,
  parseSessionJSON,
  removeSubmission,
  setManualCounts,
} from '../../src/lib/session';
import { overview, questionStats, topicStats, median, scoreOf } from '../../src/lib/aggregate';
import { aggregatedCSV, submissionsCSV, toCSV } from '../../src/lib/exporters';
import { demoSubmissions } from '../../src/lib/demo';
import { DEFAULT_SEQUENCE, QUESTION_BY_ID } from '../../src/data/questions';
import { activeSequence, defaultConfig, normalizeConfig } from '../../src/lib/config';
import { invitationUrl, PUBLIC_URL } from '../../src/lib/urls';

const code = (id: string, answers: Record<string, 0 | 1 | 2 | 3>, complete = true) => encodeResponse({ id, answers, complete });

describe('session ingest', () => {
  it('accepts a new submission', () => {
    const { session, result } = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2, Q02: 0 }), 'camera');
    expect(result.status).toBe('accepted');
    expect(result.answered).toBe(2);
    expect(session.submissions).toHaveLength(1);
    expect(session.log[0].kind).toBe('accepted');
  });

  it('ignores an exact duplicate and counts it', () => {
    const c = code('AAAAAAAA', { Q01: 2 });
    let s = ingestCode(emptySession(), c, 'camera').session;
    const r = ingestCode(s, c, 'paste');
    s = r.session;
    expect(r.result.status).toBe('duplicate');
    expect(s.submissions).toHaveLength(1);
    expect(s.duplicates).toBe(1);
  });

  it('flags a conflicting submission id and keeps the first version', () => {
    let s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    const r = ingestCode(s, code('AAAAAAAA', { Q01: 1 }), 'camera');
    s = r.session;
    expect(r.result.status).toBe('conflict');
    expect(s.submissions[0].answers.Q01).toBe(2);
    expect(s.conflicts).toBe(1);
  });

  it('a complete version replaces a partial one with the same id', () => {
    let s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }, false), 'camera').session;
    s = ingestCode(s, code('AAAAAAAA', { Q01: 2, Q02: 2 }, true), 'camera').session;
    expect(s.submissions).toHaveLength(1);
    expect(s.submissions[0].complete).toBe(true);
    expect(Object.keys(s.submissions[0].answers)).toHaveLength(2);
  });

  it('rejects invalid codes without touching submissions', () => {
    const r = ingestCode(emptySession(), 'E26-1C-AAAAAAAA-1T00000000000001-ZZ', 'paste');
    expect(r.result.status).toBe('invalid');
    expect(r.session.submissions).toHaveLength(0);
  });

  it('ingests a pasted list with mixed content', () => {
    const text = [code('AAAAAAAA', { Q01: 2 }), 'blabla', code('BBBBBBBB', { Q01: 0 }), code('AAAAAAAA', { Q01: 2 })].join('\n');
    const { session, results } = ingestText(emptySession(), text, 'paste');
    expect(results.map((r) => r.status)).toEqual(['accepted', 'accepted']); // the repeated code is de-duplicated by extraction
    expect(session.submissions).toHaveLength(2);
  });

  it('removes a submission', () => {
    let s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    s = removeSubmission(s, 'AAAAAAAA');
    expect(s.submissions).toHaveLength(0);
  });

  it('stores sanitized manual counts and clears all-zero rows', () => {
    let s = setManualCounts(emptySession(), 'Q01', [3, -2, 4.7, Number.NaN]);
    expect(s.manual.Q01).toEqual([3, 0, 4, 0]);
    s = setManualCounts(s, 'Q01', [0, 0, 0, 0]);
    expect(s.manual.Q01).toBeUndefined();
  });
});

describe('session import / export', () => {
  it('restores a session and re-validates every code', () => {
    let s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    s = setManualCounts(s, 'Q02', [1, 2, 3, 4]);
    const json = JSON.parse(JSON.stringify({ ...s, submissions: [...s.submissions, { id: 'EVIL0000', code: 'E26-bogus', answers: { Q01: 2 } }] }));
    const restored = parseSessionJSON(json);
    expect(restored.submissions.map((x) => x.id)).toEqual(['AAAAAAAA']);
    expect(restored.manual.Q02).toEqual([1, 2, 3, 4]);
  });

  it('refuses foreign JSON files', () => {
    expect(() => parseSessionJSON({ hello: 'world' })).toThrow(/session EUREKA26/);
  });

  it('merges sessions with duplicate detection and summed manual counts', () => {
    const a = setManualCounts(ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session, 'Q01', [1, 0, 0, 0]);
    let b = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    b = ingestCode(b, code('BBBBBBBB', { Q01: 1 }), 'camera').session;
    b = setManualCounts(b, 'Q01', [2, 0, 0, 1]);
    const { session, results } = mergeSessions(a, b);
    expect(results.map((r) => r.status)).toEqual(['duplicate', 'accepted']);
    expect(session.submissions).toHaveLength(2);
    expect(session.manual.Q01).toEqual([3, 0, 0, 1]);
  });

  it('finds codes inside participant JSON exports', () => {
    const c = code('CCCCCCCC', { Q03: 2 });
    expect(codesFromJSON({ format: 'eureka26-response', version: 1, code: c })).toEqual([c]);
    expect(codesFromJSON([{ code: c }, { code: c }])).toEqual([c]);
  });
});

describe('aggregation', () => {
  const subs = () => {
    let s = emptySession();
    s = ingestCode(s, code('AAAAAAAA', { Q01: 2, Q21: 3 }), 'camera').session; // 2/2
    s = ingestCode(s, code('BBBBBBBB', { Q01: 0, Q21: 3 }), 'camera').session; // 1/2
    s = ingestCode(s, code('CCCCCCCC', { Q01: 1, Q21: 0 }, false), 'camera').session; // 0/2
    return s;
  };

  it('counts votes per choice and computes success rate', () => {
    const s = subs();
    const st = questionStats('Q01', s.submissions, s.manual);
    expect(st.collected).toEqual([1, 1, 1, 0]);
    expect(st.respondents).toBe(3);
    expect(st.pctCorrect).toBeCloseTo(1 / 3);
  });

  it('adds manual counts separately from collected votes', () => {
    const s = setManualCounts(subs(), 'Q01', [0, 0, 5, 1]);
    const st = questionStats('Q01', s.submissions, s.manual);
    expect(st.collected).toEqual([1, 1, 1, 0]);
    expect(st.manual).toEqual([0, 0, 5, 1]);
    expect(st.total).toEqual([1, 1, 6, 1]);
    expect(st.pctCorrect).toBeCloseTo(6 / 9);
  });

  it('computes overview figures', () => {
    const s = subs();
    const o = overview(['Q01', 'Q21'], s.submissions, s.manual);
    expect(o.submissions).toBe(3);
    expect(o.completed).toBe(2);
    expect(o.averageScore).toBeCloseTo(0.5);
    expect(o.medianScore).toBeCloseTo(0.5);
    expect(o.averageCorrect).toBeCloseTo(1);
    expect(o.pctCorrect).toBeCloseTo(3 / 6);
    expect(o.hardest?.questionId).toBe('Q01');
    expect(o.mostSurprising?.questionId).toBe('Q01');
    expect(o.scoreHistogram.reduce((a, b) => a + b, 0)).toBe(3);
    expect(o.scoreHistogram[10]).toBe(1);
  });

  it('handles the empty state', () => {
    const o = overview(DEFAULT_SEQUENCE, [], {});
    expect(o.submissions).toBe(0);
    expect(o.averageScore).toBeNull();
    expect(o.hardest).toBeNull();
    expect(o.pctCorrect).toBeNull();
  });

  it('median works on odd and even lists', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it('scores a submission', () => {
    const s = subs();
    expect(scoreOf(s.submissions[0])).toEqual({ correct: 2, answered: 2, rate: 1 });
  });

  it('computes management topic knowledge only from conceptual questions', () => {
    const s = subs();
    const topics = topicStats(['Q01', 'Q21'], s.submissions, s.manual);
    const gov = topics.find((t) => t.topic === 'Gouvernance cyber')!;
    expect(gov.questionIds).toEqual(['Q21']);
    expect(gov.pctCorrect).toBeCloseTo(2 / 3);
  });
});

describe('exports', () => {
  it('escapes CSV cells and adds a BOM', () => {
    const csv = toCSV([['a,b', 'c"d', 'ok']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"a,b","c""d",ok');
  });

  it('aggregated CSV has one row per choice', () => {
    const s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    const lines = aggregatedCSV(s, ['Q01', 'Q02']).trim().split('\r\n');
    expect(lines).toHaveLength(1 + 8);
    expect(lines[3]).toContain('35 000');
  });

  it('submissions CSV has one row per submission', () => {
    const s = ingestCode(emptySession(), code('AAAAAAAA', { Q01: 2 }), 'camera').session;
    const lines = submissionsCSV(s).trim().split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('AAAAAAAA');
  });
});

describe('demo mode', () => {
  it('is deterministic and produces valid codes', () => {
    const a = demoSubmissions(DEFAULT_SEQUENCE, 20, 7);
    const b = demoSubmissions(DEFAULT_SEQUENCE, 20, 7);
    expect(a.map((s) => s.code)).toEqual(b.map((s) => s.code));
    let s = emptySession();
    for (const sub of a) s = ingestCode(s, sub.code, 'camera').session;
    expect(s.submissions.length).toBe(20);
  });
});

describe('config & URLs', () => {
  it('normalizes config and keeps new questions available', () => {
    const c = normalizeConfig({ order: ['Q02', 'Q01', 'NOPE'], enabled: ['Q01', 'NOPE'] });
    expect(c.order[0]).toBe('Q02');
    expect(c.order).toHaveLength(Object.keys(QUESTION_BY_ID).length);
    expect(c.enabled).toEqual(['Q01']);
    expect(activeSequence(defaultConfig())).toEqual(DEFAULT_SEQUENCE);
  });

  it('invitation URL is the public URL by default and carries custom subsets', () => {
    expect(invitationUrl(DEFAULT_SEQUENCE)).toBe(PUBLIC_URL);
    expect(PUBLIC_URL).toMatch(/^https:\/\//);
    const url = invitationUrl(['Q01', 'Q10', 'Q12']);
    expect(new URL(url).searchParams.get('s')).toBe('1AC');
  });
});
