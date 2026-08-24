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

import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { RapportControleInterneResponse, StatutRapportCI } from '../../../../core/models/controle-interne.model';

@Component({
  standalone: true,
  selector: 'app-rapport-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './rapport-list.component.html'
})
export class RapportListComponent implements OnInit {

  menuItems: MenuItem[];

  allRapports: RapportControleInterneResponse[] = [];
  filteredRapports: RapportControleInterneResponse[] = [];
  rapports: RapportControleInterneResponse[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  StatutRapportCI = StatutRapportCI;

  constructor(
    private rapportService: RapportControleInterneService,
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
    this.rapportService.getAll().subscribe({
      next: (data) => {
        this.allRapports = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les rapports de contrôle interne';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredRapports = !terme
      ? this.allRapports
      : this.allRapports.filter(r =>
          r.code.toLowerCase().includes(terme) ||
          r.libelleUniteAdministrative?.toLowerCase().includes(terme) ||
          r.libelleProcessus?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRapports.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.rapports = this.filteredRapports.slice(startIndex, endIndex);
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
    this.router.navigate(['/controle-interne/rapports/nouveau']);
  }

  voir(code: string): void {
    this.router.navigate(['/controle-interne/rapports', code]);
  }

  supprimer(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Supprimer ce rapport ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      customClass: sigrSwalButtons('danger')
    }).then(result => {
      if (!result.isConfirmed) return;
      this.rapportService.deleteByCode(code).subscribe({
        next: () => {
          Swal.fire({ title: 'Supprimé', icon: 'success', timer: 1500, showConfirmButton: false });
          this.load();
        },
        error: (err) => {
          this.error = err?.message || 'Impossible de supprimer ce rapport';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    });
  }

  getStatutLabel(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'En attente de validation';
      case StatutRapportCI.TRANSMIS: return 'Transmis à la CCI';
      case StatutRapportCI.VALIDE: return 'Validé';
      case StatutRapportCI.DIFFERE: return 'Différé';
      case StatutRapportCI.REJETE: return 'Rejeté';
      default: return 'Brouillon';
    }
  }

  getStatutBadgeClass(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'bg-blue-100 text-blue-700';
      case StatutRapportCI.TRANSMIS: return 'bg-amber-100 text-amber-700';
      case StatutRapportCI.VALIDE: return 'bg-emerald-100 text-emerald-700';
      case StatutRapportCI.DIFFERE: return 'bg-orange-100 text-orange-700';
      case StatutRapportCI.REJETE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
