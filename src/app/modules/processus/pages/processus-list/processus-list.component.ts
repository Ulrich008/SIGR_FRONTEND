import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ProcessusResponse, TypeProcessus } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-processus-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './processus-list.component.html'
})
export class ProcessusListComponent implements OnInit {
  processus: ProcessusResponse[] = [];
  allProcessus: ProcessusResponse[] = [];
  filteredProcessus: ProcessusResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  selectedUnite: string = '';

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
    if (!this.selectedUnite) {
      this.filteredProcessus = this.allProcessus;
    } else {
      this.filteredProcessus = this.allProcessus.filter(p => p.idUnite === this.selectedUnite);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  onUniteChange(): void {
    this.applyFilter();
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProcessus.length);
    return { start, end };
  }

  createProcessus(): void {
    this.router.navigate(['/processus/nouveau']);
  }

  editProcessus(code: string): void {
    this.router.navigate(['/processus', code, 'edit']);
  }

  viewProcessus(code: string): void {
    this.router.navigate(['/processus', code]);
  }

  deleteProcessus(code: string): void {
    Swal.fire({
      title: 'Supprimer ce processus ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
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
