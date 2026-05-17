import { Component, AfterViewInit, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import { MenuService } from '../../core/services/menu.service'; // ← ajout
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit {
  private isBrowser: boolean;

  activeMenu = 'Tableau de bord';
  menuItems: MenuItem[];  // ← plus de liste en dur

  barData = [
    { name: "Exéc.\nbudgétaire", value: 14, dark: true },
    { name: "Élabo.\nbudget",    value: 9,  dark: false },
    { name: "Dév.\napplis",      value: 12, dark: true },
    { name: "Contrôle\ninterne", value: 6,  dark: false },
    { name: "Gestion\nRH",       value: 7,  dark: false },
  ];

  activities = [
    { initials: "MD", bg: "#6b9e7a", label: "Nouveau risque ajouté",  user: "Marie D.", time: "Il y a 2h" },
    { initials: "MD", bg: "#6b9e7a", label: "Évaluation complétée",   user: "Marie D.", time: "Il y a 2h" },
    { initials: "AD", bg: "#4b7a5e", label: "Processus modifié",       user: "Admin",    time: "Hier" },
    { initials: "AD", bg: "#4b7a5e", label: "Rapport généré",          user: "Admin",    time: "Hier" },
  ];

  constructor(
    private router: Router,
    private menuService: MenuService,           // ← ajout
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.menuItems = this.menuService.items;    // ← ajout
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    setTimeout(() => this.initChart(), 100);
  }

  setActiveMenu(label: string): void {
    this.activeMenu = label;
  }

  initChart(): void {
    const ctx = document.getElementById('riskChart') as HTMLCanvasElement;
    if (!ctx) { console.warn('Canvas riskChart non trouvé'); return; }
    try {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.barData.map(i => i.name),
          datasets: [{
            data: this.barData.map(i => i.value),
            backgroundColor: this.barData.map(i => i.dark ? '#1a5c38' : '#7dba9a'),
            borderRadius: 3,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => `Valeur: ${c.raw}` } }
          },
          scales: {
            y: { beginAtZero: true, max: 16, ticks: { stepSize: 4, font: { size: 11 } }, grid: { display: false } },
            x: {
              ticks: {
                font: { size: 10 },
                callback: (_, index) => this.barData[index]?.name.split('\n') || ['']
              },
              grid: { display: false }
            }
          }
        }
      });
    } catch (e) { console.error('Erreur graphique:', e); }
  }
}