import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AuthService } from '../../../../core/services/auth.service';

import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { ControleSecondNiveauService } from '../../../../core/services/controle-second-niveau.service';
import { RapportControleInterneResponse } from '../../../../core/models/controle-interne.model';
import { StatutSuiviRecommandation } from '../../../../core/models/suivi-recommandation.model';

@Component({
  standalone: true,
  selector: 'app-suivi-recommandations-ci-detail',
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: './suivi-recommandations-ci-detail.component.html'
})
export class SuiviRecommandationsCiDetailComponent implements OnInit {

  menuItems: MenuItem[];

  rapport: RapportControleInterneResponse | null = null;
  recommandations: string[] = [];
  loading = false;
  error: string | null = null;

  // Statut d'avancement (Contrôleur Interne) et décision (CCI) sont deux
  // actions distinctes, chacune réservée à son rôle — voir le document de
  // référence des profils.
  showStatutModal = false;
  statutSelectionne: StatutSuiviRecommandation | null = null;

  showDecisionModal = false;
  decision = '';

  StatutSuiviRecommandation = StatutSuiviRecommandation;

  constructor(
    private rapportService: RapportControleInterneService,
    private controleService: ControleSecondNiveauService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canModifierStatut(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CONTROLEUR_INTERNE']);
  }

  get canDecider(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CCI']);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/suivi-risques/recommandations-ci']);
      return;
    }

    this.load(code);
  }

  load(code: string): void {
    this.loading = true;
    this.error = null;

    this.rapportService.getByCode(code).subscribe({
      next: (rapport) => {
        this.rapport = rapport;
        this.controleService.getConstatsEtRecommandations(rapport.codeUniteAdministrative, rapport.codeProcessus).subscribe({
          next: (data) => {
            this.recommandations = data.recommandations;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.message || 'Impossible de charger les recommandations';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger ce rapport';
        this.cdr.detectChanges();
      }
    });
  }

  // ========== Statut d'avancement (Contrôleur Interne) ==========

  ouvrirStatutModal(): void {
    if (!this.canModifierStatut || !this.rapport) return;
    this.statutSelectionne = this.rapport.statutSuivi ?? null;
    this.showStatutModal = true;
  }

  fermerStatutModal(): void {
    this.showStatutModal = false;
    this.statutSelectionne = null;
  }

  enregistrerStatut(): void {
    if (!this.rapport || !this.statutSelectionne) return;

    this.rapportService.enregistrerStatutSuivi(this.rapport.code, {
      statutSuivi: this.statutSelectionne
    }).subscribe({
      next: () => {
        Swal.fire({ title: 'Statut enregistré', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          this.fermerStatutModal();
          this.load(this.rapport!.code);
        });
      },
      error: (err) => {
        Swal.fire({ title: 'Erreur', text: err?.message || "Impossible d'enregistrer le statut", icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  // ========== Décision (CCI) ==========

  ouvrirDecisionModal(): void {
    if (!this.canDecider || !this.rapport) return;
    this.decision = this.rapport.decisionSuivi ?? '';
    this.showDecisionModal = true;
  }

  fermerDecisionModal(): void {
    this.showDecisionModal = false;
    this.decision = '';
  }

  enregistrerDecision(): void {
    if (!this.rapport) return;

    this.rapportService.enregistrerDecisionSuivi(this.rapport.code, {
      decision: this.decision
    }).subscribe({
      next: () => {
        Swal.fire({ title: 'Décision enregistrée', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          this.fermerDecisionModal();
          this.load(this.rapport!.code);
        });
      },
      error: (err) => {
        Swal.fire({ title: 'Erreur', text: err?.message || "Impossible d'enregistrer la décision", icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  retour(): void {
    this.router.navigate(['/suivi-risques/recommandations-ci']);
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

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
