import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EvaluationsRoutingModule } from './evaluations-routing.module';
import { EvaluationsListComponent } from './pages/evaluations-list/evaluations-list.component';
import { EvaluationsFormComponent } from './pages/evaluations-form/evaluations-form.component';
import { EvaluationsDetailComponent } from './pages/evaluations-detail/evaluations-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    EvaluationsRoutingModule,
    EvaluationsListComponent,
    EvaluationsFormComponent,
    EvaluationsDetailComponent
  ]
})
export class EvaluationsModule {}
