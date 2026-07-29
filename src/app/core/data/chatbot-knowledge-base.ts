/**
 * Base de connaissances de l'assistant SIGR.
 *
 * Assistant d'aide "hors-ligne" : aucune clé API, aucun appel réseau.
 * Chaque entrée est mise en correspondance avec le message de
 * l'utilisateur via un score de mots-clés (voir chatbot.service.ts).
 *
 * Ce contenu reflète le guide d'utilisation (src/assets/guide/index.html) :
 * garder les deux synchronisés en cas d'évolution des fonctionnalités.
 */
export interface ChatbotEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  anchor?: string;
}

export const CHATBOT_KNOWLEDGE_BASE: ChatbotEntry[] = [
  {
    id: 'connexion',
    keywords: ['connecter', 'connexion', 'login', 'se connecter', 'mot de passe', 'matricule', 'identifiant', 'authentification'],
    question: 'Comment me connecter ?',
    answer: "L'accès se fait avec un **matricule** et un **mot de passe** fournis par votre administrateur. Aucune auto-inscription n'est possible : seul un agent ADMIN ou SUPER_ADMIN peut créer un compte. Mot de passe oublié ? Contactez l'administrateur de votre ministère.",
    anchor: 'connexion'
  },
  {
    id: 'interface',
    keywords: ['interface', 'menu', 'sidebar', 'barre laterale', 'naviguer', 'navigation', 'ou trouver'],
    question: "Comment fonctionne l'interface ?",
    answer: "Trois zones structurent SIGR : le **menu latéral** à gauche (regroupé par rubrique, cliquez sur une rubrique pour la déplier), la **barre supérieure** (guide, notifications, déconnexion, votre profil) et la **zone de contenu** au centre. Le menu affiché dépend de votre rôle et de votre profil.",
    anchor: 'interface'
  },
  {
    id: 'roles-profils',
    keywords: ['role', 'profil', 'super_admin', 'admin', 'agent', 'cmmr', 'cci', 'pilote', 'responsable_risques', 'responsable_action', 'auditeur', 'permission', 'droit', 'acces'],
    question: 'Quels sont les rôles et profils ?',
    answer: "SIGR combine un **rôle technique** (SUPER_ADMIN, ADMIN ou AGENT) et un **profil métier** obligatoire pour les AGENT (RESPONSABLE_RISQUES, PILOTE, CCI, CMMR, RESPONSABLE_ACTION ou AUDITEUR). Ce que vous voyez et pouvez faire dépend des deux : un bouton grisé signifie simplement que l'action n'est pas autorisée pour votre profil.",
    anchor: 'roles'
  },
  {
    id: 'bouton-grise',
    keywords: ['bouton grise', 'grise', 'desactive', 'pas acces', 'ne fonctionne pas', 'bloque'],
    question: 'Pourquoi un bouton est-il grisé ?',
    answer: "Votre rôle ou profil métier ne dispose pas des droits nécessaires pour cette action précise. Ce n'est pas une erreur technique : c'est le contrôle d'accès qui protège les données.",
    anchor: 'faq'
  },
  {
    id: 'creer-agent',
    keywords: ['creer agent', 'nouvel agent', 'ajouter agent', 'nouveau compte agent', 'inscrire agent'],
    question: 'Comment créer un agent ?',
    answer: "Menu **Configuration → Agents**, réservé aux ADMIN et SUPER_ADMIN. Cliquez sur « Nouvel agent », renseignez l'état civil, choisissez le ministère et l'unité administrative, puis (si le rôle est AGENT) un profil métier obligatoire. Un export PDF filtrable par ministère/unité est aussi disponible depuis cette liste.",
    anchor: 'agents'
  },
  {
    id: 'desactiver-agent',
    keywords: ['desactiver agent', 'reactiver agent', 'bloquer connexion', 'empecher de se connecter', 'compte inactif', 'suspendre un agent'],
    question: 'Comment désactiver un agent ?',
    answer: "Dans la liste des agents, l'icône **orange** (colonne Actions) désactive le compte — il ne peut alors plus se connecter, mais tout son historique est conservé. Elle devient **verte** pour le réactiver. Préférez toujours cette option à la suppression définitive si l'agent peut revenir.",
    anchor: 'agents'
  },
  {
    id: 'suppression-impossible',
    keywords: ['suppression impossible', 'ne peux pas supprimer', 'erreur suppression', 'suppression refusee', 'element encore utilise', 'cle etrangere'],
    question: 'Pourquoi je ne peux pas supprimer un élément ?',
    answer: "Un ministère, un agent ou un processus encore rattaché à d'autres données (unités, notifications, risques, actions…) ne peut pas être supprimé tant que ces éléments dépendants existent : un message l'indique clairement. Traitez ou réaffectez d'abord ces éléments, ou préférez la désactivation quand elle existe (cas des agents).",
    anchor: 'faq'
  },
  {
    id: 'affectations',
    keywords: ['affectation', 'poste', 'historique poste', 'changer de poste'],
    question: "Qu'est-ce qu'une affectation ?",
    answer: "Menu **Configuration → Agents → Affectations**. Une affectation trace l'historique des postes occupés par un agent dans une unité (poste, date de début, date de fin) — distinct de l'unité de rattachement principale de sa fiche. Une date de fin ne signifie pas que l'agent a quitté le système : elle peut simplement marquer la fin d'un poste avant une nouvelle affectation.",
    anchor: 'affectations'
  },
  {
    id: 'profils-crud',
    keywords: ['creer profil', 'nouveau profil', 'gerer profil', 'liste des profils'],
    question: 'Comment gérer les profils métier ?',
    answer: "Menu **Configuration → Profils** (ADMIN, SUPER_ADMIN). C'est ici que sont définis les profils métier (code, libellé, description) proposés à la création d'un agent.",
    anchor: 'profils-crud'
  },
  {
    id: 'ministeres',
    keywords: ['ministere', 'creer ministere', 'structure', 'nouveau ministere'],
    question: 'Comment créer un ministère ?',
    answer: "Menu **Configuration → Structures**, réservé au SUPER_ADMIN. Cliquez sur « Nouveau ministère » puis renseignez code, libellé, sigle et description. Rappel : chaque ministère est cloisonné, sauf pour le SUPER_ADMIN qui a une vue transversale. Sa suppression est définitive et refusée tant qu'une unité administrative y est encore rattachée.",
    anchor: 'ministeres'
  },
  {
    id: 'unites-administratives',
    keywords: ['unite administrative', 'creer unite', 'nouvelle unite', 'hierarchie', 'unite parent'],
    question: 'Comment créer une unité administrative ?',
    answer: "Menu **Configuration → Unités administratives** (ADMIN, SUPER_ADMIN). Renseignez sigle, libellé, type d'unité et ministère de rattachement. Une unité parent optionnelle permet de construire la hiérarchie (le niveau se calcule automatiquement).",
    anchor: 'ministeres'
  },
  {
    id: 'types-unites',
    keywords: ['type unite', 'type d\'unite', 'direction generale', 'secretariat general'],
    question: "Qu'est-ce qu'un type d'unité ?",
    answer: "Menu **Configuration → Unités administratives → Types d'unités**. Ces types (Direction Générale, Secrétariat Général…) qualifient chaque unité administrative et sont choisis lors de sa création.",
    anchor: 'ministeres'
  },
  {
    id: 'unites-mesure',
    keywords: ['unite de mesure', 'unite mesure', 'symbole', 'mesure kpi'],
    question: "Qu'est-ce qu'une unité de mesure ?",
    answer: "Menu **Configuration → Unités de mesure**. Définit les unités (numériques ou dates) utilisées pour les indicateurs de performance. Attention : la création n'est pas ouverte depuis l'interface — si la liste est vide, contactez le SUPER_ADMIN.",
    anchor: 'unites-mesure'
  },
  {
    id: 'processus',
    keywords: ['processus', 'mission', 'creer processus', 'nouveau processus', 'finalite'],
    question: 'Comment créer un processus ?',
    answer: "Menu **Formalisation du risque inhérent → Processus/Mission**. Cliquez sur « Nouveau processus », renseignez le libellé, le type, l'unité administrative propriétaire, et au moins une finalité (obligatoire). Le propriétaire (un manager au profil Pilote de processus) est également obligatoire. Dans la liste, 3 icônes permettent de consulter, modifier ou supprimer un processus — la suppression est bloquée s'il a déjà des risques, indicateurs ou plans d'audit rattachés.",
    anchor: 'processus'
  },
  {
    id: 'risques',
    keywords: ['risque', 'creer risque', 'nouveau risque', 'formaliser risque', 'cause probable', 'consequence', 'bonne pratique'],
    question: 'Comment créer un risque ?',
    answer: "Menu **Formalisation du risque inhérent → Risques**. Sélectionnez le processus et le type de risque, décrivez-le (libellé, date d'identification, statut), puis ajoutez au moins une cause probable, une conséquence probable et une bonne pratique (Prévention ou Protection). Le risque démarre à l'étape **Formalisation** du circuit de validation.",
    anchor: 'processus'
  },
  {
    id: 'evaluations',
    keywords: ['evaluation', 'evaluer risque', 'impact', 'probabilite', 'criticite', 'noter un risque'],
    question: 'Comment évaluer un risque ?',
    answer: "Menu **Évaluations → Évaluer Risque**. Sélectionnez le risque, renseignez l'impact et la probabilité inhérents (1 à 5), décrivez les bonnes pratiques existantes/manquantes et indiquez si le risque est déjà survenu. Le score inhérent (impact × probabilité) est classé Faible (1-7), Moyen (8-14) ou Élevé (15-25).",
    anchor: 'evaluations'
  },
  {
    id: 'matrice',
    keywords: ['matrice', 'heatmap', 'carte de chaleur', 'niveau de risque', 'faible moyen eleve'],
    question: "Qu'est-ce que la matrice des risques ?",
    answer: "Menu **Évaluations → Matrice**. Vue croisée probabilité × impact de tous les risques évalués, colorée par criticité (faible/moyen/élevé). Cliquez sur une case pour voir le détail des risques concernés — seules les cases contenant au moins une évaluation sont affichées dans le détail.",
    anchor: 'matrice'
  },
  {
    id: 'mitigation',
    keywords: ['mitigation', 'plan de mitigation', 'creer plan', 'nouveau plan'],
    question: 'Comment créer un plan de mitigation ?',
    answer: "Menu **Mitigation → Plans de mitigation**. Cliquez sur « Nouveau plan », renseignez le libellé, la date de création, le risque associé et une description. Le statut (Planifié, En cours, Terminé) se calcule automatiquement selon les actions liées ; seul le CCI peut le faire passer à Clôturé.",
    anchor: 'mitigation'
  },
  {
    id: 'actions',
    keywords: ['action', 'creer action', 'nouvelle action', 'action corrective', 'responsable action'],
    question: 'Comment créer une action ?',
    answer: "Menu **Mitigation → Actions**. Sélectionnez le plan de mitigation, le risque associé et la bonne pratique inexistante visée (obligatoire, issue des contrôles inexistants de l'évaluation), ajoutez un ou plusieurs libellés d'actions (obligatoire), un statut (En cours, Terminée, En retard, Annulée), des dates et un responsable. Un filtre par plan de mitigation est disponible sur la liste.",
    anchor: 'mitigation'
  },
  {
    id: 'indicateurs',
    keywords: ['indicateur', 'kpi', 'creer indicateur', 'nouvel indicateur', 'seuil alerte', 'valeur cible'],
    question: 'Comment créer un indicateur de performance ?',
    answer: "Menu **Mitigation → Indicateurs**. Renseignez le libellé et la fréquence, rattachez-le à un processus/risque/plan/action, choisissez une unité de mesure, puis définissez dates, seuil d'alerte, valeur cible et valeur obtenue. Si aucune unité de mesure n'est disponible, contactez le SUPER_ADMIN. La page affiche aussi un tableau de bord : compteurs par statut (Objectif atteint, En cours, Attention, En retard — dès que la valeur obtenue atteint la valeur cible, le statut passe à Objectif atteint quelles que soient les dates), graphiques valeurs vs cibles et jauge circulaire par indicateur.",
    anchor: 'mitigation'
  },
  {
    id: 'cartographie-circuit',
    keywords: ['cartographie', 'circuit', 'valider', 'differer', 'rejeter', 'transmettre', 'motif', 'workflow', 'validation', 'etape'],
    question: 'Comment fonctionne le circuit de validation ?',
    answer: "Un risque formalisé suit le circuit **Responsable des risques → Pilote → CCI → CMMR** (validation finale). Le Responsable des risques **transmet** les risques cochés depuis « Projet de cartographie de risques » — un risque doit d'abord avoir été **évalué** (au moins une évaluation) pour y apparaître et pouvoir être transmis. À chaque étape, Pilote/CCI/CMMR peuvent **Valider** (avance à l'étape suivante), **Différer** (retour à l'étape précédente, motif obligatoire) ou **Rejeter** (clôture définitive, motif obligatoire).",
    anchor: 'cartographie'
  },
  {
    id: 'cartographie-vues',
    keywords: ['cartographie differee', 'cartographie rejetee', 'cartographie validee', 'cartographie definitif', 'retrouver dossier'],
    question: "Où retrouver mes dossiers de cartographie ?",
    answer: "Trois vues : **Cartographie définitif des risques** (uniquement les dossiers ayant reçu la validation finale du CMMR, avec compteurs par avis), **Cartographie différée et rejetée** (dossiers renvoyés en arrière ou clôturés, avec motif) et **Cartographie validée** (validés à une étape intermédiaire — Pilote ou CCI — mais pas encore par le CMMR). Le bouton « Cartographie définitive » génère le document final en Excel (par unité administrative ou global), avec un choix d'année (ou « Toutes les années »).",
    anchor: 'cartographie'
  },
  {
    id: 'differe-erreur',
    keywords: ['differe par erreur', 'annuler differe', 'erreur validation', 'me suis trompe'],
    question: "J'ai différé un risque par erreur, que faire ?",
    answer: "Le dossier revient simplement à l'étape précédente du circuit. La personne responsable de cette étape peut le re-transmettre normalement — aucune action de rattrapage spéciale n'est nécessaire.",
    anchor: 'faq'
  },
  {
    id: 'plan-audit',
    keywords: ['plan audit', 'audit', 'mission audit', 'creer audit'],
    question: 'Comment créer un plan d\'audit ?',
    answer: "Menu **Audit → Plan d'audit**. Renseignez le libellé, la date de création, l'unité administrative, puis en pré-planification le processus, le risque inhérent, le type d'audit, le type de revue, l'objectif et l'effort indicatif. Le choix du processus n'est possible qu'après avoir sélectionné l'unité administrative, et le risque inhérent qu'après le processus.",
    anchor: 'audit'
  },
  {
    id: 'alertes',
    keywords: ['alerte', 'notification', 'cloche', 'echeance', 'centre de notifications', 'non lu', 'marquer comme lu'],
    question: 'Où voir mes notifications ?',
    answer: "Menu **Alertes** ou icône **cloche** (avec compteur des non-lues) dans la barre supérieure. Chaque notification vous est adressée personnellement selon votre rôle/profil et votre étape dans le circuit. Cliquez dessus pour l'ouvrir (elle passe alors en lu) et accéder à l'élément concerné, ou utilisez **« Tout marquer comme lu »**.",
    anchor: 'alertes'
  },
  {
    id: 'notifications-ciblage',
    keywords: ['qui recoit', 'destinataire notification', 'pourquoi je recois', 'risque en attente', 'attente de validation'],
    question: 'Qui reçoit quelles notifications ?',
    answer: "Cinq situations génèrent une notification : risque sans plan de mitigation ou sans action en cours (Responsable des risques/d'action), seuil ou échéance d'indicateur (Responsable d'action), et **risque en attente de votre décision** (Pilote, CCI ou CMMR selon l'étape). Les notifications Critique/Haute sont aussi envoyées par email si votre fiche agent en a une.",
    anchor: 'alertes'
  },
  {
    id: 'mon-profil',
    keywords: ['mon profil', 'avatar', 'mes informations', 'mon compte'],
    question: 'Comment voir mon profil ?',
    answer: "Cliquez sur votre **avatar** (initiales, en haut à droite) pour ouvrir « Mon profil » : matricule, rôle, profil métier, ministère et unité de rattachement.",
    anchor: 'profil'
  },
  {
    id: 'cloisonnement',
    keywords: ['autre ministere', 'cloisonnement', 'donnees manquantes', 'ne vois pas les donnees'],
    question: "Je ne vois pas les données d'un autre ministère, est-ce normal ?",
    answer: "Oui, c'est normal. Sauf pour un SUPER_ADMIN, chaque compte est cloisonné à son propre ministère par sécurité.",
    anchor: 'faq'
  },
  {
    id: 'obtenir-compte',
    keywords: ['obtenir un compte', 'nouveau compte', 'creer mon compte', 'inscription', 'pas de compte'],
    question: 'Comment obtenir un compte ?',
    answer: "Seul un agent ADMIN de votre ministère ou le SUPER_ADMIN peut créer votre compte, depuis **Configuration → Agents**. Il n'y a pas d'auto-inscription.",
    anchor: 'faq'
  },
  {
    id: 'guide-complet',
    keywords: ['guide', 'documentation', 'aide complete', 'tutoriel', 'manuel'],
    question: 'Où trouver le guide complet ?',
    answer: "Cliquez sur l'icône livre **« Guide d'utilisation »** dans la barre supérieure : il s'ouvre dans un nouvel onglet avec toutes les procédures détaillées et des captures d'écran.",
    anchor: 'intro'
  }
];

/** Message affiché quand aucune entrée ne correspond suffisamment à la question. */
export const CHATBOT_FALLBACK_ANSWER =
  "Je n'ai pas trouvé de réponse précise à cette question dans le guide. " +
  "Essayez de la reformuler, ou ouvrez le guide complet pour une recherche détaillée.";

/** Message d'accueil affiché à l'ouverture du chat. */
export const CHATBOT_WELCOME_MESSAGE =
  "Bonjour 👋 Je suis l'assistant SIGR. Posez-moi une question sur l'utilisation de la plateforme " +
  "(connexion, création d'un risque, circuit de validation, rôles...) ou choisissez une suggestion ci-dessous.";

/** Suggestions affichées comme "chips" au démarrage de la conversation. */
export const CHATBOT_SUGGESTIONS: string[] = [
  'Comment créer un risque ?',
  'Comment fonctionne le circuit de validation ?',
  'Pourquoi un bouton est grisé ?',
  'Comment créer un agent ?'
];
