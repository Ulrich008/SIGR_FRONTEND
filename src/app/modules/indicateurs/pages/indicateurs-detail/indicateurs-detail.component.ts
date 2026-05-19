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

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'OK': return 'bg-green-100 text-green-700';
      case 'ALERTE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getPerformanceColor(valeurObtenue: number, valeurCible: number): string {
    if (!valeurObtenue || !valeurCible) return 'bg-gray-300';
    const percentage = (valeurObtenue / valeurCible) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getPerformancePercentage(valeurObtenue: number, valeurCible: number): number {
    if (!valeurObtenue || !valeurCible) return 0;
    return (valeurObtenue / valeurCible) * 100;
  }

  formatDate(date: string): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }
}
