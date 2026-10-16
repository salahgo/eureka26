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
  ENISA: {
    term: 'ENISA',
    expansion: "European Union Agency for Cybersecurity",
    definition: "Agence de l'Union européenne pour la cybersécurité ; publie chaque année le rapport « Threat Landscape ».",
    domain: 'institution',
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
};

export const glossaryList = (): GlossaryEntry[] =>
  Object.values(GLOSSARY).sort((a, b) => a.term.localeCompare(b.term, 'fr'));
