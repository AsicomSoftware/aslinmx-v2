# 🔌 Guía de API - Aslin 2.0

Documentación completa de los endpoints disponibles en la API REST de Aslin 2.0.

## 📡 Información General

- **Base URL**: `http://localhost:8000/api/v1`
- **Documentación Interactiva**: http://localhost:8000/docs
- **Formato**: JSON
- **Autenticación**: JWT (Bearer Token)

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. La mayoría de los endpoints requieren un token válido.

### Obtener Token

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Usar el Token

Incluye el token en el header `Authorization` de todas las peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👤 Endpoints de Usuarios

### 1. Registrar Usuario

Crea un nuevo usuario en el sistema.

```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": null
}
```

**Errores**:
- `400`: Email o username ya existe
- `422`: Datos de validación incorrectos

---

### 2. Login

Autentica un usuario y retorna un token JWT.

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores**:
- `401`: Credenciales incorrectas
- `400`: Usuario inactivo

---

### 3. Obtener Usuario Actual

Obtiene información del usuario autenticado.

```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": null
}
```

---

### 4. Listar Usuarios

Obtiene lista de usuarios con paginación.

```http
GET /api/v1/users/?skip=0&limit=100
Authorization: Bearer {token}
```

**Parámetros Query**:
- `skip` (opcional): Número de registros a saltar (default: 0)
- `limit` (opcional): Número máximo de registros (default: 100)

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": 1,
    "email": "usuario1@ejemplo.com",
    "username": "usuario1",
    "full_name": "Usuario Uno",
    "is_active": true,
    "is_superuser": false,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": null
  },
  {
    "id": 2,
    "email": "usuario2@ejemplo.com",
    "username": "usuario2",
    "full_name": "Usuario Dos",
    "is_active": true,
    "is_superuser": false,
    "created_at": "2024-01-15T11:00:00",
    "updated_at": null
  }
]
```

---

### 5. Obtener Usuario por ID

Obtiene información de un usuario específico.

```http
GET /api/v1/users/{user_id}
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": null
}
```

**Errores**:
- `404`: Usuario no encontrado

---

### 6. Actualizar Usuario

Actualiza información de un usuario.

```http
PUT /api/v1/users/{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "full_name": "Nuevo Nombre",
  "password": "nuevaContraseña123"
}
```

**Nota**: Todos los campos son opcionales.

**Respuesta Exitosa (200)**:
```json
{
  "id": 1,
  "email": "nuevo@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nuevo Nombre",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T14:20:00"
}
```

---

### 7. Eliminar Usuario

Elimina un usuario del sistema.

```http
DELETE /api/v1/users/{user_id}
Authorization: Bearer {token}
```

**Respuesta Exitosa (204)**: Sin contenido

**Errores**:
- `404`: Usuario no encontrado

---

## ❤️ Health Check

Verifica el estado del servidor.

```http
GET /health
```

**Respuesta Exitosa (200)**:
```json
{
  "status": "healthy",
  "service": "Aslin 2.0 Backend",
  "version": "2.0.0"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Operación exitosa sin contenido |
| 400 | Bad Request - Datos inválidos o error de validación |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación de datos |
| 500 | Internal Server Error - Error del servidor |

---

## 🔒 Seguridad

### Token Expiración

Los tokens JWT expiran después de **30 minutos** (configurable en `.env`).

### Renovar Token

Cuando un token expira (error 401), debes hacer login nuevamente para obtener uno nuevo.

### Protección de Contraseñas

- Las contraseñas se hashean con bcrypt
- Nunca se retornan en las respuestas de la API
- Longitud mínima: 6 caracteres

---

## 📝 Ejemplos con cURL

### Registrar y Login

```bash
# Registrar nuevo usuario
curl -X POST "http://localhost:8000/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "username": "testuser",
    "full_name": "Usuario Test",
    "password": "test123456"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
```

### Peticiones Autenticadas

```bash
# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Obtener usuario actual
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN"

# Listar usuarios
curl -X GET "http://localhost:8000/api/v1/users/?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Ejemplos con JavaScript/TypeScript

### Usando Axios

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Login
const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/users/login`, {
    username,
    password
  });
  
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return token;
};

// Petición autenticada
const getUsers = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(`${API_URL}/users/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

---

## 🧪 Testing con Swagger

La forma más fácil de probar la API es usando la documentación interactiva:

1. Visita http://localhost:8000/docs
2. Expande el endpoint que quieres probar
3. Click en "Try it out"
4. Rellena los parámetros
5. Click en "Execute"

Para endpoints protegidos:
1. Primero haz login en `/api/v1/users/login`
2. Copia el `access_token`
3. Click en el botón "Authorize" (🔒) en la parte superior
4. Pega el token en el formato: `Bearer {tu_token}`
5. Ahora puedes probar endpoints protegidos

---

## 📌 Notas Importantes

1. **CORS**: El backend está configurado para aceptar peticiones desde `http://localhost:3000`. Para agregar más orígenes, edita `CORS_ORIGINS` en `.env`.

2. **Rate Limiting**: Actualmente no hay límite de peticiones, pero se recomienda implementarlo en producción.

3. **Paginación**: Los endpoints que retornan listas soportan paginación con `skip` y `limit`.

4. **Validación**: Todos los datos se validan con Pydantic antes de procesarse.

---

## 🔮 Endpoints Futuros

Los siguientes módulos serán agregados próximamente:

- `/api/v1/siniestros` - Gestión de siniestros
- `/api/v1/bitacora` - Registro de actividades
- `/api/v1/reportes` - Generación de reportes
- `/api/v1/analytics` - Analíticas y estadísticas

---

Para más información, consulta la documentación interactiva en http://localhost:8000/docs

