# Nexus Insight

An intelligent Application Portfolio Management (APM) hub — a central registry for tracking applications across their lifecycle, investment posture, technology stack, and governance metadata, formalised by the [Nexus Insight APM Ontology](ontology/apm-ontology.ttl).

## Tech Stack

- **Runtime** — Node.js with Express 5
- **Database** — MongoDB via Mongoose 9
- **Validation** — Joi
- **Identity** — [Keycloak](https://www.keycloak.org/) (OAuth2/OIDC); the API verifies Keycloak-issued JWTs, it does not store credentials itself
- **API contract** — OpenAPI 3.0, served as interactive docs (Swagger UI) and enforced at runtime for every request/response under `/api`
- **Testing** — Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for MongoDB and Keycloak)

### Install dependencies

```bash
npm install
```

### Start MongoDB

```bash
npm run mongo
```

### Start Keycloak

```bash
npm run keycloak
```

Starts Keycloak at `http://localhost:8080` and auto-imports a realm with a client and three test users — see [Authentication](#authentication) below.

### Run the server

```bash
# Development
npm run env:dev

# Test environment
npm run env:test

# Production
npm run env:prod
```

The server starts on `http://localhost:3000` by default (configurable via `PORT` in the relevant `.env` file).

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default: `3000`) |
| `DB_CONNECTOR` | MongoDB connection string |
| `KEYCLOAK_URL` | Base URL of the Keycloak server, e.g. `http://localhost:8080` |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Public client id tokens are issued to |
| `TOKEN_SECRET` | Legacy — predates the move to Keycloak-issued JWTs; not currently used |

Environment files: `.env.dev`, `.env.test`, `.env.prod`.

## Authentication

Nexus Insight delegates identity to Keycloak — the API never stores or checks a password itself, it only verifies bearer JWTs Keycloak issued (signature + issuer, against Keycloak's JWKS endpoint).

### Local identity provider

`npm run keycloak` auto-imports [`keycloak/realm-export.json`](keycloak/realm-export.json): a `nexus-insight` realm, a public `nexus-api` client, three realm roles, and three test users. Admin console: `http://localhost:8080` (`admin` / `admin`).

| Username | Password | Realm role | Access |
| --- | --- | --- | --- |
| `alice.admin` | `Passw0rd!` | `admin` | Full access — create, update, delete, manage governance data |
| `bob.manager` | `Passw0rd!` | `portfolio-manager` | Create/update, no delete |
| `carol.viewer` | `Passw0rd!` | `viewer` | Read-only |

### Auth endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Exchange a username/password for a token pair |
| `POST` | `/api/auth/refresh` | Exchange a refresh token for a new token pair |
| `POST` | `/api/auth/logout` | Revoke a refresh token and its session |
| `GET` | `/api/auth/me` | Return the caller's identity and roles (requires a Bearer token) |

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice.admin","password":"Passw0rd!"}'
```

`/api/auth/login` proxies Keycloak's Direct Access Grant flow for convenience during local development and testing. It is not a production login pattern for user-facing clients — those should use Authorization Code + PKCE against Keycloak directly.

### Protecting a route

```js
const { authenticate, authorize } = require('../../middleware/auth');

router.delete('/:id', authenticate, authorize('admin'), controller.remove);
```

`authenticate` verifies the token and attaches `req.user = { id, username, email, roles }`. `authorize(...roles)` rejects the request with a 403 unless `req.user.roles` includes at least one of the given Keycloak realm roles.

## API Documentation

Interactive Swagger UI is served at `http://localhost:3000/docs` once the server is running, generated from [`src/openapi/openapi.yaml`](src/openapi/openapi.yaml). Every request and response under `/api` is validated against this spec at runtime — the spec is an enforced contract, not just documentation.

## Project Structure

```text
src/
├── app.js                      # Express app setup
├── server.js                   # Entry point — loads env and starts server
├── config/                     # App, auth (Keycloak/OIDC), and DB configuration
├── middleware/
│   ├── auth.js                 # authenticate / authorize (Keycloak JWT verification)
│   └── error.js                # Central error-handling middleware
├── common/
│   ├── errors/                 # Shared error classes (NotFound, Unauthorized, Forbidden, Conflict, Validation)
│   └── vocabularies/           # Controlled-vocabulary lists mirrored from ontology/apm-ontology.ttl
├── openapi/                    # OpenAPI spec + Swagger UI / validator wiring
├── routes/
│   └── index.js                # Root router — mounts all module routes
└── modules/
    ├── auth/                   # Login/refresh/logout/me, backed by Keycloak

ontology/
├── apm-ontology.ttl            # The Nexus Insight APM Ontology (OWL/Turtle)

keycloak/
├── docker-compose.yml          # `npm run keycloak`
└── realm-export.json           # Realm, client, roles, and test users (auto-imported)
```
