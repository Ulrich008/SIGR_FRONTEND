import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertesListComponent } from './pages/alertes-list/alertes-list.component';
import { AlertesDetailComponent } from './pages/alertes-detail/alertes-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AlertesListComponent
  },
  {
    path: ':id',
    component: AlertesDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertesRoutingModule { }
