import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { AgentService } from '../../../../core/services/agent.service';
import { EvaluationRequest, EvaluationResponse } from '../../../../core/models/evaluation.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';
import { evaluationBaseSchema, evaluationSchema } from './evaluations-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-evaluations-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent, FormStepperComponent],
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
  bonnesPratiquesRisque: string[] = [];
  selectedBonnesPratiques: Set<string> = new Set();

  /** Risque actuellement sélectionné (pour les calculs automatiques) */
  private currentRisque: RisqueResponse | null = null;

  steps: FormStepDef[] = [
    { label: 'Informations générales' },
    { label: 'Période' },
    { label: 'Risque inhérent' },
    { label: 'Bonnes pratiques' },
    { label: 'Maturité' },
    { label: 'Recommandation' }
  ];
  currentStep = 0;
  maxReachedStep = 0;

  private stepFields: string[][] = [
    ['codeRisque'],
    ['dateDebut', 'dateFin'],
    [],
    ['controleExistants', 'controleInexistants'],
    [],
    ['recommandation']
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
    applyZodValidation(this.form, evaluationSchema, this.form.getRawValue());
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
      impactInherent: [{ value: 5, disabled: true }],
      probabiliteInherente: [{ value: 5, disabled: true }],
      protection: [{ value: 0, disabled: true }],
      prevention: [{ value: 0, disabled: true }],
      controleExistants: [''],
      controleInexistants: [''],
      dejaSurvenu: [false],
      dateDebut: [''],
      dateFin: [''],
      recommandation: [''],
      codeRisque: [''],
      matriculeAgent: ['']
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, evaluationSchema, this.form.getRawValue())
    );
  }

  isRequired(field: string): boolean {
    return isRequired(evaluationBaseSchema, field);
  }

  get risqueOptions(): SearchableSelectOption[] {
    return this.risques.map(r => ({ value: r.code, label: `${r.code} - ${r.libelle}` }));
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
        risques: this.risqueService.getAll(),
        agents: this.agentService.getAll(),
        evaluation: this.evaluationService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.risques = data.risques;
          this.agents = data.agents;
          this.loading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.patchForm(data.evaluation);
            this.cdr.detectChanges();
          }, 0);
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

    this.form.get('codeRisque')?.valueChanges.subscribe(codeRisque => {
      if (codeRisque) {
        this.loadBonnesPratiquesRisque(codeRisque);
      } else {
        this.bonnesPratiquesRisque = [];
        this.selectedBonnesPratiques.clear();
        this.currentRisque = null;
        this.form.patchValue({ protection: 0, prevention: 0 }, { emitEvent: false });
      }
    });

    // Recalculer automatiquement prévention/protection quand les bonnes pratiques existants changent
    this.form.get('controleExistants')?.valueChanges.subscribe(() => {
      this.calculateScoresFromExistants();
    });

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

  loadBonnesPratiquesRisque(codeRisque: string): void {
    const risque = this.risques.find(r => r.code === codeRisque);
    if (risque && risque.bonnesPratiques) {
      this.bonnesPratiquesRisque = risque.bonnesPratiques;
      this.selectedBonnesPratiques.clear();
      this.currentRisque = risque;
    } else {
      this.bonnesPratiquesRisque = [];
      this.selectedBonnesPratiques.clear();
      this.currentRisque = null;
    }
    // Recalculer après chargement du risque
    this.calculateScoresFromExistants();
  }

  // ========== Helpers pour les bonnes pratiques typées ==========

  cleanPratiqueText(pratique: string): string {
    return pratique.replace(/^\[(Prévention|Protection)\]\s*/, '');
  }

  isPrevention(pratique: string): boolean {
    return pratique.startsWith('[Prévention]');
  }

  isProtection(pratique: string): boolean {
    return pratique.startsWith('[Protection]');
  }

  /**
   * Calcule automatiquement les scores de prévention et protection.
   * Formule prévention : (nbre pratiques de prévention du risque présentes dans controleExistants * 3) / nbre total de prévention du risque
   * Formule protection : (nbre pratiques de protection du risque présentes dans controleExistants * 3) / nbre total de protection du risque
   */
  calculateScoresFromExistants(): void {
    if (!this.currentRisque || !this.currentRisque.bonnesPratiques) {
      return;
    }

    const existantsText = (this.form.get('controleExistants')?.value || '') as string;
    const allPratiques = this.currentRisque.bonnesPratiques;

    // Séparer les pratiques du risque par type
    const pratiquesPreventionRisque = allPratiques.filter(p => this.isPrevention(p));
    const pratiquesProtectionRisque = allPratiques.filter(p => this.isProtection(p));

    // Compter combien de pratiques de prévention sont présentes dans controleExistants
    const nbPreventionPresentes = pratiquesPreventionRisque.filter(p => {
      const cleaned = this.cleanPratiqueText(p);
      return existantsText.toLowerCase().includes(cleaned.toLowerCase());
    }).length;

    // Compter combien de pratiques de protection sont présentes dans controleExistants
    const nbProtectionPresentes = pratiquesProtectionRisque.filter(p => {
      const cleaned = this.cleanPratiqueText(p);
      return existantsText.toLowerCase().includes(cleaned.toLowerCase());
    }).length;

    // Calculer les scores : (nbre_present * 3 / nbre_total), arrondi, plafonné à 3
    let prevention = 0;
    if (pratiquesPreventionRisque.length > 0) {
      prevention = Math.min(3, Math.round((nbPreventionPresentes * 3) / pratiquesPreventionRisque.length));
    }

    let protection = 0;
    if (pratiquesProtectionRisque.length > 0) {
      protection = Math.min(3, Math.round((nbProtectionPresentes * 3) / pratiquesProtectionRisque.length));
    }

    // Mettre à jour les champs du formulaire sans émettre d'évènements pour éviter les boucles
    this.form.patchValue({ prevention, protection }, { emitEvent: false });
    this.cdr.detectChanges();
  }

  patchForm(evaluation: EvaluationResponse): void {
    this.form.patchValue({
      code: evaluation.code,
      impactInherent: evaluation.impactInherent,
      probabiliteInherente: evaluation.probabiliteInherente,
      protection: evaluation.protection,
      prevention: evaluation.prevention,
      controleExistants: evaluation.controleExistants,
      controleInexistants: evaluation.controleInexistants,
      dejaSurvenu: evaluation.dejaSurvenu,
      dateDebut: this.formatDateForInput(evaluation.dateDebut),
      dateFin: this.formatDateForInput(evaluation.dateFin),
      recommandation: evaluation.recommandation,
      codeRisque: evaluation.codeRisque,
      matriculeAgent: evaluation.matriculeAgent ?? ''
    });
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
    const valid = applyZodValidation(this.form, evaluationSchema, this.form.getRawValue());
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

    this.showRecapitulatif();
  }

  showRecapitulatif(): void {
    const raw = this.form.getRawValue();
    const risque = this.risques.find(r => r.code === raw.codeRisque);
    const agent = this.agents.find(a => a.matricule === raw.matriculeAgent);

    const sections = [
      {
        title: 'Identification',
        rows: [
          { label: 'Risque évalué', value: risque ? `${risque.code} — ${risque.libelle}` : raw.codeRisque },
          { label: 'Évaluateur', value: agent ? `${agent.matricule} — ${agent.nom} ${agent.prenoms}` : 'Non renseigné' },
          { label: 'Risque déjà survenu', value: raw.dejaSurvenu ? 'Oui' : 'Non' },
        ]
      },
      {
        title: 'Période d\'évaluation',
        rows: [
          { label: 'Date de début', value: raw.dateDebut || 'Non renseignée' },
          { label: 'Date de fin', value: raw.dateFin || 'Non renseignée' },
        ]
      },
      {
        title: 'Scores de risque',
        rows: [
          { label: 'Impact inhérent', value: `${raw.impactInherent} / 5 <span style="color:#94a3b8;font-size:12px;">(calculé automatiquement)</span>` },
          { label: 'Probabilité inhérente', value: `${raw.probabiliteInherente} / 5 <span style="color:#94a3b8;font-size:12px;">(calculée automatiquement)</span>` },
          { label: 'Niveau de protection', value: `${raw.protection} / 3` },
          { label: 'Niveau de prévention', value: `${raw.prevention} / 3` },
        ]
      },
      {
        title: 'Contrôles',
        rows: [
          { label: 'Contrôles en place', value: raw.controleExistants || '<span style="color:#94a3b8;">Non renseignés</span>' },
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
      cancelButtonText: '← Modifier',
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#64748b',
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
    this.error = null;

    const raw = this.form.getRawValue();
    const request: EvaluationRequest = {
      impactInherent: raw.impactInherent,
      probabiliteInherente: raw.probabiliteInherente,
      protection: raw.protection,
      prevention: raw.prevention,
      controleExistants: raw.controleExistants || undefined,
      controleInexistants: raw.controleInexistants || undefined,
      dejaSurvenu: raw.dejaSurvenu || false,
      dateDebut: raw.dateDebut || undefined,
      dateFin: raw.dateFin || undefined,
      recommandation: raw.recommandation || undefined,
      codeRisque: raw.codeRisque,
      matriculeAgent: raw.matriculeAgent || undefined
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
        this.error = err?.message || `Impossible de ${this.isEditMode ? 'modifier' : 'créer'} l'évaluation`;
        Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/evaluations']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
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
    const current = this.form.get('controleExistants')?.value || '';
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
    const current = this.form.get('controleInexistants')?.value || '';
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