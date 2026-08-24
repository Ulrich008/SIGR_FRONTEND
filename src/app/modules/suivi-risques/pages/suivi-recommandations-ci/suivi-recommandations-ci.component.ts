import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { AuthService } from '../../../../core/services/auth.service';

import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { RapportControleInterneResponse, StatutRapportCI } from '../../../../core/models/controle-interne.model';
import { StatutSuiviRecommandation } from '../../../../core/models/suivi-recommandation.model';

@Component({
  standalone: true,
  selector: 'app-suivi-recommandations-ci',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './suivi-recommandations-ci.component.html'
})
export class SuiviRecommandationsCiComponent implements OnInit {

  menuItems: MenuItem[];

  rapports: RapportControleInterneResponse[] = [];
  filteredRapports: RapportControleInterneResponse[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private rapportService: RapportControleInterneService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.rapportService.getAll().subscribe({
      next: (rapports) => {
        // Seuls les rapports validés par la CCI ont des recommandations
        // définitives à suivre.
        this.rapports = rapports.filter(r => r.statut === StatutRapportCI.VALIDE);
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les recommandations de contrôle interne';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredRapports = !terme
      ? this.rapports
      : this.rapports.filter(r =>
          r.code.toLowerCase().includes(terme) ||
          r.libelleUniteAdministrative?.toLowerCase().includes(terme) ||
          r.libelleProcessus?.toLowerCase().includes(terme)
        );
  }

  voirDetail(code: string): void {
    this.router.navigate(['/suivi-risques/recommandations-ci', code]);
  }

  getStatutLabel(statut?: StatutSuiviRecommandation): string {
    switch (statut) {
      case StatutSuiviRecommandation.NON_ENTAME: return 'Non entamé';
      case StatutSuiviRecommandation.EN_COURS: return 'En cours';
      case StatutSuiviRecommandation.REALISEE: return 'Réalisée';
      case StatutSuiviRecommandation.NON_REALISEE: return 'Non réalisée';
      default: return 'Non renseigné';
    }
  }

  getStatutBadgeClass(statut?: StatutSuiviRecommandation): string {
    switch (statut) {
      case StatutSuiviRecommandation.NON_ENTAME: return 'bg-slate-100 text-slate-600';
      case StatutSuiviRecommandation.EN_COURS: return 'bg-amber-100 text-amber-700';
      case StatutSuiviRecommandation.REALISEE: return 'bg-emerald-100 text-emerald-700';
      case StatutSuiviRecommandation.NON_REALISEE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-400';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
