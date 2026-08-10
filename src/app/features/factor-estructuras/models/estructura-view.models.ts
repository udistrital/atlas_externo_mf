import { EstructuraEvidencia } from '../../../core/models/domain.models';

export type TipoEvidenciaVista = 'tabla' | 'documental';

export interface ContenidoEstructura {
  estructura: EstructuraEvidencia;
  tipo: TipoEvidenciaVista;
  columnas: string[];
  filas: Record<string, unknown>[];
  total: number;
}

export interface DetalleRegistroDialogData {
  titulo: string;
  columnas: string[];
  fila: Record<string, unknown>;
}
