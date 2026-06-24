// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../../layout/sidebar/sidebar.component';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly items: MenuItem[] = [
    { icon: 'fas fa-th',                   label: 'Tableau de bord', path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
    { 
      icon: 'fas fa-cogs',
      label: 'Configuration',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
      children: [
        { icon: 'fas fa-building', label: 'Structures', path: '/ministeres', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
        { 
          icon: 'fas fa-sitemap', 
          label: 'Unités administratives', 
          path: '/unite-administrative',
          roles: ['ADMIN', 'MANAGER', 'AGENT'],
          children: [
            { icon: 'fas fa-building', label: 'Unités administratives', path: '/unite-administrative', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
            { icon: 'fas fa-tags', label: 'Types d\'unités', path: '/unite-administrative/type-unite', roles: ['ADMIN', 'MANAGER'] }
          ]
        },
        { 
          icon: 'fas fa-users', 
          label: 'Agents', 
          path: '/agents',
          roles: ['ADMIN', 'MANAGER'],
          children: [
            { icon: 'fas fa-user', label: 'Liste des agents', path: '/agents', roles: ['ADMIN', 'MANAGER'] },
            { icon: 'fas fa-user-tag', label: 'Affectations', path: '/agents/affectations', roles: ['ADMIN', 'MANAGER'] }
          ]
        },
        {
          icon: 'fas fa-id-card',      
          label: 'Profils',
          path: '/profils',
          roles: ['ADMIN', 'MANAGER'],
          children: [
            {
              icon: 'fas fa-list-alt',
              label: 'Liste des profils',
              path: '/profils',
              roles: ['ADMIN', 'MANAGER']
            }
          ]
        },
        { icon: 'fas fa-ruler', label: 'Unités de mesure', path: '/unites-mesure', roles: ['ADMIN', 'MANAGER'] }
      ]
    },
    { 
      icon: 'fas fa-exclamation-triangle',
      label: 'Formalisation du risque Inhérent',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
      children: [
        { icon: 'fas fa-chart-line', label: 'Processus', path: '/processus', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
        { icon: 'fas fa-exclamation-circle', label: 'Risques', path: '/risques', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
        { icon: 'fas fa-tasks', label: 'Missions', path: '/missions', roles: ['ADMIN', 'MANAGER', 'AGENT'] }
      ]
    },
    { 
      icon: 'fas fa-clipboard-list',
      label: 'Évaluations',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
      children: [
        { icon: 'fas fa-clipboard-check', label: 'Évaluer Risque', path: '/evaluations', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
        { icon: 'fas fa-table', label: 'Matrice', path: '/matrices', roles: ['ADMIN', 'MANAGER', 'AGENT'] }
      ]
    },
    { 
      icon: 'fas fa-shield-alt',
      label: 'Mitigation',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
      children: [
        { 
          icon: 'fas fa-clipboard-list',
          label: 'Plans de mitigation',
          path: '/plans-mitigation',
          roles: ['ADMIN', 'MANAGER', 'AGENT']
        },
        { icon: 'fas fa-tasks', label: 'Actions', path: '/actions', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
        { icon: 'fas fa-chart-simple', label: 'Indicateurs', path: '/indicateurs', roles: ['ADMIN', 'MANAGER', 'AGENT'] }
      ]
    },
    { 
      icon: 'fas fa-clipboard-check',
      label: 'Audit',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
      children: [
        { icon: 'fas fa-map', label: 'Cartographie des risques', path: '/cartographie-risques', roles: ['ADMIN', 'MANAGER', 'AGENT'] }
      ]
    },
  ];
}