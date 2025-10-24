# 🤝 Guía de Contribución - Aslin 2.0

¡Gracias por tu interés en contribuir a Aslin 2.0!

## 📋 Antes de Empezar

1. Lee la documentación en la carpeta `docs/`
2. Familiarízate con la estructura del proyecto
3. Configura tu entorno de desarrollo local

## 🔀 Flujo de Trabajo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/AsicomSoftware/aslinmx-v2.git
cd Aslin

# Agregar upstream para sincronizar cambios
git remote add upstream https://github.com/AsicomSoftware/aslinmx-v2.git
```

### 2. Crear Rama

```bash
# Crea una rama para tu feature/fix
git checkout -b feature/nueva-caracteristica
# o
git checkout -b fix/correccion-bug
```

**Convención de nombres**:
- `feature/nombre` - Nueva funcionalidad
- `fix/nombre` - Corrección de bug
- `docs/nombre` - Cambios en documentación
- `refactor/nombre` - Refactorización de código
- `test/nombre` - Agregar o modificar tests

### 3. Desarrollo

```bash
# Levantar entorno usando Makefile (recomendado)
make install

# O usando Docker Compose directamente
docker-compose up --build -d

# Hacer cambios en el código
# ...

# Probar cambios
make test

# Ver logs si hay problemas
make logs-backend
make logs-frontend
```

### 4. Commit

Usamos commits semánticos:

```bash
git commit -m "feat: agregar endpoint de reportes"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar guía de API"
```

**Tipos de commit**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo (sin cambios de código)
- `refactor`: Refactorización
- `test`: Agregar tests
- `chore`: Tareas de mantenimiento

### 5. Sincronizar con Upstream

```bash
# Antes de crear tu PR, sincroniza con los cambios más recientes
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 6. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nueva-caracteristica

# Luego crea un Pull Request en GitHub
```

## ✅ Checklist para Pull Requests

Antes de crear un PR, verifica:

- [ ] El código sigue las convenciones del proyecto
- [ ] Se agregaron/actualizaron tests si es necesario
- [ ] Todos los tests pasan (`make test`)
- [ ] Se actualizó la documentación si es necesario
- [ ] El código está formateado correctamente
- [ ] No hay errores de linting
- [ ] Se probó en ambiente local con Docker
- [ ] El commit message sigue el formato semántico
- [ ] Se sincronizó con la rama main más reciente
- [ ] Se probó la funcionalidad en el frontend y backend

## 📝 Estándares de Código

### Backend (Python)

- Sigue PEP 8
- Usa type hints
- Documenta funciones con docstrings
- Máximo 100 caracteres por línea

```python
def crear_usuario(
    db: Session,
    email: str,
    username: str
) -> User:
    """
    Crea un nuevo usuario en la base de datos.
    
    Args:
        db: Sesión de base de datos
        email: Email del usuario
        username: Nombre de usuario
    
    Returns:
        Usuario creado
    """
    # implementación
```

### Frontend (TypeScript)

- Usa TypeScript estrictamente
- Define interfaces para props
- Usa componentes funcionales
- Usa Tailwind CSS para estilos

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ 
  children, 
  onClick, 
  variant = "primary" 
}: ButtonProps) {
  // implementación
}
```

## 🧪 Tests

### Backend

```bash
# Ejecutar tests usando Makefile
make test

# Con cobertura
make test-cov

# Test específico
docker-compose exec backend pytest app/tests/test_user.py

# Ver reporte de cobertura
open htmlcov/index.html  # En macOS
start htmlcov/index.html  # En Windows
```

### Escribir Tests

```python
def test_crear_usuario():
    """Test de creación de usuario"""
    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "test@ejemplo.com",
            "username": "testuser",
            "password": "test123"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@ejemplo.com"
```

## 📚 Documentación

Si agregas nuevas funcionalidades:

1. Actualiza `docs/API_GUIDE.md` para nuevos endpoints
2. Actualiza `docs/FRONT_GUIDE.md` para nuevos componentes
3. Agrega comentarios en el código
4. Actualiza el README si es necesario
5. Actualiza `docs/SETUP.md` si cambias la configuración
6. Crea migraciones de base de datos si es necesario

## 🐛 Reportar Bugs

Para reportar un bug, crea un issue con:

1. **Título descriptivo**
2. **Descripción detallada** del problema
3. **Pasos para reproducir**
4. **Comportamiento esperado**
5. **Comportamiento actual**
6. **Screenshots** (si aplica)
7. **Entorno** (OS, versiones, etc.)

## 💡 Sugerir Funcionalidades

Para sugerir una nueva funcionalidad:

1. Verifica que no exista ya como issue
2. Describe la funcionalidad claramente
3. Explica por qué sería útil
4. Proporciona ejemplos de uso

## 🔍 Revisión de Código

Cuando revises PRs de otros:

- Sé constructivo y respetuoso
- Explica el "por qué" de tus sugerencias
- Aprueba cuando todo esté correcto
- Usa GitHub suggestions para cambios menores

## 🔧 Comandos Útiles para Desarrollo

```bash
# Ver todos los comandos disponibles
make help

# Desarrollo
make up                    # Levantar servicios
make down                  # Detener servicios
make logs                  # Ver logs
make restart               # Reiniciar servicios

# Base de datos
make migrate               # Aplicar migraciones
make migrate-create MSG="mensaje"  # Crear migración
make shell-db              # Acceder a PostgreSQL

# Testing
make test                  # Ejecutar tests
make test-cov              # Tests con cobertura

# Limpieza
make clean                 # Limpiar contenedores e imágenes
```

## 📞 Comunicación

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas y discusiones
- **Pull Requests**: Para código

## ⚖️ Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia del proyecto.

---

¡Gracias por contribuir a Aslin 2.0! 🚀

