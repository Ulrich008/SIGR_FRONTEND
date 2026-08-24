import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ← ajout
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { MinistereService } from '../../../../core/services/ministere.service';
import { MinistereResponse } from '../../../../core/models/ministere.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-ministere-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './ministere-list.component.html'
})
export class MinistereListComponent implements OnInit {
  ministeres: MinistereResponse[] = [];
  allMinisteres: MinistereResponse[] = [];
  filteredMinisteres: MinistereResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private ministereService: MinistereService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef // ← ajout
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadMinisteres();
  }

  loadMinisteres(): void {
    this.loading = true;
    this.error = null;
    this.ministereService.getAll().subscribe({
      next: (ministeres) => {
        // Trier les ministères par code (le plus récent en haut)
        this.allMinisteres = ministeres.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les ministères';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredMinisteres = !terme
      ? this.allMinisteres
      : this.allMinisteres.filter(m =>
          m.code.toLowerCase().includes(terme) ||
          m.nom?.toLowerCase().includes(terme) ||
          m.sigle?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMinisteres.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.ministeres = this.filteredMinisteres.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }

  createMinistere(): void {
    if (!this.isSuperAdmin) return;
    this.router.navigate(['/ministeres/nouveau']);
  }

  editMinistere(id: string): void {
    if (!this.isSuperAdmin) return;
    this.router.navigate(['/ministeres', id, 'edit']);
  }

  deleteMinistere(id: string): void {
    if (!this.isSuperAdmin) return;
    Swal.fire({
      title: 'Supprimer ce ministère ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      customClass: sigrSwalButtons('danger')
    }).then(result => {
      if (!result.isConfirmed) return;
      this.loading = true;
      this.error = null;
      this.ministereService.delete(id).subscribe({
        next: () => {
          this.loadMinisteres();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le ministère a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le ministère';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    });
  }
}