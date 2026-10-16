/**
 * MODE DÉMONSTRATION — synthetic submissions for rehearsing the dashboard.
 * Generated in memory only, never written to the session store and never exported.
 */
import { QUESTIONS } from '../data/questions';
import type { ChoiceIndex } from '../data/types';
import { encodeResponse, type AnswerMap } from './codec';
import type { Submission } from './session';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ID_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function demoSubmissions(sequence: string[], count = 142, seed = 2026): Submission[] {
  const rnd = mulberry32(seed);
  const out: Submission[] = [];
  const base = Date.UTC(2026, 9, 16, 9, 0, 0);
  for (let n = 0; n < count; n++) {
    let id = 'D';
    for (let i = 0; i < 7; i++) id += ID_CHARS[Math.floor(rnd() * 32)];
    const skill = 0.25 + rnd() * 0.5;
    const answers: AnswerMap = {};
    const complete = rnd() > 0.06;
    const limit = complete ? sequence.length : Math.floor(sequence.length * (0.3 + rnd() * 0.5));
    sequence.slice(0, limit).forEach((qid) => {
      const q = QUESTIONS.find((x) => x.id === qid)!;
      // Big numbers are systematically under-estimated in the demo audience.
      const underestimate = q.numeric && q.correct >= 2 ? 0.18 : 0;
      if (rnd() < skill + (q.difficulty === 1 ? 0.25 : q.difficulty === 3 ? -0.1 : 0) - underestimate) {
        answers[qid] = q.correct;
      } else {
        const wrong = [0, 1, 2, 3].filter((i) => i !== q.correct);
        const pick = q.numeric ? wrong.sort((a, b) => a - b)[Math.min(wrong.length - 1, Math.floor(rnd() * rnd() * 3))] : wrong[Math.floor(rnd() * 3)];
        answers[qid] = pick as ChoiceIndex;
      }
    });
    out.push({
      id,
      code: encodeResponse({ id, answers, complete }),
      answers,
      complete,
      via: 'camera',
      receivedAt: base + n * 7000,
    });
  }
  return out;
}
