import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ActionService } from '../../../../core/services/action.service';
import { ActionResponse, StatutAction } from '../../../../core/models/action.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-actions-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: './actions-list.component.html'
})
export class ActionsListComponent implements OnInit {
  actions: ActionResponse[] = [];
  allActions: ActionResponse[] = [];
  filteredActions: ActionResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  selectedPlan: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private actionService: ActionService,
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
    this.loadActions();
  }

  loadActions(): void {
    this.loading = true;
    this.error = null;
    this.actionService.getAll().subscribe({
      next: (actions) => {
        // Trier les actions par date de fin (le plus récent en haut)
        this.allActions = actions.sort((a, b) => {
          const dateA = a.dateFin ? new Date(a.dateFin).getTime() : 0;
          const dateB = b.dateFin ? new Date(b.dateFin).getTime() : 0;
          return dateB - dateA;
        });
        
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les actions';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    if (!this.selectedPlan) {
      this.filteredActions = this.allActions;
    } else {
      this.filteredActions = this.allActions.filter(a => a.codePlan === this.selectedPlan);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  onPlanChange(): void {
    this.applyFilter();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredActions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.actions = this.filteredActions.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredActions.length);
    return { start, end };
  }

  createAction(): void {
    this.router.navigate(['/actions/nouveau']);
  }

  editAction(code: string): void {
    this.router.navigate(['/actions', code, 'edit']);
  }

  viewAction(code: string): void {
    this.router.navigate(['/actions', code]);
  }

  deleteAction(code: string): void {
    Swal.fire({
      title: 'Supprimer cette action ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.actionService.delete(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'L\'action a bien été supprimée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadActions();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer l\'action',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'TERMINEE': return 'bg-green-100 text-green-700';
      case 'EN_RETARD': return 'bg-red-100 text-red-700';
      case 'ANNULEE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'fa-spinner';
      case 'TERMINEE': return 'fa-check-circle';
      case 'EN_RETARD': return 'fa-exclamation-circle';
      case 'ANNULEE': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  countByStatut(statut: string): number {
    return this.actions.filter(a => a.statut === statut).length;
  }

  formatDate(date: string): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }

  isLate(dateFin: string, statut: string): boolean {
    if (statut === 'TERMINEE' || statut === 'ANNULEE') return false;
    if (!dateFin) return false;
    const fin = new Date(dateFin);
    const aujourd = new Date();
    return fin < aujourd;
  }
}
