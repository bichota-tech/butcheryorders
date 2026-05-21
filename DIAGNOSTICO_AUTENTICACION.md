# 🔍 Diagnóstico: Problemas de Autenticación Admin

## Resumen Ejecutivo
La autenticación de admin se queda colgada y requiere múltiples intentos por **5 problemas críticos** identificados en el código.

---

## 🔴 Problemas Críticos Encontrados

### 1. **Rate Limiter Configurado Incorrectamente**
**Ubicación:** `backend/src/middleware/rateLimiter.js` (líneas 11-16)

**Problema:**
```javascript
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true  // ❌ INCORRECTO
})
```

Con `skipSuccessfulRequests: true`:
- Los intentos **fallidos** cuentan contra el límite (5 intentos)
- Un login **exitoso NO reinicia el contador**
- Después de 5 fallos, aunque hagas login correcto, podrías estar bloqueado

**Síntomas observados:**
- "Necesito intentar más de 3 veces para loguearme como admin"
- Después de varios fallos, el login se queda colgado

**Solución:**
```javascript
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: false  // ✅ CORRECTO
})
```

---

### 2. **Timeout Muy Corto en Cliente**
**Ubicación:** `src/services/api.js` (línea 6)

**Problema:**
```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3100/api',
    timeout: 10000,  // ⚠️ Solo 10 segundos
    headers: { 'Content-Type': 'application/json' }
})
```

**Por qué es un problema:**
- Verificación de contraseña con bcrypt + acceso a BD puede tardar > 10s en producción
- Si la conexión a la BD es lenta, se produce timeout
- El cliente **no sabe si el timeout fue por rate-limit, BD lenta, o red**

**Síntomas:** Las solicitudes se cuelgan sin mensaje de error claro

**Solución:**
```javascript
timeout: 30000  // 30 segundos (más realista)
```

---

### 3. **Sin Manejo de Errores en login**
**Ubicación:** `backend/src/services/auth.service.js` (líneas 47-78)

**Problema:**
```javascript
export const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email }
    })  // ❌ Si Prisma falla aquí, no hay catch

    if (!user) {
        const error = new Error('Invalid credentials')
        error.statusCode = 401
        throw error
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    // ❌ Si bcrypt.compare es lento, no hay timeout de función
}
```

**Síntomas:**
- Solicitudes que se quedan indefinidamente
- No hay control de timeout a nivel de servicio
- Errores de BD no se propagan correctamente

---

### 4. **Cola de Requests Sin Timeout**
**Ubicación:** `src/services/api.js` (líneas 26-40, 51-60)

**Problema:**
```javascript
let isRefreshing = false
let failedQueue = []

// Si el refresh token falla:
if (isRefreshing) {
    return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject })
        // ⚠️ Si el refresh falla, estas promesas NUNCA se resuelven
    })
}

try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken }
    )
    // ...
} catch (refreshError) {
    processQueue(refreshError, null)  // Esto rechaza la cola
    // Pero si hay errores adicionales, la cola se queda en espera
}
```

**Síntomas:**
- Si refresh token falla, TODOS los requests posteriores se cuelgan
- No hay timeout para desencolar

**Solución:** Agregar timeout a la cola

---

### 5. **Variables `user` Sin Inicialización en Middleware**
**Ubicación:** `backend/src/middleware/auth.js` (línea 25-31)

**Problema:**
```javascript
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {  // ❌ Si req.user es undefined, crash
        logger.warn('Unauthorized admin access attempt', { userId: req.user.id })
        return res.status(403).json(errorResponse('Admin access required'))
    }
    next()
}
```

Si `req.user` es undefined, genera un error silencioso que puede colgar la solicitud.

---

## 🛠️ Soluciones Implementadas

### Opción 1: Fix Rápido (Rate Limiter)
```bash
# Solo cambiar esta línea en backend/src/middleware/rateLimiter.js
skipSuccessfulRequests: false
```

### Opción 2: Fix Completo (Recomendado)
Implementar los archivos corregidos en este repositorio:
- `backend/src/middleware/rateLimiter.js` - Fix rate limiter
- `backend/src/middleware/auth.js` - Añadir validación de req.user
- `src/services/api.js` - Aumentar timeout y mejorar manejo de cola
- `backend/src/services/auth.service.js` - Añadir try-catch y logging

---

## 📊 Impacto de los Problemas

| Problema | Severidad | Impacto | Síntoma |
|----------|-----------|--------|--------|
| Rate Limiter | 🔴 ALTA | Bloqueo permanente | "Intentar 3+ veces" |
| Timeout corto | 🔴 ALTA | Solicitudes truncadas | "Se cuelga" |
| Sin error handling | 🟠 MEDIA | Errores silenciosos | Sin mensaje de error |
| Cola sin timeout | 🔴 ALTA | Bloqueo en cascada | Todo falla después de 1 error |
| user undefined | 🟡 BAJA | Crash ocasional | Error 500 aleatorio |

---

## ✅ Pasos Recomendados

1. **Inmediato:** Cambiar `skipSuccessfulRequests: false`
2. **Corto plazo:** Aumentar timeout a 30s
3. **Mediano plazo:** Implementar try-catch en auth.service.js
4. **Largo plazo:** Mejorar observabilidad y logging

---

## 🧪 Cómo Verificar los Fixes

```bash
# 1. Limpiar localStorage (para reset de rate limit)
# Abrir DevTools > Application > Local Storage > Limpiar

# 2. Intentar login 5+ veces con credenciales incorrectas
# Debería mostrar claro después del 5to intento

# 3. Intentar login correcto después
# Debería funcionar sin esperar

# 4. Ver logs en backend:
# npm run dev (backend)
# Buscar: "User logged in" o "Failed login attempt"
```

---

## 📝 Referencia de Archivos Afectados

- ✅ `backend/src/middleware/rateLimiter.js` - CRÍTICO
- ✅ `src/services/api.js` - CRÍTICO  
- ✅ `backend/src/services/auth.service.js` - IMPORTANTE
- ✅ `backend/src/middleware/auth.js` - IMPORTANTE
- ✅ `src/stores/auth.js` - RECOMENDADO

---

## 🔗 Referencias

- Express Rate Limit Docs: https://github.com/nfriedly/express-rate-limit
- Axios Timeout: https://axios-http.com/docs/config_defaults
- bcryptjs Performance: https://github.com/dcodeIO/bcrypt.js
