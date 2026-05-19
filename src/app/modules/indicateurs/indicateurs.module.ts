import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IndicateursRoutingModule } from './indicateurs-routing.module';
import { IndicateursListComponent } from './pages/indicateurs-list/indicateurs-list.component';
import { IndicateursFormComponent } from './pages/indicateurs-form/indicateurs-form.component';
import { IndicateursDetailComponent } from './pages/indicateurs-detail/indicateurs-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IndicateursRoutingModule,
    IndicateursListComponent,
    IndicateursFormComponent,
    IndicateursDetailComponent
  ]
})
export class IndicateursModule {}
