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
  
  // ✅ Ajout de Math pour l'utiliser dans le template
  Math = Math;

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

  // --- Méthodes pour les scores ---

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5)  return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5)  return 'Moyen';
    return 'Faible';
  }

  // --- Méthodes utilitaires pour l'affichage ---

  formatDate(date?: string): string {
    if (!date) return 'Non définie';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Date invalide' : d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getAgentLabel(): string {
    if (!this.evaluation) return 'Non assigné';
    if (this.evaluation.nomAgent && this.evaluation.matriculeAgent) {
      return `${this.evaluation.matriculeAgent} - ${this.evaluation.nomAgent}`;
    }
    return this.evaluation.nomAgent || this.evaluation.matriculeAgent || 'Non assigné';
  }

  getRiskLabel(): string {
    if (!this.evaluation) return '';
    return `${this.evaluation.code} - ${this.evaluation.libelleRisque}`;
  }

  getControlesExistants(): string {
    return this.evaluation?.controleExistants || 'Aucun contrôle existant renseigné';
  }

  getControlesInexistants(): string {
    return this.evaluation?.controleInexistants || 'Aucun contrôle inexistant renseigné';
  }

  getDejaSurvenuLabel(): string {
    return this.evaluation?.dejaSurvenu ? 'Oui' : 'Non';
  }

  getStrategieRisqueLabel(strategie: string): string {
    switch(strategie) {
      case 'TRAITER': return 'Traiter (ou réduire)';
      case 'TRANSFERER': return 'Transférer (ou partager)';
      case 'TOLERER': return 'Tolérer (ou accepter)';
      case 'TERMINER': return 'Terminer (ou supprimer)';
      default: return strategie;
    }
  }

  // --- Méthodes pour les couleurs des niveaux ---

  getNiveauColor(niveau: number): string {
    switch(niveau) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-emerald-100 text-emerald-700';
      case 3: return 'bg-yellow-100 text-yellow-700';
      case 4: return 'bg-orange-100 text-orange-700';
      case 5: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getNiveauLabel(niveau: number): string {
    switch(niveau) {
      case 1: return 'Très faible';
      case 2: return 'Faible';
      case 3: return 'Moyen';
      case 4: return 'Élevé';
      case 5: return 'Très élevé';
      default: return 'Non défini';
    }
  }

  // --- Méthodes pour les pourcentages de maîtrise ---

  calculateMaitrisePourcentage(): number {
    if (!this.evaluation) return 0;
    const totalControles = this.evaluation.protection + this.evaluation.prevention;
    const maxControles = 10; // 5 + 5
    return Math.round((totalControles / maxControles) * 100);
  }

  getMaitriseColor(pourcentage: number): string {
    if (pourcentage >= 80) return 'text-green-600';
    if (pourcentage >= 60) return 'text-emerald-600';
    if (pourcentage >= 40) return 'text-yellow-600';
    if (pourcentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  }

  // --- Méthodes pour l'amélioration potentielle ---

  getAmeliorationPotentielle(): number {
    if (!this.evaluation) return 0;
    const scoreMax = 25; // 5 * 5
    const amelioration = scoreMax - this.evaluation.scoreResiduel;
    return Math.max(0, amelioration);
  }

  getAmeliorationPourcentage(): number {
    if (!this.evaluation) return 0;
    const scoreMax = 25;
    const amelioration = scoreMax - this.evaluation.scoreResiduel;
    return Math.round((amelioration / scoreMax) * 100);
  }
}