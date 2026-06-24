import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertesListComponent } from './pages/alertes-list/alertes-list.component';

const routes: Routes = [
  {
    path: '',
    component: AlertesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertesRoutingModule { }
