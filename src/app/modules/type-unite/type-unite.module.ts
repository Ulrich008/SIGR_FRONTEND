import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TypeUniteRoutingModule } from './type-unite-routing.module';
import { TypeUniteListComponent } from './pages/type-unite-list/type-unite-list.component';
import { TypeUniteFormComponent } from './pages/type-unite-form/type-unite-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TypeUniteRoutingModule,
    TypeUniteListComponent,
    TypeUniteFormComponent
  ]
})
export class TypeUniteModule {}
