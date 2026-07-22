// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../../layout/sidebar/sidebar.component';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly items: MenuItem[] = [
    { icon: 'fas fa-th',                   label: 'Tableau de bord', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
    { icon: 'fas fa-bell',                 label: 'Alertes',         path: '/alertes',   roles: ['SUPER_ADMIN', 'ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
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
      roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-chart-line', label: 'Processus/Mission', path: '/processus', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-exclamation-circle', label: 'Risques', path: '/risques', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-clipboard-list',
      label: 'Évaluations',
      roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-clipboard-check', label: 'Évaluer Risque', path: '/evaluations', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-table', label: 'Matrice', path: '/matrices', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-shield-alt',
      label: 'Mitigation',
      roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        {
          icon: 'fas fa-clipboard-list',
          label: 'Plans de mitigation',
          path: '/plans-mitigation',
          roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR']
        },
        { icon: 'fas fa-tasks', label: 'Actions', path: '/actions', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-chart-simple', label: 'Indicateurs', path: '/indicateurs', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-clipboard-check',
      label: 'Audit',
      roles: ['SUPER_ADMIN', 'AUDITEUR', 'PILOTE', 'CCI', 'CMMR'],
      children: [
        { icon: 'fas fa-file-alt', label: 'Plan d\'audit', path: '/plans-audit', roles: ['SUPER_ADMIN', 'AUDITEUR', 'PILOTE', 'CCI', 'CMMR'] }
      ]
    },
    {
      icon: 'fas fa-map',
      label: 'Cartographie des risques',
      roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-clipboard-list', label: 'Projet de cartographie de risques', path: '/plans-cartographie', roles: ['SUPER_ADMIN', 'RESPONSABLE_RISQUES', 'PILOTE', 'CCI', 'CMMR'] },
        { icon: 'fas fa-clock-rotate-left', label: 'Cartographie différée et rejetée', path: '/cartographie-risques/differees-rejetees', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-check-circle', label: 'Cartographie validée', path: '/cartographie-risques/validees', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-chart-area', label: 'Cartographie définitif des risques', path: '/cartographie-risques', roles: ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
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
