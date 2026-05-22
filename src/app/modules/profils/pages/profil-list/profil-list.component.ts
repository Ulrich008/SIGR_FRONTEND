import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProfilService } from '../../../../core/services/profil.service';
import { ProfilResponse } from '../../../../core/models/profil.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profil-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './profil-list.component.html'
})
export class ProfilListComponent implements OnInit {
  profils: ProfilResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private profilService: ProfilService,
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
    this.loadProfils();
  }

  loadProfils(): void {
    this.loading = true;
    this.error = null;
    this.profilService.getAll().subscribe({
      next: (profils) => {
        this.profils = profils;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les profils';
        this.cdr.detectChanges();
      }
    });
  }

  createProfil(): void {
    this.router.navigate(['/profils/nouveau']);
  }

  editProfil(code: string): void {
    this.router.navigate(['/profils', code, 'edit']);
  }

  deleteProfil(code: string): void {
    Swal.fire({
      title: 'Supprimer ce profil ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;
      this.loading = true;
      this.profilService.delete(code).subscribe({
        next: () => {
          this.loadProfils();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le profil a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le profil';
          this.cdr.detectChanges();
        }
      });
    });
  }
}