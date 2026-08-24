import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProfilService } from '../../../../core/services/profil.service';
import { ProfilResponse } from '../../../../core/models/profil.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-profil-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './profil-list.component.html'
})
export class ProfilListComponent implements OnInit {
  profils: ProfilResponse[] = [];
  allProfils: ProfilResponse[] = [];
  filteredProfils: ProfilResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private profilService: ProfilService,
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
    this.loadProfils();
  }

  loadProfils(): void {
    this.loading = true;
    this.error = null;
    this.profilService.getAll().subscribe({
      next: (profils) => {
        // Trier les profils par code (le plus récent en haut)
        this.allProfils = profils.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les profils';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredProfils = !terme
      ? this.allProfils
      : this.allProfils.filter(p =>
          p.code.toLowerCase().includes(terme) ||
          p.libelle?.toLowerCase().includes(terme) ||
          p.description?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProfils.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.profils = this.filteredProfils.slice(startIndex, endIndex);
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

  createProfil(): void {
    this.router.navigate(['/profils/nouveau']);
  }

  editProfil(code: string): void {
    this.router.navigate(['/profils', code, 'edit']);
  }

  deleteProfil(code: string): void {
    Swal.fire({
      title: 'Supprimer ce profil ?',
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
      this.profilService.delete(code).subscribe({
        next: () => {
          this.loadProfils();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le profil a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le profil';
          this.cdr.detectChanges();
        }
      });
    });
  }
}