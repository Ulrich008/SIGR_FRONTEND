import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal, sigrSwalButtons } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { EtapeValidation } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'app-evaluations-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './evaluations-list.component.html'
})
export class EvaluationsListComponent implements OnInit {
  evaluations: EvaluationResponse[] = [];
  allEvaluations: EvaluationResponse[] = [];
  filteredEvaluations: EvaluationResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private evaluationService: EvaluationService,
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
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.error = null;
    this.evaluationService.getAll().subscribe({
      next: (evaluations) => {
        // Trier les évaluations par date de fin (le plus récent en haut)
        this.allEvaluations = evaluations.sort((a, b) => {
          const dateA = a.dateFin ? new Date(a.dateFin).getTime() : 0;
          const dateB = b.dateFin ? new Date(b.dateFin).getTime() : 0;
          return dateB - dateA;
        });

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les évaluations';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredEvaluations = !terme
      ? this.allEvaluations
      : this.allEvaluations.filter(e =>
          e.code.toLowerCase().includes(terme) ||
          e.libelleRisque?.toLowerCase().includes(terme) ||
          this.getAgentLabel(e).toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvaluations.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.evaluations = this.filteredEvaluations.slice(startIndex, endIndex);
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

  // Le profil Responsable d'action n'a qu'un accès en lecture seule au
  // module Évaluation : ni création, ni modification, ni suppression.
  get canWrite(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CORRESPONDANT_RISQUE']);
  }

  /**
   * Le risque parent transmis (hors Formalisation) verrouille aussi son
   * évaluation pour le Responsable des risques, jusqu'à son retour à
   * Formalisation. Le SUPER_ADMIN n'est jamais bloqué par ce verrou.
   */
  estVerrouillee(evaluation: EvaluationResponse): boolean {
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) return false;
    if (!this.authService.hasAnyRole(['MANAGER_RISQUE', 'CORRESPONDANT_RISQUE'])) return false;
    return !!(evaluation.risqueTransmis && evaluation.risqueEtapeValidation !== EtapeValidation.FORMALISATION);
  }

  canEditEvaluation(evaluation: EvaluationResponse): boolean {
    if (!this.canWrite) return false;
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) return true;
    return !this.estVerrouillee(evaluation);
  }

  createEvaluation(): void {
    if (!this.canWrite) return;
    this.router.navigate(['/evaluations/nouveau']);
  }

  editEvaluation(code: string): void {
    if (!this.canWrite) return;
    this.router.navigate(['/evaluations', code, 'edit']);
  }

  viewEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code]);
  }

  deleteEvaluation(code: string): void {
    if (!this.canWrite) return;
    Swal.fire({
      title: 'Supprimer cette évaluation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      customClass: sigrSwalButtons('danger')
    }).then(result => {
      if (result.isConfirmed) {
        // Utiliser le paramètre 'code' au lieu de 'id'
        this.evaluationService.delete(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'L\'évaluation a bien été supprimée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadEvaluations();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer l\'évaluation',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  // --- Score inhérent (impact × probabilité) ---

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5)  return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5)  return 'Moyen';
    return 'Faible';
  }

  // --- Score résiduel (après contrôles) ---

  getScoreResiduelBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5)  return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreResiduelLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5)  return 'Moyen';
    return 'Faible';
  }

  // --- Compteurs pour les statistiques ---

  countByScoreInherent(min: number, max: number): number {
    return this.evaluations.filter(e => e.scoreInherent >= min && e.scoreInherent <= max).length;
  }

  countByScoreResiduel(min: number, max: number): number {
    return this.evaluations.filter(e => e.scoreResiduel >= min && e.scoreResiduel <= max).length;
  }

  // --- Méthodes utilitaires pour accéder aux propriétés de l'évaluation ---

  getRiskLabel(evaluation: EvaluationResponse): string {
    return `${evaluation.code} - ${evaluation.libelleRisque}`;
  }

  getAgentLabel(evaluation: EvaluationResponse): string {
    if (evaluation.nomAgent && evaluation.matriculeAgent) {
      return `${evaluation.matriculeAgent} - ${evaluation.nomAgent}`;
    }
    return evaluation.nomAgent || evaluation.matriculeAgent || 'Non assigné';
  }

  formatDate(date?: string): string {
    if (!date) return 'Non définie';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Date invalide' : d.toLocaleDateString('fr-FR');
  }

  getControlesExistants(evaluation: EvaluationResponse): string {
    return evaluation.controleExistants || 'Aucun';
  }

  getControlesInexistants(evaluation: EvaluationResponse): string {
    return evaluation.controleInexistants || 'Aucun';
  }
getPreventionLabel(evaluation: EvaluationResponse): string {
  return evaluation.prevention !== null && evaluation.prevention !== undefined
    ? String(evaluation.prevention)
    : 'Aucune';
}

getProtectionLabel(evaluation: EvaluationResponse): string {
  return evaluation.protection !== null && evaluation.protection !== undefined
    ? String(evaluation.protection)
    : 'Aucune';
}

  getDejaSurvenuLabel(evaluation: EvaluationResponse): string {
    return evaluation.dejaSurvenu ? 'Oui' : 'Non';
  }
}