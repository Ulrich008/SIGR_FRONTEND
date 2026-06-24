import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AlerteService } from '../../../../core/services/alerte.service';
import { AlerteResponse } from '../../../../core/models/alerte.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-alertes-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './alertes-list.component.html'
})
export class AlertesListComponent implements OnInit {
  alertes: AlerteResponse[] = [];
  alertesFiltrees: AlerteResponse[] = [];
  filtreActif: string = 'TOUTES';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  recherche: string = '';

  // Animation pour les cartes
  animationDelay = 0;

  constructor(
    private alerteService: AlerteService,
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      window.location.href = '/auth/login';
      return;
    }
    this.loadAlertes();
  }

  loadAlertes(): void {
    this.loading = true;
    this.error = null;
    this.alerteService.getToutesAlertes().subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.appliquerFiltre(this.filtreActif);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les alertes';
      }
    });
  }

  appliquerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.filtrerEtRechercher();
  }

  onRechercheChange(): void {
    this.filtrerEtRechercher();
  }

  private filtrerEtRechercher(): void {
    let resultats = this.alertes;
    
    // Filtre par sévérité
    if (this.filtreActif !== 'TOUTES') {
      resultats = resultats.filter(a => a.severite === this.filtreActif);
    }
    
    // Filtre par recherche
    if (this.recherche.trim()) {
      const searchTerm = this.recherche.toLowerCase();
      resultats = resultats.filter(a => 
        a.titre.toLowerCase().includes(searchTerm) ||
        a.description.toLowerCase().includes(searchTerm) ||
        a.libelleElement.toLowerCase().includes(searchTerm) ||
        a.libelleProcessus.toLowerCase().includes(searchTerm)
      );
    }
    
    this.alertesFiltrees = resultats;
  }

  compterParSeverite(severite: string): number {
    return this.alertes.filter(a => a.severite === severite).length;
  }

  getCardBorderClass(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return 'alert-card--critique';
      case 'HAUTE':    return 'alert-card--haute';
      case 'MOYENNE':  return 'alert-card--moyenne';
      case 'FAIBLE':   return 'alert-card--faible';
      default:         return '';
    }
  }

  getSeveriteBadgeClass(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return 'badge--critique';
      case 'HAUTE':    return 'badge--haute';
      case 'MOYENNE':  return 'badge--moyenne';
      case 'FAIBLE':   return 'badge--faible';
      default:         return 'badge--default';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'RISQUE_NON_GERE':          return 'badge--risque';
      case 'INDICATEUR_PROCHE_SEUIL':  return 'badge--indicateur';
      default:                          return 'badge--default';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'RISQUE_NON_GERE':         return 'Risque non géré';
      case 'INDICATEUR_PROCHE_SEUIL': return 'Indicateur proche du seuil';
      default:                         return type;
    }
  }

  getSeveriteIcon(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return '🔴';
      case 'HAUTE':    return '🟠';
      case 'MOYENNE':  return '🟡';
      case 'FAIBLE':   return '🔵';
      default:         return '⚪';
    }
  }

  getAnimationStyle(index: number): any {
    return {
      'animation-delay': `${index * 50}ms`,
      'animation-duration': '0.4s',
      'animation-fill-mode': 'both'
    };
  }
}