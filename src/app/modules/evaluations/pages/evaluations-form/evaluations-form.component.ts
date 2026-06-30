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

function dateFinSuperieureDateDebut(group: AbstractControl): ValidationErrors | null {
  const dateDebut = group.get('dateDebut')?.value;
  const dateFin   = group.get('dateFin')?.value;
  if (!dateDebut || !dateFin) return null;
  return new Date(dateFin) > new Date(dateDebut)
    ? null
    : { dateFinInvalide: true };
}

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
  bonnesPratiquesRisque: string[] = [];
  selectedBonnesPratiques: Set<string> = new Set();

  sections = {
    period:          true,
    inherent:        true,
    controles:       true,
    additional:      true,
    recommendations: true
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
      impactInherent:       [{ value: 5, disabled: true }, [Validators.required, Validators.min(1), Validators.max(5)]],
      probabiliteInherente: [{ value: 5, disabled: true }, [Validators.required, Validators.min(1), Validators.max(5)]],
      protection:           ['', [Validators.required, Validators.min(0), Validators.max(3)]],
      prevention:           ['', [Validators.required, Validators.min(0), Validators.max(3)]],
      controleExistants:    ['', [Validators.required]],
      controleInexistants:  ['', [Validators.required]],
      dejaSurvenu:          [false],
      dateDebut:            ['', [Validators.required]],
      dateFin:              ['', [Validators.required]],
      recommandation:       ['', [Validators.maxLength(1000)]],
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

      forkJoin({
        risques:    this.risqueService.getAll(),
        agents:     this.agentService.getAll(),
        evaluation: this.evaluationService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.risques = data.risques;
          this.agents  = data.agents;
          this.loading = false;
          this.cdr.detectChanges();

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

    this.form.get('codeRisque')?.valueChanges.subscribe(codeRisque => {
      if (codeRisque) {
        this.loadBonnesPratiquesRisque(codeRisque);
      } else {
        this.bonnesPratiquesRisque = [];
        this.selectedBonnesPratiques.clear();
      }
    });
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

  loadBonnesPratiquesRisque(codeRisque: string): void {
    const risque = this.risques.find(r => r.code === codeRisque);
    if (risque && risque.bonnesPratiques) {
      this.bonnesPratiquesRisque = risque.bonnesPratiques;
      this.selectedBonnesPratiques.clear();
    } else {
      this.bonnesPratiquesRisque = [];
      this.selectedBonnesPratiques.clear();
    }
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

    this.showRecapitulatif();
  }

  showRecapitulatif(): void {
    const raw    = this.form.getRawValue();
    const risque = this.risques.find(r => r.code === raw.codeRisque);
    const agent  = this.agents.find(a => a.matricule === raw.matriculeAgent);

    const sections = [
      {
        title: 'Identification',
        rows: [
          { label: 'Risque évalué',       value: risque ? `${risque.code} — ${risque.libelle}` : raw.codeRisque },
          { label: 'Évaluateur',          value: agent  ? `${agent.matricule} — ${agent.nom} ${agent.prenoms}` : 'Non renseigné' },
          { label: 'Risque déjà survenu', value: raw.dejaSurvenu ? 'Oui' : 'Non' },
        ]
      },
      {
        title: 'Période d\'évaluation',
        rows: [
          { label: 'Date de début', value: raw.dateDebut || 'Non renseignée' },
          { label: 'Date de fin',   value: raw.dateFin   || 'Non renseignée' },
        ]
      },
      {
        title: 'Scores de risque',
        rows: [
          { label: 'Impact inhérent',       value: `${raw.impactInherent} / 5 <span style="color:#94a3b8;font-size:12px;">(calculé automatiquement)</span>` },
          { label: 'Probabilité inhérente', value: `${raw.probabiliteInherente} / 5 <span style="color:#94a3b8;font-size:12px;">(calculée automatiquement)</span>` },
          { label: 'Niveau de protection',  value: `${raw.protection} / 3` },
          { label: 'Niveau de prévention',  value: `${raw.prevention} / 3` },
        ]
      },
      {
        title: 'Contrôles',
        rows: [
          { label: 'Contrôles en place',  value: raw.controleExistants   || '<span style="color:#94a3b8;">Non renseignés</span>' },
          { label: 'Contrôles manquants', value: raw.controleInexistants || '<span style="color:#94a3b8;">Non renseignés</span>' },
        ]
      },
      {
        title: 'Recommandation',
        rows: [
          { label: 'Recommandation', value: raw.recommandation || '<span style="color:#94a3b8;">Aucune</span>' },
        ]
      }
    ];

    const sectionsHTML = sections.map(section => `
      <div style="margin-bottom: 24px;">
        <div style="
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #64748b;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 4px;
        ">${section.title}</div>
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
          <colgroup>
            <col style="width: 38%;">
            <col style="width: 62%;">
          </colgroup>
          <thead>
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <th style="
                padding: 8px 12px 8px 0;
                font-size: 13px;
                font-weight: 600;
                color: #334155;
                text-align: left;
              ">Paramètre</th>
              <th style="
                padding: 8px 0 8px 12px;
                font-size: 13px;
                font-weight: 600;
                color: #334155;
                text-align: left;
              ">Détail</th>
            </tr>
          </thead>
          <tbody>
            ${section.rows.map((row, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="
                  padding: 11px 12px 11px 0;
                  font-size: 14px;
                  font-weight: 500;
                  color: #475569;
                  vertical-align: top;
                  border-bottom: 1px solid #f1f5f9;
                ">${row.label}</td>
                <td style="
                  padding: 11px 0 11px 12px;
                  font-size: 14px;
                  color: #0f172a;
                  vertical-align: top;
                  word-break: break-word;
                  white-space: pre-wrap;
                  border-bottom: 1px solid #f1f5f9;
                ">${row.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    const recapitulatifHTML = `
      <div style="
        text-align: left;
        max-height: 65vh;
        overflow-y: auto;
        padding: 4px 10px 4px 4px;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
      ">
        ${sectionsHTML}
      </div>
    `;

    Swal.fire({
      title: 'Récapitulatif de l\'évaluation',
      html: recapitulatifHTML,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '✔ Confirmer',
      cancelButtonText:  '← Modifier',
      confirmButtonColor: '#1e40af',
      cancelButtonColor:  '#64748b',
      width: '780px',
      padding: '2rem'
    }).then(result => {
      if (result.isConfirmed) {
        this.submitEvaluation();
      }
    });
  }

  submitEvaluation(): void {
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

  get dateFinError(): boolean {
    return !!(
      this.form.errors?.['dateFinInvalide'] &&
      this.form.get('dateDebut')?.touched &&
      this.form.get('dateFin')?.touched
    );
  }

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

  toggleBonnesPratiqueSelection(pratique: string): void {
    if (this.selectedBonnesPratiques.has(pratique)) {
      this.selectedBonnesPratiques.delete(pratique);
    } else {
      this.selectedBonnesPratiques.add(pratique);
    }
  }

  isBonnesPratiqueSelected(pratique: string): boolean {
    return this.selectedBonnesPratiques.has(pratique);
  }

  addBonnesPratiquesToExistants(): void {
    const current            = this.form.get('controleExistants')?.value || '';
    const nouvellesPratiques = Array.from(this.selectedBonnesPratiques).join('\n');
    this.form.patchValue({
      controleExistants: current ? `${current}\n${nouvellesPratiques}` : nouvellesPratiques
    });
    this.bonnesPratiquesRisque = this.bonnesPratiquesRisque.filter(
      p => !this.selectedBonnesPratiques.has(p)
    );
    this.selectedBonnesPratiques.clear();
  }

  addBonnesPratiquesToInexistants(): void {
    const current            = this.form.get('controleInexistants')?.value || '';
    const nouvellesPratiques = Array.from(this.selectedBonnesPratiques).join('\n');
    this.form.patchValue({
      controleInexistants: current ? `${current}\n${nouvellesPratiques}` : nouvellesPratiques
    });
    this.bonnesPratiquesRisque = this.bonnesPratiquesRisque.filter(
      p => !this.selectedBonnesPratiques.has(p)
    );
    this.selectedBonnesPratiques.clear();
  }
}