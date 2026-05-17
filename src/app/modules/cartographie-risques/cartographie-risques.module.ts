import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartographieRisquesRoutingModule } from './cartographie-risques-routing.module';
import { CartographieRisquesListComponent } from './pages/cartographie-risques-list/cartographie-risques-list.component';
import { CartographieRisquesFormComponent } from './pages/cartographie-risques-form/cartographie-risques-form.component';
import { CartographieRisquesDetailComponent } from './pages/cartographie-risques-detail/cartographie-risques-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CartographieRisquesRoutingModule,
    CartographieRisquesListComponent,
    CartographieRisquesFormComponent,
    CartographieRisquesDetailComponent
  ]
})
export class CartographieRisquesModule {}
