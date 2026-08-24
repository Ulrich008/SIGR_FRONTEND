import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

import { RisqueService } from '../../../../core/services/risque.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';
import { AuthService } from '../../../../core/services/auth.service';

import { RisqueResponse } from '../../../../core/models/risque.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { IndicateurPerformanceResponse } from '../../../../core/models/indicateur-performance.model';

interface RisqueSuiviVM {
  risque: RisqueResponse;
  evaluations: EvaluationResponse[];
  chartLabels: string[];
  scoreInherentSeries: number[];
  scoreResiduelSeries: number[];
  dernierScoreResiduel: number | null;
  bonnesPratiquesExistantes: string[];
  bonnesPratiquesInexistantes: string[];
  tauxCouverture: number | null;
  indicateurs: IndicateurPerformanceResponse[];
}

@Component({
  standalone: true,
  selector: 'app-suivi-risques-list',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './suivi-risques-list.component.html'
})
export class SuiviRisquesListComponent implements OnInit {

  menuItems: MenuItem[];

  loading = false;
  error: string | null = null;
  searchTerm = '';

  viewModels: RisqueSuiviVM[] = [];
  filteredViewModels: RisqueSuiviVM[] = [];
  pagedViewModels: RisqueSuiviVM[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private charts = new Map<string, Chart>();

  constructor(
    private risqueService: RisqueService,
    private evaluationService: EvaluationService,
    private indicateurService: IndicateurPerformanceService,
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
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      risques: this.risqueService.getAll(),
      evaluations: this.evaluationService.getAll(),
      indicateurs: this.indicateurService.getAll()
    }).subscribe({
      next: ({ risques, evaluations, indicateurs }) => {
        this.viewModels = risques.map(risque => this.buildViewModel(risque, evaluations, indicateurs));
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le suivi des risques';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Un risque peut être réévalué : plusieurs Evaluation lui sont alors
   * rattachées, renvoyées par l'API dans leur ordre de création (même
   * convention que risques-detail/evaluations-form). On garde cet ordre
   * pour la courbe de tendance, et la dernière évaluation pour les bonnes
   * pratiques existantes/inexistantes actuellement constatées.
   */
  private buildViewModel(
    risque: RisqueResponse,
    allEvaluations: EvaluationResponse[],
    allIndicateurs: IndicateurPerformanceResponse[]
  ): RisqueSuiviVM {
    const evaluations = allEvaluations.filter(e => e.codeRisque === risque.code);
    const derniere = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;

    const bonnesPratiquesExistantes = this.splitLignes(derniere?.controleExistants);
    const bonnesPratiquesInexistantes = this.splitLignes(derniere?.controleInexistants);
    const totalPratiques = bonnesPratiquesExistantes.length + bonnesPratiquesInexistantes.length;

    return {
      risque,
      evaluations,
      chartLabels: evaluations.map((e, i) => i === 0 ? 'Initiale' : `Réévaluation ${i}`),
      scoreInherentSeries: evaluations.map(e => e.scoreInherent),
      scoreResiduelSeries: evaluations.map(e => e.scoreResiduel),
      dernierScoreResiduel: derniere ? derniere.scoreResiduel : null,
      bonnesPratiquesExistantes,
      bonnesPratiquesInexistantes,
      tauxCouverture: totalPratiques > 0
        ? Math.round((bonnesPratiquesExistantes.length / totalPratiques) * 100)
        : null,
      indicateurs: allIndicateurs.filter(i => i.codeRisque === risque.code)
    };
  }

  private splitLignes(texte?: string): string[] {
    if (!texte) return [];
    return texte.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredViewModels = !terme
      ? this.viewModels
      : this.viewModels.filter(vm =>
          vm.risque.code.toLowerCase().includes(terme) ||
          vm.risque.libelle.toLowerCase().includes(terme) ||
          vm.risque.nomProcessus?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredViewModels.length / this.itemsPerPage));
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.pagedViewModels = this.filteredViewModels.slice(startIndex, startIndex + this.itemsPerPage);
    this.cdr.detectChanges();
    setTimeout(() => this.renderCharts(), 0);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Sparklines de tendance : une par risque ayant au moins deux évaluations
   * (une seule évaluation ne trace pas de tendance). Recréées à chaque
   * filtrage puisque *ngFor détruit/recrée les <canvas> correspondants.
   */
  private renderCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();

    for (const vm of this.pagedViewModels) {
      if (vm.evaluations.length < 2) continue;

      const canvas = document.getElementById('spark-' + vm.risque.code) as HTMLCanvasElement | null;
      if (!canvas) continue;

      const chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: vm.chartLabels,
          datasets: [
            {
              label: 'Inhérent',
              data: vm.scoreInherentSeries,
              borderColor: '#cbd5e1',
              backgroundColor: 'transparent',
              borderDash: [4, 3],
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.4
            },
            {
              label: 'Résiduel',
              data: vm.scoreResiduelSeries,
              borderColor: '#1a5c38',
              backgroundColor: 'rgba(26, 92, 56, 0.08)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointBackgroundColor: '#1a5c38',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f2f1f',
              padding: 8,
              titleFont: { size: 11 },
              bodyFont: { size: 11 },
              callbacks: {
                label: (c) => `${c.dataset.label}: ${c.raw}/25`
              }
            }
          },
          scales: {
            x: { display: false },
            y: { display: false, min: 0, max: 25 }
          }
        }
      });

      this.charts.set(vm.risque.code, chart);
    }
  }

  goToRisque(code: string): void {
    this.router.navigate(['/suivi-risques', code]);
  }

  // ========== Stats globales (indépendantes du filtre de recherche) ==========

  get totalRisques(): number {
    return this.viewModels.length;
  }

  get risquesNonEvalues(): number {
    return this.viewModels.filter(vm => vm.evaluations.length === 0).length;
  }

  get couvertureMoyenne(): number | null {
    const avecTaux = this.viewModels.filter(vm => vm.tauxCouverture !== null);
    if (avecTaux.length === 0) return null;
    const somme = avecTaux.reduce((acc, vm) => acc + (vm.tauxCouverture ?? 0), 0);
    return Math.round(somme / avecTaux.length);
  }

  get indicateursEnAlerte(): number {
    return this.viewModels.reduce((acc, vm) =>
      acc + vm.indicateurs.filter(i => i.statut === 'Échéance dépassée - Action de mitigation en retard' || i.statut === 'Attention : échéance proche, suivi renforcé requis').length,
      0
    );
  }

  // ========== Présentation ==========

  getCouvertureBarColor(taux: number): string {
    if (taux >= 75) return 'bg-emerald-500';
    if (taux >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  }

  getIndicateurDotClass(statut: string): string {
    switch (statut) {
      case 'Objectif atteint':
        return 'bg-emerald-500';
      case 'Plan de mitigation en cours conformément au calendrier':
        return 'bg-green-500';
      case 'Attention : échéance proche, suivi renforcé requis':
        return 'bg-amber-400';
      case 'Échéance dépassée - Action de mitigation en retard':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  }

  getScoreBadgeClass(score: number | null): string {
    if (score === null) return 'bg-slate-100 text-slate-500';
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 8) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  }
}
