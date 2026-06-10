import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unite-administrative-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './unite-administrative-list.component.html'
})
export class UniteAdministrativeListComponent implements OnInit {
  unites: UniteAdministrativeResponse[] = [];
  allUnites: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  selectedUniteParent: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private uniteService: UniteAdministrativeService,
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
    this.loadUnites();
  }

  loadUnites(): void {
    this.loading = true;
    this.error = null;
    this.uniteService.getAll().subscribe({
      next: (unites) => {
        // Trier les unités par code (le plus récent en haut)
        this.allUnites = unites.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });
        
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les unités administratives';
        this.cdr.detectChanges();
      }
    });
  }

  onUniteParentChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.selectedUniteParent) {
      this.filteredUnites = this.allUnites;
    } else {
      // Filtrer les unités qui sont sous l'unité parent sélectionnée (par code)
      this.filteredUnites = this.allUnites.filter(u => u.idUniteParent === this.selectedUniteParent);
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUnites.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.unites = this.filteredUnites.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredUnites.length);
    return { start, end };
  }

  createUnite(): void {
    this.router.navigate(['/unite-administrative/nouveau']);
  }

  editUnite(code: string): void {
    this.router.navigate(['/unite-administrative', code, 'edit']);
  }

  deleteUnite(code: string): void {
    Swal.fire({
      title: 'Supprimer cette unité administrative ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.uniteService.delete(code).subscribe({
        next: () => {
          this.loadUnites();
          Swal.fire({
            title: 'Supprimée',
            text: 'L\'unité administrative a bien été supprimée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer l\'unité administrative';
          this.cdr.detectChanges();
        }
      });
    });
  }
}
