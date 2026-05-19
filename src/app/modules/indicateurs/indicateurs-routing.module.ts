import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndicateursListComponent } from './pages/indicateurs-list/indicateurs-list.component';
import { IndicateursFormComponent } from './pages/indicateurs-form/indicateurs-form.component';
import { IndicateursDetailComponent } from './pages/indicateurs-detail/indicateurs-detail.component';

const routes: Routes = [
  {
    path: '',
    component: IndicateursListComponent
  },
  {
    path: 'nouveau',
    component: IndicateursFormComponent
  },
  {
    path: ':code/edit',
    component: IndicateursFormComponent
  },
  {
    path: ':code',
    component: IndicateursDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndicateursRoutingModule {}
