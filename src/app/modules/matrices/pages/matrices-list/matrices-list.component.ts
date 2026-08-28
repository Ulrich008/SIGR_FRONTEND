import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'app-matrices-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './matrices-list.component.html'
})
export class MatricesListComponent implements OnInit {
  evaluations: EvaluationResponse[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  /**
   * Une réévaluation crée une NOUVELLE ligne d'évaluation (code "Re_...")
   * sans supprimer l'ancienne : le risque a donc plusieurs évaluations en
   * base. Pour que la matrice reflète la dernière réévaluation au lieu
   * d'afficher aussi l'ancienne position (déjà obsolète), on ne garde que
   * la plus récente évaluation par risque — la dernière rencontrée pour un
   * même codeRisque, l'API renvoyant les évaluations dans leur ordre de
   * création (même convention que dans evaluations-form).
   */
  get latestEvaluations(): EvaluationResponse[] {
    const parRisque = new Map<string, EvaluationResponse>();
    for (const evaluation of this.evaluations) {
      parRisque.set(evaluation.codeRisque, evaluation);
    }
    return Array.from(parRisque.values());
  }

  get filteredEvaluations(): EvaluationResponse[] {
    const terme = this.searchTerm.trim().toLowerCase();
    if (!terme) return this.latestEvaluations;
    return this.latestEvaluations.filter(e =>
      e.code.toLowerCase().includes(terme) ||
      e.libelleRisque?.toLowerCase().includes(terme)
    );
  }

  readonly impactLevels = [5, 4, 3, 2, 1];
  readonly probLevels = [1, 2, 3, 4, 5];

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

  getEvaluationsForCell(impact: number, probabilite: number): EvaluationResponse[] {
    return this.filteredEvaluations.filter(e => e.impactResiduel === impact && e.probabiliteResiduelle === probabilite);
  }

  getCellColor(impact: number, probabilite: number): string {
    const score = impact * probabilite;
    if (score >= 15) return 'bg-red-500';
    if (score >= 8) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Élevé';
    if (score >= 8) return 'Moyen';
    return 'Faible';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 8) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  viewEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code]);
  }

  countByScore(min: number, max: number): number {
    return this.filteredEvaluations.filter(e => {
      const score = e.impactResiduel * e.probabiliteResiduelle;
      return score >= min && score <= max;
    }).length;
  }

  onCellClick(impact: number, prob: number): void {
    const evals = this.getEvaluationsForCell(impact, prob);
    if (evals.length > 0) {
      // Plusieurs évaluations peuvent partager la même case (ré-évaluations
      // successives d'un même risque) : on ouvre la plus récente, pas la
      // première rencontrée.
      this.viewEvaluation(evals[evals.length - 1].code);
    }
  }

  hasEvaluationsForImpact(impact: number): boolean {
    return this.probLevels.some(prob => this.getEvaluationsForCell(impact, prob).length > 0);
  }

  hasAnyEvaluation(): boolean {
    return this.impactLevels.some(impact => this.hasEvaluationsForImpact(impact));
  }
}