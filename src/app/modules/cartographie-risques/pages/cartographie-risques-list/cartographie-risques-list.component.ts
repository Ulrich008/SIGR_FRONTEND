import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';
import { CartographieRisquesResponse, StatutCartographie } from '../../../../core/models/cartographie-risques.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cartographie-risques-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './cartographie-risques-list.component.html'
})
export class CartographieRisquesListComponent implements OnInit {
  cartographies: CartographieRisquesResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private cartographieService: CartographieRisquesService,
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
    this.loadCartographies();
  }

  loadCartographies(): void {
    this.loading = true;
    this.error = null;
    this.cartographieService.getAll().subscribe({
      next: (cartographies) => {
        this.cartographies = cartographies;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les cartographies';
        this.cdr.detectChanges();
      }
    });
  }

  createCartographie(): void {
    this.router.navigate(['/cartographie-risques/nouveau']);
  }

  editCartographie(code: string): void {
    this.router.navigate(['/cartographie-risques', code, 'edit']);
  }

  viewCartographie(code: string): void {
    this.router.navigate(['/cartographie-risques', code]);
  }

  deleteCartographie(code: string): void {
    Swal.fire({
      title: 'Supprimer cette cartographie ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.cartographieService.delete(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimée',
              text: 'La cartographie a bien été supprimée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadCartographies();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer la cartographie',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  exportExcel(): void {
  Swal.fire({
    title: 'Génération en cours...',
    text: 'Veuillez patienter.',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  this.cartographieService.exportExcel().subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cartographie-risques.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      Swal.close();
    },
    error: (err) => {
      Swal.fire({
        title: 'Erreur',
        text: err?.message || 'Impossible de générer le fichier Excel',
        icon: 'error'
      });
    }
  });
}
  getStatutBadgeClass(statut: StatutCartographie): string {
    switch (statut) {
      case StatutCartographie.BROUILLON: return 'bg-gray-100 text-gray-700';
      case StatutCartographie.EN_COURS:  return 'bg-blue-100 text-blue-700';
      case StatutCartographie.VALIDEE:   return 'bg-green-100 text-green-700';
      case StatutCartographie.ARCHIVEE:  return 'bg-amber-100 text-amber-700';
      default:                           return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: StatutCartographie): string {
    switch (statut) {
      case StatutCartographie.BROUILLON: return 'Brouillon';
      case StatutCartographie.EN_COURS:  return 'En cours';
      case StatutCartographie.VALIDEE:   return 'Validée';
      case StatutCartographie.ARCHIVEE:  return 'Archivée';
      default:                           return statut;
    }
  }

  countByStatut(statut: string): number {
    return this.cartographies.filter(c => c.statut === statut).length;
  }
}