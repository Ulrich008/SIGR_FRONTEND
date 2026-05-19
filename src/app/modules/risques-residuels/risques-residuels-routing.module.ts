import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RisquesResiduelsListComponent } from './pages/risques-residuels-list/risques-residuels-list.component';
import { RisquesResiduelsFormComponent } from './pages/risques-residuels-form/risques-residuels-form.component';
import { RisquesResiduelsDetailComponent } from './pages/risques-residuels-detail/risques-residuels-detail.component';

const routes: Routes = [
  {
    path: '',
    component: RisquesResiduelsListComponent
  },
  {
    path: 'nouveau',
    component: RisquesResiduelsFormComponent
  },
  {
    path: ':code/edit',
    component: RisquesResiduelsFormComponent
  },
  {
    path: ':code',
    component: RisquesResiduelsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RisquesResiduelsRoutingModule {}
