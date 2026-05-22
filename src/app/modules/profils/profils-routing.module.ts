import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilListComponent } from './pages/profil-list/profil-list.component';
import { ProfilFormComponent } from './pages/profil-form/profil-form.component';

const routes: Routes = [
  {
    path: '',
    component: ProfilListComponent
  },
  {
    path: 'nouveau',
    component: ProfilFormComponent
  },
  {
    path: ':code/edit',
    component: ProfilFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilsRoutingModule {}