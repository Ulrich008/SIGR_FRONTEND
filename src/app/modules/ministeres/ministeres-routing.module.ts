import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MinistereListComponent } from './pages/ministere-list/ministere-list.component';
import { MinistereFormComponent } from './pages/ministere-form/ministere-form.component';

const routes: Routes = [
  { path: '', component: MinistereListComponent },
  { path: 'nouveau', component: MinistereFormComponent },
  { path: ':id/edit', component: MinistereFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MinisteresRoutingModule {}
