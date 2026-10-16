import { LETTERS, QUESTIONS, QUESTION_BY_ID } from '../data/questions';
import { questionStats, scoreOf } from './aggregate';
import type { SessionData } from './session';

function csvCell(v: string | number | boolean | null | undefined): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows: (string | number | boolean | null | undefined)[][]): string {
  // BOM so that Excel opens UTF-8 accents correctly.
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/** One row per (question, answer choice). */
export function aggregatedCSV(session: SessionData, sequence: string[]): string {
  const rows: (string | number | boolean)[][] = [
    ['question_id', 'ordre', 'categorie', 'question', 'choix', 'texte_choix', 'bonne_reponse', 'votes_collectes', 'votes_manuels', 'votes_total', 'pourcentage', 'repondants', 'taux_reussite'],
  ];
  sequence.forEach((id, order) => {
    const q = QUESTION_BY_ID[id];
    const st = questionStats(id, session.submissions, session.manual);
    q.choices.forEach((text, i) => {
      rows.push([
        q.id,
        order + 1,
        q.category,
        q.question,
        LETTERS[i],
        text,
        i === q.correct,
        st.collected[i],
        st.manual[i],
        st.total[i],
        st.respondents ? Math.round((st.total[i] / st.respondents) * 1000) / 10 : 0,
        st.respondents,
        st.pctCorrect === null ? '' : Math.round(st.pctCorrect * 1000) / 10,
      ]);
    });
  });
  return toCSV(rows);
}

/** One row per anonymous submission. */
export function submissionsCSV(session: SessionData): string {
  const header = ['id_anonyme', 'complet', 'source', 'recu_le', 'bonnes_reponses', 'reponses', 'score_pct', ...QUESTIONS.map((q) => q.id)];
  const rows: (string | number | boolean)[][] = [header];
  for (const s of session.submissions) {
    const sc = scoreOf(s);
    rows.push([
      s.id,
      s.complete,
      s.via,
      new Date(s.receivedAt).toISOString(),
      sc.correct,
      sc.answered,
      Math.round(sc.rate * 1000) / 10,
      ...QUESTIONS.map((q) => (s.answers[q.id] === undefined ? '' : LETTERS[s.answers[q.id]])),
    ]);
  }
  return toCSV(rows);
}

export function aggregatedJSON(session: SessionData, sequence: string[]) {
  return {
    format: 'eureka26-aggregate',
    version: 1,
    exportedAt: new Date().toISOString(),
    submissions: session.submissions.length,
    completed: session.submissions.filter((s) => s.complete).length,
    questions: sequence.map((id) => {
      const q = QUESTION_BY_ID[id];
      const st = questionStats(id, session.submissions, session.manual);
      return {
        id: q.id,
        question: q.question,
        correct: LETTERS[q.correct],
        choices: q.choices.map((text, i) => ({ letter: LETTERS[i], text, collected: st.collected[i], manual: st.manual[i], total: st.total[i] })),
        respondents: st.respondents,
        pctCorrect: st.pctCorrect,
      };
    }),
  };
}
