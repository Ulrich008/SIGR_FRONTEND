import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-page-header',
  imports: [CommonModule],
  template: `
    <div class="sticky top-0 z-20 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 shadow-lg">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <ng-content select="[icon]"></ng-content>
            </div>
            <p class="text-xs font-medium text-emerald-400 uppercase tracking-wider">{{ subtitle }}</p>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">{{ title }}</h1>
          <p *ngIf="description" class="text-slate-300 text-sm mt-1">{{ description }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [':host { display: block; }']
})
export class PageHeaderComponent {
  @Input() subtitle = '';
  @Input() title = '';
  @Input() description?: string;
}
