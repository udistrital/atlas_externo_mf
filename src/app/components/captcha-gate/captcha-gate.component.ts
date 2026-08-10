import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';
import { SuspiciousActivityService } from '../../core/security/suspicious-activity.service';

@Component({
  selector: 'app-captcha-gate',
  standalone: true,
  imports: [CommonModule, MatIconModule, RecaptchaModule],
  templateUrl: './captcha-gate.component.html',
  styleUrl: './captcha-gate.component.scss'
})
export class CaptchaGateComponent {
  readonly siteKey = environment.CAPTCHA_SITE_KEY;
  readonly captchaRequired = this.activity.captchaRequired;
  readonly reason = this.activity.reason;

  constructor(private readonly activity: SuspiciousActivityService) {
    this.activity.startMonitoring();
    effect(() => {
      if (this.captchaRequired()) {
        console.warn('Captcha requerido:', this.reason());
      }
    });
  }

  onResolved(token: string | null): void {
    this.activity.solve(token);
  }
}
