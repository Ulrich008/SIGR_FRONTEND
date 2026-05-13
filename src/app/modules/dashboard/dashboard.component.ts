import { Component, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { MenuItem } from '../../layout/sidebar/sidebar.component';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit {
  constructor(private router: Router) {}

  activeMenu: string = 'Tableau de bord';

  menuItems: MenuItem[] = [
    { icon: 'fas fa-th', label: 'Tableau de bord', path: '/dashboard' },
    { icon: 'fas fa-building', label: 'Structures', path: '/ministeres' },
    { icon: 'fas fa-columns', label: 'Sections' },
    { icon: 'fas fa-chart-line', label: 'Processus' },
    { icon: 'fas fa-exclamation-triangle', label: 'Risques' },
    { icon: 'fas fa-table', label: 'Matrice' },
    { icon: 'fas fa-chart-simple', label: 'Indicateurs' },
    { icon: 'fas fa-book', label: 'Bibliothèque' },
    { icon: 'fas fa-users', label: 'Utilisateurs' },
  ];


  barData = [
    { name: "Exéc.\nbudgétaire", value: 14, dark: true },
    { name: "Élabo.\nbudget", value: 9, dark: false },
    { name: "Dév.\napplis", value: 12, dark: true },
    { name: "Contrôle\ninterne", value: 6, dark: false },
    { name: "Gestion\nRH", value: 7, dark: false },
  ];

  activities = [
    { initials: "MD", bg: "#6b9e7a", label: "Nouveau risque ajouté", user: "Marie D.", time: "Il y a 2h" },
    { initials: "MD", bg: "#6b9e7a", label: "Évaluation complétée", user: "Marie D.", time: "Il y a 2h" },
    { initials: "AD", bg: "#4b7a5e", label: "Processus modifié", user: "Admin", time: "Hier" },
    { initials: "AD", bg: "#4b7a5e", label: "Rapport généré", user: "Admin", time: "Hier" },
  ];

  ngAfterViewInit(): void {
    // Ajouter un délai pour s'assurer que le DOM est complètement prêt
    setTimeout(() => this.initChart(), 100);
  }

  setActiveMenu(label: string): void {
    this.activeMenu = label;
  }

  initChart(): void {
    const ctx = document.getElementById('riskChart') as HTMLCanvasElement;
    
    if (!ctx) {
      console.warn('Canvas riskChart non trouvé');
      return;
    }

    try {
      new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.barData.map(item => item.name),
            datasets: [{
              data: this.barData.map(item => item.value),
              backgroundColor: this.barData.map(item => item.dark ? '#1a5c38' : '#7dba9a'),
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
              tooltip: {
                callbacks: {
                  label: (context) => `Valeur: ${context.raw}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 16,
                ticks: { stepSize: 4, font: { size: 11 } },
                grid: { display: false }
              },
              x: {
                ticks: {
                  font: { size: 10 },
                  callback: (val, index) => {
                    const lines = this.barData[index]?.name.split('\n') || [''];
                    return lines;
                  }
                },
                grid: { display: false }
              }
            }
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du graphique:', error);
      }
    }
  }