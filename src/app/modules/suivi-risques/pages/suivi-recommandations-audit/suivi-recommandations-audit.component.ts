import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { AuthService } from '../../../../core/services/auth.service';

import { PlanAuditService } from '../../../../core/services/plan-audit.service';
import { PlanAuditResponse } from '../../../../core/models/audit.model';
import { StatutSuiviRecommandation } from '../../../../core/models/suivi-recommandation.model';

@Component({
  standalone: true,
  selector: 'app-suivi-recommandations-audit',
  imports: [CommonModule, FormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './suivi-recommandations-audit.component.html'
})
export class SuiviRecommandationsAuditComponent implements OnInit {

  menuItems: MenuItem[];

  plans: PlanAuditResponse[] = [];
  filteredPlans: PlanAuditResponse[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  showSuiviModal = false;
  selectedPlan: PlanAuditResponse | null = null;
  statutSelectionne: StatutSuiviRecommandation | null = null;
  decision = '';

  StatutSuiviRecommandation = StatutSuiviRecommandation;

  constructor(
    private planAuditService: PlanAuditService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canSuivre(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'AUDITEUR']);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.planAuditService.getAll().subscribe({
      next: (data) => {
        // Seuls les plans d'audit ayant une recommandation saisie sont
        // pertinents à suivre sur cet écran.
        this.plans = data.filter(p => !!p.recommandation && p.recommandation.trim().length > 0);
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || "Impossible de charger les recommandations d'audit";
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredPlans = !terme
      ? this.plans
      : this.plans.filter(p =>
          p.code.toLowerCase().includes(terme) ||
          p.libelle?.toLowerCase().includes(terme) ||
          p.nomUniteAdministrative?.toLowerCase().includes(terme) ||
          p.nomProcessus?.toLowerCase().includes(terme)
        );
  }

  ouvrirSuiviModal(plan: PlanAuditResponse): void {
    if (!this.canSuivre) return;
    this.selectedPlan = plan;
    this.statutSelectionne = plan.statutSuivi ?? null;
    this.decision = plan.decisionSuivi ?? '';
    this.showSuiviModal = true;
  }

  fermerSuiviModal(): void {
    this.showSuiviModal = false;
    this.selectedPlan = null;
    this.statutSelectionne = null;
    this.decision = '';
  }

  enregistrerSuivi(): void {
    if (!this.selectedPlan || !this.statutSelectionne) return;

    this.planAuditService.enregistrerSuivi(this.selectedPlan.code, {
      statutSuivi: this.statutSelectionne,
      decision: this.decision
    }).subscribe({
      next: () => {
        Swal.fire({ title: 'Suivi enregistré', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          this.fermerSuiviModal();
          this.load();
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

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
