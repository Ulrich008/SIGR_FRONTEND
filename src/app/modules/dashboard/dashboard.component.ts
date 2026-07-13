import { Component, AfterViewInit, ChangeDetectionStrategy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service';
import { RisqueService } from '../../core/services/risque.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { IndicateurPerformanceService } from '../../core/services/indicateur-performance.service';
import { PlanMitigationService } from '../../core/services/plan-mitigation.service';
import { ActionService } from '../../core/services/action.service';
import { ProcessusService } from '../../core/services/processus.service';
import { AgentService } from '../../core/services/agent.service';
import { MinistereService } from '../../core/services/ministere.service';
import { AuthService } from '../../core/services/auth.service';
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
  totalPlansMitigation = 0;
  totalActions = 0;
  totalAgents = 0;

  // Ministère information
  ministereNom: string = '';
  ministereCode: string = '';
  ministereDescription: string = '';

  // Chart data
  barData: { name: string; value: number; dark: boolean }[] = [];

  activities: { type: 'risques' | 'evaluations' | 'mitigation' | 'actions'; label: string; user: string; time: string }[] = [];

  loading = true;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private risqueService: RisqueService,
    private evaluationService: EvaluationService,
    private indicateurService: IndicateurPerformanceService,
    private planMitigationService: PlanMitigationService,
    private actionService: ActionService,
    private processusService: ProcessusService,
    private agentService: AgentService,
    private ministereService: MinistereService,
    private authService: AuthService,
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
    // Récupérer le ministère de l'utilisateur connecté
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.codeMinistere) {
      this.ministereService.getAll().subscribe({
        next: (ministeres) => {
          const ministere = ministeres.find(m => m.code === currentUser.codeMinistere);
          if (ministere) {
            this.ministereNom = ministere.nom;
            this.ministereCode = ministere.code;
            this.ministereDescription = ministere.description || '';
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('Erreur chargement ministère:', err);
        }
      });
    }

    forkJoin({
      risques: this.risqueService.getAll(),
      evaluations: this.evaluationService.getAll(),
      indicateurs: this.indicateurService.getAll(),
      plansMitigation: this.planMitigationService.getAll(),
      actions: this.actionService.getAll(),
      processus: this.processusService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        // Un risque est "critique" quand son évaluation le classe au rang de
        // priorité le plus élevé (3 = "Zone d'audit et de traitement des
        // risques prioritaires", même échelle que celle utilisée dans
        // l'export Excel de la cartographie). Le champ "niveauRisque" utilisé
        // avant n'existe pas du tout sur Risque : le compteur restait donc
        // toujours à 0.
        const risquesCritiquesCount = data.evaluations.filter((e: any) => e.rangPriorite === 3).length;

        // Compteurs animés (0 → valeur finale) plutôt qu'un affichage brut
        this.animateCount(data.risques.length, v => this.totalRisques = v);
        this.animateCount(risquesCritiquesCount, v => this.risquesCritiques = v);
        this.animateCount(data.processus.length, v => this.totalProcessus = v);
        this.animateCount(data.indicateurs.length, v => this.totalIndicateurs = v);
        this.animateCount(data.evaluations.length, v => this.totalEvaluations = v);
        this.animateCount(data.plansMitigation.length, v => this.totalPlansMitigation = v);
        this.animateCount(data.actions.length, v => this.totalActions = v);
        this.animateCount(data.agents.length, v => this.totalAgents = v);

        // Build chart data based on processus
        this.barData = data.processus.map((p: any, i: number) => ({
          name: p.code,
          value: data.risques.filter((r: any) => r.codeProcessus === p.code).length,
          dark: i % 2 === 0
        }));

        // Build activities — construites à partir des données brutes de la
        // réponse (data.X.length), pas de this.totalX : ces derniers sont
        // encore en cours d'animation (0) à cet instant précis, et les
        // libellés ci-dessous sont de simples chaînes figées à la création.
        this.activities = [
          { type: 'risques', label: `${data.risques.length} risques identifiés`, user: "Système", time: "Aujourd'hui" },
          { type: 'evaluations', label: `${data.evaluations.length} évaluations complétées`, user: "Système", time: "Aujourd'hui" },
          { type: 'mitigation', label: `${data.plansMitigation.length} plans de mitigation`, user: "Système", time: "Aujourd'hui" },
          { type: 'actions', label: `${data.actions.length} actions en cours`, user: "Système", time: "Aujourd'hui" },
        ];

        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initChart(), 100);
      },
      error: (err: any) => {
        console.error('Erreur chargement dashboard:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setActiveMenu(label: string): void {
    this.activeMenu = label;
  }

  /**
   * Anime un compteur de 0 vers sa valeur finale (ease-out) au lieu de
   * l'afficher brut, pour un rendu plus vivant au chargement du dashboard.
   */
  private animateCount(target: number, setter: (value: number) => void, duration = 800): void {
    if (!this.isBrowser || target <= 0) {
      setter(target);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(target * eased));
      this.cdr.detectChanges();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
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