import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { FormStepperComponent, FormStepDef } from '../../../../shared/form-stepper/form-stepper.component';

import { ControleSecondNiveauService } from '../../../../core/services/controle-second-niveau.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ControleSecondNiveauRequest, ControleSecondNiveauResponse } from '../../../../core/models/controle-interne.model';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-controle-second-niveau-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent, FormStepperComponent],
  templateUrl: './controle-second-niveau-form.component.html'
})
export class ControleSecondNiveauFormComponent implements OnInit {

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
  loadingProcessus = false;

  steps: FormStepDef[] = [
    { label: 'Informations générales' },
    { label: 'Contrôle de second niveau' },
    { label: 'Évolution de conformité' },
    { label: 'Anomalies et faiblesses de contrôles' }
  ];
  currentStep = 0;
  maxReachedStep = 0;

  private stepFields: string[][] = [
    ['codeUniteAdministrative', 'codeProcessus', 'dateControle'],
    [],
    [],
    []
  ];

  constructor(
    private fb: FormBuilder,
    private controleService: ControleSecondNiveauService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private processusService: ProcessusService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;

    this.form = this.fb.group({
      codeUniteAdministrative: ['', Validators.required],
      codeProcessus: ['', Validators.required],
      dateControle: [new Date().toISOString().split('T')[0], Validators.required],

      testsLibelle: [''], testsConstats: [''], testsAnalyse: [''], testsRecommandation: [''],
      revuesLibelle: [''], revuesConstats: [''], revuesAnalyse: [''], revuesRecommandation: [''],
      verificationLibelleDesPieces: [''], verificationConstats: [''], verificationAnalyse: [''], verificationRecommandation: [''],

      evolutionIntituleOperation: [''],
      evolutionProceduresInternesRenforcements: [''],
      evolutionResultatsConformite: [''],
      evolutionAnalyse: [''],
      evolutionRecommandation: [''],

      anomalieConstat: [''], anomalieAnalyse: [''], anomalieRecommandation: [''],
      faiblesseConstat: [''], faiblesseAnalyse: [''], faiblesseRecommandation: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.form.get('codeProcessus')?.disable();

    this.form.get('codeUniteAdministrative')?.valueChanges.subscribe(codeUnite => {
      if (codeUnite) {
        this.form.get('codeProcessus')?.enable({ emitEvent: false });
        this.loadProcessusByUnite(codeUnite);
      } else {
        this.form.get('codeProcessus')?.disable({ emitEvent: false });
        this.processus = [];
        this.form.patchValue({ codeProcessus: '' }, { emitEvent: false });
      }
    });

    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.isEditMode = true;
      this.code = codeParam;

      forkJoin({
        unitesAdministratives: this.uniteAdministrativeService.getAll(),
        controle: this.controleService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.unitesAdministratives = data.unitesAdministratives;
          this.patchForm(data.controle);
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
    this.uniteAdministrativeService.getAll().subscribe({
      next: (data) => {
        this.unitesAdministratives = data;
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
      next: (allProcessus) => setTimeout(() => {
        this.processus = allProcessus.filter(p => p.idUnite === codeUnite);
        this.loadingProcessus = false;
        this.cdr.detectChanges();
      }),
      error: (err) => {
        this.loadingProcessus = false;
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(c: ControleSecondNiveauResponse): void {
    this.form.patchValue({
      codeUniteAdministrative: c.codeUniteAdministrative,
      codeProcessus: c.codeProcessus,
      dateControle: this.formatDateForInput(c.dateControle),
      testsLibelle: c.testsLibelle, testsConstats: c.testsConstats, testsAnalyse: c.testsAnalyse, testsRecommandation: c.testsRecommandation,
      revuesLibelle: c.revuesLibelle, revuesConstats: c.revuesConstats, revuesAnalyse: c.revuesAnalyse, revuesRecommandation: c.revuesRecommandation,
      verificationLibelleDesPieces: c.verificationLibelleDesPieces, verificationConstats: c.verificationConstats, verificationAnalyse: c.verificationAnalyse, verificationRecommandation: c.verificationRecommandation,
      evolutionIntituleOperation: c.evolutionIntituleOperation,
      evolutionProceduresInternesRenforcements: c.evolutionProceduresInternesRenforcements,
      evolutionResultatsConformite: c.evolutionResultatsConformite,
      evolutionAnalyse: c.evolutionAnalyse,
      evolutionRecommandation: c.evolutionRecommandation,
      anomalieConstat: c.anomalieConstat, anomalieAnalyse: c.anomalieAnalyse, anomalieRecommandation: c.anomalieRecommandation,
      faiblesseConstat: c.faiblesseConstat, faiblesseAnalyse: c.faiblesseAnalyse, faiblesseRecommandation: c.faiblesseRecommandation
    });

    if (c.codeUniteAdministrative) {
      this.loadProcessusByUnite(c.codeUniteAdministrative);
    }
  }

  get processusOptions(): SearchableSelectOption[] {
    return this.processus.map(p => ({ value: p.code, label: p.libelle }));
  }

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
    this.stepFields[this.currentStep].forEach(field => this.form.get(field)?.markAsTouched());
    if (!this.isStepValid(this.currentStep)) return;

    this.currentStep++;
    if (this.currentStep > this.maxReachedStep) {
      this.maxReachedStep = this.currentStep;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  onSubmit(): void {
    this.stepFields[0].forEach(field => this.form.get(field)?.markAsTouched());
    if (!this.isStepValid(0)) {
      this.currentStep = 0;
      this.maxReachedStep = Math.max(this.maxReachedStep, 0);
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Enregistrer les modifications ?' : 'Créer ce contrôle de second niveau ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.isEditMode ? 'Oui, enregistrer' : 'Oui, créer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) this.save();
    });
  }

  private save(): void {
    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();
    const request: ControleSecondNiveauRequest = {
      codeUniteAdministrative: raw.codeUniteAdministrative,
      codeProcessus: raw.codeProcessus,
      dateControle: raw.dateControle,
      testsLibelle: raw.testsLibelle, testsConstats: raw.testsConstats, testsAnalyse: raw.testsAnalyse, testsRecommandation: raw.testsRecommandation,
      revuesLibelle: raw.revuesLibelle, revuesConstats: raw.revuesConstats, revuesAnalyse: raw.revuesAnalyse, revuesRecommandation: raw.revuesRecommandation,
      verificationLibelleDesPieces: raw.verificationLibelleDesPieces, verificationConstats: raw.verificationConstats, verificationAnalyse: raw.verificationAnalyse, verificationRecommandation: raw.verificationRecommandation,
      evolutionIntituleOperation: raw.evolutionIntituleOperation,
      evolutionProceduresInternesRenforcements: raw.evolutionProceduresInternesRenforcements,
      evolutionResultatsConformite: raw.evolutionResultatsConformite,
      evolutionAnalyse: raw.evolutionAnalyse,
      evolutionRecommandation: raw.evolutionRecommandation,
      anomalieConstat: raw.anomalieConstat, anomalieAnalyse: raw.anomalieAnalyse, anomalieRecommandation: raw.anomalieRecommandation,
      faiblesseConstat: raw.faiblesseConstat, faiblesseAnalyse: raw.faiblesseAnalyse, faiblesseRecommandation: raw.faiblesseRecommandation
    };

    const obs = this.isEditMode && this.code
      ? this.controleService.updateByCode(this.code, request)
      : this.controleService.create(request);

    obs.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: this.isEditMode ? 'Modifié' : 'Créé',
          text: `Le contrôle de second niveau a bien été ${this.isEditMode ? 'modifié' : 'créé'}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/controle-interne/controles-second-niveau']));
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible d\'enregistrer ce contrôle';
        Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/controle-interne/controles-second-niveau']);
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  // ========== Dropdown UA (copié du pattern plan-audit-form) ==========

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

  private updateUniteDropdownPosition(input: HTMLInputElement): void {
    const rect = input.getBoundingClientRect();
    this.uniteDropdownTop = rect.bottom + window.scrollY + 4;
    this.uniteDropdownLeft = rect.left + window.scrollX;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUniteDropdown = false;
    }
  }
}
