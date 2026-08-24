import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SigrSwal as Swal } from '../../../../core/utils/sigr-swal';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { DatePickerComponent } from '../../../../shared/date-picker/date-picker.component';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { AffectationService } from '../../../../core/services/affectation.service';
import { AffectationRequest, AffectationResponse } from '../../../../core/models/affectation.model';
import { AgentService } from '../../../../core/services/agent.service';
import { AgentResponse } from '../../../../core/models/agent.model';
import { UniteAdministrativeService } from '../../../../core/services/unite-administrative.service';
import { UniteAdministrativeResponse } from '../../../../core/models/unite-administrative.model';
import { AuthService } from '../../../../core/services/auth.service';
import { affectationSchema } from './affectation-form.schema';
import { applyZodValidation, isRequired, zodError } from '../../../../core/validation/zod-form.util';

@Component({
  standalone: true,
  selector: 'app-affectation-form',
  imports: [CommonModule, ReactiveFormsModule, MainLayoutComponent, DatePickerComponent, PageHeaderComponent],
  templateUrl: './affectation-form.component.html'
})
export class AffectationFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  code?: string;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  agents: AgentResponse[] = [];
  filteredAgents: AgentResponse[] = [];
  showAgentDropdown = false;

  unitesAdministratives: UniteAdministrativeResponse[] = [];
  filteredUnites: UniteAdministrativeResponse[] = [];
  showUniteDropdown = false;

  constructor(
    private fb: FormBuilder,
    private affectationService: AffectationService,
    private agentService: AgentService,
    private uniteAdministrativeService: UniteAdministrativeService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
    const agentsItem = this.menuItems.find(item => item.label === 'Agents');
    if (agentsItem) {
      agentsItem.expanded = true;
    }
    this.form = this.fb.group({
      code:                [''],
      matriculeAgent:      [''],
      codeUnite:           [''],
      poste:               [''],
      dateAffectation:     [''],
      dateFinAffectation:  ['']
    });

    this.form.valueChanges.subscribe(() =>
      applyZodValidation(this.form, affectationSchema, this.form.getRawValue())
    );
  }

  isRequired(field: string): boolean {
    return isRequired(affectationSchema, field);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.agentService.getAll().subscribe({
      next: (agents) => { this.agents = agents; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.uniteAdministrativeService.getAll().subscribe({
      next: (unites) => { this.unitesAdministratives = unites; this.cdr.detectChanges(); },
      error: () => {}
    });

    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.isEditMode = true;
      this.code = codeParam;
      this.loadAffectation(codeParam);
    }
  }

  loadAffectation(code: string): void {
    this.loading = true;
    this.affectationService.getByCode(code).subscribe({
      next: (affectation) => {
        this.form.patchValue({
          code:               affectation.code,
          matriculeAgent:     affectation.matriculeAgent,
          codeUnite:          affectation.codeUnite,
          poste:              affectation.poste,
          dateAffectation:    affectation.dateAffectation,
          dateFinAffectation: affectation.dateFinAffectation || ''
        });

        // Désactiver les champs non modifiables en mode édition
        this.form.get('code')?.disable();
        this.form.get('matriculeAgent')?.disable();
        this.form.get('codeUnite')?.disable();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger l\'affectation';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    const valid = applyZodValidation(this.form, affectationSchema, this.form.getRawValue());
    if (!valid) {
      this.form.markAllAsTouched();
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Enregistrer les modifications ?' : 'Créer cette affectation ?',
      text: this.isEditMode ? 'Voulez-vous enregistrer les modifications de cette affectation ?' : 'Voulez-vous créer cette affectation ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.isEditMode ? 'Oui, enregistrer' : 'Oui, créer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.saveAffectation();
      }
    });
  }

  private saveAffectation(): void {
    this.loading = true;
    this.error = null;

    // getRawValue() inclut les champs disabled (code, matriculeAgent, codeUnite)
    const request: AffectationRequest = this.form.getRawValue();

    if (this.isEditMode && this.code) {
      this.affectationService.update(this.code, request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Modifiée',
            text: 'L\'affectation a bien été modifiée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/agents/affectations']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de modifier l\'affectation';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.affectationService.create(request).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Créée',
            text: 'L\'affectation a bien été créée.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/agents/affectations']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Impossible de créer l\'affectation';
          Swal.fire({ title: 'Erreur', text: this.error ?? undefined, icon: 'error', confirmButtonText: 'OK' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/agents/affectations']);
  }

  getFieldError(fieldName: string): string {
    return zodError(this.form, fieldName);
  }

  // ================= RECHERCHE DYNAMIQUE : AGENT =================

  onAgentFocus(): void {
    const currentValue = this.form.get('matriculeAgent')?.value;
    if (currentValue) {
      this.onAgentSearch({ target: { value: currentValue } } as any);
    } else {
      this.filteredAgents = this.agents;
      this.showAgentDropdown = this.filteredAgents.length > 0;
      this.cdr.detectChanges();
    }
  }

  onAgentSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (!searchTerm) {
      this.filteredAgents = this.agents;
      this.showAgentDropdown = this.filteredAgents.length > 0;
      this.cdr.detectChanges();
      return;
    }

    this.filteredAgents = this.agents.filter(agent =>
      agent.matricule.toLowerCase().includes(searchTerm) ||
      agent.nom.toLowerCase().includes(searchTerm) ||
      agent.prenoms.toLowerCase().includes(searchTerm)
    );

    this.showAgentDropdown = this.filteredAgents.length > 0;
    this.cdr.detectChanges();
  }

  selectAgent(agent: AgentResponse): void {
    this.form.patchValue({ matriculeAgent: agent.matricule });
    this.showAgentDropdown = false;
    this.filteredAgents = [];
  }

  // ================= RECHERCHE DYNAMIQUE : UNITÉ ADMINISTRATIVE =================

  onUniteFocus(): void {
    const currentValue = this.form.get('codeUnite')?.value;
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
    this.form.patchValue({ codeUnite: unite.code });
    this.showUniteDropdown = false;
    this.filteredUnites = [];
  }

  getDropdownTop(input: HTMLInputElement): number {
    const rect = input.getBoundingClientRect();
    return rect.bottom + window.scrollY + 4;
  }

  getDropdownLeft(input: HTMLInputElement): number {
    const rect = input.getBoundingClientRect();
    return rect.left + window.scrollX;
  }

  // Fermer les dropdowns si on clique ailleurs
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showAgentDropdown = false;
      this.showUniteDropdown = false;
    }
  }
}