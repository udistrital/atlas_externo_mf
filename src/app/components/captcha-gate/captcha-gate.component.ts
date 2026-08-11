import {
  Component,
  ViewChild,
  effect,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  finalize
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  SuspiciousActivityService
} from '../../core/security/suspicious-activity.service';

import {
  CaptchaVerificationService
} from '../../core/security/captcha-verification.service';

import {
  TurnstileWidgetComponent
} from '../../shared/turnstile-widget/turnstile-widget.component';

@Component({
    selector: 'app-captcha-gate',
    imports: [
        CommonModule,
        MatIconModule,
        TurnstileWidgetComponent
    ],
    templateUrl: './captcha-gate.component.html',
    styleUrl: './captcha-gate.component.scss'
})
export class CaptchaGateComponent {

  readonly siteKey =
    environment.TURNSTILE_SITE_KEY;

  readonly captchaRequired =
    this.activity.captchaRequired;

  readonly reason =
    this.activity.reason;

  readonly verifying =
    signal(false);

  readonly verificationError =
    signal('');

  @ViewChild(
    TurnstileWidgetComponent
  )
  private widget?:
    TurnstileWidgetComponent;

  constructor(
    private readonly activity:
      SuspiciousActivityService,

    private readonly verification:
      CaptchaVerificationService
  ) {

    this.activity.startMonitoring();

    effect(() => {

      if (
        this.captchaRequired()
      ) {

        console.warn(
          'Verificación requerida:',
          this.reason()
        );
      }
    });
  }

  onToken(
    token: string
  ): void {

    if (
      !token ||
      this.verifying()
    ) {
      return;
    }

    this.verifying.set(true);

    this.verificationError.set(
      ''
    );

    this.verification
      .verify(token)
      .pipe(
        finalize(
          () =>
            this.verifying.set(
              false
            )
        )
      )
      .subscribe({

        next: (response) => {

          if (
            response.success
          ) {

            this.activity
              .markCaptchaVerified();

            return;
          }

          this.verificationError.set(
            response.message ||
            'No fue posible validar la verificación.'
          );

          this.widget?.reset();
        },

        error: (error) => {

          console.error(
            'Error verificando Turnstile:',
            error
          );

          this.verificationError.set(
            'No fue posible validar la verificación.'
          );

          this.widget?.reset();
        }
      });
  }

  onExpired(): void {

    this.verificationError.set(
      'La verificación expiró. Inténtalo nuevamente.'
    );
  }

  onWidgetError(
    error: string
  ): void {

    this.verificationError.set(
      error
    );
  }
}
