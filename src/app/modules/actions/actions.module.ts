import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActionsRoutingModule } from './actions-routing.module';
import { ActionsListComponent } from './pages/actions-list/actions-list.component';
import { ActionsFormComponent } from './pages/actions-form/actions-form.component';
import { ActionsDetailComponent } from './pages/actions-detail/actions-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ActionsRoutingModule,
    ActionsListComponent,
    ActionsFormComponent,
    ActionsDetailComponent
  ]
})
export class ActionsModule {}
