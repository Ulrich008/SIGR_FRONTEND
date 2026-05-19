import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionsListComponent } from './pages/actions-list/actions-list.component';
import { ActionsFormComponent } from './pages/actions-form/actions-form.component';
import { ActionsDetailComponent } from './pages/actions-detail/actions-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ActionsListComponent
  },
  {
    path: 'nouveau',
    component: ActionsFormComponent
  },
  {
    path: ':code/edit',
    component: ActionsFormComponent
  },
  {
    path: ':code',
    component: ActionsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionsRoutingModule {}
