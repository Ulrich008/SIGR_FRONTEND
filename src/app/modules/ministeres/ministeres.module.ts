import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MinisteresRoutingModule } from './ministeres-routing.module';
import { MinistereListComponent } from './pages/ministere-list/ministere-list.component';
import { MinistereFormComponent } from './pages/ministere-form/ministere-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MinisteresRoutingModule,
    MinistereListComponent,
    MinistereFormComponent
  ]
})
export class MinisteresModule {}
