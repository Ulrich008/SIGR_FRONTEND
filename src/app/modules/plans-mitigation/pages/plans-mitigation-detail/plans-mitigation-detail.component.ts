import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-plans-mitigation-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './plans-mitigation-detail.component.html'
})
export class PlansMitigationDetailComponent implements OnInit {
  plan: PlanMitigationResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private planMitigationService: PlanMitigationService,
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
    this.loadPlan();
  }

  loadPlan(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/plans-mitigation']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.planMitigationService.getByCode(code).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le plan';
        this.cdr.detectChanges();
      }
    });
  }

  editPlan(): void {
    if (this.plan) {
      this.router.navigate(['/plans-mitigation', this.plan.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/plans-mitigation']);
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'PLANIFIE': return 'bg-blue-100 text-blue-700';
      case 'EN_COURS': return 'bg-yellow-100 text-yellow-700';
      case 'TERMINE': return 'bg-green-100 text-green-700';
      case 'ANNULE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'PLANIFIE': return 'fa-calendar-check';
      case 'EN_COURS': return 'fa-spinner';
      case 'TERMINE': return 'fa-check-circle';
      case 'ANNULE': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  formatDate(date: string): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }
}
