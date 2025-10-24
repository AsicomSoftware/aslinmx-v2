# 🔌 Guía de API - Aslin 2.0

Documentación completa de los endpoints disponibles en la API REST de Aslin 2.0.

## 📡 Información General

- **Base URL**: `http://localhost:8000/api/v1`
- **Documentación Interactiva**: http://localhost:8000/docs
- **Formato**: JSON
- **Autenticación**: JWT (Bearer Token) + 2FA (TOTP)
- **Versión**: 2.0.0

### 📋 Nota sobre la Estructura de Datos

El sistema utiliza una estructura de base de datos completamente en español:

**Base de Datos (Español)**:
- **Tablas**: `usuarios`, `empresas`, `roles`, `usuario_perfiles`, `usuario_contactos`, `usuario_direcciones`, `usuario_2fa`
- **Campos**: `correo`, `password_hash`, `activo`, `creado_en`, `actualizado_en`, `nombre`, `apellido_paterno`, `apellido_materno`
- **IDs**: UUIDs generados automáticamente
- **Relaciones**: Usuario tiene perfil, contactos, dirección y configuración 2FA en tablas separadas

**API (Inglés para compatibilidad)**:
- La API mantiene nombres en inglés (`email`, `is_active`, `created_at`, etc.) para compatibilidad con estándares internacionales
- Los sinónimos en el modelo permiten mapear entre ambos formatos
- Esto facilita la integración con frontends y herramientas externas

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) con soporte para autenticación de doble factor (2FA) usando TOTP. La mayoría de los endpoints requieren un token válido.

### Flujo de Autenticación

#### 1. Login Inicial

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

**Respuesta con 2FA habilitado (200)**:
```json
{
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requires_2fa": true,
  "message": "Ingresa el código 2FA"
}
```

**Respuesta sin 2FA (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "requires_2fa": false
}
```

#### 2. Verificar 2FA (si está habilitado)

```http
POST /api/v1/users/2fa/verify
Content-Type: application/json

{
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null,
  "empresa": null,
  "rol": null,
  "perfil": null,
  "contactos": null,
  "direccion": null,
  "two_factor_enabled": false,
  "two_factor_verified_at": null
}
```

**Errores**:
- `400`: Email o username ya existe
- `422`: Datos de validación incorrectos

---

### 2. Login

Autentica un usuario y retorna un token JWT. Si el usuario tiene 2FA habilitado, retorna un token temporal que debe ser verificado.

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "contraseña123"
}
```

**Respuesta con 2FA habilitado (200)**:
```json
{
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requires_2fa": true,
  "message": "Ingresa el código 2FA"
}
```

**Respuesta sin 2FA (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "requires_2fa": false
}
```

**Errores**:
- `401`: Credenciales incorrectas
- `400`: Usuario inactivo

---

### 3. Verificar 2FA

Verifica el código TOTP y retorna el token de acceso final.

```http
POST /api/v1/users/2fa/verify
Content-Type: application/json

{
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
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
- `401`: Código 2FA inválido o token expirado

---

### 4. Obtener Usuario Actual

Obtiene información del usuario autenticado.

```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null,
  "empresa": null,
  "rol": null,
  "perfil": null,
  "contactos": null,
  "direccion": null,
  "two_factor_enabled": false,
  "two_factor_verified_at": null
}
```

---

### 5. Listar Usuarios

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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario1@ejemplo.com",
    "username": "usuario1",
    "full_name": "Usuario Uno",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": null,
    "empresa": null,
    "rol": null,
    "perfil": null,
    "contactos": null,
    "direccion": null,
    "two_factor_enabled": false,
    "two_factor_verified_at": null
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "usuario2@ejemplo.com",
    "username": "usuario2",
    "full_name": "Usuario Dos",
    "is_active": true,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": null,
    "empresa": null,
    "rol": null,
    "perfil": null,
    "contactos": null,
    "direccion": null,
    "two_factor_enabled": false,
    "two_factor_verified_at": null
  }
]
```

---

### 6. Obtener Usuario por ID

Obtiene información de un usuario específico.

```http
GET /api/v1/users/{user_id}
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nombre Completo",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null,
  "empresa": null,
  "rol": null,
  "perfil": null,
  "contactos": null,
  "direccion": null,
  "two_factor_enabled": false,
  "two_factor_verified_at": null
}
```

**Errores**:
- `404`: Usuario no encontrado

---

### 7. Actualizar Usuario

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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "nuevo@ejemplo.com",
  "username": "usuario123",
  "full_name": "Nuevo Nombre",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "empresa": null,
  "rol": null,
  "perfil": null,
  "contactos": null,
  "direccion": null,
  "two_factor_enabled": false,
  "two_factor_verified_at": null
}
```

---

### 8. Eliminar Usuario

Elimina un usuario del sistema.

```http
DELETE /api/v1/users/{user_id}
Authorization: Bearer {token}
```

**Respuesta Exitosa (204)**: Sin contenido

**Errores**:
- `404`: Usuario no encontrado

---

### 9. Actualizar Perfil de Usuario Actual

Actualiza información del perfil, contactos y dirección del usuario autenticado.

```http
PUT /api/v1/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "perfil": {
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "titulo": "Ing.",
    "cedula_profesional": "12345678"
  },
  "contactos": {
    "telefono": "555-1234",
    "celular": "555-5678"
  },
  "direccion": {
    "direccion": "Calle Principal 123",
    "ciudad": "Ciudad de México",
    "estado": "CDMX",
    "codigo_postal": "01000",
    "pais": "México"
  }
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Juan Pérez García",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "empresa": null,
  "rol": null,
  "perfil": {
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "titulo": "Ing.",
    "cedula_profesional": "12345678"
  },
  "contactos": {
    "telefono": "555-1234",
    "celular": "555-5678"
  },
  "direccion": {
    "direccion": "Calle Principal 123",
    "ciudad": "Ciudad de México",
    "estado": "CDMX",
    "codigo_postal": "01000",
    "pais": "México"
  },
  "two_factor_enabled": false,
  "two_factor_verified_at": null
}
```

---

### 10. Cambiar Contraseña

Cambia la contraseña del usuario autenticado.

```http
PUT /api/v1/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "contraseña_actual",
  "new_password": "nueva_contraseña123"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "success": true,
  "detail": "Contraseña actualizada"
}
```

---

### 11. Habilitar/Deshabilitar 2FA

Habilita o deshabilita la autenticación de doble factor.

```http
POST /api/v1/users/me/2fa/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "enable": true,
  "code": "123456"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "success": true,
  "detail": "Estado de 2FA actualizado"
}
```

---

### 12. Obtener URI para Configurar 2FA

Obtiene la URI para configurar la aplicación de autenticación 2FA.

```http
GET /api/v1/users/me/2fa/otpauth
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "otpauth_url": "otpauth://totp/Aslin%202.0:usuario@ejemplo.com?secret=JBSWY3DPEHPK3PXP&issuer=Aslin%202.0"
}
```

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

# Login (sin 2FA)
curl -X POST "http://localhost:8000/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@ejemplo.com",
    "password": "test123456"
  }'

# Login con 2FA (paso 1)
curl -X POST "http://localhost:8000/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@ejemplo.com",
    "password": "test123456"
  }'

# Verificar 2FA (paso 2)
curl -X POST "http://localhost:8000/api/v1/users/2fa/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "code": "123456"
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

# Actualizar perfil de usuario
curl -X PUT "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "perfil": {
      "nombre": "Juan",
      "apellido_paterno": "Pérez",
      "apellido_materno": "García"
    },
    "contactos": {
      "telefono": "555-1234",
      "celular": "555-5678"
    }
  }'

# Cambiar contraseña
curl -X PUT "http://localhost:8000/api/v1/users/me/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "contraseña_actual",
    "new_password": "nueva_contraseña123"
  }'

# Obtener URI para configurar 2FA
curl -X GET "http://localhost:8000/api/v1/users/me/2fa/otpauth" \
  -H "Authorization: Bearer $TOKEN"

# Habilitar 2FA
curl -X POST "http://localhost:8000/api/v1/users/me/2fa/toggle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enable": true,
    "code": "123456"
  }'
```

---

## 📚 Ejemplos con JavaScript/TypeScript

### Usando Axios

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Login con soporte para 2FA
const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/users/login`, {
    username,
    password
  });
  
  if (response.data.requires_2fa) {
    // Retorna temp_token para verificar 2FA
    return {
      requires_2fa: true,
      temp_token: response.data.temp_token
    };
  } else {
    // Login directo sin 2FA
    const token = response.data.access_token;
    localStorage.setItem('token', token);
    return { access_token: token };
  }
};

// Verificar 2FA
const verify2FA = async (tempToken: string, code: string) => {
  const response = await axios.post(`${API_URL}/users/2fa/verify`, {
    temp_token: tempToken,
    code
  });
  
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return token;
};

// Obtener usuario actual
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Actualizar perfil de usuario
const updateProfile = async (profileData: any) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.put(`${API_URL}/users/me`, profileData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
- `/api/v1/agenda` - Gestión de agenda
- `/api/v1/empresas` - Gestión de empresas
- `/api/v1/roles` - Gestión de roles y permisos
- `/api/v1/parametros` - Configuración de parámetros
- `/api/v1/reportes` - Generación de reportes
- `/api/v1/configuracion` - Configuración del sistema
- `/api/v1/historico` - Histórico de actividades
- `/api/v1/soporte` - Ayuda y soporte
- `/api/v1/menus` - Gestión de menús y navegación
- `/api/v1/accesos` - Log de accesos al sistema

### Estructura de Menús Predefinida

El sistema incluye una estructura de menús en español:

1. **Dashboard** (`/dashboard`) - Panel principal
2. **Siniestros** (`/siniestros`) - Gestión de siniestros
3. **Agenda** (`/agenda`) - Calendario y citas
4. **Empresas** (`/empresas`) - Gestión de empresas
5. **Usuarios y Roles** (`/usuarios`) - Administración de usuarios
6. **Parámetros** (`/parametros`) - Configuración de parámetros
7. **Reportes** (`/reportes`) - Generación de reportes
8. **Configuración** (`/configuracion`) - Configuración del sistema
9. **Histórico** (`/historico`) - Histórico de actividades
10. **Ayuda y Soporte** (`/soporte`) - Ayuda y soporte

---

Para más información, consulta la documentación interactiva en http://localhost:8000/docs

