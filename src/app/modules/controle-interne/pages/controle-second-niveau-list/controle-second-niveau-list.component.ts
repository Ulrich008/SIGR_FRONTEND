import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { AuthService } from '../../../../core/services/auth.service';

import { ControleSecondNiveauService } from '../../../../core/services/controle-second-niveau.service';
import { ControleSecondNiveauResponse } from '../../../../core/models/controle-interne.model';

@Component({
  standalone: true,
  selector: 'app-controle-second-niveau-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './controle-second-niveau-list.component.html'
})
export class ControleSecondNiveauListComponent implements OnInit {

  menuItems: MenuItem[];

  allControles: ControleSecondNiveauResponse[] = [];
  filteredControles: ControleSecondNiveauResponse[] = [];
  controles: ControleSecondNiveauResponse[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private controleService: ControleSecondNiveauService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canWrite(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CONTROLEUR_INTERNE']);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.controleService.getAll().subscribe({
      next: (data) => {
        this.allControles = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les contrôles de second niveau';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredControles = !terme
      ? this.allControles
      : this.allControles.filter(c =>
          c.code.toLowerCase().includes(terme) ||
          c.libelleUniteAdministrative?.toLowerCase().includes(terme) ||
          c.libelleProcessus?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredControles.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.controles = this.filteredControles.slice(startIndex, endIndex);
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

  nouveau(): void {
    if (!this.canWrite) return;
    this.router.navigate(['/controle-interne/controles-second-niveau/nouveau']);
  }

  voir(code: string): void {
    this.router.navigate(['/controle-interne/controles-second-niveau', code]);
  }

  supprimer(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Supprimer ce contrôle ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      customClass: sigrSwalButtons('danger')
    }).then(result => {
      if (!result.isConfirmed) return;
      this.controleService.deleteByCode(code).subscribe({
        next: () => {
          Swal.fire({ title: 'Supprimé', icon: 'success', timer: 1500, showConfirmButton: false });
          this.load();
        },
        error: (err) => {
          this.error = err?.message || 'Impossible de supprimer ce contrôle';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    });
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
