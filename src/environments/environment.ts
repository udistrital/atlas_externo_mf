export const environment = {
  production: false,
  appname: 'atlas_externo_mf',
  appMenu: 'Atlas Externo',
  PRUEBAS_ASSETS: 'https://pruebasassets.portaloas.udistrital.edu.co/',
  AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/',
  MAIN_BACKEND: 'http://localhost:8000/api/v1',
  GESTOR_DOCUMENTAL: 'http://localhost:8034/v1/',
  //GESTOR_DOCUMENTAL: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
  TURNSTILE_SITE_KEY: '',
  /*
   * Este endpoint NO es Cloudflare.
   * Es un endpoint del propio backend/MID que
   * validará el token contra Cloudflare.
   */
  TURNSTILE_VERIFY_URL: '',
  PUBLIC_CLIENT_AUTH: {
    enabled: true,
    storageKey: 'access_token'
  },
  TOKEN: {
        CLIENTE_ID: 'q5NoHpeM38Scq3KbD4aqT6XXnLQa',
        RESPONSE_TYPE: 'id_token token',
        REDIRECT_URL: 'http://localhost:4200/',
  },
  SECURITY: {
    maxApiRequestsPerMinute: 45,
    maxRouteChangesPerMinute: 35,
    earlyRequestWindowMs: 2500,
    captchaSolvedTtlMs: 15 * 60 * 1000,
    apiErrorThreshold: 6
  }
};
