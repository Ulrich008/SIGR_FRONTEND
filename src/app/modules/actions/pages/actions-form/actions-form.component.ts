import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ActionService } from '../../../../core/services/action.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { AgentService } from '../../../../core/services/agent.service';
import { ActionRequest, ActionResponse, StatutAction } from '../../../../core/models/action.model';
import { PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-actions-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './actions-form.component.html'
})
export class ActionsFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  
  plans: PlanMitigationResponse[] = [];
  agents: AgentResponse[] = [];
  loadingPlans = false;
  loadingAgents = false;
  statutOptions = Object.values(StatutAction);

  constructor(
    private fb: FormBuilder,
    private actionService: ActionService,
    private planMitigationService: PlanMitigationService,
    private agentService: AgentService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }],
      libelle: ['', [Validators.required, Validators.maxLength(200)]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      statut: ['', [Validators.required]],
      codePlan: ['', [Validators.required]],
      matriculeResponsable: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.isEditMode = true;
      this.code = codeParam;
      
      forkJoin({
        plans: this.planMitigationService.getAll(),
        agents: this.agentService.getAll(),
        action: this.actionService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.plans = data.plans;
          this.agents = data.agents;
          this.patchForm(data.action);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de charger les données';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadReferenceData();
    }
  }

  loadReferenceData(): void {
    this.loading = true;
    forkJoin({
      plans: this.planMitigationService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.plans = data.plans;
        this.agents = data.agents;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger les données';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(action: ActionResponse): void {
    this.form.patchValue({
      code: action.code,
      libelle: action.libelle,
      dateDebut: this.formatDateForInput(action.dateDebut),
      dateFin: this.formatDateForInput(action.dateFin),
      statut: action.statut,
      codePlan: action.codePlan,
      matriculeResponsable: action.matriculeResponsable
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dateDebut = this.form.get('dateDebut')?.value;
    const dateFin = this.form.get('dateFin')?.value;

    if (new Date(dateFin) < new Date(dateDebut)) {
      Swal.fire({
        title: 'Erreur',
        text: 'La date de fin doit être supérieure à la date de début',
        icon: 'error'
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: ActionRequest = {
      libelle: raw.libelle,
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      statut: raw.statut,
      codePlan: raw.codePlan,
      matriculeResponsable: raw.matriculeResponsable
    };

    if (this.isEditMode && this.code) {
      this.actionService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'action a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/actions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'action';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.actionService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'action a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/actions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'action';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/actions']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
}
