import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ← ajout
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AgentService } from '../../../../core/services/agent.service';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-agent-list',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './agent-list.component.html'
})
export class AgentListComponent implements OnInit {
  agents: AgentResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private agentService: AgentService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef // ← ajout
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading = true;
    this.error = null;
    this.agentService.getAll().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.loading = false;
        this.cdr.detectChanges(); // ← ajout
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les agents';
        this.cdr.detectChanges(); // ← ajout
      }
    });
  }

  createAgent(): void {
    this.router.navigate(['/agents/nouveau']);
  }

  editAgent(matricule: string): void {
    this.router.navigate(['/agents', matricule, 'edit']);
  }

  toggleStatus(matricule: string, currentStatus: boolean): void {
    const action = currentStatus ? 'désactiver' : 'activer';
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} cet agent ?`,
      text: `Cette action va ${action} le compte de l'agent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;
      this.loading = true;
      this.agentService.changeStatus(matricule, !currentStatus).subscribe({
        next: () => {
          this.loadAgents();
          Swal.fire({
            title: 'Succès',
            text: `L'agent a été ${action} avec succès.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || `Impossible de ${action} l'agent`;
          this.cdr.detectChanges(); // ← ajout
        }
      });
    });
  }

  deleteAgent(matricule: string): void {
    Swal.fire({
      title: 'Supprimer cet agent ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;
      this.loading = true;
      this.agentService.delete(matricule).subscribe({
        next: () => {
          this.loadAgents();
          Swal.fire({
            title: 'Supprimé',
            text: 'L\'agent a bien été supprimé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer l\'agent';
          this.cdr.detectChanges(); // ← ajout
        }
      });
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':   return 'bg-purple-100 text-purple-700';
      case 'MANAGER': return 'bg-blue-100 text-blue-700';
      case 'AGENT':   return 'bg-green-100 text-green-700';
      default:        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusBadgeClass(enabled: boolean): string {
    return enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }
}