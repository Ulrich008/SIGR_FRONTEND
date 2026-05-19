import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-plans-mitigation-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './plans-mitigation-list.component.html'
})
export class PlansMitigationListComponent implements OnInit {
  plans: PlanMitigationResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private planMitigationService: PlanMitigationService,
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
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.error = null;
    this.planMitigationService.getAll().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les plans de mitigation';
        this.cdr.detectChanges();
      }
    });
  }

  createPlan(): void {
    this.router.navigate(['/plans-mitigation/nouveau']);
  }

  editPlan(code: string): void {
    this.router.navigate(['/plans-mitigation', code, 'edit']);
  }

  viewPlan(code: string): void {
    this.router.navigate(['/plans-mitigation', code]);
  }

  deletePlan(code: string): void {
    Swal.fire({
      title: 'Supprimer ce plan ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.planMitigationService.deleteByCode(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'Le plan a bien été supprimé.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadPlans();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer le plan',
              icon: 'error'
            });
          }
        });
      }
    });
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

  countByStatut(statut: string): number {
    return this.plans.filter(p => p.statut === statut).length;
  }

  formatDate(date: string): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }
}
