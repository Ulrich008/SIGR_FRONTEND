import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AgentService } from '../../../../core/services/agent.service';
import { AgentResponse, Role } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-agent-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './agent-list.component.html'
})
export class AgentListComponent implements OnInit {
  agents: AgentResponse[] = [];
  allAgents: AgentResponse[] = [];
  filteredAgents: AgentResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  selectedUnite: string = '';
  selectedRole: Role | '' = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

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
        // Trier les agents par date de prise de service (le plus récent en haut)
        this.allAgents = agents.sort((a, b) => {
          const dateA = a.datePriseService ? new Date(a.datePriseService).getTime() : 0;
          const dateB = b.datePriseService ? new Date(b.datePriseService).getTime() : 0;
          return dateB - dateA;
        });
        
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les agents';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    this.filteredAgents = this.allAgents;
    
    if (this.selectedUnite) {
      this.filteredAgents = this.filteredAgents.filter(a => a.codeUnite === this.selectedUnite);
    }
    
    if (this.selectedRole) {
      this.filteredAgents = this.filteredAgents.filter(a => a.role === this.selectedRole);
    }
    
    this.currentPage = 1;
    this.updatePagination();
  }

  onUniteChange(): void {
    this.applyFilter();
  }

  onRoleChange(): void {
    this.applyFilter();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAgents.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.agents = this.filteredAgents.slice(startIndex, endIndex);
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
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredAgents.length);
    return { start, end };
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