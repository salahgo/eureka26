import type { GlossaryEntry } from './types';

export const GLOSSARY: Record<string, GlossaryEntry> = {
  DDoS: {
    term: 'DDoS',
    expansion: 'Distributed Denial of Service',
    definition:
      "Attaque par déni de service distribué : des milliers de machines (souvent un botnet) saturent un service pour le rendre indisponible. Rien n'est volé, mais tout s'arrête.",
    domain: 'cyber',
  },
  'Gbit/s': {
    term: 'Gbit/s',
    expansion: 'Gigabit par seconde',
    definition: "Unité de débit : un milliard de bits par seconde. Mesure le volume d'une attaque DDoS volumétrique.",
    domain: 'cyber',
  },
  ANCS: {
    term: 'ANCS',
    expansion: 'Agence nationale de la cybersécurité',
    definition: "Autorité tunisienne de cybersécurité, qui a succédé à l'ANSI. Elle publie les statistiques nationales et héberge le tunCERT.",
    domain: 'institution',
  },
  tunCERT: {
    term: 'tunCERT',
    expansion: 'Tunisian Computer Emergency Response Team',
    definition: "Équipe nationale tunisienne de réponse aux incidents : veille, alertes, avis de sécurité et notification des incidents aux acteurs concernés.",
    domain: 'institution',
  },
  CERT: {
    term: 'CERT / CSIRT',
    expansion: 'Computer Emergency Response Team / Computer Security Incident Response Team',
    definition: 'Équipe chargée de détecter, analyser et coordonner la réponse aux incidents de sécurité.',
    domain: 'cyber',
  },
  INPDP: {
    term: 'INPDP',
    expansion: 'Instance nationale de protection des données personnelles',
    definition: "Autorité tunisienne de protection des données personnelles, à laquelle les fuites de données doivent être signalées.",
    domain: 'institution',
  },
  ENISA: {
    term: 'ENISA',
    expansion: "European Union Agency for Cybersecurity",
    definition: "Agence de l'Union européenne pour la cybersécurité ; publie chaque année le rapport « Threat Landscape ».",
    domain: 'institution',
  },
  NIS2: {
    term: 'NIS2',
    expansion: 'Network and Information Security Directive 2',
    definition: 'Directive européenne (2022/2555) qui renforce les obligations de cybersécurité et rend les organes de direction responsables de la gestion des risques cyber.',
    domain: 'management',
  },
  CMC: {
    term: 'CMC',
    expansion: 'Cyber Monitoring Centre',
    definition: "Organisme britannique indépendant qui classe les cyberévénements systémiques sur une échelle de 1 à 5 et en estime l'impact économique.",
    domain: 'institution',
  },
  Hacktivisme: {
    term: 'Hacktivisme',
    expansion: 'Hacking + activisme',
    definition: 'Cyberattaques motivées par une cause politique ou idéologique, souvent des DDoS revendiqués sur les réseaux sociaux.',
    domain: 'cyber',
  },
  'Rançongiciel': {
    term: 'Rançongiciel',
    expansion: 'Ransomware',
    definition: 'Logiciel malveillant qui chiffre ou vole des données puis exige une rançon. Principale menace financière pour les entreprises.',
    domain: 'cyber',
  },
  'IA agentique': {
    term: 'IA agentique',
    expansion: 'Agentic AI',
    definition:
      "Système d'IA capable d'utiliser des outils et d'agir dans un environnement (envoyer un e-mail, exécuter du code, modifier des données) pour atteindre un objectif, avec plus ou moins d'autonomie.",
    domain: 'ia',
  },
  LLM: {
    term: 'LLM',
    expansion: 'Large Language Model',
    definition: 'Grand modèle de langage : modèle d\'IA entraîné sur de vastes corpus de texte (ex. Claude).',
    domain: 'ia',
  },
  MCP: {
    term: 'MCP',
    expansion: 'Model Context Protocol',
    definition:
      "Protocole ouvert publié par Anthropic fin 2024 pour connecter les applications d'IA à des outils et sources de données (fichiers, bases, API). Confié en décembre 2025 à l'Agentic AI Foundation (Linux Foundation).",
    domain: 'ia',
  },
  CVE: {
    term: 'CVE',
    expansion: 'Common Vulnerabilities and Exposures',
    definition: 'Identifiant public unique attribué à une vulnérabilité connue (ex. CVE-2026-2796).',
    domain: 'cyber',
  },
  SBOM: {
    term: 'SBOM',
    expansion: 'Software Bill of Materials',
    definition: "Inventaire des composants logiciels (dont open source) d'une application : indispensable pour savoir si l'on est concerné par une faille.",
    domain: 'cyber',
  },
  SOC: {
    term: 'SOC',
    expansion: 'Security Operations Center',
    definition: 'Centre opérationnel de sécurité : équipe et outils qui surveillent le système d\'information en continu et traitent les alertes.',
    domain: 'cyber',
  },
  SIEM: {
    term: 'SIEM',
    expansion: 'Security Information and Event Management',
    definition: 'Plateforme qui collecte et corrèle les journaux de sécurité pour détecter les incidents.',
    domain: 'cyber',
  },
  SOAR: {
    term: 'SOAR',
    expansion: 'Security Orchestration, Automation and Response',
    definition: "Solution qui orchestre et automatise la réponse aux incidents (playbooks : isoler un poste, bloquer un compte, ouvrir un ticket…).",
    domain: 'cyber',
  },
  RTO: {
    term: 'RTO',
    expansion: 'Recovery Time Objective',
    definition: "Durée maximale visée pour restaurer un service après un incident (ex. « reprise en 4 h »).",
    domain: 'management',
  },
  RPO: {
    term: 'RPO',
    expansion: 'Recovery Point Objective',
    definition: 'Perte de données maximale tolérée, exprimée en temps (ex. « au plus 1 h de données perdues »). Elle dicte la fréquence des sauvegardes.',
    domain: 'management',
  },
  'PCA / PRA': {
    term: 'PCA / PRA',
    expansion: "Plan de continuité d'activité / Plan de reprise d'activité",
    definition: "Plans qui organisent la poursuite des activités critiques pendant une crise et le redémarrage après sinistre.",
    domain: 'management',
  },
  NIST: {
    term: 'NIST',
    expansion: 'National Institute of Standards and Technology',
    definition: 'Institut américain de normalisation, auteur de référentiels de cybersécurité utilisés dans le monde entier.',
    domain: 'institution',
  },
  'NIST CSF': {
    term: 'NIST CSF 2.0',
    expansion: 'NIST Cybersecurity Framework 2.0',
    definition: 'Cadre de gestion des risques cyber (février 2024) organisé en six fonctions : Govern, Identify, Protect, Detect, Respond, Recover.',
    domain: 'management',
  },
  GRC: {
    term: 'GRC',
    expansion: 'Governance, Risk and Compliance',
    definition: "Gouvernance, gestion des risques et conformité : la démarche qui relie la sécurité aux objectifs, au niveau de risque accepté et aux obligations de l'organisation.",
    domain: 'management',
  },
  RSSI: {
    term: 'RSSI',
    expansion: "Responsable de la sécurité des systèmes d'information",
    definition: "Pilote la stratégie de cybersécurité et conseille la direction (équivalent anglais : CISO).",
    domain: 'management',
  },
  IAM: {
    term: 'IAM',
    expansion: 'Identity and Access Management',
    definition: 'Gestion des identités et des accès : qui est qui, et qui a droit à quoi, du recrutement au départ.',
    domain: 'cyber',
  },
  PAM: {
    term: 'PAM',
    expansion: 'Privileged Access Management',
    definition: 'Gestion des accès à privilèges : protection, contrôle et traçabilité des comptes administrateurs et comptes de service.',
    domain: 'cyber',
  },
  MFA: {
    term: 'MFA',
    expansion: 'Multi-Factor Authentication',
    definition: "Authentification multifacteur : un mot de passe ne suffit pas, il faut une seconde preuve (application, clé physique…).",
    domain: 'cyber',
  },
  'Zero Trust': {
    term: 'Zero Trust',
    expansion: 'Confiance zéro',
    definition: "Modèle de sécurité où aucun accès n'est accordé par défaut : chaque demande est vérifiée explicitement et limitée au strict nécessaire (NIST SP 800-207).",
    domain: 'cyber',
  },
  PQC: {
    term: 'PQC',
    expansion: 'Post-Quantum Cryptography',
    definition: "Cryptographie post-quantique : algorithmes conçus pour résister aux futurs ordinateurs quantiques.",
    domain: 'crypto',
  },
  'ML-KEM': {
    term: 'ML-KEM',
    expansion: 'Module-Lattice-Based Key-Encapsulation Mechanism',
    definition: "Mécanisme d'encapsulation de clés post-quantique normalisé par le NIST (FIPS 203, août 2024).",
    domain: 'crypto',
  },
  'ML-DSA': {
    term: 'ML-DSA',
    expansion: 'Module-Lattice-Based Digital Signature Algorithm',
    definition: 'Algorithme de signature numérique post-quantique normalisé par le NIST (FIPS 204, août 2024).',
    domain: 'crypto',
  },
  HNDL: {
    term: 'HNDL',
    expansion: 'Harvest Now, Decrypt Later',
    definition: "« Collecter maintenant, déchiffrer plus tard » : voler aujourd'hui des données chiffrées pour les déchiffrer quand un ordinateur quantique le permettra.",
    domain: 'crypto',
  },
  'Souveraineté numérique': {
    term: 'Souveraineté numérique',
    expansion: 'Digital sovereignty',
    definition: "Capacité à garder la maîtrise de ses données, de ses clés, de ses outils et de ses décisions opérationnelles, y compris vis-à-vis de ses fournisseurs.",
    domain: 'management',
  },
  'Security by Design': {
    term: 'Security by Design',
    expansion: 'Sécurité dès la conception',
    definition: 'Intégrer la sécurité dès le lancement d\'un projet (exigences, budget, architecture) plutôt que l\'ajouter après coup.',
    domain: 'management',
  },
};

export const glossaryList = (): GlossaryEntry[] =>
  Object.values(GLOSSARY).sort((a, b) => a.term.localeCompare(b.term, 'fr'));
