import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlansMitigationListComponent } from './pages/plans-mitigation-list/plans-mitigation-list.component';
import { PlansMitigationFormComponent } from './pages/plans-mitigation-form/plans-mitigation-form.component';
import { PlansMitigationDetailComponent } from './pages/plans-mitigation-detail/plans-mitigation-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PlansMitigationListComponent
  },
  {
    path: 'nouveau',
    component: PlansMitigationFormComponent
  },
  {
    path: ':code/edit',
    component: PlansMitigationFormComponent
  },
  {
    path: ':code',
    component: PlansMitigationDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlansMitigationRoutingModule {}
