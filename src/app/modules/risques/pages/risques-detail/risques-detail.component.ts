import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, StatutRisque, TypeRisque } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './risques-detail.component.html'
})
export class RisquesDetailComponent implements OnInit {
  risque: RisqueResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private risqueService: RisqueService,
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
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le risque';
        this.cdr.detectChanges();
      }
    });
  }

  editRisque(): void {
    if (this.risque) {
      this.router.navigate(['/risques', this.risque.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/risques']);
  }

  getStatutBadgeClass(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF: return 'bg-red-100 text-red-700';
      case StatutRisque.EN_COURS: return 'bg-blue-100 text-blue-700';
      case StatutRisque.MAITRISE: return 'bg-green-100 text-green-700';
      case StatutRisque.CLOTURE: return 'bg-gray-100 text-gray-700';
      case StatutRisque.SUPPRIME: return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF: return 'Actif';
      case StatutRisque.EN_COURS: return 'En cours';
      case StatutRisque.MAITRISE: return 'Maîtrisé';
      case StatutRisque.CLOTURE: return 'Clôturé';
      case StatutRisque.SUPPRIME: return 'Supprimé';
      default: return statut;
    }
  }

  getTypeBadgeClass(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.FINANCIER: return 'bg-purple-100 text-purple-700';
      case TypeRisque.OPERATIONNEL: return 'bg-orange-100 text-orange-700';
      case TypeRisque.JURIDIQUE: return 'bg-indigo-100 text-indigo-700';
      case TypeRisque.STRATEGIQUE: return 'bg-pink-100 text-pink-700';
      case TypeRisque.TECHNIQUE: return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeLabel(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.FINANCIER: return 'Financier';
      case TypeRisque.OPERATIONNEL: return 'Opérationnel';
      case TypeRisque.JURIDIQUE: return 'Juridique';
      case TypeRisque.STRATEGIQUE: return 'Stratégique';
      case TypeRisque.TECHNIQUE: return 'Technique';
      default: return type;
    }
  }
}