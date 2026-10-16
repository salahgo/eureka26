import { FACTS } from '../data/facts';
import { DEFAULT_SEQUENCE, FULL_SEQUENCE, QUESTION_BY_ID, QUESTIONS } from '../data/questions';

export interface PresenterConfig {
  /** All question ids, in presentation order. */
  order: string[];
  /** Ids of the questions enabled for this event. */
  enabled: string[];
  /** Optional override of the public questionnaire URL (custom domain, rehearsal…). */
  inviteUrl: string | null;
  /** Seconds per slide in automatic rotation. */
  autoplaySeconds: number;
  /** Participants see the correct answer right after each question (otherwise only at the end). */
  phoneFeedback: boolean;
}

export const defaultConfig = (): PresenterConfig => ({
  order: [...FULL_SEQUENCE],
  enabled: [...DEFAULT_SEQUENCE],
  inviteUrl: null,
  autoplaySeconds: 12,
  phoneFeedback: true,
});

/** Repairs a stored config: unknown ids dropped, questions added later appended at the end. */
export function normalizeConfig(raw: Partial<PresenterConfig> | null | undefined): PresenterConfig {
  const base = defaultConfig();
  if (!raw || typeof raw !== 'object') return base;
  const order = (Array.isArray(raw.order) ? raw.order : base.order).filter((id) => QUESTION_BY_ID[id]);
  const unique = Array.from(new Set(order));
  for (const q of QUESTIONS) if (!unique.includes(q.id)) unique.push(q.id);
  const enabled = (Array.isArray(raw.enabled) ? raw.enabled : base.enabled).filter((id) => QUESTION_BY_ID[id]);
  const seconds = Number(raw.autoplaySeconds);
  return {
    order: unique,
    enabled: Array.from(new Set(enabled)),
    inviteUrl: typeof raw.inviteUrl === 'string' && /^https?:\/\//.test(raw.inviteUrl) ? raw.inviteUrl : null,
    autoplaySeconds: Number.isFinite(seconds) && seconds >= 4 && seconds <= 120 ? seconds : base.autoplaySeconds,
    phoneFeedback: raw.phoneFeedback === undefined ? true : !!raw.phoneFeedback,
  };
}

/** Ordered list of the question ids active in the presentation. */
export function activeSequence(config: PresenterConfig): string[] {
  const enabled = new Set(config.enabled);
  return config.order.filter((id) => enabled.has(id));
}

export function isDefaultSequence(ids: string[]): boolean {
  return ids.length === DEFAULT_SEQUENCE.length && ids.every((id, i) => id === DEFAULT_SEQUENCE[i]);
}

export type DashboardView = 'overview' | 'question' | 'facts' | 'management' | 'future';

export interface PresentationState {
  view: DashboardView;
  /** Position in the active sequence when view === 'question'. */
  pos: number;
  revealed: boolean;
  explanation: boolean;
  factIndex: number;
  /** Facts view: one fact shown full screen. */
  spotlight: boolean;
  autoplay: boolean;
  revealMode: boolean;
  demo: boolean;
  table: boolean;
  /** Bumped on every remote command so identical states still trigger animations. */
  nonce: number;
}

export const defaultPresentation = (): PresentationState => ({
  view: 'overview',
  pos: 0,
  revealed: false,
  explanation: false,
  factIndex: 0,
  spotlight: false,
  autoplay: false,
  revealMode: false,
  demo: false,
  table: false,
  nonce: 0,
});

export function normalizePresentation(raw: Partial<PresentationState> | null | undefined): PresentationState {
  const d = defaultPresentation();
  if (!raw || typeof raw !== 'object') return d;
  const views: DashboardView[] = ['overview', 'question', 'facts', 'management', 'future'];
  return {
    view: views.includes(raw.view as DashboardView) ? (raw.view as DashboardView) : d.view,
    pos: Number.isInteger(raw.pos) && (raw.pos as number) >= 0 ? (raw.pos as number) : 0,
    revealed: !!raw.revealed,
    explanation: !!raw.explanation,
    factIndex: Number.isInteger(raw.factIndex) && (raw.factIndex as number) >= 0 ? (raw.factIndex as number) : 0,
    spotlight: !!raw.spotlight,
    autoplay: !!raw.autoplay,
    revealMode: !!raw.revealMode,
    demo: !!raw.demo,
    table: !!raw.table,
    nonce: Number(raw.nonce) || 0,
  };
}

/** Pure transition used by keyboard, buttons, autoplay and the /admin remote. */
export function nextState(p: PresentationState, cmd: 'next' | 'prev', sequenceLength: number): Partial<PresentationState> {
  const d = cmd === 'next' ? 1 : -1;
  if (p.view === 'question') {
    const pos = p.pos + d;
    if (pos < 0 || pos >= sequenceLength) return {};
    return { pos, revealed: false, explanation: false, revealMode: false };
  }
  if (p.view === 'facts') return { factIndex: (p.factIndex + d + FACTS.length) % FACTS.length };
  const order: DashboardView[] = ['overview', 'question', 'facts', 'management', 'future'];
  const i = order.indexOf(p.view) + d;
  return i >= 0 && i < order.length ? { view: order[i] } : {};
}
