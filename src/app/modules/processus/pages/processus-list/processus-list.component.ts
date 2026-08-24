import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ProcessusResponse, TypeProcessus } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-processus-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './processus-list.component.html'
})
export class ProcessusListComponent implements OnInit {
  processus: ProcessusResponse[] = [];
  allProcessus: ProcessusResponse[] = [];
  filteredProcessus: ProcessusResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private processusService: ProcessusService,
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
    this.loadProcessus();
  }

  loadProcessus(): void {
    this.loading = true;
    this.error = null;
    this.processusService.getAll().subscribe({
      next: (processus) => {
        // Trier les processus par code (le plus récent en haut)
        this.allProcessus = processus.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });
        
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    if (!terme) {
      this.filteredProcessus = this.allProcessus;
    } else {
      this.filteredProcessus = this.allProcessus.filter(p =>
        p.code.toLowerCase().includes(terme) ||
        p.libelle?.toLowerCase().includes(terme) ||
        p.nomUnite?.toLowerCase().includes(terme) ||
        p.idUnite?.toLowerCase().includes(terme) ||
        p.nomProprietaire?.toLowerCase().includes(terme)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProcessus.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.processus = this.filteredProcessus.slice(startIndex, endIndex);
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

  get canWrite(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CORRESPONDANT_RISQUE']);
  }

  createProcessus(): void {
    if (!this.canWrite) return;
    this.router.navigate(['/processus/nouveau']);
  }

  editProcessus(code: string): void {
    if (!this.canWrite) return;
    this.router.navigate(['/processus', code, 'edit']);
  }

  viewProcessus(code: string): void {
    this.router.navigate(['/processus', code]);
  }

  deleteProcessus(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Supprimer ce processus ?',
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
      this.processusService.delete(code).subscribe({
        next: () => {
          this.loadProcessus();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le processus a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le processus';
          this.cdr.detectChanges();
        }
      });
    });
  }

  getTypeProcessusBadgeClass(type: TypeProcessus): string {
    switch (type) {
      case TypeProcessus.METIER: return 'bg-blue-100 text-blue-700';
      case TypeProcessus.SUPPORT: return 'bg-purple-100 text-purple-700';
      case TypeProcessus.PILOTAGE: return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeProcessusLabel(type: TypeProcessus): string {
    switch (type) {
      case TypeProcessus.METIER: return 'Métier';
      case TypeProcessus.SUPPORT: return 'Support';
      case TypeProcessus.PILOTAGE: return 'Pilotage';
      default: return type;
    }
  }
  countByType(type: string): number {
  return this.processus.filter(p => p.typeProcessus === type).length;
}
}
