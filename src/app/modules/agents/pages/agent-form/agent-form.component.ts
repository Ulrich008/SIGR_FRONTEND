import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { FormStepperComponent, FormStepDef } from '../../../../shared/form-stepper/form-stepper.component';
import { AgentService } from '../../../../core/services/agent.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProfilService } from '../../../../core/services/profil.service';             // ← nouveau
import { MinistereService } from '../../../../core/services/ministere.service';       // ← nouveau pour multi-ministères
import { AgentRequest, AgentResponse, Sexe, Role } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProfilResponse } from '../../../../core/models/profil.model';                // ← nouveau
import { MinistereResponse } from '../../../../core/models/ministere.model';           // ← nouveau pour multi-ministères
import { agentBaseSchema, agentSchema } from './agent-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-agent-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent, FormStepperComponent],
  templateUrl: './agent-form.component.html'
})
export class AgentFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  matricule?: string;
  loading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  menuItems: MenuItem[];
  private subscriptions: Subscription = new Subscription();

  allUnites: UniteAdministrativeResponse[] = [];  // Toutes les unités chargées
  unites: UniteAdministrativeResponse[] = [];     // Unités filtrées par ministère
  loadingUnites = false;

  profils: ProfilResponse[] = [];          // ← nouveau
  loadingProfils = false;                  // ← nouveau

  ministeres: MinistereResponse[] = [];    // ← nouveau pour multi-ministères
  loadingMinisteres = false;              // ← nouveau pour multi-ministères

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private uniteService: UniteAdministrativeService,
    private profilService: ProfilService,  // ← nouveau
    private ministereService: MinistereService,  // ← nouveau pour multi-ministères
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.menuItems = this.menuService.items;
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      matricule:        [{ value: '', disabled: true }],
      password:         [''],
      confirmPassword:  [''],
      npi:              [''],
      email:            [''],
      nom:              [''],
      prenoms:          [''],
      sexe:             ['MASCULIN' as Sexe],
      role:             ['AGENT'    as Role],
      codeProfil:       [''],
      dateNaissance:    [''],
      datePriseService: [''],
      codeMinistere:    [''],
      codeUnite:        ['']
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, agentSchema(this.isEditMode), this.form.getRawValue())
    );

    // Le profil métier n'a de sens que pour un AGENT : un ADMIN/SUPER_ADMIN
    // n'en a pas besoin, son accès vient de son rôle (le caractère
    // obligatoire pour AGENT est porté par le schéma Zod, ceci ne gère que
    // l'effet de bord métier : proposer de retirer un profil devenu sans objet).
    this.form.get('role')?.valueChanges.subscribe((role: Role) => {
      const codeProfilControl = this.form.get('codeProfil');

      if (role === 'AGENT') {
        return;
      }

      const profilActuel = codeProfilControl?.value;
      if (!profilActuel) {
        return;
      }

      // L'agent avait un profil métier avant ce changement de rôle :
      // on demande explicitement s'il faut le retirer plutôt que de
      // le vider silencieusement (ou le laisser traîner en base).
      const libelleProfil = this.profils.find(p => p.code === profilActuel)?.libelle || profilActuel;
      Swal.fire({
        title: 'Retirer le profil métier ?',
        text: `Cet agent avait le profil "${libelleProfil}". Un rôle ${role} n'utilise pas de profil métier : voulez-vous le retirer ou le conserver (sans effet) ?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Retirer le profil',
        cancelButtonText: 'Conserver le profil',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          codeProfilControl?.setValue('');
        }
      });
    });

    // Seul un AGENT (profil métier CMMR, Pilote, CCI...) travaille dans
    // une unité administrative précise. Un ADMIN gère l'ensemble de son
    // ministère (et créera lui-même les UA de son ministère après coup),
    // un SUPER_ADMIN a un accès global : ni l'un ni l'autre ne doit être
    // rattaché de force à une UA dès sa création — sous peine de forcer
    // un choix incohérent quand le ministère n'a encore aucune UA.
    this.form.get('role')?.valueChanges.subscribe((role: Role) => {
      if (role !== 'AGENT') {
        this.form.get('codeUnite')?.setValue('');
      }
    });
  }

  steps: FormStepDef[] = [
    { label: 'Informations personnelles' },
    { label: 'Affectation' },
    { label: 'Identification & Accès' }
  ];
  currentStep = 0;
  maxReachedStep = 0;

  private stepFields: string[][] = [
    ['nom', 'prenoms', 'sexe', 'role', 'dateNaissance', 'datePriseService'],
    ['codeMinistere', 'codeUnite', 'codeProfil'],
    ['npi', 'email', 'password', 'confirmPassword']
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
    applyZodValidation(this.form, agentSchema(this.isEditMode), this.form.getRawValue());
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

  get profilRequis(): boolean {
    return this.form.get('role')?.value === 'AGENT';
  }

  get uniteRequise(): boolean {
    return this.form.get('role')?.value === 'AGENT';
  }

  get passwordRequis(): boolean {
    return !this.isEditMode;
  }

  isRequired(field: string): boolean {
    return isRequired(agentBaseSchema, field);
  }

  get ministereOptions(): SearchableSelectOption[] {
    return this.ministeres.map(m => ({ value: m.code, label: `${m.code} — ${m.nom}` }));
  }

  get uniteOptions(): SearchableSelectOption[] {
    return this.unites.map(u => ({ value: u.code, label: `${u.code} — ${u.libelle}` }));
  }

  get profilOptions(): SearchableSelectOption[] {
    return this.profils.map(p => ({ value: p.code, label: `${p.code} — ${p.libelle}` }));
  }

  // ================= LIFECYCLE =================

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadMinisteres();  // ← nouveau pour multi-ministères
    this.loadUnites();
    this.loadProfils();   // ← nouveau

    // Écouter les changements du ministère pour filtrer les unités
    this.form.get('codeMinistere')?.valueChanges.subscribe(codeMinistere => {
      this.filterUnitesByMinistere(codeMinistere);
    });

    const matriculeParam = this.route.snapshot.paramMap.get('matricule');
    if (matriculeParam) {
      this.isEditMode = true;
      this.matricule  = matriculeParam;
      this.loadAgent(matriculeParam);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ================= CHARGEMENTS =================

  loadUnites(): void {
    this.loadingUnites = true;
    this.uniteService.getAll().subscribe({
      next:  (u) => {
        this.allUnites = u;  // Stocker toutes les unités
        this.unites = u;     // Initialiser avec toutes les unités
        this.loadingUnites = false;
      },
      error: (e) => { console.error('Erreur unités', e); this.loadingUnites = false; }
    });
  }

  loadProfils(): void {
    this.loadingProfils = true;
    this.profilService.getAll().subscribe({
      next:  (p) => { this.profils = p; this.loadingProfils = false; },
      error: (e) => { console.error('Erreur profils', e); this.loadingProfils = false; }
    });
  }

  loadMinisteres(): void {
    this.loadingMinisteres = true;
    this.ministereService.getAll().subscribe({
      next:  (m) => {
        // Un ADMIN (non SUPER_ADMIN) ne gère que son propre ministère :
        // on ne lui propose pas les autres dans la liste déroulante.
        const currentUser = this.authService.getCurrentUser();
        if (this.isSuperAdmin || !currentUser?.codeMinistere) {
          this.ministeres = m;
        } else {
          this.ministeres = m.filter(ministere => ministere.code === currentUser.codeMinistere);
          this.form.patchValue({ codeMinistere: currentUser.codeMinistere });
          this.form.get('codeMinistere')?.disable();
        }
        this.loadingMinisteres = false;
      },
      error: (e) => { console.error('Erreur ministères', e); this.loadingMinisteres = false; }
    });
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }

  filterUnitesByMinistere(codeMinistere: string): void {
    if (!codeMinistere) {
      // Si aucun ministère n'est sélectionné, afficher toutes les unités
      this.unites = [...this.allUnites];
    } else {
      // Filtrer les unités par ministère à partir de toutes les unités
      this.unites = this.allUnites.filter(unite => unite.codeMinistere === codeMinistere);
    }
    // Réinitialiser le champ unité si l'unité sélectionnée n'appartient pas au ministère
    const currentUnite = this.form.get('codeUnite')?.value;
    if (currentUnite) {
      const selectedUnite = this.unites.find(u => u.code === currentUnite);
      if (!selectedUnite) {
        this.form.get('codeUnite')?.setValue('');
      }
    }
  }

  loadAgent(matricule: string): void {
    this.loading = true;
    this.error   = null;
    const sub = this.agentService.getByMatricule(matricule).subscribe({
      next: (agent: AgentResponse) => {
        this.form.patchValue({
          matricule:        agent.matricule        ?? '',
          password:         '',
          confirmPassword:  '',
          npi:              agent.npi              ?? '',
          email:            agent.email             ?? '',
          nom:              agent.nom              ?? '',
          prenoms:          agent.prenoms          ?? '',
          sexe:             agent.sexe             ?? 'MASCULIN',
          role:             agent.role             ?? 'AGENT',
          codeProfil:       agent.codeProfil       ?? '',   // ← nouveau
          dateNaissance:    this.formatDateForInput(agent.dateNaissance),
          datePriseService: this.formatDateForInput(agent.datePriseService),
          codeMinistere:    agent.codeMinistere    ?? '',  // ← nouveau pour multi-ministères
          codeUnite:        agent.codeUnite        ?? ''
        });

        // Mot de passe optionnel en édition
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.form.get('confirmPassword')?.clearValidators();
        this.form.get('confirmPassword')?.updateValueAndValidity();

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error   = err?.error?.message || err?.message || "Impossible de charger l'agent";
      }
    });
    this.subscriptions.add(sub);
  }

  // ================= SOUMISSION =================

  private firstInvalidStep(): number {
    return this.stepFields.findIndex(fields =>
      fields.some(field => {
        const control = this.form.get(field);
        return control && !control.disabled && control.invalid;
      })
    );
  }

  onSubmit(): void {
    const valid = applyZodValidation(this.form, agentSchema(this.isEditMode), this.form.getRawValue());
    if (!valid) {
      this.form.markAllAsTouched();
      const invalidStep = this.firstInvalidStep();
      if (invalidStep !== -1) {
        this.currentStep = invalidStep;
        if (this.currentStep > this.maxReachedStep) {
          this.maxReachedStep = this.currentStep;
        }
      }
      this.scrollToFirstError();
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Enregistrer les modifications ?' : 'Créer cet agent ?',
      text: this.isEditMode ? 'Voulez-vous enregistrer les modifications de cet agent ?' : 'Voulez-vous créer cet agent ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.isEditMode ? 'Oui, enregistrer' : 'Oui, créer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.saveAgent();
      }
    });
  }

  private saveAgent(): void {
    this.loading = true;
    this.error   = null;

    const rawValue = { ...this.form.getRawValue() };
    delete rawValue.confirmPassword;
    delete rawValue.matricule;

    if (this.isEditMode && !rawValue.password) {
      delete rawValue.password;
    }

    const request: AgentRequest = rawValue;

    if (this.isEditMode && this.matricule) {
      const sub = this.agentService.update(this.matricule, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({ title: 'Modifié', text: "L'agent a bien été modifié.", icon: 'success', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/agents']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || err?.message || "Impossible de modifier l'agent";
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        }
      });
      this.subscriptions.add(sub);
    } else {
      const sub = this.agentService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({ title: 'Créé', text: "L'agent a bien été créé.", icon: 'success', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/agents']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || err?.message || "Impossible de créer l'agent";
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        }
      });
      this.subscriptions.add(sub);
    }
  }

  // ================= HELPERS =================

  cancel(): void {
    if (this.form.dirty) {
      Swal.fire({
        title: 'Quitter sans sauvegarder ?',
        text:  'Vous avez des modifications non enregistrées.',
        icon: 'warning',
        showCancelButton:   true,
        confirmButtonText:  'Oui, quitter',
        cancelButtonText:   'Annuler'
      }).then(r => { if (r.isConfirmed) this.router.navigate(['/agents']); });
    } else {
      this.router.navigate(['/agents']);
    }
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }

  togglePasswordVisibility():        void { this.showPassword        = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const el = document.querySelector('.border-red-500, .text-red-600');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ================= ACCESSEURS =================

  get matriculeControl()        { return this.form.get('matricule'); }
  get passwordControl()         { return this.form.get('password'); }
  get nomControl()              { return this.form.get('nom'); }
  get emailControl()            { return this.form.get('email'); }
  get npiControl()              { return this.form.get('npi'); }
  get prenomsControl()          { return this.form.get('prenoms'); }
  get codeMinistereControl()    { return this.form.get('codeMinistere'); }  // ← nouveau pour multi-ministères
  get codeUniteControl()        { return this.form.get('codeUnite'); }
  get codeProfilControl()       { return this.form.get('codeProfil'); }   // ← nouveau
  get dateNaissanceControl()    { return this.form.get('dateNaissance'); }
  get datePriseServiceControl() { return this.form.get('datePriseService'); }
  get confirmPasswordControl()  { return this.form.get('confirmPassword'); }
}