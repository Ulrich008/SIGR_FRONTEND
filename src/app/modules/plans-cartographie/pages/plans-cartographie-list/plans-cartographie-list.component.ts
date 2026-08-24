import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, AvisRisque, EtapeValidation } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-plans-cartographie-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './plans-cartographie-list.component.html'
})
export class PlansCartographieListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  selectedRisques: Set<string> = new Set();
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  AvisRisque = AvisRisque; // Exposer l'enum pour le template

  // Modal state
  showAvisModal = false;
  selectedRisque: RisqueResponse | null = null;
  avisSelectionne: AvisRisque = AvisRisque.EN_ATTENTE;
  motif: string = '';

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

  // Correspondant Risque, Manager Risque et CCI relaient le dossier (action
  // "Transmettre", sans avis) ; Responsable Risque/CMMR ne font que se
  // prononcer via validerAvis().
  get canTransmettre(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CORRESPONDANT_RISQUE', 'CCI']);
  }

  // Seuls les profils qui rendent un véritable avis (Valider/Différer/
  // Rejeter) ; le CCI et le Manager Risque ne font que relayer.
  get canValiderAvis(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'RESPONSABLE_RISQUES', 'CMMR']);
  }

  get filteredRisques(): RisqueResponse[] {
    const terme = this.searchTerm.trim().toLowerCase();
    if (!terme) return this.risques;
    return this.risques.filter(r =>
      r.code.toLowerCase().includes(terme) ||
      r.libelle?.toLowerCase().includes(terme) ||
      r.nomProcessus?.toLowerCase().includes(terme)
    );
  }

  currentPage = 1;
  itemsPerPage = 10;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRisques.length / this.itemsPerPage));
  }

  get pagedRisques(): RisqueResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRisques.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  loadRisques(): void {
    this.loading = true;
    this.error = null;
    this.risqueService.getAll().subscribe({
      next: (data) => {
        // Chacun ne voit que les dossiers actuellement à sa propre étape
        // du circuit de validation (Formalisation -> Pilote -> CCI -> CMMR).
        this.risques = data.filter(r => this.estAMonEtape(r));
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

  private estAMonEtape(risque: RisqueResponse): boolean {
    const etape = risque.etapeValidation ?? EtapeValidation.FORMALISATION;

    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) {
      // Vue d'ensemble : tout ce qui n'est pas encore finalisé
      return etape !== EtapeValidation.VALIDEE && etape !== EtapeValidation.REJETEE;
    }
    // Un risque non évalué ne peut pas être transmis : il n'apparaît donc
    // pas encore dans le projet de cartographie (voir aussi le contrôle
    // équivalent côté backend, RisqueServiceImpl.transmettre()).
    if (this.authService.hasAnyRole(['CORRESPONDANT_RISQUE'])) {
      return etape === EtapeValidation.FORMALISATION && risque.evalue;
    }
    if (this.authService.hasAnyRole(['MANAGER_RISQUE'])) {
      // Le Manager Risque transmet aussi bien les dossiers fraîchement
      // évalués (Formalisation) que ceux qui lui reviennent d'un différé,
      // pour les relayer au CCI ou les renvoyer au Correspondant.
      return (etape === EtapeValidation.FORMALISATION && risque.evalue)
          || etape === EtapeValidation.MANAGER_RISQUE;
    }
    if (this.authService.hasAnyRole(['CCI'])) {
      return etape === EtapeValidation.CCI_VERS_RESPONSABLE || etape === EtapeValidation.CCI_VERS_CMMR;
    }
    if (this.authService.hasAnyRole(['RESPONSABLE_RISQUES'])) {
      return etape === EtapeValidation.RESPONSABLE;
    }
    if (this.authService.hasAnyRole(['CMMR'])) {
      return etape === EtapeValidation.CMMR;
    }
    return false;
  }

  toggleRisqueSelection(risqueId: string): void {
    if (this.selectedRisques.has(risqueId)) {
      this.selectedRisques.delete(risqueId);
    } else {
      this.selectedRisques.add(risqueId);
    }
    this.cdr.detectChanges();
  }

  isRisqueSelected(risqueId: string): boolean {
    return this.selectedRisques.has(risqueId);
  }

  voirDetails(risque: RisqueResponse): void {
    // Ouvrir le modal avec les détails du risque
    this.selectedRisque = risque;
    this.avisSelectionne = risque.avis || AvisRisque.EN_ATTENTE;
    this.motif = risque.motif || '';
    this.showAvisModal = true;
    this.cdr.detectChanges();
  }

  fermerModal(): void {
    this.showAvisModal = false;
    this.selectedRisque = null;
    this.avisSelectionne = AvisRisque.EN_ATTENTE;
    this.motif = '';
    this.cdr.detectChanges();
  }

  enregistrerAvis(): void {
    if (!this.selectedRisque || !this.canValiderAvis) return;

    // Valider que le motif est obligatoire pour DIFFERE et REJETE
    if ((this.avisSelectionne === AvisRisque.DIFFERE || this.avisSelectionne === AvisRisque.REJETE) && !this.motif.trim()) {
      Swal.fire({
        title: 'Motif requis',
        text: 'Le motif est obligatoire pour différer ou rejeter un risque.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Action dédiée : ne modifie que l'avis et le motif, jamais le
    // contenu du risque (CMMR/CCI/PILOTE n'ont pas le droit de le
    // modifier, seulement de se prononcer dessus).
    this.risqueService.validerAvis(this.selectedRisque!.code, {
      avis: this.avisSelectionne,
      motif: this.motif
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'Avis enregistré',
          text: 'L\'avis sur le risque a été enregistré avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.fermerModal();
          this.loadRisques();
        });
      },
      error: (err: any) => {
        Swal.fire({
          title: 'Erreur',
          text: err?.message || 'Impossible d\'enregistrer l\'avis',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  transmettreRisques(): void {
    if (!this.canTransmettre || this.selectedRisques.size === 0) {
      Swal.fire({
        title: 'Aucun risque sélectionné',
        text: 'Veuillez sélectionner au moins un risque à transmettre.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Transmettre les risques : fait entrer chaque dossier dans le
    // circuit de validation (étape Pilote de processus).
    Swal.fire({
      title: 'Confirmer la transmission',
      text: `Êtes-vous sûr de vouloir transmettre ${this.selectedRisques.size} risque(s) au Pilote de processus ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, transmettre',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loading = true;
      const codes = Array.from(this.selectedRisques);
      const requetes = codes.map(code => this.risqueService.transmettre(code));

      Promise.all(requetes.map(r => r.toPromise())).then(() => {
        this.loading = false;
        this.selectedRisques.clear();
        Swal.fire({
          title: 'Transmission réussie',
          text: 'Les risques ont été transmis au Pilote de processus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.loadRisques();
        });
      }).catch((err: any) => {
        this.loading = false;
        Swal.fire({
          title: 'Erreur',
          text: err?.message || 'Impossible de transmettre les risques',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
    });
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

  // ========== Helpers pour les bonnes pratiques typées ==========

  cleanPratiqueText(pratique: string): string {
    return pratique.replace(/^\[(Prévention|Protection)\]\s*/, '');
  }

  isPrevention(pratique: string): boolean {
    return pratique.startsWith('[Prévention]');
  }

  isProtection(pratique: string): boolean {
    return pratique.startsWith('[Protection]');
  }
}

