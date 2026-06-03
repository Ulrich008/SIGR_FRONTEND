import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteMesureService } from '../../../../core/services/unite-mesure.service';
import { UniteMesureResponse } from '../../../../core/models/unite-mesure.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unites-mesure-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './unites-mesure-list.component.html'
})
export class UnitesMesureListComponent implements OnInit {
  unitesMesure: UniteMesureResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private uniteMesureService: UniteMesureService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadUnitesMesure();
  }

  loadUnitesMesure(): void {
    this.loading = true;
    this.error = null;
    this.uniteMesureService.getAll().subscribe({
      next: (unitesMesure) => {
        this.unitesMesure = unitesMesure;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les unités de mesure';
      }
    });
  }

  createUniteMesure(): void {
    this.router.navigate(['/unites-mesure/nouveau']);
  }

  editUniteMesure(id: string): void {
    this.router.navigate(['/unites-mesure', id, 'edit']);
  }

  deleteUniteMesure(id: string): void {
    Swal.fire({
      title: 'Supprimer cette unité de mesure ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.uniteMesureService.delete(id).subscribe({
          next: () => {
            Swal.fire({ title: 'Supprimé', text: 'L\'unité de mesure a bien été supprimée.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.loadUnitesMesure();
          },
          error: (err) => {
            Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible de supprimer l\'unité de mesure', icon: 'error' });
          }
        });
      }
    });
  }
}
