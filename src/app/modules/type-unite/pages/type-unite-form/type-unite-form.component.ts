import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { TypeUniteService } from '../../../../core/services/type-unite.service';
import { TypeUniteRequest, TypeUniteResponse } from '../../../../core/models/type-unite.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-type-unite-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './type-unite-form.component.html'
})
export class TypeUniteFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private fb: FormBuilder,
    private typeUniteService: TypeUniteService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    // Expand the Unités administratives menu
    const uniteAdminItem = this.menuItems.find(item => item.label === 'Unités administratives');
    if (uniteAdminItem) {
      uniteAdminItem.expanded = true;
    }
    this.form = this.fb.group({
      code:        ['', [Validators.required, Validators.maxLength(50)]],
      libelle:     ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]]
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
      this.loadTypeUnite(codeParam);
    }
  }

  loadTypeUnite(code: string): void {
    this.loading = true;
    this.typeUniteService.getByCode(code).subscribe({
      next: (typeUnite) => {
        this.form.patchValue({
          code:        typeUnite.code,
          libelle:     typeUnite.libelle,
          description: typeUnite.description || ''
        });
        // Désactiver les champs non modifiables en mode édition
        this.form.get('code')?.disable();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le type d\'unité';
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

    // getRawValue() inclut les champs disabled (code)
    const request: TypeUniteRequest = this.form.getRawValue();

    if (this.isEditMode && this.code) {
      this.typeUniteService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'Le type d\'unité a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/unite-administrative/type-unite']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le type d\'unité';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.typeUniteService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'Le type d\'unité a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/unite-administrative/type-unite']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer le type d\'unité';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/unite-administrative/type-unite']);
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
