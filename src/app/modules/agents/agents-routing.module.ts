import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './pages/agent-list/agent-list.component';
import { AgentFormComponent } from './pages/agent-form/agent-form.component';
const routes: Routes = [
  {
    path: '',
    component: AgentListComponent
  },
  {
    path: 'nouveau',
    component: AgentFormComponent
  },
  {
    path: ':matricule/edit',
    component: AgentFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentsRoutingModule {}
