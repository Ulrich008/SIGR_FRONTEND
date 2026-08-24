import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationResponse, TypeNotification } from '../../../../core/models/notification.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-alertes-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './alertes-list.component.html'
})
export class AlertesListComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  notificationsFiltrees: NotificationResponse[] = [];
  filtreActif: string = 'TOUTES';
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  recherche: string = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private menuService: MenuService,
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
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    this.notificationService.getAll().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.filtrerEtRechercher();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les notifications';
        this.cdr.detectChanges();
      }
    });
  }

  appliquerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.filtrerEtRechercher();
  }

  onRechercheChange(): void {
    this.filtrerEtRechercher();
  }

  private filtrerEtRechercher(): void {
    let resultats = this.notifications;

    if (this.filtreActif === 'NON_LUES') {
      resultats = resultats.filter(n => !n.lu);
    } else if (this.filtreActif !== 'TOUTES') {
      resultats = resultats.filter(n => n.severite === this.filtreActif);
    }

    if (this.recherche.trim()) {
      const searchTerm = this.recherche.toLowerCase();
      resultats = resultats.filter(n =>
        n.titre.toLowerCase().includes(searchTerm) ||
        n.description.toLowerCase().includes(searchTerm) ||
        (n.libelleElement || '').toLowerCase().includes(searchTerm) ||
        (n.libelleProcessus || '').toLowerCase().includes(searchTerm)
      );
    }

    this.notificationsFiltrees = resultats;
  }

  get nombreNonLues(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  compterParSeverite(severite: string): number {
    return this.notifications.filter(n => n.severite === severite).length;
  }

  ouvrirNotification(notification: NotificationResponse): void {
    this.router.navigate(['/alertes', notification.id]);
  }

  marquerToutesCommeLues(): void {
    if (this.nombreNonLues === 0) return;
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
      error: (err) => {
        this.error = err?.message || 'Impossible de marquer les notifications comme lues';
        this.cdr.detectChanges();
      }
    });
  }

  getCardBorderClass(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return 'alert-card--critique';
      case 'HAUTE':    return 'alert-card--haute';
      case 'MOYENNE':  return 'alert-card--moyenne';
      case 'FAIBLE':   return 'alert-card--faible';
      default:         return '';
    }
  }

  getSeveriteBadgeClass(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return 'badge--critique';
      case 'HAUTE':    return 'badge--haute';
      case 'MOYENNE':  return 'badge--moyenne';
      case 'FAIBLE':   return 'badge--faible';
      default:         return 'badge--default';
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

  getSeveriteIcon(severite: string): string {
    switch (severite) {
      case 'CRITIQUE': return '🔴';
      case 'HAUTE':    return '🟠';
      case 'MOYENNE':  return '🟡';
      case 'FAIBLE':   return '🔵';
      default:         return '⚪';
    }
  }

  getAnimationStyle(index: number): any {
    return {
      'animation-delay': `${index * 50}ms`,
      'animation-duration': '0.4s',
      'animation-fill-mode': 'both'
    };
  }
}
