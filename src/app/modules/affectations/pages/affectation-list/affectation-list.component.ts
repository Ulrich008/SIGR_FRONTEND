import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AffectationService } from '../../../../core/services/affectation.service';
import { AffectationResponse } from '../../../../core/models/affectation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-affectation-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './affectation-list.component.html'
})
export class AffectationListComponent implements OnInit {
  affectations: AffectationResponse[] = [];
  allAffectations: AffectationResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private affectationService: AffectationService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    // Expand the Agents menu
    const agentsItem = this.menuItems.find(item => item.label === 'Agents');
    if (agentsItem) {
      agentsItem.expanded = true;
    }
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadAffectations();
  }

  loadAffectations(): void {
    this.loading = true;
    this.error = null;
    this.affectationService.getAll().subscribe({
      next: (affectations) => {
        // Trier les affectations par date d'affectation (le plus récent en haut)
        this.allAffectations = affectations.sort((a, b) => {
          const dateA = a.dateAffectation ? new Date(a.dateAffectation).getTime() : 0;
          const dateB = b.dateAffectation ? new Date(b.dateAffectation).getTime() : 0;
          return dateB - dateA;
        });
        
        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les affectations';
        this.cdr.detectChanges();
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allAffectations.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.affectations = this.allAffectations.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allAffectations.length);
    return { start, end };
  }

  createAffectation(): void {
    this.router.navigate(['/agents/affectations/nouveau']);
  }

  editAffectation(code: string): void {
    this.router.navigate(['/agents/affectations', code, 'edit']);
  }

  deleteAffectation(code: string): void {
    Swal.fire({
      title: 'Supprimer cette affectation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.affectationService.delete(code).subscribe({
        next: () => {
          this.loadAffectations();
          Swal.fire({
            title: 'Supprimé',
            text: 'L\'affectation a bien été supprimée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer l\'affectation';
          this.cdr.detectChanges();
        }
      });
    });
  }

  formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR');
}
}
