import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartographieRisquesListComponent } from './pages/cartographie-risques-list/cartographie-risques-list.component';
import { CartographieRisquesFormComponent } from './pages/cartographie-risques-form/cartographie-risques-form.component';
import { CartographieRisquesDetailComponent } from './pages/cartographie-risques-detail/cartographie-risques-detail.component';
import { CartographieDiffereesRejeteesComponent } from '../plans-cartographie/pages/cartographie-differees-rejetees/cartographie-differees-rejetees.component';
import { CartographieValideesComponent } from '../plans-cartographie/pages/cartographie-validees/cartographie-validees.component';

const routes: Routes = [
  {
    path: '',
    component: CartographieRisquesListComponent
  },
  {
    path: 'nouveau',
    component: CartographieRisquesFormComponent
  },
  // Routes statiques : doivent précéder ':code' pour ne pas être
  // interprétées comme un code métier de cartographie.
  {
    path: 'differees-rejetees',
    component: CartographieDiffereesRejeteesComponent
  },
  {
    path: 'validees',
    component: CartographieValideesComponent
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
