import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-matrices-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './matrices-list.component.html'
})
export class MatricesListComponent implements OnInit {
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

  getEvaluationsForCell(impact: number, probabilite: number): EvaluationResponse[] {
    return this.evaluations.filter(e => e.impact === impact && e.probabilite === probabilite);
  }

  getCellColor(impact: number, probabilite: number): string {
    const score = impact * probabilite;
    if (score >= 15) return 'bg-red-500';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5) return 'Moyen';
    return 'Faible';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  viewEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code]);
  }

  countByScore(min: number, max: number): number {
    return this.evaluations.filter(e => {
      const score = e.impact * e.probabilite;
      return score >= min && score <= max;
    }).length;
  }
  onCellClick(impact: number, prob: number): void {
  const evals = this.getEvaluationsForCell(impact, prob);
  if (evals.length > 0) {
    this.viewEvaluation(evals[0].code);
  }
}
}
