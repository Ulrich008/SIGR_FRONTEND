import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { TypeUniteService } from '../../../../core/services/type-unite.service';
import { TypeUniteResponse } from '../../../../core/models/type-unite.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-type-unite-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './type-unite-list.component.html'
})
export class TypeUniteListComponent implements OnInit {
  typeUnites: TypeUniteResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private typeUniteService: TypeUniteService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    // Expand the Unités administratives menu
    const uniteAdminItem = this.menuItems.find(item => item.label === 'Unités administratives');
    if (uniteAdminItem) {
      uniteAdminItem.expanded = true;
    }
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadTypeUnites();
  }

  loadTypeUnites(): void {
    this.loading = true;
    this.error = null;
    this.typeUniteService.getAll().subscribe({
      next: (typeUnites) => {
        this.typeUnites = typeUnites;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les types d\'unités';
        this.cdr.detectChanges();
      }
    });
  }

  createTypeUnite(): void {
    this.router.navigate(['/unite-administrative/type-unite/nouveau']);
  }

  editTypeUnite(code: string): void {
    this.router.navigate(['/unite-administrative/type-unite', code, 'edit']);
  }

  deleteTypeUnite(code: string): void {
    Swal.fire({
      title: 'Supprimer ce type d\'unité ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.typeUniteService.delete(code).subscribe({
        next: () => {
          this.loadTypeUnites();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le type d\'unité a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le type d\'unité';
          this.cdr.detectChanges();
        }
      });
    });
  }
}
