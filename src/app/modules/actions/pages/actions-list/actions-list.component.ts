import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ActionService } from '../../../../core/services/action.service';
import { ActionResponse } from '../../../../core/models/action.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-actions-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './actions-list.component.html'
})
export class ActionsListComponent implements OnInit {
  actions: ActionResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private actionService: ActionService,
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
    this.loadActions();
  }

  loadActions(): void {
    this.loading = true;
    this.error = null;
    this.actionService.getAll().subscribe({
      next: (actions) => {
        this.actions = actions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les actions';
        this.cdr.detectChanges();
      }
    });
  }

  createAction(): void {
    this.router.navigate(['/actions/nouveau']);
  }

  editAction(code: string): void {
    this.router.navigate(['/actions', code, 'edit']);
  }

  viewAction(code: string): void {
    this.router.navigate(['/actions', code]);
  }

  deleteAction(code: string): void {
    Swal.fire({
      title: 'Supprimer cette action ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.actionService.delete(code).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé',
              text: 'L\'action a bien été supprimée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadActions();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: err?.message || 'Impossible de supprimer l\'action',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'TERMINEE': return 'bg-green-100 text-green-700';
      case 'EN_RETARD': return 'bg-red-100 text-red-700';
      case 'ANNULEE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'fa-spinner';
      case 'TERMINEE': return 'fa-check-circle';
      case 'EN_RETARD': return 'fa-exclamation-circle';
      case 'ANNULEE': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  countByStatut(statut: string): number {
    return this.actions.filter(a => a.statut === statut).length;
  }

  formatDate(date: string): string {
    if (!date) return 'Non renseignée';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non renseignée';
    return d.toLocaleDateString('fr-FR');
  }

  isLate(dateFin: string, statut: string): boolean {
    if (statut === 'TERMINEE' || statut === 'ANNULEE') return false;
    if (!dateFin) return false;
    const fin = new Date(dateFin);
    const aujourd = new Date();
    return fin < aujourd;
  }
}
