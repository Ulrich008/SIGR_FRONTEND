import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { FormStepperComponent, FormStepDef } from '../../../../shared/form-stepper/form-stepper.component';
import { PlanAuditService } from '../../../../core/services/plan-audit.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { PlanAuditRequest, PlanAuditResponse, AuditPropose, TypeRevue } from '../../../../core/models/audit.model';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';
import { planAuditSchema } from './plan-audit-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-plan-audit-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent, FormStepperComponent],
  templateUrl: './plan-audit-form.component.html'
})
export class PlanAuditFormComponent implements OnInit {

  form: FormGroup;

  isEditMode = false;
  code?: string;

  loading = false;
  error: string | null = null;

  menuItems: MenuItem[];

  unitesAdministratives: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  showUniteDropdown = false;
  uniteDropdownTop = 0;
  uniteDropdownLeft = 0;
  processus: ProcessusResponse[] = [];
  risques: RisqueResponse[] = [];
  loadingProcessus = false;
  loadingRisques = false;
  auditProposeOptions: string[] = [];
  typeRevueOptions: string[] = [];

  steps: FormStepDef[] = [
    { label: 'Informations générales' },
    { label: 'Pré-planification d\'audit' }
  ];
  currentStep = 0;
  maxReachedStep = 0;

  private stepFields: string[][] = [
    ['libelle', 'dateCreation', 'codeUniteAdministrative'],
    ['codeProcessus', 'codeRisque', 'auditPropose', 'typeRevue', 'objectifAudit', 'effetAuditIndicatif']
  ];

  isStepValid(step: number): boolean {
    return this.stepFields[step].every(field => {
      const control = this.form.get(field);
      return !control || control.disabled || control.valid;
    });
  }

  goToStep(step: number): void {
    if (step <= this.maxReachedStep) {
      this.currentStep = step;
    }
  }

  nextStep(): void {
    applyZodValidation(this.form, planAuditSchema, this.form.getRawValue());
    this.stepFields[this.currentStep].forEach(field => this.form.get(field)?.markAsTouched());
    if (!this.isStepValid(this.currentStep)) {
      return;
    }

    this.currentStep++;
    if (this.currentStep > this.maxReachedStep) {
      this.maxReachedStep = this.currentStep;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  constructor(
    private fb: FormBuilder,
    private planAuditService: PlanAuditService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private processusService: ProcessusService,
    private risqueService: RisqueService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {

    this.menuItems = this.menuService.items;

    this.form = this.fb.group({
      libelle: [''],
      dateCreation: [''],
      codeUniteAdministrative: [''],
      codeProcessus: [''],
      codeRisque: [''],
      auditPropose: [''],
      typeRevue: [''],
      objectifAudit: [''],
      effetAuditIndicatif: ['']
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, planAuditSchema, this.form.getRawValue())
    );
  }

  isRequired(field: string): boolean {
    return isRequired(planAuditSchema, field);
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
        unitesAdministratives: this.uniteAdministrativeService.getAll(),
        auditProposeEnums: this.planAuditService.getAuditProposeEnums(),
        typeRevueEnums: this.planAuditService.getTypeRevueEnums(),
        planAudit: this.planAuditService.getByCode(codeParam)
      }).subscribe({

        next: (data) => {

          this.unitesAdministratives = data.unitesAdministratives;
          this.auditProposeOptions = data.auditProposeEnums;
          this.typeRevueOptions = data.typeRevueEnums;

          this.patchForm(data.planAudit);

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

    // Champs en cascade : désactivés tant que leur "parent" n'a pas de
    // valeur. Piloté exclusivement via l'API FormControl (.enable()/.disable())
    // plutôt qu'un binding [disabled] dans le template, qui rentre en
    // conflit avec la directive formControlName (cf. avertissement Angular
    // "using the disabled attribute with a reactive form directive").
    this.form.get('codeProcessus')?.disable();
    this.form.get('codeRisque')?.disable();

    // Charger les processus quand l'unité administrative change
    this.form.get('codeUniteAdministrative')?.valueChanges.subscribe(codeUnite => {
      this.form.get('codeRisque')?.disable({ emitEvent: false });

      if (codeUnite) {
        this.form.get('codeProcessus')?.enable({ emitEvent: false });
        this.loadProcessusByUnite(codeUnite);
      } else {
        this.form.get('codeProcessus')?.disable({ emitEvent: false });
        this.processus = [];
        this.form.patchValue({ codeProcessus: '', codeRisque: '' }, { emitEvent: false });
      }
    });

    // Charger les risques quand le processus change
    this.form.get('codeProcessus')?.valueChanges.subscribe(codeProcessus => {
      if (codeProcessus) {
        this.form.get('codeRisque')?.enable({ emitEvent: false });
        this.loadRisquesByProcessus(codeProcessus);
      } else {
        this.form.get('codeRisque')?.disable({ emitEvent: false });
        this.risques = [];
        this.form.patchValue({ codeRisque: '' }, { emitEvent: false });
      }
    });
  }

  loadReferenceData(): void {

    this.loading = true;

    forkJoin({
      unitesAdministratives: this.uniteAdministrativeService.getAll(),
      auditProposeEnums: this.planAuditService.getAuditProposeEnums(),
      typeRevueEnums: this.planAuditService.getTypeRevueEnums()
    }).subscribe({

      next: (data) => {

        this.unitesAdministratives = data.unitesAdministratives;
        this.filteredUnites = [];
        this.auditProposeOptions = data.auditProposeEnums;
        this.typeRevueOptions = data.typeRevueEnums;

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

  loadProcessusByUnite(codeUnite: string): void {
    this.loadingProcessus = true;
    this.processusService.getAll().subscribe({
      // Le setTimeout(0) reporte la mise à jour à un nouveau tick : appeler
      // detectChanges() directement ici pouvait entrer en collision avec un
      // cycle de détection de changement déjà en cours (ex: déclenché par
      // le clic qui a sélectionné l'unité), provoquant un NG0100
      // (ExpressionChangedAfterItHasBeenCheckedError) sur les options du
      // select "Processus" qui passaient de [] à la liste réelle.
      next: (allProcessus) => setTimeout(() => {
        // Filtrer les processus liés à l'unité administrative
        this.processus = allProcessus.filter(p => p.idUnite === codeUnite);
        this.loadingProcessus = false;
        this.form.patchValue({ codeProcessus: '', codeRisque: '' });
        this.cdr.detectChanges();
      }),
      error: (err) => {
        this.loadingProcessus = false;
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  loadRisquesByProcessus(codeProcessus: string): void {
    this.loadingRisques = true;
    this.risqueService.getAll().subscribe({
      next: (allRisques) => setTimeout(() => {
        // Filtrer les risques liés au processus
        this.risques = allRisques.filter(r => r.codeProcessus === codeProcessus);
        this.loadingRisques = false;
        this.form.patchValue({ codeRisque: '' });
        this.cdr.detectChanges();
      }),
      error: (err) => {
        this.loadingRisques = false;
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(planAudit: PlanAuditResponse): void {

    this.form.patchValue({
      libelle: planAudit.libelle,
      dateCreation: this.formatDateForInput(planAudit.dateCreation),
      codeUniteAdministrative: planAudit.codeUniteAdministrative,
      codeProcessus: planAudit.codeProcessus,
      codeRisque: planAudit.codeRisque,
      auditPropose: planAudit.auditPropose,
      typeRevue: planAudit.typeRevue,
      objectifAudit: planAudit.objectifAudit,
      effetAuditIndicatif: planAudit.effetAuditIndicatif
    });

    // Charger les processus et risques pour l'unité et le processus sélectionnés
    if (planAudit.codeUniteAdministrative) {
      this.loadProcessusByUnite(planAudit.codeUniteAdministrative);
    }

    if (planAudit.codeProcessus) {
      this.loadRisquesByProcessus(planAudit.codeProcessus);
    }
  }

  private firstInvalidStep(): number {
    return this.stepFields.findIndex(fields =>
      fields.some(field => {
        const control = this.form.get(field);
        return control && !control.disabled && control.invalid;
      })
    );
  }

  onSubmit(): void {

    const valid = applyZodValidation(this.form, planAuditSchema, this.form.getRawValue());
    if (!valid) {

      this.form.markAllAsTouched();
      const invalidStep = this.firstInvalidStep();
      if (invalidStep !== -1) {
        this.currentStep = invalidStep;
        if (this.currentStep > this.maxReachedStep) {
          this.maxReachedStep = this.currentStep;
        }
      }
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: PlanAuditRequest = {
      libelle: raw.libelle,
      dateCreation: raw.dateCreation,
      codeUniteAdministrative: raw.codeUniteAdministrative,
      codeProcessus: raw.codeProcessus,
      codeRisque: raw.codeRisque,
      auditPropose: raw.auditPropose,
      typeRevue: raw.typeRevue,
      objectifAudit: raw.objectifAudit,
      effetAuditIndicatif: raw.effetAuditIndicatif
    };

    if (this.isEditMode && this.code) {

      this.planAuditService.updateByCode(this.code, request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Modifié',
            text: 'Le plan d\'audit a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-audit']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le plan d\'audit';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });

          this.cdr.detectChanges();
        }
      });

    } else {

      this.planAuditService.create(request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Créé',
            text: 'Le plan d\'audit a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-audit']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de créer le plan d\'audit';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });

          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/plans-audit']);
  }

  get processusOptions(): SearchableSelectOption[] {
    return this.processus.map(p => ({ value: p.code, label: p.libelle }));
  }

  get risqueOptions(): SearchableSelectOption[] {
    return this.risques.map(r => ({ value: r.code, label: r.libelle }));
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }

  private formatDateForInput(date: string): string {

    if (!date) {
      return '';
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toISOString().split('T')[0];
  }

  formatEnumLabel(enumValue: string): string {
    if (!enumValue) {
      return '';
    }
    // Convertir SNAKE_CASE en texte lisible
    return enumValue
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  onUniteFocus(input: HTMLInputElement): void {
    const currentValue = this.form.get('codeUniteAdministrative')?.value;
    if (currentValue) {
      this.onUniteSearch({ target: { value: currentValue } } as any, input);
    } else {
      this.filteredUnites = this.unitesAdministratives;
      this.updateUniteDropdownPosition(input);
      this.showUniteDropdown = this.filteredUnites.length > 0;
      this.cdr.detectChanges();
    }
  }

  onUniteSearch(event: Event, input?: HTMLInputElement): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.updateUniteDropdownPosition(input ?? (event.target as HTMLInputElement));

    if (!searchTerm) {
      this.filteredUnites = this.unitesAdministratives;
      this.showUniteDropdown = this.filteredUnites.length > 0;
      this.cdr.detectChanges();
      return;
    }

    this.filteredUnites = this.unitesAdministratives.filter(unite =>
      unite.code.toLowerCase().includes(searchTerm) ||
      unite.libelle.toLowerCase().includes(searchTerm)
    );

    this.showUniteDropdown = this.filteredUnites.length > 0;
    this.cdr.detectChanges();
  }

  selectUnite(unite: UniteAdministrativeResponse): void {
    this.form.patchValue({ codeUniteAdministrative: unite.code });
    this.showUniteDropdown = false;
    this.filteredUnites = [];
    this.loadProcessusByUnite(unite.code);
  }

  /**
   * Calculée une seule fois au moment où le menu s'ouvre (plutôt qu'à
   * chaque cycle de détection de changement via un appel dans le template)
   * pour éviter un NG0100 : getBoundingClientRect() peut légèrement varier
   * d'un passage de vérification à l'autre à cause du reflow provoqué par
   * l'ouverture du menu lui-même.
   */
  private updateUniteDropdownPosition(input: HTMLInputElement): void {
    const rect = input.getBoundingClientRect();
    this.uniteDropdownTop = rect.bottom + window.scrollY + 4;
    this.uniteDropdownLeft = rect.left + window.scrollX;
  }

  // Fermer le dropdown si on clique ailleurs
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUniteDropdown = false;
    }
  }
}
