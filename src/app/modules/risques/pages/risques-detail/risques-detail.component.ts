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

import {
  AvisHistoriqueResponse,
  AvisRisque,
  RisqueResponse,
  StatutRisque,
  TypeRisque
} from '../../../../core/models/risque.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';

@Component({
  standalone: true,
  selector: 'app-risques-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './risques-detail.component.html'
})
export class RisquesDetailComponent implements OnInit, OnDestroy {

  risque: RisqueResponse | null = null;

  loading = false;
  error: string | null = null;

  /** Toutes les (ré)évaluations de ce risque, dans leur ordre de création (voir loadHistorique). */
  historique: EvaluationResponse[] = [];
  loadingHistorique = false;
  private historiqueChart: Chart | null = null;

  /** Historique des avis de validation (Transmis, Validé, Différé, Rejeté) de ce risque. */
  historiqueAvis: AvisHistoriqueResponse[] = [];
  loadingHistoriqueAvis = false;

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

    this.loadRisque();
  }

  ngOnDestroy(): void {
    this.historiqueChart?.destroy();
  }

  loadRisque(): void {

    const code = this.route.snapshot.paramMap.get('code');

    if (!code) {

      this.router.navigate(['/risques']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.risqueService.getByCode(code).subscribe({

      next: (risque) => {

        this.risque = risque;

        this.loading = false;

        this.cdr.detectChanges();

        this.loadHistorique(risque.code);
        this.loadHistoriqueAvis(risque.code);
      },

      error: (err) => {

        this.loading = false;
        this.error = err?.message || 'Impossible de charger le risque';

        this.cdr.detectChanges();
      }
    });
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
        // Silencieux : l'historique est une vue complémentaire, son échec
        // ne doit pas empêcher la consultation du risque lui-même.
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

  private loadHistoriqueAvis(codeRisque: string): void {
    this.loadingHistoriqueAvis = true;

    this.risqueService.getHistoriqueAvis(codeRisque).subscribe({
      next: (historiqueAvis) => {
        this.historiqueAvis = historiqueAvis;
        this.loadingHistoriqueAvis = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Silencieux : vue complémentaire, ne doit pas bloquer la fiche du risque.
        this.loadingHistoriqueAvis = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvisLabel(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'Validé';
      case AvisRisque.DIFFERE: return 'Différé';
      case AvisRisque.REJETE: return 'Rejeté';
      case AvisRisque.EN_ATTENTE: return 'Transmis, en attente d\'avis';
      default: return '—';
    }
  }

  getAvisBadgeClass(avis?: AvisRisque): string {
    switch (avis) {
      case AvisRisque.VALIDE: return 'bg-green-100 text-green-700';
      case AvisRisque.DIFFERE: return 'bg-yellow-100 text-yellow-700';
      case AvisRisque.REJETE: return 'bg-red-100 text-red-700';
      case AvisRisque.EN_ATTENTE: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  editRisque(): void {

    if (this.risque) {

      this.router.navigate([
        '/risques',
        this.risque.code,
        'edit'
      ]);
    }
  }

  goBack(): void {
    this.router.navigate(['/risques']);
  }

  getStatutBadgeClass(statut: StatutRisque): string {

    switch (statut) {

      case StatutRisque.ACTIF:
        return 'bg-red-100 text-red-700';

      case StatutRisque.EN_COURS:
        return 'bg-blue-100 text-blue-700';

      case StatutRisque.MAITRISE:
        return 'bg-green-100 text-green-700';

      case StatutRisque.CLOTURE:
        return 'bg-gray-100 text-gray-700';

      case StatutRisque.SUPPRIME:
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutRisque): string {

    switch (statut) {

      case StatutRisque.ACTIF:
        return 'Actif';

      case StatutRisque.EN_COURS:
        return 'En cours';

      case StatutRisque.MAITRISE:
        return 'Maîtrisé';

      case StatutRisque.CLOTURE:
        return 'Clôturé';

      case StatutRisque.SUPPRIME:
        return 'Supprimé';

      default:
        return statut;
    }
  }

  getTypeBadgeClass(type: TypeRisque): string {

    switch (type) {

      case TypeRisque.STRATEGIQUE_PILOTAGE:
        return 'bg-pink-100 text-pink-700';

      case TypeRisque.OPERATIONNEL:
        return 'bg-orange-100 text-orange-700';

      case TypeRisque.FINANCIER:
        return 'bg-purple-100 text-purple-700';

      case TypeRisque.RESSOURCES_HUMAINES:
        return 'bg-yellow-100 text-yellow-700';

      case TypeRisque.ETHIQUE_DEONTOLOGIE_FRAUDE:
        return 'bg-red-100 text-red-700';

      case TypeRisque.JURIDIQUE:
        return 'bg-indigo-100 text-indigo-700';

      case TypeRisque.INFORMATIQUE:
        return 'bg-cyan-100 text-cyan-700';

      case TypeRisque.IMAGE_REPUTATION:
        return 'bg-rose-100 text-rose-700';

      case TypeRisque.GESTION_CONNAISSANCE:
        return 'bg-emerald-100 text-emerald-700';

      case TypeRisque.EXTERNE:
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeLabel(type: TypeRisque): string {

    switch (type) {

      case TypeRisque.STRATEGIQUE_PILOTAGE:
        return 'Stratégique / Pilotage';

      case TypeRisque.OPERATIONNEL:
        return 'Opérationnel';

      case TypeRisque.FINANCIER:
        return 'Financier';

      case TypeRisque.RESSOURCES_HUMAINES:
        return 'Ressources humaines';

      case TypeRisque.ETHIQUE_DEONTOLOGIE_FRAUDE:
        return 'Éthique / Déontologie / Fraude';

      case TypeRisque.JURIDIQUE:
        return 'Juridique';

      case TypeRisque.INFORMATIQUE:
        return 'Informatique';

      case TypeRisque.IMAGE_REPUTATION:
        return 'Image / Réputation';

      case TypeRisque.GESTION_CONNAISSANCE:
        return 'Gestion de la connaissance';

      case TypeRisque.EXTERNE:
        return 'Externe';

      default:
        return type;
    }
  }

  // ========== Helpers pour les bonnes pratiques typées ==========

  cleanPratiqueText(pratique: string): string {
    return pratique.replace(/^\[(Prévention|Protection)\]\s*/, '');
  }

  isPrevention(pratique: string): boolean {
    return pratique.startsWith('[Prévention]');
  }

  isProtection(pratique: string): boolean {
    return pratique.startsWith('[Protection]');
  }
}