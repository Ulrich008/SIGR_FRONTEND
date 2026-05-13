import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() organizationName: string = 'Ministère de l\'Économie et des Finances';
  @Input() userInitials: string = 'AD';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
}