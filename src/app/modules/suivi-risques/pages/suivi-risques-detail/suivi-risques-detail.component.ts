import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { AuthService } from '../../../../core/services/auth.service';

import { RisqueService } from '../../../../core/services/risque.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';

import { RisqueResponse } from '../../../../core/models/risque.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { IndicateurPerformanceResponse } from '../../../../core/models/indicateur-performance.model';
import { StatutSuiviRecommandation } from '../../../../core/models/suivi-recommandation.model';

@Component({
  standalone: true,
  selector: 'app-suivi-risques-detail',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './suivi-risques-detail.component.html'
})
export class SuiviRisquesDetailComponent implements OnInit {

  menuItems: MenuItem[];

  risque: RisqueResponse | null = null;
  evaluations: EvaluationResponse[] = [];
  indicateurs: IndicateurPerformanceResponse[] = [];

  chartLabels: string[] = [];
  scoreInherentSeries: number[] = [];
  scoreResiduelSeries: number[] = [];
  dernierScoreResiduel: number | null = null;

  bonnesPratiquesExistantes: string[] = [];
  bonnesPratiquesInexistantes: string[] = [];
  tauxCouverture: number | null = null;

  loading = false;
  error: string | null = null;

  private chart: Chart | null = null;

  showSuiviModal = false;
  statutSelectionne: StatutSuiviRecommandation | null = null;
  decision = '';

  StatutSuiviRecommandation = StatutSuiviRecommandation;

  constructor(
    private risqueService: RisqueService,
    private evaluationService: EvaluationService,
    private indicateurService: IndicateurPerformanceService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canSuivre(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'MANAGER_RISQUE', 'CMMR']);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/suivi-risques']);
      return;
    }

    this.load(code);
  }

  load(code: string): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      risque: this.risqueService.getByCode(code),
      evaluations: this.evaluationService.getAll(),
      indicateurs: this.indicateurService.getAll()
    }).subscribe({
      next: ({ risque, evaluations, indicateurs }) => {
        this.risque = risque;
        this.evaluations = evaluations.filter(e => e.codeRisque === risque.code);
        this.indicateurs = indicateurs.filter(i => i.codeRisque === risque.code);

        const derniere = this.evaluations.length > 0 ? this.evaluations[this.evaluations.length - 1] : null;
        this.bonnesPratiquesExistantes = this.splitLignes(derniere?.controleExistants);
        this.bonnesPratiquesInexistantes = this.splitLignes(derniere?.controleInexistants);
        const totalPratiques = this.bonnesPratiquesExistantes.length + this.bonnesPratiquesInexistantes.length;
        this.tauxCouverture = totalPratiques > 0
          ? Math.round((this.bonnesPratiquesExistantes.length / totalPratiques) * 100)
          : null;

        this.chartLabels = this.evaluations.map((e, i) => i === 0 ? 'Initiale' : `Réévaluation ${i}`);
        this.scoreInherentSeries = this.evaluations.map(e => e.scoreInherent);
        this.scoreResiduelSeries = this.evaluations.map(e => e.scoreResiduel);
        this.dernierScoreResiduel = derniere ? derniere.scoreResiduel : null;

        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le suivi de ce risque';
        this.cdr.detectChanges();
      }
    });
  }

  private splitLignes(texte?: string): string[] {
    if (!texte) return [];
    return texte.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  private renderChart(): void {
    this.chart?.destroy();
    this.chart = null;

    if (this.evaluations.length < 2) return;

    const canvas = document.getElementById('suivi-risque-chart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            label: 'Inhérent',
            data: this.scoreInherentSeries,
            borderColor: '#cbd5e1',
            backgroundColor: 'transparent',
            borderDash: [4, 3],
            borderWidth: 1.5,
            pointRadius: 3,
            tension: 0.4
          },
          {
            label: 'Résiduel',
            data: this.scoreResiduelSeries,
            borderColor: '#1a5c38',
            backgroundColor: 'rgba(26, 92, 56, 0.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
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
          legend: { display: true, position: 'bottom' },
          tooltip: {
            backgroundColor: '#0f2f1f',
            padding: 8,
            callbacks: {
              label: (c) => `${c.dataset.label}: ${c.raw}/25`
            }
          }
        },
        scales: {
          y: { min: 0, max: 25 }
        }
      }
    });
  }

  retour(): void {
    this.router.navigate(['/suivi-risques']);
  }

  ouvrirSuiviModal(): void {
    if (!this.risque || !this.canSuivre) return;
    this.statutSelectionne = this.risque.statutSuivi ?? null;
    this.decision = this.risque.decisionSuivi ?? '';
    this.showSuiviModal = true;
  }

  fermerSuiviModal(): void {
    this.showSuiviModal = false;
    this.statutSelectionne = null;
    this.decision = '';
  }

  enregistrerSuivi(): void {
    if (!this.risque || !this.statutSelectionne) return;

    this.risqueService.enregistrerSuivi(this.risque.code, {
      statutSuivi: this.statutSelectionne,
      decision: this.decision
    }).subscribe({
      next: (updated) => {
        this.risque = updated;
        Swal.fire({ title: 'Suivi enregistré', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          this.fermerSuiviModal();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        Swal.fire({ title: 'Erreur', text: err?.message || "Impossible d'enregistrer le suivi", icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  getStatutLabel(statut?: StatutSuiviRecommandation): string {
    switch (statut) {
      case StatutSuiviRecommandation.NON_ENTAME: return 'Non entamé';
      case StatutSuiviRecommandation.EN_COURS: return 'En cours';
      case StatutSuiviRecommandation.REALISEE: return 'Réalisée';
      case StatutSuiviRecommandation.NON_REALISEE: return 'Non réalisée';
      default: return 'Non renseigné';
    }
  }

  getStatutBadgeClass(statut?: StatutSuiviRecommandation): string {
    switch (statut) {
      case StatutSuiviRecommandation.NON_ENTAME: return 'bg-slate-100 text-slate-600';
      case StatutSuiviRecommandation.EN_COURS: return 'bg-amber-100 text-amber-700';
      case StatutSuiviRecommandation.REALISEE: return 'bg-emerald-100 text-emerald-700';
      case StatutSuiviRecommandation.NON_REALISEE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-400';
    }
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

  getCouvertureBarColor(taux: number): string {
    if (taux >= 75) return 'bg-emerald-500';
    if (taux >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
