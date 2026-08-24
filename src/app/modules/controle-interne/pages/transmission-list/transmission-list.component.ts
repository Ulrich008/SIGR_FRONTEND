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
  selector: 'app-transmission-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './transmission-list.component.html'
})
export class TransmissionListComponent implements OnInit {

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
        // Seuls les rapports dont le PDF a été généré apparaissent en Transmission.
        this.allRapports = data.filter(r => r.pdfDisponible);
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les rapports transmis';
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

  telecharger(code: string): void {
    this.rapportService.telechargerPdf(code).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${code}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de télécharger le PDF';
        this.cdr.detectChanges();
      }
    });
  }

  transmettre(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Transmettre ce rapport à la CCI ?',
      text: 'Le rapport sera envoyé à la CCI pour avis (validation, différé ou rejet).',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, transmettre',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;
      this.rapportService.transmettre(code).subscribe({
        next: () => {
          Swal.fire({ title: 'Transmis', text: 'Le rapport a été transmis à la CCI.', icon: 'success', timer: 1500, showConfirmButton: false });
          this.load();
        },
        error: (err) => {
          this.error = err?.message || 'Impossible de transmettre ce rapport';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    });
  }

  supprimer(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Supprimer ce rapport ?',
      text: 'Vous pourrez en recréer un nouveau depuis le sous-menu Rapport une fois les corrections apportées.',
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

  voirMotif(rapport: RapportControleInterneResponse): void {
    Swal.fire({
      title: rapport.statut === StatutRapportCI.REJETE ? 'Motif du rejet' : 'Motif du différé',
      text: rapport.motif || 'Aucun motif renseigné.',
      icon: 'info',
      confirmButtonText: 'Fermer'
    });
  }

  getStatutLabel(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'En attente de validation';
      case StatutRapportCI.TRANSMIS: return 'Transmis à la CCI';
      case StatutRapportCI.VALIDE: return 'Validé';
      case StatutRapportCI.DIFFERE: return 'Différé';
      case StatutRapportCI.REJETE: return 'Rejeté';
      default: return '—';
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
