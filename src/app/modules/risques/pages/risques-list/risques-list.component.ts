import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResponse, StatutRisque, TypeRisque } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './risques-list.component.html'
})
export class RisquesListComponent implements OnInit {
  risques: RisqueResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Expose les enums pour qu'ils soient accessibles dans le template
  StatutRisque = StatutRisque;
  TypeRisque = TypeRisque;

  constructor(
    private risqueService: RisqueService,
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
    this.loadRisques();
  }

  loadRisques(): void {
    this.loading = true;
    this.error = null;
    this.risqueService.getAll().subscribe({
      next: (risques) => {
        this.risques = risques;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  createRisque(): void {
    this.router.navigate(['/risques/nouveau']);
  }

  editRisque(code: string): void {
    this.router.navigate(['/risques', code, 'edit']);
  }

  viewRisque(code: string): void {
    this.router.navigate(['/risques', code]);
  }

  deleteRisque(code: string): void {
    Swal.fire({
      title: 'Supprimer ce risque ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.risqueService.deleteByCode(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'Le risque a bien été supprimé.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadRisques();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer le risque',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  getStatutBadgeClass(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF:     return 'bg-red-100 text-red-700';
      case StatutRisque.EN_COURS:  return 'bg-blue-100 text-blue-700';
      case StatutRisque.MAITRISE:  return 'bg-green-100 text-green-700';
      case StatutRisque.CLOTURE:   return 'bg-gray-100 text-gray-700';
      case StatutRisque.SUPPRIME:  return 'bg-slate-100 text-slate-700';
      default:                     return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutRisque): string {
    switch (statut) {
      case StatutRisque.ACTIF:     return 'Actif';
      case StatutRisque.EN_COURS:  return 'En cours';
      case StatutRisque.MAITRISE:  return 'Maîtrisé';
      case StatutRisque.CLOTURE:   return 'Clôturé';
      case StatutRisque.SUPPRIME:  return 'Supprimé';
      default:                     return statut;
    }
  }

  getTypeBadgeClass(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.FINANCIER:    return 'bg-purple-100 text-purple-700';
      case TypeRisque.OPERATIONNEL: return 'bg-orange-100 text-orange-700';
      case TypeRisque.JURIDIQUE:    return 'bg-indigo-100 text-indigo-700';
      case TypeRisque.STRATEGIQUE:  return 'bg-pink-100 text-pink-700';
      case TypeRisque.TECHNIQUE:    return 'bg-cyan-100 text-cyan-700';
      default:                      return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeLabel(type: TypeRisque): string {
    switch (type) {
      case TypeRisque.FINANCIER:    return 'Financier';
      case TypeRisque.OPERATIONNEL: return 'Opérationnel';
      case TypeRisque.JURIDIQUE:    return 'Juridique';
      case TypeRisque.STRATEGIQUE:  return 'Stratégique';
      case TypeRisque.TECHNIQUE:    return 'Technique';
      default:                      return type;
    }
  }

  countByStatut(statut: StatutRisque): number {
    return this.risques.filter(r => r.statut === statut).length;
  }

  countByType(type: TypeRisque): number {
    return this.risques.filter(r => r.typeRisque === type).length;
  }
}