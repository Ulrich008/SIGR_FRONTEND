import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueResiduelService } from '../../../../core/services/risque-residuel.service';
import { RisqueResiduelResponse } from '../../../../core/models/risque-residuel.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-residuels-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './risques-residuels-detail.component.html'
})
export class RisquesResiduelsDetailComponent implements OnInit {
  risqueResiduel: RisqueResiduelResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private risqueResiduelService: RisqueResiduelService,
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
    this.loadRisqueResiduel();
  }

  loadRisqueResiduel(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/risques-residuels']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.risqueResiduelService.getByCode(code).subscribe({
      next: (risqueResiduel) => {
        this.risqueResiduel = risqueResiduel;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le risque résiduel';
        this.cdr.detectChanges();
      }
    });
  }

  editRisqueResiduel(): void {
    if (this.risqueResiduel) {
      this.router.navigate(['/risques-residuels', this.risqueResiduel.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/risques-residuels']);
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5) return 'Moyen';
    return 'Faible';
  }

  getNiveauRisqueBadgeClass(niveau: string): string {
    switch (niveau) {
      case 'FAIBLE': return 'bg-green-100 text-green-700';
      case 'MOYEN': return 'bg-yellow-100 text-yellow-700';
      case 'ELEVE': return 'bg-orange-100 text-orange-700';
      case 'CRITIQUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
