import { describe, expect, it } from 'vitest';
import { DEFAULT_SEQUENCE, FULL_SEQUENCE, LETTERS, MAX_INDEX, QUESTIONS, QUESTION_BY_ID } from '../../src/data/questions';
import { SOURCES } from '../../src/data/sources';
import { GLOSSARY } from '../../src/data/glossary';
import { FACTS } from '../../src/data/facts';

/** Verified answers for the 10 questions of the event. */
const EXPECTED: Record<string, { letter: string; contains: string }> = {
  Q01: { letter: 'C', contains: '35 000' },
  Q02: { letter: 'C', contains: '1,9 milliard de livres' },
  Q03: { letter: 'D', contains: '80–90 %' },
  Q04: { letter: 'C', contains: '657 540' },
  Q05: { letter: 'C', contains: '51 %' },
  Q06: { letter: 'C', contains: 'Plus de 500' },
  Q07: { letter: 'C', contains: '636 Gbit/s' },
  Q08: { letter: 'D', contains: 'Plus de 5 000' },
  Q09: { letter: 'D', contains: '99,83 %' },
  Q10: { letter: 'C', contains: 'Plus de 10 000' },
};

describe('question bank', () => {
  it('contains exactly 10 questions, all built around a figure', () => {
    expect(QUESTIONS).toHaveLength(10);
    for (const q of QUESTIONS) expect(q.numeric, q.id).toBeDefined();
  });

  it('has unique, contiguous, frozen indices matching ids', () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(QUESTIONS.length);
    QUESTIONS.forEach((q, i) => {
      expect(q.index).toBe(i + 1);
      expect(q.id).toBe(`Q${String(q.index).padStart(2, '0')}`);
    });
    // Sequence URLs use one base36 char per index.
    expect(MAX_INDEX).toBeLessThanOrEqual(35);
  });

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s is complete and well-formed', (_id, q) => {
    expect(q.question.trim().length).toBeGreaterThan(10);
    expect(q.choices).toHaveLength(4);
    q.choices.forEach((c) => expect(c.trim()).not.toBe(''));
    expect(new Set(q.choices).size).toBe(4);
    expect([0, 1, 2, 3]).toContain(q.correct);
    expect(q.explanation.length).toBeGreaterThan(40);
    expect(q.managementInsight.length).toBeGreaterThan(20);
    expect(q.reveal.length).toBeGreaterThan(5);
    expect(q.period.length).toBeGreaterThan(3);
    expect(q.sources.length).toBeGreaterThan(0);
    for (const s of q.sources) {
      expect(SOURCES[s.id], `source ${s.id}`).toBeDefined();
      expect(SOURCES[s.id].url).toMatch(/^https:\/\//);
    }
    expect(q.abbreviations.length).toBeGreaterThan(0);
    for (const a of q.abbreviations) expect(GLOSSARY[a], `glossary ${a}`).toBeDefined();
  });

  it.each(Object.entries(EXPECTED))('%s has the verified correct answer', (id, exp) => {
    const q = QUESTION_BY_ID[id];
    expect(q, id).toBeDefined();
    expect(LETTERS[q.correct]).toBe(exp.letter);
    expect(q.choices[q.correct]).toContain(exp.contains);
  });

  it('every question of the bank has an expected answer in this test', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
  });

  it('numeric reveals are consistent with the correct answer or the question', () => {
    for (const q of QUESTIONS.filter((x) => x.numeric)) {
      const intPart = new Intl.NumberFormat('fr-FR').format(Math.trunc(q.numeric!.value)).replace(/ | /g, ' ');
      const haystack = `${q.question} ${q.choices[q.correct]}`;
      expect(haystack, q.id).toContain(intPart);
    }
  });

  it('JLR questions carry the "estimate, not audited losses" caveat', () => {
    expect(QUESTION_BY_ID.Q02.caveat).toMatch(/estimé/);
    expect(QUESTION_BY_ID.Q08.caveat).toMatch(/pas organisations compromises/);
    expect(QUESTION_BY_ID.Q02.tag).toBe('Estimation');
  });

  it('vendor-reported AI figures are attributed', () => {
    for (const id of ['Q03', 'Q06', 'Q10']) {
      expect(QUESTION_BY_ID[id].caveat, id).toMatch(/éditeur|Anthropic/);
      expect(QUESTION_BY_ID[id].tag, id).toBe('Chiffre éditeur');
    }
  });
});

describe('sequences', () => {
  it('default sequence contains the 10 questions once', () => {
    expect(DEFAULT_SEQUENCE).toHaveLength(10);
    expect([...DEFAULT_SEQUENCE].sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
    expect(FULL_SEQUENCE).toEqual(DEFAULT_SEQUENCE);
  });

  it('opens with a Tunisian statistic and alternates Tunisia → international → AI', () => {
    const beats = DEFAULT_SEQUENCE.map((id) => QUESTION_BY_ID[id].beat);
    expect(beats.slice(0, 3)).toEqual(['stat-tunisie', 'attaque-internationale', 'ia']);
    for (let i = 1; i < beats.length; i++) expect(beats[i]).not.toBe(beats[i - 1]);
  });
});

describe('glossary', () => {
  const required: Record<string, string> = {
    DDoS: 'Distributed Denial of Service',
    CVE: 'Common Vulnerabilities and Exposures',
    SBOM: 'Software Bill of Materials',
    LLM: 'Large Language Model',
    ANCS: 'Agence nationale de la cybersécurité',
    ENISA: 'European Union Agency for Cybersecurity',
  };
  it.each(Object.entries(required))('%s expands to the official term', (key, expansion) => {
    expect(GLOSSARY[key].expansion).toBe(expansion);
  });

  it('every entry is documented and used by a question', () => {
    const used = new Set(QUESTIONS.flatMap((q) => q.abbreviations));
    for (const [key, g] of Object.entries(GLOSSARY)) {
      expect(used.has(key), key).toBe(true);
      expect(g.expansion.length).toBeGreaterThan(2);
      expect(g.definition.length).toBeGreaterThan(20);
    }
  });
});

describe('sources and facts', () => {
  it('all sources are https and carry a verification date', () => {
    for (const s of Object.values(SOURCES)) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('facts reference existing sources and questions', () => {
    for (const f of FACTS) {
      expect(SOURCES[f.sourceId], f.id).toBeDefined();
      if (f.questionId) expect(QUESTION_BY_ID[f.questionId], f.id).toBeDefined();
    }
  });

  it('includes the required headline facts', () => {
    const values = FACTS.map((f) => f.value);
    for (const v of [35000, 636, 657540, 1.9, 5000, 10000]) expect(values).toContain(v);
  });
});
