import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { AgentService } from '../../../../core/services/agent.service';
import { ProcessusRequest, TypeProcessus } from '../../../../core/models/processus.model';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-processus-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './processus-form.component.html'
})
export class ProcessusFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  typeProcessusOptions = [
    { value: TypeProcessus.METIER,   label: 'Métier'   },
    { value: TypeProcessus.SUPPORT,  label: 'Support'  },
    { value: TypeProcessus.PILOTAGE, label: 'Pilotage' }
  ];
  unites: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  showUniteDropdown: boolean = false;
  agents:   AgentResponse[]             = [];
  managers: AgentResponse[]             = [];
  finalites: string[]                   = [];
  nouvelleFinalite: string              = '';
  finaliteError: string | null          = null; // erreur spécifique au champ finalité
  loadingUnites = false;
  loadingAgents = false;

  constructor(
    private fb: FormBuilder,
    private processusService: ProcessusService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private agentService: AgentService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      code:           [{ value: '', disabled: true }],
      libelle:        ['', [Validators.required, Validators.maxLength(200)]],
      typeProcessus:  ['', [Validators.required]],
      idUnite:        ['', [Validators.required]],
      idProprietaire: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const codeParam = this.route.snapshot.paramMap.get('code');

    if (codeParam) {
      this.isEditMode    = true;
      this.code          = codeParam;
      this.loadingUnites = true;
      this.loadingAgents = true;
      this.loading       = true;

      forkJoin({
        unites:    this.uniteAdministrativeService.getAll(),
        agents:    this.agentService.getAll(),
        processus: this.processusService.getByCode(codeParam)
      }).subscribe({
        next: ({ unites, agents, processus }) => {
          this.unites        = unites;
          this.agents        = agents;
          this.managers      = agents.filter(a => a.role === 'MANAGER');
          this.loadingUnites = false;
          this.loadingAgents = false;
          this.loading       = false;

          this.form.patchValue({
            code:           processus.code,
            libelle:        processus.libelle,
            typeProcessus:  processus.typeProcessus,
            idUnite:        processus.idUnite        || '',
            idProprietaire: processus.idProprietaire || ''
          });

          // Charger les finalités existantes
          if (processus.finalite) {
            this.finalites = processus.finalite.split(';').map(f => f.trim()).filter(f => f);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loadingUnites = false;
          this.loadingAgents = false;
          this.loading       = false;
          this.error         = err?.message || 'Impossible de charger les données';
          this.cdr.detectChanges();
        }
      });

    } else {
      this.loadUnites();
      this.loadAgents();
    }
  }

  private loadUnites(): void {
    this.loadingUnites = true;
    this.uniteAdministrativeService.getAll().subscribe({
      next: (unites) => {
        this.unites        = unites;
        this.loadingUnites = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingUnites = false;
        this.error         = err?.message || 'Impossible de charger les unités administratives';
        this.cdr.detectChanges();
      }
    });
  }

  private loadAgents(): void {
    this.loadingAgents = true;
    this.agentService.getAll().subscribe({
      next: (agents) => {
        this.agents        = agents;
        this.managers      = agents.filter(a => a.role === 'MANAGER');
        this.loadingAgents = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingAgents = false;
        this.error         = err?.message || 'Impossible de charger les agents';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Valider qu'au moins une finalité est ajoutée
    if (this.finalites.length === 0) {
      this.finaliteError = 'Au moins une finalité est requise';
      return;
    }

    this.loading       = true;
    this.error         = null;
    this.finaliteError = null;

    const raw = this.form.getRawValue();

    const request: ProcessusRequest = {
      code:           raw.code,
      libelle:        raw.libelle,
      finalite:       this.finalites.join('; '),
      typeProcessus:  raw.typeProcessus,
      idUnite:        raw.idUnite,
      idProprietaire: raw.idProprietaire || null
    };

    if (this.isEditMode && this.code) {
      this.processusService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'Le processus a bien été modifié.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/processus']));
        },
        error: (err) => {
          this.loading = false;
          this.error   = err?.message || 'Impossible de modifier le processus';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.processusService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'Le processus a bien été créé.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/processus']));
        },
        error: (err) => {
          this.loading = false;
          this.error   = err?.message || 'Impossible de créer le processus';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/processus']);
  }

  ajouterFinalite(): void {
    const trimmed = this.nouvelleFinalite.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length > 500) {
      this.finaliteError = 'Une finalité ne peut pas dépasser 500 caractères';
      return;
    }

    // Vérifier les doublons
    if (this.finalites.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      this.finaliteError = 'Cette finalité existe déjà';
      return;
    }

    this.finalites.push(trimmed);
    this.nouvelleFinalite = '';
    this.finaliteError    = null;
    this.error            = null;
    this.cdr.detectChanges();
  }

  supprimerFinalite(index: number): void {
    this.finalites.splice(index, 1);
    // Réafficher l'erreur si la liste devient vide
    if (this.finalites.length === 0) {
      this.finaliteError = 'Au moins une finalité est requise';
    }
    this.cdr.detectChanges();
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required'])  return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }

  onUniteSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    if (searchTerm.length === 0) {
      this.filteredUnites = [];
      this.showUniteDropdown = false;
      return;
    }

    this.filteredUnites = this.unites.filter(unite =>
      unite.code.toLowerCase().includes(searchTerm) ||
      unite.libelle.toLowerCase().includes(searchTerm)
    );

    this.showUniteDropdown = true;
    this.cdr.detectChanges();
  }

  onUniteBlur(): void {
    // Masquer la liste déroulante après un court délai
    setTimeout(() => {
      this.showUniteDropdown = false;
      this.cdr.detectChanges();
    }, 200);
  }

  selectUnite(unite: UniteAdministrativeResponse): void {
    this.form.patchValue({ idUnite: unite.code });
    this.showUniteDropdown = false;
    this.cdr.detectChanges();
  }
}