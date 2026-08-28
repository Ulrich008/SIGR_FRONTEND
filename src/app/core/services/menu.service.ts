// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import {
  GESTION_RISQUE_ROLES,
  GESTION_RISQUE_ROLES_PLUS_CI,
  AUDIT_ROLES,
  PROJET_CARTOGRAPHIE_ROLES,
  CONTROLE_INTERNE_ROLES,
  RAPPORT_CI_ROLES,
  SUIVI_RECOMMANDATIONS_CI_ROLES
} from '../../app.routes';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly items: MenuItem[] = [
    { icon: 'fas fa-th',                   label: 'Tableau de bord', path: '/dashboard', roles: [...GESTION_RISQUE_ROLES_PLUS_CI, 'ADMIN'] },
    { icon: 'fas fa-bell',                 label: 'Alertes',         path: '/alertes',   roles: [...GESTION_RISQUE_ROLES_PLUS_CI, 'ADMIN'] },
    {
      icon: 'fas fa-cogs',
      label: 'Configuration',
      roles: ['ADMIN', 'SUPER_ADMIN'],
      children: [
        { icon: 'fas fa-building', label: 'Structures', path: '/ministeres', roles: ['ADMIN', 'SUPER_ADMIN'] },
        {
          icon: 'fas fa-sitemap',
          label: 'Unités administratives',
          path: '/unite-administrative',
          roles: ['ADMIN', 'SUPER_ADMIN'],
          children: [
            { icon: 'fas fa-building', label: 'Unités administratives', path: '/unite-administrative', roles: ['ADMIN', 'SUPER_ADMIN'] },
            { icon: 'fas fa-tags', label: 'Types d\'unités', path: '/unite-administrative/type-unite', roles: ['ADMIN', 'SUPER_ADMIN'] }
          ]
        },
        {
          icon: 'fas fa-id-card',
          label: 'Profils',
          path: '/profils',
          roles: ['ADMIN', 'SUPER_ADMIN'],
          children: [
            {
              icon: 'fas fa-list-alt',
              label: 'Liste des profils',
              path: '/profils',
              roles: ['ADMIN', 'SUPER_ADMIN']
            }
          ]
        },
        {
          icon: 'fas fa-users',
          label: 'Agents',
          path: '/agents',
          roles: ['ADMIN', 'SUPER_ADMIN'],
          children: [
            { icon: 'fas fa-user', label: 'Liste des agents', path: '/agents', roles: ['ADMIN', 'SUPER_ADMIN'] },
            { icon: 'fas fa-user-tag', label: 'Affectations', path: '/agents/affectations', roles: ['ADMIN', 'SUPER_ADMIN'] }
          ]
        },
        { icon: 'fas fa-ruler', label: 'Unités de mesure', path: '/unites-mesure', roles: ['ADMIN', 'SUPER_ADMIN'] }
      ]
    },
    {
      icon: 'fas fa-exclamation-triangle',
      label: 'Formalisation du risque Inhérent',
      roles: GESTION_RISQUE_ROLES,
      children: [
        { icon: 'fas fa-chart-line', label: 'Processus/Mission', path: '/processus', roles: GESTION_RISQUE_ROLES },
        { icon: 'fas fa-exclamation-circle', label: 'Risques', path: '/risques', roles: GESTION_RISQUE_ROLES }
      ]
    },
    {
      icon: 'fas fa-clipboard-list',
      label: 'Évaluations',
      roles: GESTION_RISQUE_ROLES_PLUS_CI,
      children: [
        { icon: 'fas fa-clipboard-check', label: 'Évaluer Risque', path: '/evaluations', roles: GESTION_RISQUE_ROLES_PLUS_CI },
        { icon: 'fas fa-table', label: 'Matrice', path: '/matrices', roles: GESTION_RISQUE_ROLES_PLUS_CI }
      ]
    },
    {
      icon: 'fas fa-shield-alt',
      label: 'Mitigation',
      roles: GESTION_RISQUE_ROLES_PLUS_CI,
      children: [
        {
          icon: 'fas fa-clipboard-list',
          label: 'Plans de mitigation',
          path: '/plans-mitigation',
          roles: GESTION_RISQUE_ROLES_PLUS_CI
        },
        { icon: 'fas fa-tasks', label: 'Actions', path: '/actions', roles: GESTION_RISQUE_ROLES_PLUS_CI },
        { icon: 'fas fa-chart-simple', label: 'Indicateurs', path: '/indicateurs', roles: GESTION_RISQUE_ROLES_PLUS_CI }
      ]
    },
    {
      icon: 'fas fa-chart-line',
      label: 'Suivi',
      roles: [...new Set([...GESTION_RISQUE_ROLES_PLUS_CI, ...SUIVI_RECOMMANDATIONS_CI_ROLES])],
      children: [
        { icon: 'fas fa-tasks', label: 'Suivi des actions de mitigations', path: '/suivi-risques', roles: GESTION_RISQUE_ROLES_PLUS_CI },
        // Menu "Suivi des recommandations" du document de référence : accès
        // restreint au Contrôleur Interne (statut) et à la CCI (décision).
        { icon: 'fas fa-user-shield', label: 'Suivi des Recommandations des CI', path: '/suivi-risques/recommandations-ci', roles: SUIVI_RECOMMANDATIONS_CI_ROLES },
        { icon: 'fas fa-file-alt', label: 'Suivi des recommandations d\'audit', path: '/suivi-risques/recommandations-audit', roles: GESTION_RISQUE_ROLES_PLUS_CI }
      ]
    },
    {
      icon: 'fas fa-clipboard-check',
      label: 'Audit',
      roles: AUDIT_ROLES,
      children: [
        { icon: 'fas fa-file-alt', label: 'Plan d\'audit', path: '/plans-audit', roles: AUDIT_ROLES }
      ]
    },
    {
      icon: 'fas fa-user-shield',
      label: 'Contrôle Interne',
      roles: CONTROLE_INTERNE_ROLES,
      children: [
        { icon: 'fas fa-magnifying-glass', label: 'Contrôle de second niveau', path: '/controle-interne/controles-second-niveau', roles: CONTROLE_INTERNE_ROLES },
        { icon: 'fas fa-file-lines', label: 'Rapport', path: '/controle-interne/rapports', roles: CONTROLE_INTERNE_ROLES },
        { icon: 'fas fa-paper-plane', label: 'Transmission', path: '/controle-interne/transmission', roles: CONTROLE_INTERNE_ROLES }
      ]
    },
    { icon: 'fas fa-file-shield', label: 'Rapport CI', path: '/rapport-ci', roles: RAPPORT_CI_ROLES },
    {
      icon: 'fas fa-map',
      label: 'Cartographie des risques',
      roles: GESTION_RISQUE_ROLES_PLUS_CI,
      children: [
        { icon: 'fas fa-clipboard-list', label: 'Projet de cartographie de risques', path: '/plans-cartographie', roles: PROJET_CARTOGRAPHIE_ROLES },
        { icon: 'fas fa-clock-rotate-left', label: 'Cartographie différée et rejetée', path: '/cartographie-risques/differees-rejetees', roles: GESTION_RISQUE_ROLES },
        { icon: 'fas fa-check-circle', label: 'Cartographie validée', path: '/cartographie-risques/validees', roles: GESTION_RISQUE_ROLES },
        // Seul sous-écran de Cartographie accessible au Contrôleur Interne
        // (voir cartographie-risques-routing.module.ts pour la restriction
        // équivalente au niveau des routes).
        { icon: 'fas fa-chart-area', label: 'Cartographie définitif des risques', path: '/cartographie-risques', roles: GESTION_RISQUE_ROLES_PLUS_CI }
      ]
    },
  ];

  /**
   * Les items du menu sont un singleton partagé pour toute la durée de
   * vie de l'application (pas seulement d'une session) : l'état
   * "déplié" d'un menu, mis à jour directement sur ces objets par le
   * sidebar, survivrait donc à une déconnexion et s'afficherait tel
   * quel pour le prochain agent qui se connecte. À appeler à chaque
   * connexion/déconnexion pour repartir d'un menu replié.
   */
  resetExpandedState(): void {
    const reset = (items: MenuItem[]) => {
      for (const item of items) {
        item.expanded = false;
        if (item.children) {
          reset(item.children);
        }
      }
    };
    reset(this.items);
  }
}
