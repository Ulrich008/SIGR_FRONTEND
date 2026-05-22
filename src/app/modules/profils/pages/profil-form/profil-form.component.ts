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
import { ProfilService } from '../../../../core/services/profil.service';
import { ProfilRequest, ProfilResponse } from '../../../../core/models/profil.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profil-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './profil-form.component.html'
})
export class ProfilFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private profilService: ProfilService,
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
      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          this.noSpacesValidator(),
          this.uppercaseAlphanumericValidator()
        ]
      ],
      libelle: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      description: [
        '',
        [Validators.maxLength(300)]
      ]
    });
  }

  noSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value && /\s/.test(value) ? { hasSpaces: true } : null;
    };
  }

  uppercaseAlphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const validPattern = /^[A-Z0-9_\-]+$/;
      return !validPattern.test(value) ? { invalidCode: true } : null;
    };
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
      this.loadProfil(codeParam);

      // En mode édition, le code est verrouillé
      this.form.get('code')?.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProfil(code: string): void {
    this.loading = true;
    this.error = null;
    const sub = this.profilService.getByCode(code).subscribe({
      next: (profil: ProfilResponse) => {
        this.form.patchValue({
          code: profil.code ?? '',
          libelle: profil.libelle ?? '',
          description: profil.description ?? ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ||
          err?.message ||
          'Impossible de charger le profil';
        console.error('Error loading profil:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFirstError();
      return;
    }

    this.loading = true;
    this.error = null;

    const rawValue = this.form.getRawValue();
    const request: ProfilRequest = {
      code: rawValue.code,
      libelle: rawValue.libelle,
      description: rawValue.description || undefined
    };

    if (this.isEditMode && this.code) {
      const sub = this.profilService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'Le profil a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/profils']));
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error?.message ||
            err?.message ||
            'Impossible de modifier le profil';
          console.error(err);
          Swal.fire({
            title: 'Erreur',
            text: this.error ?? undefined,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
      this.subscriptions.add(sub);
    } else {
      const sub = this.profilService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'Le profil a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/profils']));
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error?.message ||
            err?.message ||
            'Impossible de créer le profil';
          console.error(err);
          Swal.fire({
            title: 'Erreur',
            text: this.error ?? undefined,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
      this.subscriptions.add(sub);
    }
  }

  cancel(): void {
    if (this.form.dirty) {
      Swal.fire({
        title: 'Quitter sans sauvegarder ?',
        text: 'Vous avez des modifications non enregistrées.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, quitter',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/profils']);
        }
      });
    } else {
      this.router.navigate(['/profils']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required'])   return 'Ce champ est requis';
    if (errors['maxlength'])  return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['hasSpaces'])  return 'Les espaces ne sont pas autorisés';
    if (errors['invalidCode']) return 'Le code doit être en majuscules (lettres, chiffres, _ ou -)';
    return 'Champ invalide';
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.border-red-500, .text-red-600');
      if (firstError && typeof window !== 'undefined') {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  get codeControl()        { return this.form.get('code'); }
  get libelleControl()     { return this.form.get('libelle'); }
  get descriptionControl() { return this.form.get('description'); }
}