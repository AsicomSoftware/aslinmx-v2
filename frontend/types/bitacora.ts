/**
 * Tipos TypeScript para el módulo de Bitácora
 */

export type TipoActividad = "documento" | "llamada" | "reunion" | "inspeccion" | "otro";

export interface BitacoraActividad {
  id: string;
  siniestro_id: string;
  usuario_id: string;
  tipo_actividad: TipoActividad;
  descripcion: string;
  horas_trabajadas: number;
  fecha_actividad: string;
  documento_adjunto?: string;
  comentarios?: string;
  creado_en: string;
}

export interface BitacoraActividadCreate {
  siniestro_id: string;
  usuario_id?: string;
  tipo_actividad: TipoActividad;
  descripcion: string;
  horas_trabajadas?: number;
  fecha_actividad: string;
  documento_adjunto?: string;
  comentarios?: string;
}

export interface BitacoraActividadUpdate {
  tipo_actividad?: TipoActividad;
  descripcion?: string;
  horas_trabajadas?: number;
  fecha_actividad?: string;
  documento_adjunto?: string;
  comentarios?: string;
}

