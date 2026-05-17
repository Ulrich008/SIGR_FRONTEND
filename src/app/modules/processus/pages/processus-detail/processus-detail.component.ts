import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '../../../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../../../layout/sidebar/sidebar.component';
import { MenuService } from '../../../../core/services/menu.service';
import { ProcessusService } from '../../../../core/services/processus.service';
import { ProcessusResponse, TypeProcessus } from '../../../../core/models/processus.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-processus-detail',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './processus-detail.component.html'
})
export class ProcessusDetailComponent implements OnInit {
  processus: ProcessusResponse | null = null;
  loading = false;
  error: string | null = null;
  menuItems: MenuItem[];

  constructor(
    private processusService: ProcessusService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems = this.menuService.items;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadProcessus();
  }

  loadProcessus(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/processus']);
      return;
    }

    this.loading = true;
    this.error = null;
    this.processusService.getByCode(code).subscribe({
      next: (processus) => {
        this.processus = processus;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Impossible de charger le processus';
        this.cdr.detectChanges();
      }
    });
  }

  editProcessus(): void {
    if (this.processus) {
      this.router.navigate(['/processus', this.processus.code, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/processus']);
  }

  getTypeProcessusBadgeClass(type: TypeProcessus): string {
    switch (type) {
      case TypeProcessus.METIER: return 'bg-blue-100 text-blue-700';
      case TypeProcessus.SUPPORT: return 'bg-purple-100 text-purple-700';
      case TypeProcessus.PILOTAGE: return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeProcessusLabel(type: TypeProcessus): string {
    switch (type) {
      case TypeProcessus.METIER: return 'Métier';
      case TypeProcessus.SUPPORT: return 'Support';
      case TypeProcessus.PILOTAGE: return 'Pilotage';
      default: return type;
    }
  }
}
