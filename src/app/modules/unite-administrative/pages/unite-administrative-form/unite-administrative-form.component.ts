import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { TypeUniteService } from '../../../../core/services/type-unite.service';
import { MinistereService } from '../../../../core/services/ministere.service';
import { UniteAdministrativeRequest, UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { TypeUniteResponse } from '../../../../core/models/type-unite.model';
import { MinistereResponse } from '../../../../core/models/ministere.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-unite-administrative-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './unite-administrative-form.component.html'
})
export class UniteAdministrativeFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  typeUnites: TypeUniteResponse[] = [];
  ministeres: MinistereResponse[] = [];
  loadingTypeUnites = false;
  loadingMinisteres = false;

  constructor(
    private fb: FormBuilder,
    private uniteService: UniteAdministrativeService,
    private typeUniteService: TypeUniteService,
    private ministereService: MinistereService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code:                ['', [Validators.required, Validators.maxLength(50)]],
      libelle:             ['', [Validators.required, Validators.maxLength(200)]],
      idTypeUnite:         ['', [Validators.required]],
      codeMinistere:       ['', [Validators.required]],
      idUniteParent:       [''],
      niveauHierarchique:  ['', [Validators.required, Validators.min(1), Validators.max(10)]]
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
      // Charger les données en parallèle avant de charger l'unité
      forkJoin([
        this.typeUniteService.getAll(),
        this.ministereService.getAll()
      ]).subscribe({
        next: ([typeUnites, ministeres]) => {
          this.typeUnites = typeUnites;
          this.ministeres = ministeres;
          this.loadingTypeUnites = false;
          this.loadingMinisteres = false;
          this.loadUnite(codeParam);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loadingTypeUnites = false;
          this.loadingMinisteres = false;
          this.error = err?.message || 'Impossible de charger les données';
          this.cdr.detectChanges();
        }
      });
    } else {
      // Mode création: charger uniquement les listes
      this.loadTypeUnites();
      this.loadMinisteres();
    }
  }

  loadTypeUnites(): void {
    this.loadingTypeUnites = true;
    this.typeUniteService.getAll().subscribe({
      next: (typeUnites) => {
        this.typeUnites = typeUnites;
        this.loadingTypeUnites = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingTypeUnites = false;
        this.error = err?.message || 'Impossible de charger les types d\'unités';
        this.cdr.detectChanges();
      }
    });
  }

  loadMinisteres(): void {
    this.loadingMinisteres = true;
    this.ministereService.getAll().subscribe({
      next: (ministeres) => {
        this.ministeres = ministeres;
        this.loadingMinisteres = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingMinisteres = false;
        this.error = err?.message || 'Impossible de charger les ministères';
        this.cdr.detectChanges();
      }
    });
  }

  loadUnite(code: string): void {
    this.loading = true;
    this.uniteService.getByCode(code).subscribe({
      next: (unite) => {
        this.form.patchValue({
          code:               unite.code,
          libelle:            unite.libelle,
          idTypeUnite:        unite.typeUniteId,
          codeMinistere:      unite.codeMinistere,
          idUniteParent:      unite.idUniteParent || '',
          niveauHierarchique: unite.niveauHierarchique
        });

        // Désactiver les champs non modifiables en mode édition
        this.form.get('code')?.disable();
        this.form.get('idTypeUnite')?.disable();
        this.form.get('codeMinistere')?.disable();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'unité administrative';
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

    // getRawValue() inclut les champs disabled (code, idTypeUnite, codeMinistere)
    const request: UniteAdministrativeRequest = this.form.getRawValue();

    if (this.isEditMode && this.code) {
      this.uniteService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifiée',
            text: 'L\'unité administrative a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/unite-administrative']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'unité administrative';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.uniteService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créée',
            text: 'L\'unité administrative a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/unite-administrative']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'unité administrative';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/unite-administrative']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    if (errors['max']) return `Maximum ${errors['max'].max}`;
    return 'Champ invalide';
  }
}