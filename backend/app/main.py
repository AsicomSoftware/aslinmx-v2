"""
ASLIN 2.0 - Backend Principal
FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_router import api_router
from app.db.session import engine
from app.db.base import Base

# Crear instancia de FastAPI
app = FastAPI(
    title="Aslin 2.0 API",
    description="API REST para sistema de gestión administrativa",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|frontend)(:\\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers de la API
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """
    Evento que se ejecuta al iniciar la aplicación.
    Crea las tablas en la base de datos si no existen.
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Base de datos inicializada")


@app.get("/")
async def root():
    """Endpoint raíz - Información básica de la API"""
    return {
        "message": "Bienvenido a Aslin 2.0 API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado del servidor"""
    return {
        "status": "healthy",
        "service": "Aslin 2.0 Backend",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

