import type { CategoryId, Question } from './types';

export const CATEGORIES: Record<CategoryId, { label: string; short: string; color: string }> = {
  tunisie: { label: 'Tunisie', short: 'TN', color: 'var(--color-cyan-400)' },
  international: { label: 'Cybersécurité internationale', short: 'INT', color: 'var(--color-sky-400)' },
  ia: { label: 'IA & cybersécurité 2025–2026', short: 'IA', color: 'var(--color-violet-400)' },
};

/**
 * Question bank. `index` is frozen: it is the position used in participant response codes.
 * Add new questions at the end with the next index; never renumber.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'Q01',
    short: 'Attaques DDoS en Tunisie (S1 2026)',
    index: 1,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question: "Combien d'attaques DDoS ont été détectées en Tunisie durant le premier semestre 2026 ?",
    choices: ['350', '3 500', '35 000', '350 000'],
    correct: 2,
    reveal: '35 000 attaques DDoS détectées en six mois',
    numeric: { value: 35000, caption: 'attaques DDoS détectées en Tunisie — 1er semestre 2026' },
    explanation:
      "L'ANCS a détecté 35 000 attaques par déni de service distribué au premier semestre 2026, soit en moyenne près de 200 attaques par jour.",
    period: '1er semestre 2026 (publication ANCS du 20 juillet 2026)',
    sources: [{ id: 'ancs-s1-2026', locator: 'Encadré « DDoS » — Nombre total des attaques DDoS détectées' }],
    abbreviations: ['DDoS', 'ANCS'],
    managementInsight: 'La disponibilité numérique est devenue une responsabilité stratégique de l\'entreprise.',
    surprise: 5,
  },
  {
    id: 'Q02',
    tag: 'Estimation',
    short: 'Coût de l’attaque JLR',
    index: 2,
    category: 'international',
    beat: 'attaque-internationale',
    difficulty: 3,
    question:
      "Quel a été l'impact économique estimé au Royaume-Uni de la cyberattaque contre Jaguar Land Rover en 2025 ?",
    choices: ['19 millions de livres', '190 millions de livres', '1,9 milliard de livres', '19 milliards de livres'],
    correct: 2,
    reveal: '1,9 milliard de livres : sans doute la cyberattaque la plus coûteuse de l\'histoire du Royaume-Uni',
    numeric: { value: 1.9, decimals: 1, suffix: ' Md£', caption: 'impact économique estimé pour le Royaume-Uni (fourchette 1,6–2,1 Md£)' },
    explanation:
      "Le Cyber Monitoring Centre a classé l'attaque comme événement systémique de catégorie 3 et modélisé une perte de 1,9 milliard de livres (fourchette 1,6 à 2,1 Md£), surtout due à l'arrêt de la production chez JLR et ses fournisseurs pendant plusieurs semaines. Le CMC le décrit comme probablement l'événement cyber le plus dommageable économiquement qu'ait connu le Royaume-Uni.",
    period: 'Fin août – octobre 2025 (déclaration du CMC, octobre 2025)',
    sources: [{ id: 'cmc-jlr-2025' }],
    abbreviations: ['CMC'],
    caveat:
      "Il s'agit d'un impact économique estimé par modélisation, pas de pertes directes auditées de l'entreprise. Il exclut les coûts liés à la fuite de données et les activités hors Royaume-Uni.",
    managementInsight:
      "Le risque cyber d'un fournisseur peut devenir une crise financière et industrielle pour toute une chaîne de valeur.",
    surprise: 5,
  },
  {
    id: 'Q03',
    tag: 'Chiffre éditeur',
    short: 'Espionnage exécuté par l’IA',
    index: 3,
    category: 'ia',
    beat: 'ia',
    difficulty: 2,
    question:
      "Selon Anthropic, quelle proportion des opérations d'une campagne de cyberespionnage menée en 2025 aurait été exécutée par l'IA elle-même ?",
    choices: ['5–10 %', '20–30 %', '40–50 %', '80–90 %'],
    correct: 3,
    reveal: "80 à 90 % d'une campagne d'espionnage exécutés par une IA",
    numeric: { value: 90, prefix: '80–', suffix: ' %', caption: "de la campagne exécutés par l'IA, selon Anthropic" },
    explanation:
      "Anthropic a détecté mi-septembre 2025 une campagne qu'il attribue, avec un haut degré de confiance, à un groupe soutenu par l'État chinois. Les attaquants ont détourné l'outil Claude Code contre une trentaine de cibles ; l'IA aurait exécuté 80 à 90 % de la campagne, l'humain n'intervenant qu'à quelques points de décision. Quelques intrusions ont réussi avant que les comptes soient bloqués.",
    period: 'Septembre 2025 (publication du 13 novembre 2025)',
    sources: [{ id: 'anthropic-espionage-2025' }],
    abbreviations: ['IA agentique', 'LLM'],
    caveat: "Chiffres et attribution publiés par l'éditeur du modèle (Anthropic).",
    managementInsight:
      'Un agent IA doit posséder une identité, des permissions limitées, une traçabilité et un responsable humain.',
    surprise: 5,
  },
  {
    id: 'Q04',
    short: 'Incidents signalés par le tunCERT',
    index: 4,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question: 'Combien d\'incidents le tunCERT a-t-il signalés aux acteurs du cyberespace tunisien au premier semestre 2026 ?',
    choices: ['6 575', '65 754', '657 540', '6,5 millions'],
    correct: 2,
    reveal: '657 540 incidents déclarés par le tunCERT',
    numeric: { value: 657540, caption: 'incidents déclarés par le tunCERT aux acteurs du cyberespace — S1 2026' },
    explanation:
      "Le tunCERT, rattaché à l'ANCS, a déclaré 657 540 incidents aux différents acteurs du cyberespace national, avec un pic en avril (190 961). Ce ne sont ni des entreprises compromises ni des rançongiciels confirmés : ce sont des notifications d'incidents, très majoritairement des infections virales détectées.",
    period: '1er semestre 2026',
    sources: [{ id: 'ancs-s1-2026', locator: 'Incidents déclarés par mois' }],
    abbreviations: ['tunCERT', 'CERT'],
    managementInsight:
      'Un chiffre ne vaut que par sa définition : avant de décider, un manager doit demander « qu\'est-ce qu\'on compte exactement ? ».',
    surprise: 4,
  },
  {
    id: 'Q05',
    short: 'Part des DDoS (ENISA)',
    index: 5,
    category: 'international',
    beat: 'attaque-internationale',
    difficulty: 2,
    question:
      'Selon le rapport ENISA Threat Landscape 2026, quelle proportion des incidents recensés concernait des attaques DDoS ?',
    choices: ['11 %', '31 %', '51 %', '91 %'],
    correct: 2,
    reveal: 'Plus d\'un incident sur deux en Europe est un DDoS',
    numeric: { value: 51.3, decimals: 1, suffix: ' %', caption: 'des 8 257 incidents analysés par l\'ENISA (année 2025)' },
    explanation:
      "Sur 8 257 incidents analysés pour l'année 2025, l'ENISA classe 51,3 % comme attaques DDoS, devant les accès non autorisés (39,5 %). L'agence souligne que ces DDoS, souvent hacktivistes, ont généralement un impact limité, alors que les rançongiciels restent les incidents les plus coûteux.",
    period: 'Incidents du 1er janvier au 31 décembre 2025 (rapport publié en septembre 2026)',
    sources: [{ id: 'enisa-etl-2026', locator: 'Executive Summary et chapitre 1 « Overview & Trends »' }],
    abbreviations: ['ENISA', 'DDoS', 'Hacktivisme'],
    managementInsight:
      'Le volume n\'est pas l\'impact : un tableau de bord cyber doit distinguer le « bruit » des incidents réellement coûteux.',
    surprise: 3,
  },
  {
    id: 'Q06',
    tag: 'Chiffre éditeur',
    short: 'Failles open source (Opus 4.6)',
    index: 6,
    category: 'ia',
    beat: 'ia',
    difficulty: 2,
    question:
      'En février 2026, combien de vulnérabilités de gravité élevée Claude Opus 4.6 avait-il trouvées et validées dans des logiciels open source, selon Anthropic ?',
    choices: ['5', '50', 'Plus de 500', 'Plus de 50 000'],
    correct: 2,
    reveal: 'Plus de 500 failles graves inconnues découvertes dans l\'open source',
    numeric: { value: 500, prefix: '+ de ', caption: 'vulnérabilités de gravité élevée trouvées et validées (février 2026)' },
    explanation:
      "Le 5 février 2026, l'équipe Frontier Red Team d'Anthropic annonçait avoir « trouvé et validé plus de 500 vulnérabilités de gravité élevée » dans des projets open source avec Claude Opus 4.6. Chaque faille a été validée par des chercheurs avant d'être signalée aux mainteneurs.",
    period: 'Février 2026',
    sources: [{ id: 'anthropic-zero-days-2026' }],
    abbreviations: ['SBOM', 'LLM'],
    caveat: "Résultats rapportés par l'éditeur.",
    managementInsight:
      "L'open source est présent dans toutes les chaînes logicielles : inventaire des composants (SBOM) et suivi des correctifs sont des sujets de gouvernance.",
    surprise: 4,
  },
  {
    id: 'Q07',
    short: 'Pic DDoS en Tunisie',
    index: 7,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 3,
    question: 'Quel a été le pic de trafic DDoS rapporté en Tunisie au premier semestre 2026 ?',
    choices: ['36 Gbit/s', '136 Gbit/s', '636 Gbit/s', '6 360 Gbit/s'],
    correct: 2,
    reveal: '636 Gbit/s au plus fort d\'une attaque',
    numeric: { value: 636, suffix: ' Gbit/s', caption: 'pic de volume DDoS rapporté par l\'ANCS — 1er semestre 2026' },
    explanation:
      "Le pic de volume relevé par l'ANCS atteint 636 Gbit/s. Un tel flot dépasse de très loin la capacité de raccordement d'une organisation ordinaire : se protéger suppose des accords en amont avec l'opérateur ou un service de filtrage spécialisé.",
    period: '1er semestre 2026',
    sources: [{ id: 'ancs-s1-2026', locator: 'Pic du volume des attaques : 636 Gbps' }],
    abbreviations: ['DDoS', 'Gbit/s'],
    managementInsight:
      'La protection anti-DDoS se contractualise avant la crise : engagements de l\'opérateur, service de filtrage, plan de continuité.',
    surprise: 4,
  },
  {
    id: 'Q08',
    tag: 'Estimation',
    short: 'Organisations touchées (JLR)',
    index: 8,
    category: 'international',
    beat: 'attaque-internationale',
    difficulty: 2,
    question: 'Combien d\'organisations britanniques ont été économiquement affectées par la cyberattaque de 2025 contre Jaguar Land Rover ?',
    choices: ['50', '500', '1 000', 'Plus de 5 000'],
    correct: 3,
    reveal: 'Plus de 5 000 organisations britanniques touchées par effet domino',
    numeric: { value: 5000, prefix: '+ de ', caption: 'organisations britanniques économiquement affectées (estimation CMC)' },
    explanation:
      "Selon le CMC, plus de 5 000 organisations britanniques ont été économiquement affectées : fournisseurs de tous rangs, concessionnaires, logisticiens, commerces locaux. Il ne s'agit pas de 5 000 entreprises piratées, mais d'un effet domino sur toute la chaîne de valeur.",
    period: 'Fin août – octobre 2025',
    sources: [{ id: 'cmc-jlr-2025' }],
    abbreviations: ['CMC'],
    caveat: 'Organisations affectées économiquement, pas organisations compromises.',
    managementInsight:
      'Cartographier ses dépendances critiques — fournisseurs, sous-traitants, clients — fait partie de la gestion des risques.',
    surprise: 4,
  },
  {
    id: 'Q09',
    short: 'Part des attaques virales',
    index: 9,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question:
      'Quel pourcentage des incidents signalés par le tunCERT appartenait à la catégorie des « attaques virales » ?',
    choices: ['9,83 %', '49,83 %', '79,83 %', '99,83 %'],
    correct: 3,
    reveal: '99,83 % des incidents déclarés sont des attaques virales',
    numeric: { value: 99.83, decimals: 2, suffix: ' %', caption: 'des incidents déclarés par le tunCERT — catégorie « attaques virales »' },
    explanation:
      "Répartition publiée par l'ANCS : attaques virales 99,83 %, disponibilité 0,14 %, autres 0,02 %, scan et collecte d'information 0,01 %. Parmi les logiciels malveillants les plus détectés figurent Gamarue (Andromeda) et Raspberry Robin, des familles anciennes connues pour se propager notamment par clés USB.",
    period: '1er semestre 2026',
    sources: [{ id: 'ancs-s1-2026', locator: 'Incidents déclarés par catégorie (%) et Top malwares' }],
    abbreviations: ['tunCERT'],
    managementInsight:
      "L'hygiène de base (mises à jour, antivirus géré, contrôle des supports amovibles) reste le premier levier — et c'est une décision de moyens, donc de direction.",
    surprise: 3,
  },
  {
    id: 'Q10',
    tag: 'Chiffre éditeur',
    short: 'Project Glasswing',
    index: 10,
    category: 'ia',
    beat: 'ia',
    difficulty: 3,
    question:
      "Un mois après le lancement de Project Glasswing (avril 2026), combien de vulnérabilités de gravité élevée ou critique les partenaires avaient-ils trouvées grâce à l'IA ?",
    choices: ['Plus de 100', 'Plus de 1 000', 'Plus de 10 000', 'Plus de 10 millions'],
    correct: 2,
    reveal: "Plus de 10 000 failles graves trouvées en un mois par l'IA",
    numeric: { value: 10000, prefix: '+ de ', caption: 'vulnérabilités élevées ou critiques — mise à jour du 22 mai 2026' },
    explanation:
      "Lancé le 7 avril 2026 avec le modèle Claude Mythos Preview et des partenaires comme AWS, Apple, Cisco, CrowdStrike, Google, Microsoft ou la Linux Foundation, Project Glasswing vise à sécuriser des logiciels critiques. Le 22 mai, Anthropic indiquait qu'une cinquantaine de partenaires avaient trouvé plus de 10 000 vulnérabilités élevées ou critiques. En octobre 2026, Anthropic faisait état d'au moins 129 000 vulnérabilités vérifiées découvertes d'avril à juillet, dont plus de 33 000 critiques ou élevées.",
    period: 'Avril–mai 2026 (mise à jour d\'octobre 2026 en complément)',
    sources: [{ id: 'anthropic-glasswing-update-2026' }, { id: 'anthropic-glasswing-2026' }, { id: 'anthropic-cvp-2026' }],
    abbreviations: ['CVE', 'LLM'],
    caveat: "Chiffres auto-déclarés par Anthropic et ses partenaires ; la gravité est en partie estimée par le modèle.",
    managementInsight:
      "Le goulot d'étranglement n'est plus la découverte des failles mais leur correction : la vitesse de mise à jour devient un indicateur de direction.",
    surprise: 5,
  },
];

/** Presentation order: Tunisia → international → AI, every question built around a real figure. */
export const DEFAULT_SEQUENCE: string[] = QUESTIONS.map((q) => q.id);

/** Same as the default: the bank is the event's 10 questions. */
export const FULL_SEQUENCE: string[] = [...DEFAULT_SEQUENCE];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const QUESTION_BY_INDEX: Record<number, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.index, q]));
export const MAX_INDEX = Math.max(...QUESTIONS.map((q) => q.index));

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

export function getQuestion(id: string): Question {
  const q = QUESTION_BY_ID[id];
  if (!q) throw new Error(`Question inconnue : ${id}`);
  return q;
}
