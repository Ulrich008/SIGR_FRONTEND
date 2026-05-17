import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessusListComponent } from './pages/processus-list/processus-list.component';
import { ProcessusFormComponent } from './pages/processus-form/processus-form.component';
import { ProcessusDetailComponent } from './pages/processus-detail/processus-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessusListComponent
  },
  {
    path: 'nouveau',
    component: ProcessusFormComponent
  },
  {
    path: ':code/edit',
    component: ProcessusFormComponent
  },
  {
    path: ':code',
    component: ProcessusDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessusRoutingModule {}
