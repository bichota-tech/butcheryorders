# ButcheryOrders — Sistema de Gestión de Pedidos por Voz (Proyecto Finalizado)

Este es un sistema full-stack **completado y en producción**, diseñado para automatizar y agilizar la toma de pedidos en una carnicería a través del reconocimiento de voz natural.

## 🌟 Características Principales

*   **Interfaz Basada en Voz:** Permite a los clientes o empleados dictar los pedidos fácilmente usando procesamiento natural del lenguaje (NLP).
*   **Conversión de Texto a Estructura:** El backend extrae inteligentemente cantidad, producto, unidad y datos del cliente a partir de transcripciones.
*   **Gestión de Inventario (Catálogo):** Base de datos relacional para validar pedidos en tiempo real.
*   **Panel de Administración:** Gestión de estados ('Pendiente', 'Completado', 'Archivado') y control de pedidos de forma ágil.
*   **Seguridad y Autenticación:** JWT con Refresh Tokens, control de roles (Admin/User), Rate Limiting.
*   **Despliegue Habilitado (Serverless):** Backend nativo para Render, Frontend para Firebase Hosting y Base de Datos en Neon Serverless Postgres.

---

## 🚀 Arquitectura del Sistema

*   **Frontend:** Vue 3 + Vite, Bootstrap 5, Pinia para manejo de estado.
*   **Backend:** Node.js + Express, arquitectura basada en servicios y controladores.
*   **Base de Datos:** PostgreSQL en la nube (Neon).
*   **ORM:** Prisma.

---

## 🔐 Gestión de Control de Acceso (IAM)

El proyecto implementa un sistema robusto de **control de acceso basado en roles (RBAC)** para garantizar la seguridad a nivel de proyecto y para desarrolladores.

### Estructura de Roles

#### 👨‍💼 **ADMIN**
Acceso completo al sistema. Permisos:
- ✅ Crear, leer, actualizar y eliminar **todos** los pedidos
- ✅ Gestionar usuarios y permisos (crear nuevos administradores)
- ✅ Exportar reportes en Excel
- ✅ Modificar estados de pedidos de otros usuarios
- ✅ Acceder a la gestión del inventario
- ✅ Ver estadísticas y análisis del negocio

#### 👤 **USER**
Acceso limitado a funcionalidades básicas. Permisos:
- ✅ Crear sus propios pedidos
- ✅ Ver y gestionar únicamente sus pedidos
- ✅ Buscar y consultar el catálogo de productos
- ❌ No puede ver pedidos de otros usuarios
- ❌ No puede exportar reportes
- ❌ No puede modificar permisos de otros usuarios

### Implementación Técnica

#### Autenticación
El sistema utiliza **JWT (JSON Web Tokens)** con refresh tokens para:
- Verificar identidad del usuario
- Mantener sesiones seguras
- Prevenir acceso no autorizado

Middleware de autenticación: [`backend/src/middleware/auth.js`](backend/src/middleware/auth.js)
- `authenticateToken`: Valida que el usuario tenga un token válido
- `requireAdmin`: Verifica que el usuario tenga rol de ADMIN

#### Protección de Rutas

| Ruta | Método | Requerimiento | Descripción |
|------|--------|---------------|-------------|
| `/api/auth/login` | POST | Público | Login (sin autenticación) |
| `/api/auth/register` | POST | Deshabilitado | Solo acceso con credenciales pre-configuradas |
| `/api/orders` | GET/POST | `authenticateToken` | Crear/listar pedidos propios |
| `/api/orders/:id` | PATCH/DELETE | `authenticateToken` | Modificar/eliminar pedidos (validación en controlador) |
| `/api/reports/excel` | GET | `authenticateToken` + `requireAdmin` | ⚠️ **Solo Admins** |
| `/api/products` | GET | `authenticateToken` | Listar catálogo |
| `/api/voice/process` | POST | `authenticateToken` | Procesar transcripciones |

#### Validaciones en Controladores

Los controladores adicionales validan permisos a nivel de negocio:

```javascript
// Ejemplo: backend/src/controllers/orders.controller.js
export const deleteOrder = async (req, res, next) => {
    const userId = req.user.id
    const isAdmin = req.user.role === 'ADMIN'
    
    // El servicio verifica si el usuario es propietario o admin
    const result = await ordersService.deleteOrder(id, userId, isAdmin)
}
```

### Gestión de Acceso por Desarrollador

#### Crear Nuevo Usuario Admin

Modifica el archivo `backend/scripts/seed-admin.js`:

```javascript
const ADMIN_USERS = [
    {
        email: 'admin@carniceria.com',
        password: 'Admin1234!',
        name: 'Administrador',
        role: 'ADMIN'
    },
    {
        email: 'nuevo-dev@carniceria.com',
        password: 'DevPassword123!',
        name: 'Nuevo Desarrollador',
        role: 'ADMIN'
    }
]
```

Luego ejecuta en producción:
```bash
node scripts/seed-admin.js
```

O consulta la [**Guía Operativa**](GUIA_OPERATIVA.md) para procedimientos detallados.

#### Asignar Rol a Usuario Existente

Usa **Prisma Studio** para acceso directo a la base de datos:

```bash
npm run prisma:studio
```

Luego edita el campo `role` del usuario deseado directamente en la interfaz.

### Rate Limiting de Seguridad

El sistema implementa límites de frecuencia para proteger contra abuso:
- **General**: 100 solicitudes / 15 minutos
- **Autenticación**: 5 intentos fallidos / 15 minutos
- **Procesamiento de voz**: Límite específico para operaciones intensivas

Configuración en: `backend/src/middleware/rateLimiter.js`

---

## 📖 Documentación Adicional

Puedes consultar la [**Guía Operativa**](GUIA_OPERATIVA.md) para más detalles sobre:

1.  Cómo dar permisos de **Administrador**.
2.  Cómo actualizar la base de datos de producción desde **Neon** y **Prisma**.
3.  Cómo funciona internamente la arquitectura de voz.
4.  Comandos recurrentes de mantenimiento.

---

## 🛠 Entorno de Desarrollo Local

Si deseas correr este proyecto de forma local para contribuir:

### 1. Variables de Entorno
Clona el repositorio y crea un archivo `.env` dentro de la carpeta `/backend` usando como base `.env.example`. 

Deberás añadir tus propias claves para Base de Datos y JWT Secrets. Si tienes un `.env.production` en el directorio raíz para el frontend, apúntalo al servidor local.

### 2. Backend
Abre una terminal, sitúate en la carpeta `/backend` y ejecuta:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node scripts/add-products.js
node scripts/seed-admin.js
npm run dev
```
La API estará corriendo en `http://localhost:3100` (o el puerto configurado).

### 3. Frontend
En otra terminal, sitúate en la raíz del proyecto y ejecuta:

```bash
npm install
npm run dev
```
La aplicación web de Vue estará corriendo en `http://localhost:5173`.

---

👤 Proyecto desarrollado por **Ada (bichota-tech)**.
