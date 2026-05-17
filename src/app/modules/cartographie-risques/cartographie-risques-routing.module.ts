import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartographieRisquesListComponent } from './pages/cartographie-risques-list/cartographie-risques-list.component';
import { CartographieRisquesFormComponent } from './pages/cartographie-risques-form/cartographie-risques-form.component';
import { CartographieRisquesDetailComponent } from './pages/cartographie-risques-detail/cartographie-risques-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CartographieRisquesListComponent
  },
  {
    path: 'nouveau',
    component: CartographieRisquesFormComponent
  },
  {
    path: ':code/edit',
    component: CartographieRisquesFormComponent
  },
  {
    path: ':code',
    component: CartographieRisquesDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartographieRisquesRoutingModule {}
