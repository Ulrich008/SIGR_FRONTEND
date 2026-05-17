import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenu: string = '';

  @Output() menuItemClicked = new EventEmitter<MenuItem>();
  @Output() sidebarStateChanged = new EventEmitter<boolean>();

  isMobileMenuOpen = false;
  isHovered = false;
  isLgScreen = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 1024;
    if (this.isLgScreen) {
      this.isMobileMenuOpen = false;
    }
  }

  get showLabels(): boolean {
    if (this.isLgScreen) return true;
    return this.isMobileMenuOpen;
  }

  onMenuItemClick(item: MenuItem): void {
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
      return 'sticky top-0 h-screen w-64';
    } else {
      return this.isMobileMenuOpen
        ? 'fixed top-0 left-0 h-full w-64'
        : 'fixed top-0 left-0 h-full w-0 overflow-hidden border-0 shadow-none';
    }
  }
}