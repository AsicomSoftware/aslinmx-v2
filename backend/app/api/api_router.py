"""
Router principal de la API
Agrupa todos los routers de la aplicación
"""

from fastapi import APIRouter
from app.api.routes import user_routes

# Router principal
api_router = APIRouter()

# Incluir routers de módulos
api_router.include_router(
    user_routes.router,
    prefix="/users",
    tags=["users"]
)

# Agregar más routers aquí en el futuro
# api_router.include_router(siniestros_routes.router, prefix="/siniestros", tags=["siniestros"])
# api_router.include_router(bitacora_routes.router, prefix="/bitacora", tags=["bitacora"])

