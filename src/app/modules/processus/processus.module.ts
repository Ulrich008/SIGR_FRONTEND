import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProcessusRoutingModule } from './processus-routing.module';
import { ProcessusListComponent } from './pages/processus-list/processus-list.component';
import { ProcessusFormComponent } from './pages/processus-form/processus-form.component';
import { ProcessusDetailComponent } from './pages/processus-detail/processus-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProcessusRoutingModule,
    ProcessusListComponent,
    ProcessusFormComponent,
    ProcessusDetailComponent
  ]
})
export class ProcessusModule {}
