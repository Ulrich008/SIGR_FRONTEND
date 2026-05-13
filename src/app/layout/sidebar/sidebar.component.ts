import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  path?: string;
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

  constructor(private router: Router) {}

  onMenuItemClick(item: MenuItem): void {
    this.menuItemClicked.emit(item);
    if (item.path) {
      this.router.navigateByUrl(item.path);
    }
  }
}