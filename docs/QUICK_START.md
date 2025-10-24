# ⚡ Inicio Rápido - Aslin 2.0

> **Nota**: Esta guía es un resumen rápido. Para información completa, consulta [SETUP.md](./SETUP.md)

Guía express para tener Aslin 2.0 funcionando en 5 minutos.

## 🎯 Pasos Rápidos

### 1️⃣ Verificar Requisitos

```bash
docker --version
docker-compose --version
```

Si no tienes Docker instalado, descárgalo desde: https://www.docker.com/products/docker-desktop

### 2️⃣ Configurar Variables de Entorno

El archivo `.env` ya debe existir en la raíz del proyecto. Si no existe, créalo con:

```env
# DATABASE
DATABASE_URL=postgresql://aslin_user:aslin_password@db:5432/aslin_db
POSTGRES_USER=aslin_user
POSTGRES_PASSWORD=aslin_password
POSTGRES_DB=aslin_db

# BACKEND
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# FRONTEND
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_PORT=3000

# CORS
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
```

### 3️⃣ Levantar el Proyecto

```bash
# Opción 1: Usando Makefile (recomendado)
make install

# Opción 2: Docker Compose directo
docker-compose up --build -d
```

### 4️⃣ Verificar que Todo Funciona

Abre tu navegador y verifica:

✅ **Frontend**: http://localhost:3000  
✅ **Backend API**: http://localhost:8000  
✅ **API Docs (Swagger)**: http://localhost:8000/docs  
✅ **Health Check**: http://localhost:8000/health  

### 5️⃣ Crear Usuario de Prueba

Opción A - Desde la API (Swagger):
1. Ve a http://localhost:8000/docs
2. Expande `POST /api/v1/users/register`
3. Click en "Try it out"
4. Ingresa datos de prueba:
```json
{
  "email": "admin@aslin.com",
  "username": "admin",
  "full_name": "Administrador",
  "password": "admin123"
}
```
5. Click en "Execute"

Opción B - Desde cURL:
```bash
curl -X POST "http://localhost:8000/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aslin.com",
    "username": "admin",
    "full_name": "Administrador",
    "password": "admin123"
  }'
```

### 6️⃣ Iniciar Sesión

1. Ve a http://localhost:3000/login
2. Ingresa las credenciales que creaste
3. ¡Listo! Serás redirigido al dashboard

## 🎉 ¡Ya está!

Ahora tienes:
- ✅ Backend FastAPI corriendo con JWT
- ✅ Frontend Next.js 15 con Tailwind CSS
- ✅ PostgreSQL configurado
- ✅ CRUD de usuarios funcionando
- ✅ Documentación automática

## 📚 Próximos Pasos

### Ver Logs
```bash
# Todos los servicios
make logs

# Solo backend
make logs-backend

# Solo frontend
make logs-frontend
```

### Acceder a Contenedores
```bash
# Backend
make shell-backend

# Frontend
make shell-frontend

# Base de datos
make shell-db
```

### Migraciones de Base de Datos
```bash
# Crear migración
make migrate-create MSG="descripción de la migración"

# Aplicar migraciones
make migrate

# Revertir migración
make migrate-down
```

### Detener Servicios
```bash
# Detener (mantiene datos)
make down

# Detener y borrar todo (¡CUIDADO!)
make down-v
```

## 🛠️ Comandos Útiles

```bash
make help           # Ver todos los comandos disponibles
make up             # Levantar servicios
make down           # Detener servicios
make restart        # Reiniciar servicios
make logs           # Ver logs
make test           # Ejecutar tests
make status         # Ver estado de servicios
```

## 📖 Documentación Completa

Para información detallada, consulta:

- **[SETUP.md](./SETUP.md)** - Guía completa de configuración y troubleshooting
- **[API_GUIDE.md](./API_GUIDE.md)** - Documentación completa de la API
- **[FRONT_GUIDE.md](./FRONT_GUIDE.md)** - Guía del frontend y componentes

## 🆘 Problemas Comunes

### Puerto ocupado
```bash
# Cambiar puertos en docker-compose.yml
# Buscar "ports:" y modificar el valor de la izquierda
```

### No conecta a la base de datos
```bash
# Verificar estado
make status

# Reiniciar
make restart

# Ver logs
make logs-db
```

### Cambios no se reflejan
```bash
# Reconstruir
make down
make up-build
```

## 🎨 Estructura del Proyecto

> Para estructura detallada, consulta [SETUP.md](./SETUP.md)

```
Aslin/
├── backend/          # API FastAPI
├── frontend/         # Next.js 15
├── docs/             # Documentación
├── db/               # Scripts de base de datos
└── docker-compose.yml
```

## 🚀 Desarrollo

Para desarrollo activo:

1. Los cambios en backend/frontend se reflejan automáticamente (hot reload)
2. Usa `make logs` para ver cambios en tiempo real
3. Consulta `/docs` para probar endpoints
4. Revisa la documentación para entender la arquitectura

## 🔐 Usuarios Iniciales

El sistema viene con usuarios preconfigurados:

- **SuperAdmin**: `desarrollo@asicomsystems.com.mx` / `123456789`
- **Administrador**: `usuario@dxlegal.mx` / `123456789`

> Para más detalles, consulta [SETUP.md](./SETUP.md)

---

**¿Necesitas ayuda?** Revisa la documentación completa en la carpeta `docs/` o consulta los logs con `make logs`.

¡Feliz desarrollo! 🎉

