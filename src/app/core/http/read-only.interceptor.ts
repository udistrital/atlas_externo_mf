import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';

const allowedMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const readOnlyInterceptor: HttpInterceptorFn = (req, next) => {
  if (allowedMethods.has(req.method.toUpperCase())) {
    return next(req);
  }

  return throwError(() => new HttpErrorResponse({
    status: 405,
    statusText: 'Método bloqueado por cliente de solo lectura',
    url: req.url,
    error: {
      detail: 'atlas_externo_mf solo permite consultas. POST, PUT, PATCH y DELETE están bloqueados en el frontend.'
    }
  }));
};
