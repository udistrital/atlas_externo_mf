import { Injectable } from '@angular/core';

import {
    Observable,
    catchError,
    forkJoin,
    map,
    of,
    shareReplay,
    switchMap,
    throwError
} from 'rxjs';

import {
    Aspecto,
    CampoEstructura,
    Caracteristica,
    EstructuraEvidencia,
    Factor,
    PaginatedResponse,
    RegistroEstructura
} from '../../../core/models/domain.models';

import {
    ObservatoriosReadService
} from '../../../core/http/observatorios-read.service';

import {
    ContenidoEstructura,
    TipoEvidenciaVista
} from '../models/estructura-view.models';

@Injectable({
    providedIn: 'root'
})
export class FactorEstructurasFacade {
    private readonly aspectosCache =
        new Map<
            string,
            Observable<Aspecto[]>
        >();

    private readonly estructurasCache =
        new Map<
            string,
            Observable<
                EstructuraEvidencia[]
            >
        >();

    constructor(
        private readonly api:
            ObservatoriosReadService
    ) { }

    cargarFactor(
        factorId: string | number
    ): Observable<{
        factor: Factor;
        caracteristicas: Caracteristica[];
    }> {
        return forkJoin({
            factor:
                this.api.obtenerFactor(factorId),

            caracteristicas:
                this.api
                    .listarCaracteristicasPorFactor(
                        factorId
                    )
        });
    }

    cargarAspectos(
        caracteristicaId: string | number
    ): Observable<Aspecto[]> {
        const key = String(
            caracteristicaId
        );

        const cached =
            this.aspectosCache.get(key);

        if (cached) {
            return cached;
        }

        const request = this.api
            .listarAspectosPorCaracteristica(
                caracteristicaId
            )
            .pipe(
                map((items) =>
                    this.ordenar(items)
                ),

                shareReplay({
                    bufferSize: 1,
                    refCount: true
                })
            );

        this.aspectosCache.set(
            key,
            request
        );

        return request;
    }

    cargarEstructuras(
        aspectoId: string | number
    ): Observable<
        EstructuraEvidencia[]
    > {
        const key = String(aspectoId);

        const cached =
            this.estructurasCache.get(key);

        if (cached) {
            return cached;
        }

        const request = this.api
            .listarEstructurasPorAspecto(
                aspectoId
            )
            .pipe(
                map((items) =>
                    this.ordenar(items)
                ),

                shareReplay({
                    bufferSize: 1,
                    refCount: true
                })
            );

        this.estructurasCache.set(
            key,
            request
        );

        return request;
    }

    cargarContenido(
        resumen: EstructuraEvidencia,
        pageIndex: number,
        pageSize: number
    ): Observable<ContenidoEstructura> {
        const estructuraId = resumen.id;

        if (
            estructuraId === null ||
            estructuraId === undefined ||
            estructuraId === ''
        ) {
            return of({
                estructura: resumen,
                tipo:
                    this.tipoEvidencia(resumen),
                columnas: [],
                filas: [],
                total: 0
            });
        }

        /*
         * El detalle proporciona la configuración
         * de los campos de la estructura.
         */
        return this.api
            .obtenerEstructura(
                estructuraId
            )
            .pipe(
                /*
                 * Si el detalle falla, conserva la información
                 * que ya llegó dentro del aspecto.
                 */
                catchError((error) => {
                    console.error(
                        'No fue posible obtener el detalle de la estructura:',
                        error
                    );

                    return of(resumen);
                }),

                map((detalle) => ({
                    ...resumen,
                    ...detalle,

                    campos:
                        detalle.campos ??
                        resumen.campos ??
                        []
                })),

                switchMap((estructura) => {
                    const tipo = this.tipoEvidencia(
                        estructura
                    );

                    return this.api
                        .listarDatosEstructura(
                        estructuraId,
                        {
                            page: pageIndex + 1,
                            page_size: pageSize
                        }
                        )
                        .pipe(
                        map(
                            (
                            response: PaginatedResponse<RegistroEstructura>
                            ) =>
                            this.mapearContenido(
                                estructura,
                                tipo,
                                response
                            )
                        )
                        );
                    })
            );
    }

    obtenerUrlDocumento(
        fila: Record<string, unknown>
    ): Observable<string> {
        const hash =
            this.extraerHash(fila);

        if (!hash) {
            return throwError(
                () =>
                    new Error(
                        'El registro no contiene un hash de documento.'
                    )
            );
        }

        return this.api
            .obtenerDocumento(hash)
            .pipe(
                map((response) => {
                    if (!response.file) {
                        throw new Error(
                            'El gestor documental no retornó el archivo.'
                        );
                    }

                    const blob =
                        this.base64ToBlob(
                            response.file,
                            'application/pdf'
                        );

                    return URL.createObjectURL(
                        blob
                    );
                })
            );
    }

    tipoEvidencia(
        estructura: EstructuraEvidencia
    ): TipoEvidenciaVista {
        const tipo = String(
            estructura.tipo_evidencia ||
            ''
        )
            .trim()
            .toLowerCase();

        return tipo.includes(
            'document'
        )
            ? 'documental'
            : 'tabla';
    }

    private mapearContenido(
        estructura: EstructuraEvidencia,
        tipo: TipoEvidenciaVista,
        response: PaginatedResponse<RegistroEstructura>
    ): ContenidoEstructura {
        const registros =
            Array.isArray(response.results)
                ? response.results.filter(
                    (registro) =>
                        registro.activo !== false
                )
                : [];

        /*
         * Soporta ambos formatos:
         *
         * 1. Datos con nombres de campos:
         *    { "Edad": "12" }
         *
         * 2. Datos por campo_id:
         *    {
         *      valores: {
         *        campo_123: "12"
         *      }
         *    }
         */
        const filas = registros.map(
            (registro) =>
                this.normalizarRegistro(
                    estructura.campos ?? [],
                    registro
                )
        );

        const columnas =
            this.obtenerColumnas(
                estructura.campos ?? [],
                filas,
                tipo
            );

        return {
            estructura,
            tipo,
            columnas,
            filas,
            total:
                Number(response.count) ||
                filas.length
        };
    }

    private obtenerColumnas(
        campos: CampoEstructura[],
        filas: Record<string, unknown>[],
        tipo: TipoEvidenciaVista
    ): string[] {
        const columnasConfiguradas =
            [...campos]
                .filter(
                    (campo) =>
                        campo.activo !== false
                )
                .sort(
                    (a, b) =>
                        Number(a.orden ?? 999999) -
                        Number(b.orden ?? 999999)
                )
                .map((campo) =>
                    String(
                        campo.nombre_campo || ''
                    ).trim()
                )
                .filter((nombre) => {
                    if (!nombre) {
                        return false;
                    }

                    /*
                     * El hash es interno y no debe
                     * aparecer como columna.
                     */
                    if (
                        tipo === 'documental' &&
                        nombre.toLowerCase() ===
                        'hash'
                    ) {
                        return false;
                    }

                    return !this.esColumnaInterna(
                        nombre
                    );
                });

        if (
            columnasConfiguradas.length > 0
        ) {
            return columnasConfiguradas;
        }

        const primeraFila = filas[0];

        if (!primeraFila) {
            return [];
        }

        return Object.keys(
            primeraFila
        ).filter(
            (nombre) =>
                !this.esColumnaInterna(
                    nombre
                )
        );
    }

    private normalizarRegistro(
        campos: CampoEstructura[],
        registro: RegistroEstructura
    ): Record<string, unknown> {
        const normalizado: Record<
            string,
            unknown
        > = {
            ...registro
        };

        const valores =
            this.esObjeto(registro.valores)
                ? registro.valores
                : null;

        if (valores) {
            const campoPorId =
                new Map<string, string>();

            for (const campo of campos) {
                const campoId = String(
                    campo.campo_id ?? ''
                );

                const nombre = String(
                    campo.nombre_campo ?? ''
                ).trim();

                if (campoId && nombre) {
                    campoPorId.set(
                        campoId,
                        nombre
                    );
                }
            }

            for (
                const [campoId, valor] of
                Object.entries(valores)
            ) {
                const nombre =
                    campoPorId.get(campoId) ??
                    campoId;

                normalizado[nombre] =
                    valor;
            }
        }

        /*
         * Ya se transformó a nombres de columnas,
         * por lo que no se muestra el objeto valores.
         */
        delete normalizado['valores'];

        return normalizado;
    }

    private extraerHash(
        fila: Record<string, unknown>
    ): string {
        const candidatos = [
            fila['hash'],
            fila['Hash'],
            fila['enlace'],
            fila['Enlace'],
            fila['id_archivo'],
            fila['IdArchivo'],
            fila['documento']
        ];

        const valor =
            candidatos.find(
                (item) =>
                    item !== null &&
                    item !== undefined &&
                    String(item).trim() !== ''
            );

        return valor
            ? String(valor).trim()
            : '';
    }

    private esColumnaInterna(
        nombre: string
    ): boolean {
        const normalizada = nombre
            .trim()
            .toLowerCase();

        return [
            'id',
            'activo',
            'fecha_creacion',
            'fecha_modificacion',
            'valores',
            'hash',
            'enlace',
            'id_archivo'
        ].includes(normalizada);
    }

    private esObjeto(
        value: unknown
    ): value is Record<string, unknown> {
        return (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        );
    }

    private base64ToBlob(
        base64: string,
        type: string
    ): Blob {
        const contenido =
            base64.includes(',')
                ? base64.split(',').pop() ||
                ''
                : base64;

        const bytes = atob(contenido);

        const array =
            new Uint8Array(
                bytes.length
            );

        for (
            let index = 0;
            index < bytes.length;
            index += 1
        ) {
            array[index] =
                bytes.charCodeAt(index);
        }

        return new Blob(
            [array],
            {
                type
            }
        );
    }

    private ordenar<
        T extends {
            id?: string | number | null;
        }
    >(
        items: T[]
    ): T[] {
        return [...items].sort(
            (a, b) =>
                String(a.id ?? '')
                    .localeCompare(
                        String(b.id ?? ''),
                        undefined,
                        {
                            numeric: true,
                            sensitivity: 'base'
                        }
                    )
        );
    }
}
