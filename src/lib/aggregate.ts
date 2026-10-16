import { QUESTION_BY_ID } from '../data/questions';
import type { ManualCounts, Submission } from './session';

export type Counts = [number, number, number, number];

export interface QuestionStats {
  questionId: string;
  /** Votes from collected participant submissions (QR / paste / file). */
  collected: Counts;
  /** Votes entered manually by the presenter. */
  manual: Counts;
  total: Counts;
  respondents: number;
  correctVotes: number;
  /** Share of correct answers among all votes (0–1), or null when nobody answered. */
  pctCorrect: number | null;
}

export interface Overview {
  submissions: number;
  completed: number;
  /** Mean of per-participant success rates (0–1). */
  averageScore: number | null;
  medianScore: number | null;
  /** Mean number of correct answers per participant. */
  averageCorrect: number | null;
  /** All votes (collected + manual) that were correct (0–1). */
  pctCorrect: number | null;
  totalVotes: number;
  manualVotes: number;
  hardest: QuestionStats | null;
  easiest: QuestionStats | null;
  /** Numeric fact the audience got most wrong (lowest % correct among numeric questions). */
  mostSurprising: QuestionStats | null;
  scoreHistogram: number[]; // 11 buckets: 0–9 %, 10–19 %, … 100 %
}

const zero = (): Counts => [0, 0, 0, 0];

export function questionStats(questionId: string, submissions: Submission[], manual: ManualCounts): QuestionStats {
  const q = QUESTION_BY_ID[questionId];
  const collected = zero();
  for (const s of submissions) {
    const a = s.answers[questionId];
    if (a !== undefined) collected[a] += 1;
  }
  const man = (manual[questionId] ?? zero()).slice() as Counts;
  const total = collected.map((n, i) => n + man[i]) as Counts;
  const respondents = total.reduce((a, b) => a + b, 0);
  const correctVotes = q ? total[q.correct] : 0;
  return {
    questionId,
    collected,
    manual: man,
    total,
    respondents,
    correctVotes,
    pctCorrect: respondents ? correctVotes / respondents : null,
  };
}

export function scoreOf(s: Submission): { correct: number; answered: number; rate: number } {
  let correct = 0;
  let answered = 0;
  for (const [qid, choice] of Object.entries(s.answers)) {
    const q = QUESTION_BY_ID[qid];
    if (!q) continue;
    answered += 1;
    if (q.correct === choice) correct += 1;
  }
  return { correct, answered, rate: answered ? correct / answered : 0 };
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export function overview(sequence: string[], submissions: Submission[], manual: ManualCounts): Overview {
  const stats = sequence.map((id) => questionStats(id, submissions, manual));
  const scores = submissions.map(scoreOf);
  const rates = scores.map((s) => s.rate);
  const totalVotes = stats.reduce((a, s) => a + s.respondents, 0);
  const correctVotes = stats.reduce((a, s) => a + s.correctVotes, 0);
  const manualVotes = stats.reduce((a, s) => a + s.manual.reduce((x, y) => x + y, 0), 0);
  const answeredStats = stats.filter((s) => s.respondents > 0);
  const byDifficulty = [...answeredStats].sort(
    (a, b) => (a.pctCorrect ?? 1) - (b.pctCorrect ?? 1) || b.respondents - a.respondents,
  );
  const numeric = byDifficulty.filter((s) => QUESTION_BY_ID[s.questionId]?.numeric);
  const histogram = new Array<number>(11).fill(0);
  for (const r of rates) histogram[Math.min(10, Math.floor(r * 10 + 1e-9))] += 1;
  return {
    submissions: submissions.length,
    completed: submissions.filter((s) => s.complete).length,
    averageScore: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null,
    medianScore: median(rates),
    averageCorrect: scores.length ? scores.reduce((a, s) => a + s.correct, 0) / scores.length : null,
    pctCorrect: totalVotes ? correctVotes / totalVotes : null,
    totalVotes,
    manualVotes,
    hardest: byDifficulty[0] ?? null,
    easiest: byDifficulty.length ? byDifficulty[byDifficulty.length - 1] : null,
    // Prefer a different question than the hardest one so the two overview cards tell two stories.
    mostSurprising: numeric.find((s) => s.questionId !== byDifficulty[0]?.questionId) ?? numeric[0] ?? null,
    scoreHistogram: histogram,
  };
}
