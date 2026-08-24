import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RisquesListComponent } from './pages/risques-list/risques-list.component';
import { RisquesFormComponent } from './pages/risques-form/risques-form.component';
import { RisquesDetailComponent } from './pages/risques-detail/risques-detail.component';
import { RisquesHistoriqueEvolutionComponent } from './pages/risques-historique-evolution/risques-historique-evolution.component';
import { RisquesHistoriqueAvisComponent } from './pages/risques-historique-avis/risques-historique-avis.component';

const routes: Routes = [
  {
    path: '',
    component: RisquesListComponent
  },
  {
    path: 'nouveau',
    component: RisquesFormComponent
  },
  {
    path: ':code/edit',
    component: RisquesFormComponent
  },
  {
    path: ':code/historique-evolution',
    component: RisquesHistoriqueEvolutionComponent
  },
  {
    path: ':code/historique-avis',
    component: RisquesHistoriqueAvisComponent
  },
  {
    path: ':code',
    component: RisquesDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RisquesRoutingModule {}
