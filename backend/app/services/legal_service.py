"""
Servicios CRUD para catálogos legales
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract
from datetime import datetime
from fastapi import HTTPException, status

from app.models.legal import (
    Area,
    EstadoSiniestro,
    CalificacionSiniestro,
    Institucion,
    Autoridad,
    Proveniente,
    TipoDocumento,
    Siniestro,
    BitacoraActividad,
    Documento,
    Notificacion,
    EvidenciaFotografica,
    SiniestroUsuario,
    SiniestroArea,
    VersionesDescripcionHechos,
)
from app.schemas.legal_schema import (
    AreaCreate,
    AreaUpdate,
    EstadoSiniestroCreate,
    EstadoSiniestroUpdate,
    CalificacionSiniestroCreate,
    CalificacionSiniestroUpdate,
    InstitucionCreate,
    InstitucionUpdate,
    AutoridadCreate,
    AutoridadUpdate,
    ProvenienteCreate,
    ProvenienteUpdate,
    TipoDocumentoCreate,
    TipoDocumentoUpdate,
    SiniestroCreate,
    SiniestroUpdate,
    BitacoraActividadCreate,
    BitacoraActividadUpdate,
    DocumentoCreate,
    DocumentoUpdate,
    NotificacionCreate,
    NotificacionUpdate,
    EvidenciaFotograficaCreate,
    EvidenciaFotograficaUpdate,
    SiniestroUsuarioCreate,
    SiniestroUsuarioUpdate,
    SiniestroAreaCreate,
    SiniestroAreaUpdate,
    VersionesDescripcionHechosCreate,
    VersionesDescripcionHechosUpdate,
)


class AreaService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[Area]:
        q = db.query(Area).filter(Area.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(Area.activo == activo)
        return q.order_by(Area.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: AreaCreate) -> Area:
        area = Area(empresa_id=empresa_id, **payload.model_dump())
        db.add(area)
        db.commit()
        db.refresh(area)
        return area

    @staticmethod
    def update(db: Session, area_id: UUID, payload: AreaUpdate) -> Optional[Area]:
        area = db.query(Area).filter(Area.id == area_id).first()
        if not area:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(area, k, v)
        db.commit()
        db.refresh(area)
        return area

    @staticmethod
    def delete(db: Session, area_id: UUID) -> bool:
        area = db.query(Area).filter(Area.id == area_id).first()
        if not area:
            return False
        area.eliminado_en = func.now()
        db.commit()
        return True


class EstadoSiniestroService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[EstadoSiniestro]:
        q = db.query(EstadoSiniestro).filter(EstadoSiniestro.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(EstadoSiniestro.activo == activo)
        return q.order_by(EstadoSiniestro.orden, EstadoSiniestro.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: EstadoSiniestroCreate) -> EstadoSiniestro:
        es = EstadoSiniestro(empresa_id=empresa_id, **payload.model_dump())
        db.add(es)
        db.commit()
        db.refresh(es)
        return es

    @staticmethod
    def update(db: Session, estado_id: UUID, payload: EstadoSiniestroUpdate) -> Optional[EstadoSiniestro]:
        es = db.query(EstadoSiniestro).filter(EstadoSiniestro.id == estado_id).first()
        if not es:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(es, k, v)
        db.commit()
        db.refresh(es)
        return es

    @staticmethod
    def delete(db: Session, estado_id: UUID) -> bool:
        es = db.query(EstadoSiniestro).filter(EstadoSiniestro.id == estado_id).first()
        if not es:
            return False
        es.eliminado_en = func.now()
        db.commit()
        return True


class CalificacionSiniestroService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[CalificacionSiniestro]:
        q = db.query(CalificacionSiniestro).filter(CalificacionSiniestro.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(CalificacionSiniestro.activo == activo)
        return q.order_by(CalificacionSiniestro.orden, CalificacionSiniestro.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: CalificacionSiniestroCreate) -> CalificacionSiniestro:
        calificacion = CalificacionSiniestro(empresa_id=empresa_id, **payload.model_dump())
        db.add(calificacion)
        db.commit()
        db.refresh(calificacion)
        return calificacion

    @staticmethod
    def update(
        db: Session,
        calificacion_id: UUID,
        payload: CalificacionSiniestroUpdate,
    ) -> Optional[CalificacionSiniestro]:
        calificacion = db.query(CalificacionSiniestro).filter(CalificacionSiniestro.id == calificacion_id).first()
        if not calificacion:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(calificacion, k, v)
        db.commit()
        db.refresh(calificacion)
        return calificacion

    @staticmethod
    def delete(db: Session, calificacion_id: UUID) -> bool:
        calificacion = db.query(CalificacionSiniestro).filter(CalificacionSiniestro.id == calificacion_id).first()
        if not calificacion:
            return False
        calificacion.eliminado_en = func.now()
        db.commit()
        return True


class InstitucionService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[Institucion]:
        q = db.query(Institucion).filter(Institucion.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(Institucion.activo == activo)
        return q.order_by(Institucion.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: InstitucionCreate) -> Institucion:
        inst = Institucion(empresa_id=empresa_id, **payload.model_dump())
        db.add(inst)
        db.commit()
        db.refresh(inst)
        return inst

    @staticmethod
    def update(db: Session, institucion_id: UUID, payload: InstitucionUpdate) -> Optional[Institucion]:
        inst = db.query(Institucion).filter(Institucion.id == institucion_id).first()
        if not inst:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(inst, k, v)
        db.commit()
        db.refresh(inst)
        return inst

    @staticmethod
    def delete(db: Session, institucion_id: UUID) -> bool:
        inst = db.query(Institucion).filter(Institucion.id == institucion_id).first()
        if not inst:
            return False
        inst.eliminado_en = func.now()
        db.commit()
        return True


class AutoridadService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[Autoridad]:
        q = db.query(Autoridad).filter(Autoridad.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(Autoridad.activo == activo)
        return q.order_by(Autoridad.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: AutoridadCreate) -> Autoridad:
        autoridad = Autoridad(empresa_id=empresa_id, **payload.model_dump())
        db.add(autoridad)
        db.commit()
        db.refresh(autoridad)
        return autoridad

    @staticmethod
    def update(db: Session, autoridad_id: UUID, payload: AutoridadUpdate) -> Optional[Autoridad]:
        autoridad = db.query(Autoridad).filter(Autoridad.id == autoridad_id).first()
        if not autoridad:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(autoridad, k, v)
        db.commit()
        db.refresh(autoridad)
        return autoridad

    @staticmethod
    def delete(db: Session, autoridad_id: UUID) -> bool:
        autoridad = db.query(Autoridad).filter(Autoridad.id == autoridad_id).first()
        if not autoridad:
            return False
        autoridad.eliminado_en = func.now()
        db.commit()
        return True


class ProvenienteService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None) -> List[Proveniente]:
        q = db.query(Proveniente).filter(Proveniente.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(Proveniente.activo == activo)
        return q.order_by(Proveniente.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: ProvenienteCreate) -> Proveniente:
        proveniente = Proveniente(empresa_id=empresa_id, **payload.model_dump())
        db.add(proveniente)
        db.commit()
        db.refresh(proveniente)
        return proveniente

    @staticmethod
    def update(db: Session, proveniente_id: UUID, payload: ProvenienteUpdate) -> Optional[Proveniente]:
        proveniente = db.query(Proveniente).filter(Proveniente.id == proveniente_id).first()
        if not proveniente:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(proveniente, k, v)
        db.commit()
        db.refresh(proveniente)
        return proveniente

    @staticmethod
    def delete(db: Session, proveniente_id: UUID) -> bool:
        proveniente = db.query(Proveniente).filter(Proveniente.id == proveniente_id).first()
        if not proveniente:
            return False
        proveniente.eliminado_en = func.now()
        db.commit()
        return True


class TipoDocumentoService:
    @staticmethod
    def list(db: Session, empresa_id: UUID, activo: Optional[bool] = None, area_id: Optional[UUID] = None) -> List[TipoDocumento]:
        q = db.query(TipoDocumento).options(joinedload("area")).filter(TipoDocumento.empresa_id == empresa_id)
        if activo is not None:
            q = q.filter(TipoDocumento.activo == activo)
        if area_id is not None:
            q = q.filter(TipoDocumento.area_id == area_id)
        return q.order_by(TipoDocumento.nombre).all()

    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: TipoDocumentoCreate) -> TipoDocumento:
        td = TipoDocumento(empresa_id=empresa_id, **payload.model_dump())
        db.add(td)
        db.commit()
        db.refresh(td)
        return td

    @staticmethod
    def update(db: Session, tipo_id: UUID, payload: TipoDocumentoUpdate) -> Optional[TipoDocumento]:
        td = db.query(TipoDocumento).filter(TipoDocumento.id == tipo_id).first()
        if not td:
            return None
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(td, k, v)
        db.commit()
        db.refresh(td)
        return td

    @staticmethod
    def delete(db: Session, tipo_id: UUID) -> bool:
        td = db.query(TipoDocumento).filter(TipoDocumento.id == tipo_id).first()
        if not td:
            return False
        td.eliminado_en = func.now()
        db.commit()
        return True


class SiniestroService:
    """Servicio para gestión de siniestros"""
    
    @staticmethod
    def list(
        db: Session,
        empresa_id: UUID,
        activo: Optional[bool] = None,
        estado_id: Optional[UUID] = None,
        area_id: Optional[UUID] = None,
        usuario_asignado: Optional[UUID] = None,
        prioridad: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Siniestro]:
        """
        Lista siniestros con filtros opcionales.
        Usa eager loading para optimizar consultas.
        Los filtros de área y usuario ahora se buscan en las tablas de relaciones.
        """
        q = db.query(Siniestro).filter(
            Siniestro.empresa_id == empresa_id,
            Siniestro.eliminado == False
        )
        
        if activo is not None:
            q = q.filter(Siniestro.activo == activo)
        if estado_id is not None:
            q = q.filter(Siniestro.estado_id == estado_id)
        if area_id is not None:
            # Filtrar por área en siniestro_areas
            q = q.join(SiniestroArea).filter(
                SiniestroArea.area_id == area_id,
                SiniestroArea.activo == True
            ).distinct()
        if usuario_asignado is not None:
            # Filtrar por usuario en siniestro_usuarios
            q = q.join(SiniestroUsuario).filter(
                SiniestroUsuario.usuario_id == usuario_asignado,
                SiniestroUsuario.activo == True
            ).distinct()
        if prioridad is not None:
            q = q.filter(Siniestro.prioridad == prioridad)
        
        siniestros = q.order_by(Siniestro.fecha_siniestro.desc()).offset(skip).limit(limit).all()
        
        # Cargar versión actual de descripción para cada siniestro
        for siniestro in siniestros:
            version_actual = VersionesDescripcionHechosService.get_actual(db, siniestro.id)
            if version_actual:
                setattr(siniestro, 'descripcion_hechos', version_actual.descripcion_html)
            else:
                setattr(siniestro, 'descripcion_hechos', None)
        
        return siniestros
    
    @staticmethod
    def get_by_id(db: Session, siniestro_id: UUID, empresa_id: UUID) -> Optional[Siniestro]:
        """Obtiene un siniestro por ID validando empresa"""
        siniestro = db.query(Siniestro).filter(
            Siniestro.id == siniestro_id,
            Siniestro.empresa_id == empresa_id,
            Siniestro.eliminado == False
        ).first()
        
        # Cargar la versión actual de la descripción y agregarla como atributo dinámico
        # para que el schema pueda serializarlo (aunque la columna ya no existe en la tabla)
        if siniestro:
            version_actual = VersionesDescripcionHechosService.get_actual(db, siniestro_id)
            if version_actual:
                # Agregar como atributo dinámico para compatibilidad con el schema
                setattr(siniestro, 'descripcion_hechos', version_actual.descripcion_html)
            else:
                setattr(siniestro, 'descripcion_hechos', None)
        
        return siniestro
    
    @staticmethod
    def _generar_codigo(db: Session, proveniente_id: UUID, fecha_siniestro: datetime) -> str:
        """
        Genera código único para siniestro con formato: {proveniente_codigo}-{consecutivo}-{año}
        Ejemplo: 102-001-25 donde 102 es el código del proveniente, 001 es consecutivo, 25 es año
        Usa el campo codigo de la tabla provenientes
        """
        if not proveniente_id:
            return None
        
        # Obtener el proveniente para acceder a su código
        proveniente = db.query(Proveniente).filter(Proveniente.id == proveniente_id).first()
        if not proveniente:
            return None
        
        # Obtener el código del proveniente, si no tiene código usar un número derivado del UUID
        proveniente_codigo = proveniente.codigo
        if not proveniente_codigo:
            # Fallback: usar últimos 3 dígitos del UUID si no tiene código
            proveniente_codigo = str(int(str(proveniente_id).replace('-', ''), 16) % 1000)
        
        # Obtener año de la fecha del siniestro
        año = fecha_siniestro.year % 100  # Últimos 2 dígitos del año
        
        # Buscar el último consecutivo para este proveniente en el año actual
        ultimo_siniestro = db.query(Siniestro).filter(
            Siniestro.proveniente_id == proveniente_id,
            extract('year', Siniestro.fecha_siniestro) == fecha_siniestro.year,
            Siniestro.eliminado == False
        ).order_by(Siniestro.codigo.desc()).first()
        
        # Si existe un código previo, extraer el consecutivo y sumar 1
        if ultimo_siniestro and ultimo_siniestro.codigo:
            try:
                # Formato esperado: {proveniente_codigo}-{consecutivo}-{año}
                partes = ultimo_siniestro.codigo.split('-')
                if len(partes) == 3 and partes[0] == str(proveniente_codigo) and partes[2] == str(año).zfill(2):
                    consecutivo = int(partes[1]) + 1
                else:
                    consecutivo = 1
            except (ValueError, IndexError):
                consecutivo = 1
        else:
            consecutivo = 1
        
        # Formatear código: {proveniente_codigo}-{consecutivo}-{año}
        codigo = f"{proveniente_codigo}-{str(consecutivo).zfill(3)}-{str(año).zfill(2)}"
        
        # Verificar que no exista (por si acaso)
        existe = db.query(Siniestro).filter(Siniestro.codigo == codigo).first()
        if existe:
            # Si existe, incrementar consecutivo
            consecutivo += 1
            codigo = f"{proveniente_codigo}-{str(consecutivo).zfill(3)}-{str(año).zfill(2)}"
        
        return codigo
    
    @staticmethod
    def create(db: Session, empresa_id: UUID, payload: SiniestroCreate, creado_por: UUID) -> Siniestro:
        """
        Crea un nuevo siniestro.
        Valida que el número de siniestro sea único por empresa.
        Genera código automáticamente si hay proveniente_id.
        """
        # Verificar unicidad del número de siniestro
        existing = db.query(Siniestro).filter(
            Siniestro.empresa_id == empresa_id,
            Siniestro.numero_siniestro == payload.numero_siniestro,
            Siniestro.eliminado == False
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un siniestro con el número {payload.numero_siniestro}"
            )
        
        # Extraer descripcion_hechos del payload para crear versión
        descripcion_hechos = payload.descripcion_hechos
        payload_dict = payload.model_dump()
        # Remover descripcion_hechos del payload del siniestro (se manejará en versiones)
        # La columna descripcion_hechos ya no existe en la tabla siniestros
        payload_dict.pop('descripcion_hechos', None)
        
        # Generar código automáticamente si hay proveniente_id
        if payload.proveniente_id:
            try:
                codigo = SiniestroService._generar_codigo(db, payload.proveniente_id, payload.fecha_siniestro)
                if codigo:
                    payload_dict['codigo'] = codigo
            except Exception as e:
                # Si hay error generando el código, continuar sin código
                # El código se puede generar después al actualizar el siniestro
                import logging
                logging.warning(f"Error al generar código para siniestro: {str(e)}")
                pass
        
        siniestro = Siniestro(empresa_id=empresa_id, creado_por=creado_por, **payload_dict)
        db.add(siniestro)
        db.commit()
        db.refresh(siniestro)
        
        # Crear primera versión de la descripción de hechos si se proporcionó
        if descripcion_hechos:
            VersionesDescripcionHechosService.create(
                db,
                VersionesDescripcionHechosCreate(
                    siniestro_id=siniestro.id,
                    descripcion_html=descripcion_hechos,
                    observaciones="Versión inicial"
                ),
                creado_por
            )
        
        return siniestro
    
    @staticmethod
    def update(db: Session, siniestro_id: UUID, empresa_id: UUID, payload: SiniestroUpdate, actualizado_por: UUID = None) -> Optional[Siniestro]:
        """
        Actualiza un siniestro existente.
        Valida empresa y unicidad del número si se cambia.
        Genera código automáticamente si falta y hay proveniente_id.
        """
        siniestro = db.query(Siniestro).filter(
            Siniestro.id == siniestro_id,
            Siniestro.empresa_id == empresa_id,
            Siniestro.eliminado == False
        ).first()
        
        if not siniestro:
            return None
        
        # Validar unicidad del número si se cambia
        if payload.numero_siniestro and payload.numero_siniestro != siniestro.numero_siniestro:
            existing = db.query(Siniestro).filter(
                Siniestro.empresa_id == empresa_id,
                Siniestro.numero_siniestro == payload.numero_siniestro,
                Siniestro.id != siniestro_id,
                Siniestro.eliminado == False
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un siniestro con el número {payload.numero_siniestro}"
                )
        
        # Extraer descripcion_hechos del payload si viene
        payload_dict = payload.model_dump(exclude_unset=True)
        descripcion_hechos = payload_dict.pop('descripcion_hechos', None)
        
        # Generar código automáticamente si falta y hay proveniente_id
        proveniente_id_actualizado = payload_dict.get('proveniente_id', siniestro.proveniente_id)
        if not siniestro.codigo and proveniente_id_actualizado:
            codigo = SiniestroService._generar_codigo(db, proveniente_id_actualizado, payload.fecha_siniestro or siniestro.fecha_siniestro)
            if codigo:
                payload_dict['codigo'] = codigo
        
        # Actualizar campos (sin descripcion_hechos)
        for k, v in payload_dict.items():
            setattr(siniestro, k, v)
        
        db.commit()
        db.refresh(siniestro)
        
        # Si se actualizó la descripción, crear nueva versión
        if descripcion_hechos:
            # Obtener versión actual para comparar
            version_actual = VersionesDescripcionHechosService.get_actual(db, siniestro_id)
            if not version_actual or version_actual.descripcion_html != descripcion_hechos:
                # Usar actualizado_por si está disponible, sino usar creado_por del siniestro
                VersionesDescripcionHechosService.create(
                    db,
                    VersionesDescripcionHechosCreate(
                        siniestro_id=siniestro_id,
                        descripcion_html=descripcion_hechos,
                        observaciones="Actualización desde edición de siniestro"
                    ),
                    actualizado_por or siniestro.creado_por
                )
        
        return siniestro
    
    @staticmethod
    def delete(db: Session, siniestro_id: UUID, empresa_id: UUID) -> bool:
        """
        Elimina lógicamente un siniestro (soft delete).
        No elimina físicamente para mantener historial.
        """
        siniestro = db.query(Siniestro).filter(
            Siniestro.id == siniestro_id,
            Siniestro.empresa_id == empresa_id,
            Siniestro.eliminado == False
        ).first()
        
        if not siniestro:
            return False
        
        siniestro.eliminado = True
        siniestro.activo = False
        siniestro.eliminado_en = func.now()
        db.commit()
        return True


# ===== BITÁCORA DE ACTIVIDADES =====
class BitacoraActividadService:
    """Servicio para gestión de bitácora de actividades"""
    
    @staticmethod
    def list(
        db: Session,
        siniestro_id: UUID,
        usuario_id: Optional[UUID] = None,
        tipo_actividad: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[BitacoraActividad]:
        """Lista actividades de bitácora con filtros opcionales"""
        q = db.query(BitacoraActividad).filter(BitacoraActividad.siniestro_id == siniestro_id)
        
        if usuario_id is not None:
            q = q.filter(BitacoraActividad.usuario_id == usuario_id)
        if tipo_actividad is not None:
            q = q.filter(BitacoraActividad.tipo_actividad == tipo_actividad)
        
        return q.order_by(BitacoraActividad.fecha_actividad.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, actividad_id: UUID) -> Optional[BitacoraActividad]:
        """Obtiene una actividad por ID"""
        return db.query(BitacoraActividad).filter(BitacoraActividad.id == actividad_id).first()
    
    @staticmethod
    def create(db: Session, payload: BitacoraActividadCreate) -> BitacoraActividad:
        """Crea una nueva actividad en bitácora"""
        actividad = BitacoraActividad(**payload.model_dump())
        db.add(actividad)
        db.commit()
        db.refresh(actividad)
        return actividad
    
    @staticmethod
    def update(db: Session, actividad_id: UUID, payload: BitacoraActividadUpdate) -> Optional[BitacoraActividad]:
        """Actualiza una actividad existente"""
        actividad = db.query(BitacoraActividad).filter(BitacoraActividad.id == actividad_id).first()
        if not actividad:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(actividad, k, v)
        
        db.commit()
        db.refresh(actividad)
        return actividad
    
    @staticmethod
    def delete(db: Session, actividad_id: UUID) -> bool:
        """Elimina una actividad de bitácora"""
        actividad = db.query(BitacoraActividad).filter(BitacoraActividad.id == actividad_id).first()
        if not actividad:
            return False
        
        db.delete(actividad)
        db.commit()
        return True


# ===== DOCUMENTOS =====
class DocumentoService:
    """Servicio para gestión de documentos"""
    
    @staticmethod
    def list(
        db: Session,
        siniestro_id: UUID,
        tipo_documento_id: Optional[UUID] = None,
        activo: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Documento]:
        """Lista documentos con filtros opcionales"""
        q = db.query(Documento).filter(
            Documento.siniestro_id == siniestro_id,
            Documento.eliminado == False
        )
        
        if tipo_documento_id is not None:
            q = q.filter(Documento.tipo_documento_id == tipo_documento_id)
        if activo is not None:
            q = q.filter(Documento.activo == activo)
        
        return q.order_by(Documento.creado_en.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, documento_id: UUID) -> Optional[Documento]:
        """Obtiene un documento por ID"""
        return db.query(Documento).filter(
            Documento.id == documento_id,
            Documento.eliminado == False
        ).first()
    
    @staticmethod
    def create(db: Session, payload: DocumentoCreate) -> Documento:
        """Crea un nuevo documento"""
        documento = Documento(**payload.model_dump())
        db.add(documento)
        db.commit()
        db.refresh(documento)
        return documento
    
    @staticmethod
    def update(db: Session, documento_id: UUID, payload: DocumentoUpdate) -> Optional[Documento]:
        """Actualiza un documento existente"""
        documento = db.query(Documento).filter(
            Documento.id == documento_id,
            Documento.eliminado == False
        ).first()
        if not documento:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(documento, k, v)
        
        db.commit()
        db.refresh(documento)
        return documento
    
    @staticmethod
    def delete(db: Session, documento_id: UUID) -> bool:
        """Elimina lógicamente un documento (soft delete)"""
        documento = db.query(Documento).filter(
            Documento.id == documento_id,
            Documento.eliminado == False
        ).first()
        if not documento:
            return False
        
        documento.eliminado = True
        documento.activo = False
        documento.eliminado_en = func.now()
        db.commit()
        return True


# ===== NOTIFICACIONES =====
class NotificacionService:
    """Servicio para gestión de notificaciones"""
    
    @staticmethod
    def list(
        db: Session,
        usuario_id: UUID,
        leida: Optional[bool] = None,
        tipo: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Notificacion]:
        """Lista notificaciones de un usuario con filtros opcionales"""
        q = db.query(Notificacion).filter(Notificacion.usuario_id == usuario_id)
        
        if leida is not None:
            q = q.filter(Notificacion.leida == leida)
        if tipo is not None:
            q = q.filter(Notificacion.tipo == tipo)
        
        return q.order_by(Notificacion.creado_en.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, notificacion_id: UUID, usuario_id: UUID) -> Optional[Notificacion]:
        """Obtiene una notificación por ID validando usuario"""
        return db.query(Notificacion).filter(
            Notificacion.id == notificacion_id,
            Notificacion.usuario_id == usuario_id
        ).first()
    
    @staticmethod
    def create(db: Session, payload: NotificacionCreate) -> Notificacion:
        """Crea una nueva notificación"""
        notificacion = Notificacion(**payload.model_dump())
        db.add(notificacion)
        db.commit()
        db.refresh(notificacion)
        return notificacion
    
    @staticmethod
    def update(db: Session, notificacion_id: UUID, usuario_id: UUID, payload: NotificacionUpdate) -> Optional[Notificacion]:
        """Actualiza una notificación existente"""
        notificacion = db.query(Notificacion).filter(
            Notificacion.id == notificacion_id,
            Notificacion.usuario_id == usuario_id
        ).first()
        if not notificacion:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(notificacion, k, v)
        
        db.commit()
        db.refresh(notificacion)
        return notificacion
    
    @staticmethod
    def marcar_leida(db: Session, notificacion_id: UUID, usuario_id: UUID) -> bool:
        """Marca una notificación como leída"""
        notificacion = db.query(Notificacion).filter(
            Notificacion.id == notificacion_id,
            Notificacion.usuario_id == usuario_id
        ).first()
        if not notificacion:
            return False
        
        notificacion.leida = True
        db.commit()
        return True
    
    @staticmethod
    def marcar_todas_leidas(db: Session, usuario_id: UUID) -> int:
        """Marca todas las notificaciones de un usuario como leídas"""
        count = db.query(Notificacion).filter(
            Notificacion.usuario_id == usuario_id,
            Notificacion.leida == False
        ).update({Notificacion.leida: True})
        db.commit()
        return count
    
    @staticmethod
    def delete(db: Session, notificacion_id: UUID, usuario_id: UUID) -> bool:
        """Elimina una notificación"""
        notificacion = db.query(Notificacion).filter(
            Notificacion.id == notificacion_id,
            Notificacion.usuario_id == usuario_id
        ).first()
        if not notificacion:
            return False
        
        db.delete(notificacion)
        db.commit()
        return True


# ===== EVIDENCIAS FOTOGRÁFICAS =====
class EvidenciaFotograficaService:
    """Servicio para gestión de evidencias fotográficas"""
    
    @staticmethod
    def list(
        db: Session,
        siniestro_id: UUID,
        activo: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[EvidenciaFotografica]:
        """Lista evidencias fotográficas con filtros opcionales"""
        q = db.query(EvidenciaFotografica).filter(
            EvidenciaFotografica.siniestro_id == siniestro_id,
            EvidenciaFotografica.eliminado == False
        )
        
        if activo is not None:
            q = q.filter(EvidenciaFotografica.activo == activo)
        
        return q.order_by(EvidenciaFotografica.creado_en.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, evidencia_id: UUID) -> Optional[EvidenciaFotografica]:
        """Obtiene una evidencia por ID"""
        return db.query(EvidenciaFotografica).filter(
            EvidenciaFotografica.id == evidencia_id,
            EvidenciaFotografica.eliminado == False
        ).first()
    
    @staticmethod
    def create(db: Session, payload: EvidenciaFotograficaCreate) -> EvidenciaFotografica:
        """Crea una nueva evidencia fotográfica"""
        evidencia = EvidenciaFotografica(**payload.model_dump())
        db.add(evidencia)
        db.commit()
        db.refresh(evidencia)
        return evidencia
    
    @staticmethod
    def update(db: Session, evidencia_id: UUID, payload: EvidenciaFotograficaUpdate) -> Optional[EvidenciaFotografica]:
        """Actualiza una evidencia existente"""
        evidencia = db.query(EvidenciaFotografica).filter(
            EvidenciaFotografica.id == evidencia_id,
            EvidenciaFotografica.eliminado == False
        ).first()
        if not evidencia:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(evidencia, k, v)
        
        db.commit()
        db.refresh(evidencia)
        return evidencia
    
    @staticmethod
    def delete(db: Session, evidencia_id: UUID) -> bool:
        """Elimina lógicamente una evidencia (soft delete)"""
        evidencia = db.query(EvidenciaFotografica).filter(
            EvidenciaFotografica.id == evidencia_id,
            EvidenciaFotografica.eliminado == False
        ).first()
        if not evidencia:
            return False
        
        evidencia.eliminado = True
        evidencia.activo = False
        evidencia.eliminado_en = func.now()
        db.commit()
        return True


# ===== RELACIONES SINIESTRO-USUARIO (INVOLUCRADOS) =====
class SiniestroUsuarioService:
    """Servicio para gestión de involucrados en siniestros"""
    
    @staticmethod
    def list(db: Session, siniestro_id: UUID, activo: Optional[bool] = None) -> List[SiniestroUsuario]:
        """Lista involucrados de un siniestro"""
        q = db.query(SiniestroUsuario).filter(SiniestroUsuario.siniestro_id == siniestro_id)
        if activo is not None:
            q = q.filter(SiniestroUsuario.activo == activo)
        return q.order_by(SiniestroUsuario.es_principal.desc(), SiniestroUsuario.creado_en).all()
    
    @staticmethod
    def create(db: Session, payload: SiniestroUsuarioCreate) -> SiniestroUsuario:
        """Agrega un involucrado a un siniestro"""
        # Verificar que no exista ya la misma relación
        existing = db.query(SiniestroUsuario).filter(
            SiniestroUsuario.siniestro_id == payload.siniestro_id,
            SiniestroUsuario.usuario_id == payload.usuario_id,
            SiniestroUsuario.tipo_relacion == payload.tipo_relacion,
            SiniestroUsuario.activo == True
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe esta relación con el usuario"
            )
        
        relacion = SiniestroUsuario(**payload.model_dump())
        db.add(relacion)
        db.commit()
        db.refresh(relacion)
        return relacion
    
    @staticmethod
    def update(db: Session, relacion_id: UUID, payload: SiniestroUsuarioUpdate) -> Optional[SiniestroUsuario]:
        """Actualiza una relación siniestro-usuario"""
        relacion = db.query(SiniestroUsuario).filter(SiniestroUsuario.id == relacion_id).first()
        if not relacion:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(relacion, k, v)
        
        db.commit()
        db.refresh(relacion)
        return relacion
    
    @staticmethod
    def delete(db: Session, relacion_id: UUID) -> bool:
        """Elimina una relación siniestro-usuario"""
        relacion = db.query(SiniestroUsuario).filter(SiniestroUsuario.id == relacion_id).first()
        if not relacion:
            return False
        
        db.delete(relacion)
        db.commit()
        return True


# ===== RELACIONES SINIESTRO-ÁREA =====
class SiniestroAreaService:
    """Servicio para gestión de áreas adicionales en siniestros"""
    
    @staticmethod
    def list(db: Session, siniestro_id: UUID, activo: Optional[bool] = None) -> List[SiniestroArea]:
        """Lista áreas adicionales de un siniestro"""
        q = db.query(SiniestroArea).filter(SiniestroArea.siniestro_id == siniestro_id)
        if activo is not None:
            q = q.filter(SiniestroArea.activo == activo)
        return q.order_by(SiniestroArea.fecha_asignacion.desc()).all()
    
    @staticmethod
    def create(db: Session, payload: SiniestroAreaCreate) -> SiniestroArea:
        """Agrega un área a un siniestro"""
        # Verificar que no exista ya la misma área
        existing = db.query(SiniestroArea).filter(
            SiniestroArea.siniestro_id == payload.siniestro_id,
            SiniestroArea.area_id == payload.area_id,
            SiniestroArea.activo == True
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe esta área asignada al siniestro"
            )
        
        relacion = SiniestroArea(**payload.model_dump())
        db.add(relacion)
        db.commit()
        db.refresh(relacion)
        return relacion
    
    @staticmethod
    def update(db: Session, relacion_id: UUID, payload: SiniestroAreaUpdate) -> Optional[SiniestroArea]:
        """Actualiza una relación siniestro-área"""
        relacion = db.query(SiniestroArea).filter(SiniestroArea.id == relacion_id).first()
        if not relacion:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(relacion, k, v)
        
        db.commit()
        db.refresh(relacion)
        return relacion
    
    @staticmethod
    def delete(db: Session, relacion_id: UUID) -> bool:
        """Elimina una relación siniestro-área"""
        relacion = db.query(SiniestroArea).filter(SiniestroArea.id == relacion_id).first()
        if not relacion:
            return False
        
        db.delete(relacion)
        db.commit()
        return True


# ===== VERSIONES DE DESCRIPCIÓN DE HECHOS =====
class VersionesDescripcionHechosService:
    """Servicio para gestión de versiones de descripción de hechos"""
    
    @staticmethod
    def list(db: Session, siniestro_id: UUID) -> List[VersionesDescripcionHechos]:
        """Lista todas las versiones de descripción de hechos de un siniestro"""
        return db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.siniestro_id == siniestro_id
        ).order_by(VersionesDescripcionHechos.version.desc()).all()
    
    @staticmethod
    def get_actual(db: Session, siniestro_id: UUID) -> Optional[VersionesDescripcionHechos]:
        """Obtiene la versión actual de la descripción de hechos"""
        return db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.siniestro_id == siniestro_id,
            VersionesDescripcionHechos.es_actual == True
        ).first()
    
    @staticmethod
    def get_by_id(db: Session, version_id: UUID) -> Optional[VersionesDescripcionHechos]:
        """Obtiene una versión específica por ID"""
        return db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.id == version_id
        ).first()
    
    @staticmethod
    def create(db: Session, payload: VersionesDescripcionHechosCreate, creado_por: UUID) -> VersionesDescripcionHechos:
        """
        Crea una nueva versión de descripción de hechos.
        Marca todas las versiones anteriores como no actuales y crea la nueva como actual.
        """
        # Obtener el número de versión siguiente
        ultima_version = db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.siniestro_id == payload.siniestro_id
        ).order_by(VersionesDescripcionHechos.version.desc()).first()
        
        nueva_version = ultima_version.version + 1 if ultima_version else 1
        
        # Marcar todas las versiones anteriores como no actuales
        db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.siniestro_id == payload.siniestro_id,
            VersionesDescripcionHechos.es_actual == True
        ).update({VersionesDescripcionHechos.es_actual: False})
        
        # Crear nueva versión
        nueva_descripcion = VersionesDescripcionHechos(
            siniestro_id=payload.siniestro_id,
            descripcion_html=payload.descripcion_html,
            version=nueva_version,
            es_actual=True,
            creado_por=creado_por,
            observaciones=payload.observaciones
        )
        db.add(nueva_descripcion)
        db.commit()
        db.refresh(nueva_descripcion)
        return nueva_descripcion
    
    @staticmethod
    def update(db: Session, version_id: UUID, payload: VersionesDescripcionHechosUpdate) -> Optional[VersionesDescripcionHechos]:
        """Actualiza una versión existente (solo observaciones)"""
        version = db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.id == version_id
        ).first()
        if not version:
            return None
        
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(version, k, v)
        
        db.commit()
        db.refresh(version)
        return version
    
    @staticmethod
    def restaurar_version(db: Session, version_id: UUID, creado_por: UUID) -> Optional[VersionesDescripcionHechos]:
        """
        Restaura una versión anterior creando una nueva versión con el contenido de la versión especificada.
        """
        version_anterior = db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.id == version_id
        ).first()
        
        if not version_anterior:
            return None
        
        # Crear nueva versión con el contenido de la versión anterior
        return VersionesDescripcionHechosService.create(
            db,
            VersionesDescripcionHechosCreate(
                siniestro_id=version_anterior.siniestro_id,
                descripcion_html=version_anterior.descripcion_html,
                observaciones=f"Restaurada desde versión {version_anterior.version}"
            ),
            creado_por
        )
    
    @staticmethod
    def delete(db: Session, version_id: UUID) -> bool:
        """
        Elimina una versión de descripción de hechos.
        No permite eliminar la versión actual.
        """
        version = db.query(VersionesDescripcionHechos).filter(
            VersionesDescripcionHechos.id == version_id
        ).first()
        
        if not version:
            return False
        
        if version.es_actual:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar la versión actual de la descripción"
            )
        
        db.delete(version)
        db.commit()
        return True

