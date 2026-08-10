export interface ApiEntity {
  id?: string | number | null;
  activo?: boolean;
  [key: string]: unknown;
}

export interface Proceso extends ApiEntity {
  proceso_id?: string | number | null;
  nombre?: string;
  descripcion?: string;
  dependencia_responsable?: string;
  objetivo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface Factor extends ApiEntity {
  factor_id?: string | number | null;
  proceso_id?: string | number | null;
  nombre?: string;
  descripcion?: string;
  calificacion?: string | number;
}

export interface Caracteristica extends ApiEntity {
  factor_id?: string | number | null;
  nombre?: string;
  descripcion?: string;
  calificacion?: string | number;
  calificacion_descripcion?: string;
  aspectos?: Aspecto[];
}

export interface Aspecto extends ApiEntity {
  caracteristica_id?: string | number | null;
  nombre?: string;
  estructuras_evidencias?: EstructuraEvidencia[];
}

export interface EstructuraEvidencia extends ApiEntity {
  aspecto_id?: string | number | null;
  tipo_evidencia?: string;
  nombre?: string;

  /*
   * Nuevo formato del backend.
   */
  campos?: CampoEstructura[];
  data?: RegistroEstructura[];

  /*
   * Se conservan porque todavía los utiliza:
   * caracteristica-consulta.component.ts
   */
  mapeo?: CampoEstructura[];
  mapeo_archivos?: CampoEstructura[];
  id_archivos?: string | number | null;

  /*
   * Información auxiliar de navegación.
   */
  factor?: string | number | null;
  nombreCaracteristica?: string;
  nombreFactor?: string;
  aspectoNombre?: string;

  tieneDatos?: boolean;
  tieneArchivos?: boolean;
}

export interface CampoEstructura {
  /*
   * Formato usado por las pantallas anteriores.
   */
  nombre?: string;
  tipo?: string;

  /*
   * Formato retornado actualmente por:
   * GET /estructuras-evidencias/{id}/
   */
  campo_id?: string | number | null;
  orden?: number;
  nombre_campo?: string;
  tipo_campo?: string;
  activo?: boolean;
  migrar_data?: boolean;

  [key: string]: unknown;
}

export interface RegistroEstructura {
  id?: string | number | null;

  valores?: Record<string, unknown>;

  activo?: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;

  /*
   * Permite campos dinámicos como:
   * Edad, Enlace, Hash, Nombre, etc.
   */
  [key: string]: unknown;
}

export interface Dashboard extends ApiEntity {
  nombre?: string;
  descripcion?: string;
  observatorio?: string | number | null;
  columnas?: number;
}

export interface Grafico extends ApiEntity {
  nombre?: string;
  tipo?: string;
  fila?: number;
  columna?: number;
  ancho?: number;
  alto?: number;
  grafico?: unknown;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}
