import type { CategoryId, Question } from './types';

export const CATEGORIES: Record<CategoryId, { label: string; short: string; color: string }> = {
  tunisie: { label: 'Tunisie', short: 'TN', color: 'var(--color-cyan-400)' },
  international: { label: 'Cybersécurité internationale', short: 'INT', color: 'var(--color-sky-400)' },
  ia: { label: 'IA & cybersécurité 2025–2026', short: 'IA', color: 'var(--color-violet-400)' },
  abreviations: { label: 'Abréviations clés', short: 'ABR', color: 'var(--color-amber-300)' },
  management: { label: 'Management & avenir', short: 'MGT', color: 'var(--color-emerald-400)' },
};

/**
 * Question bank. `index` is frozen: it is the position used in participant response codes.
 * Add new questions at the end with the next index; never renumber.
 */
export const QUESTIONS: Question[] = [
  // ───────────── CATÉGORIE A — TUNISIE ─────────────
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 5,
  },
  {
    id: 'Q02',
    short: 'Pic DDoS en Tunisie',
    index: 2,
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 4,
  },
  {
    id: 'Q03',
    short: 'Le chiffre 657 540 du tunCERT',
    index: 3,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question:
      'Que représente le chiffre de 657 540 publié dans les statistiques tunisiennes de cybersécurité du premier semestre 2026 ?',
    choices: [
      '657 540 entreprises compromises',
      '657 540 rançongiciels confirmés',
      'Des incidents signalés par le tunCERT',
      '657 540 fuites de données confirmées',
    ],
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 4,
  },
  {
    id: 'Q04',
    short: 'Part des attaques virales',
    index: 4,
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 3,
  },
  {
    id: 'Q05',
    short: 'Fuite de données Groupe CRIT',
    index: 5,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question: 'Quel groupe a officiellement confirmé en mai 2026 une fuite de données touchant ses filiales tunisiennes ?',
    choices: ['Airbus', 'Microsoft', 'Groupe CRIT', 'NVIDIA'],
    correct: 2,
    reveal: 'Groupe CRIT : fuite de données chez Crit Tunisie et Crit RH',
    explanation:
      "Par un communiqué du 22 mai 2026, le groupe français CRIT (travail temporaire) a confirmé une fuite de données limitée à Crit Tunisie et Crit RH, deux filiales dont l'activité avait cessé en 2025 après l'interdiction de la sous-traitance de main-d'œuvre. L'incident a été signalé à l'INPDP. Le groupe de rançongiciel « Titan » a revendiqué l'attaque.",
    period: 'Mai 2026',
    sources: [{ id: 'crit-communique-2026' }],
    abbreviations: ['INPDP', 'Rançongiciel'],
    caveat: "La revendication de « Titan » et la nature exacte des données n'ont pas été vérifiées de façon indépendante.",
    managementInsight:
      "Une filiale en sommeil garde des données bien vivantes : fermer une activité, c'est aussi purger et sécuriser ses données.",
    managementTopics: ['Gouvernance cyber'],
    surprise: 3,
  },
  {
    id: 'Q06',
    short: 'Projets numériques publics',
    index: 6,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 3,
    question:
      'Combien de projets de transformation numérique en cours le gouvernement tunisien a-t-il mentionnés en août 2026 ?',
    choices: ['14', '114', '1 140', '11 400'],
    correct: 1,
    reveal: '114 projets numériques publics en cours',
    numeric: { value: 114, caption: 'projets de transformation numérique en cours — communiqué du 15 août 2026' },
    explanation:
      "À l'issue d'un conseil ministériel consacré à la transformation numérique, la Présidence du gouvernement a indiqué que 114 projets étaient en cours, plusieurs dépassant 90 % d'avancement : services en ligne, paiement électronique, identité numérique, fibre optique… et cybersécurité.",
    period: 'Août 2026',
    sources: [{ id: 'pm-114-projets' }],
    abbreviations: ['Security by Design'],
    managementInsight:
      'Chaque service numérique ouvert est aussi une surface d\'attaque : la sécurité se budgète dans le projet, pas après (Security by Design).',
    managementTopics: ['Gouvernance cyber', 'Souveraineté numérique'],
    surprise: 2,
  },

  // ───────────── CATÉGORIE B — INTERNATIONAL ─────────────
  {
    id: 'Q07',
    short: 'Part des DDoS (ENISA)',
    index: 7,
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 3,
  },
  {
    id: 'Q08',
    short: 'Secteur le plus visé (ENISA)',
    index: 8,
    category: 'international',
    beat: 'attaque-internationale',
    difficulty: 1,
    question:
      "Quel secteur représentait près d'un tiers (31,8 %) des incidents recensés dans le rapport ENISA Threat Landscape 2026 ?",
    choices: ['Tourisme', 'Banque', 'Industrie automobile', 'Administration publique'],
    correct: 3,
    reveal: "L'administration publique, premier secteur visé en Europe",
    numeric: { value: 31.8, decimals: 1, suffix: ' %', caption: 'des incidents recensés par l\'ENISA visaient l\'administration publique' },
    explanation:
      "L'administration publique arrive en tête (31,8 %), loin devant les services aux entreprises (8,5 %), le transport (8 %), l'industrie manufacturière (6,9 %) et la finance (5,6 %). Le phénomène est largement porté par des DDoS à motivation idéologique.",
    period: 'Année 2025 (ENISA Threat Landscape 2026)',
    sources: [{ id: 'enisa-etl-2026', locator: 'Top five targeted sectors' }],
    abbreviations: ['ENISA'],
    managementInsight:
      'Les services publics numériques sont des cibles politiques : leur continuité relève de la confiance des citoyens.',
    managementTopics: ['Gouvernance cyber'],
    surprise: 2,
  },
  {
    id: 'Q09',
    short: 'Motivations idéologiques (ENISA)',
    index: 9,
    category: 'international',
    beat: 'geopolitique',
    difficulty: 2,
    question: "Quelle proportion des incidents étudiés par l'ENISA était associée à des motivations idéologiques ?",
    choices: ['7 %', '27 %', '57 %', '97 %'],
    correct: 2,
    reveal: 'La géopolitique pilote la majorité des cyberattaques recensées',
    numeric: { value: 57.3, decimals: 1, suffix: ' %', caption: 'des incidents recensés par l\'ENISA avaient une motivation idéologique' },
    explanation:
      "57,3 % des incidents relevaient d'objectifs idéologiques (hacktivisme lié notamment à la guerre en Ukraine et au Moyen-Orient), environ 29 % de motivations financières et 6,3 % de cyberespionnage. Les motivations financières restent toutefois les plus dommageables à court terme.",
    period: 'Année 2025 (ENISA Threat Landscape 2026)',
    sources: [{ id: 'enisa-etl-2026', locator: 'Breakdown of incidents by assessed objectives' }],
    abbreviations: ['ENISA', 'Hacktivisme'],
    managementInsight:
      'La géopolitique entre dans la salle du conseil : une prise de position publique ou un partenariat peut faire d\'une organisation une cible.',
    managementTopics: ['Souveraineté numérique', 'Gouvernance cyber'],
    surprise: 4,
  },
  {
    id: 'Q10',
    short: 'Coût de l’attaque JLR',
    index: 10,
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
    managementTopics: ['Gouvernance cyber', 'RTO/RPO'],
    surprise: 5,
  },
  {
    id: 'Q11',
    short: 'Organisations touchées (JLR)',
    index: 11,
    category: 'international',
    beat: 'attaque-internationale',
    difficulty: 2,
    question: 'Combien d\'organisations ont été estimées économiquement affectées par cette cyberattaque contre Jaguar Land Rover ?',
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
    managementTopics: ['Gouvernance cyber', 'GRC'],
    surprise: 4,
  },

  // ───────────── CATÉGORIE C — IA ─────────────
  {
    id: 'Q12',
    short: 'Espionnage exécuté par l’IA',
    index: 12,
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
    managementTopics: ['Supervision des agents IA'],
    surprise: 5,
  },
  {
    id: 'Q13',
    short: 'Project Glasswing',
    index: 13,
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
    managementTopics: ['Gouvernance cyber'],
    surprise: 5,
  },
  {
    id: 'Q14',
    short: 'Failles open source (Opus 4.6)',
    index: 14,
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
    managementTopics: ['GRC'],
    surprise: 4,
  },
  {
    id: 'Q15',
    short: 'Failles Firefox (Mozilla)',
    index: 15,
    category: 'ia',
    beat: 'ia',
    difficulty: 3,
    question:
      'Lors d\'une collaboration avec Mozilla (mars 2026), Claude Opus 4.6 a découvert 22 vulnérabilités dans Firefox en deux semaines. Combien ont été classées de gravité élevée ?',
    choices: ['2', '14', '22', '140'],
    correct: 1,
    reveal: '14 failles de gravité élevée dans Firefox en deux semaines',
    numeric: { value: 14, caption: 'vulnérabilités classées « élevées » par Mozilla sur 22 découvertes' },
    explanation:
      "Mozilla a classé 14 des 22 vulnérabilités en gravité élevée. Fait notable : malgré plusieurs centaines de tentatives, l'IA n'a produit un exploit fonctionnel que dans 2 cas, et seulement dans un environnement de test aux protections désactivées. Trouver une faille n'est pas encore savoir l'exploiter.",
    period: 'Mars 2026',
    sources: [{ id: 'anthropic-mozilla-2026' }, { id: 'mozilla-hardening-2026' }],
    abbreviations: ['CVE'],
    caveat: 'Résultats publiés conjointement par l\'éditeur du modèle et par Mozilla.',
    managementInsight:
      "L'IA accélère autant la défense que l'attaque : les organisations qui l'intègrent dans leur cycle de sécurité prennent l'avantage.",
    managementTopics: ['Supervision des agents IA'],
    surprise: 3,
  },

  // ───────────── CATÉGORIE D — ABRÉVIATIONS ─────────────
  {
    id: 'Q16',
    short: 'DDoS',
    index: 16,
    category: 'abreviations',
    beat: 'abreviation',
    difficulty: 1,
    question: 'Que signifie DDoS ?',
    choices: ['Digital Data Operating System', 'Distributed Denial of Service', 'Dynamic Data Online Security', 'Direct Detection of Servers'],
    correct: 1,
    reveal: 'DDoS = Distributed Denial of Service',
    explanation:
      "Un déni de service distribué mobilise des milliers de machines, souvent compromises (botnet), pour saturer un site ou un réseau. Aucune donnée n'est forcément volée, mais le service devient inaccessible.",
    period: 'Notion de référence',
    sources: [{ id: 'cloudflare-ddos' }],
    abbreviations: ['DDoS'],
    managementInsight:
      'Un DDoS ne vole rien mais arrête tout : la bonne question managériale est « combien coûte une heure d\'indisponibilité ? ».',
    managementTopics: ['RTO/RPO'],
    surprise: 1,
  },
  {
    id: 'Q17',
    short: 'MCP',
    index: 17,
    category: 'abreviations',
    beat: 'abreviation',
    difficulty: 2,
    question: "Que signifie MCP dans les applications d'IA ?",
    choices: ['Machine Control Password', 'Main Cloud Protection', 'Model Context Protocol', 'Multi-Computer Processing'],
    correct: 2,
    reveal: 'MCP = Model Context Protocol',
    explanation:
      "Protocole ouvert publié par Anthropic fin 2024 pour connecter les assistants IA à des outils et à des données (fichiers, bases, API). En décembre 2025, il a été confié à l'Agentic AI Foundation, sous l'égide de la Linux Foundation.",
    period: 'Novembre 2024 – décembre 2025',
    sources: [{ id: 'mcp-spec' }, { id: 'anthropic-mcp-aaif' }],
    abbreviations: ['MCP', 'IA agentique'],
    managementInsight:
      "Chaque connecteur MCP donne des mains à l'IA : il doit être inventorié, approuvé et limité au strict nécessaire.",
    managementTopics: ['Supervision des agents IA'],
    surprise: 2,
  },
  {
    id: 'Q18',
    short: 'SOAR / SIEM / SOC',
    index: 18,
    category: 'abreviations',
    beat: 'abreviation',
    difficulty: 2,
    question: 'Quelle solution sert principalement à automatiser et orchestrer la réponse aux incidents ?',
    choices: ['ERP', 'CRM', 'DNS', 'SOAR'],
    correct: 3,
    reveal: 'SOAR = Security Orchestration, Automation and Response',
    explanation:
      "Le SOAR exécute des scénarios de réponse automatisés (isoler un poste, bloquer un compte, ouvrir un ticket). Il complète le SIEM (Security Information and Event Management), qui collecte et corrèle les journaux pour détecter, et le SOC (Security Operations Center), l'équipe qui surveille et décide.",
    period: 'Notion de référence',
    sources: [{ id: 'nist-glossary-soar' }],
    abbreviations: ['SOAR', 'SIEM', 'SOC'],
    managementInsight:
      'Automatiser la réponse fait gagner des minutes décisives, à condition que la direction ait validé à l\'avance les actions autorisées.',
    managementTopics: ['SOC/SIEM/SOAR'],
    surprise: 1,
  },
  {
    id: 'Q19',
    short: 'RTO / RPO',
    index: 19,
    category: 'abreviations',
    beat: 'management',
    difficulty: 2,
    question: 'Quelle distinction entre RTO et RPO est correcte ?',
    choices: [
      'RTO mesure les bénéfices, RPO mesure les dépenses',
      'RTO correspond au chiffrement, RPO au pare-feu',
      'RTO = délai de restauration visé ; RPO = perte de données maximale tolérée',
      'RTO et RPO sont identiques',
    ],
    correct: 2,
    reveal: 'RTO = délai de reprise visé · RPO = perte de données maximale tolérée',
    explanation:
      "Le RTO (Recovery Time Objective) fixe le temps maximal pour rétablir un service ; le RPO (Recovery Point Objective) fixe la quantité maximale de données que l'on accepte de perdre, et donc la fréquence des sauvegardes. Exemple : RTO 4 h, RPO 1 h.",
    period: 'Notion de référence',
    sources: [{ id: 'nist-sp-800-34' }],
    abbreviations: ['RTO', 'RPO', 'PCA / PRA'],
    managementInsight:
      'Ce sont les métiers et la direction qui doivent définir le niveau de perte acceptable, pas seulement les informaticiens.',
    managementTopics: ['RTO/RPO'],
    surprise: 2,
  },
  {
    id: 'Q20',
    short: 'NIST CSF 2.0 — GOVERN',
    index: 20,
    category: 'abreviations',
    beat: 'management',
    difficulty: 2,
    question:
      'Quelle fonction le NIST Cybersecurity Framework 2.0 place-t-il explicitement au cœur de la gestion des risques cyber ?',
    choices: ['Marketing', 'Outsourcing', 'GOVERN — Gouverner', 'Advertising'],
    correct: 2,
    reveal: 'GOVERN : la fonction ajoutée au cœur du NIST CSF 2.0',
    explanation:
      "Publié en février 2024, le NIST CSF 2.0 organise la cybersécurité autour de six fonctions : Govern, Identify, Protect, Detect, Respond et Recover. La nouvelle fonction GOVERN (stratégie, rôles et responsabilités, politique, supervision, chaîne d'approvisionnement) oriente la mise en œuvre de toutes les autres.",
    period: 'Février 2024',
    sources: [{ id: 'nist-csf-2' }],
    abbreviations: ['NIST', 'NIST CSF'],
    managementInsight: "La cybersécurité se gouverne au niveau de la direction et du conseil d'administration.",
    managementTopics: ['NIST CSF', 'Gouvernance cyber'],
    surprise: 2,
  },

  // ───────────── CATÉGORIE E — MANAGEMENT & AVENIR ─────────────
  {
    id: 'Q21',
    short: 'Qui gouverne le risque cyber ?',
    index: 21,
    category: 'management',
    beat: 'management',
    difficulty: 1,
    question: 'Qui doit gouverner le risque cyber dans une entreprise moderne ?',
    choices: [
      'Uniquement le technicien informatique',
      'Uniquement le fournisseur cloud',
      "Uniquement l'éditeur de l'antivirus",
      'La direction, avec le RSSI et les responsables métiers',
    ],
    correct: 3,
    reveal: 'La direction gouverne, avec le RSSI et les métiers',
    explanation:
      "Le risque cyber est un risque d'entreprise. Le RSSI pilote et conseille ; les métiers connaissent la valeur de leurs processus ; la direction arbitre le niveau de risque accepté. En Europe, la directive NIS2 (art. 20) impose même aux organes de direction d'approuver les mesures de gestion des risques cyber et de se former. La démarche s'appuie sur la GRC, l'IAM et le PAM.",
    period: 'Notion de référence (NIS2 : 2022)',
    sources: [{ id: 'nis2-directive', locator: 'Article 20' }, { id: 'nist-csf-2' }],
    abbreviations: ['RSSI', 'GRC', 'IAM', 'PAM', 'NIS2'],
    managementInsight: "Le RSSI éclaire et pilote, mais c'est la direction qui arbitre le niveau de risque accepté.",
    managementTopics: ['Gouvernance cyber', 'GRC', 'IAM/PAM'],
    surprise: 1,
  },
  {
    id: 'Q22',
    short: 'Stratégie pour les années à venir',
    index: 22,
    category: 'management',
    beat: 'management',
    difficulty: 1,
    question: 'Quelle stratégie prépare le mieux une entreprise aux risques cyber des prochaines années ?',
    choices: [
      'Accorder tous les droits administrateur aux agents IA',
      'Remplacer toutes les protections par un chatbot',
      'Attendre une attaque avant d\'investir',
      'Associer Zero Trust, protection des agents IA, résilience, supervision et cryptographie post-quantique',
    ],
    correct: 3,
    reveal: 'Zero Trust + agents IA maîtrisés + résilience + post-quantique',
    explanation:
      "Zero Trust : vérifier explicitement chaque accès et le limiter au nécessaire. Agents IA : identité, permissions minimales, traçabilité. Résilience : PCA/PRA testés. Cryptographie post-quantique : le NIST a publié en août 2024 ML-KEM (FIPS 203) et ML-DSA (FIPS 204).",
    period: 'Situation 2026 et horizon 2030',
    horizon: {
      now: "Aujourd'hui : les normes post-quantiques existent (2024) et des agents IA sont déjà utilisés en attaque comme en défense.",
      projection:
        "Projection : le NIST propose de déprécier RSA et les courbes elliptiques après 2030 et de les interdire après 2035 (projet NIST IR 8547). Ce calendrier peut évoluer ; aucun ordinateur quantique capable de casser ces algorithmes n'est publiquement connu à ce jour.",
    },
    sources: [{ id: 'nist-sp-800-207' }, { id: 'nist-pqc-2024' }, { id: 'nist-ir-8547' }],
    abbreviations: ['Zero Trust', 'ML-KEM', 'ML-DSA', 'PQC', 'IA agentique'],
    managementInsight:
      "La résilience se prépare avant la crise : l'inventaire cryptographique et la gouvernance des agents IA sont des chantiers de 2026, pas de 2030.",
    managementTopics: ['Zero Trust', 'Supervision des agents IA', 'Post-quantique'],
    surprise: 1,
  },

  // ───────────── QUESTIONS COMPLÉMENTAIRES ─────────────
  {
    id: 'Q23',
    short: 'Souveraineté numérique',
    index: 23,
    category: 'management',
    beat: 'geopolitique',
    difficulty: 2,
    question: 'Que signifie réellement la souveraineté numérique pour une organisation ?',
    choices: [
      'Héberger ses données dans le pays, et cela suffit',
      'Interdire tout logiciel étranger',
      'Garder la maîtrise des données, des clés de chiffrement, des accès et des décisions opérationnelles',
      'Utiliser uniquement des logiciels gratuits',
    ],
    correct: 2,
    reveal: 'Souveraineté = maîtrise des données, des clés, des accès et des décisions',
    explanation:
      "La localisation des données n'est qu'un élément. Qui détient les clés de chiffrement ? Qui peut administrer les systèmes ? Peut-on changer de fournisseur ? L'ENISA souligne dans son rapport 2026 que les dépendances numériques (fournisseurs, cloud, logiciels) amplifient l'impact des incidents.",
    period: 'Notion de référence (ENISA, 2026)',
    sources: [{ id: 'enisa-etl-2026', locator: 'Cyber dependencies' }],
    abbreviations: ['Souveraineté numérique'],
    managementInsight:
      "Héberger des données localement ne suffit pas si les outils, les clés et le contrôle opérationnel restent entièrement dépendants d'acteurs externes.",
    managementTopics: ['Souveraineté numérique'],
    surprise: 2,
  },
  {
    id: 'Q24',
    short: 'Zero Trust',
    index: 24,
    category: 'management',
    beat: 'management',
    difficulty: 1,
    question: "Quel principe résume l'approche Zero Trust ?",
    choices: [
      'Faire confiance à tout appareil connecté au réseau interne',
      'Ne jamais faire confiance par défaut : vérifier explicitement chaque accès et le limiter au nécessaire',
      'Supprimer tous les mots de passe',
      'Se déconnecter totalement d\'Internet',
    ],
    correct: 1,
    reveal: 'Zero Trust : « ne jamais faire confiance, toujours vérifier »',
    explanation:
      "Décrit par le NIST (SP 800-207), le Zero Trust abandonne l'idée d'un réseau interne « de confiance » : chaque accès est authentifié, autorisé selon le contexte et limité au strict nécessaire (moindre privilège), en interne comme à distance.",
    period: 'Notion de référence (NIST, 2020)',
    sources: [{ id: 'nist-sp-800-207' }],
    abbreviations: ['Zero Trust', 'MFA'],
    managementInsight: "Le Zero Trust est d'abord un choix d'organisation : qui a besoin d'accéder à quoi, et pourquoi ?",
    managementTopics: ['Zero Trust', 'IAM/PAM'],
    surprise: 1,
  },
  {
    id: 'Q25',
    short: 'PAM',
    index: 25,
    category: 'abreviations',
    beat: 'abreviation',
    difficulty: 2,
    question: 'Que protège en priorité une solution PAM ?',
    choices: [
      'Les imprimantes du siège',
      'Les comptes à privilèges : administrateurs et comptes de service',
      'Le site web marketing',
      'Les factures clients',
    ],
    correct: 1,
    reveal: 'PAM = Privileged Access Management',
    explanation:
      "Le PAM contrôle, trace et protège les accès à privilèges (coffre-fort de mots de passe, sessions enregistrées, accès juste-à-temps). Il complète l'IAM (Identity and Access Management), qui gère les identités et droits de tous les utilisateurs.",
    period: 'Notion de référence',
    sources: [{ id: 'nist-glossary-pam' }],
    abbreviations: ['PAM', 'IAM', 'MFA'],
    managementInsight:
      'Les comptes administrateurs sont les clés du royaume : leur nombre et leur usage doivent être revus régulièrement.',
    managementTopics: ['IAM/PAM'],
    surprise: 1,
  },
  {
    id: 'Q26',
    short: 'Gouvernance d’un agent IA',
    index: 26,
    category: 'ia',
    beat: 'ia',
    difficulty: 1,
    question:
      'Votre entreprise déploie un agent IA capable d\'envoyer des e-mails et de modifier des données. Quelle règle de gouvernance est la plus importante ?',
    choices: [
      'Lui donner les droits administrateur pour qu\'il soit efficace',
      'Lui attribuer une identité propre, des permissions minimales, une journalisation et un responsable humain',
      'Le laisser apprendre seul, sans supervision',
      'Lui confier le mot de passe d\'un employé',
    ],
    correct: 1,
    reveal: 'Agent IA = identité + moindre privilège + traçabilité + responsable humain',
    explanation:
      "L'OWASP classe l'« agentivité excessive » (permissions, fonctionnalités ou autonomie trop larges) parmi les dix principaux risques des applications à base de LLM. Un agent doit être traité comme une identité à part entière, soumise au moindre privilège, journalisée et placée sous la responsabilité d'une personne.",
    period: '2025–2026',
    sources: [{ id: 'owasp-llm-2025' }],
    abbreviations: ['IA agentique', 'IAM', 'LLM'],
    managementInsight:
      "Ce qu'un agent peut faire seul, et ce qui exige une validation humaine, est une décision de direction — pas un paramètre technique.",
    managementTopics: ['Supervision des agents IA', 'IAM/PAM'],
    surprise: 2,
  },
  {
    id: 'Q27',
    short: 'Circulaire tunisienne 2026',
    index: 27,
    category: 'tunisie',
    beat: 'stat-tunisie',
    difficulty: 2,
    question:
      'En septembre 2026, une circulaire de la cheffe du gouvernement a imposé de nouvelles règles aux administrations tunisiennes. Laquelle en fait partie ?',
    choices: [
      'Faire circuler les documents officiels sur WhatsApp',
      "L'authentification multifacteur pour tous les utilisateurs et administrateurs",
      'Partager les comptes d\'accès entre agents',
      'Supprimer les plans de continuité d\'activité',
    ],
    correct: 1,
    reveal: 'MFA obligatoire dans les administrations tunisiennes',
    explanation:
      "La circulaire n° 5 du 2 septembre 2026 impose notamment l'authentification multifacteur, le HTTPS, des audits annuels par des organismes agréés par l'ANCS, la désactivation des comptes inactifs, l'interdiction du partage de comptes et de la circulation des documents officiels via les messageries mobiles, des PCA/PRA à jour et le signalement immédiat des incidents à l'ANCS.",
    period: 'Septembre 2026',
    sources: [{ id: 'pm-circulaire-5-2026' }, { id: 'ecofin-circulaire-2026' }],
    abbreviations: ['MFA', 'ANCS', 'PCA / PRA'],
    managementInsight:
      "Les failles les plus exploitées sont souvent ordinaires : comptes partagés, comptes oubliés, messageries personnelles. Les corriger relève de la discipline managériale.",
    managementTopics: ['IAM/PAM', 'Gouvernance cyber'],
    surprise: 3,
  },
  {
    id: 'Q28',
    short: 'GRC',
    index: 28,
    category: 'abreviations',
    beat: 'abreviation',
    difficulty: 1,
    question: 'Que signifie GRC en cybersécurité ?',
    choices: [
      'Gestion des ressources commerciales',
      'Governance, Risk and Compliance',
      'Global Router Configuration',
      'Groupe de réponse cyber',
    ],
    correct: 1,
    reveal: 'GRC = Governance, Risk and Compliance',
    explanation:
      "La GRC relie la cybersécurité à la stratégie : gouvernance (rôles, décisions, reporting), gestion des risques (identifier, évaluer, traiter) et conformité (lois, normes, contrats comme NIS2 ou ISO/IEC 27001).",
    period: 'Notion de référence',
    sources: [{ id: 'oceg-grc' }],
    abbreviations: ['GRC', 'NIS2'],
    managementInsight: 'Sans GRC, la sécurité reste une liste d\'outils ; avec elle, elle devient une décision d\'entreprise.',
    managementTopics: ['GRC'],
    surprise: 1,
  },
  {
    id: 'Q29',
    short: 'Cryptographie post-quantique',
    index: 29,
    category: 'management',
    beat: 'management',
    difficulty: 3,
    question: 'Pourquoi préparer dès maintenant la migration vers la cryptographie post-quantique ?',
    choices: [
      'Parce que les ordinateurs quantiques cassent déjà tous les chiffrements',
      'Parce que des données volées aujourd\'hui pourraient être déchiffrées demain',
      'Parce que le quantique va remplacer Internet',
      'Il n\'y a aucune raison de s\'y préparer',
    ],
    correct: 1,
    reveal: '« Collecter maintenant, déchiffrer plus tard »',
    explanation:
      "Le risque « harvest now, decrypt later » concerne les données à longue durée de vie (santé, contrats, secrets industriels). Le NIST a publié ses premières normes post-quantiques en août 2024 et le NCSC britannique recommande un inventaire et un plan de migration d'ici 2028.",
    period: 'Normes 2024 — horizon 2028–2035',
    horizon: {
      now: "Aujourd'hui : normes ML-KEM et ML-DSA publiées ; aucun ordinateur quantique capable de casser RSA n'est publiquement connu.",
      projection: 'Projection : jalons recommandés par le NCSC — 2028 (inventaire et plan), 2031 (migrations prioritaires), 2035 (migration complète).',
    },
    sources: [{ id: 'nist-pqc-2024' }, { id: 'ncsc-pqc' }],
    abbreviations: ['PQC', 'HNDL', 'ML-KEM', 'ML-DSA'],
    managementInsight:
      "Les données à longue durée de vie doivent migrer en premier : l'inventaire cryptographique commence maintenant.",
    managementTopics: ['Post-quantique'],
    surprise: 3,
  },
];

/** Default 16-question presentation sequence, alternating Tunisia → management → international → AI → geopolitics. */
export const DEFAULT_SEQUENCE: string[] = [
  'Q01', // stat Tunisie
  'Q21', // management
  'Q10', // attaque internationale
  'Q12', // IA
  'Q09', // géopolitique
  'Q03', // stat Tunisie
  'Q19', // management
  'Q11', // attaque internationale
  'Q13', // IA
  'Q23', // souveraineté
  'Q02', // stat Tunisie
  'Q20', // management
  'Q07', // attaque internationale
  'Q26', // IA
  'Q05', // stat Tunisie
  'Q22', // management & avenir
];

/** Full-bank sequence (all questions) keeping the same alternating rhythm. */
export const FULL_SEQUENCE: string[] = [
  ...DEFAULT_SEQUENCE,
  'Q04',
  'Q16',
  'Q08',
  'Q14',
  'Q27',
  'Q18',
  'Q24',
  'Q15',
  'Q17',
  'Q06',
  'Q25',
  'Q29',
  'Q28',
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const QUESTION_BY_INDEX: Record<number, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.index, q]));
export const MAX_INDEX = Math.max(...QUESTIONS.map((q) => q.index));

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

export function getQuestion(id: string): Question {
  const q = QUESTION_BY_ID[id];
  if (!q) throw new Error(`Question inconnue : ${id}`);
  return q;
}
