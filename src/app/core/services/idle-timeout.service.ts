import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SigrSwal as Swal } from '../utils/sigr-swal';
import { AuthService } from './auth.service';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

// Avertissement à 25 min d'inactivité, déconnexion effective à 30 min
// (soit 5 min de préavis) — cohérent avec un token JWT valable 1h côté
// serveur : l'inactivité coupe la session bien avant l'expiration du
// token, qui reste un filet de sécurité.
const WARNING_DELAY_MS = 25 * 60 * 1000;
const LOGOUT_DELAY_MS = 30 * 60 * 1000;
const COUNTDOWN_SECONDS = Math.round((LOGOUT_DELAY_MS - WARNING_DELAY_MS) / 1000);

/**
 * Déconnexion automatique pour inactivité, avec avertissement préalable.
 * Instancié une seule fois (providedIn: 'root'), démarré/arrêté au fil
 * des connexions/déconnexions via l'abonnement à AuthService.currentUser$
 * — voir son injection dans AppComponent, qui force cette instanciation
 * dès le démarrage de l'application.
 */
@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {

  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  private listening = false;
  private warningShown = false;
  private closingProgrammatically = false;

  private readonly onActivity = (): void => {
    if (this.warningShown) return;
    this.resetTimers();
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  private start(): void {
    if (this.listening) return;
    this.listening = true;
    ACTIVITY_EVENTS.forEach(evt => document.addEventListener(evt, this.onActivity, { passive: true }));
    this.resetTimers();
  }

  private stop(): void {
    this.listening = false;
    ACTIVITY_EVENTS.forEach(evt => document.removeEventListener(evt, this.onActivity));
    this.clearTimers();
    if (this.warningShown) {
      this.closingProgrammatically = true;
      Swal.close();
    }
  }

  private resetTimers(): void {
    this.clearTimers();
    this.warningTimer = setTimeout(() => this.showWarning(), WARNING_DELAY_MS);
    this.logoutTimer = setTimeout(() => this.forceLogout(), LOGOUT_DELAY_MS);
  }

  private clearTimers(): void {
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.warningTimer = null;
    this.logoutTimer = null;
    this.countdownInterval = null;
  }

  private showWarning(): void {
    this.warningShown = true;
    this.closingProgrammatically = false;
    let secondsLeft = COUNTDOWN_SECONDS;

    Swal.fire({
      title: 'Toujours là ?',
      html: this.countdownHtml(secondsLeft),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rester connecté',
      cancelButtonText: 'Se déconnecter',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        this.countdownInterval = setInterval(() => {
          secondsLeft--;
          const el = document.getElementById('idle-countdown');
          if (el) el.textContent = this.formatTime(secondsLeft);
        }, 1000);
      }
    }).then(result => {
      this.warningShown = false;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      // Fermé par forceLogout() (timer de déconnexion écoulé) : déjà géré là-bas.
      if (this.closingProgrammatically) return;

      if (result.isConfirmed) {
        this.resetTimers();
      } else {
        this.clearTimers();
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private forceLogout(): void {
    if (this.warningShown) {
      this.closingProgrammatically = true;
      Swal.close();
    }
    this.clearTimers();
    this.authService.logout();
    this.router.navigate(['/auth/login']).then(() => {
      Swal.fire({
        title: 'Session expirée',
        text: 'Vous avez été déconnecté(e) après une période d\'inactivité prolongée.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    });
  }

  private countdownHtml(seconds: number): string {
    return `<p style="font-size:14px;color:#475569;margin:0;">Vous allez être déconnecté(e) pour inactivité dans <b id="idle-countdown">${this.formatTime(seconds)}</b>.</p>`;
  }

  private formatTime(totalSeconds: number): string {
    const s = Math.max(0, totalSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
