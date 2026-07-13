import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { PlanAuditService } from '../../../../core/services/plan-audit.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { RisqueService } from '../../../../core/services/risque.service';
import { PlanAuditRequest, PlanAuditResponse, AuditPropose, TypeRevue } from '../../../../core/models/audit.model';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { RisqueResponse } from '../../../../core/models/risque.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-plan-audit-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './plan-audit-form.component.html'
})
export class PlanAuditFormComponent implements OnInit {

  form: FormGroup;

  isEditMode = false;
  code?: string;

  loading = false;
  error: string | null = null;

  menuItems: MenuItem[];

  unitesAdministratives: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  showUniteDropdown = false;
  processus: ProcessusResponse[] = [];
  risques: RisqueResponse[] = [];
  auditProposeOptions: string[] = [];
  typeRevueOptions: string[] = [];

  sections = {
    informationsGenerales: true,
    prePlanification: true
  };

  constructor(
    private fb: FormBuilder,
    private planAuditService: PlanAuditService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private processusService: ProcessusService,
    private risqueService: RisqueService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {

    this.menuItems = this.menuService.items;

    this.form = this.fb.group({
      libelle: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],

      dateCreation: ['', [Validators.required]],

      codeUniteAdministrative: ['', [Validators.required]],

      codeProcessus: ['', [Validators.required]],

      codeRisque: [''],

      auditPropose: ['', [Validators.required]],

      typeRevue: ['', [Validators.required]],

      objectifAudit: ['', [Validators.required, Validators.maxLength(1000)]],

      effetAuditIndicatif: ['', [Validators.required, Validators.maxLength(1000)]]
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
        unitesAdministratives: this.uniteAdministrativeService.getAll(),
        auditProposeEnums: this.planAuditService.getAuditProposeEnums(),
        typeRevueEnums: this.planAuditService.getTypeRevueEnums(),
        planAudit: this.planAuditService.getByCode(codeParam)
      }).subscribe({

        next: (data) => {

          this.unitesAdministratives = data.unitesAdministratives;
          this.auditProposeOptions = data.auditProposeEnums;
          this.typeRevueOptions = data.typeRevueEnums;

          this.patchForm(data.planAudit);

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

    // Charger les processus quand l'unité administrative change
    this.form.get('codeUniteAdministrative')?.valueChanges.subscribe(codeUnite => {
      if (codeUnite) {
        this.loadProcessusByUnite(codeUnite);
      } else {
        this.processus = [];
        this.form.patchValue({ codeProcessus: '', codeRisque: '' });
      }
    });

    // Charger les risques quand le processus change
    this.form.get('codeProcessus')?.valueChanges.subscribe(codeProcessus => {
      if (codeProcessus) {
        this.loadRisquesByProcessus(codeProcessus);
      } else {
        this.risques = [];
        this.form.patchValue({ codeRisque: '' });
      }
    });
  }

  loadReferenceData(): void {

    this.loading = true;

    forkJoin({
      unitesAdministratives: this.uniteAdministrativeService.getAll(),
      auditProposeEnums: this.planAuditService.getAuditProposeEnums(),
      typeRevueEnums: this.planAuditService.getTypeRevueEnums()
    }).subscribe({

      next: (data) => {

        this.unitesAdministratives = data.unitesAdministratives;
        this.filteredUnites = [];
        this.auditProposeOptions = data.auditProposeEnums;
        this.typeRevueOptions = data.typeRevueEnums;

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

  loadProcessusByUnite(codeUnite: string): void {
    this.processusService.getAll().subscribe({
      next: (allProcessus) => {
        // Filtrer les processus liés à l'unité administrative
        this.processus = allProcessus.filter(p => p.idUnite === codeUnite);
        this.form.patchValue({ codeProcessus: '', codeRisque: '' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  loadRisquesByProcessus(codeProcessus: string): void {
    this.risqueService.getAll().subscribe({
      next: (allRisques) => {
        // Filtrer les risques liés au processus
        this.risques = allRisques.filter(r => r.codeProcessus === codeProcessus);
        this.form.patchValue({ codeRisque: '' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger les risques';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(planAudit: PlanAuditResponse): void {

    this.form.patchValue({
      libelle: planAudit.libelle,
      dateCreation: this.formatDateForInput(planAudit.dateCreation),
      codeUniteAdministrative: planAudit.codeUniteAdministrative,
      codeProcessus: planAudit.codeProcessus,
      codeRisque: planAudit.codeRisque,
      auditPropose: planAudit.auditPropose,
      typeRevue: planAudit.typeRevue,
      objectifAudit: planAudit.objectifAudit,
      effetAuditIndicatif: planAudit.effetAuditIndicatif
    });

    // Charger les processus et risques pour l'unité et le processus sélectionnés
    if (planAudit.codeUniteAdministrative) {
      this.loadProcessusByUnite(planAudit.codeUniteAdministrative);
    }

    if (planAudit.codeProcessus) {
      this.loadRisquesByProcessus(planAudit.codeProcessus);
    }
  }

  onSubmit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const request: PlanAuditRequest = {
      libelle: raw.libelle,
      dateCreation: raw.dateCreation,
      codeUniteAdministrative: raw.codeUniteAdministrative,
      codeProcessus: raw.codeProcessus,
      codeRisque: raw.codeRisque,
      auditPropose: raw.auditPropose,
      typeRevue: raw.typeRevue,
      objectifAudit: raw.objectifAudit,
      effetAuditIndicatif: raw.effetAuditIndicatif
    };

    if (this.isEditMode && this.code) {

      this.planAuditService.updateByCode(this.code, request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Modifié',
            text: 'Le plan d\'audit a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-audit']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de modifier le plan d\'audit';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });

          this.cdr.detectChanges();
        }
      });

    } else {

      this.planAuditService.create(request).subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            title: 'Créé',
            text: 'Le plan d\'audit a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/plans-audit']));
        },

        error: (err) => {

          this.loading = false;
          this.error = err?.message || 'Impossible de créer le plan d\'audit';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });

          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/plans-audit']);
  }

  toggleSection(section: keyof typeof this.sections): void {
    this.sections[section] = !this.sections[section];
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

  formatEnumLabel(enumValue: string): string {
    if (!enumValue) {
      return '';
    }
    // Convertir SNAKE_CASE en texte lisible
    return enumValue
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  onUniteFocus(): void {
    const currentValue = this.form.get('codeUniteAdministrative')?.value;
    if (currentValue) {
      this.onUniteSearch({ target: { value: currentValue } } as any);
    } else {
      this.filteredUnites = this.unitesAdministratives;
      this.showUniteDropdown = this.filteredUnites.length > 0;
      this.cdr.detectChanges();
    }
  }

  onUniteSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredUnites = this.unitesAdministratives;
      this.showUniteDropdown = this.filteredUnites.length > 0;
      this.cdr.detectChanges();
      return;
    }

    this.filteredUnites = this.unitesAdministratives.filter(unite =>
      unite.code.toLowerCase().includes(searchTerm) ||
      unite.libelle.toLowerCase().includes(searchTerm)
    );

    this.showUniteDropdown = this.filteredUnites.length > 0;
    this.cdr.detectChanges();
  }

  selectUnite(unite: UniteAdministrativeResponse): void {
    this.form.patchValue({ codeUniteAdministrative: unite.code });
    this.showUniteDropdown = false;
    this.filteredUnites = [];
    this.loadProcessusByUnite(unite.code);
  }

  getUniteDropdownTop(input: HTMLInputElement): number {
    const rect = input.getBoundingClientRect();
    return rect.bottom + window.scrollY + 4;
  }

  getUniteDropdownLeft(input: HTMLInputElement): number {
    const rect = input.getBoundingClientRect();
    return rect.left + window.scrollX;
  }

  // Fermer le dropdown si on clique ailleurs
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUniteDropdown = false;
    }
  }
}
