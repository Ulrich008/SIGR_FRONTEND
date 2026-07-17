import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, EtapeValidation } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cartographie-validees',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './cartographie-validees.component.html'
})
export class CartographieValideesComponent implements OnInit {
  risques: RisqueResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

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
        // Validée = validation finale par le CMMR (dernière étape du
        // circuit), pas seulement un avis "Validé" à une étape intermédiaire.
        this.risques = data.filter(r => r.etapeValidation === EtapeValidation.VALIDEE);
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
}
