export type CategoryId = 'tunisie' | 'international' | 'ia' | 'abreviations' | 'management';

/** Pacing tag used to build an alternating, non-academic question sequence. */
export type Beat =
  | 'stat-tunisie'
  | 'management'
  | 'attaque-internationale'
  | 'ia'
  | 'geopolitique'
  | 'abreviation';

/** Management-knowledge topics visualised in section D of the dashboard. */
export type ManagementTopic =
  | 'GRC'
  | 'NIST CSF'
  | 'RTO/RPO'
  | 'SOC/SIEM/SOAR'
  | 'IAM/PAM'
  | 'Gouvernance cyber'
  | 'Supervision des agents IA'
  | 'Zero Trust'
  | 'Souveraineté numérique'
  | 'Post-quantique';

export type ChoiceIndex = 0 | 1 | 2 | 3;

export interface SourceRef {
  /** Key into SOURCES (src/data/sources.ts). */
  id: string;
  /** Optional precise locator (page, section, table). */
  locator?: string;
}

export interface NumericReveal {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Short caption shown under the animated number. */
  caption: string;
}

export interface Question {
  /** Human-readable stable id, e.g. "Q07". */
  id: string;
  /** Compact label for charts and lists. */
  short: string;
  /**
   * Stable 1-based position used in compact response codes.
   * NEVER renumber an existing question: response codes already issued depend on it.
   */
  index: number;
  category: CategoryId;
  beat: Beat;
  difficulty: 1 | 2 | 3;
  question: string;
  choices: [string, string, string, string];
  correct: ChoiceIndex;
  /** The big fact revealed on the dashboard. */
  reveal: string;
  numeric?: NumericReveal;
  explanation: string;
  /** Reporting period or date of the underlying fact. */
  period: string;
  sources: SourceRef[];
  /** Keys into GLOSSARY (src/data/glossary.ts). */
  abbreviations: string[];
  managementInsight: string;
  managementTopics?: ManagementTopic[];
  /** Methodological caveat shown with the answer (estimates, vendor-reported figures…). */
  caveat?: string;
  /** Distinguishes a current fact from a forward-looking projection. */
  horizon?: { now: string; projection: string };
  /** 1–5: how counter-intuitive the fact is (used to pick the "most surprising fact"). */
  surprise: 1 | 2 | 3 | 4 | 5;
}

export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  /** Publication date (ISO or human readable). */
  date: string;
  /** Date we checked the URL and the figures. */
  verifiedOn: string;
  kind: 'officiel' | 'rapport' | 'éditeur' | 'presse' | 'norme';
  note?: string;
}

export interface GlossaryEntry {
  term: string;
  expansion: string;
  definition: string;
  domain: 'cyber' | 'management' | 'ia' | 'institution' | 'crypto';
}

export interface Fact {
  id: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Unit label shown next to the number (each card has its own unit; never compared on a common scale). */
  unit: string;
  title: string;
  context: string;
  sourceId: string;
  period: string;
  tone: 'cyan' | 'amber' | 'red' | 'violet';
  questionId?: string;
}
