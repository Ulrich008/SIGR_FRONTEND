import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { IndicateurPerformanceService } from '../../../../core/services/indicateur-performance.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { IndicateurPerformanceRequest, IndicateurPerformanceResponse, Frequence } from '../../../../core/models/indicateur-performance.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-indicateurs-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './indicateurs-form.component.html'
})
export class IndicateursFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  
  processus: ProcessusResponse[] = [];
  loadingProcessus = false;
  frequenceOptions = Object.values(Frequence);

  constructor(
    private fb: FormBuilder,
    private indicateurService: IndicateurPerformanceService,
    private processusService: ProcessusService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }],
      libelle: ['', [Validators.required, Validators.maxLength(200)]],
      frequence: ['', [Validators.required]],
      valeurCible: ['', [Validators.min(0)]],
      valeurObtenue: ['', [Validators.min(0)]],
      seuilAlerte: ['', [Validators.min(0)]],
      dateMesure: ['', [Validators.required]],
      codeProcessus: ['', [Validators.required]]
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
      
      forkJoin({
        processus: this.processusService.getAll(),
        indicateur: this.indicateurService.getByCode(codeParam)
      }).subscribe({
        next: (data) => {
          this.processus = data.processus;
          this.patchForm(data.indicateur);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de charger les données';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadReferenceData();
    }
  }

  loadReferenceData(): void {
    this.loading = true;
    this.processusService.getAll().subscribe({
      next: (processus) => {
        this.processus = processus;
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

  patchForm(indicateur: IndicateurPerformanceResponse): void {
    this.form.patchValue({
      code: indicateur.code,
      libelle: indicateur.libelle,
      frequence: indicateur.frequence,
      valeurCible: indicateur.valeurCible,
      valeurObtenue: indicateur.valeurObtenue,
      seuilAlerte: indicateur.seuilAlerte,
      dateMesure: this.formatDateForInput(indicateur.dateMesure),
      codeProcessus: indicateur.codeProcessus
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

    const request: IndicateurPerformanceRequest = {
      code: raw.code,
      libelle: raw.libelle,
      frequence: raw.frequence,
      valeurCible: raw.valeurCible ? parseFloat(raw.valeurCible) : undefined,
      valeurObtenue: raw.valeurObtenue ? parseFloat(raw.valeurObtenue) : undefined,
      seuilAlerte: raw.seuilAlerte ? parseFloat(raw.seuilAlerte) : undefined,
      dateMesure: raw.dateMesure,
      codeProcessus: raw.codeProcessus
    };

    if (this.isEditMode && this.code) {
      this.indicateurService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'L\'indicateur a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/indicateurs']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'indicateur';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.indicateurService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'L\'indicateur a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/indicateurs']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'indicateur';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/indicateurs']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
}
