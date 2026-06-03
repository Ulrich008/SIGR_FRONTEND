import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { MissionService } from '../../../../core/services/mission.service';
import { MissionRequest, MissionResponse } from '../../../../core/models/mission.model';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ProcessusResponse } from '../../../../core/models/processus.model';
import { AgentService } from '../../../../core/services/agent.service';
import { AgentResponse } from '../../../../core/models/agent.model';
import { AuthService } from '../../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-missions-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent],
  templateUrl: './missions-form.component.html'
})
export class MissionsFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];
  processus: ProcessusResponse[] = [];
  agents: AgentResponse[] = [];
  loadingProcessus = false;
  loadingAgents = false;

  constructor(
    private fb: FormBuilder,
    private missionService: MissionService,
    private processusService: ProcessusService,
    private agentService: AgentService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    this.form = this.fb.group({
      libelle: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      codeProcessus: ['', [Validators.required]],
      dateDebut: [''],
      dateFin: [''],
      statut: ['ACTIF'],
      codeResponsable: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadReferenceData();

    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.isEditMode = true;
      this.code = codeParam;
      this.loading = true;
      this.missionService.getByCode(codeParam).subscribe({
        next: (mission) => {
          this.patchForm(mission);
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
  }

  loadReferenceData(): void {
    this.loadingProcessus = true;
    this.loadingAgents = true;

    forkJoin({
      processus: this.processusService.getAll(),
      agents: this.agentService.getAll()
    }).subscribe({
      next: (data) => {
        this.processus = data.processus;
        this.agents = data.agents;
        this.loadingProcessus = false;
        this.loadingAgents = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingProcessus = false;
        this.loadingAgents = false;
        this.error = err?.message || 'Impossible de charger les données de référence';
        this.cdr.detectChanges();
      }
    });
  }

  patchForm(mission: MissionResponse): void {
    this.form.patchValue({
      libelle: mission.libelle,
      description: mission.description,
      codeProcessus: mission.codeProcessus,
      dateDebut: this.formatDateForInput(mission.dateDebut),
      dateFin: this.formatDateForInput(mission.dateFin),
      statut: mission.statut,
      codeResponsable: mission.codeResponsable
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
    const request: MissionRequest = {
      libelle: raw.libelle,
      description: raw.description,
      codeProcessus: raw.codeProcessus,
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      statut: raw.statut,
      codeResponsable: raw.codeResponsable
    };

    if (this.isEditMode && this.code) {
      this.missionService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifié',
            text: 'La mission a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/missions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier la mission';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.missionService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créé',
            text: 'La mission a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/missions']));
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer la mission';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/missions']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Champ invalide';
  }

  private formatDateForInput(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
}
