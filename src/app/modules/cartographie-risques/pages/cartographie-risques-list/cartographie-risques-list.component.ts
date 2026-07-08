import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { RisqueResponse, AvisRisque } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';

@Component({
  standalone: true,
  selector: 'app-cartographie-risques-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './cartographie-risques-list.component.html'
})
export class CartographieRisquesListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  allRisques: RisqueResponse[] = [];
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
        // Filtrer uniquement les risques transmis
        this.allRisques = risques.filter(r => r.transmis);
        
        this.updatePagination();
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

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allRisques.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.risques = this.allRisques.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allRisques.length);
    return { start, end };
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
          this.generateExcelGlobal();
        });
      }
    });
  }

  askCodeAndGenerate(): void {
    const uniteOptions = this.unitesAdministratives.map(u => 
      `<option value="${u.code}">${u.code} - ${u.libelle}</option>`
    ).join('');

    Swal.fire({
      title: 'Code de l\'unité administrative',
      html: `
        <select id="unite-select" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px;">
          <option value="">-- Sélectionner une unité administrative --</option>
          ${uniteOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Générer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
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
        if (!select || !select.value) {
          Swal.showValidationMessage('Veuillez sélectionner une unité administrative');
          return false;
        }
        return select.value;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.generateExcelByUnite(result.value);
      }
    });
  }

  generateExcelGlobal(): void {
    this.loading = true;
    this.cartographieService.exportExcel().subscribe({
      next: (blob: Blob) => {
        this.downloadExcel(blob, 'cartographie-risques-definitive.xlsx');
      },
      error: (err) => {
        this.loading = false;
        this.showError(err);
      }
    });
  }

  generateExcelByUnite(codeUnite: string): void {
    this.loading = true;
    this.cartographieService.exportExcelByUnite(codeUnite).subscribe({
      next: (blob: Blob) => {
        this.downloadExcel(blob, `cartographie-risques-${codeUnite}.xlsx`);
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
      text: 'La cartographie définitive a été générée avec succès',
      confirmButtonColor: '#10b981'
    });
  }

  showError(err: any): void {
    this.error = err?.message || 'Impossible de générer la cartographie définitive';
    this.cdr.detectChanges();
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: this.error || 'Une erreur est survenue',
      confirmButtonColor: '#ef4444'
    });
  }
}