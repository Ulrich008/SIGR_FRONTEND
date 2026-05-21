import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-evaluations-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './evaluations-list.component.html'
})
export class EvaluationsListComponent implements OnInit {
  evaluations: EvaluationResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

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
        this.evaluations = evaluations;
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

  createEvaluation(): void {
    this.router.navigate(['/evaluations/nouveau']);
  }

  editEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code, 'edit']);
  }

  viewEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code]);
  }

  deleteEvaluation(code: string): void {
    Swal.fire({
      title: 'Supprimer cette évaluation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
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

  getDejaSurvenuLabel(evaluation: EvaluationResponse): string {
    return evaluation.dejaSurvenu ? 'Oui' : 'Non';
  }
}