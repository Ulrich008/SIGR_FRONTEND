import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, AvisRisque } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cartographie-differees-rejetees',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './cartographie-differees-rejetees.component.html'
})
export class CartographieDiffereesRejeteesComponent implements OnInit {
  risques: RisqueResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  showMotifModal = false;
  selectedRisque: RisqueResponse | null = null;

  constructor(
    private risqueService: RisqueService,
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
    this.loadRisques();
  }

  loadRisques(): void {
    this.loading = true;
    this.error = null;
    this.risqueService.getAll().subscribe({
      next: (data) => {
        this.risques = data.filter(
          r => r.avis === AvisRisque.DIFFERE || r.avis === AvisRisque.REJETE
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  getAvisBadgeClass(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.DIFFERE: return 'bg-yellow-100 text-yellow-700';
      case AvisRisque.REJETE: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getAvisLabel(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.DIFFERE: return 'Différé';
      case AvisRisque.REJETE: return 'Rejeté';
      default: return '—';
    }
  }

  ouvrirMotif(risque: RisqueResponse): void {
    this.selectedRisque = risque;
    this.showMotifModal = true;
  }

  fermerMotif(): void {
    this.showMotifModal = false;
    this.selectedRisque = null;
  }
}
