import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';
import { CartographieRisquesResponse, StatutCartographie } from '../../../../core/models/cartographie-risques.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cartographie-risques-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './cartographie-risques-detail.component.html'
})
export class CartographieRisquesDetailComponent implements OnInit {
  cartographie: CartographieRisquesResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private cartographieService: CartographieRisquesService,
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
    this.loadCartographie();
  }

  loadCartographie(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/cartographie-risques']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.cartographieService.getByCode(code).subscribe({
      next: (cartographie) => {
        this.cartographie = cartographie;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger la cartographie';
        this.cdr.detectChanges();
      }
    });
  }

  editCartographie(): void {
    if (this.cartographie) {
      this.router.navigate(['/cartographie-risques', this.cartographie.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/cartographie-risques']);
  }

  getStatutBadgeClass(statut: StatutCartographie): string {
    switch (statut) {
      case StatutCartographie.BROUILLON: return 'bg-gray-100 text-gray-700';
      case StatutCartographie.EN_COURS: return 'bg-blue-100 text-blue-700';
      case StatutCartographie.VALIDEE: return 'bg-green-100 text-green-700';
      case StatutCartographie.ARCHIVEE: return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutCartographie): string {
    switch (statut) {
      case StatutCartographie.BROUILLON: return 'Brouillon';
      case StatutCartographie.EN_COURS: return 'En cours';
      case StatutCartographie.VALIDEE: return 'Validée';
      case StatutCartographie.ARCHIVEE: return 'Archivée';
      default: return statut;
    }
  }
}
