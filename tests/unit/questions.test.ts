import { describe, expect, it } from 'vitest';
import { DEFAULT_SEQUENCE, FULL_SEQUENCE, LETTERS, MAX_INDEX, QUESTIONS, QUESTION_BY_ID } from '../../src/data/questions';
import { SOURCES } from '../../src/data/sources';
import { GLOSSARY } from '../../src/data/glossary';
import { FACTS } from '../../src/data/facts';

/** Reference answers from the brief (Q1–Q22) plus the complementary questions. */
const EXPECTED: Record<string, { letter: string; contains: string }> = {
  Q01: { letter: 'C', contains: '35 000' },
  Q02: { letter: 'C', contains: '636 Gbit/s' },
  Q03: { letter: 'C', contains: 'tunCERT' },
  Q04: { letter: 'D', contains: '99,83 %' },
  Q05: { letter: 'C', contains: 'Groupe CRIT' },
  Q06: { letter: 'B', contains: '114' },
  Q07: { letter: 'C', contains: '51 %' },
  Q08: { letter: 'D', contains: 'Administration publique' },
  Q09: { letter: 'C', contains: '57 %' },
  Q10: { letter: 'C', contains: '1,9 milliard de livres' },
  Q11: { letter: 'D', contains: 'Plus de 5 000' },
  Q12: { letter: 'D', contains: '80–90 %' },
  Q13: { letter: 'C', contains: 'Plus de 10 000' },
  Q14: { letter: 'C', contains: 'Plus de 500' },
  Q15: { letter: 'B', contains: '14' },
  Q16: { letter: 'B', contains: 'Distributed Denial of Service' },
  Q17: { letter: 'C', contains: 'Model Context Protocol' },
  Q18: { letter: 'D', contains: 'SOAR' },
  Q19: { letter: 'C', contains: 'RTO = délai de restauration visé ; RPO = perte de données maximale tolérée' },
  Q20: { letter: 'C', contains: 'GOVERN' },
  Q21: { letter: 'D', contains: 'La direction, avec le RSSI et les responsables métiers' },
  Q22: { letter: 'D', contains: 'Zero Trust' },
  Q23: { letter: 'C', contains: 'clés de chiffrement' },
  Q24: { letter: 'B', contains: 'Ne jamais faire confiance par défaut' },
  Q25: { letter: 'B', contains: 'comptes à privilèges' },
  Q26: { letter: 'B', contains: 'permissions minimales' },
  Q27: { letter: 'B', contains: 'authentification multifacteur' },
  Q28: { letter: 'B', contains: 'Governance, Risk and Compliance' },
  Q29: { letter: 'B', contains: 'déchiffrées demain' },
};

describe('question bank', () => {
  it('contains at least 22 questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(22);
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

  it('forward-looking questions separate current facts from projections', () => {
    for (const id of ['Q22', 'Q29']) {
      const h = QUESTION_BY_ID[id].horizon!;
      expect(h.now).toMatch(/^Aujourd'hui/);
      expect(h.projection).toMatch(/^Projection/);
    }
  });

  it('JLR questions carry the "estimate, not audited losses" caveat', () => {
    expect(QUESTION_BY_ID.Q10.caveat).toMatch(/estimé/);
    expect(QUESTION_BY_ID.Q11.caveat).toMatch(/pas organisations compromises/);
  });

  it('vendor-reported AI figures are attributed', () => {
    for (const id of ['Q12', 'Q13', 'Q14', 'Q15']) {
      expect(QUESTION_BY_ID[id].caveat, id).toMatch(/éditeur|Anthropic/);
    }
  });
});

describe('sequences', () => {
  it('default sequence has 16 unique existing questions', () => {
    expect(DEFAULT_SEQUENCE).toHaveLength(16);
    expect(new Set(DEFAULT_SEQUENCE).size).toBe(16);
    DEFAULT_SEQUENCE.forEach((id) => expect(QUESTION_BY_ID[id]).toBeDefined());
  });

  it('full sequence contains every question exactly once', () => {
    expect([...FULL_SEQUENCE].sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
  });

  it('opens with a shocking Tunisian statistic and follows the pacing pattern', () => {
    const beats = DEFAULT_SEQUENCE.map((id) => QUESTION_BY_ID[id].beat);
    expect(beats[0]).toBe('stat-tunisie');
    expect(beats.slice(0, 6)).toEqual(['stat-tunisie', 'management', 'attaque-internationale', 'ia', 'geopolitique', 'stat-tunisie']);
  });

  it.each([
    ['default', DEFAULT_SEQUENCE],
    ['full', FULL_SEQUENCE],
  ])('%s sequence never chains more than 2 abbreviation questions', (_n, seq) => {
    let run = 0;
    for (const id of seq) {
      run = QUESTION_BY_ID[id].category === 'abreviations' ? run + 1 : 0;
      expect(run).toBeLessThanOrEqual(2);
    }
  });

  it('never repeats the same beat twice in a row in the default sequence', () => {
    for (let i = 1; i < DEFAULT_SEQUENCE.length; i++) {
      expect(QUESTION_BY_ID[DEFAULT_SEQUENCE[i]].beat).not.toBe(QUESTION_BY_ID[DEFAULT_SEQUENCE[i - 1]].beat);
    }
  });
});

describe('glossary', () => {
  const required: Record<string, string> = {
    DDoS: 'Distributed Denial of Service',
    MCP: 'Model Context Protocol',
    SOAR: 'Security Orchestration, Automation and Response',
    SIEM: 'Security Information and Event Management',
    SOC: 'Security Operations Center',
    RTO: 'Recovery Time Objective',
    RPO: 'Recovery Point Objective',
    GRC: 'Governance, Risk and Compliance',
    RSSI: "Responsable de la sécurité des systèmes d'information",
    IAM: 'Identity and Access Management',
    PAM: 'Privileged Access Management',
    'ML-KEM': 'Module-Lattice-Based Key-Encapsulation Mechanism',
    'ML-DSA': 'Module-Lattice-Based Digital Signature Algorithm',
    'NIST CSF': 'NIST Cybersecurity Framework 2.0',
  };
  it.each(Object.entries(required))('%s expands to the official term', (key, expansion) => {
    expect(GLOSSARY[key].expansion).toBe(expansion);
  });

  it('NIST CSF lists the six functions', () => {
    expect(GLOSSARY['NIST CSF'].definition).toMatch(/Govern, Identify, Protect, Detect, Respond, Recover/);
  });

  it('every entry is documented', () => {
    for (const g of Object.values(GLOSSARY)) {
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
