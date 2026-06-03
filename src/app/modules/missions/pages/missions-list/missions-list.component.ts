import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { MissionService } from '../../../../core/services/mission.service';
import { MissionResponse } from '../../../../core/models/mission.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-missions-list',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './missions-list.component.html'
})
export class MissionsListComponent implements OnInit {
  missions: MissionResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private missionService: MissionService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = null;
    this.missionService.getAll().subscribe({
      next: (missions) => {
        this.missions = missions;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les missions';
      }
    });
  }

  createMission(): void {
    this.router.navigate(['/missions/nouveau']);
  }

  editMission(code: string): void {
    this.router.navigate(['/missions', code, 'edit']);
  }

  deleteMission(code: string): void {
    Swal.fire({
      title: 'Supprimer cette mission ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.missionService.delete(code).subscribe({
          next: () => {
            Swal.fire({ title: 'Supprimé', text: 'La mission a bien été supprimée.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.loadMissions();
          },
          error: (err) => {
            Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible de supprimer la mission', icon: 'error' });
          }
        });
      }
    });
  }

  getStatutBadgeClass(statut: string | undefined): string {
    if (!statut) return 'bg-gray-100 text-gray-700';
    switch (statut) {
      case 'ACTIF': return 'bg-green-100 text-green-700';
      case 'INACTIF': return 'bg-gray-100 text-gray-700';
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'TERMINE': return 'bg-purple-100 text-purple-700';
      case 'SUSPENDU': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
