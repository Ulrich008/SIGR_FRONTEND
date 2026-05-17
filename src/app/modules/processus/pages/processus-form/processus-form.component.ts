import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
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
  agents:   AgentResponse[]             = [];
  managers: AgentResponse[]             = []; // ← liste filtrée pour le select
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
      finalite:       ['', [Validators.maxLength(1000)]],
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
          this.managers      = agents.filter(a => a.role === 'MANAGER'); // ← filtre
          this.loadingUnites = false;
          this.loadingAgents = false;
          this.loading       = false;

          this.form.patchValue({
            code:           processus.code,
            libelle:        processus.libelle,
            finalite:       processus.finalite       || '',
            typeProcessus:  processus.typeProcessus,
            idUnite:        processus.idUnite        || '',
            idProprietaire: processus.idProprietaire || ''
          });

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
        this.managers      = agents.filter(a => a.role === 'MANAGER'); // ← filtre
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

    this.loading = true;
    this.error   = null;

    const raw = this.form.getRawValue();

    const request: ProcessusRequest = {
      code:           raw.code,
      libelle:        raw.libelle,
      finalite:       raw.finalite      || null,
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

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required'])  return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }
}