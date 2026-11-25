# API del backend

Guía de integración para el frontend. El servidor Express publica las rutas bajo:

```text
http://localhost:3000/api/v1
```

La documentación interactiva Swagger está disponible en
`http://localhost:3000/api-docs`; el documento OpenAPI en JSON está en
`http://localhost:3000/api-docs.json`.

Las solicitudes con cuerpo deben usar `Content-Type: application/json`. Los
endpoints protegidos requieren `Authorization: Bearer <token>`.

Todas las respuestas de la API usan el formato `{ "body": {}, "message": "...",
"status": 200 }`. `status` coincide con el código HTTP; los datos de éxito se
devuelven dentro de `body`, y los errores mantienen `body` vacío.

## Estructura plana del usuario

Las respuestas de usuario contienen en una sola capa los datos del cliente,
las URLs del expediente y los metadatos. `id` y `estado` son texto; las fechas
son timestamps ISO 8601 serializados como texto.

```json
{
  "id": "12",
  "nombreCompleto": "Ana Pérez",
  "direccion": "Calle 123",
  "telefono": "+1 213-373-4253",
  "whatsapp": "+44 20 8366 1177",
  "correoElectronico": "ana@example.com",
  "urlDocumentoIdentidad": "https://example.com/identidad.pdf",
  "urlReciboServicio": "https://example.com/recibo.pdf",
  "urlContratoDisclaimer": "https://example.com/contrato.pdf",
  "urlComprobanteAceptacion": "https://example.com/aceptacion.pdf",
  "fechaCreacion": "2026-11-18T20:00:00.000Z",
  "fechaActualizacion": "2026-11-18T20:00:00.000Z",
  "estado": "activo"
}
```

El servidor genera `id`, `fechaCreacion`, `fechaActualizacion` y `estado`.
Todos los demás campos de usuario son texto. En el registro solo son
obligatorios `nombreCompleto`, `correoElectronico` y `password`; los demás
campos se guardan como cadenas vacías si no se envían.

## Usuarios y autenticación

### Registrar usuario

`POST /users/register` — público.

```json
{
  "nombreCompleto": "Ana Pérez",
  "direccion": "Calle 123",
  "telefono": "+1 555 0100",
  "whatsapp": "+1 555 0100",
  "correoElectronico": "ana@example.com",
  "urlDocumentoIdentidad": "https://example.com/identidad.pdf",
  "urlReciboServicio": "https://example.com/recibo.pdf",
  "urlContratoDisclaimer": "https://example.com/contrato.pdf",
  "urlComprobanteAceptacion": "https://example.com/aceptacion.pdf",
  "password": "mi-clave-segura"
}
```

Responde `201 Created` con `{ "body": { "user": <usuario> }, "message": "...", "status": 201 }`.
La contraseña debe tener
entre 8 y 72 bytes UTF-8. El correo se guarda en minúsculas; si ya existe,
responde `409 Conflict`. Los datos inválidos responden `400 Bad Request` con
un solo `message` dentro del formato común; si hay varios errores, sus
descripciones se separan por comas. Se validan el cuerpo JSON, nombre (obligatorio, máximo 120 caracteres),
correo (obligatorio, formato válido, máximo 320 caracteres), contraseña
(obligatoria, entre 8 y 72 bytes UTF-8), tipos de los campos opcionales y
teléfonos y WhatsApp (números internacionales válidos con código de país,
sin letras y con máximo 40 caracteres). Se acepta el prefijo `+` o `00`;
los números locales sin código de país no se consideran válidos. Si el JSON
está mal formado, responde `400` con un mensaje que lo indica.

```json
{
  "body": {},
  "message": "El nombre completo debe ser texto, La dirección debe ser texto.",
  "status": 400
}
```

### Iniciar sesión

`POST /users/login` — público. El cuerpo es plano; se acepta el correo como
`correoElectronico` o, por compatibilidad, como `email`.

```json
{
  "correoElectronico": "ana@example.com",
  "password": "mi-clave-segura"
}
```

Responde `200 OK`:

```json
{
  "body": {
    "token": "<jwt>",
    "user": {
      "id": "12",
      "nombreCompleto": "Ana Pérez",
      "direccion": "Calle 123",
      "telefono": "+1 213-373-4253",
      "whatsapp": "+44 20 8366 1177",
      "correoElectronico": "ana@example.com",
      "urlDocumentoIdentidad": "https://example.com/identidad.pdf",
      "urlReciboServicio": "https://example.com/recibo.pdf",
      "urlContratoDisclaimer": "https://example.com/contrato.pdf",
      "urlComprobanteAceptacion": "https://example.com/aceptacion.pdf",
      "fechaCreacion": "2026-11-18T20:00:00.000Z",
      "fechaActualizacion": "2026-11-18T20:00:00.000Z",
      "estado": "activo",
      "role": "client"
    }
  },
  "message": "Inicio de sesión exitoso.",
  "status": 200
}
```

`role` es `"admin"` si el ID del usuario está incluido en la variable de
entorno `ADMINS` (IDs separados por comas); en caso contrario es `"client"`.
El token es JWT con vigencia de 10 días. Credenciales incorrectas responden
`401 Unauthorized`.

## Manejo de imágenes

Las rutas de imágenes son públicas y usan el prefijo `http://localhost:3000/api/v1`.
No requieren token de autenticación. Para subir o reemplazar una imagen, envía
una solicitud `multipart/form-data` con el archivo en el campo `image`. Se
aceptan imágenes PNG, JPEG, GIF o WEBP de hasta 5 MB. No establezcas
manualmente el encabezado `Content-Type` al usar `curl -F`; `curl` debe incluir
el `boundary` del formulario.

El servidor guarda los archivos en `backend/images`. El `id` es el hash SHA-256
del contenido en hexadecimal minúsculo y `name` contiene ese hash y la
extensión detectada a partir del contenido. Subir el mismo archivo más de una
vez devuelve el mismo `id` y `name`, sin crear otra copia.

### Subir una imagen

`POST /images` — responde `201 Created`.

```bash
curl.exe -X POST http://localhost:3000/api/v1/images -F "image=@.\imagen.png"
```

Respuesta:

```json
{
  "body": {
    "id": "<hash-sha256-de-64-caracteres>",
    "name": "<hash-sha256-de-64-caracteres>.png"
  },
  "message": "Imagen guardada correctamente.",
  "status": 201
}
```

### Reemplazar una imagen

`PUT /images/:id` — reemplaza la imagen almacenada bajo el ID indicado. Si la
nueva imagen tiene otro contenido, se guarda con su nuevo hash y se elimina el
archivo anterior. La respuesta `200 OK` contiene el `id` y `name` nuevos.
Sustituye `ID_DE_LA_IMAGEN` en los ejemplos por el `id` devuelto al subirla.

```bash
curl.exe -X PUT http://localhost:3000/api/v1/images/ID_DE_LA_IMAGEN -F "image=@.\imagen-nueva.webp"
```

```json
{
  "body": {
    "id": "<nuevo-hash-sha256>",
    "name": "<nuevo-hash-sha256>.webp"
  },
  "message": "Imagen reemplazada correctamente.",
  "status": 200
}
```

### Eliminar una imagen

`DELETE /images/:id` — elimina el archivo almacenado y responde `200 OK` con el
ID y nombre eliminados.

```bash
curl.exe -X DELETE http://localhost:3000/api/v1/images/ID_DE_LA_IMAGEN
```

```json
{
  "body": {
    "id": "<hash-sha256-de-64-caracteres>",
    "name": "<hash-sha256-de-64-caracteres>.png"
  },
  "message": "Imagen eliminada correctamente.",
  "status": 200
}
```

### Errores de imágenes

- `400 Bad Request`: formato de solicitud incorrecto, falta el campo `image`,
  la imagen no es PNG/JPEG/GIF/WEBP válida o el ID no contiene 64 caracteres
  hexadecimales minúsculos.
- `404 Not Found`: el ID es válido, pero no existe una imagen almacenada para
  ese ID (al reemplazar o eliminar).
- `413 Payload Too Large`: la imagen supera los 5 MB.
- `500 Internal Server Error`: error inesperado al guardar, reemplazar o
  eliminar el archivo.

Las respuestas de error usan el formato común, por ejemplo:

```json
{
  "body": {},
  "message": "No se encontró la imagen.",
  "status": 404
}
```

Actualmente estas rutas permiten subir, reemplazar y eliminar imágenes; no
existe un endpoint `GET` para consultar o descargar el archivo.

### Consultar el usuario autenticado

`GET /users/me` — requiere token Bearer.

Responde `200 OK` con `{ "body": { "user": <usuario> }, "message": "...", "status": 200 }`.
Si el usuario asociado al token ya no existe, responde `404 Not Found`.

### Listar usuarios

`GET /users` — requiere token Bearer y que el ID esté en la variable de entorno
`ADMINS` (lista de IDs separada por comas).

Responde `200 OK` con `{ "body": { "users": [<usuario>, ...] }, "message": "...", "status": 200 }`.
Sin token responde `401`; sin permiso de administrador, `403 Forbidden`.

### Solicitar recuperación de contraseña

`POST /users/recover-password` — público. Se acepta `correoElectronico` o,
por compatibilidad, `email`.

```json
{ "correoElectronico": "ana@example.com" }
```

Responde `202 Accepted` con un mensaje genérico dentro del formato común,
exista o no la cuenta, para no revelar qué correos están registrados. Si la
cuenta existe, envía un enlace de recuperación por correo. El token vence en
una hora.

### Restablecer contraseña

`POST /users/reset-password` — público. El token se obtiene del enlace de
recuperación.

```json
{
  "token": "<token-recibido-por-correo>",
  "password": "nueva-clave-segura"
}
```

Responde `200 OK` con `{ "body": {}, "message": "...", "status": 200 }`. La
nueva contraseña debe tener entre 8 y 72 bytes UTF-8. Un token incorrecto o
vencido responde `400 Bad Request` con el mismo formato.

## Publicaciones

### Crear publicación

`POST /posts` — público.

```json
{
  "title": "Mi primera publicación",
  "text": "Descripción de la publicación",
  "image": "https://example.com/imagen.jpg"
}
```

`title` es obligatorio y admite hasta 200 caracteres; `text` no puede estar
vacío y `image` debe ser una URL HTTP o HTTPS. Responde `201 Created` con
`{ "body": { "post": { "id", "user_id", "title", "text", "image", "status", "created_at" } }, "message": "...", "status": 201 }`.
`status` es booleano y comienza en `false`.

### Listar publicaciones

`GET /posts` responde `200 OK` con `{ "body": { "posts": [...] }, "message": "...", "status": 200 }`, ordenadas de más
recientes a más antiguas. Se puede filtrar el estatus con `?status=true` o
`?status=false`; sin filtro se devuelven todas.

### Consultar publicación

`GET /posts/:id` responde `200 OK` con `{ "body": { "post": <publicación> }, "message": "...", "status": 200 }`
o `404` con el formato común si no existe.

### Eliminar publicación

`DELETE /posts/:id` — requiere token Bearer. Solo el usuario autor puede
eliminarla. Responde `200 OK` con `{ "body": { "post": <publicación eliminada> }, "message": "...", "status": 200 }`;
si no existe o no pertenece al usuario autenticado, responde `404` con el
formato común.

## Bots

Las rutas `GET /bots` y `GET /bots/:id` son públicas. `POST /bots`,
`PUT /bots/:id` y `DELETE /bots/:id` requieren token Bearer y que el usuario
esté listado en `ADMINS`. `PUT` reemplaza todos los datos del bot.

El cuerpo de `POST` y `PUT` debe incluir:

```json
{
  "nombre": "Bot de ejemplo",
  "profit_factor": 2.5,
  "win_rate": 72.5,
  "profit_1_year": 4200,
  "drawdown": 800,
  "imagen": "https://example.com/bot.jpg",
  "descripcion": "Descripción del bot."
}
```

`win_rate` debe estar entre 0 y 100; `profit_factor`, `drawdown` no pueden ser negativos. `profit_1_year` admite valores
negativos. Las respuestas siguen el formato común, con los datos del bot o la
lista en `body`.

## Estado y errores

`GET /` responde `{ "body": {}, "message": "Welcome to the API!", "status": 200 }`.

Los errores usan el mismo formato, con `body` vacío y un `message` descriptivo.
Códigos comunes: `400`
(datos inválidos o JSON mal formado), `401` (falta token o credenciales
inválidas), `403` (sin permisos), `409` (correo duplicado), `413` (solicitud
demasiado grande) y `500` (error interno).

## Notas de integración

- Las rutas disponibles en este backend son `/users`, `/posts` y `/bots`; la
  especificación anterior `/auth`, `/account`, `/subscriptions` y `/ninja` no
  corresponde a rutas implementadas actualmente. `/images` permite cargar
  imágenes como se describe arriba.
- El expediente acepta URLs como cadenas; las imágenes se cargan por separado
  mediante `/images`.
- Los campos del registro se envían en el nivel principal del JSON de entrada;
  las respuestas exitosas devuelven sus datos dentro de `body`. La contraseña
  solo se envía en el registro y login; nunca forma parte de la respuesta del
  usuario.
