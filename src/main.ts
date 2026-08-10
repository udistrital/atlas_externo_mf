import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

const obtenerTokenPublico = async (): Promise<void> => {
  if (!environment.PUBLIC_CLIENT_AUTH.enabled || !environment.TOKEN.CLIENTE_ID) return;

  try {
    const response = await fetch(`${environment.AUTENTICACION_MID}token/clientAuth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: btoa(environment.TOKEN.CLIENTE_ID),
        documento: environment.TOKEN.CLIENTE_ID
      })
    });

    if (!response.ok) {
      console.warn('No fue posible obtener token público. La app iniciará sin token.');
      return;
    }

    const data = await response.json() as { access_token?: string };
    if (data.access_token) {
      localStorage.setItem(environment.PUBLIC_CLIENT_AUTH.storageKey, data.access_token);
    }
  } catch (error) {
    console.warn('Error obteniendo token público. La app iniciará sin token.', error);
  }
};

obtenerTokenPublico().finally(() => void bootstrap());
