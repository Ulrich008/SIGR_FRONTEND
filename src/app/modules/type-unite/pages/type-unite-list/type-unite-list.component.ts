import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { TypeUniteService } from '../../../../core/services/type-unite.service';
import { TypeUniteResponse } from '../../../../core/models/type-unite.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'app-type-unite-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './type-unite-list.component.html'
})
export class TypeUniteListComponent implements OnInit {
  typeUnites: TypeUniteResponse[] = [];
  allTypeUnites: TypeUniteResponse[] = [];
  filteredTypeUnites: TypeUniteResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private typeUniteService: TypeUniteService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    // Expand the Unités administratives menu
    const uniteAdminItem = this.menuItems.find(item => item.label === 'Unités administratives');
    if (uniteAdminItem) {
      uniteAdminItem.expanded = true;
    }
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadTypeUnites();
  }

  loadTypeUnites(): void {
    this.loading = true;
    this.error = null;
    this.typeUniteService.getAll().subscribe({
      next: (typeUnites) => {
        // Trier les types d'unités par code (le plus récent en haut)
        this.allTypeUnites = typeUnites.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les types d\'unités';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredTypeUnites = !terme
      ? this.allTypeUnites
      : this.allTypeUnites.filter(t =>
          t.code.toLowerCase().includes(terme) ||
          t.libelle?.toLowerCase().includes(terme) ||
          t.description?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTypeUnites.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.typeUnites = this.filteredTypeUnites.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredTypeUnites.length);
    return { start, end };
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }

  createTypeUnite(): void {
    if (!this.isSuperAdmin) return;
    this.router.navigate(['/unite-administrative/type-unite/nouveau']);
  }

  editTypeUnite(code: string): void {
    if (!this.isSuperAdmin) return;
    this.router.navigate(['/unite-administrative/type-unite', code, 'edit']);
  }

  deleteTypeUnite(code: string): void {
    if (!this.isSuperAdmin) return;
    Swal.fire({
      title: 'Supprimer ce type d\'unité ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.typeUniteService.delete(code).subscribe({
        next: () => {
          this.loadTypeUnites();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le type d\'unité a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le type d\'unité';
          this.cdr.detectChanges();
        }
      });
    });
  }
}
