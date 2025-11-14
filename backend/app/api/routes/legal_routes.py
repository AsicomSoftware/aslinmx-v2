"""
Rutas API para catálogos legales
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.legal_schema import (
    AreaCreate,
    AreaUpdate,
    AreaResponse,
    EstadoSiniestroCreate,
    EstadoSiniestroUpdate,
    EstadoSiniestroResponse,
    CalificacionSiniestroCreate,
    CalificacionSiniestroUpdate,
    CalificacionSiniestroResponse,
    InstitucionCreate,
    InstitucionUpdate,
    InstitucionResponse,
    AutoridadCreate,
    AutoridadUpdate,
    AutoridadResponse,
    ProvenienteCreate,
    ProvenienteUpdate,
    ProvenienteResponse,
    TipoDocumentoCreate,
    TipoDocumentoUpdate,
    TipoDocumentoResponse,
)
from app.services.legal_service import (
    AreaService,
    EstadoSiniestroService,
    CalificacionSiniestroService,
    InstitucionService,
    AutoridadService,
    ProvenienteService,
    TipoDocumentoService,
)

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])


# ===== ÁREAS =====
@router.get("/areas", response_model=List[AreaResponse])
def list_areas(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AreaService.list(db, current_user.empresa_id, activo)


@router.post("/areas", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
def create_area(
    payload: AreaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AreaService.create(db, current_user.empresa_id, payload)


@router.put("/areas/{area_id}", response_model=AreaResponse)
def update_area(
    area_id: UUID,
    payload: AreaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    area = AreaService.update(db, area_id, payload)
    if not area:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return area


@router.delete("/areas/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_area(
    area_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = AreaService.delete(db, area_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return None



# ===== ESTADOS DE SINIESTRO =====
@router.get("/estados-siniestro", response_model=List[EstadoSiniestroResponse])
def list_estados_siniestro(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return EstadoSiniestroService.list(db, current_user.empresa_id, activo)


@router.post("/estados-siniestro", response_model=EstadoSiniestroResponse, status_code=status.HTTP_201_CREATED)
def create_estado_siniestro(
    payload: EstadoSiniestroCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return EstadoSiniestroService.create(db, current_user.empresa_id, payload)


@router.put("/estados-siniestro/{estado_id}", response_model=EstadoSiniestroResponse)
def update_estado_siniestro(
    estado_id: UUID,
    payload: EstadoSiniestroUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    es = EstadoSiniestroService.update(db, estado_id, payload)
    if not es:
        raise HTTPException(status_code=404, detail="Estado de siniestro no encontrado")
    return es


@router.delete("/estados-siniestro/{estado_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estado_siniestro(
    estado_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = EstadoSiniestroService.delete(db, estado_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Estado de siniestro no encontrado")
    return None


# ===== CALIFICACIONES DE SINIESTRO =====
@router.get("/calificaciones-siniestro", response_model=List[CalificacionSiniestroResponse])
def list_calificaciones_siniestro(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CalificacionSiniestroService.list(db, current_user.empresa_id, activo)


@router.post("/calificaciones-siniestro", response_model=CalificacionSiniestroResponse, status_code=status.HTTP_201_CREATED)
def create_calificacion_siniestro(
    payload: CalificacionSiniestroCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CalificacionSiniestroService.create(db, current_user.empresa_id, payload)


@router.put("/calificaciones-siniestro/{calificacion_id}", response_model=CalificacionSiniestroResponse)
def update_calificacion_siniestro(
    calificacion_id: UUID,
    payload: CalificacionSiniestroUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    calificacion = CalificacionSiniestroService.update(db, calificacion_id, payload)
    if not calificacion:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    return calificacion


@router.delete("/calificaciones-siniestro/{calificacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calificacion_siniestro(
    calificacion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = CalificacionSiniestroService.delete(db, calificacion_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    return None


# ===== INSTITUCIONES =====
@router.get("/instituciones", response_model=List[InstitucionResponse])
def list_instituciones(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return InstitucionService.list(db, current_user.empresa_id, activo)


@router.post("/instituciones", response_model=InstitucionResponse, status_code=status.HTTP_201_CREATED)
def create_institucion(
    payload: InstitucionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return InstitucionService.create(db, current_user.empresa_id, payload)


@router.put("/instituciones/{institucion_id}", response_model=InstitucionResponse)
def update_institucion(
    institucion_id: UUID,
    payload: InstitucionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    inst = InstitucionService.update(db, institucion_id, payload)
    if not inst:
        raise HTTPException(status_code=404, detail="Institución no encontrada")
    return inst


@router.delete("/instituciones/{institucion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_institucion(
    institucion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = InstitucionService.delete(db, institucion_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Institución no encontrada")
    return None


# ===== AUTORIDADES =====
@router.get("/autoridades", response_model=List[AutoridadResponse])
def list_autoridades(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AutoridadService.list(db, current_user.empresa_id, activo)


@router.post("/autoridades", response_model=AutoridadResponse, status_code=status.HTTP_201_CREATED)
def create_autoridad(
    payload: AutoridadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AutoridadService.create(db, current_user.empresa_id, payload)


@router.put("/autoridades/{autoridad_id}", response_model=AutoridadResponse)
def update_autoridad(
    autoridad_id: UUID,
    payload: AutoridadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    autoridad = AutoridadService.update(db, autoridad_id, payload)
    if not autoridad:
        raise HTTPException(status_code=404, detail="Autoridad no encontrada")
    return autoridad


@router.delete("/autoridades/{autoridad_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_autoridad(
    autoridad_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = AutoridadService.delete(db, autoridad_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Autoridad no encontrada")
    return None


# ===== PROVENIENTES =====
@router.get("/provenientes", response_model=List[ProvenienteResponse])
def list_provenientes(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ProvenienteService.list(db, current_user.empresa_id, activo)


@router.post("/provenientes", response_model=ProvenienteResponse, status_code=status.HTTP_201_CREATED)
def create_proveniente(
    payload: ProvenienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ProvenienteService.create(db, current_user.empresa_id, payload)


@router.put("/provenientes/{proveniente_id}", response_model=ProvenienteResponse)
def update_proveniente(
    proveniente_id: UUID,
    payload: ProvenienteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    proveniente = ProvenienteService.update(db, proveniente_id, payload)
    if not proveniente:
        raise HTTPException(status_code=404, detail="Proveniente no encontrado")
    return proveniente


@router.delete("/provenientes/{proveniente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proveniente(
    proveniente_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = ProvenienteService.delete(db, proveniente_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Proveniente no encontrado")
    return None


# ===== TIPOS DE DOCUMENTO =====
@router.get("/tipos-documento", response_model=List[TipoDocumentoResponse])
def list_tipos_documento(
    activo: Optional[bool] = Query(None),
    area_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return TipoDocumentoService.list(db, current_user.empresa_id, activo, area_id)


@router.post("/tipos-documento", response_model=TipoDocumentoResponse, status_code=status.HTTP_201_CREATED)
def create_tipo_documento(
    payload: TipoDocumentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return TipoDocumentoService.create(db, current_user.empresa_id, payload)


@router.put("/tipos-documento/{tipo_id}", response_model=TipoDocumentoResponse)
def update_tipo_documento(
    tipo_id: UUID,
    payload: TipoDocumentoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    td = TipoDocumentoService.update(db, tipo_id, payload)
    if not td:
        raise HTTPException(status_code=404, detail="Tipo de documento no encontrado")
    return td


@router.delete("/tipos-documento/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tipo_documento(
    tipo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = TipoDocumentoService.delete(db, tipo_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Tipo de documento no encontrado")
    return None


