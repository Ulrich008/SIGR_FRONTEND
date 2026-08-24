import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';

import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { AuthService } from '../../../../core/services/auth.service';

import { AvisHistoriqueResponse, AvisRisque, RisqueResponse } from '../../../../core/models/risque.model';

@Component({
  standalone: true,
  selector: 'app-risques-historique-avis',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './risques-historique-avis.component.html'
})
export class RisquesHistoriqueAvisComponent implements OnInit {

  risque: RisqueResponse | null = null;
  code: string | null = null;

  loading = false;
  error: string | null = null;

  /** Historique des avis de validation (Transmis, Validé, Différé, Rejeté) de ce risque. */
  historiqueAvis: AvisHistoriqueResponse[] = [];
  loadingHistoriqueAvis = false;

  menuItems: MenuItem[];

  constructor(
    private risqueService: RisqueService,
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

    this.code = this.route.snapshot.paramMap.get('code');

    if (!this.code) {
      this.router.navigate(['/risques']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.risqueService.getByCode(this.code).subscribe({
      next: (risque) => {
        this.risque = risque;
        this.loading = false;
        this.cdr.detectChanges();
        this.loadHistoriqueAvis(risque.code);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le risque';
        this.cdr.detectChanges();
      }
    });
  }

  private loadHistoriqueAvis(codeRisque: string): void {
    this.loadingHistoriqueAvis = true;

    this.risqueService.getHistoriqueAvis(codeRisque).subscribe({
      next: (historiqueAvis) => {
        this.historiqueAvis = historiqueAvis;
        this.loadingHistoriqueAvis = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingHistoriqueAvis = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvisLabel(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'Validé';
      case AvisRisque.DIFFERE: return 'Différé';
      case AvisRisque.REJETE: return 'Rejeté';
      case AvisRisque.EN_ATTENTE: return 'Transmis, en attente d\'avis';
      default: return '—';
    }
  }

  getAvisBadgeClass(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'bg-green-100 text-green-700';
      case AvisRisque.DIFFERE: return 'bg-yellow-100 text-yellow-700';
      case AvisRisque.REJETE: return 'bg-red-100 text-red-700';
      case AvisRisque.EN_ATTENTE: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  goBack(): void {
    this.router.navigate(['/risques', this.code]);
  }
}
