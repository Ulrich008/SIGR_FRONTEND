import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ChangeDetectorRef, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Chart,
  BarController, BarElement,
  DoughnutController, ArcElement,
  RadarController, RadialLinearScale, PointElement, LineElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Title
} from 'chart.js';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';
import { IndicateurPerformanceResponse } from '../../../../core/models/indicateur-performance.model';
import { AuthService } from '../../../../core/services/auth.service';

// Enregistrement des composants Chart.js nécessaires
Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  RadarController, RadialLinearScale, PointElement, LineElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Title
);

@Component({
  standalone: true,
  selector: 'app-indicateurs-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './indicateurs-list.component.html'
})
export class IndicateursListComponent implements OnInit, AfterViewInit, OnDestroy {

  indicateurs: IndicateurPerformanceResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Références aux canvas des graphes globaux
  @ViewChild('overviewChart') overviewChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statutChart')   statutChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart')    radarChartRef!:     ElementRef<HTMLCanvasElement>;

  // Instances Chart.js à détruire proprement
  private overviewChart?: Chart;
  private statutChart?:   Chart;
  private radarChart?:    Chart;
  private miniCharts: Chart[] = [];

  // Flag pour savoir si la vue est prête
  private viewReady = false;
  private dataReady = false;

  constructor(
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
    this.loadIndicateurs();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataReady) {
      this.buildAllCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  // ─── Chargement ────────────────────────────────────────────────────────────

  loadIndicateurs(): void {
    this.loading = true;
    this.error = null;
    this.indicateurService.getAll().subscribe({
      next: (indicateurs) => {
        this.indicateurs = indicateurs;
        this.loading = false;
        this.dataReady = true;
        this.cdr.detectChanges();
        // La vue doit se mettre à jour avant de créer les canvas
        setTimeout(() => {
          if (this.viewReady) {
            this.buildAllCharts();
          }
        }, 0);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les indicateurs';
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Création des graphes ────────────────────────────────────────────────

  private buildAllCharts(): void {
    this.destroyAllCharts();
    if (!this.indicateurs.length) return;

    this.buildOverviewChart();
    this.buildStatutChart();
    this.buildRadarChart();
    this.buildMiniCharts();
  }

  /** Bar chart groupé : valeurObtenue vs valeurCible */
  private buildOverviewChart(): void {
    const canvas = this.overviewChartRef?.nativeElement;
    if (!canvas) return;

    const labels  = this.indicateurs.map(i => i.code);
    const obtenues = this.indicateurs.map(i => i.valeurObtenue ?? 0);
    const cibles   = this.indicateurs.map(i => i.valeurCible ?? 100);

    this.overviewChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Valeur obtenue',
            data: obtenues,
            backgroundColor: this.indicateurs.map(i =>
              this.getChartColor(i.valeurObtenue ?? 0, i.valeurCible ?? 100, 0.8)
            ),
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Cible',
            data: cibles,
            backgroundColor: 'rgba(100, 116, 139, 0.2)',
            borderColor: 'rgba(100, 116, 139, 0.5)',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const ind = this.indicateurs[ctx.dataIndex];
                return ` ${ctx.dataset.label}: ${ctx.raw} ${ind?.uniteMesure ?? ''}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } }, beginAtZero: true }
        }
      }
    });
  }

  /** Doughnut : répartition par statut */
  private buildStatutChart(): void {
    const canvas = this.statutChartRef?.nativeElement;
    if (!canvas) return;

    const ok      = this.countByStatut('OK');
    const alerte  = this.countByStatut('ALERTE');
    const inconnu = this.countByStatut('INCONNU');

    this.statutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['OK', 'Alerte', 'Inconnu'],
        datasets: [{
          data: [ok, alerte, inconnu],
          backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} indicateur(s)`
            }
          }
        }
      }
    });
  }

  /** Radar : taux d'atteinte par indicateur */
  private buildRadarChart(): void {
    const canvas = this.radarChartRef?.nativeElement;
    if (!canvas) return;

    const labels = this.indicateurs.map(i => i.code);
    const taux   = this.indicateurs.map(i =>
      Math.min(this.getPerformancePercentage(i.valeurObtenue ?? 0, i.valeurCible ?? 100), 150)
    );

    this.radarChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Taux d\'atteinte (%)',
          data: taux,
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          borderColor: '#059669',
          borderWidth: 2,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 150,
            ticks: { stepSize: 50, font: { size: 10 }, backdropColor: 'transparent' },
            grid: { color: '#e2e8f0' },
            angleLines: { color: '#e2e8f0' },
            pointLabels: { font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw}% de la cible`
            }
          }
        }
      }
    });
  }

  /** Mini doughnut pour chaque indicateur */
  private buildMiniCharts(): void {
    this.miniCharts.forEach(c => c.destroy());
    this.miniCharts = [];

    this.indicateurs.forEach((indicateur, i) => {
      const canvas = document.getElementById(`mini-chart-${i}`) as HTMLCanvasElement;
      if (!canvas) return;

      const pct       = Math.min(this.getPerformancePercentage(indicateur.valeurObtenue ?? 0, indicateur.valeurCible ?? 100), 100);
      const remaining = 100 - pct;
      const color     = this.getChartColor(indicateur.valeurObtenue ?? 0, indicateur.valeurCible ?? 100, 1);

      const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [pct, remaining],
            backgroundColor: [color, '#f1f5f9'],
            borderWidth: 0,
            hoverOffset: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '72%',
          animation: { duration: 600 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          events: []
        }
      });

      this.miniCharts.push(chart);
    });
  }

  // ─── Destruction ─────────────────────────────────────────────────────────

  private destroyAllCharts(): void {
    this.overviewChart?.destroy();
    this.statutChart?.destroy();
    this.radarChart?.destroy();
    this.miniCharts.forEach(c => c.destroy());
    this.miniCharts = [];
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  createIndicateur(): void {
    this.router.navigate(['/indicateurs/nouveau']);
  }

  editIndicateur(code: string): void {
    this.router.navigate(['/indicateurs', code, 'edit']);
  }

  viewIndicateur(code: string): void {
    this.router.navigate(['/indicateurs', code]);
  }

  deleteIndicateur(code: string): void {
    Swal.fire({
      title: 'Supprimer cet indicateur ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.indicateurService.delete(code).subscribe({
          next: () => {
            Swal.fire({ title: 'Supprimé', text: 'L\'indicateur a bien été supprimé.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.loadIndicateurs();
          },
          error: (err) => {
            Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible de supprimer l\'indicateur', icon: 'error' });
          }
        });
      }
    });
  }

  // ─── Utilitaires ─────────────────────────────────────────────────────────

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'OK':    return 'bg-green-100 text-green-700';
      case 'ALERTE': return 'bg-red-100 text-red-700';
      default:      return 'bg-gray-100 text-gray-700';
    }
  }

  getPerformancePercentage(valeurObtenue: number, valeurCible: number): number {
    if (!valeurObtenue || !valeurCible) return 0;
    return (valeurObtenue / valeurCible) * 100;
  }

  getPerformanceTextColor(valeurObtenue: number, valeurCible: number): string {
    const pct = this.getPerformancePercentage(valeurObtenue, valeurCible);
    if (pct >= 100) return 'text-green-600';
    if (pct >= 75)  return 'text-yellow-600';
    return 'text-red-600';
  }

  /** Couleur Chart.js selon le taux d'atteinte */
  private getChartColor(valeurObtenue: number, valeurCible: number, alpha: number): string {
    const pct = this.getPerformancePercentage(valeurObtenue, valeurCible);
    if (pct >= 100) return `rgba(34, 197, 94, ${alpha})`;   // vert
    if (pct >= 75)  return `rgba(234, 179, 8, ${alpha})`;   // jaune
    return           `rgba(239, 68, 68, ${alpha})`;          // rouge
  }

  countByStatut(statut: string): number {
    return this.indicateurs.filter(i => i.statut === statut).length;
  }
}