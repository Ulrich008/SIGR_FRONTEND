import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AffectationListComponent } from './pages/affectation-list/affectation-list.component';
import { AffectationFormComponent } from './pages/affectation-form/affectation-form.component';

const routes: Routes = [
  {
    path: '',
    component: AffectationListComponent
  },
  {
    path: 'nouveau',
    component: AffectationFormComponent
  },
  {
    path: ':code/edit',
    component: AffectationFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AffectationsRoutingModule {}
