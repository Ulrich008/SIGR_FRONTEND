import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfilsRoutingModule } from './profils-routing.module';
import { ProfilListComponent } from './pages/profil-list/profil-list.component';
import { ProfilFormComponent } from './pages/profil-form/profil-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProfilsRoutingModule,
    ProfilListComponent,
    ProfilFormComponent
  ]
})
export class ProfilsModule {}