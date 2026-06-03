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
  @ViewChild('dateChart')     dateChartRef!:      ElementRef<HTMLCanvasElement>;

  // Instances Chart.js à détruire proprement
  private overviewChart?: Chart;
  private statutChart?:   Chart;
  private radarChart?:    Chart;
  private dateChart?:     Chart;
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
    this.buildDateChart();
    this.buildMiniCharts();
  }

  /** Bar chart groupé : valeurObtenue vs valeurCible */
  private buildOverviewChart(): void {
    const canvas = this.overviewChartRef?.nativeElement;
    if (!canvas) return;

    // Filtrer les indicateurs de type NUMERIQUE uniquement
    const numericIndicateurs = this.indicateurs.filter(i => i.typeUniteMesure !== 'DATE');
    
    if (numericIndicateurs.length === 0) return;

    const labels  = numericIndicateurs.map(i => i.code);
    const obtenues = numericIndicateurs.map(i => this.toNumber(i.valeurObtenue, 0));
    const cibles   = numericIndicateurs.map(i => this.toNumber(i.valeurCible, 100));

    this.overviewChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Valeur obtenue',
            data: obtenues,
            backgroundColor: numericIndicateurs.map(i =>
              this.getChartColor(i.valeurObtenue, i.valeurCible, 0.8)
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
                const ind = numericIndicateurs[ctx.dataIndex];
                return ` ${ctx.dataset.label}: ${ctx.raw} ${ind?.libelleUniteMesure ?? ''}`;
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

    const enCours = this.countByStatut('Plan de mitigation en cours conformément au calendrier');
    const attention = this.countByStatut('Attention : échéance proche, suivi renforcé requis');
    const enRetard = this.countByStatut('Échéance dépassée - Action de mitigation en retard');
    const nonDisponible = this.countByStatut('Informations de suivi non disponibles');

    this.statutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['En cours', 'Attention', 'En retard', 'Non disponible'],
        datasets: [{
          data: [enCours, attention, enRetard, nonDisponible],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'],
          borderColor: ['#fff', '#fff', '#fff', '#fff'],
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
      Math.min(this.getPerformancePercentage(i.valeurObtenue, i.valeurCible), 150)
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

  /** Bar chart : écart en jours pour les indicateurs de type DATE */
  private buildDateChart(): void {
    const canvas = this.dateChartRef?.nativeElement;
    if (!canvas) return;

    // Filtrer les indicateurs de type DATE
    const dateIndicateurs = this.indicateurs.filter(i => i.typeUniteMesure === 'DATE');
    
    if (dateIndicateurs.length === 0) return;

    const labels = dateIndicateurs.map(i => i.code);
    const ecarts = dateIndicateurs.map(i => i.ecartCible || 0);
    const datesCibles = dateIndicateurs.map(i => i.valeurCible || '-');
    const datesObtenues = dateIndicateurs.map(i => i.valeurObtenue || '-');

    this.dateChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Écart (jours)',
          data: ecarts,
          backgroundColor: ecarts.map(e => {
            if (e > 0) return 'rgba(239, 68, 68, 0.8)'; // Rouge pour retard
            if (e < 0) return 'rgba(34, 197, 94, 0.8)'; // Vert pour avance
            return 'rgba(100, 116, 139, 0.8)'; // Gris pour égalité
          }),
          borderColor: ecarts.map(e => {
            if (e > 0) return '#dc2626';
            if (e < 0) return '#16a34a';
            return '#64748b';
          }),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (ctx) => {
                const index = ctx[0].dataIndex;
                return `Indicateur : ${labels[index]}`;
              },
              label: (ctx) => {
                const index = ctx.dataIndex;
                const ecart = ecarts[index];
                const dateCible = datesCibles[index];
                const dateObtenue = datesObtenues[index];
                const sign = ecart > 0 ? '+' : '';
                const status = ecart > 0 ? '🔴 Retard' : ecart < 0 ? '🟢 En avance' : '⚪ À temps';
                return [
                  `${status} : ${sign}${ecart} jour(s)`,
                  `Date cible : ${dateCible}`,
                  `Date obtenue : ${dateObtenue}`
                ];
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { color: '#f1f5f9' }, 
            ticks: { font: { size: 11 } },
            title: {
              display: true,
              text: 'Écart en jours',
              font: { size: 12, weight: 'bold' },
              color: '#64748b'
            }
          },
          y: { 
            grid: { display: false }, 
            ticks: { font: { size: 11 } }
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
      // Ne pas créer de mini graphe pour les indicateurs de type DATE
      if (indicateur.typeUniteMesure === 'DATE') return;

      const canvas = document.getElementById(`mini-chart-${i}`) as HTMLCanvasElement;
      if (!canvas) return;

      const pct       = Math.min(this.getPerformancePercentage(indicateur.valeurObtenue, indicateur.valeurCible), 100);
      const remaining = 100 - pct;
      const color     = this.getChartColor(indicateur.valeurObtenue, indicateur.valeurCible, 1);

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
    this.dateChart?.destroy();
    this.miniCharts.forEach(c => c.destroy());
    this.miniCharts = [];
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  hasDateIndicateurs(): boolean {
    return this.indicateurs.some(i => i.typeUniteMesure === 'DATE');
  }

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

  toNumber(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'Plan de mitigation en cours conformément au calendrier':
        return 'bg-green-100 text-green-700';
      case 'Attention : échéance proche, suivi renforcé requis':
        return 'bg-amber-100 text-amber-700';
      case 'Échéance dépassée - Action de mitigation en retard':
        return 'bg-red-100 text-red-700';
      case 'Informations de suivi non disponibles':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getPerformancePercentage(valeurObtenue: string | number | undefined, valeurCible: string | number | undefined): number {
    const obtenueNum = typeof valeurObtenue === 'string' ? this.toNumber(valeurObtenue, 0) : (valeurObtenue ?? 0);
    const cibleNum = typeof valeurCible === 'string' ? this.toNumber(valeurCible, 100) : (valeurCible ?? 100);
    if (!obtenueNum || !cibleNum) return 0;
    return (obtenueNum / cibleNum) * 100;
  }

  getPerformanceTextColor(valeurObtenue: string | number | undefined, valeurCible: string | number | undefined): string {
    const pct = this.getPerformancePercentage(valeurObtenue, valeurCible);
    if (pct >= 100) return 'text-green-600';
    if (pct >= 75)  return 'text-yellow-600';
    return 'text-red-600';
  }

  /** Couleur Chart.js selon le taux d'atteinte */
  private getChartColor(valeurObtenue: string | number | undefined, valeurCible: string | number | undefined, alpha: number): string {
    const pct = this.getPerformancePercentage(valeurObtenue, valeurCible);
    if (pct >= 100) return `rgba(34, 197, 94, ${alpha})`;   // vert
    if (pct >= 75)  return `rgba(234, 179, 8, ${alpha})`;   // jaune
    return           `rgba(239, 68, 68, ${alpha})`;          // rouge
  }

  countByStatut(statut: string): number {
    return this.indicateurs.filter(i => i.statut === statut).length;
  }

  formatValue(value: string | number | undefined, uniteMesure?: string): string {
    const numValue = typeof value === 'string' ? this.toNumber(value, 0) : (value ?? 0);
    if (!uniteMesure) return `${numValue}`;
    
    switch (uniteMesure) {
      case 'Pourcentage':
        return `${numValue}%`;
      case 'Heure':
        return `${numValue}h`;
      case 'Minute':
        return `${numValue}min`;
      case 'Jour':
        return `${numValue}j`;
      case 'Euro':
        return `${numValue}€`;
      case 'Score sur 10':
        return `${numValue}/10`;
      case 'Score sur 100':
        return `${numValue}/100`;
      case 'Mètre cube':
        return `${numValue}m³`;
      case 'Kilogramme':
        return `${numValue}kg`;
      case 'Litre':
        return `${numValue}L`;
      default:
        return `${numValue} ${uniteMesure}`;
    }
  }
}