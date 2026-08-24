import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, StatutRisque, TypeRisque, EtapeValidation } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-risques-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './risques-list.component.html'
})
export class RisquesListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  allRisques: RisqueResponse[] = [];
  filteredRisques: RisqueResponse[] = [];
  searchTerm: string = '';
  loading = false;
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
          r.nomProcessus?.toLowerCase().includes(terme) ||
          this.getStatutLabel(r.statut).toLowerCase().includes(terme) ||
          this.getTypeLabel(r.typeRisque).toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
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
      reverseButtons: true,
      customClass: sigrSwalButtons('danger')
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

  cloturerRisque(code: string): void {
    Swal.fire({
      title: 'Clôturer ce risque ?',
      text: 'Confirme que le risque est résolu. Cette action peut être effectuée à n\'importe quelle étape du circuit de validation.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, clôturer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.risqueService.cloturer(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Clôturé',
              text: 'Le risque a bien été clôturé.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });

            this.loadRisques();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de clôturer le risque',
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

  /**
   * Indique chez quel profil se trouve actuellement le risque dans le
   * circuit de validation — permet au Responsable Risque de suivre l'état
   * d'avancement d'un dossier transmis sans avoir à demander à chacun.
   */
  getEtapeLabel(risque: RisqueResponse): string {
    if (!risque.transmis) {
      return 'Non transmis';
    }
    switch (risque.etapeValidation) {
      case EtapeValidation.FORMALISATION:
        return 'Correspondant Risque';
      case EtapeValidation.MANAGER_RISQUE:
        return 'Manager Risque';
      case EtapeValidation.CCI_VERS_RESPONSABLE:
      case EtapeValidation.CCI_VERS_CMMR:
        return 'CCI';
      case EtapeValidation.RESPONSABLE:
        return 'Responsable Risque';
      case EtapeValidation.CMMR:
        return 'CMMR';
      case EtapeValidation.VALIDEE:
        return 'Validé (CMMR)';
      case EtapeValidation.REJETEE:
        return 'Rejeté (terminé)';
      default:
        return '—';
    }
  }

  getEtapeBadgeClass(risque: RisqueResponse): string {
    if (!risque.transmis) {
      return 'bg-slate-100 text-slate-500';
    }
    switch (risque.etapeValidation) {
      case EtapeValidation.FORMALISATION:
        return 'bg-slate-100 text-slate-600';
      case EtapeValidation.MANAGER_RISQUE:
        return 'bg-indigo-100 text-indigo-700';
      case EtapeValidation.CCI_VERS_RESPONSABLE:
      case EtapeValidation.CCI_VERS_CMMR:
        return 'bg-purple-100 text-purple-700';
      case EtapeValidation.RESPONSABLE:
        return 'bg-sky-100 text-sky-700';
      case EtapeValidation.CMMR:
        return 'bg-amber-100 text-amber-700';
      case EtapeValidation.VALIDEE:
        return 'bg-green-100 text-green-700';
      case EtapeValidation.REJETEE:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-500';
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
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CORRESPONDANT_RISQUE']);
  }

  /**
   * Un risque transmis (hors Formalisation) est verrouillé pour le
   * Responsable des risques tant qu'il n'est pas revenu à Formalisation
   * (différé jusqu'au bout par le Pilote). Le SUPER_ADMIN n'est jamais
   * bloqué par ce verrou.
   */
  estVerrouille(risque: RisqueResponse): boolean {
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) return false;
    if (!this.authService.hasAnyRole(['MANAGER_RISQUE', 'CORRESPONDANT_RISQUE'])) return false;
    return !!(risque.transmis && risque.etapeValidation !== EtapeValidation.FORMALISATION);
  }

  canEdit(risque: RisqueResponse): boolean {
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) return true;
    if (!this.authService.hasAnyRole(['MANAGER_RISQUE', 'CORRESPONDANT_RISQUE'])) return false;
    return !this.estVerrouille(risque);
  }

  canDelete(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CORRESPONDANT_RISQUE']);
  }

  canCloturer(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CCI']);
  }
}