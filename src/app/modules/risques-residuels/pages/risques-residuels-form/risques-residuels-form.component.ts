import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { RisqueResiduelService } from '../../../../core/services/risque-residuel.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { RisqueResiduelRequest, RisqueResiduelResponse } from '../../../../core/models/risque-residuel.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-residuels-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './risques-residuels-form.component.html'
})
export class RisquesResiduelsFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  
  evaluations: EvaluationResponse[] = [];
  risques: RisqueResponse[] = [];
  loadingEvaluations = false;
  loadingRisques = false;

  constructor(
    private fb: FormBuilder,
    private risqueResiduelService: RisqueResiduelService,
    private evaluationService: EvaluationService,
    private risqueService: RisqueService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }],
      impactResiduel: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      probabiliteResiduelle: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      codeEvaluation: ['', [Validators.required]],
      codeRisque: ['', [Validators.required]]
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
        evaluations: this.evaluationService.getAll(),
        risques: this.risqueService.getAll(),
        risqueResiduel: this.risqueResiduelService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.evaluations = data.evaluations;
          this.risques = data.risques;
          this.patchForm(data.risqueResiduel);
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
      evaluations: this.evaluationService.getAll(),
      risques: this.risqueService.getAll()
    }).subscribe({
      next: (data) => {
        this.evaluations = data.evaluations;
        this.risques = data.risques;
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

  patchForm(risqueResiduel: RisqueResiduelResponse): void {
    this.form.patchValue({
      code: risqueResiduel.code,
      impactResiduel: risqueResiduel.impactResiduel,
      probabiliteResiduelle: risqueResiduel.probabiliteResiduelle,
      codeEvaluation: risqueResiduel.codeEvaluation,
      codeRisque: risqueResiduel.codeRisque
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

    const request: RisqueResiduelRequest = {
      code: raw.code,
      impactResiduel: raw.impactResiduel,
      probabiliteResiduelle: raw.probabiliteResiduelle,
      codeEvaluation: raw.codeEvaluation,
      codeRisque: raw.codeRisque
    };

    if (this.isEditMode && this.code) {
      this.risqueResiduelService.updateByCode(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'Le risque résiduel a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/risques-residuels']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le risque résiduel';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.risqueResiduelService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'Le risque résiduel a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/risques-residuels']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer le risque résiduel';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/risques-residuels']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    if (errors['max']) return `Maximum ${errors['max'].max}`;
    return 'Champ invalide';
  }
}
