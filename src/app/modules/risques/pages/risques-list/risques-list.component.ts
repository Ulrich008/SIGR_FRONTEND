import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { RisqueResponse, StatutRisque, TypeRisque } from '../../../../core/models/risque.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: './risques-list.component.html'
})
export class RisquesListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  allRisques: RisqueResponse[] = [];
  filteredRisques: RisqueResponse[] = [];
  processus: ProcessusResponse[] = [];
  selectedProcessus: string = '';
  loading = false;
  loadingProcessus = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  StatutRisque = StatutRisque;
  TypeRisque = TypeRisque;

  constructor(
    private risqueService: RisqueService,
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
    this.loadRisques();
  }

  loadProcessus(): void {
    this.loadingProcessus = true;
    this.processusService.getAll().subscribe({
      next: (processus) => {
        this.processus = processus;
        this.loadingProcessus = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingProcessus = false;
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  loadRisques(): void {
    this.loading = true;
    this.error = null;

    this.risqueService.getAll().subscribe({
      next: (risques) => {
        // Trier les risques par date d'identification (le plus récent en haut)
        this.allRisques = risques.sort((a, b) => {
          const dateA = a.dateIdentification ? new Date(a.dateIdentification).getTime() : 0;
          const dateB = b.dateIdentification ? new Date(b.dateIdentification).getTime() : 0;
          return dateB - dateA;
        });
        
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

  onProcessusFilterChange(): void {
    if (!this.selectedProcessus) {
      this.filteredRisques = this.allRisques;
    } else {
      this.filteredRisques = this.allRisques.filter(r => r.codeProcessus === this.selectedProcessus);
    }
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.filteredRisques = this.selectedProcessus 
      ? this.allRisques.filter(r => r.codeProcessus === this.selectedProcessus)
      : this.allRisques;
    
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRisques.length);
    return { start, end };
  }

  createRisque(): void {
    this.router.navigate(['/risques/nouveau']);
  }

  editRisque(code: string): void {
    this.router.navigate(['/risques', code, 'edit']);
  }

  viewRisque(code: string): void {
    this.router.navigate(['/risques', code]);
  }

  deleteRisque(code: string): void {
    Swal.fire({
      title: 'Supprimer ce risque ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.risqueService.deleteByCode(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'Le risque a bien été supprimé.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });

            this.loadRisques();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer le risque',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  getStatutBadgeClass(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF:
        return 'bg-red-100 text-red-700';

      case StatutRisque.EN_COURS:
        return 'bg-blue-100 text-blue-700';

      case StatutRisque.MAITRISE:
        return 'bg-green-100 text-green-700';

      case StatutRisque.CLOTURE:
        return 'bg-gray-100 text-gray-700';

      case StatutRisque.SUPPRIME:
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF:
        return 'Actif';

      case StatutRisque.EN_COURS:
        return 'En cours';

      case StatutRisque.MAITRISE:
        return 'Maîtrisé';

      case StatutRisque.CLOTURE:
        return 'Clôturé';

      case StatutRisque.SUPPRIME:
        return 'Supprimé';

      default:
        return statut;
    }
  }

  getTypeBadgeClass(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.STRATEGIQUE_PILOTAGE:
        return 'bg-pink-100 text-pink-700';

      case TypeRisque.OPERATIONNEL:
        return 'bg-orange-100 text-orange-700';

      case TypeRisque.FINANCIER:
        return 'bg-purple-100 text-purple-700';

      case TypeRisque.RESSOURCES_HUMAINES:
        return 'bg-yellow-100 text-yellow-700';

      case TypeRisque.ETHIQUE_DEONTOLOGIE_FRAUDE:
        return 'bg-red-100 text-red-700';

      case TypeRisque.JURIDIQUE:
        return 'bg-indigo-100 text-indigo-700';

      case TypeRisque.INFORMATIQUE:
        return 'bg-cyan-100 text-cyan-700';

      case TypeRisque.IMAGE_REPUTATION:
        return 'bg-rose-100 text-rose-700';

      case TypeRisque.GESTION_CONNAISSANCE:
        return 'bg-emerald-100 text-emerald-700';

      case TypeRisque.EXTERNE:
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeLabel(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.STRATEGIQUE_PILOTAGE:
        return 'Stratégique / Pilotage';

      case TypeRisque.OPERATIONNEL:
        return 'Opérationnel';

      case TypeRisque.FINANCIER:
        return 'Financier';

      case TypeRisque.RESSOURCES_HUMAINES:
        return 'Ressources humaines';

      case TypeRisque.ETHIQUE_DEONTOLOGIE_FRAUDE:
        return 'Éthique / Déontologie / Fraude';

      case TypeRisque.JURIDIQUE:
        return 'Juridique';

      case TypeRisque.INFORMATIQUE:
        return 'Informatique';

      case TypeRisque.IMAGE_REPUTATION:
        return 'Image / Réputation';

      case TypeRisque.GESTION_CONNAISSANCE:
        return 'Gestion de la connaissance';

      case TypeRisque.EXTERNE:
        return 'Externe';

      default:
        return type;
    }
  }

  countByStatut(statut: StatutRisque): number {
    return this.risques.filter(r => r.statut === statut).length;
  }

  countByType(type: TypeRisque): number {
    return this.risques.filter(r => r.typeRisque === type).length;
  }

  canCreate(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'MANAGER']);
  }

  canEdit(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'MANAGER']);
  }

  canDelete(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}