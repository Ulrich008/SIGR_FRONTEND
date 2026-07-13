import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { AgentService } from '../../core/services/agent.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() userInitials: string = 'AD';
  @Input() notificationCount: number = 0; // Nombre de notifications non lues

  @Output() search = new EventEmitter<string>();

  isMobileSearchOpen = false;

  // Rempli via GET /api/agents/me : reflète toujours l'agent réellement
  // connecté (pas une valeur codée en dur passée par la page courante).
  nomComplet = '';
  libelleMinistere = '';

  constructor(
    private authService: AuthService,
    private agentService: AgentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.agentService.getMe().subscribe({
      next: (agent) => {
        this.nomComplet = `${agent.prenoms} ${agent.nom}`;
        this.userInitials = `${agent.prenoms.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase();
        this.libelleMinistere = agent.libelleMinistere || '';
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
      }
    });
  }

  onSearchInput(value: string): void {
    this.search.emit(value.trim());
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
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