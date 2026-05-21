import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';

import { RisqueService } from '../../../../core/services/risque.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { CartographieRisquesService } from '../../../../core/services/cartographie-risques.service';

import {
  RisqueRequest,
  RisqueResponse,
  StatutRisque,
  TypeRisque
} from '../../../../core/models/risque.model';

import { ProcessusResponse } from '../../../../core/models/processus.model';
import { CartographieRisquesResponse } from '../../../../core/models/cartographie-risques.model';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-risques-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './risques-form.component.html'
})
export class RisquesFormComponent implements OnInit {

  form: FormGroup;

  isEditMode = false;
  code?: string;

  loading = false;
  error: string | null = null;

  menuItems: MenuItem[];

  processus: ProcessusResponse[] = [];
  cartographies: CartographieRisquesResponse[] = [];

  loadingProcessus = false;
  loadingCartographies = false;

  statutOptions = [
    { value: StatutRisque.ACTIF, label: 'Actif' },
    { value: StatutRisque.EN_COURS, label: 'En cours' },
    { value: StatutRisque.MAITRISE, label: 'Maîtrisé' },
    { value: StatutRisque.CLOTURE, label: 'Clôturé' },
    { value: StatutRisque.SUPPRIME, label: 'Supprimé' }
  ];

  typeRisqueOptions = [
    {
      value: TypeRisque.STRATEGIQUE_PILOTAGE,
      label: 'Stratégique / Pilotage'
    },
    {
      value: TypeRisque.OPERATIONNEL,
      label: 'Opérationnel'
    },
    {
      value: TypeRisque.FINANCIER,
      label: 'Financier'
    },
    {
      value: TypeRisque.RESSOURCES_HUMAINES,
      label: 'Ressources humaines'
    },
    {
      value: TypeRisque.ETHIQUE_DEONTOLOGIE_FRAUDE,
      label: 'Éthique / Déontologie / Fraude'
    },
    {
      value: TypeRisque.JURIDIQUE,
      label: 'Juridique'
    },
    {
      value: TypeRisque.INFORMATIQUE,
      label: 'Informatique'
    },
    {
      value: TypeRisque.IMAGE_REPUTATION,
      label: 'Image / Réputation'
    },
    {
      value: TypeRisque.GESTION_CONNAISSANCE,
      label: 'Gestion de la connaissance'
    },
    {
      value: TypeRisque.EXTERNE,
      label: 'Externe'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private risqueService: RisqueService,
    private processusService: ProcessusService,
    private cartographieService: CartographieRisquesService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {

    this.menuItems = this.menuService.items;

    this.form = this.fb.group({
      code: [{ value: '', disabled: true }],

      libelle: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],

      causeProbable: ['', [
        Validators.maxLength(1000)
      ]],

      consequenceProbable: ['', [
        Validators.maxLength(1000)
      ]],

      statut: ['', [Validators.required]],

      dateIdentification: ['', [Validators.required]],

      codeProcessus: ['', [Validators.required]],

      codeCartographie: [''],

      typeRisque: ['', [Validators.required]]
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
        cartographies: this.cartographieService.getAll(),
        risque: this.risqueService.getByCode(codeParam)
      }).subscribe({

        next: (data) => {

          this.processus = data.processus;
          this.cartographies = data.cartographies;

          this.patchForm(data.risque);

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

    forkJoin({
      processus: this.processusService.getAll(),
      cartographies: this.cartographieService.getAll()
    }).subscribe({

      next: (data) => {

        this.processus = data.processus;
        this.cartographies = data.cartographies;

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

  patchForm(risque: RisqueResponse): void {

    this.form.patchValue({
      code: risque.code,
      libelle: risque.libelle,
      causeProbable: risque.causeProbable,
      consequenceProbable: risque.consequenceProbable,
      statut: risque.statut,
      dateIdentification: this.formatDateForInput(risque.dateIdentification),
      codeProcessus: risque.codeProcessus,
      codeCartographie: risque.idCartographie,
      typeRisque: risque.typeRisque
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

    const request: RisqueRequest = {
      code: raw.code,
      libelle: raw.libelle,
      causeProbable: raw.causeProbable,
      consequenceProbable: raw.consequenceProbable,
      statut: raw.statut,
      dateIdentification: raw.dateIdentification,
      codeProcessus: raw.codeProcessus,
      codeCartographie: raw.codeCartographie,
      typeRisque: raw.typeRisque
    };

    if (this.isEditMode && this.code) {

      this.risqueService.updateByCode(this.code, request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Modifié',
            text: 'Le risque a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/risques']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le risque';

          this.cdr.detectChanges();
        }
      });

    } else {

      this.risqueService.create(request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Créé',
            text: 'Le risque a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/risques']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de créer le risque';

          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/risques']);
  }

  getFieldError(fieldName: string): string {

    const field = this.form.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Ce champ est requis';
    }

    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    }

    return 'Champ invalide';
  }

  private formatDateForInput(date: string): string {

    if (!date) {
      return '';
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toISOString().split('T')[0];
  }
}