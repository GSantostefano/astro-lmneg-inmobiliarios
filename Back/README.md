# LM Negocios Inmobiliarios — Backend API

API Express + Sequelize para el catálogo de propiedades. Patrón estructural igual que `astro-mimascota/Back`.

## Stack

- Express 4
- Sequelize 6 + MySQL (SQLite opcional en local)
- Joi + @hapi/boom
- bcryptjs + jsonwebtoken
- helmet, cors, express-rate-limit
- multer (fotos, máx. 20 × 5 MB)

## MySQL + Workbench

1. Crear la base:

```sql
CREATE DATABASE lmneg_inmobiliarios
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Copiar y editar variables:

```bash
cd Back
cp .env.example .env
```

En esta máquina MySQL suele usar **puerto 3307** y password **admin123** (verificá en Workbench).

3. Instalar, seed y arrancar:

```bash
npm install
npm run seed
npm start
```

`npm run seed` importa **todas** las propiedades de `src/data/properties.ts` (51 fichas). Si ya corriste un seed anterior con solo 6, ejecutá:

```bash
npm run import-catalog
```

Eso agrega las que falten sin duplicar por `slug`.

API en `http://localhost:3020`.

### Usuario admin (seed)

| Email | Password | Rol |
|-------|----------|-----|
| `admin@lmneg.test` | `admin123` | admin |

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web).
2. Orígenes autorizados: `http://localhost:4321`, tu dominio de producción.
3. Variables:
   - Front: `PUBLIC_GOOGLE_CLIENT_ID`
   - Back: `GOOGLE_CLIENT_ID` (mismo Client ID)
4. Migración de columnas Google en `users`:

```bash
npm run migrate-auth
```

5. Login: `POST /api/auth/google` con `{ "credential": "<Google ID token>" }`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | no | Healthcheck |
| POST | `/api/auth/google` | no | Login Google → `{ token, user }` |
| POST | `/api/users/register` | no | Registro |
| POST | `/api/users/login` | no | Login → `{ token, user }` |
| GET | `/api/users/me` | Bearer | Usuario actual |
| GET | `/api/properties` | no | Listar / filtrar |
| GET | `/api/properties/slug/:slug` | no | Ficha por slug |
| GET | `/api/properties/:id` | no | Ficha por id |
| GET | `/api/properties/mine` | Bearer | Mis propiedades |
| POST | `/api/properties` | Bearer | Crear (multipart `photos`) |
| PATCH | `/api/properties/:id` | dueño/admin | Editar |
| DELETE | `/api/properties/:id` | dueño/admin | Borrar |

### Filtros `GET /api/properties`

`operation`, `type`, `status`, `city`, `neighborhood`, `currency`, `q`, `sort` (`relevance` \| `price_asc` \| `price_desc`), `priceMin`, `priceMax`, `rooms`, `userId`.

### Auth

```http
Authorization: Bearer <token>
```

## Cloudflare Tunnel (desarrollo / demo)

El back corre en tu PC; el front en Cloudflare Workers/Pages no puede llamar a `localhost`. Patrón:

1. Back local: `http://localhost:3020`
2. Túnel rápido:

```bash
cloudflared tunnel --url http://localhost:3020
```

3. Copiá la URL `https://xxxx.trycloudflare.com` y actualizá:

| Dónde | Variable | Valor |
|-------|----------|-------|
| Front (Cloudflare / `.env`) | `PUBLIC_API_URL` | `https://xxxx.trycloudflare.com` |
| Back `.env` | `PUBLIC_BASE_URL` | misma URL (URLs absolutas de fotos) |
| Back `.env` | `CORS_ORIGINS` | `http://localhost:4321`, dominio del front |

4. El front usa proxy same-origin `/api/bridge/[...path]` → `PUBLIC_API_URL` para que visitantes externos no dependan de trycloudflare en el browser.

5. **Importante:** al reiniciar `cloudflared`, la URL cambia. Actualizá vars en front y back, y redeploy del front.

## Variables de entorno

Ver `.env.example`. Claves:

- `BACK_PORT=3020`
- `DB_DIALECT=mysql`, `DB_NAME=lmneg_inmobiliarios`
- `DB_SYNC=1` en desarrollo
- `JWT_SECRET`
- `CORS_ORIGINS`
- `PUBLIC_BASE_URL` (túnel o dominio público del API)

## Estructura

```
Back/
├── index.js
├── scripts/
│   ├── seed-db.js
│   └── seed-properties.json
└── src/
    ├── app.js
    ├── libs/sequelize.js
    ├── db/models/          # User, Property
    ├── middlewares/
    ├── schemas/
    ├── services/
    ├── routes/
    └── utils/
```

Patrón: **router → service → model**.
