import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';

import { MenuService } from '../../../../core/services/menu.service';
import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { AuthService } from '../../../../core/services/auth.service';

import {
  AvisHistoriqueRapportCIResponse,
  RapportControleInterneResponse,
  StatutRapportCI
} from '../../../../core/models/controle-interne.model';

/**
 * Contrairement à son équivalent côté risques (RisquesHistoriqueAvisComponent),
 * le rapport lui-même peut avoir été supprimé (différé/rejeté puis supprimé
 * par le Contrôleur Interne — voir RapportControleInterneServiceImpl.delete) :
 * l'historique est donc chargé indépendamment du rapport, à partir du seul
 * code de l'URL, pour rester consultable même dans ce cas.
 */
@Component({
  standalone: true,
  selector: 'app-rapport-historique-avis',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './rapport-historique-avis.component.html'
})
export class RapportHistoriqueAvisComponent implements OnInit {

  code: string | null = null;
  rapport: RapportControleInterneResponse | null = null;
  rapportSupprime = false;

  historiqueAvis: AvisHistoriqueRapportCIResponse[] = [];

  loading = false;
  error: string | null = null;

  menuItems: MenuItem[];
  StatutRapportCI = StatutRapportCI;

  constructor(
    private rapportService: RapportControleInterneService,
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

    this.code = this.route.snapshot.paramMap.get('code');

    if (!this.code) {
      this.router.navigate(['/controle-interne/rapports']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.rapportService.getByCode(this.code).subscribe({
      next: (rapport) => {
        this.rapport = rapport;
        this.cdr.detectChanges();
      },
      error: () => {
        // Rapport introuvable : probablement supprimé après un différé/rejet.
        // L'historique reste consultable ci-dessous malgré tout.
        this.rapportSupprime = true;
        this.cdr.detectChanges();
      }
    });

    this.rapportService.getHistoriqueAvis(this.code).subscribe({
      next: (historiqueAvis) => {
        this.historiqueAvis = historiqueAvis;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'historique de ce rapport';
        this.cdr.detectChanges();
      }
    });
  }

  getStatutLabel(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'En attente de validation';
      case StatutRapportCI.TRANSMIS: return 'Transmis à la CCI';
      case StatutRapportCI.VALIDE: return 'Validé';
      case StatutRapportCI.DIFFERE: return 'Différé';
      case StatutRapportCI.REJETE: return 'Rejeté';
      default: return '—';
    }
  }

  getStatutBadgeClass(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'bg-blue-100 text-blue-700';
      case StatutRapportCI.TRANSMIS: return 'bg-amber-100 text-amber-700';
      case StatutRapportCI.VALIDE: return 'bg-emerald-100 text-emerald-700';
      case StatutRapportCI.DIFFERE: return 'bg-orange-100 text-orange-700';
      case StatutRapportCI.REJETE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  goBack(): void {
    if (this.rapport) {
      this.router.navigate(['/controle-interne/rapports', this.code]);
    } else {
      this.router.navigate(['/controle-interne/rapports']);
    }
  }
}
