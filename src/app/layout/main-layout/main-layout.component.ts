import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenu: string = '';
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() organizationName: string = 'Ministère de l\'Économie et des Finances';
  @Input() userInitials: string = 'AD';

  onMenuItemClicked(item: MenuItem): void {
    // La navigation est gérée dans le composant SidebarComponent
  }
}