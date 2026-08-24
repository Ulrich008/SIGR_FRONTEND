import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AgentService } from '../../core/services/agent.service';

export interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  expanded?: boolean;
  roles?: string[];
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenu: string = '';

  @Output() menuItemClicked = new EventEmitter<MenuItem>();
  @Output() sidebarStateChanged = new EventEmitter<boolean>();

  isMobileMenuOpen = false;
  isHovered = false;
  isLgScreen = false;

  // Mode "réduit" (icônes seules) sur desktop, activable via le bouton
  // de la sidebar. Un survol pendant que le menu est réduit le déplie
  // temporairement ("peek"), sans changer l'état épinglé.
  isCollapsed = false;

  // Rempli via GET /api/agents/me : reflète l'agent réellement connecté.
  nomComplet = '';
  initiales = '';
  libelleRole = '';

  constructor(
    private authService: AuthService,
    private agentService: AgentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkScreenSize();

    this.agentService.getMe().subscribe({
      next: (agent) => {
        this.nomComplet = `${agent.prenoms} ${agent.nom}`;
        this.initiales = `${agent.prenoms.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase();
        this.libelleRole = agent.libelleProfil || this.libelleDuRole(agent.role);
      },
      error: (err) => {
        console.error('Erreur chargement du profil connecté (/me)', err);
        // Ne jamais rester bloqué sur "Chargement..." : on retombe sur les
        // informations déjà stockées localement lors de la connexion.
        const currentUser = this.authService.getCurrentUser();
        this.nomComplet = currentUser ? `${currentUser.prenoms} ${currentUser.nom}` : 'Utilisateur';
        this.initiales = currentUser
          ? `${currentUser.prenoms.charAt(0)}${currentUser.nom.charAt(0)}`.toUpperCase()
          : '?';
        this.libelleRole = currentUser?.libelleProfil || this.libelleDuRole(currentUser?.role);
      }
    });
  }

  private libelleDuRole(role?: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super administrateur';
      case 'ADMIN': return 'Administrateur';
      default: return 'Agent';
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 1024;
    if (this.isLgScreen) {
      this.isMobileMenuOpen = false;
    }
  }

  get showLabels(): boolean {
    if (this.isLgScreen) return !this.isCollapsed || this.isHovered;
    return this.isMobileMenuOpen;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarStateChanged.emit(!this.isCollapsed);
  }

  ouvrirMonProfil(): void {
    this.router.navigate(['/me']);
  }

  isMenuItemEnabled(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasAnyRole(item.roles);
  }

  /**
   * Menu filtré : les entrées non autorisées sont complètement masquées
   * (au lieu d'être affichées grisées), et un groupe dont tous les
   * enfants sont masqués disparaît lui aussi. Renvoie les objets MenuItem
   * d'origine (pas de copie) pour que la mutation de `item.expanded`
   * (dépli/repli d'un sous-menu) continue de fonctionner normalement.
   */
  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.isMenuItemEnabled(item) && this.hasVisibleContent(item));
  }

  visibleChildren(item: MenuItem): MenuItem[] {
    if (!item.children) return [];
    return item.children.filter(child => this.isMenuItemEnabled(child) && this.hasVisibleContent(child));
  }

  private hasVisibleContent(item: MenuItem): boolean {
    if (!item.children) return true;
    return item.children.some(child => this.isMenuItemEnabled(child) && this.hasVisibleContent(child));
  }

  /**
   * routerLinkActive avec { exact: false } active un lien dès que l'URL
   * courante commence par son chemin — donc quand deux entrées d'un même
   * sous-menu ont un chemin l'un préfixe de l'autre (ex: /suivi-risques et
   * /suivi-risques/recommandations-ci), les deux s'allument en même temps.
   * On ne garde actif que le chemin le plus spécifique parmi les frères.
   */
  isActivePath(path: string | undefined, siblings: MenuItem[]): boolean {
    if (!path) return false;
    const url = this.router.url.split('?')[0].split('#')[0];
    const matches = (p: string) => url === p || url.startsWith(p + '/');
    if (!matches(path)) return false;
    return !siblings.some(s => s.path && s.path !== path && s.path.length > path.length && matches(s.path));
  }

  onMenuItemClick(item: MenuItem): void {
    if (!this.isMenuItemEnabled(item)) return;
    
    if (item.children) {
      item.expanded = !item.expanded;
    } else {
      this.menuItemClicked.emit(item);
      if (!this.isLgScreen) {
        this.closeMobileMenu();
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onMouseEnter(): void {
    if (!this.isLgScreen) return;
    this.isHovered = true;
    this.sidebarStateChanged.emit(true);
  }

  onMouseLeave(): void {
    this.isHovered = false;
    this.sidebarStateChanged.emit(false);
  }

  getSidebarClasses(): string {
    if (this.isLgScreen) {
      return this.isCollapsed && !this.isHovered
        ? 'sticky top-0 h-screen w-[76px]'
        : 'sticky top-0 h-screen w-64';
    } else {
      return this.isMobileMenuOpen
        ? 'fixed top-0 left-0 h-full w-64'
        : 'fixed top-0 left-0 h-full w-0 overflow-hidden border-0 shadow-none';
    }
  }
}