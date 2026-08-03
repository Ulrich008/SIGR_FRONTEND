import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AgentService } from '../../../../core/services/agent.service';
import { MinistereService } from '../../../../core/services/ministere.service';
import { AgentResponse } from '../../../../core/models/agent.model';
import { ImportResult } from '../../../../core/models/import-result.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { escapeHtml } from '../../../../core/utils/html-escape.util';

@Component({
  standalone: true,
  selector: 'app-agent-list',
  imports: [CommonModule, FormsModule, RouterModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './agent-list.component.html'
})
export class AgentListComponent implements OnInit {
  agents: AgentResponse[] = [];
  allAgents: AgentResponse[] = [];
  filteredAgents: AgentResponse[] = [];
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  exportingPdf = false;
  importing = false;

  constructor(
    private agentService: AgentService,
    private ministereService: MinistereService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef // ← ajout
  ) {
    this.menuItems = this.menuService.items;
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }

  get canExportPdf(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  get canImport(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
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
    const terme = this.searchTerm.trim().toLowerCase();
    this.filteredAgents = !terme
      ? this.allAgents
      : this.allAgents.filter(a =>
          a.matricule.toLowerCase().includes(terme) ||
          a.nom?.toLowerCase().includes(terme) ||
          a.prenoms?.toLowerCase().includes(terme) ||
          a.npi?.toLowerCase().includes(terme) ||
          a.role?.toLowerCase().includes(terme) ||
          a.codeProfil?.toLowerCase().includes(terme) ||
          a.libelleProfil?.toLowerCase().includes(terme) ||
          a.codeUnite?.toLowerCase().includes(terme) ||
          a.libelleUnite?.toLowerCase().includes(terme)
        );
    this.currentPage = 1;
    this.updatePagination();
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

  exportPdf(): void {
    if (this.isSuperAdmin) {
      this.demanderMinistereEtExporter();
    } else {
      this.telechargerPdf();
    }
  }

  private demanderMinistereEtExporter(): void {
    this.ministereService.getAll().subscribe({
      next: (ministeres) => {
        const options = ministeres
          .map(m => `<option value="${escapeHtml(m.code)}">${escapeHtml(m.code)} - ${escapeHtml(m.nom)}</option>`)
          .join('');

        Swal.fire({
          title: 'Choisir un ministère',
          html: `
            <select id="ministere-select" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px;">
              <option value="">-- Sélectionner un ministère --</option>
              ${options}
            </select>
          `,
          showCancelButton: true,
          confirmButtonText: 'Générer le PDF',
          cancelButtonText: 'Annuler',
          confirmButtonColor: '#047857',
          cancelButtonColor: '#6b7280',
          preConfirm: () => {
            const select = document.getElementById('ministere-select') as HTMLSelectElement;
            if (!select || !select.value) {
              Swal.showValidationMessage('Veuillez sélectionner un ministère');
              return false;
            }
            return select.value;
          }
        }).then(result => {
          if (result.isConfirmed && result.value) {
            this.telechargerPdf(result.value);
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || 'Impossible de charger la liste des ministères',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  private telechargerPdf(codeMinistere?: string): void {
    this.exportingPdf = true;
    this.agentService.exportPdf(codeMinistere).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agents.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.exportingPdf = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.exportingPdf = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || 'Impossible de générer le PDF',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
      case 'ADMIN':       return 'bg-purple-100 text-purple-700';
      case 'AGENT':       return 'bg-green-100 text-green-700';
      default:            return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusBadgeClass(enabled: boolean): string {
    return enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }

  triggerImport(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    fileInput.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing = true;
    this.agentService.importExcel(file).subscribe({
      next: (result) => {
        this.importing = false;
        this.loadAgents();
        this.afficherResultatImport(result);
      },
      error: (err) => {
        this.importing = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || "Impossible d'importer le fichier",
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  private afficherResultatImport(result: ImportResult): void {
    const listeErreurs = result.echecs.length
      ? `<div style="text-align:left;max-height:200px;overflow-y:auto;margin-top:12px;">
          <ul style="list-style:disc;padding-left:20px;">
            ${result.echecs.map(e => `<li>Ligne ${escapeHtml(e.ligne)} : ${escapeHtml(e.message)}</li>`).join('')}
          </ul>
        </div>`
      : '';

    Swal.fire({
      icon: result.echecs.length ? 'warning' : 'success',
      title: 'Import terminé',
      html: `${escapeHtml(result.succes)} / ${escapeHtml(result.totalLignes)} agent(s) importé(s) avec succès.${listeErreurs}`,
      confirmButtonColor: '#047857'
    });
  }

  downloadImportTemplate(): void {
    this.agentService.downloadImportTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modele_import_agents.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.message || 'Impossible de télécharger le modèle',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}