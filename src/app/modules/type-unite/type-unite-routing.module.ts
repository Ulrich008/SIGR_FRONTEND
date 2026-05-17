import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TypeUniteListComponent } from './pages/type-unite-list/type-unite-list.component';
import { TypeUniteFormComponent } from './pages/type-unite-form/type-unite-form.component';

const routes: Routes = [
  {
    path: '',
    component: TypeUniteListComponent
  },
  {
    path: 'nouveau',
    component: TypeUniteFormComponent
  },
  {
    path: ':code/edit',
    component: TypeUniteFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TypeUniteRoutingModule {}
