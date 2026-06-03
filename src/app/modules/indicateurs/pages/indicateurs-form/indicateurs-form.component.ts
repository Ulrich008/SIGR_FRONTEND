import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { UniteMesureService } from '../../../../core/services/unite-mesure.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { ActionService } from '../../../../core/services/action.service';
import { IndicateurPerformanceRequest, IndicateurPerformanceResponse, Frequence } from '../../../../core/models/indicateur-performance.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { UniteMesureResponse } from '../../../../core/models/unite-mesure.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { ActionResponse } from '../../../../core/models/action.model';
import { AuthService } from '../../../../core/services/auth.service';

function obtenueLequaleCible(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const cible   = group.get('valeurCible')?.value;
    const obtenue = group.get('valeurObtenue')?.value;
    // Validation uniquement pour les valeurs numériques
    if (cible && obtenue) {
      try {
        const cibleNum = parseFloat(cible);
        const obtenueNum = parseFloat(obtenue);
        if (!isNaN(cibleNum) && !isNaN(obtenueNum) && obtenueNum > cibleNum) {
          return { obtenueSuperieureCible: true };
        }
      } catch (e) {
        // Si ce n'est pas un nombre, on ne valide pas
      }
    }
    return null;
  };
}

@Component({
  standalone: true,
  selector: 'app-indicateurs-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './indicateurs-form.component.html'
})
export class IndicateursFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  processus: ProcessusResponse[] = [];
  unitesMesure: UniteMesureResponse[] = [];
  risques: RisqueResponse[] = [];
  plansMitigation: PlanMitigationResponse[] = [];
  actions: ActionResponse[] = [];
  loadingProcessus = false;
  loadingUnitesMesure = false;
  loadingRisques = false;
  loadingPlans = false;
  loadingActions = false;
  frequenceOptions = Object.values(Frequence);

  constructor(
    private fb: FormBuilder,
    private indicateurService: IndicateurPerformanceService,
    private processusService: ProcessusService,
    private uniteMesureService: UniteMesureService,
    private risqueService: RisqueService,
    private planMitigationService: PlanMitigationService,
    private actionService: ActionService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group(
      {
        code:          [{ value: '', disabled: true }],
        libelle:       ['', [Validators.required, Validators.maxLength(200)]],
        frequence:     ['', [Validators.required]],
        valeurCible:   [''],
        valeurObtenue: [''],
        seuilAlerte:   [''],
        codeUniteMesure: [''],
        dateDebut:     [''],
        dateFin:       [''],
        codeProcessus: ['', [Validators.required]],
        codeRisque:    [''],
        codePlanMitigation: [''],
        codeAction:    ['']
      },
      { validators: obtenueLequaleCible() }
    );
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
      this.loading = true;

      forkJoin({
        processus:  this.processusService.getAll(),
        indicateur: this.indicateurService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.processus = data.processus;
          this.patchForm(data.indicateur);
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
      processus: this.processusService.getAll(),
      unitesMesure: this.uniteMesureService.getAll()
    }).subscribe({
      next: (data) => {
        this.processus = data.processus;
        this.unitesMesure = data.unitesMesure;
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

  onProcessusChange(codeProcessus: string): void {
    this.form.patchValue({ codeRisque: null, codePlanMitigation: null, codeAction: null });
    this.risques = [];
    this.plansMitigation = [];
    this.actions = [];

    if (!codeProcessus) return;

    this.loadingRisques = true;
    this.risqueService.getAll().subscribe({
      next: (risques) => {
        this.risques = risques.filter(r => r.codeProcessus === codeProcessus);
        this.loadingRisques = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingRisques = false;
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  onRisqueChange(codeRisque: string): void {
    this.form.patchValue({ codePlanMitigation: null, codeAction: null });
    this.plansMitigation = [];
    this.actions = [];

    if (!codeRisque) return;

    this.loadingPlans = true;
    this.planMitigationService.getAll().subscribe({
      next: (plans) => {
        this.plansMitigation = plans.filter(p => p.codeRisque === codeRisque);
        this.loadingPlans = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPlans = false;
        this.error = err?.message || 'Impossible de charger les plans de mitigation';
        this.cdr.detectChanges();
      }
    });
  }

  onPlanMitigationChange(codePlan: string): void {
    this.form.patchValue({ codeAction: null });
    this.actions = [];

    if (!codePlan) return;

    this.loadingActions = true;
    this.actionService.getAll().subscribe({
      next: (actions) => {
        this.actions = actions.filter(a => a.codePlan === codePlan);
        this.loadingActions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingActions = false;
        this.error = err?.message || 'Impossible de charger les actions';
        this.cdr.detectChanges();
      }
    });
  }

  onActionChange(codeAction: string): void {
    if (!codeAction) return;

    this.actionService.getByCode(codeAction).subscribe({
      next: (action) => {
        this.form.patchValue({
          dateDebut: this.formatDateForInput(action.dateDebut),
          dateFin: this.formatDateForInput(action.dateFin)
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Impossible de charger les dates de l\'action', err);
      }
    });
  }

  isDateUnite(): boolean {
    const codeUniteMesure = this.form.get('codeUniteMesure')?.value;
    if (!codeUniteMesure) return false;
    const unite = this.unitesMesure.find(u => u.code === codeUniteMesure);
    return unite?.typeUnite === 'DATE';
  }

  patchForm(indicateur: IndicateurPerformanceResponse): void {
    // Charger les données de référence pour les select
    this.loadReferenceData();
    
    // Charger les données dépendantes basées sur le processus
    if (indicateur.codeProcessus) {
      this.onProcessusChange(indicateur.codeProcessus);
    }
    if (indicateur.codeRisque) {
      this.onRisqueChange(indicateur.codeRisque);
    }
    if (indicateur.codePlanMitigation) {
      this.onPlanMitigationChange(indicateur.codePlanMitigation);
    }

    this.form.patchValue({
      code:          indicateur.code,
      libelle:       indicateur.libelle,
      frequence:     indicateur.frequence,
      valeurCible:   indicateur.valeurCible,
      valeurObtenue: indicateur.valeurObtenue,
      seuilAlerte:   this.formatDateForInput(indicateur.seuilAlerte),
      codeUniteMesure: indicateur.codeUniteMesure,
      dateDebut:     this.formatDateForInput(indicateur.dateDebut),
      dateFin:       this.formatDateForInput(indicateur.dateFin),
      codeProcessus: indicateur.codeProcessus,
      codeRisque:    indicateur.codeRisque,
      codePlanMitigation: indicateur.codePlanMitigation,
      codeAction:    indicateur.codeAction
    });

    // Désactiver les champs lors de la modification (sauf valeurCible et valeurObtenue)
    this.form.get('libelle')?.disable();
    this.form.get('frequence')?.disable();
    this.form.get('codeUniteMesure')?.disable();
    this.form.get('seuilAlerte')?.disable();
    this.form.get('dateDebut')?.disable();
    this.form.get('dateFin')?.disable();
    this.form.get('codeProcessus')?.disable();
    this.form.get('codeRisque')?.disable();
    this.form.get('codePlanMitigation')?.disable();
    this.form.get('codeAction')?.disable();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['obtenueSuperieureCible']) {
        this.error = 'La valeur obtenue ne peut pas être supérieure à la valeur cible.';
      }
      return;
    }
    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();
    const request: IndicateurPerformanceRequest = {
      code:          raw.code,
      libelle:       raw.libelle,
      frequence:     raw.frequence,
      valeurCible:   raw.valeurCible ? String(raw.valeurCible) : undefined,
      valeurObtenue: raw.valeurObtenue ? String(raw.valeurObtenue) : undefined,
      seuilAlerte:   raw.seuilAlerte,
      codeUniteMesure: raw.codeUniteMesure,
      dateDebut:     raw.dateDebut,
      dateFin:       raw.dateFin,
      codeProcessus: raw.codeProcessus,
      codeRisque:    raw.codeRisque,
      codePlanMitigation: raw.codePlanMitigation,
      codeAction:    raw.codeAction
    };

    if (this.isEditMode && this.code) {
      this.indicateurService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'indicateur a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/indicateurs']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'indicateur';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.indicateurService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'indicateur a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/indicateurs']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'indicateur';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/indicateurs']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required'])  return 'Ce champ est requis';
    if (errors['min'])       return 'La valeur ne peut pas être négative';
    if (errors['max'])       return 'La valeur ne peut pas dépasser 100%';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }
  get erreurObtenueSuperieureCible(): boolean {
    return this.form.errors?.['obtenueSuperieureCible'] &&
           (this.form.get('valeurCible')?.touched || this.form.get('valeurObtenue')?.touched)
           ? true : false;
  }

  private formatDateForInput(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  getUniteSymbole(codeUniteMesure?: string): string {
    if (!codeUniteMesure) return '';
    const unite = this.unitesMesure.find(u => u.code === codeUniteMesure);
    return unite?.symbole || '';
  }
}