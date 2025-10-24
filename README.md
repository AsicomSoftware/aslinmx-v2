# 🚀 ASLIN 2.0

Sistema modular de gestión administrativa construido con arquitectura moderna y escalable.

## 📋 Descripción

**Aslin 2.0** es una aplicación web full-stack diseñada para gestionar procesos administrativos de manera eficiente. Incluye módulos para usuarios, siniestros, bitácoras y reportes.

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.12+**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **Alembic** - Migraciones de base de datos
- **Pydantic** - Validación de datos
- **JWT** - Autenticación segura
- **PostgreSQL** - Base de datos relacional

### Frontend
- **Next.js 15+** - Framework React con App Router
- **Tailwind CSS** - Estilos modernos y responsivos
- **Axios** - Cliente HTTP
- **React Toastify** - Notificaciones

### DevOps
- **Docker & Docker Compose** - Contenedorización
- **Uvicorn** - Servidor ASGI

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado
- Docker Compose

### Levantar el Proyecto

```bash
# Clonar el repositorio
git clone <repository-url>
cd Aslin

# Copiar variables de entorno (si es necesario modificar)
# El archivo .env ya está configurado por defecto

# Levantar todos los servicios
docker-compose up --build

# El backend estará disponible en: http://localhost:8000
# El frontend estará disponible en: http://localhost:3000
# La documentación API (Swagger): http://localhost:8000/docs
```

### Comandos Útiles

```bash
# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Ejecutar migraciones manualmente
docker-compose exec backend alembic upgrade head
```

## 📁 Estructura del Proyecto

```
Aslin/
├── backend/          # API REST con FastAPI
├── frontend/         # Aplicación Next.js
├── docs/            # Documentación del proyecto
├── docker-compose.yml
├── .env             # Variables de entorno
└── README.md
```

## 📚 Documentación

Para más información detallada, consulta la carpeta `docs/`:

- [Setup Guide](./docs/SETUP.md) - Guía de instalación y configuración
- [API Guide](./docs/API_GUIDE.md) - Documentación de la API
- [Frontend Guide](./docs/FRONT_GUIDE.md) - Estructura del frontend

## 🔒 Seguridad

- JWT para autenticación
- Variables de entorno para credenciales
- CORS configurado
- Validación de datos con Pydantic

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado para Aslin 2.0

---

**¿Necesitas ayuda?** Revisa la documentación en `docs/` o contacta al equipo de desarrollo.

