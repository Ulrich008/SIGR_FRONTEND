import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MinistereService } from '../../../../core/services/ministere.service';
import { MinistereResponse } from '../../../../core/models/ministere.model';

@Component({
  standalone: true,
  selector: 'app-ministere-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './ministere-list.component.html'
})
export class MinistereListComponent implements OnInit {
  ministeres: MinistereResponse[] = [];
  loading = false;
  error: string | null = null;

  menuItems: MenuItem[] = [
    { icon: 'fas fa-th', label: 'Tableau de bord', path: '/dashboard' },
    { icon: 'fas fa-building', label: 'Structures', path: '/ministeres' },
    { icon: 'fas fa-columns', label: 'Sections' },
    { icon: 'fas fa-chart-line', label: 'Processus' },
    { icon: 'fas fa-exclamation-triangle', label: 'Risques' },
    { icon: 'fas fa-table', label: 'Matrice' },
    { icon: 'fas fa-chart-simple', label: 'Indicateurs' },
    { icon: 'fas fa-book', label: 'Bibliothèque' },
    { icon: 'fas fa-users', label: 'Utilisateurs' },
  ];

  constructor(
    private ministereService: MinistereService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMinisteres();
  }

  loadMinisteres(): void {
    this.loading = true;
    this.error = null;
    this.ministereService.getAll().subscribe({
      next: ministeres => {
        this.ministeres = ministeres;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les ministères';
      }
    });
  }

  createMinistere(): void {
    this.router.navigate(['/ministeres/nouveau']);
  }

  editMinistere(id: string): void {
    this.router.navigate(['/ministeres', id, 'edit']);
  }

  deleteMinistere(id: string): void {
    Swal.fire({
      title: 'Supprimer ce ministère ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2'
      },
      buttonsStyling: false
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.ministereService.delete(id).subscribe({
        next: () => {
          this.loadMinisteres();
          Swal.fire({
            title: 'Supprimé',
            text: 'Le ministère a bien été supprimé.',
            icon: 'success',
            timer: 1800,
            showConfirmButton: false
          });
        },
        error: err => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le ministère';
        }
      });
    });
  }
}
