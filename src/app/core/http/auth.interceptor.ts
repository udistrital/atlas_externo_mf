import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(environment.PUBLIC_CLIENT_AUTH.storageKey);

  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }

  const isAtlasApi = req.url.startsWith(environment.MAIN_BACKEND) || req.url.startsWith(environment.GESTOR_DOCUMENTAL);
  if (!isAtlasApi) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
