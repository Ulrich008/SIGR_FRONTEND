import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueResiduelService } from '../../../../core/services/risque-residuel.service';
import { RisqueResiduelResponse } from '../../../../core/models/risque-residuel.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-residuels-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './risques-residuels-list.component.html'
})
export class RisquesResiduelsListComponent implements OnInit {
  risquesResiduels: RisqueResiduelResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private risqueResiduelService: RisqueResiduelService,
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
    this.loadRisquesResiduels();
  }

  loadRisquesResiduels(): void {
    this.loading = true;
    this.error = null;
    this.risqueResiduelService.getAll().subscribe({
      next: (risquesResiduels) => {
        this.risquesResiduels = risquesResiduels;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les risques résiduels';
        this.cdr.detectChanges();
      }
    });
  }

  createRisqueResiduel(): void {
    this.router.navigate(['/risques-residuels/nouveau']);
  }

  editRisqueResiduel(code: string): void {
    this.router.navigate(['/risques-residuels', code, 'edit']);
  }

  viewRisqueResiduel(code: string): void {
    this.router.navigate(['/risques-residuels', code]);
  }

  deleteRisqueResiduel(code: string): void {
    Swal.fire({
      title: 'Supprimer ce risque résiduel ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.risqueResiduelService.deleteByCode(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'Le risque résiduel a bien été supprimé.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadRisquesResiduels();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer le risque résiduel',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 15) return 'bg-red-100 text-red-700';
    if (score >= 10) return 'bg-orange-100 text-orange-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getScoreLabel(score: number): string {
    if (score >= 15) return 'Critique';
    if (score >= 10) return 'Élevé';
    if (score >= 5) return 'Moyen';
    return 'Faible';
  }

  getNiveauRisqueBadgeClass(niveau: string): string {
    switch (niveau) {
      case 'FAIBLE': return 'bg-green-100 text-green-700';
      case 'MOYEN': return 'bg-yellow-100 text-yellow-700';
      case 'ELEVE': return 'bg-orange-100 text-orange-700';
      case 'CRITIQUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
