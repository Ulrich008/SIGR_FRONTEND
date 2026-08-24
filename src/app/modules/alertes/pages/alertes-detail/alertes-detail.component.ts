import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationResponse, TypeNotification } from '../../../../core/models/notification.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-alertes-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './alertes-detail.component.html'
})
export class AlertesDetailComponent implements OnInit {
  notification: NotificationResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/alertes']);
      return;
    }
    this.loadNotification(id);
  }

  loadNotification(id: string): void {
    this.loading = true;
    this.error = null;
    this.notificationService.getById(id).subscribe({
      next: (notification) => {
        this.notification = notification;
        this.loading = false;
        this.cdr.detectChanges();

        // Marquage automatique comme lue à l'ouverture du détail.
        if (!notification.lu) {
          this.notificationService.markAsRead(id).subscribe({
            next: (updated) => {
              this.notification = updated;
              this.cdr.detectChanges();
            }
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger cette notification';
        this.cdr.detectChanges();
      }
    });
  }

  /** Lien vers l'élément concerné (risque ou indicateur), selon le type de notification. */
  get lienElement(): string[] | null {
    if (!this.notification || !this.notification.codeElement) return null;
    if (this.estUnRisque(this.notification.type)) {
      return ['/risques', this.notification.codeElement];
    }
    return ['/indicateurs', this.notification.codeElement];
  }

  private estUnRisque(type: TypeNotification): boolean {
    return type === 'RISQUE_SANS_MITIGATION'
      || type === 'RISQUE_SANS_ACTIONS_EN_COURS'
      || type === 'RISQUE_EN_ATTENTE_VALIDATION'
      || type === 'RISQUE_EN_ATTENTE_TRANSMISSION';
  }

  getSeveriteBadgeClass(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return 'bg-red-100 text-red-700';
      case 'HAUTE':    return 'bg-orange-100 text-orange-700';
      case 'MOYENNE':  return 'bg-yellow-100 text-yellow-700';
      case 'FAIBLE':   return 'bg-blue-100 text-blue-700';
      default:         return 'bg-slate-100 text-slate-600';
    }
  }

  getSeveriteIcon(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return '🔴';
      case 'HAUTE':    return '🟠';
      case 'MOYENNE':  return '🟡';
      case 'FAIBLE':   return '🔵';
      default:         return '⚪';
    }
  }

  getTypeLabel(type: TypeNotification | string): string {
    switch (type) {
      case 'RISQUE_SANS_MITIGATION':        return 'Risque sans plan de mitigation';
      case 'RISQUE_SANS_ACTIONS_EN_COURS':  return 'Risque sans actions en cours';
      case 'INDICATEUR_SEUIL_DEPASSE':      return 'Seuil dépassé';
      case 'INDICATEUR_ECHEANCE_PROCHE':    return 'Échéance proche';
      case 'RISQUE_EN_ATTENTE_VALIDATION':  return 'En attente de validation';
      case 'RISQUE_EN_ATTENTE_TRANSMISSION': return 'En attente de transmission';
      default:                               return type;
    }
  }

  retour(): void {
    this.router.navigate(['/alertes']);
  }
}
