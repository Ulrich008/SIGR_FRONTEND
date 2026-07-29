import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteMesureService } from '../../../../core/services/unite-mesure.service';
import { UniteMesureRequest, UniteMesureResponse } from '../../../../core/models/unite-mesure.model';
import { AuthService } from '../../../../core/services/auth.service';
import { uniteMesureSchema } from './unites-mesure-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'app-unites-mesure-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, PageHeaderComponent],
  templateUrl: './unites-mesure-form.component.html'
})
export class UnitesMesureFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  id?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private fb: FormBuilder,
    private uniteMesureService: UniteMesureService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code: [''],
      libelle: [''],
      symbole: [''],
      description: ['']
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, uniteMesureSchema, this.form.getRawValue())
    );
  }

  isRequired(field: string): boolean {
    return isRequired(uniteMesureSchema, field);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.id = idParam;
      this.loading = true;
      this.uniteMesureService.getById(idParam).subscribe({
        next: (uniteMesure) => {
          this.patchForm(uniteMesure);
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
  }

  patchForm(uniteMesure: UniteMesureResponse): void {
    this.form.patchValue({
      code: uniteMesure.code,
      libelle: uniteMesure.libelle,
      symbole: uniteMesure.symbole,
      description: uniteMesure.description
    });
  }

  onSubmit(): void {
    const valid = applyZodValidation(this.form, uniteMesureSchema, this.form.getRawValue());
    if (!valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    const request: UniteMesureRequest = this.form.getRawValue();

    if (this.isEditMode && this.id) {
      this.uniteMesureService.update(this.id, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'unité de mesure a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/unites-mesure']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'unité de mesure';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.uniteMesureService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'unité de mesure a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/unites-mesure']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'unité de mesure';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/unites-mesure']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }
}
