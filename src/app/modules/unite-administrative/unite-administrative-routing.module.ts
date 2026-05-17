import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UniteAdministrativeListComponent } from './pages/unite-administrative-list/unite-administrative-list.component';
import { UniteAdministrativeFormComponent } from './pages/unite-administrative-form/unite-administrative-form.component';

const routes: Routes = [
  {
    path: '',
    component: UniteAdministrativeListComponent
  },
  {
    path: 'nouveau',
    component: UniteAdministrativeFormComponent
  },
  {
    path: ':code/edit',
    component: UniteAdministrativeFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniteAdministrativeRoutingModule {}
