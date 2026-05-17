import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AffectationService } from '../../../../core/services/affectation.service';
import { AffectationRequest, AffectationResponse } from '../../../../core/models/affectation.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-affectation-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './affectation-form.component.html'
})
export class AffectationFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private fb: FormBuilder,
    private affectationService: AffectationService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    const agentsItem = this.menuItems.find(item => item.label === 'Agents');
    if (agentsItem) {
      agentsItem.expanded = true;
    }
    this.form = this.fb.group({
      code:                ['', [Validators.required, Validators.maxLength(50)]],
      matriculeAgent:      ['', [Validators.required]],
      codeUnite:           ['', [Validators.required]],
      poste:               ['', [Validators.required, Validators.maxLength(100)]],
      dateAffectation:     ['', [Validators.required]],
      dateFinAffectation:  ['']
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
      this.loadAffectation(codeParam);
    }
  }

  loadAffectation(code: string): void {
    this.loading = true;
    this.affectationService.getByCode(code).subscribe({
      next: (affectation) => {
        this.form.patchValue({
          code:               affectation.code,
          matriculeAgent:     affectation.matriculeAgent,
          codeUnite:          affectation.codeUnite,
          poste:              affectation.poste,
          dateAffectation:    affectation.dateAffectation,
          dateFinAffectation: affectation.dateFinAffectation || ''
        });

        // Désactiver les champs non modifiables en mode édition
        this.form.get('code')?.disable();
        this.form.get('matriculeAgent')?.disable();
        this.form.get('codeUnite')?.disable();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'affectation';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    // getRawValue() inclut les champs disabled (code, matriculeAgent, codeUnite)
    const request: AffectationRequest = this.form.getRawValue();

    if (this.isEditMode && this.code) {
      this.affectationService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifiée',
            text: 'L\'affectation a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/agents/affectations']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'affectation';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.affectationService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créée',
            text: 'L\'affectation a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/agents/affectations']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'affectation';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/agents/affectations']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }
}