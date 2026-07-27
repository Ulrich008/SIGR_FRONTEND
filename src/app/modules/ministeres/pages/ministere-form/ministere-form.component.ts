import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MinistereService } from '../../../../core/services/ministere.service';
import { MinistereRequest, MinistereResponse } from '../../../../core/models/ministere.model';
import { ministereSchema } from './ministere-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-ministere-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MainLayoutComponent],
  templateUrl: './ministere-form.component.html'
})
export class MinistereFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  ministereId: string | null = null;

  menuItems: MenuItem[] = [
    { icon: 'fas fa-th', label: 'Tableau de bord', path: '/dashboard' },
    { icon: 'fas fa-building', label: 'Structures', path: '/ministeres' },
    { icon: 'fas fa-columns', label: 'Sections' },
    { icon: 'fas fa-chart-line', label: 'Processus' },
    { icon: 'fas fa-exclamation-triangle', label: 'Risques' },
    { icon: 'fas fa-table', label: 'Matrice' },
    { icon: 'fas fa-chart-simple', label: 'Indicateurs' },
    { icon: 'fas fa-book', label: 'Bibliothèque' },
    { icon: 'fas fa-users', label: 'Utilisateurs' },
  ];

  constructor(
    private fb: FormBuilder,
    private ministereService: MinistereService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      code: [''],
      nom: [''],
      sigle: [''],
      description: ['']
    });

    this.form.valueChanges.subscribe(value =>
      applyZodValidation(this.form, ministereSchema, value)
    );
  }

  isRequired(field: string): boolean {
    return isRequired(ministereSchema, field);
  }

  ngOnInit(): void {
    this.ministereId = this.route.snapshot.paramMap.get('id');
    if (this.ministereId) {
      this.loadMinistere(this.ministereId);
    }
  }

  loadMinistere(id: string): void {
    this.loading = true;
    this.ministereService.getById(id).subscribe({
      next: ministere => {
        // creePar est géré automatiquement côté backend, pas dans ce formulaire
        const { creePar, ...formData } = ministere;
        this.form.patchValue(formData);
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'Impossible de charger le ministère';
        this.loading = false;
      }
    });
  }

  submit(): void {
    const valid = applyZodValidation(this.form, ministereSchema, this.form.getRawValue());
    if (!valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    const request: MinistereRequest = this.form.value;

    const action = this.ministereId
      ? this.ministereService.update(this.ministereId, request)
      : this.ministereService.create(request);

    action.subscribe({
      next: () => {
        this.loading = false;
        const message = this.ministereId ? 'Ministère modifié avec succès' : 'Ministère créé avec succès';
        Swal.fire({
          title: 'Succès',
          text: message,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/ministeres']);
        });
      },
      error: err => {
        this.loading = false;
        this.error = err?.message || 'Impossible d’enregistrer le ministère';
        Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/ministeres']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }
}
