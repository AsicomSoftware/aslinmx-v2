# 📖 Guía de Configuración - Aslin 2.0

Esta guía te ayudará a configurar y ejecutar el proyecto Aslin 2.0 en tu entorno local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** (v20.10 o superior)
- **Docker Compose** (v2.0 o superior)
- **Git** (para clonar el repositorio)

### Verificar instalación

```bash
docker --version
docker-compose --version
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/AsicomSoftware/aslinmx-v2.git
cd Aslin

# Agregar upstream para sincronizar cambios (opcional)
git remote add upstream https://github.com/AsicomSoftware/aslinmx-v2.git
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya viene configurado con valores por defecto. Si necesitas modificarlo:

```bash
# Editar archivo .env
# Cambiar valores según tus necesidades

# Variables importantes:
# - DATABASE_URL: Conexión a PostgreSQL
# - SECRET_KEY: Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
# - CORS_ORIGINS: Orígenes permitidos para CORS
# - NEXT_PUBLIC_API_URL: URL del backend para el frontend
```

### 3. Levantar el Proyecto

```bash
# Opción 1: Usar Makefile (recomendado)
make install

# Opción 2: Docker Compose directo
docker-compose up --build -d
```

Este comando levantará:
- **PostgreSQL 15** en puerto `5432`
- **Backend (FastAPI)** en puerto `8000`
- **Frontend (Next.js 15)** en puerto `3000`

**Nota**: El comando `make install` incluye:
- Construcción de imágenes
- Levantamiento de servicios
- Espera automática para que los servicios estén listos
- Información de URLs disponibles

### 4. Verificar que Todo Funciona

Una vez que los servicios estén corriendo:

1. **Backend API**: http://localhost:8000
2. **API Docs (Swagger)**: http://localhost:8000/docs
3. **Frontend**: http://localhost:3000
4. **Health Check**: http://localhost:8000/health

## 🗄️ Base de Datos

### Crear Migración Inicial

```bash
# Crear primera migración usando Makefile
make migrate-create MSG="Initial migration"

# Aplicar migraciones
make migrate

# O usando Docker Compose directamente
docker-compose exec backend alembic revision --autogenerate -m "Initial migration"
docker-compose exec backend alembic upgrade head
```

### Comandos Útiles de Alembic

```bash
# Usando Makefile (recomendado)
make migrate                    # Aplicar migraciones
make migrate-create MSG="mensaje"  # Crear migración
make migrate-down               # Revertir última migración

# Usando Docker Compose directamente
docker-compose exec backend alembic history
docker-compose exec backend alembic downgrade -1
docker-compose exec backend alembic upgrade <revision_id>
```

## 👤 Usuarios Iniciales

El sistema viene con usuarios preconfigurados según el archivo `db/main_db.sql`:

### Usuarios Disponibles

1. **SuperAdmin**:
   - **Email**: `desarrollo@asicomsystems.com.mx`
   - **Contraseña**: `123456789`
   - **Rol**: SuperAdmin (acceso completo)
   - **Empresa**: DX Legal
   - **Multiempresa**: Sí

2. **Administrador**:
   - **Email**: `usuario@dxlegal.mx`
   - **Contraseña**: `123456789`
   - **Rol**: Administrador
   - **Empresa**: DX Legal
   - **Multiempresa**: No

### Empresa Inicial

- **Nombre**: DX Legal
- **Alias**: dxlegal
- **Colores**: Principal #c43267, Secundario #2b4f83, Terciario #3098cb

### Crear Usuario Adicional

También puedes crear un usuario de prueba usando la API:

```bash
curl -X POST "http://localhost:8000/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "username": "testuser",
    "full_name": "Usuario Test",
    "password": "test123456"
  }'
```

O desde la interfaz web en: http://localhost:3000/login

## 🛠️ Comandos Útiles

### Usando Makefile (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Gestión de servicios
make up                      # Levantar servicios
make down                    # Detener servicios
make restart                 # Reiniciar servicios
make status                  # Ver estado de servicios

# Logs
make logs                    # Ver logs de todos los servicios
make logs-backend            # Ver logs del backend
make logs-frontend           # Ver logs del frontend
make logs-db                 # Ver logs de la base de datos

# Base de datos
make migrate                 # Aplicar migraciones
make migrate-create MSG="mensaje"  # Crear migración
make migrate-down            # Revertir última migración
make shell-db                # Acceder a PostgreSQL

# Desarrollo
make shell-backend           # Acceder al shell del backend
make shell-frontend          # Acceder al shell del frontend
make test                    # Ejecutar tests
make test-cov                # Tests con cobertura
make clean                   # Limpiar contenedores e imágenes
```

### Comandos Docker Directos

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Reiniciar servicios
docker-compose restart
docker-compose restart backend

# Detener servicios
docker-compose down          # Mantiene volúmenes
docker-compose down -v       # Elimina volúmenes (¡CUIDADO!)

# Acceder a contenedores
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec db psql -U root -d aslin_mx_v2
```

## 🧪 Ejecutar Tests

```bash
# Tests del backend usando Makefile
make test

# Tests con coverage
make test-cov

# O usando Docker Compose directamente
docker-compose exec backend pytest
docker-compose exec backend pytest --cov=app --cov-report=html
```

## 🔧 Desarrollo Local (Sin Docker)

Si prefieres trabajar sin Docker:

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Levantar servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Levantar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

**Nota**: Recuerda ajustar las URLs en `.env` si trabajas localmente sin Docker.

## 📝 Notas Importantes

1. **Primera vez**: El primer `docker-compose up` puede tardar varios minutos mientras descarga las imágenes y construye los contenedores.

2. **Puertos ocupados**: Si los puertos 3000, 8000 o 5432 están ocupados, puedes cambiarlos en el archivo `docker-compose.yml`.

3. **Hot Reload**: Tanto el backend como el frontend están configurados con hot reload. Los cambios en el código se reflejarán automáticamente.

4. **Base de datos**: Los datos de PostgreSQL persisten en un volumen de Docker. Si quieres resetear la BD, usa `docker-compose down -v`.

5. **Producción**: Antes de desplegar en producción:
   - Cambia el `SECRET_KEY` en `.env`
   - Usa contraseñas seguras para la base de datos
   - Configura correctamente `CORS_ORIGINS`
   - Deshabilita el modo debug/reload

## ❓ Problemas Comunes

### "Port already in use"

```bash
# Encontrar proceso usando el puerto
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# Matar proceso o cambiar puerto en docker-compose.yml
```

### "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de la base de datos
docker-compose logs db

# Reiniciar servicios
docker-compose restart
```

### Cambios no se reflejan

```bash
# Reconstruir contenedores
docker-compose up --build

# Limpiar y reconstruir
docker-compose down
docker-compose up --build
```

## 📞 Soporte

Si encuentras algún problema no cubierto en esta guía, revisa:

1. Los logs con `docker-compose logs -f`
2. La documentación de la API en `/docs`
3. Los issues del repositorio

---

¡Listo! Ahora tienes Aslin 2.0 corriendo en tu máquina. 🚀

