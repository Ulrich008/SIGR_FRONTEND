import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-evaluations-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './evaluations-detail.component.html'
})
export class EvaluationsDetailComponent implements OnInit {
  evaluation: EvaluationResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private route: ActivatedRoute,
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
    this.loadEvaluation();
  }

  loadEvaluation(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/evaluations']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.evaluationService.getByCode(code).subscribe({
      next: (evaluation) => {
        this.evaluation = evaluation;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'évaluation';
        this.cdr.detectChanges();
      }
    });
  }

  editEvaluation(): void {
    if (this.evaluation) {
      this.router.navigate(['/evaluations', this.evaluation.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/evaluations']);
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
}
