// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../../layout/sidebar/sidebar.component';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly items: MenuItem[] = [
    { icon: 'fas fa-th',                   label: 'Tableau de bord', path: '/dashboard', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
    {
      icon: 'fas fa-cogs',
      label: 'Configuration',
      roles: ['ADMIN'],
      children: [
        { icon: 'fas fa-building', label: 'Structures', path: '/ministeres', roles: ['ADMIN'] },
        {
          icon: 'fas fa-sitemap',
          label: 'Unités administratives',
          path: '/unite-administrative',
          roles: ['ADMIN'],
          children: [
            { icon: 'fas fa-building', label: 'Unités administratives', path: '/unite-administrative', roles: ['ADMIN'] },
            { icon: 'fas fa-tags', label: 'Types d\'unités', path: '/unite-administrative/type-unite', roles: ['ADMIN'] }
          ]
        },
        {
          icon: 'fas fa-id-card',
          label: 'Profils',
          path: '/profils',
          roles: ['ADMIN'],
          children: [
            {
              icon: 'fas fa-list-alt',
              label: 'Liste des profils',
              path: '/profils',
              roles: ['ADMIN']
            }
          ]
        },
        {
          icon: 'fas fa-users',
          label: 'Agents',
          path: '/agents',
          roles: ['ADMIN'],
          children: [
            { icon: 'fas fa-user', label: 'Liste des agents', path: '/agents', roles: ['ADMIN'] },
            { icon: 'fas fa-user-tag', label: 'Affectations', path: '/agents/affectations', roles: ['ADMIN'] }
          ]
        },
        { icon: 'fas fa-ruler', label: 'Unités de mesure', path: '/unites-mesure', roles: ['ADMIN'] }
      ]
    },
    {
      icon: 'fas fa-exclamation-triangle',
      label: 'Formalisation du risque Inhérent',
      roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-chart-line', label: 'Processus', path: '/processus', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-exclamation-circle', label: 'Risques', path: '/risques', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-clipboard-list',
      label: 'Évaluations',
      roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-clipboard-check', label: 'Évaluer Risque', path: '/evaluations', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-table', label: 'Matrice', path: '/matrices', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-shield-alt',
      label: 'Mitigation',
      roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        {
          icon: 'fas fa-clipboard-list',
          label: 'Plans de mitigation',
          path: '/plans-mitigation',
          roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR']
        },
        { icon: 'fas fa-tasks', label: 'Actions', path: '/actions', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] },
        { icon: 'fas fa-chart-simple', label: 'Indicateurs', path: '/indicateurs', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-clipboard-check',
      label: 'Audit',
      roles: ['ADMIN', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-file-alt', label: 'Plan d\'audit', path: '/plans-audit', roles: ['ADMIN', 'AUDITEUR'] }
      ]
    },
    {
      icon: 'fas fa-map',
      label: 'Cartographie des risques',
      roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'],
      children: [
        { icon: 'fas fa-clipboard-list', label: 'Projet de cartographie de risques', path: '/plans-cartographie', roles: ['ADMIN', 'RESPONSABLE_RISQUES'] },
        { icon: 'fas fa-chart-area', label: 'Cartographie définitif des risques', path: '/cartographie-risques', roles: ['ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'] }
      ]
    },
  ];
}