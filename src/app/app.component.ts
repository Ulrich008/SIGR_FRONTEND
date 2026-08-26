import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IdleTimeoutService } from './core/services/idle-timeout.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'SIGR Frontend';

  // Injecté uniquement pour forcer son instanciation dès le démarrage de
  // l'app (providedIn: 'root' ne l'instancie qu'au premier point
  // d'injection) : c'est son constructeur qui s'abonne à
  // AuthService.currentUser$ pour démarrer/arrêter la détection
  // d'inactivité au fil des connexions/déconnexions.
  constructor(private idleTimeoutService: IdleTimeoutService) {}
}