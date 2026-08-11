import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuspiciousActivityService {
  readonly captchaRequired = signal(false);
  readonly captchaResolved = signal(false);
  readonly reason = signal('');

  private readonly startedAt = Date.now();
  private readonly requestTimestamps: number[] = [];
  private readonly routeTimestamps: number[] = [];
  private humanInteractions = 0;
  private apiErrors = 0;
  private captchaSolvedAt = 0;
  private monitoringStarted = false;

  constructor(private readonly router: Router) {}

  startMonitoring(): void {

    if (this.monitoringStarted) {
      return;
    }

    this.monitoringStarted = true;

    const events = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart'
    ];

    for (
      const eventName of events
    ) {
      window.addEventListener(
        eventName,
        () =>
          this.registerHumanInteraction(),
        {
          passive: true
        }
      );
    }

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        this.routeTimestamps.push(
          Date.now()
        );

        this.trim(
          this.routeTimestamps,
          60_000
        );

        if (
          this.routeTimestamps.length >
          environment.SECURITY
            .maxRouteChangesPerMinute
        ) {

          this.requireCaptcha(
            'Navegación inusualmente rápida.'
          );
        }
      });
  }

  registerRequest(): void {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.trim(this.requestTimestamps, 60_000);

    const earlyRequest = now - this.startedAt < environment.SECURITY.earlyRequestWindowMs;
    if (earlyRequest && this.humanInteractions === 0 && this.requestTimestamps.length > 4) {
      this.requireCaptcha('Consultas tempranas sin interacción humana.');
      return;
    }

    if (this.requestTimestamps.length > environment.SECURITY.maxApiRequestsPerMinute) {
      this.requireCaptcha('Demasiadas consultas en poco tiempo.');
    }
  }

  registerApiError(): void {
    this.apiErrors += 1;
    if (this.apiErrors >= environment.SECURITY.apiErrorThreshold) {
      this.requireCaptcha('Errores repetidos del API.');
    }
  }

  solve(token: string | null): void {
    if (!token) return;
    this.captchaSolvedAt = Date.now();
    this.captchaResolved.set(true);
    this.captchaRequired.set(false);
    this.reason.set('');
    this.apiErrors = 0;
    this.requestTimestamps.length = 0;
  }

  markCaptchaVerified(): void {
    this.captchaSolvedAt =
      Date.now();

    this.captchaResolved.set(
      true
    );

    this.captchaRequired.set(
      false
    );

    this.reason.set('');

    this.apiErrors = 0;

    this.requestTimestamps.length =
      0;
  }

  needsCaptchaNow(): boolean {
    if (!this.captchaRequired()) return false;

    if (this.captchaResolved() && Date.now() - this.captchaSolvedAt < environment.SECURITY.captchaSolvedTtlMs) {
      return false;
    }

    return true;
  }

  private registerHumanInteraction(): void {
    this.humanInteractions += 1;
  }

  private requireCaptcha(reason: string): void {
    this.reason.set(reason);
    this.captchaResolved.set(false);
    this.captchaRequired.set(true);
  }

  private trim(values: number[], windowMs: number): void {
    const min = Date.now() - windowMs;
    while (values.length > 0 && (values[0] ?? 0) < min) {
      values.shift();
    }
  }
}
