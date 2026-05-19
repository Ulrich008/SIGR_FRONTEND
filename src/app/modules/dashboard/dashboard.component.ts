import { Component, AfterViewInit, ChangeDetectionStrategy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service';
import { RisqueService } from '../../core/services/risque.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { RisqueResiduelService } from '../../core/services/risque-residuel.service';
import { IndicateurPerformanceService } from '../../core/services/indicateur-performance.service';
import { PlanMitigationService } from '../../core/services/plan-mitigation.service';
import { ActionService } from '../../core/services/action.service';
import { ProcessusService } from '../../core/services/processus.service';
import { AgentService } from '../../core/services/agent.service';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit {
  private isBrowser: boolean;

  activeMenu = 'Tableau de bord';
  menuItems: MenuItem[];

  // Statistics
  totalRisques = 0;
  risquesCritiques = 0;
  totalProcessus = 0;
  totalIndicateurs = 0;
  totalEvaluations = 0;
  totalRisquesResiduels = 0;
  totalPlansMitigation = 0;
  totalActions = 0;
  totalAgents = 0;

  // Chart data
  barData: { name: string; value: number; dark: boolean }[] = [];

  activities: { initials: string; bg: string; label: string; user: string; time: string }[] = [];

  loading = true;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private risqueService: RisqueService,
    private evaluationService: EvaluationService,
    private risqueResiduelService: RisqueResiduelService,
    private indicateurService: IndicateurPerformanceService,
    private planMitigationService: PlanMitigationService,
    private actionService: ActionService,
    private processusService: ProcessusService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.menuItems = this.menuService.items;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      risques: this.risqueService.getAll(),
      evaluations: this.evaluationService.getAll(),
      risquesResiduels: this.risqueResiduelService.getAll(),
      indicateurs: this.indicateurService.getAll(),
      plansMitigation: this.planMitigationService.getAll(),
      actions: this.actionService.getAll(),
      processus: this.processusService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.totalRisques = data.risques.length;
        this.risquesCritiques = data.risques.filter((r: any) => r.niveauRisque === 'CRITIQUE').length;
        this.totalProcessus = data.processus.length;
        this.totalIndicateurs = data.indicateurs.length;
        this.totalEvaluations = data.evaluations.length;
        this.totalRisquesResiduels = data.risquesResiduels.length;
        this.totalPlansMitigation = data.plansMitigation.length;
        this.totalActions = data.actions.length;
        this.totalAgents = data.agents.length;

        // Build chart data based on processus
        this.barData = data.processus.map((p: any, i: number) => ({
          name: p.code,
          value: data.risques.filter((r: any) => r.codeProcessus === p.code).length,
          dark: i % 2 === 0
        }));

        // Build activities
        this.activities = [
          { initials: "MD", bg: "#6b9e7a", label: `${this.totalRisques} risques identifiés`, user: "Système", time: "Aujourd'hui" },
          { initials: "MD", bg: "#6b9e7a", label: `${this.totalEvaluations} évaluations complétées`, user: "Système", time: "Aujourd'hui" },
          { initials: "AD", bg: "#4b7a5e", label: `${this.totalPlansMitigation} plans de mitigation`, user: "Système", time: "Aujourd'hui" },
          { initials: "AD", bg: "#4b7a5e", label: `${this.totalActions} actions en cours`, user: "Système", time: "Aujourd'hui" },
        ];

        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initChart(), 100);
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setActiveMenu(label: string): void {
    this.activeMenu = label;
  }

  initChart(): void {
    const ctx = document.getElementById('riskChart') as HTMLCanvasElement;
    if (!ctx) { console.warn('Canvas riskChart non trouvé'); return; }
    try {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.barData.map(i => i.name),
          datasets: [{
            data: this.barData.map(i => i.value),
            backgroundColor: this.barData.map(i => i.dark ? '#1a5c38' : '#7dba9a'),
            borderRadius: 3,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => `Valeur: ${c.raw}` } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { display: false } },
            x: {
              ticks: { font: { size: 10 } },
              grid: { display: false }
            }
          }
        }
      });
    } catch (e) { console.error('Erreur graphique:', e); }
  }
}