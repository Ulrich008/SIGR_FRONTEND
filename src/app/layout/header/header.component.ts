import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { AgentService } from '../../core/services/agent.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() userInitials: string = 'AD';
  @Input() notificationCount: number = 0; // Nombre de notifications non lues

  @Output() search = new EventEmitter<string>();

  // Centralisé dans AuthService.getGuideUrl() pour que le header et
  // l'assistant chatbot (chatbot-widget.component.ts) pointent toujours
  // vers le même guide, sans risque de désynchronisation.
  get guideUrl(): string {
    return this.authService.getGuideUrl();
  }

  // Rempli via GET /api/agents/me : reflète toujours l'agent réellement
  // connecté (pas une valeur codée en dur passée par la page courante).
  nomComplet = '';
  sigleMinistere = '';

  private notificationPollInterval?: ReturnType<typeof setInterval>;

  constructor(
    private authService: AuthService,
    private agentService: AgentService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.agentService.getMe().subscribe({
      next: (agent) => {
        this.nomComplet = `${agent.prenoms} ${agent.nom}`;
        this.userInitials = `${agent.prenoms.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase();
        this.sigleMinistere = agent.sigleMinistere || '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement du profil connecté (/me)', err);
        // Repli sur les informations stockées localement à la connexion,
        // pour ne jamais laisser le header sans nom/initiales.
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.nomComplet = `${currentUser.prenoms} ${currentUser.nom}`;
          this.userInitials = `${currentUser.prenoms.charAt(0)}${currentUser.nom.charAt(0)}`.toUpperCase();
        }
        this.cdr.detectChanges();
      }
    });

    this.loadUnreadCount();
    // Rafraîchi périodiquement : reflète les notifications générées par
    // le sweep planifié côté backend sans nécessiter un rechargement.
    this.notificationPollInterval = setInterval(() => this.loadUnreadCount(), 60000);
  }

  ngOnDestroy(): void {
    if (this.notificationPollInterval) {
      clearInterval(this.notificationPollInterval);
    }
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.notificationCount = res.nonLues;
        this.cdr.detectChanges();
      },
      error: () => {
        // Silencieux : un échec de comptage ne doit pas perturber le header.
      }
    });
  }

  confirmLogout(): void {
    Swal.fire({
      title: 'Se déconnecter ?',
      text: 'Vous serez redirigé vers la page de connexion.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnexion',
      cancelButtonText: 'Annuler',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          title: 'Déconnecté',
          text: 'Vous avez été déconnecté avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            this.router.navigate(['/auth/login']);
          }
        });
      }
    });
  }

  openNotifications(): void {
    this.router.navigate(['/alertes']);
  }

  ouvrirMonProfil(): void {
    this.router.navigate(['/me']);
  }
}