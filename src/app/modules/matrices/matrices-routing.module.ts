import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatricesListComponent } from './pages/matrices-list/matrices-list.component';

const routes: Routes = [
  {
    path: '',
    component: MatricesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatricesRoutingModule {}
