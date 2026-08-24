import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';

import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { AuthService } from '../../../../core/services/auth.service';

import { RisqueResponse } from '../../../../core/models/risque.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';

@Component({
  standalone: true,
  selector: 'app-risques-historique-evolution',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './risques-historique-evolution.component.html'
})
export class RisquesHistoriqueEvolutionComponent implements OnInit, OnDestroy {

  risque: RisqueResponse | null = null;
  code: string | null = null;

  loading = false;
  error: string | null = null;

  /** Toutes les (ré)évaluations de ce risque, dans leur ordre de création (voir loadHistorique). */
  historique: EvaluationResponse[] = [];
  loadingHistorique = false;
  private historiqueChart: Chart | null = null;

  menuItems: MenuItem[];

  constructor(
    private risqueService: RisqueService,
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

    this.code = this.route.snapshot.paramMap.get('code');

    if (!this.code) {
      this.router.navigate(['/risques']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.risqueService.getByCode(this.code).subscribe({
      next: (risque) => {
        this.risque = risque;
        this.loading = false;
        this.cdr.detectChanges();
        this.loadHistorique(risque.code);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le risque';
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.historiqueChart?.destroy();
  }

  /**
   * Une réévaluation crée une nouvelle ligne d'évaluation sans supprimer
   * l'ancienne (voir EvaluationServiceImpl.create côté backend) : ce risque
   * peut donc avoir plusieurs évaluations. On les récupère toutes et on les
   * garde dans leur ordre de création (l'API ne renvoie pas de date de
   * création exploitable côté DTO, mais l'ordre du tableau y correspond —
   * même convention que dans evaluations-form et matrices-list).
   */
  private loadHistorique(codeRisque: string): void {
    this.loadingHistorique = true;

    this.evaluationService.getAll().subscribe({
      next: (evaluations) => {
        this.historique = evaluations.filter(e => e.codeRisque === codeRisque);
        this.loadingHistorique = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initHistoriqueChart(), 0);
      },
      error: () => {
        this.loadingHistorique = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initHistoriqueChart(): void {
    if (this.historique.length < 2) {
      return;
    }

    const canvas = document.getElementById('historiqueChart') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    this.historiqueChart?.destroy();

    this.historiqueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.historique.map((e, i) => `${i === 0 ? 'Initiale' : 'Réévaluation ' + i}\n${e.code}`),
        datasets: [
          {
            label: 'Score inhérent',
            data: this.historique.map(e => e.scoreInherent),
            borderColor: '#94a3b8',
            backgroundColor: '#94a3b8',
            borderDash: [5, 4],
            tension: 0.3,
            pointRadius: 4
          },
          {
            label: 'Score résiduel',
            data: this.historique.map(e => e.scoreResiduel),
            borderColor: '#1a5c38',
            backgroundColor: '#1a5c38',
            tension: 0.3,
            pointRadius: 4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (c) => `${c.dataset.label}: ${c.raw} / 25`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 25,
            ticks: { stepSize: 5, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  viewEvaluation(code: string): void {
    this.router.navigate(['/evaluations', code]);
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 8) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  goBack(): void {
    this.router.navigate(['/risques', this.code]);
  }
}
