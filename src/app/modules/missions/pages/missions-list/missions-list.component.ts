import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  allMissions: MissionResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private missionService: MissionService,
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
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = null;
    this.missionService.getAll().subscribe({
      next: (missions) => {
        // Trier les missions par date de début (le plus récent en haut)
        this.allMissions = missions.sort((a, b) => {
          const dateA = a.dateDebut ? new Date(a.dateDebut).getTime() : 0;
          const dateB = b.dateDebut ? new Date(b.dateDebut).getTime() : 0;
          return dateB - dateA;
        });
        
        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les missions';
        this.cdr.detectChanges();
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allMissions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.missions = this.allMissions.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getDisplayedRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allMissions.length);
    return { start, end };
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
