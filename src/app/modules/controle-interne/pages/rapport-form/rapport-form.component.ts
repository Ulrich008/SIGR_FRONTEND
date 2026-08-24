import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';

import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/searchable-select/searchable-select.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { FormStepperComponent, FormStepDef } from '../../../../shared/form-stepper/form-stepper.component';

import { RapportControleInterneService } from '../../../../core/services/rapport-controle-interne.service';
import { ControleSecondNiveauService } from '../../../../core/services/controle-second-niveau.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ActionCorrective, LigneControleResponse, RapportControleInterneRequest } from '../../../../core/models/controle-interne.model';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-rapport-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, SearchableSelectComponent, PageHeaderComponent, FormStepperComponent],
  templateUrl: './rapport-form.component.html'
})
export class RapportFormComponent implements OnInit {

  form: FormGroup;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  unitesAdministratives: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  showUniteDropdown = false;
  uniteDropdownTop = 0;
  uniteDropdownLeft = 0;

  processus: ProcessusResponse[] = [];
  loadingProcessus = false;

  // Constat + analyse + recommandation restent groupés et rattachés à leur
  // contrôle d'origine (voir ControleSecondNiveauService.getLignesDetaillees),
  // pour ne jamais afficher ces éléments en vrac.
  lignes: LigneControleResponse[] = [];
  loadingLignes = false;

  // Actions correctrices : liste ajoutée un élément à la fois (comme les
  // finalités de Processus), pas un simple champ texte.
  actionsCorrectives: ActionCorrective[] = [];
  nouvelleActionLibelle = '';
  nouvelleActionDateDebut = '';
  nouvelleActionDateFin = '';
  actionCorrectiveError: string | null = null;

  steps: FormStepDef[] = [
    { label: 'Informations générales' },
    { label: 'Préambule' },
    { label: 'Analyses et recommandations' },
    { label: 'Actions correctrices' },
    { label: 'Conclusion' }
  ];
  currentStep = 0;
  maxReachedStep = 0;

  private stepFields: string[][] = [
    ['codeUniteAdministrative', 'codeProcessus', 'dateEmission'],
    [],
    [],
    [],
    []
  ];

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportControleInterneService,
    private controleService: ControleSecondNiveauService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private processusService: ProcessusService,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;

    this.form = this.fb.group({
      codeUniteAdministrative: ['', Validators.required],
      codeProcessus: ['', Validators.required],
      dateEmission: [new Date().toISOString().split('T')[0], Validators.required],
      preambule: [''],
      conclusion: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.form.get('codeProcessus')?.disable();

    this.form.get('codeUniteAdministrative')?.valueChanges.subscribe(codeUnite => {
      this.lignes = [];
      if (codeUnite) {
        this.form.get('codeProcessus')?.enable({ emitEvent: false });
        this.loadProcessusByUnite(codeUnite);
      } else {
        this.form.get('codeProcessus')?.disable({ emitEvent: false });
        this.processus = [];
        this.form.patchValue({ codeProcessus: '' }, { emitEvent: false });
      }
    });

    this.form.get('codeProcessus')?.valueChanges.subscribe(codeProcessus => {
      const codeUnite = this.form.get('codeUniteAdministrative')?.value;
      if (codeProcessus && codeUnite) {
        this.loadLignes(codeUnite, codeProcessus);
      } else {
        this.lignes = [];
      }
    });

    this.loadReferenceData();
  }

  loadReferenceData(): void {
    this.loading = true;
    this.uniteAdministrativeService.getAll().subscribe({
      next: (data) => {
        this.unitesAdministratives = data;
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
    this.loadingProcessus = true;
    this.processusService.getAll().subscribe({
      next: (allProcessus) => setTimeout(() => {
        this.processus = allProcessus.filter(p => p.idUnite === codeUnite);
        this.loadingProcessus = false;
        this.cdr.detectChanges();
      }),
      error: (err) => {
        this.loadingProcessus = false;
        this.error = err?.message || 'Impossible de charger les processus';
        this.cdr.detectChanges();
      }
    });
  }

  loadLignes(codeUnite: string, codeProcessus: string): void {
    this.loadingLignes = true;
    this.controleService.getLignesDetaillees(codeUnite, codeProcessus).subscribe({
      next: (data) => {
        this.lignes = data;
        this.loadingLignes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingLignes = false;
        this.error = err?.message || 'Impossible de charger les constats des contrôles de second niveau';
        this.cdr.detectChanges();
      }
    });
  }

  get processusOptions(): SearchableSelectOption[] {
    return this.processus.map(p => ({ value: p.code, label: p.libelle }));
  }

  // ========== Étape Préambule : anomalies / faiblesses / constats reliés à leur source ==========

  get anomalies(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie === 'Anomalie' && l.constat);
  }

  get faiblesses(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie === 'Faiblesse' && l.constat);
  }

  get constatsAutres(): LigneControleResponse[] {
    return this.lignes.filter(l => l.categorie !== 'Anomalie' && l.categorie !== 'Faiblesse' && l.constat);
  }

  // ========== Étape Analyses et recommandations : reliées ligne par ligne ==========

  get lignesAnalysesRecommandations(): LigneControleResponse[] {
    return this.lignes.filter(l => l.analyse || l.recommandation);
  }

  sourceLigne(l: LigneControleResponse): string {
    return `${l.categorie} — ${l.codeControle} (${this.formatDate(l.dateControle)})`;
  }

  // ========== Étape Actions correctrices ==========

  ajouterActionCorrective(): void {
    const libelle = this.nouvelleActionLibelle.trim();

    if (!libelle) {
      this.actionCorrectiveError = 'Le libellé est obligatoire';
      return;
    }
    if (!this.nouvelleActionDateDebut || !this.nouvelleActionDateFin) {
      this.actionCorrectiveError = 'La date de début et la date de fin sont obligatoires';
      return;
    }
    if (this.nouvelleActionDateFin < this.nouvelleActionDateDebut) {
      this.actionCorrectiveError = 'La date de fin ne peut pas être antérieure à la date de début';
      return;
    }

    this.actionsCorrectives.push({
      libelle,
      dateDebut: this.nouvelleActionDateDebut,
      dateFin: this.nouvelleActionDateFin
    });

    this.nouvelleActionLibelle = '';
    this.nouvelleActionDateDebut = '';
    this.nouvelleActionDateFin = '';
    this.actionCorrectiveError = null;
    this.cdr.detectChanges();
  }

  supprimerActionCorrective(index: number): void {
    this.actionsCorrectives.splice(index, 1);
    this.cdr.detectChanges();
  }

  isStepValid(step: number): boolean {
    return this.stepFields[step].every(field => {
      const control = this.form.get(field);
      return !control || control.disabled || control.valid;
    });
  }

  goToStep(step: number): void {
    if (step <= this.maxReachedStep) this.currentStep = step;
  }

  nextStep(): void {
    this.stepFields[this.currentStep].forEach(field => this.form.get(field)?.markAsTouched());
    if (!this.isStepValid(this.currentStep)) return;

    this.currentStep++;
    if (this.currentStep > this.maxReachedStep) this.maxReachedStep = this.currentStep;
  }

  previousStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  onSubmit(): void {
    this.stepFields[0].forEach(field => this.form.get(field)?.markAsTouched());
    if (!this.isStepValid(0)) {
      this.currentStep = 0;
      this.maxReachedStep = Math.max(this.maxReachedStep, 0);
      return;
    }

    Swal.fire({
      title: 'Créer ce rapport de contrôle interne ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) this.save();
    });
  }

  private save(): void {
    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();
    const request: RapportControleInterneRequest = {
      codeUniteAdministrative: raw.codeUniteAdministrative,
      codeProcessus: raw.codeProcessus,
      dateEmission: raw.dateEmission,
      preambule: raw.preambule,
      actionsCorrectives: this.actionsCorrectives,
      conclusion: raw.conclusion
    };

    this.rapportService.create(request).subscribe({
      next: (created) => {
        this.loading = false;
        Swal.fire({
          title: 'Créé',
          text: 'Le rapport de contrôle interne a bien été créé.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/controle-interne/rapports', created.code]));
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de créer ce rapport';
        Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/controle-interne/rapports']);
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // ========== Dropdown UA ==========

  onUniteFocus(input: HTMLInputElement): void {
    const currentValue = this.form.get('codeUniteAdministrative')?.value;
    if (currentValue) {
      this.onUniteSearch({ target: { value: currentValue } } as any, input);
    } else {
      this.filteredUnites = this.unitesAdministratives;
      this.updateUniteDropdownPosition(input);
      this.showUniteDropdown = this.filteredUnites.length > 0;
      this.cdr.detectChanges();
    }
  }

  onUniteSearch(event: Event, input?: HTMLInputElement): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.updateUniteDropdownPosition(input ?? (event.target as HTMLInputElement));

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

  private updateUniteDropdownPosition(input: HTMLInputElement): void {
    const rect = input.getBoundingClientRect();
    this.uniteDropdownTop = rect.bottom + window.scrollY + 4;
    this.uniteDropdownLeft = rect.left + window.scrollX;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUniteDropdown = false;
    }
  }
}
