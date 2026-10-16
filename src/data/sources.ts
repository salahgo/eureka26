import type { Source } from './types';

const VERIFIED = '2026-10-16';

/**
 * Every figure used in the experience points to one of these sources.
 * URLs were opened and the figures re-read on the verification date.
 */
export const SOURCES: Record<string, Source> = {
  'ancs-s1-2026': {
    id: 'ancs-s1-2026',
    publisher: 'ANCS — Agence nationale de la cybersécurité (Tunisie)',
    title: 'Statistiques relatives au cyberespace tunisien — 1er semestre 2026',
    url: 'https://www.ancs.tn/fr/statistiques/statistiques-relatives-au-cyberespace-tunisien-1er-semestre-2026',
    date: '2026-07-20',
    verifiedOn: VERIFIED,
    kind: 'officiel',
    note:
      "Page officielle : 35 000 attaques DDoS détectées, pic de 636 Gbit/s, 657 540 incidents déclarés par le tunCERT (99,83 % « attaques virales »). Le texte annonce 336 avis de sécurité alors que le graphique mensuel totalise 366 : ce chiffre n'est donc pas utilisé dans le questionnaire.",
  },
  'enisa-etl-2026': {
    id: 'enisa-etl-2026',
    publisher: "ENISA — Agence de l'Union européenne pour la cybersécurité",
    title: 'ENISA Threat Landscape 2026',
    url: 'https://www.enisa.europa.eu/sites/default/files/2026-09/ENISA%20Threat%20Landscape%202026_Final.pdf',
    date: '2026-09',
    verifiedOn: VERIFIED,
    kind: 'rapport',
    note:
      '8 257 incidents analysés, du 1er janvier au 31 décembre 2025. DDoS : 51,3 % ; accès non autorisés : 39,5 % ; motivations idéologiques : 57,3 % ; administration publique : 31,8 % des incidents.',
  },
  'cmc-jlr-2025': {
    id: 'cmc-jlr-2025',
    publisher: 'Cyber Monitoring Centre (Royaume-Uni)',
    title: 'Cyber Monitoring Centre Statement on the Jaguar Land Rover Cyber Incident — October 2025',
    url: 'https://cybermonitoringcentre.com/2025/10/22/cyber-monitoring-centre-statement-on-the-jaguar-land-rovercyber-incident-october-2025/',
    date: '2025-10-22',
    verifiedOn: VERIFIED,
    kind: 'rapport',
    note:
      'Événement systémique de catégorie 3. Perte modélisée : 1,9 Md£ (fourchette 1,6–2,1 Md£), plus de 5 000 organisations britanniques affectées. Estimation par scénario, hors pertes liées à la fuite de données et hors activités internationales.',
  },
  'anthropic-espionage-2025': {
    id: 'anthropic-espionage-2025',
    publisher: 'Anthropic',
    title: 'Disrupting the first reported AI-orchestrated cyber espionage campaign',
    url: 'https://www.anthropic.com/news/disrupting-AI-espionage',
    date: '2025-11-13',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note:
      "Campagne détectée mi-septembre 2025, attribuée « avec un haut degré de confiance » à un groupe soutenu par l'État chinois ; une trentaine de cibles ; l'IA aurait exécuté 80 à 90 % de la campagne. Chiffres rapportés par l'éditeur.",
  },
  'anthropic-zero-days-2026': {
    id: 'anthropic-zero-days-2026',
    publisher: 'Anthropic — Frontier Red Team',
    title: 'Evaluating and mitigating the growing risk of LLM-discovered 0-days',
    url: 'https://www.anthropic.com/research/zero-days',
    date: '2026-02-05',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note: "« So far, we've found and validated more than 500 high-severity vulnerabilities » (Claude Opus 4.6, logiciels open source).",
  },
  'anthropic-mozilla-2026': {
    id: 'anthropic-mozilla-2026',
    publisher: 'Anthropic',
    title: "Partnering with Mozilla to improve Firefox's security",
    url: 'https://www.anthropic.com/news/mozilla-firefox-security',
    date: '2026-03-06',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note: '22 vulnérabilités découvertes en deux semaines par Claude Opus 4.6 ; Mozilla en a classé 14 en gravité élevée ; 2 exploits fonctionnels seulement, en environnement de test.',
  },
  'anthropic-glasswing-2026': {
    id: 'anthropic-glasswing-2026',
    publisher: 'Anthropic',
    title: 'Project Glasswing',
    url: 'https://www.anthropic.com/glasswing',
    date: '2026-04-07',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note: 'Lancement le 7 avril 2026 avec Claude Mythos Preview et des partenaires dont AWS, Apple, Cisco, CrowdStrike, Google, Microsoft, NVIDIA et la Linux Foundation.',
  },
  'anthropic-glasswing-update-2026': {
    id: 'anthropic-glasswing-update-2026',
    publisher: 'Anthropic',
    title: 'Project Glasswing: An initial update',
    url: 'https://www.anthropic.com/research/glasswing-initial-update',
    date: '2026-05-22',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note: "Après un mois, environ 50 partenaires avaient trouvé « more than ten thousand high- or critical-severity vulnerabilities ». Chiffres auto-déclarés par les partenaires.",
  },
  'anthropic-cvp-2026': {
    id: 'anthropic-cvp-2026',
    publisher: 'Anthropic',
    title: 'Cyber Verification Program (mise à jour Glasswing)',
    url: 'https://www.anthropic.com/news/cyber-verification-program',
    date: '2026-10-06',
    verifiedOn: VERIFIED,
    kind: 'éditeur',
    note: 'Au moins 129 000 vulnérabilités vérifiées découvertes par les partenaires entre avril et juillet 2026, dont plus de 33 000 critiques ou élevées (probable sous-estimation selon Anthropic).',
  },
};

export const sourceList = (): Source[] => Object.values(SOURCES);

export function getSource(id: string): Source {
  const s = SOURCES[id];
  if (!s) throw new Error(`Source inconnue : ${id}`);
  return s;
}
