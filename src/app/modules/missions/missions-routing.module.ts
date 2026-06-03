import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MissionsListComponent } from './pages/missions-list/missions-list.component';
import { MissionsFormComponent } from './pages/missions-form/missions-form.component';

const routes: Routes = [
  {
    path: '',
    component: MissionsListComponent
  },
  {
    path: 'nouveau',
    component: MissionsFormComponent
  },
  {
    path: ':code/edit',
    component: MissionsFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule { }
