import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitesMesureListComponent } from './pages/unites-mesure-list/unites-mesure-list.component';
import { UnitesMesureFormComponent } from './pages/unites-mesure-form/unites-mesure-form.component';

const routes: Routes = [
  {
    path: '',
    component: UnitesMesureListComponent
  },
  {
    path: 'nouveau',
    component: UnitesMesureFormComponent
  },
  {
    path: ':id/edit',
    component: UnitesMesureFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitesMesureRoutingModule { }
