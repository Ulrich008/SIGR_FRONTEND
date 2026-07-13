import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service';
import { AgentService } from '../../core/services/agent.service';
import { AgentResponse } from '../../core/models/agent.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-me',
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './me.component.html'
})
export class MeComponent implements OnInit {
  menuItems: MenuItem[];
  agent: AgentResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router,
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
    this.loading = true;
    this.agentService.getMe().subscribe({
      next: (agent) => {
        this.agent = agent;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger votre profil';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get initiales(): string {
    if (!this.agent) return '';
    return `${this.agent.prenoms.charAt(0)}${this.agent.nom.charAt(0)}`.toUpperCase();
  }

  get libelleRole(): string {
    if (!this.agent) return '';
    switch (this.agent.role) {
      case 'SUPER_ADMIN': return 'Super administrateur';
      case 'ADMIN': return 'Administrateur';
      default: return 'Agent';
    }
  }
}
