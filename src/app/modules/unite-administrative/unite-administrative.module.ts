import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UniteAdministrativeRoutingModule } from './unite-administrative-routing.module';
import { UniteAdministrativeListComponent } from './pages/unite-administrative-list/unite-administrative-list.component';
import { UniteAdministrativeFormComponent } from './pages/unite-administrative-form/unite-administrative-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    UniteAdministrativeRoutingModule,
    UniteAdministrativeListComponent,
    UniteAdministrativeFormComponent
  ]
})
export class UniteAdministrativeModule {}
