import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AuthService } from '../../../../core/services/auth.service';

import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { ControleSecondNiveauService } from '../../../../core/services/controle-second-niveau.service';
import {
  ControleSecondNiveauResponse,
  LigneControleResponse,
  RapportControleInterneResponse,
  StatutRapportCI
} from '../../../../core/models/controle-interne.model';

@Component({
  standalone: true,
  selector: 'app-rapport-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './rapport-detail.component.html'
})
export class RapportDetailComponent implements OnInit {

  menuItems: MenuItem[];

  rapport: RapportControleInterneResponse | null = null;
  controles: ControleSecondNiveauResponse[] = [];
  lignes: LigneControleResponse[] = [];

  loading = false;
  error: string | null = null;

  showApercu = false;
  generatingPdf = false;

  StatutRapportCI = StatutRapportCI;

  constructor(
    private rapportService: RapportControleInterneService,
    private controleService: ControleSecondNiveauService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canWrite(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'CONTROLEUR_INTERNE']);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/controle-interne/rapports']);
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
        this.loadControlesEtAgregation();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger ce rapport';
        this.cdr.detectChanges();
      }
    });
  }

  private loadControlesEtAgregation(): void {
    if (!this.rapport) return;

    forkJoin({
      controles: this.controleService.getAll(),
      lignes: this.controleService.getLignesDetaillees(
        this.rapport.codeUniteAdministrative, this.rapport.codeProcessus
      )
    }).subscribe({
      next: ({ controles, lignes }) => {
        this.controles = controles.filter(c =>
          c.codeUniteAdministrative === this.rapport!.codeUniteAdministrative &&
          c.codeProcessus === this.rapport!.codeProcessus
        );
        this.lignes = lignes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les contrôles de second niveau associés';
        this.cdr.detectChanges();
      }
    });
  }

  get anomalies(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie === 'Anomalie' && l.constat);
  }

  get faiblesses(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie === 'Faiblesse' && l.constat);
  }

  get constatsAutres(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie !== 'Anomalie' && l.categorie !== 'Faiblesse' && l.constat);
  }

  get lignesAnalysesRecommandations(): LigneControleResponse[] {
    return this.lignes.filter(l => l.analyse || l.recommandation);
  }

  sourceLigne(l: LigneControleResponse): string {
    return `${l.categorie} — ${l.codeControle} (${this.formatDate(l.dateControle)})`;
  }

  ouvrirApercu(): void {
    this.showApercu = true;
  }

  fermerApercu(): void {
    this.showApercu = false;
  }

  confirmerGenererPdf(): void {
    if (!this.rapport) return;
    this.generatingPdf = true;

    this.rapportService.genererPdf(this.rapport.code).subscribe({
      next: (updated) => {
        this.rapport = updated;
        this.showApercu = false;
        this.generatingPdf = false;
        this.cdr.detectChanges();

        this.telecharger();

        Swal.fire({
          title: 'PDF généré',
          text: 'Le rapport est désormais en attente de validation dans le sous-menu Transmission.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.generatingPdf = false;
        this.error = err?.message || 'Impossible de générer le PDF';
        Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        this.cdr.detectChanges();
      }
    });
  }

  telecharger(): void {
    if (!this.rapport) return;
    this.rapportService.telechargerPdf(this.rapport.code).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.rapport!.code}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de télécharger le PDF';
        this.cdr.detectChanges();
      }
    });
  }

  allerVersTransmission(): void {
    this.router.navigate(['/controle-interne/transmission']);
  }

  goToHistoriqueAvis(): void {
    if (!this.rapport) return;
    this.router.navigate(['/controle-interne/rapports', this.rapport.code, 'historique-avis']);
  }

  retour(): void {
    this.router.navigate(['/controle-interne/rapports']);
  }

  getStatutLabel(statut?: StatutRapportCI): string {
    switch (statut) {
      case StatutRapportCI.EN_ATTENTE_DE_VALIDATION: return 'En attente de validation';
      case StatutRapportCI.TRANSMIS: return 'Transmis à la CCI';
      case StatutRapportCI.VALIDE: return 'Validé';
      case StatutRapportCI.DIFFERE: return 'Différé';
      case StatutRapportCI.REJETE: return 'Rejeté';
      default: return 'Brouillon (PDF non généré)';
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

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
