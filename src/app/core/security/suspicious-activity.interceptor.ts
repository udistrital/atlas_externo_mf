import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SuspiciousActivityService } from './suspicious-activity.service';

export const suspiciousActivityInterceptor: HttpInterceptorFn = (req, next) => {
  const activity = inject(SuspiciousActivityService);
  const isAtlasApi = req.url.startsWith(environment.MAIN_BACKEND) || req.url.startsWith(environment.GESTOR_DOCUMENTAL);

  if (!isAtlasApi) {
    return next(req);
  }

  activity.registerRequest();

  if (activity.needsCaptchaNow()) {
    return throwError(() => new HttpErrorResponse({
      status: 428,
      statusText: 'Captcha requerido',
      url: req.url,
      error: { detail: 'Se requiere resolver captcha antes de continuar con nuevas consultas.' }
    }));
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      activity.registerApiError();
      return throwError(() => error);
    })
  );
};
