// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../../layout/sidebar/sidebar.component';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly items: MenuItem[] = [
    { icon: 'fas fa-th',                   label: 'Tableau de bord', path: '/dashboard' },
    { icon: 'fas fa-building',             label: 'Structures',      path: '/ministeres' },
    { 
      icon: 'fas fa-sitemap', 
      label: 'Unités administratives', 
      path: '/unite-administrative',
      children: [
        { icon: 'fas fa-building', label: 'Unités administratives', path: '/unite-administrative' },
        { icon: 'fas fa-tags', label: 'Types d\'unités', path: '/unite-administrative/type-unite' }
      ]
    },
    { icon: 'fas fa-chart-line',           label: 'Processus',       path: '/processus' },
    { 
      icon: 'fas fa-exclamation-triangle',
      label: 'Risques',
      children: [
        { icon: 'fas fa-map', label: 'Cartographie des risques', path: '/cartographie-risques' },
        { icon: 'fas fa-exclamation-circle', label: 'Risques', path: '/risques' },
        { icon: 'fas fa-clipboard-check', label: 'Évaluations', path: '/evaluations' }
      ]
    },
    { icon: 'fas fa-table',                label: 'Matrice' },
    { icon: 'fas fa-chart-simple',         label: 'Indicateurs' },
    { icon: 'fas fa-book',                 label: 'Bibliothèque' },
    { 
      icon: 'fas fa-users', 
      label: 'Agents', 
      path: '/agents',
      children: [
        { icon: 'fas fa-user', label: 'Liste des agents', path: '/agents' },
        { icon: 'fas fa-user-tag', label: 'Affectations', path: '/agents/affectations' }
      ]
    },
  ];
}