# Nexus Insight

An intelligent Application Portfolio Management (APM) hub — a central registry for tracking applications across their lifecycle, investment posture, technology stack, and governance metadata, formalised by the [Nexus Insight APM Ontology](ontology/apm-ontology.ttl).

## Tech Stack

- **Runtime** — Node.js with Express 5
- **Database** — MongoDB via Mongoose 9
- **Validation** — Joi
- **Identity** — [Keycloak](https://www.keycloak.org/) (OAuth2/OIDC); the API verifies Keycloak-issued JWTs, it does not store credentials itself
- **API contract** — OpenAPI 3.0, served as interactive docs (Swagger UI) and enforced at runtime for every request/response under `/api`
- **AI access** — [Model Context Protocol](https://modelcontextprotocol.io/) server (`@modelcontextprotocol/sdk`) exposing read-only tools over the same service layer as the REST API, so an LLM client can answer portfolio questions in plain English
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

## Domain Modules & REST API

Every concrete class in the [Nexus Insight APM Ontology](ontology/apm-ontology.ttl) has a matching backend module — 34 resources in total, each following the same layered pattern (`routes → controller → validations → service → repository → schema`.

```text
GET    /api/<resource>       # list, with resource-specific filter query params
POST   /api/<resource>       # create (admin, portfolio-manager)
GET    /api/<resource>/:id   # get one
PUT    /api/<resource>/:id   # update (admin, portfolio-manager)
DELETE /api/<resource>/:id   # delete (admin only)
```

All routes require a Bearer token (`authenticate`); write/delete access is additionally gated by role (`authorize`) as shown above. Full request/response schemas and per-resource filters are in the Swagger UI (see [API Documentation](#api-documentation)) — this table is just the map of what exists, grouped by the ontology's layers:

| Layer | Resources |
| --- | --- |
| Business | `actors`, `roles`, `organization-units`, `locations`, `business-functions`, `business-processes`, `business-services`, `business-capabilities`, `portfolios` |
| Application | `applications`, `application-contacts`, `application-dependencies`, `logical-application-components`, `physical-application-components` |
| Data | `data-entities`, `logical-data-components`, `physical-data-components` |
| Technology | `technology-services`, `logical-technology-components`, `physical-technology-components`, `technology-dependencies` |
| Governance & Risk | `controls`, `findings`, `suppliers`, `cost-records`, `performance-assessments`, `service-level-agreements`, `sla-metrics` |
| Software Asset Management (ISO/IEC 19770) | `software-products`, `software-entitlements`, `metrics`, `resource-utilization-records` |
| Reference documents | `documents`, `code-repositories` |

The two abstract ontology superclasses, `apm:Dependency` and `apm:LinkedResource`, are never instantiated directly (`ApplicationDependency`/`TechnologyDependency` and `Document`/`CodeRepository` are their concrete subclasses) and so have no module of their own — every other class does. All 14 SPARQL competency questions in [`apm-competency-queries.sparql`](ontology/apm-competency-queries.sparql) are answerable through this API.

## MCP Server

`POST /mcp` exposes a [Model Context Protocol](https://modelcontextprotocol.io/) server ([`src/modules/mcp/`](src/modules/mcp/)) so an LLM client can query the portfolio in plain English instead of writing SPARQL or calling REST endpoints directly. It runs in-process inside the same Express app (Streamable HTTP transport, stateless — no session store), requires the same Bearer token and roles as the REST API (`authenticate` + `authorize('admin', 'portfolio-manager', 'viewer')`), and every call is recorded to the audit log alongside REST calls.

Each of the 34 domain modules above contributes a `list_<resource>`/`get_<resource>` tool pair (registered in [`src/modules/mcp/tools/registry.js`](src/modules/mcp/tools/registry.js)) — 69 tools in total, including one extra (`get_application_stats`). Every tool is a thin, read-only wrapper around the same `*.service.js` the REST controller calls — no separate business logic, no create/update/delete tools yet. `list_*` tools accept the same filters as their REST `GET` list endpoint; a `NotFoundError` from the service layer is returned as an in-band MCP tool error (`isError: true`) rather than a protocol-level failure.

To point an MCP-aware client (e.g. Claude Code) at it, configure a Streamable HTTP server entry for `http://localhost:3000/mcp` with an `Authorization: Bearer <token>` header, using a token from [`/api/auth/login`](#auth-endpoints). To exercise it directly:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_application_stats","arguments":{}}}'
```

## API Documentation

Interactive Swagger UI is served at `http://localhost:3000/docs` once the server is running, generated from [`src/openapi/openapi.yaml`](src/openapi/openapi.yaml). Every request and response under `/api` is validated against this spec at runtime — the spec is an enforced contract, not just documentation.

## Audit Logging

Every call under `/api` is recorded to an `AuditLog` MongoDB collection by [`middleware/logger.js`](src/middleware/logger.js): method, path, status code, duration, caller IP, and — when the route ran `authenticate` beforehand — the identity that made the call (`userId`, `username`, `roles`; recorded as `"anonymous"` otherwise). Logging happens on the response's `finish` event, so it captures the actual outcome and still records calls the OpenAPI validator itself rejects.

Request/response bodies and headers are deliberately never recorded — that would otherwise put the password from `/api/auth/login` or bearer tokens straight into the audit trail. A failed write to the audit log is logged to the console but never blocks or fails the actual response.

There is currently no endpoint to read these entries back through the API — querying them today means going straight to MongoDB.

## Ontology

The ontology itself lives in [`ontology/`](ontology/):

| File | Purpose |
| --- | --- |
| `apm-ontology.ttl` | The Nexus Insight APM Ontology (OWL/Turtle) |
| `apm-shapes.ttl` | SHACL shapes constraining the ontology's classes/properties |
| `apm-instances-sample.ttl` | A sample instance dataset used to exercise the ontology |
| `apm-competency-queries.sparql` | SPARQL competency questions answered against the sample dataset |

Every concrete class the ontology defines has a backend module and SHACL shapes constrain the classes where cardinality is unambiguous — see [Domain Modules & REST API](#domain-modules--rest-api) for the full mapping.

### Validating Turtle syntax

```bash
npm run validate:ontology
```

Runs [`ontology/validate-ttl.js`](ontology/validate-ttl.js) against every `.ttl` file in `ontology/` (or specific files passed as arguments), using [N3.js](https://github.com/rdfjs/N3.js) to parse each one and report a line-numbered error for anything that isn't valid Turtle. This checks syntax only — not OWL/SHACL semantics — and exits non-zero on failure, so it's usable as a CI or pre-commit gate.

### Running the competency questions

```bash
npm run validate:competency-queries
```

Runs [`ontology/validate-competency-queries.js`](ontology/validate-competency-queries.js), which parses every SPARQL query straight out of `apm-competency-queries.sparql` (so the `.sparql` file stays the single source of truth for the queries themselves), executes each one against `apm-ontology.ttl` + `apm-instances-sample.ttl` via [Comunica](https://comunica.dev/), and asserts the actual results against hand-verified expectations. This is a regression test for the ontology + sample dataset pairing — if an edit to either file changes what a competency question returns, this catches it and exits non-zero.

The expectations are based on running each query and checking its real output, not on blindly trusting the `.sparql` file's "Expected result" comments.

## Project Structure

```text
src/
├── app.js                      # Express app setup
├── server.js                   # Entry point — loads env and starts server
├── config/                     # App, auth (Keycloak/OIDC), and DB configuration
├── middleware/
│   ├── auth.js                 # authenticate / authorize (Keycloak JWT verification)
│   ├── error.js                # Central error-handling middleware
│   └── logger.js                # Audit logging (see Audit Logging above)
├── common/
│   ├── errors/                 # Shared error classes (NotFound, Unauthorized, Forbidden, Conflict, Validation)
│   └── vocabularies/           # Controlled-vocabulary lists mirrored from ontology/apm-ontology.ttl
├── openapi/                    # OpenAPI spec + Swagger UI / validator wiring
├── routes/
│   └── index.js                # Root router — mounts all module routes
└── modules/
    ├── applications/           # apm:Application, and 33 sibling directories —
    ├── .../                    #   one per ontology class, same six-layer shape
    │                           #   (see Domain Modules & REST API above)
    ├── auth/                   # Login/refresh/logout/me, backed by Keycloak
    ├── audit/                  # AuditLog Mongoose schema
    └── mcp/
        ├── server.js           # McpServer factory
        ├── mcp.router.js       # Express router — Streamable HTTP transport, mounted at /mcp
        └── tools/              # One list_x/get_x tools file per domain module + registry.js

ontology/
├── apm-ontology.ttl                  # The Nexus Insight APM Ontology (OWL/Turtle)
├── apm-shapes.ttl                    # SHACL shapes
├── apm-instances-sample.ttl          # Sample instance dataset
├── apm-competency-queries.sparql     # SPARQL competency questions
├── validate-ttl.js                   # `npm run validate:ontology`
└── validate-competency-queries.js    # `npm run validate:competency-queries`

keycloak/
├── docker-compose.yml          # `npm run keycloak`
└── realm-export.json           # Realm, client, roles, and test users (auto-imported)
```
