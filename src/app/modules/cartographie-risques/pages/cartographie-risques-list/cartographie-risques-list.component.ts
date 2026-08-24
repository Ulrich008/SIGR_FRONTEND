import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { RisqueResponse, AvisRisque, EtapeValidation } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { escapeHtml } from '../../../../core/utils/html-escape.util';

@Component({
  standalone: true,
  selector: 'app-cartographie-risques-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './cartographie-risques-list.component.html'
})
export class CartographieRisquesListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  allRisques: RisqueResponse[] = [];
  filteredRisques: RisqueResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  AvisRisque = AvisRisque; // Exposer l'enum pour le template

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Unités administratives pour la recherche dynamique
  unitesAdministratives: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  selectedUnite: UniteAdministrativeResponse | null = null;

  constructor(
    private risqueService: RisqueService,
    private cartographieService: CartographieRisquesService,
    private uniteAdministrativeService: UniteAdministrativeService,
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
    this.loadRisques();
    this.loadUnitesAdministratives();
  }

  loadUnitesAdministratives(): void {
    this.uniteAdministrativeService.getAll().subscribe({
      next: (unites) => {
        this.unitesAdministratives = unites;
        this.filteredUnites = unites;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des unités administratives:', err);
      }
    });
  }

  loadRisques(): void {
    this.loading = true;
    this.error = null;
    this.risqueService.getAll().subscribe({
      next: (risques) => {
        // La cartographie définitive ne montre que les risques ayant reçu
        // la validation finale du CMMR — pas simplement "transmis" (ce qui
        // inclurait des dossiers encore en cours chez Pilote/CCI).
        this.allRisques = risques.filter(r => r.etapeValidation === EtapeValidation.VALIDEE);

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredRisques = !terme
      ? this.allRisques
      : this.allRisques.filter(r =>
          r.code.toLowerCase().includes(terme) ||
          r.libelle?.toLowerCase().includes(terme) ||
          r.nomProcessus?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRisques.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.risques = this.filteredRisques.slice(startIndex, endIndex);
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

  viewRisque(code: string): void {
    this.router.navigate(['/risques', code]);
  }

  getAvisBadgeClass(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'bg-green-100 text-green-700';
      case AvisRisque.DIFFERE: return 'bg-yellow-100 text-yellow-700';
      case AvisRisque.REJETE: return 'bg-red-100 text-red-700';
      case AvisRisque.EN_ATTENTE: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getAvisLabel(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'Validé';
      case AvisRisque.DIFFERE: return 'Différé';
      case AvisRisque.REJETE: return 'Rejeté';
      case AvisRisque.EN_ATTENTE: return 'En attente';
      default: return 'Non défini';
    }
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'bg-blue-100 text-blue-700';
      case 'EN_COURS': return 'bg-yellow-100 text-yellow-700';
      case 'MAITRISE': return 'bg-green-100 text-green-700';
      case 'CLOTURE': return 'bg-gray-100 text-gray-700';
      case 'SUPPRIME': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  countByAvis(avis: AvisRisque): number {
    return this.risques.filter(r => r.avis === avis).length;
  }

  genererCartographieDefinitive(): void {
    Swal.fire({
      title: 'Générer la cartographie',
      html: `
        <div class="text-left">
          <p class="mb-4 text-sm text-gray-600">Choisissez le type de filtrage pour la cartographie :</p>
          <div class="space-y-3">
            <button id="btn-unite" class="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-left transition">
              <div class="font-medium text-emerald-800">Par Unité Administrative</div>
              <div class="text-xs text-emerald-600">Filtrer par code d'unité administrative</div>
            </button>
            <button id="btn-global" class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition">
              <div class="font-medium text-gray-800">Global</div>
              <div class="text-xs text-gray-600">Générer sans filtrage</div>
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const btnUnite = document.getElementById('btn-unite');
        const btnGlobal = document.getElementById('btn-global');

        btnUnite?.addEventListener('click', () => {
          Swal.close();
          this.askCodeAndGenerate();
        });

        btnGlobal?.addEventListener('click', () => {
          Swal.close();
          this.askAnneeAndGenerateGlobal();
        });
      }
    });
  }

  /** Années disponibles (déduites des risques chargés), les plus récentes en premier. */
  private getAnneesDisponibles(): number[] {
    const annees = new Set<number>();
    this.risques.forEach(r => {
      if (r.dateIdentification) {
        const annee = new Date(r.dateIdentification).getFullYear();
        if (!isNaN(annee)) annees.add(annee);
      }
    });
    return Array.from(annees).sort((a, b) => b - a);
  }

  private buildAnneeOptionsHtml(): string {
    return this.getAnneesDisponibles()
      .map(a => `<option value="${a}">${a}</option>`)
      .join('');
  }

  askCodeAndGenerate(): void {
    const uniteOptions = this.unitesAdministratives.map(u =>
      `<option value="${escapeHtml(u.code)}">${escapeHtml(u.code)} - ${escapeHtml(u.libelle)}</option>`
    ).join('');
    const anneeOptions = this.buildAnneeOptionsHtml();

    Swal.fire({
      title: 'Filtrer la cartographie',
      html: `
        <label class="block text-left text-xs font-semibold text-gray-500 mb-1">Unité administrative</label>
        <select id="unite-select" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 12px;">
          <option value="">-- Sélectionner une unité administrative --</option>
          ${uniteOptions}
        </select>
        <label class="block text-left text-xs font-semibold text-gray-500 mb-1">Année</label>
        <select id="annee-select" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px;">
          <option value="">Toutes les années</option>
          ${anneeOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Générer',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const select = document.getElementById('unite-select') as HTMLSelectElement;
        if (select) {
          select.addEventListener('change', () => {
            this.selectedUnite = this.unitesAdministratives.find(u => u.code === select.value) || null;
          });
        }
      },
      preConfirm: () => {
        const select = document.getElementById('unite-select') as HTMLSelectElement;
        const anneeSelect = document.getElementById('annee-select') as HTMLSelectElement;
        if (!select || !select.value) {
          Swal.showValidationMessage('Veuillez sélectionner une unité administrative');
          return false;
        }
        return {
          codeUnite: select.value,
          annee: anneeSelect?.value ? Number(anneeSelect.value) : undefined
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.generateExcelByUnite(result.value.codeUnite, result.value.annee);
      }
    });
  }

  askAnneeAndGenerateGlobal(): void {
    const anneeOptions = this.buildAnneeOptionsHtml();

    Swal.fire({
      title: 'Filtrer par année',
      html: `
        <select id="annee-select-global" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px;">
          <option value="">Toutes les années</option>
          ${anneeOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Générer',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const select = document.getElementById('annee-select-global') as HTMLSelectElement;
        return select?.value ? Number(select.value) : undefined;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.generateExcelGlobal(result.value);
      }
    });
  }

  generateExcelGlobal(annee?: number): void {
    this.loading = true;
    this.cartographieService.exportExcel(annee).subscribe({
      next: (blob: Blob) => {
        this.downloadExcel(blob, `cartographie-risques-definitive${annee ? '-' + annee : ''}.xlsx`);
      },
      error: (err) => {
        this.loading = false;
        this.showError(err);
      }
    });
  }

  generateExcelByUnite(codeUnite: string, annee?: number): void {
    this.loading = true;
    this.cartographieService.exportExcelByUnite(codeUnite, annee).subscribe({
      next: (blob: Blob) => {
        this.downloadExcel(blob, `cartographie-risques-${codeUnite}${annee ? '-' + annee : ''}.xlsx`);
      },
      error: (err) => {
        this.loading = false;
        this.showError(err);
      }
    });
  }

  downloadExcel(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    this.loading = false;
    this.cdr.detectChanges();
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'La cartographie définitive a été générée avec succès'
    });
  }

  showError(err: any): void {
    this.error = err?.message || 'Impossible de générer la cartographie définitive';
    this.cdr.detectChanges();
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: this.error || 'Une erreur est survenue',
      customClass: sigrSwalButtons('danger')
    });
  }
}