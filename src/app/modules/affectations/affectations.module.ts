import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AffectationsRoutingModule } from './affectations-routing.module';
import { AffectationListComponent } from './pages/affectation-list/affectation-list.component';
import { AffectationFormComponent } from './pages/affectation-form/affectation-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AffectationsRoutingModule,
    AffectationListComponent,
    AffectationFormComponent
  ]
})
export class AffectationsModule {}
