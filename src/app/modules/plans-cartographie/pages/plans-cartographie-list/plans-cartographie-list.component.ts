import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, AvisRisque, RisqueRequest } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

interface RisqueAvisUpdate {
  avis?: AvisRisque;
  motif?: string;
  transmis?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-plans-cartographie-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './plans-cartographie-list.component.html'
})
export class PlansCartographieListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  selectedRisques: Set<string> = new Set();
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

  loadRisques(): void {
    this.loading = true;
    this.error = null;
    this.risqueService.getAll().subscribe({
      next: (data) => {
        // Filtrer uniquement les risques non transmis
        this.risques = data.filter(r => !r.transmis);
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
    if (!this.selectedRisque) return;

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

    // Récupérer le risque complet pour la mise à jour
    this.risqueService.getByCode(this.selectedRisque!.code).subscribe({
      next: (risqueComplet) => {
        const updateRequest: RisqueRequest = {
          code: risqueComplet.code,
          libelle: risqueComplet.libelle,
          causeProbable: risqueComplet.causeProbable,
          consequenceProbable: risqueComplet.consequenceProbable,
          bonnesPratiques: risqueComplet.bonnesPratiques,
          statut: risqueComplet.statut,
          strategieRisque: risqueComplet.strategieRisque,
          dateIdentification: risqueComplet.dateIdentification,
          codeProcessus: risqueComplet.codeProcessus,
          typeRisque: risqueComplet.typeRisque,
          avis: this.avisSelectionne,
          motif: this.motif,
          transmis: risqueComplet.transmis
        };

        this.risqueService.updateByCode(this.selectedRisque!.code, updateRequest).subscribe({
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
      },
      error: (err: any) => {
        Swal.fire({
          title: 'Erreur',
          text: err?.message || 'Impossible de charger le risque',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  transmettreRisques(): void {
    if (this.selectedRisques.size === 0) {
      Swal.fire({
        title: 'Aucun risque sélectionné',
        text: 'Veuillez sélectionner au moins un risque à transmettre.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Vérifier que tous les risques sélectionnés ont un avis
    const risquesSansAvis = this.risques.filter(r =>
      this.selectedRisques.has(r.code) && (!r.avis || r.avis === AvisRisque.EN_ATTENTE)
    );

    if (risquesSansAvis.length > 0) {
      Swal.fire({
        title: 'Avis manquant',
        text: 'Tous les risques sélectionnés doivent avoir un avis (validé, différé ou rejeté) avant d\'être transmis.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Transmettre les risques
    Swal.fire({
      title: 'Confirmer la transmission',
      text: `Êtes-vous sûr de vouloir transmettre ${this.selectedRisques.size} risque(s) ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, transmettre',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;

        // Mettre à jour tous les risques sélectionnés comme transmis
        const updates = Array.from(this.selectedRisques).map(code => {
          const risque = this.risques.find(r => r.code === code);
          if (!risque) return null;

          const updateRequest: RisqueRequest = {
            code: risque.code,
            libelle: risque.libelle,
            causeProbable: risque.causeProbable,
            consequenceProbable: risque.consequenceProbable,
            bonnesPratiques: risque.bonnesPratiques,
            statut: risque.statut,
            strategieRisque: risque.strategieRisque,
            dateIdentification: risque.dateIdentification,
            codeProcessus: risque.codeProcessus,
            typeRisque: risque.typeRisque,
            avis: risque.avis,
            motif: risque.motif,
            transmis: true
          };

          return this.risqueService.updateByCode(code, updateRequest);
        }).filter(u => u !== null);

        Promise.all(updates.map(u => u!.toPromise())).then(() => {
          this.loading = false;
          this.selectedRisques.clear();
          Swal.fire({
            title: 'Transmission réussie',
            text: 'Les risques ont été transmis avec succès.',
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
      }
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

