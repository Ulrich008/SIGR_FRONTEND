import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanAuditService } from '../../../../core/services/plan-audit.service';
import { PlanAuditResponse, AuditPropose, TypeRevue } from '../../../../core/models/audit.model';
import { MenuService } from '../../../../core/services/menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';

@Component({
  selector: 'app-plan-audit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './plan-audit-list.component.html',
  styleUrls: ['./plan-audit-list.component.css']
})
export class PlanAuditListComponent implements OnInit {

  plansAudit: PlanAuditResponse[] = [];
  allPlansAudit: PlanAuditResponse[] = [];
  loading = false;
  error: string | null = null;
  search = '';

  menuItems: any[];

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private planAuditService: PlanAuditService,
    private router: Router,
    private menuService: MenuService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  get canWrite(): boolean {
    return this.authService.hasAnyRole(['SUPER_ADMIN', 'AUDITEUR']);
  }

  ngOnInit(): void {
    this.loadPlansAudit();
  }

  loadPlansAudit(): void {
    this.loading = true;
    this.error = null;

    this.planAuditService.getAll().subscribe({
      next: (data) => {
        this.allPlansAudit = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les plans d\'audit';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const terme = this.search.trim().toLowerCase();
    this.plansAudit = !terme
      ? this.allPlansAudit
      : this.allPlansAudit.filter(plan =>
          plan.libelle.toLowerCase().includes(terme) ||
          plan.code.toLowerCase().includes(terme) ||
          plan.nomUniteAdministrative?.toLowerCase().includes(terme) ||
          plan.nomProcessus?.toLowerCase().includes(terme) ||
          plan.libelleRisque?.toLowerCase().includes(terme) ||
          this.getAuditProposeLabel(plan.auditPropose).toLowerCase().includes(terme) ||
          this.getTypeRevueLabel(plan.typeRevue).toLowerCase().includes(terme)
        );
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  get filteredPlansAudit(): PlanAuditResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.plansAudit.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.plansAudit.length / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getDisplayedRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.plansAudit.length);
    return { start, end };
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  createPlanAudit(): void {
    if (!this.canWrite) return;
    this.router.navigate(['/plans-audit/new']);
  }

  viewPlanAudit(code: string): void {
    this.router.navigate(['/plans-audit', code]);
  }

  editPlanAudit(code: string): void {
    if (!this.canWrite) return;
    this.router.navigate(['/plans-audit', code]);
  }

  deletePlanAudit(code: string): void {
    if (!this.canWrite) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'audit ?')) {
      this.loading = true;
      this.planAuditService.deleteByCode(code).subscribe({
        next: () => {
          this.loadPlansAudit();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de supprimer le plan d\'audit';
          this.cdr.detectChanges();
        }
      });
    }
  }

  getAuditProposeLabel(auditPropose: string): string {
    if (!auditPropose) return '';
    return auditPropose
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  getTypeRevueLabel(typeRevue: string): string {
    if (!typeRevue) return '';
    return typeRevue
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  getAuditProposeBadgeClass(auditPropose: string): string {
    const classes: { [key: string]: string } = {
      'OPERATIONNEL_PERFORMANCE': 'bg-emerald-50 text-emerald-700',
      'CONFORMITE_REGULARITE': 'bg-blue-50 text-blue-700',
      'EVALUATION_FRAUDES_ERREURS': 'bg-red-50 text-red-700',
      'CONTROLE_INTERNE': 'bg-violet-50 text-violet-700',
      'VALIDATION_FIABILITE_INTEGRITE': 'bg-amber-50 text-amber-700',
      'AUDIT_SUIVI': 'bg-slate-50 text-slate-700'
    };
    return classes[auditPropose] || 'bg-slate-50 text-slate-700';
  }

  getTypeRevueBadgeClass(typeRevue: string): string {
    const classes: { [key: string]: string } = {
      'ASSURANCE_CARTOGRAPHIE_RISQUES': 'bg-emerald-50 text-emerald-700',
      'ASSURANCE_CONTROLE_INTERNE': 'bg-blue-50 text-blue-700',
      'REVUE_ASSURANCE_QUALITE': 'bg-violet-50 text-violet-700',
      'REVUE_SUIVI_RECOMMANDATIONS': 'bg-amber-50 text-amber-700'
    };
    return classes[typeRevue] || 'bg-slate-50 text-slate-700';
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  countByAuditPropose(auditPropose: string): number {
    return this.allPlansAudit.filter(p => p.auditPropose === auditPropose).length;
  }

  countByTypeRevue(typeRevue: string): number {
    return this.allPlansAudit.filter(p => p.typeRevue === typeRevue).length;
  }
}
