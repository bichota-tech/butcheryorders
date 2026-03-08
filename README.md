# ButcheryOrders — Sistema de Gestión de Pedidos por Voz

Este es un sistema full-stack en producción diseñado para automatizar y agilizar la toma de pedidos en una carnicería a través del reconocimiento de voz natural.

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

## 📖 Documentación

Puedes consultar la [**Guía Operativa**](GUIA_OPERATIVA.md) para más detalles sobre:

1.  Cómo dar permisos de **Administrador**.
2.  Cómo actualizar la base de datos de producción desde **Neon** y **Prisma**.
3.  Cómo funciona internamente la arquitectura de voz.
4.  Comando recurrentes de mantenimiento.

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
