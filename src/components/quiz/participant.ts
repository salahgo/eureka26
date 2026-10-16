import { DEFAULT_SEQUENCE, QUESTION_BY_ID } from '../../data/questions';
import type { ChoiceIndex } from '../../data/types';
import { decodeSequenceParam, encodeResponse, randomId } from '../../lib/codec';
import { KEYS, readJSON } from '../../lib/storage';

export interface ParticipantState {
  v: 1;
  id: string;
  sequence: string[];
  /** Show the correct answer after each question (can be disabled with ?f=0). */
  feedback: boolean;
  answers: Record<string, ChoiceIndex>;
  pos: number;
  stage: 'welcome' | 'question' | 'done';
  startedAt: number | null;
  finishedAt: number | null;
  complete: boolean;
}

export function freshState(sequence: string[], feedback: boolean): ParticipantState {
  return { v: 1, id: randomId(), sequence, feedback, answers: {}, pos: 0, stage: 'welcome', startedAt: null, finishedAt: null, complete: false };
}

export function isValidState(s: unknown): s is ParticipantState {
  const x = s as ParticipantState;
  return (
    !!x &&
    x.v === 1 &&
    typeof x.id === 'string' &&
    /^[0-9A-Z]{8}$/.test(x.id) &&
    Array.isArray(x.sequence) &&
    x.sequence.length > 0 &&
    x.sequence.every((id) => QUESTION_BY_ID[id]) &&
    !!x.answers &&
    typeof x.answers === 'object'
  );
}

export function readParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    sequence: decodeSequenceParam(params.get('s')) ?? DEFAULT_SEQUENCE,
    feedback: params.get('f') !== '0',
  };
}

/** Restores the participant's progress; a new invitation subset only replaces an untouched session. */
export function initialState(): ParticipantState {
  const { sequence, feedback } = readParams();
  const stored = readJSON<unknown>(KEYS.participant, null);
  if (isValidState(stored)) {
    const answered = Object.keys(stored.answers).length;
    const sameSeq = stored.sequence.join() === sequence.join();
    if (sameSeq || answered > 0) return { ...stored, pos: Math.max(0, Math.min(stored.pos, stored.sequence.length - 1)) };
  }
  return freshState(sequence, feedback);
}

export function responseCode(state: ParticipantState): string {
  return encodeResponse({ id: state.id, answers: state.answers, complete: state.complete });
}
