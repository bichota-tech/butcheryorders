# Guía Operativa - ButcheryOrders

Este documento contiene la información clave sobre el funcionamiento interno, administración y mantenimiento del proyecto ButcheryOrders.

---

## 1. Gestión de Usuarios Administradores

El sistema distingue entre clientes regulares y administradores basándose en el campo `role` de la tabla `User`. Los administradores pueden ver todos los pedidos y gestionar el inventario.

### ¿Cómo crear un administrador?

Existen dos formas de crear un administrador en el sistema:

1. **Mediante el script de seed (Recomendado para primer uso)**:
   Ejecuta el siguiente comando en la carpeta `backend/`. Este script verifica si existe el usuario `admin@butcheryorders.com` y lo crea si no existe.
   ```bash
   cd backend
   node scripts/seed-admin.js
   ```

2. **Modificando la base de datos directamente (Neon o Prisma Studio)**:
   - Abre Prisma Studio (`npx prisma studio` en la carpeta backend) o usa el SQL Editor de Neon.
   - Ve a la tabla `User`.
   - Busca al usuario que quieres hacer administrador.
   - Cambia el valor de la columna `role` a `ADMIN`.

> **Nota:** El archivo encargado de la lógica de inyección automática del admin es `backend/scripts/seed-admin.js`.

---

## 2. Actualización de la Base de Datos (Flujo con Neon / Render)

El proyecto utiliza Prisma como ORM y Neon (PostgreSQL) como base de datos de producción.

### ¿Qué hacer si modificas el archivo `schema.prisma`?

Si añades nuevas tablas, columnas o cambias las relaciones en `backend/prisma/schema.prisma`, debes seguir estos pasos para que los cambios se reflejen en producción (Neon) y en el código desplegado (Render):

1. **Generar el cliente Prisma de nuevo** (para que tu código local reconozca los cambios):
   ```bash
   npx prisma generate
   ```

2. **Aplicar los cambios a la base de datos (Neon)**:
   ```bash
   npx prisma db push
   ```
   *Nota:* Usamos `db push` en lugar de migraciones formales por simplicidad. Esto sincronizará el esquema de Prisma con Neon directamente.

3. **Subir los cambios a GitHub**:
   Haz commit y push de tus cambios en `schema.prisma`.
   ```bash
   git add backend/prisma/schema.prisma
   git commit -m "feat: actualizar esquema de BD"
   git push origin main
   ```

4. **Render se actualizará automáticamente**:
   Render está configurado para ejecutar `npm install && npx prisma generate && npx prisma migrate deploy` en cada Despliegue. Puesto que en el paso 2 ya aplicaste los cambios con `db push`, Render simplemente generará el cliente Prisma actualizado para que el código del backend funcione con la nueva estructura.

### ¿Cómo añadir nuevos productos al catálogo?

El catálogo de productos de voz se gestiona en la base de datos. Si necesitas añadir o modificar productos, hazlo editando el archivo `backend/scripts/add-products.js` y luego ejecuta:

```bash
cd backend
node scripts/add-products.js
```

Este script utiliza `upsert`, lo que significa que de forma segura actualizará productos existentes o creará los nuevos sin duplicarlos ni afectar a pedidos pasados.

---

## 3. Funcionamiento Clave del Sistema

### Arquitectura de Voz y Peticiones
1. El usuario dicta su pedido en el frontend (Vue 3).
2. El frontend utiliza la **Web Speech API** del navegador para convertir temporalmente la voz a texto (para dar feedback visual).
3. Si el dispositivo no soporta STT nativo, se cuenta con implementaciones fallback a Google Cloud Speech-to-Text en el backend, a través de la ruta `/api/voice`.
4. El texto final se envía al backend (`/api/orders`), donde el servicio `nlp.service.js` analiza el texto usando expresiones regulares y diccionarios para extraer:
   - Nombre de cliente y teléfono (es opcional).
   - Lista de productos, cantidades y unidades.

### Despliegue Híbrido
- **Frontend**: Alojado en **Firebase Hosting** (`firebase deploy --only hosting`). Consume servicios de backend en un subdominio bajo `VITE_API_URL`.
- **Backend API**: Alojado en **Render** como un Web Service de Node.js nativo. Se despliega automáticamente haciendo push a la rama `main` en GitHub.
- **Base de Datos**: Alojada en **Neon Serverless Postgres**, conectada a Render mediante la variable de entorno `DATABASE_URL`.

### Enlaces Útiles
- **Render Dashboard**: Gestionar logs del API, variables de entorno y reinicio de servidor.
- **Neon Console**: Gestionar la base de datos, ver tablas en bruto o consultar el rendimiento SQL.
- **Firebase Console**: Ver analíticas web y gestionar despliegues del frontend.
