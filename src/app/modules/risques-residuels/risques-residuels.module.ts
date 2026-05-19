import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RisquesResiduelsRoutingModule } from './risques-residuels-routing.module';
import { RisquesResiduelsListComponent } from './pages/risques-residuels-list/risques-residuels-list.component';
import { RisquesResiduelsFormComponent } from './pages/risques-residuels-form/risques-residuels-form.component';
import { RisquesResiduelsDetailComponent } from './pages/risques-residuels-detail/risques-residuels-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RisquesResiduelsRoutingModule,
    RisquesResiduelsListComponent,
    RisquesResiduelsFormComponent,
    RisquesResiduelsDetailComponent
  ]
})
export class RisquesResiduelsModule {}
