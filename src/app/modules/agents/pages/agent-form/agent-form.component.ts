import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AgentService } from '../../../../core/services/agent.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProfilService } from '../../../../core/services/profil.service';             // ← nouveau
import { AgentRequest, AgentResponse, Sexe, Role } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProfilResponse } from '../../../../core/models/profil.model';                // ← nouveau

@Component({
  standalone: true,
  selector: 'app-agent-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
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

  unites: UniteAdministrativeResponse[] = [];
  loadingUnites = false;

  profils: ProfilResponse[] = [];          // ← nouveau
  loadingProfils = false;                  // ← nouveau

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private uniteService: UniteAdministrativeService,
    private profilService: ProfilService,  // ← nouveau
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
      password:         ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword:  ['', [Validators.required, this.passwordMatchValidator()]],
      npi:              ['', [Validators.maxLength(20), this.noSpacesValidator()]],
      nom:              ['', [Validators.required, Validators.maxLength(50),  this.noSpecialCharsValidator()]],
      prenoms:          ['', [Validators.required, Validators.maxLength(100), this.noSpecialCharsValidator()]],
      sexe:             ['MASCULIN' as Sexe, Validators.required],
      role:             ['AGENT'    as Role,  Validators.required],
      codeProfil:       ['', Validators.required],   // ← nouveau champ
      dateNaissance:    ['', Validators.required],
      datePriseService: ['', Validators.required],
      codeUnite:        ['', Validators.required]
    });
  }

  // ================= VALIDATORS =================

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const password = control.parent.get('password')?.value;
      return password === control.value ? null : { passwordMismatch: true };
    };
  }

  noSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value && /\s/.test(value) ? { hasSpaces: true } : null;
    };
  }

  noSpecialCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const validPattern = /^[a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s\-']+$/;
      return !validPattern.test(value) ? { hasSpecialChars: true } : null;
    };
  }

  // ================= LIFECYCLE =================

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadUnites();
    this.loadProfils();   // ← nouveau

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
      next:  (u) => { this.unites = u; this.loadingUnites = false; },
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
          nom:              agent.nom              ?? '',
          prenoms:          agent.prenoms          ?? '',
          sexe:             agent.sexe             ?? 'MASCULIN',
          role:             agent.role             ?? 'AGENT',
          codeProfil:       agent.codeProfil       ?? '',   // ← nouveau
          dateNaissance:    this.formatDateForInput(agent.dateNaissance),
          datePriseService: this.formatDateForInput(agent.datePriseService),
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFirstError();
      return;
    }

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
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const e = field.errors;
    if (e['required'])        return 'Ce champ est requis';
    if (e['minlength'])       return `Minimum ${e['minlength'].requiredLength} caractères`;
    if (e['maxlength'])       return `Maximum ${e['maxlength'].requiredLength} caractères`;
    if (e['passwordMismatch'])return 'Les mots de passe ne correspondent pas';
    if (e['hasSpaces'])       return 'Les espaces ne sont pas autorisés';
    if (e['hasSpecialChars']) return 'Caractères spéciaux non autorisés';
    return 'Champ invalide';
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
  get prenomsControl()          { return this.form.get('prenoms'); }
  get codeUniteControl()        { return this.form.get('codeUnite'); }
  get codeProfilControl()       { return this.form.get('codeProfil'); }   // ← nouveau
  get dateNaissanceControl()    { return this.form.get('dateNaissance'); }
  get datePriseServiceControl() { return this.form.get('datePriseService'); }
  get confirmPasswordControl()  { return this.form.get('confirmPassword'); }
}