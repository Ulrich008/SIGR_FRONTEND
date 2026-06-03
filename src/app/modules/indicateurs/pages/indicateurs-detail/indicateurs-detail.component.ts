import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';
import { IndicateurPerformanceResponse } from '../../../../core/models/indicateur-performance.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-indicateurs-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './indicateurs-detail.component.html'
})
export class IndicateursDetailComponent implements OnInit {
  indicateur: IndicateurPerformanceResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private indicateurService: IndicateurPerformanceService,
    private router: Router,
    private route: ActivatedRoute,
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
    this.loadIndicateur();
  }

  loadIndicateur(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/indicateurs']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.indicateurService.getByCode(code).subscribe({
      next: (indicateur) => {
        this.indicateur = indicateur;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'indicateur';
        this.cdr.detectChanges();
      }
    });
  }

  editIndicateur(): void {
    if (this.indicateur) {
      this.router.navigate(['/indicateurs', this.indicateur.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/indicateurs']);
  }

  // ─── Utilitaires ─────────────────────────────────────────────────────────

  toNumber(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'Plan de mitigation en cours conformément au calendrier':
        return 'bg-green-100 text-green-700';
      case 'Attention : échéance proche, suivi renforcé requis':
        return 'bg-amber-100 text-amber-700';
      case 'Échéance dépassée - Action de mitigation en retard':
        return 'bg-red-100 text-red-700';
      case 'Informations de suivi non disponibles':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getPerformanceColor(valeurObtenue: string | number | undefined, valeurCible: string | number | undefined): string {
    const obtenueNum = typeof valeurObtenue === 'string' ? this.toNumber(valeurObtenue, 0) : (valeurObtenue ?? 0);
    const cibleNum = typeof valeurCible === 'string' ? this.toNumber(valeurCible, 100) : (valeurCible ?? 100);
    if (!obtenueNum || !cibleNum) return 'bg-gray-300';
    const percentage = (obtenueNum / cibleNum) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getPerformancePercentage(valeurObtenue: string | number | undefined, valeurCible: string | number | undefined): number {
    const obtenueNum = typeof valeurObtenue === 'string' ? this.toNumber(valeurObtenue, 0) : (valeurObtenue ?? 0);
    const cibleNum = typeof valeurCible === 'string' ? this.toNumber(valeurCible, 100) : (valeurCible ?? 100);
    if (!obtenueNum || !cibleNum) return 0;
    return (obtenueNum / cibleNum) * 100;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }

  formatValue(value: string | number | undefined, uniteMesure?: string): string {
    const numValue = typeof value === 'string' ? this.toNumber(value, 0) : (value ?? 0);
    if (!uniteMesure) return `${numValue}`;
    
    switch (uniteMesure) {
      case 'Pourcentage':
        return `${numValue}%`;
      case 'Heure':
        return `${numValue}h`;
      case 'Minute':
        return `${numValue}min`;
      case 'Jour':
        return `${numValue}j`;
      case 'Euro':
        return `${numValue}€`;
      case 'Score sur 10':
        return `${numValue}/10`;
      case 'Score sur 100':
        return `${numValue}/100`;
      case 'Mètre cube':
        return `${numValue}m³`;
      case 'Kilogramme':
        return `${numValue}kg`;
      case 'Litre':
        return `${numValue}L`;
      default:
        return `${numValue} ${uniteMesure}`;
    }
  }
}
