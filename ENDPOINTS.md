# Endpoints API Consumidos por el Frontend

**URL Base:** `http://127.0.0.1:8000`

---

## 📊 **GRÁFICAS**

### Conteo de Usuarios (Estadísticas)
- **Endpoint:** `GET /api/conteo-usuarios/`
- **Servicio:** `EstadisticasService.getConteoUsuarios()`
- **Ubicación:** `src/app/services/estadisticas.service.ts`
- **Componente:** `GraficasScreenComponent`
- **Respuesta esperada:**
```json
{
  "administradores": number,
  "maestros": number,
  "alumnos": number
}
```
- **Autenticación:** Requiere token JWT (Bearer Token)

---

## 📚 **MATERIAS**

**Nota:** No existe un endpoint específico para gestionar materias como entidad independiente. Las materias están hardcodeadas en el frontend y se guardan como parte del registro de maestros.

### Ubicación de materias en el código:
- **Componente:** `RegistroMaestrosComponent`
- **Ubicación:** `src/app/partials/registro-maestros/registro-maestros.component.ts` (líneas 38-49)
- **Lista de materias (hardcodeada):**
  - Aplicaciones Web
  - Programación 1
  - Bases de datos
  - Tecnologías Web
  - Minería de datos
  - Desarrollo móvil
  - Estructuras de datos
  - Administración de redes
  - Ingeniería de Software
  - Administración de S.O.

### Guardado de materias:
Las materias se guardan como parte del registro/actualización de maestros:
- **Endpoint:** `POST /maestros/` o `PUT /maestros/`
- **Campo:** `materias_json` (se envía como JSON stringificado)
- **Servicio:** `MaestrosService.registrarMaestro()` o `MaestrosService.actualizarMaestro()`

---

## 🎓 **EVENTOS ACADÉMICOS**

### Obtener lista de eventos
- **Endpoint:** `GET /api/eventos/`
- **Servicio:** `EventosService.getEventos()`
- **Ubicación:** `src/app/services/eventos.service.ts`
- **Autenticación:** Requiere token JWT (Bearer Token)
- **Respuesta:** Array de eventos filtrado según el rol del usuario

### Obtener un evento por ID
- **Endpoint:** `GET /api/eventos/{id}/`
- **Servicio:** `EventosService.getEventoById(idEvento: number)`
- **Parámetros:** `idEvento` (número)
- **Autenticación:** Requiere token JWT (Bearer Token)

### Crear un evento
- **Endpoint:** `POST /api/eventos/`
- **Servicio:** `EventosService.createEvento(data: any)`
- **Autenticación:** Requiere token JWT y rol ADMIN
- **Payload esperado:**
```json
{
  "nombre_evento": "string",
  "tipo_evento": "Congreso | FePro | Presentación Doctoral | T-System",
  "fecha_realizacion": "YYYY-MM-DD",
  "hora_inicio": "HH:MM",
  "hora_fin": "HH:MM",
  "lugar": "string",
  "publico_objetivo": ["Estudiantes", "Profesores", "Público general"],
  "programa_educativo": "string (opcional si público incluye Estudiantes)",
  "responsable": number (ID del responsable),
  "descripcion_breve": "string (max 300 caracteres)",
  "cupo_maximo": number (1-999)
}
```

### Actualizar un evento
- **Endpoint:** `PUT /api/eventos/{id}/`
- **Servicio:** `EventosService.updateEvento(idEvento: number, data: any)`
- **Parámetros:** `idEvento` (número) y `data` (objeto con los campos a actualizar)
- **Autenticación:** Requiere token JWT y rol ADMIN
- **Payload:** Mismo formato que crear evento

### Eliminar un evento
- **Endpoint:** `DELETE /api/eventos/{id}/`
- **Servicio:** `EventosService.deleteEvento(idEvento: number)`
- **Parámetros:** `idEvento` (número)
- **Autenticación:** Requiere token JWT y rol ADMIN

---

## 🔐 **Autenticación**

Todos los endpoints requieren autenticación mediante JWT Bearer Token:
```
Authorization: Bearer {token}
```

El token se obtiene del `FacadeService.getSessionToken()` y se incluye automáticamente en los headers de todas las peticiones HTTP.

---

## 📝 **Notas Importantes**

1. **Materias:** Actualmente no hay un CRUD independiente para materias. Las materias están hardcodeadas y solo se usan al registrar/editar maestros.

2. **Filtrado de eventos:** El backend filtra los eventos según el rol del usuario:
   - **ADMIN:** Ve todos los eventos
   - **MAESTRO:** Ve eventos para "Profesores" y "Público general"
   - **ALUMNO:** Ve eventos para "Estudiantes" y "Público general"

3. **URL Base:** Configurada en `src/environments/environment.ts`:
   - Desarrollo: `http://127.0.0.1:8000`
   - Producción: Configurado en `environment.prod.ts`




