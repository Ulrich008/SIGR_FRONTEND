import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { PlanMitigationRequest, PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { planMitigationSchema } from './plans-mitigation-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-plans-mitigation-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent],
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
  nouveauCodeRisque: string | null = null;

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
      libelle: [''],
      description: [''],
      dateCreation: [''],
      codesRisques: [[] as string[]]
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, planMitigationSchema, this.form.getRawValue())
    );
  }

  get risqueOptions(): SearchableSelectOption[] {
    const codesSelectionnes: string[] = this.form.get('codesRisques')?.value ?? [];
    return this.risques
      .filter(r => !codesSelectionnes.includes(r.code))
      .map(r => ({ value: r.code, label: `${r.code} - ${r.libelle}` }));
  }

  get risquesSelectionnes(): RisqueResponse[] {
    const codesSelectionnes: string[] = this.form.get('codesRisques')?.value ?? [];
    return codesSelectionnes
      .map(code => this.risques.find(r => r.code === code))
      .filter((r): r is RisqueResponse => !!r);
  }

  ajouterRisque(): void {
    if (!this.nouveauCodeRisque) return;

    const codesRisques: string[] = this.form.get('codesRisques')?.value ?? [];
    if (!codesRisques.includes(this.nouveauCodeRisque)) {
      this.form.get('codesRisques')?.setValue([...codesRisques, this.nouveauCodeRisque]);
      this.form.get('codesRisques')?.markAsTouched();
    }
    this.nouveauCodeRisque = null;
  }

  supprimerRisque(code: string): void {
    const codesRisques: string[] = this.form.get('codesRisques')?.value ?? [];
    this.form.get('codesRisques')?.setValue(codesRisques.filter(c => c !== code));
    this.form.get('codesRisques')?.markAsTouched();
  }

  isRequired(field: string): boolean {
    return isRequired(planMitigationSchema, field);
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
      codesRisques: plan.codesRisques ?? []
    });
  }

  onSubmit(): void {
    const valid = applyZodValidation(this.form, planMitigationSchema, this.form.getRawValue());
    if (!valid) {
      this.form.markAllAsTouched();
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Enregistrer les modifications ?' : 'Créer ce plan de mitigation ?',
      text: this.isEditMode ? 'Voulez-vous enregistrer les modifications de ce plan de mitigation ?' : 'Voulez-vous créer ce plan de mitigation ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.isEditMode ? 'Oui, enregistrer' : 'Oui, créer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.savePlan();
      }
    });
  }

  private savePlan(): void {
    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: PlanMitigationRequest = {
      // ✅ Libellé inclus dans la requête
      libelle: raw.libelle,
      description: raw.description,
      dateCreation: raw.dateCreation,
      codesRisques: raw.codesRisques
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
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
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
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/plans-mitigation']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
}