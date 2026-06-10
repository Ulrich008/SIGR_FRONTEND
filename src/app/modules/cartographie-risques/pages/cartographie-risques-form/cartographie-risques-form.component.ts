import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';
import { CartographieRisquesRequest, CartographieRisquesResponse, StatutCartographie } from '../../../../core/models/cartographie-risques.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cartographie-risques-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './cartographie-risques-form.component.html'
})
export class CartographieRisquesFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  statutOptions = [
    { value: StatutCartographie.BROUILLON, label: 'Brouillon' },
    { value: StatutCartographie.EN_COURS, label: 'En cours' },
    { value: StatutCartographie.VALIDEE, label: 'Validée' },
    { value: StatutCartographie.ARCHIVEE, label: 'Archivée' }
  ];

  constructor(
    private fb: FormBuilder,
    private cartographieService: CartographieRisquesService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code:           [{ value: '', disabled: true }],
      titre:          ['', [Validators.required, Validators.maxLength(200)]],
      periode:        ['', [Validators.required]],
      seuilFaible:    [7, [Validators.required, Validators.min(0)]],
      seuilMoyen:     [14, [Validators.required, Validators.min(0)]],
      seuilEleve:     [25, [Validators.required, Validators.min(0)]],
      statut:         ['', [Validators.required]]
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
      this.loadCartographie(codeParam);
    }
  }

  loadCartographie(code: string): void {
    this.loading = true;
    this.cartographieService.getByCode(code).subscribe({
      next: (cartographie) => {
        this.form.patchValue({
          code:        cartographie.code,
          titre:       cartographie.titre,
          periode:     cartographie.periode,
          seuilFaible: cartographie.seuilFaible,
          seuilMoyen:  cartographie.seuilMoyen,
          seuilEleve:  cartographie.seuilEleve,
          statut:      cartographie.statut
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger la cartographie';
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

    const raw = this.form.getRawValue();

    const request: CartographieRisquesRequest = {
      code:        raw.code,
      titre:       raw.titre,
      periode:     raw.periode,
      seuilFaible: raw.seuilFaible,
      seuilMoyen:  raw.seuilMoyen,
      seuilEleve:  raw.seuilEleve,
      statut:      raw.statut
    };

    if (this.isEditMode && this.code) {
      this.cartographieService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifiée',
            text: 'La cartographie a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/cartographie-risques']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier la cartographie';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cartographieService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créée',
            text: 'La cartographie a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/cartographie-risques']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer la cartographie';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/cartographie-risques']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    return 'Champ invalide';
  }
}
