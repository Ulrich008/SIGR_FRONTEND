import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ImportResult } from '../../../../core/models/import-result.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unite-administrative-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './unite-administrative-list.component.html'
})
export class UniteAdministrativeListComponent implements OnInit {
  unites: UniteAdministrativeResponse[] = [];
  allUnites: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  importing = false;

  constructor(
    private uniteService: UniteAdministrativeService,
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
    this.loadUnites();
  }

  get canImport(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  loadUnites(): void {
    this.loading = true;
    this.error = null;
    this.uniteService.getAll().subscribe({
      next: (unites) => {
        // Trier les unités par code (le plus récent en haut)
        this.allUnites = unites.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });
        
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les unités administratives';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredUnites = !terme
      ? this.allUnites
      : this.allUnites.filter(u =>
          u.code.toLowerCase().includes(terme) ||
          u.libelle?.toLowerCase().includes(terme) ||
          u.typeUniteLibelle?.toLowerCase().includes(terme) ||
          u.nomMinistere?.toLowerCase().includes(terme) ||
          u.codeMinistere?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUnites.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.unites = this.filteredUnites.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredUnites.length);
    return { start, end };
  }

  createUnite(): void {
    this.router.navigate(['/unite-administrative/nouveau']);
  }

  editUnite(code: string): void {
    this.router.navigate(['/unite-administrative', code, 'edit']);
  }

  deleteUnite(code: string): void {
    Swal.fire({
      title: 'Supprimer cette unité administrative ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.uniteService.delete(code).subscribe({
        next: () => {
          this.loadUnites();
          Swal.fire({
            title: 'Supprimée',
            text: 'L\'unité administrative a bien été supprimée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer l\'unité administrative';
          this.cdr.detectChanges();
        }
      });
    });
  }

  triggerImport(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    fileInput.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing = true;
    this.uniteService.importExcel(file).subscribe({
      next: (result) => {
        this.importing = false;
        this.loadUnites();
        this.afficherResultatImport(result);
      },
      error: (err) => {
        this.importing = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || "Impossible d'importer le fichier",
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  private afficherResultatImport(result: ImportResult): void {
    const listeErreurs = result.echecs.length
      ? `<div style="text-align:left;max-height:200px;overflow-y:auto;margin-top:12px;">
          <ul style="list-style:disc;padding-left:20px;">
            ${result.echecs.map(e => `<li>Ligne ${e.ligne} : ${e.message}</li>`).join('')}
          </ul>
        </div>`
      : '';

    Swal.fire({
      icon: result.echecs.length ? 'warning' : 'success',
      title: 'Import terminé',
      html: `${result.succes} / ${result.totalLignes} unité(s) importée(s) avec succès.${listeErreurs}`,
      confirmButtonColor: '#047857'
    });
  }

  downloadImportTemplate(): void {
    this.uniteService.downloadImportTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modele_import_unites_administratives.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || 'Impossible de télécharger le modèle',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}
