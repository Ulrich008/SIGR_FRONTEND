import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgentsRoutingModule } from './agents-routing.module';
import { AgentListComponent } from './pages/agent-list/agent-list.component';
import { AgentFormComponent } from './pages/agent-form/agent-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgentsRoutingModule,
    AgentListComponent,
    AgentFormComponent
  ]
})
export class AgentsModule {}
