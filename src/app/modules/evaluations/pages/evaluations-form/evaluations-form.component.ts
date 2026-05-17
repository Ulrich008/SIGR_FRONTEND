import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { AgentService } from '../../../../core/services/agent.service';
import { EvaluationRequest, EvaluationResponse } from '../../../../core/models/evaluation.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-evaluations-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './evaluations-form.component.html'
})
export class EvaluationsFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  
  risques: RisqueResponse[] = [];
  agents: AgentResponse[] = [];
  loadingRisques = false;
  loadingAgents = false;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private risqueService: RisqueService,
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
      impact: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      probabilite: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      dateEvaluation: ['', [Validators.required]],
      bonnesPratiques: ['', [Validators.maxLength(1000)]],
      niveauControle: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      codeRisque: ['', [Validators.required]],
      matriculeAgent: ['']
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
        risques: this.risqueService.getAll(),
        agents: this.agentService.getAll(),
        evaluation: this.evaluationService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.risques = data.risques;
          this.agents = data.agents;
          this.patchForm(data.evaluation);
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
      risques: this.risqueService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.risques = data.risques;
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

  patchForm(evaluation: EvaluationResponse): void {
    this.form.patchValue({
      code: evaluation.code,
      impact: evaluation.impact,
      probabilite: evaluation.probabilite,
      dateEvaluation: this.formatDateForInput(evaluation.dateEvaluation),
      bonnesPratiques: evaluation.bonnesPratiques,
      niveauControle: evaluation.niveauControle,
      codeRisque: evaluation.idRisque,
      matriculeAgent: evaluation.idAgent
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: EvaluationRequest = {
      code: raw.code,
      impact: raw.impact,
      probabilite: raw.probabilite,
      dateEvaluation: raw.dateEvaluation,
      bonnesPratiques: raw.bonnesPratiques,
      niveauControle: raw.niveauControle,
      codeRisque: raw.codeRisque,
      matriculeAgent: raw.matriculeAgent
    };

    if (this.isEditMode && this.code) {
      this.evaluationService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'évaluation a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/evaluations']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'évaluation';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.evaluationService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'évaluation a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/evaluations']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'évaluation';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/evaluations']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    if (errors['max']) return `Maximum ${errors['max'].max}`;
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
