import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatricesRoutingModule } from './matrices-routing.module';
import { MatricesListComponent } from './pages/matrices-list/matrices-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatricesRoutingModule,
    MatricesListComponent
  ]
})
export class MatricesModule {}
