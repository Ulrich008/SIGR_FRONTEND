import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unite-administrative-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './unite-administrative-list.component.html'
})
export class UniteAdministrativeListComponent implements OnInit {
  unites: UniteAdministrativeResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private uniteService: UniteAdministrativeService,
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
    this.loadUnites();
  }

  loadUnites(): void {
    this.loading = true;
    this.error = null;
    this.uniteService.getAll().subscribe({
      next: (unites) => {
        this.unites = unites;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les unités administratives';
        this.cdr.detectChanges();
      }
    });
  }

  createUnite(): void {
    this.router.navigate(['/unite-administrative/nouveau']);
  }

  editUnite(code: string): void {
    this.router.navigate(['/unite-administrative', code, 'edit']);
  }

  deleteUnite(code: string): void {
    Swal.fire({
      title: 'Supprimer cette unité administrative ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.loading = true;
      this.uniteService.delete(code).subscribe({
        next: () => {
          this.loadUnites();
          Swal.fire({
            title: 'Supprimée',
            text: 'L\'unité administrative a bien été supprimée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer l\'unité administrative';
          this.cdr.detectChanges();
        }
      });
    });
  }
}
