import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvaluationsListComponent } from './pages/evaluations-list/evaluations-list.component';
import { EvaluationsFormComponent } from './pages/evaluations-form/evaluations-form.component';
import { EvaluationsDetailComponent } from './pages/evaluations-detail/evaluations-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EvaluationsListComponent
  },
  {
    path: 'nouveau',
    component: EvaluationsFormComponent
  },
  {
    path: ':code/edit',
    component: EvaluationsFormComponent
  },
  {
    path: ':code',
    component: EvaluationsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationsRoutingModule {}
