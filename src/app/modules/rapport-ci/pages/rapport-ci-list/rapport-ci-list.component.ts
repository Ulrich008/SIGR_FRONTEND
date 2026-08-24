import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

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
  selector: 'app-rapport-ci-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './rapport-ci-list.component.html'
})
export class RapportCiListComponent implements OnInit {

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

  showAvisModal = false;
  selectedRapport: RapportControleInterneResponse | null = null;
  avisSelectionne: StatutRapportCI | null = null;
  motif = '';

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

  /** Seule la CCI se prononce (Valider/Différer/Rejeter) sur un rapport transmis. */
  get canValiderAvis(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CCI']);
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
        // La CCI voit tous les rapports transmis (pour agir sur ceux en
        // attente et consulter l'historique) ; Responsable des risques et
        // CMMR ne sont destinataires que des rapports validés par la CCI
        // ("à titre d'information"/"à titre de compte rendu").
        const transmis = data.filter(r =>
          r.statut === StatutRapportCI.TRANSMIS ||
          r.statut === StatutRapportCI.VALIDE ||
          r.statut === StatutRapportCI.DIFFERE ||
          r.statut === StatutRapportCI.REJETE
        );
        this.allRapports = this.canValiderAvis
          ? transmis
          : transmis.filter(r => r.statut === StatutRapportCI.VALIDE);
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

  ouvrirAvisModal(rapport: RapportControleInterneResponse): void {
    if (!this.canValiderAvis || rapport.statut !== StatutRapportCI.TRANSMIS) return;
    this.selectedRapport = rapport;
    this.avisSelectionne = null;
    this.motif = '';
    this.showAvisModal = true;
  }

  fermerAvisModal(): void {
    this.showAvisModal = false;
    this.selectedRapport = null;
    this.avisSelectionne = null;
    this.motif = '';
  }

  enregistrerAvis(): void {
    if (!this.selectedRapport || !this.avisSelectionne || !this.canValiderAvis) return;

    const motifRequis = this.avisSelectionne === StatutRapportCI.DIFFERE || this.avisSelectionne === StatutRapportCI.REJETE;
    if (motifRequis && !this.motif.trim()) {
      Swal.fire({ title: 'Motif requis', text: 'Le motif est obligatoire pour différer ou rejeter un rapport.', icon: 'warning', confirmButtonText: 'OK' });
      return;
    }

    this.rapportService.validerAvis(this.selectedRapport.code, {
      avis: this.avisSelectionne as StatutRapportCI.VALIDE | StatutRapportCI.DIFFERE | StatutRapportCI.REJETE,
      motif: this.motif
    }).subscribe({
      next: () => {
        Swal.fire({ title: 'Avis enregistré', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          this.fermerAvisModal();
          this.load();
        });
      },
      error: (err) => {
        Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible d\'enregistrer l\'avis', icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  getStatutLabel(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.TRANSMIS: return 'Transmis — en attente de votre avis';
      case StatutRapportCI.VALIDE: return 'Validé';
      case StatutRapportCI.DIFFERE: return 'Différé';
      case StatutRapportCI.REJETE: return 'Rejeté';
      default: return '—';
    }
  }

  getStatutBadgeClass(statut?: StatutRapportCI): string {
    switch (statut) {
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
