import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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

// ================= VALIDATEUR DATES =================
function dateFinSuperieureDateDebut(group: AbstractControl): ValidationErrors | null {
  const dateDebut = group.get('dateDebut')?.value;
  const dateFin   = group.get('dateFin')?.value;
  if (!dateDebut || !dateFin) return null;
  return new Date(dateFin) > new Date(dateDebut)
    ? null
    : { dateFinInvalide: true };
}

// ================= VALIDATEUR PROTECTION/PREVENTION =================
function protectionPreventionInferieures(group: AbstractControl): ValidationErrors | null {
  const impactInherent       = Number(group.get('impactInherent')?.value);
  const probabiliteInherente = Number(group.get('probabiliteInherente')?.value);
  const protection           = Number(group.get('protection')?.value);
  const prevention           = Number(group.get('prevention')?.value);

  if (!impactInherent || !probabiliteInherente || !protection || !prevention) return null;

  const errors: ValidationErrors = {};

  if (protection >= impactInherent) {
    errors['protectionTropElevee'] = { max: impactInherent - 1, actual: protection };
  }
  if (prevention >= probabiliteInherente) {
    errors['preventionTropElevee'] = { max: probabiliteInherente - 1, actual: prevention };
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

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
  agents: AgentResponse[]   = [];

  sections = {
    period:          true,
    inherent:        true,
    controles:       true,
    additional:      false,
    recommendations: false
  };

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
      code:                 [{ value: '', disabled: true }],
      impactInherent:       ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      probabiliteInherente: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      protection:           ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      prevention:           ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      controleExistants:    [''],
      controleInexistants:  [''],
      dejaSurvenu:          [false],
      dateDebut:            [''],
      dateFin:              [''],
      recommandation:       ['', [Validators.maxLength(1000)]],
      bonnesPratiques:      ['', [Validators.maxLength(1000)]],
      codeRisque:           ['', [Validators.required]],
      matriculeAgent:       ['']
    }, {
      validators: [
        dateFinSuperieureDateDebut,
        protectionPreventionInferieures
      ]
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
      this.code       = codeParam;
      this.loading    = true;

      // ================= CLE DU CORRECTIF =================
      // On charge les 3 ressources ensemble, puis on patch APRES
      // que risques et agents soient disponibles dans le DOM
      forkJoin({
        risques:    this.risqueService.getAll(),
        agents:     this.agentService.getAll(),
        evaluation: this.evaluationService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.risques = data.risques;
          this.agents  = data.agents;
          this.loading = false;
          this.cdr.detectChanges(); // ← les <option> sont rendus AVANT patchValue

          // setTimeout(0) reporte patchForm après le prochain cycle de rendu
          // afin que le <select> trouve les <option> correspondantes
          setTimeout(() => {
            this.patchForm(data.evaluation);
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          this.loading = false;
          this.error   = err?.message || 'Impossible de charger les données';
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
      agents:  this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.risques = data.risques;
        this.agents  = data.agents;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error   = err?.message || 'Impossible de charger les données';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(evaluation: EvaluationResponse): void {
    this.form.patchValue({
      code:                 evaluation.code,
      impactInherent:       evaluation.impactInherent,
      probabiliteInherente: evaluation.probabiliteInherente,
      protection:           evaluation.protection,
      prevention:           evaluation.prevention,
      controleExistants:    evaluation.controleExistants,
      controleInexistants:  evaluation.controleInexistants,
      dejaSurvenu:          evaluation.dejaSurvenu,
      dateDebut:            this.formatDateForInput(evaluation.dateDebut),
      dateFin:              this.formatDateForInput(evaluation.dateFin),
      recommandation:       evaluation.recommandation,
      bonnesPratiques:      evaluation.bonnesPratiques,
      codeRisque:           evaluation.codeRisque,
      matriculeAgent:       evaluation.matriculeAgent ?? ''
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.errors?.['dateFinInvalide']) {
        Swal.fire({
          title: 'Dates invalides',
          text: 'La date de fin doit être supérieure à la date de début.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (
        this.form.errors?.['protectionTropElevee'] ||
        this.form.errors?.['preventionTropElevee']
      ) {
        Swal.fire({
          title: 'Valeurs invalides',
          text: 'La protection et la prévention doivent être strictement inférieures à l\'impact inhérent et à la probabilité inhérente.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      return;
    }

    this.loading = true;
    this.error   = null;

    const raw = this.form.getRawValue();
    const request: EvaluationRequest = {
      impactInherent:       raw.impactInherent,
      probabiliteInherente: raw.probabiliteInherente,
      protection:           raw.protection,
      prevention:           raw.prevention,
      controleExistants:    raw.controleExistants   || undefined,
      controleInexistants:  raw.controleInexistants || undefined,
      dejaSurvenu:          raw.dejaSurvenu         || false,
      dateDebut:            raw.dateDebut           || undefined,
      dateFin:              raw.dateFin             || undefined,
      recommandation:       raw.recommandation      || undefined,
      bonnesPratiques:      raw.bonnesPratiques     || undefined,
      codeRisque:           raw.codeRisque,
      matriculeAgent:       raw.matriculeAgent      || undefined
    };

    const action$ = this.isEditMode && this.code
      ? this.evaluationService.update(this.code, request)
      : this.evaluationService.create(request);

    const label = this.isEditMode ? 'modifiée' : 'créée';

    action$.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: this.isEditMode ? 'Modifié' : 'Créé',
          text: `L'évaluation a bien été ${label}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/evaluations']));
      },
      error: (err) => {
        this.loading = false;
        this.error   = err?.message || `Impossible de ${this.isEditMode ? 'modifier' : 'créer'} l'évaluation`;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/evaluations']);
  }

  toggleSection(section: keyof typeof this.sections): void {
    this.sections[section] = !this.sections[section];
  }

  // ================= GETTER ERREUR DATE =================
  get dateFinError(): boolean {
    return !!(
      this.form.errors?.['dateFinInvalide'] &&
      this.form.get('dateDebut')?.touched &&
      this.form.get('dateFin')?.touched
    );
  }

  // ================= GETTER ERREUR PROTECTION =================
  get protectionError(): string {
    if (
      this.form.errors?.['protectionTropElevee'] &&
      this.form.get('protection')?.touched &&
      this.form.get('impactInherent')?.touched
    ) {
      const max = this.form.errors['protectionTropElevee'].max;
      return `La protection doit être inférieure à l'impact inhérent (max autorisé : ${max})`;
    }
    return '';
  }

  // ================= GETTER ERREUR PREVENTION =================
  get preventionError(): string {
    if (
      this.form.errors?.['preventionTropElevee'] &&
      this.form.get('prevention')?.touched &&
      this.form.get('probabiliteInherente')?.touched
    ) {
      const max = this.form.errors['preventionTropElevee'].max;
      return `La prévention doit être inférieure à la probabilité inhérente (max autorisé : ${max})`;
    }
    return '';
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required'])  return 'Ce champ est requis';
    if (errors['min'])       return `Minimum ${errors['min'].min}`;
    if (errors['max'])       return `Maximum ${errors['max'].max}`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }

  private formatDateForInput(date?: string): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }
}