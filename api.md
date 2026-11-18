# API del backend

Guía de integración para el frontend. El servidor Express publica las rutas bajo:

```text
http://localhost:3000/api/v1
```

Las solicitudes con cuerpo deben usar `Content-Type: application/json`. Los
endpoints protegidos requieren `Authorization: Bearer <token>`.

## Estructura del usuario

Las respuestas de usuario usan `id` como texto, los campos de perfil y
expediente como texto, y las fechas como timestamps ISO 8601. `estado` también
es texto.

```json
{
  "id": "12",
  "perfilCliente": {
    "nombreCompleto": "Ana Pérez",
    "direccion": "Calle 123",
    "telefono": "+1 555 0100",
    "whatsapp": "+1 555 0100",
    "correoElectronico": "ana@example.com"
  },
  "expedienteDigital": {
    "urlDocumentoIdentidad": "https://example.com/identidad.pdf",
    "urlReciboServicio": "https://example.com/recibo.pdf",
    "urlContratoDisclaimer": "https://example.com/contrato.pdf",
    "urlComprobanteAceptacion": "https://example.com/aceptacion.pdf"
  },
  "metadatos": {
    "fechaCreacion": "2026-11-18T20:00:00.000Z",
    "fechaActualizacion": "2026-11-18T20:00:00.000Z",
    "estado": "activo"
  }
}
```

El servidor genera `id`, `metadatos.fechaCreacion`,
`metadatos.fechaActualizacion` y `metadatos.estado`. Las propiedades de perfil
y expediente deben ser texto; en el registro solo son obligatorios el nombre
completo, el correo y la contraseña. Los demás campos se guardan como cadenas
vacías si no se envían.

## Usuarios y autenticación

### Registrar usuario

`POST /users/register` — público.

```json
{
  "perfilCliente": {
    "nombreCompleto": "Ana Pérez",
    "direccion": "Calle 123",
    "telefono": "+1 555 0100",
    "whatsapp": "+1 555 0100",
    "correoElectronico": "ana@example.com"
  },
  "expedienteDigital": {
    "urlDocumentoIdentidad": "https://example.com/identidad.pdf",
    "urlReciboServicio": "https://example.com/recibo.pdf",
    "urlContratoDisclaimer": "https://example.com/contrato.pdf",
    "urlComprobanteAceptacion": "https://example.com/aceptacion.pdf"
  },
  "password": "mi-clave-segura"
}
```

Responde `201 Created` con `{ "user": <usuario> }`. La contraseña debe tener
entre 8 y 72 bytes UTF-8. El correo se guarda en minúsculas; si ya existe,
responde `409 Conflict`.

### Iniciar sesión

`POST /users/login` — público. Se acepta el correo en la estructura anidada o
como `email` (también se acepta `correoElectronico` en el nivel superior).

```json
{
  "perfilCliente": {
    "correoElectronico": "ana@example.com"
  },
  "password": "mi-clave-segura"
}
```

Responde `200 OK`:

```json
{
  "token": "<jwt>",
  "user": { "...": "estructura del usuario" }
}
```

El token es JWT con vigencia de una hora. Credenciales incorrectas responden
`401 Unauthorized`.

### Consultar el usuario autenticado

`GET /users/me` — requiere token Bearer.

Responde `200 OK` con `{ "user": <usuario> }`. Si el usuario asociado al token
ya no existe, responde `404 Not Found`.

### Listar usuarios

`GET /users` — requiere token Bearer y que el ID esté en la variable de entorno
`ADMIN_USER_IDS` (lista de IDs separada por comas).

Responde `200 OK` con `{ "users": [<usuario>, ...] }`. Sin token responde `401`;
sin permiso de administrador, `403 Forbidden`.

### Solicitar recuperación de contraseña

`POST /users/recover-password` — público. Se acepta el correo en
`perfilCliente.correoElectronico` o, por compatibilidad, en `email`.

```json
{
  "perfilCliente": {
    "correoElectronico": "ana@example.com"
  }
}
```

Responde `202 Accepted` con un mensaje genérico, exista o no la cuenta, para no
revelar qué correos están registrados. Si la cuenta existe, envía un enlace de
recuperación por correo. El token vence en una hora.

### Restablecer contraseña

`POST /users/reset-password` — público. El token se obtiene del enlace de
recuperación.

```json
{
  "token": "<token-recibido-por-correo>",
  "password": "nueva-clave-segura"
}
```

Responde `200 OK` con `{ "message": "La contraseña se actualizó correctamente." }`.
La nueva contraseña debe tener entre 8 y 72 bytes UTF-8. Un token incorrecto o
vencido responde `400 Bad Request`.

## Publicaciones

### Crear publicación

`POST /posts` — requiere token Bearer.

```json
{
  "title": "Mi primera publicación",
  "text": "Descripción de la publicación",
  "image": "https://example.com/imagen.jpg"
}
```

`title` es obligatorio y admite hasta 200 caracteres; `text` no puede estar
vacío y `image` debe ser una URL HTTP o HTTPS. Responde `201 Created` con
`{ "post": { "id", "user_id", "title", "text", "image", "created_at" } }`.

## Estado y errores

`GET /` responde `{ "message": "Welcome to the API!" }`.

Los errores usan JSON con la propiedad `message`. Códigos comunes: `400`
(datos inválidos o JSON mal formado), `401` (falta token o credenciales
inválidas), `403` (sin permisos), `409` (correo duplicado), `413` (solicitud
demasiado grande) y `500` (error interno).

## Notas de integración

- Las rutas disponibles en este backend son `/users` y `/posts`; la
  especificación anterior `/auth`, `/account`, `/bots`, `/subscriptions` y
  `/ninja` no corresponde a rutas implementadas actualmente.
- El expediente acepta URLs como cadenas; el backend no sube ni almacena el
  contenido de los archivos.
- Para iniciar sesión, registrar y consultar perfil, usar el mismo objeto
  anidado de usuario mostrado arriba; no incluir la contraseña dentro de
  `perfilCliente`.