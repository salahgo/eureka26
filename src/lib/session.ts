/**
 * Presenter-side event session: collected submissions, manual counts and activity log.
 * Pure functions only — persistence and cross-tab sync live in sync.ts.
 */
import { QUESTION_BY_ID, QUESTIONS } from '../data/questions';
import type { ChoiceIndex } from '../data/types';
import { CodeError, decodeResponse, extractCodes, type AnswerMap } from './codec';

export type Via = 'camera' | 'image' | 'paste' | 'json' | 'batch';

export interface Submission {
  id: string;
  code: string;
  answers: AnswerMap;
  complete: boolean;
  via: Via;
  receivedAt: number;
}

export type ManualCounts = Record<string, [number, number, number, number]>;

export interface LogEntry {
  at: number;
  kind: 'accepted' | 'duplicate' | 'conflict' | 'invalid' | 'info';
  message: string;
  submissionId?: string;
}

export interface SessionData {
  format: 'eureka26-session';
  version: 1;
  submissions: Submission[];
  manual: ManualCounts;
  log: LogEntry[];
  /** Number of times an already-known anonymous id was presented again. */
  duplicates: number;
  conflicts: number;
  updatedAt: number;
}

export const emptySession = (): SessionData => ({
  format: 'eureka26-session',
  version: 1,
  submissions: [],
  manual: {},
  log: [],
  duplicates: 0,
  conflicts: 0,
  updatedAt: Date.now(),
});

export type IngestStatus = 'accepted' | 'duplicate' | 'conflict' | 'invalid';

export interface IngestResult {
  status: IngestStatus;
  code: string;
  id?: string;
  message: string;
  answered?: number;
}

const MAX_LOG = 300;

function sameAnswers(a: AnswerMap, b: AnswerMap): boolean {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => a[k] === b[k]);
}

function pushLog(session: SessionData, entry: LogEntry): void {
  session.log.unshift(entry);
  if (session.log.length > MAX_LOG) session.log.length = MAX_LOG;
}

/**
 * Adds one response code to the session (mutates a copy and returns it).
 * - Same anonymous id + same answers → "duplicate", ignored.
 * - Same anonymous id + different answers → "conflict"; a complete code replaces a partial one,
 *   otherwise the first received submission is kept.
 */
export function ingestCode(
  input: SessionData,
  rawCode: string,
  via: Via,
  now = Date.now(),
): { session: SessionData; result: IngestResult } {
  const session: SessionData = { ...input, submissions: [...input.submissions], log: [...input.log] };
  let decoded;
  try {
    decoded = decodeResponse(rawCode);
  } catch (e) {
    const message = e instanceof CodeError ? e.message : 'Code illisible';
    pushLog(session, { at: now, kind: 'invalid', message: `Code rejeté : ${message}` });
    return { session, result: { status: 'invalid', code: rawCode, message } };
  }
  const answered = Object.keys(decoded.answers).length;
  const existingIdx = session.submissions.findIndex((s) => s.id === decoded.id);
  if (existingIdx >= 0) {
    const existing = session.submissions[existingIdx];
    if (existing.code === decoded.code || (existing.complete === decoded.complete && sameAnswers(existing.answers, decoded.answers))) {
      session.duplicates += 1;
      pushLog(session, { at: now, kind: 'duplicate', message: `Doublon ignoré (${decoded.id})`, submissionId: decoded.id });
      return { session, result: { status: 'duplicate', code: decoded.code, id: decoded.id, message: 'Déjà reçu — ignoré', answered } };
    }
    session.conflicts += 1;
    if (!existing.complete && decoded.complete) {
      session.submissions[existingIdx] = { ...existing, code: decoded.code, answers: decoded.answers, complete: true, via, receivedAt: now };
      pushLog(session, { at: now, kind: 'conflict', message: `Version complète remplace la version partielle (${decoded.id})`, submissionId: decoded.id });
      session.updatedAt = now;
      return { session, result: { status: 'conflict', code: decoded.code, id: decoded.id, message: 'Version complète enregistrée (remplace la partielle)', answered } };
    }
    pushLog(session, { at: now, kind: 'conflict', message: `Même identifiant, réponses différentes — première version conservée (${decoded.id})`, submissionId: decoded.id });
    return { session, result: { status: 'conflict', code: decoded.code, id: decoded.id, message: 'Identifiant déjà utilisé avec d\'autres réponses — ignoré', answered } };
  }
  session.submissions.push({ id: decoded.id, code: decoded.code, answers: decoded.answers, complete: decoded.complete, via, receivedAt: now });
  session.updatedAt = now;
  pushLog(session, { at: now, kind: 'accepted', message: `Réponse acceptée (${decoded.id}, ${answered} réponses)`, submissionId: decoded.id });
  return { session, result: { status: 'accepted', code: decoded.code, id: decoded.id, message: `Acceptée — ${answered} réponses`, answered } };
}

/** Ingests every code found in a free text (paste box, QR batch, file content). */
export function ingestText(input: SessionData, text: string, via: Via, now = Date.now()) {
  const codes = extractCodes(text);
  let session = input;
  const results: IngestResult[] = [];
  for (const code of codes) {
    const r = ingestCode(session, code, via, now);
    session = r.session;
    results.push(r.result);
  }
  return { session, results };
}

export function removeSubmission(input: SessionData, id: string, now = Date.now()): SessionData {
  const session = { ...input, submissions: input.submissions.filter((s) => s.id !== id), log: [...input.log], updatedAt: now };
  pushLog(session, { at: now, kind: 'info', message: `Réponse supprimée (${id})`, submissionId: id });
  return session;
}

export function setManualCounts(input: SessionData, questionId: string, counts: [number, number, number, number], now = Date.now()): SessionData {
  const clean = counts.map((n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)) as [number, number, number, number];
  const manual = { ...input.manual };
  if (clean.every((n) => n === 0)) delete manual[questionId];
  else manual[questionId] = clean;
  return { ...input, manual, updatedAt: now };
}

/** Validates any parsed JSON and returns a clean SessionData, or throws. */
export function parseSessionJSON(value: unknown): SessionData {
  if (!value || typeof value !== 'object') throw new Error('Fichier JSON invalide');
  const v = value as Partial<SessionData>;
  if (v.format !== 'eureka26-session') throw new Error('Ce fichier n\'est pas une session EUREKA26');
  const session = emptySession();
  for (const s of Array.isArray(v.submissions) ? v.submissions : []) {
    // Re-decode every code: imported answers are never trusted blindly.
    try {
      const d = decodeResponse(String((s as Submission).code));
      if (session.submissions.some((x) => x.id === d.id)) continue;
      session.submissions.push({
        id: d.id,
        code: d.code,
        answers: d.answers,
        complete: d.complete,
        via: ((s as Submission).via ?? 'json') as Via,
        receivedAt: Number((s as Submission).receivedAt) || Date.now(),
      });
    } catch {
      /* skip invalid entry */
    }
  }
  if (v.manual && typeof v.manual === 'object') {
    for (const [qid, counts] of Object.entries(v.manual)) {
      if (!QUESTION_BY_ID[qid] || !Array.isArray(counts) || counts.length !== 4) continue;
      session.manual[qid] = counts.map((n) => Math.max(0, Math.floor(Number(n) || 0))) as [number, number, number, number];
    }
  }
  session.log = Array.isArray(v.log) ? (v.log as LogEntry[]).slice(0, MAX_LOG) : [];
  session.duplicates = Number(v.duplicates) || 0;
  session.conflicts = Number(v.conflicts) || 0;
  session.updatedAt = Date.now();
  return session;
}

/** Merges another session into the current one (codes are re-ingested so duplicates are detected). */
export function mergeSessions(base: SessionData, other: SessionData, now = Date.now()) {
  let session = base;
  const results: IngestResult[] = [];
  for (const s of other.submissions) {
    const r = ingestCode(session, s.code, 'json', now);
    session = r.session;
    results.push(r.result);
  }
  const manual = { ...session.manual };
  for (const [qid, counts] of Object.entries(other.manual)) {
    const cur = manual[qid] ?? [0, 0, 0, 0];
    manual[qid] = cur.map((n, i) => n + counts[i]) as [number, number, number, number];
  }
  return { session: { ...session, manual }, results };
}

/** A participant's individual JSON export. */
export interface ParticipantExport {
  format: 'eureka26-response';
  version: 1;
  code: string;
  answers: Record<string, string>;
  complete: boolean;
}

/** Extracts response codes from any imported JSON (participant export, array, session file). */
export function codesFromJSON(value: unknown): string[] {
  return extractCodes(JSON.stringify(value ?? ''));
}

export function letterOf(choice: ChoiceIndex): string {
  return 'ABCD'[choice];
}

export const ALL_QUESTION_IDS = QUESTIONS.map((q) => q.id);
