import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  imports: [
    RouterModule,
    AuthRoutingModule,
    LoginComponent
  ]
})
export class AuthModule {}
