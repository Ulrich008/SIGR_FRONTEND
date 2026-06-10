import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteMesureService } from '../../../../core/services/unite-mesure.service';
import { UniteMesureResponse } from '../../../../core/models/unite-mesure.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unites-mesure-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './unites-mesure-list.component.html'
})
export class UnitesMesureListComponent implements OnInit {
  unitesMesure: UniteMesureResponse[] = [];
  allUnitesMesure: UniteMesureResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private uniteMesureService: UniteMesureService,
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
    this.loadUnitesMesure();
  }

  loadUnitesMesure(): void {
    this.loading = true;
    this.error = null;
    this.uniteMesureService.getAll().subscribe({
      next: (unitesMesure) => {
        // Trier les unités de mesure par code (le plus récent en haut)
        this.allUnitesMesure = unitesMesure.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });
        
        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les unités de mesure';
        this.cdr.detectChanges();
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allUnitesMesure.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.unitesMesure = this.allUnitesMesure.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allUnitesMesure.length);
    return { start, end };
  }

  createUniteMesure(): void {
    this.router.navigate(['/unites-mesure/nouveau']);
  }

  editUniteMesure(id: string): void {
    this.router.navigate(['/unites-mesure', id, 'edit']);
  }

  deleteUniteMesure(id: string): void {
    Swal.fire({
      title: 'Supprimer cette unité de mesure ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.uniteMesureService.delete(id).subscribe({
          next: () => {
            Swal.fire({ title: 'Supprimé', text: 'L\'unité de mesure a bien été supprimée.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.loadUnitesMesure();
          },
          error: (err) => {
            Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible de supprimer l\'unité de mesure', icon: 'error' });
          }
        });
      }
    });
  }
}
