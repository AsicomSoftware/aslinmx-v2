# ⚛️ Guía del Frontend - Aslin 2.0

Documentación de la estructura y funcionamiento del frontend construido con Next.js 15.

## 🏗️ Arquitectura

El frontend está construido con:

- **Next.js 15** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Axios** para peticiones HTTP
- **React Toastify** para notificaciones

## 📁 Estructura de Carpetas

```
frontend/
├── app/                          # App Router de Next.js 15
│   ├── layout.tsx               # Layout raíz
│   ├── page.tsx                 # Página principal
│   ├── login/                   # Módulo de login
│   │   └── page.tsx
│   └── dashboard/               # Módulo de dashboard
│       ├── page.tsx
│       └── components/          # Componentes del dashboard
│           ├── CardInfo.tsx
│           └── DataTable.tsx
├── components/                   # Componentes reutilizables
│   └── ui/                      # Componentes de UI
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/                         # Utilidades y servicios
│   └── apiService.ts           # Cliente de API
├── styles/                      # Estilos globales
│   └── globals.css
├── public/                      # Archivos estáticos
├── next.config.ts              # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
└── package.json                # Dependencias
```

## 🎨 Componentes Reutilizables

### Button

Componente de botón con diferentes variantes y estados.

```tsx
import Button from "@/components/ui/Button";

<Button 
  variant="primary"    // primary | secondary | danger | success
  size="md"           // sm | md | lg
  fullWidth={false}
  loading={false}
  onClick={() => {}}
>
  Click me
</Button>
```

**Props**:
- `variant`: Estilo del botón
- `size`: Tamaño del botón
- `fullWidth`: Si ocupa todo el ancho
- `loading`: Muestra spinner de carga
- `disabled`: Deshabilita el botón
- `type`: Tipo de botón (button | submit | reset)

---

### Input

Campo de entrada con label y validación.

```tsx
import Input from "@/components/ui/Input";

<Input
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  placeholder="usuario@ejemplo.com"
  required={true}
  error="Email inválido"
/>
```

**Props**:
- `label`: Etiqueta del campo
- `type`: Tipo de input
- `name`: Nombre del campo
- `value`: Valor actual
- `onChange`: Función al cambiar
- `placeholder`: Texto placeholder
- `required`: Si es obligatorio
- `disabled`: Si está deshabilitado
- `error`: Mensaje de error

---

### Modal

Modal reutilizable con overlay y animaciones.

```tsx
import Modal from "@/components/ui/Modal";

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Título del Modal"
  size="md"           // sm | md | lg | xl
>
  <div>Contenido del modal</div>
</Modal>
```

**Props**:
- `isOpen`: Estado del modal
- `onClose`: Función para cerrar
- `title`: Título del modal
- `size`: Tamaño del modal
- `children`: Contenido

**Características**:
- Cierra con tecla ESC
- Cierra al hacer click en el overlay
- Bloquea scroll del body cuando está abierto
- Animaciones suaves

---

## 🌐 Servicio de API

El archivo `lib/apiService.ts` centraliza todas las peticiones al backend.

### Configuración

```typescript
import apiService from "@/lib/apiService";
```

### Métodos Disponibles

#### Autenticación

```typescript
// Login
const response = await apiService.login(username, password);
// Retorna: { access_token, token_type }

// Registrar usuario
const user = await apiService.register({
  email: "user@ejemplo.com",
  username: "username",
  password: "password123",
  full_name: "Nombre Completo"
});

// Obtener usuario actual
const currentUser = await apiService.getCurrentUser();
```

#### Usuarios

```typescript
// Listar usuarios
const users = await apiService.getUsers(skip = 0, limit = 100);

// Obtener usuario específico
const user = await apiService.getUser(userId);

// Actualizar usuario
const updated = await apiService.updateUser(userId, {
  email: "newemail@ejemplo.com",
  full_name: "Nuevo Nombre"
});

// Eliminar usuario
await apiService.deleteUser(userId);
```

#### General

```typescript
// Health check
const health = await apiService.healthCheck();
```

### Interceptores

El servicio incluye interceptores automáticos:

1. **Request Interceptor**: Agrega automáticamente el token JWT de localStorage
2. **Response Interceptor**: Redirige a login si el token expira (401)

---

## 🎯 Páginas

### Home (`/`)

Página de bienvenida con enlaces a login y dashboard.

**Ubicación**: `app/page.tsx`

**Características**:
- Diseño moderno con gradientes
- Enlaces a las secciones principales
- Responsive

---

### Login (`/login`)

Página de autenticación.

**Ubicación**: `app/login/page.tsx`

**Funcionalidad**:
- Formulario de login
- Validación de campos
- Guarda token en localStorage
- Redirección a dashboard
- Notificaciones de éxito/error

**Ejemplo de uso**:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await apiService.login(username, password);
    localStorage.setItem("token", response.access_token);
    router.push("/dashboard");
    toast.success("¡Login exitoso!");
  } catch (error) {
    toast.error("Error al iniciar sesión");
  }
};
```

---

### Dashboard (`/dashboard`)

Panel principal de la aplicación.

**Ubicación**: `app/dashboard/page.tsx`

**Funcionalidad**:
- Verifica autenticación
- Carga datos del usuario
- Muestra estadísticas
- Lista de usuarios
- Botón de logout

**Componentes hijos**:

#### CardInfo

Tarjeta de información para estadísticas.

```tsx
<CardInfo
  title="Total Usuarios"
  value={users.length}
  icon="👥"
  color="blue"
/>
```

#### DataTable

Tabla para mostrar lista de usuarios.

```tsx
<DataTable users={users} />
```

---

## 🔐 Autenticación

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Se envía petición a `/api/v1/users/login`
3. Backend retorna JWT token
4. Token se guarda en `localStorage`
5. Token se incluye automáticamente en peticiones futuras
6. Si token expira, se redirige a login

### Proteger Rutas

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  // Resto del componente
}
```

### Logout

```typescript
const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
  toast.success("Sesión cerrada");
};
```

---

## 🎨 Estilos y Temas

### Tailwind CSS

El proyecto usa Tailwind CSS con configuración personalizada.

**Colores personalizados**:

```javascript
// tailwind.config.ts
colors: {
  primary: {
    50: '#f0f9ff',
    // ... hasta 900
  },
  secondary: {
    50: '#faf5ff',
    // ... hasta 900
  }
}
```

**Uso**:

```tsx
<div className="bg-primary-500 text-white p-4 rounded-lg">
  Contenido
</div>
```

### Clases Personalizadas

Definidas en `styles/globals.css`:

```css
.card-shadow {
  /* Sombra para tarjetas */
}

.card-shadow-hover:hover {
  /* Efecto hover con elevación */
}
```

---

## 🔔 Notificaciones

### React Toastify

Configurado en `app/layout.tsx`.

**Uso**:

```typescript
import { toast } from "react-toastify";

// Notificación de éxito
toast.success("¡Operación exitosa!");

// Notificación de error
toast.error("Ocurrió un error");

// Notificación de info
toast.info("Información importante");

// Notificación de advertencia
toast.warn("¡Atención!");
```

**Configuración**:

```tsx
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  theme="light"
/>
```

---

## 🚀 Desarrollo

### Comandos

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

### Hot Reload

Next.js detecta cambios automáticamente y recarga la página.

### Variables de Entorno

Archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Uso en código**:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Importante**: Las variables que empiezan con `NEXT_PUBLIC_` son accesibles en el cliente.

---

## 📱 Responsive Design

Todos los componentes son responsive usando clases de Tailwind:

```tsx
<div className="
  grid 
  grid-cols-1        /* 1 columna en móvil */
  md:grid-cols-2     /* 2 columnas en tablet */
  lg:grid-cols-3     /* 3 columnas en desktop */
  gap-4
">
  {/* Contenido */}
</div>
```

**Breakpoints de Tailwind**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🧩 Agregar Nuevos Módulos

### 1. Crear Nueva Página

```bash
# Crear carpeta para el módulo
mkdir -p app/mi-modulo
touch app/mi-modulo/page.tsx
```

### 2. Estructura del Módulo

```
app/mi-modulo/
├── page.tsx                 # Página principal
├── components/              # Componentes del módulo
│   ├── ComponenteA.tsx
│   └── ComponenteB.tsx
└── [id]/                    # Ruta dinámica
    └── page.tsx
```

### 3. Template de Página

```tsx
"use client";

import { useState, useEffect } from "react";

export default function MiModuloPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Cargar datos
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Mi Nuevo Módulo</h1>
      {/* Contenido */}
    </div>
  );
}
```

### 4. Agregar al Servicio de API

```typescript
// lib/apiService.ts

const miModuloService = {
  getItems: async () => {
    const response = await api.get("/mi-modulo/");
    return response.data;
  },
  
  createItem: async (data: any) => {
    const response = await api.post("/mi-modulo/", data);
    return response.data;
  }
};

// Agregar al export
const apiService = {
  ...authService,
  ...userService,
  ...miModuloService,
};
```

---

## 🧪 Testing (Futuro)

Para agregar tests:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

Ejemplo de test:

```typescript
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## 📝 Mejores Prácticas

1. **Componentes Client vs Server**:
   - Usa `"use client"` solo cuando necesites interactividad
   - Server components por defecto para mejor performance

2. **Organización**:
   - Componentes reutilizables en `/components`
   - Componentes específicos de página en carpeta del módulo

3. **Estado**:
   - Usa `useState` para estado local
   - Considera Context API o Zustand para estado global

4. **Tipos TypeScript**:
   - Define interfaces para props y datos
   - Usa tipos específicos en lugar de `any`

5. **Estilos**:
   - Prefiere Tailwind sobre CSS custom
   - Usa clases semánticas

---

## 🔮 Próximas Mejoras

- [ ] Context API para estado global
- [ ] Middleware de autenticación
- [ ] Tests unitarios e integración
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] PWA capabilities
- [ ] Optimización de imágenes
- [ ] SEO mejorado

---

Para más información sobre Next.js 15, visita: https://nextjs.org/docs

