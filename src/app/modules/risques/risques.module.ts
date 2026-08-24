import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RisquesRoutingModule } from './risques-routing.module';
import { RisquesListComponent } from './pages/risques-list/risques-list.component';
import { RisquesFormComponent } from './pages/risques-form/risques-form.component';
import { RisquesDetailComponent } from './pages/risques-detail/risques-detail.component';
import { RisquesHistoriqueEvolutionComponent } from './pages/risques-historique-evolution/risques-historique-evolution.component';
import { RisquesHistoriqueAvisComponent } from './pages/risques-historique-avis/risques-historique-avis.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RisquesRoutingModule,
    RisquesListComponent,
    RisquesFormComponent,
    RisquesDetailComponent,
    RisquesHistoriqueEvolutionComponent,
    RisquesHistoriqueAvisComponent
  ]
})
export class RisquesModule {}
