import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service';
import { AgentService } from '../../core/services/agent.service';
import { AgentResponse } from '../../core/models/agent.model';
import { AuthService } from '../../core/services/auth.service';

function motsDePasseIdentiquesValidator(group: AbstractControl): ValidationErrors | null {
  const nouveau = group.get('nouveauMotDePasse')?.value;
  const confirmation = group.get('confirmation')?.value;
  return nouveau && confirmation && nouveau !== confirmation ? { motsDePasseDifferents: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-me',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './me.component.html'
})
export class MeComponent implements OnInit {
  menuItems: MenuItem[];
  agent: AgentResponse | null = null;
  loading = false;
  error: string | null = null;

  // Édition de l'email (inline)
  editingEmail = false;
  emailForm: FormGroup;
  savingEmail = false;

  // Changement de mot de passe (modal)
  showPasswordModal = false;
  passwordForm: FormGroup;
  savingPassword = false;
  passwordError: string | null = null;

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router,
    private menuService: MenuService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;

    this.emailForm = this.fb.group({
      email: ['', [Validators.email]]
    });

    this.passwordForm = this.fb.group({
      ancienMotDePasse: ['', Validators.required],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmation: ['', Validators.required]
    }, { validators: motsDePasseIdentiquesValidator });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loading = true;
    this.agentService.getMe().subscribe({
      next: (agent) => {
        this.agent = agent;
        this.emailForm.patchValue({ email: agent.email || '' });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger votre profil';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get initiales(): string {
    if (!this.agent) return '';
    return `${this.agent.prenoms.charAt(0)}${this.agent.nom.charAt(0)}`.toUpperCase();
  }

  get libelleRole(): string {
    if (!this.agent) return '';
    switch (this.agent.role) {
      case 'SUPER_ADMIN': return 'Super administrateur';
      case 'ADMIN': return 'Administrateur';
      default: return 'Agent';
    }
  }

  // ================= EMAIL =================

  commencerEditionEmail(): void {
    this.emailForm.patchValue({ email: this.agent?.email || '' });
    this.editingEmail = true;
  }

  annulerEditionEmail(): void {
    this.editingEmail = false;
    this.emailForm.patchValue({ email: this.agent?.email || '' });
  }

  enregistrerEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.savingEmail = true;
    const email = this.emailForm.value.email || '';

    this.agentService.modifierMonEmail(email).subscribe({
      next: (agent) => {
        this.agent = agent;
        this.savingEmail = false;
        this.editingEmail = false;
        this.cdr.detectChanges();
        Swal.fire({ title: 'Email mis à jour', icon: 'success', timer: 1500, showConfirmButton: false });
      },
      error: (err) => {
        this.savingEmail = false;
        this.cdr.detectChanges();
        Swal.fire({ title: 'Erreur', text: err?.message || 'Impossible de mettre à jour votre email', icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  // ================= MOT DE PASSE =================

  ouvrirModalMotDePasse(): void {
    this.passwordForm.reset();
    this.passwordError = null;
    this.showPasswordModal = true;
  }

  fermerModalMotDePasse(): void {
    this.showPasswordModal = false;
    this.passwordForm.reset();
    this.passwordError = null;
  }

  changerMotDePasse(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword = true;
    this.passwordError = null;
    const { ancienMotDePasse, nouveauMotDePasse } = this.passwordForm.value;

    this.agentService.changerMonMotDePasse(ancienMotDePasse, nouveauMotDePasse).subscribe({
      next: () => {
        this.savingPassword = false;
        this.cdr.detectChanges();
        this.fermerModalMotDePasse();
        Swal.fire({ title: 'Mot de passe modifié', icon: 'success', timer: 1500, showConfirmButton: false });
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordError = err?.message || 'Impossible de changer le mot de passe';
        this.cdr.detectChanges();
      }
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.hasError('required')) return 'Ce champ est obligatoire';
    if (control?.hasError('email')) return 'Adresse email invalide';
    if (control?.hasError('minlength')) return `Minimum ${control.getError('minlength').requiredLength} caractères`;
    return '';
  }
}
