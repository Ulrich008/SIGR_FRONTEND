import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ActionService } from '../../../../core/services/action.service';
import { PlanMitigationService } from '../../../../core/services/plan-mitigation.service';
import { AgentService } from '../../../../core/services/agent.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { ActionRequest, ActionResponse, StatutAction } from '../../../../core/models/action.model';
import { PlanMitigationResponse } from '../../../../core/models/plan-mitigation.model';
import { AgentResponse } from '../../../../core/models/agent.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { EvaluationResponse } from '../../../../core/models/evaluation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-actions-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './actions-form.component.html'
})
export class ActionsFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  
  plans: PlanMitigationResponse[] = [];
  agents: AgentResponse[] = [];
  loadingPlans = false;
  loadingAgents = false;
  statutOptions = Object.values(StatutAction);

  risqueSelected: RisqueResponse | null = null;
  bonnesPratiques: string[] = [];
  loadingBonnesPratiques = false;

  libelles: string[] = [];
  nouveauLibelle: string = '';
  errorLibelle: string | null = null;

  constructor(
    private fb: FormBuilder,
    private actionService: ActionService,
    private planMitigationService: PlanMitigationService,
    private agentService: AgentService,
    private risqueService: RisqueService,
    private evaluationService: EvaluationService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      statut: ['', [Validators.required]],
      codePlan: ['', [Validators.required]],
      codeRisque: ['', [Validators.required]],
      bonnePratique: ['', [Validators.required]],
      matriculeResponsable: ['', [Validators.required]]
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
        plans: this.planMitigationService.getAll(),
        agents: this.agentService.getAll(),
        action: this.actionService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.plans = data.plans;
          this.agents = data.agents;
          this.patchForm(data.action);
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
      plans: this.planMitigationService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.plans = data.plans;
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

  patchForm(action: ActionResponse): void {
    // Charger les libellés existants
    if (action.libelles && action.libelles.length > 0) {
      this.libelles = action.libelles;
    } else {
      this.libelles = [];
    }
    
    this.form.patchValue({
      dateDebut: this.formatDateForInput(action.dateDebut),
      dateFin: this.formatDateForInput(action.dateFin),
      statut: action.statut,
      codePlan: action.codePlan,
      codeRisque: action.codeRisque,
      bonnePratique: action.bonnePratique,
      matriculeResponsable: action.matriculeResponsable
    });

    // Charger le risque associé au plan
    if (action.codePlan) {
      this.loadRisqueFromPlan(action.codePlan);
    }
  }

  onPlanChange(): void {
    const codePlan = this.form.get('codePlan')?.value;
    if (codePlan) {
      this.loadRisqueFromPlan(codePlan);
    } else {
      this.risqueSelected = null;
      this.bonnesPratiques = [];
      this.form.patchValue({ codeRisque: '', bonnePratique: '' });
      this.cdr.detectChanges();
    }
  }

  loadRisqueFromPlan(codePlan: string): void {
    const plan = this.plans.find(p => p.code === codePlan);
    if (plan && plan.codeRisque) {
      this.risqueService.getByCode(plan.codeRisque).subscribe({
        next: (risque) => {
          this.risqueSelected = risque;
          this.form.patchValue({ codeRisque: risque.code });
          this.loadBonnesPratiques(risque);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message || 'Impossible de charger le risque associé au plan';
          this.risqueSelected = null;
          this.bonnesPratiques = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  onRisqueChange(): void {
    const codeRisque = this.form.get('codeRisque')?.value;
    if (codeRisque && this.risqueSelected) {
      this.loadBonnesPratiques(this.risqueSelected);
    } else {
      this.bonnesPratiques = [];
      this.form.patchValue({ bonnePratique: '' });
      this.cdr.detectChanges();
    }
  }

  loadBonnesPratiques(risque: RisqueResponse): void {
    this.loadingBonnesPratiques = true;
    
    // Récupérer toutes les évaluations pour trouver celles du risque
    this.evaluationService.getAll().subscribe({
      next: (evaluations: EvaluationResponse[]) => {
        // Filtrer par idRisque au lieu de codeRisque
        const risqueEvaluations = evaluations.filter(e => e.idRisque === risque.id);
        
        if (risqueEvaluations && risqueEvaluations.length > 0) {
          // Prendre la dernière évaluation
          const lastEvaluation = risqueEvaluations[risqueEvaluations.length - 1];
          
          // Extraire les bonnes pratiques inexistants
          const controleInexistants = lastEvaluation.controleInexistants;
          
          if (controleInexistants && controleInexistants.trim() !== '') {
            // Diviser par lignes pour obtenir un tableau
            this.bonnesPratiques = controleInexistants.split('\n').filter((bp: string) => bp.trim() !== '');
          } else {
            // Si controleInexistants est null ou vide, afficher un message
            this.bonnesPratiques = ['Aucune bonne pratique inexistante définie dans l\'évaluation'];
          }
        } else {
          // Si pas d'évaluation
          this.bonnesPratiques = ['Aucune évaluation trouvée pour ce risque'];
        }
        this.loadingBonnesPratiques = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        // En cas d'erreur
        this.bonnesPratiques = ['Erreur lors du chargement des évaluations'];
        this.loadingBonnesPratiques = false;
        this.cdr.detectChanges();
      }
    });
  }

  ajouterLibelle(): void {
    const trimmed = this.nouveauLibelle.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length > 500) {
      this.errorLibelle = 'Un libellé ne peut pas dépasser 500 caractères';
      return;
    }

    // Vérifier les doublons
    if (this.libelles.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      this.errorLibelle = 'Ce libellé existe déjà';
      return;
    }

    this.libelles.push(trimmed);
    this.nouveauLibelle = '';
    this.errorLibelle = null;
    this.error = null;
    this.cdr.detectChanges();
  }

  supprimerLibelle(index: number): void {
    this.libelles.splice(index, 1);
    // Réafficher l'erreur si la liste devient vide
    if (this.libelles.length === 0) {
      this.errorLibelle = 'Au moins un libellé est requis';
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.form.invalid || this.libelles.length === 0) {
      this.form.markAllAsTouched();
      if (this.libelles.length === 0) {
        this.errorLibelle = 'Au moins un libellé est requis';
      }
      return;
    }

    this.errorLibelle = '';

    const dateDebut = this.form.get('dateDebut')?.value;
    const dateFin = this.form.get('dateFin')?.value;

    if (new Date(dateFin) < new Date(dateDebut)) {
      Swal.fire({
        title: 'Erreur',
        text: 'La date de fin doit être supérieure à la date de début',
        icon: 'error'
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: ActionRequest = {
      libelles: this.libelles,
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      statut: raw.statut,
      codePlan: raw.codePlan,
      codeRisque: raw.codeRisque,
      bonnePratique: raw.bonnePratique,
      matriculeResponsable: raw.matriculeResponsable
    };

    if (this.isEditMode && this.code) {
      this.actionService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'action a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/actions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'action';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.actionService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'action a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/actions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'action';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/actions']);
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
