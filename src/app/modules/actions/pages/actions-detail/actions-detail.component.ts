import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ActionService } from '../../../../core/services/action.service';
import { ActionResponse } from '../../../../core/models/action.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-actions-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './actions-detail.component.html'
})
export class ActionsDetailComponent implements OnInit {
  action: ActionResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private actionService: ActionService,
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
    this.loadAction();
  }

  loadAction(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/actions']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.actionService.getByCode(code).subscribe({
      next: (action) => {
        this.action = action;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'action';
        this.cdr.detectChanges();
      }
    });
  }

  editAction(): void {
    if (this.action) {
      this.router.navigate(['/actions', this.action.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/actions']);
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
