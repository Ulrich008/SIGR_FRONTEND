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
  allPlans: PlanMitigationResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

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
        // Trier les plans par date de création (le plus récent en haut)
        this.allPlans = plans.sort((a, b) => {
          const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
          const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
          return dateB - dateA;
        });
        
        this.updatePagination();
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

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allPlans.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.plans = this.allPlans.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getDisplayedRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allPlans.length);
    return { start, end };
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
