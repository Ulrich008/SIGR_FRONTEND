import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { PlanMitigationRequest, PlanMitigationResponse, StatutPlanMitigation } from '../../../../core/models/plan-mitigation.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-plans-mitigation-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './plans-mitigation-form.component.html'
})
export class PlansMitigationFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  risques: RisqueResponse[] = [];
  loadingRisques = false;
  statutOptions = Object.values(StatutPlanMitigation);

  constructor(
    private fb: FormBuilder,
    private planMitigationService: PlanMitigationService,
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
      // ✅ Champ libellé ajouté
      libelle: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      dateCreation: ['', [Validators.required]],
      statut: ['', [Validators.required]],
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
        risques: this.risqueService.getAll(),
        plan: this.planMitigationService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.risques = data.risques;
          this.patchForm(data.plan);
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
    this.risqueService.getAll().subscribe({
      next: (risques) => {
        this.risques = risques;
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

  patchForm(plan: PlanMitigationResponse): void {
    this.form.patchValue({
      code: plan.code,
      // ✅ Libellé patché
      libelle: plan.libelle,
      description: plan.description,
      dateCreation: this.formatDateForInput(plan.dateCreation),
      statut: plan.statut,
      codeRisque: plan.codeRisque
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

    const request: PlanMitigationRequest = {
      // ✅ Libellé inclus dans la requête
      libelle: raw.libelle,
      description: raw.description,
      dateCreation: raw.dateCreation,
      statut: raw.statut,
      codeRisque: raw.codeRisque
    };

    if (this.isEditMode && this.code) {
      this.planMitigationService.updateByCode(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'Le plan a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-mitigation']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le plan';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.planMitigationService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'Le plan a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-mitigation']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer le plan';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/plans-mitigation']);
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