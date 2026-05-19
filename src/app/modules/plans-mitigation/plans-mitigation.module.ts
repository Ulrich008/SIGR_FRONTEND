import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlansMitigationRoutingModule } from './plans-mitigation-routing.module';
import { PlansMitigationListComponent } from './pages/plans-mitigation-list/plans-mitigation-list.component';
import { PlansMitigationFormComponent } from './pages/plans-mitigation-form/plans-mitigation-form.component';
import { PlansMitigationDetailComponent } from './pages/plans-mitigation-detail/plans-mitigation-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PlansMitigationRoutingModule,
    PlansMitigationListComponent,
    PlansMitigationFormComponent,
    PlansMitigationDetailComponent
  ]
})
export class PlansMitigationModule {}
