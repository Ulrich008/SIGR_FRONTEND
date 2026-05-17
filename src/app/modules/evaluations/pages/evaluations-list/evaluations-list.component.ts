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

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5) return 'Moyen';
    return 'Faible';
  }

  getNiveauControleBadgeClass(niveau: number): string {
    switch (niveau) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-orange-100 text-orange-700';
      case 4: return 'bg-red-100 text-red-700';
      case 5: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getNiveauControleLabel(niveau: number): string {
    switch (niveau) {
      case 1: return 'Très faible';
      case 2: return 'Faible';
      case 3: return 'Moyen';
      case 4: return 'Élevé';
      case 5: return 'Très élevé';
      default: return niveau.toString();
    }
  }

  countByScore(min: number, max: number): number {
    return this.evaluations.filter(e => e.scoreInitial >= min && e.scoreInitial <= max).length;
  }

  countByNiveauControle(niveau: number): number {
    return this.evaluations.filter(e => e.niveauControle === niveau).length;
  }
}
