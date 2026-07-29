import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { uniteAdministrativeSchema } from './unite-administrative-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-unite-administrative-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, SearchableSelectComponent, PageHeaderComponent],
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
  unitesAdministratives: UniteAdministrativeResponse[] = [];
  loadingTypeUnites = false;
  loadingMinisteres = false;
  loadingUnites = false;

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
      code:                [''],
      libelle:             [''],
      idTypeUnite:         [''],
      codeMinistere:       [''],
      idUniteParent:       [''],
      niveauHierarchique:  [{ value: 1, disabled: true }]
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, uniteAdministrativeSchema, this.form.getRawValue())
    );

    // "Unité parent" est devenu un app-searchable-select (pas d'événement
    // (change) natif) : on réagit au changement de valeur du FormControl.
    this.form.get('idUniteParent')?.valueChanges.subscribe(v => this.onUniteParentChange(v));
  }

  isRequired(field: string): boolean {
    return isRequired(uniteAdministrativeSchema, field);
  }

  get typeUniteOptions(): SearchableSelectOption[] {
    return this.typeUnites.map(t => ({ value: t.code, label: `${t.libelle} (${t.code})` }));
  }

  get ministereOptions(): SearchableSelectOption[] {
    return this.ministeres.map(m => ({ value: m.code, label: m.nom }));
  }

  get uniteParentOptions(): SearchableSelectOption[] {
    return this.unitesAdministratives.map(u => ({ value: u.code, label: `${u.libelle} (${u.code})` }));
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
          this.ministeres = this.isSuperAdmin
            ? ministeres
            : ministeres.filter(m => m.code === this.authService.getCurrentUser()?.codeMinistere);
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
      this.loadUnitesAdministratives();
    }
  }

  loadUnitesAdministratives(): void {
    this.loadingUnites = true;
    this.uniteService.getAll().subscribe({
      next: (unites) => {
        this.unitesAdministratives = unites;
        this.loadingUnites = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingUnites = false;
        this.error = err?.message || 'Impossible de charger les unités administratives';
        this.cdr.detectChanges();
      }
    });
  }

  onUniteParentChange(codeUniteParent: string): void {
    if (!codeUniteParent) {
      this.form.patchValue({ niveauHierarchique: 1 });
      return;
    }

    // Trouver l'unité parent par code et calculer le niveau hiérarchique
    const uniteParent = this.unitesAdministratives.find(u => u.code === codeUniteParent);
    if (uniteParent) {
      const nouveauNiveau = (uniteParent.niveauHierarchique || 0) + 1;
      this.form.patchValue({ niveauHierarchique: nouveauNiveau });
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

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }

  loadMinisteres(): void {
    this.loadingMinisteres = true;
    this.ministereService.getAll().subscribe({
      next: (ministeres) => {
        if (this.isSuperAdmin) {
          this.ministeres = ministeres;
        } else {
          // Un ADMIN ne peut créer une unité que dans son propre ministère
          const codeMinistereAgent = this.authService.getCurrentUser()?.codeMinistere;
          this.ministeres = ministeres.filter(m => m.code === codeMinistereAgent);
          if (codeMinistereAgent) {
            this.form.patchValue({ codeMinistere: codeMinistereAgent });
            this.form.get('codeMinistere')?.disable();
          }
        }
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
    const valid = applyZodValidation(this.form, uniteAdministrativeSchema, this.form.getRawValue());
    if (!valid) {
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
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
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
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/unite-administrative']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }
}