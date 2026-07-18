# Nexus Insight

An intelligent Application Portfolio Management (APM) hub — a central registry for tracking applications across their lifecycle, investment posture, technology stack, and governance metadata.

## Tech Stack

- **Runtime** — Node.js with Express 5
- **Database** — MongoDB via Mongoose 9
- **Validation** — Joi
- **Auth** — JSON Web Tokens + bcrypt
- **Testing** — Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Docker)

### Install dependencies

```bash
npm install
```

### Start MongoDB (Docker)

```bash
npm run mongo
```

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
| `TOKEN_SECRET` | Secret used to sign JWTs |

Environment files: `.env.dev`, `.env.test`, `.env.prod`.

## Project Structure

```text
src/
├── app.js                      # Express app setup
├── server.js                   # Entry point — loads env and starts server
├── config/                     # App, auth, and DB configuration
├── middleware/                 # Auth, error handling, logging, validation
├── common/errors/              # Shared error classes
├── routes/
│   └── index.js                # Root router — mounts all module routes
└── modules/
    ├── registry/               # Application portfolio registry (implemented)
    ├── architecture/           # Architecture records (planned)
    ├── audit/                  # Audit log (planned)
    ├── dependency/             # Application dependencies (planned)
    ├── grc/                    # Governance, risk and compliance (planned)
    ├── health/                 # Application health (planned)
    ├── mcp/                    # MCP server integration (planned)
    ├── support/                # Support information (planned)
    └── users/                  # User management (planned)

tests/
└── unit/
    └── registry/               # Unit tests for all registry layers
```

## Registry Module

The registry module is the core of Nexus Insight. It stores key portfolio information for each application and follows a strict layered architecture:

```text
routes → controller → service → repository → schema → MongoDB
                    ↗
              validations
```

| Layer | File | Responsibility |
| --- | --- | --- |
| Router | `registry.routes.js` | Maps HTTP verbs and paths to controller handlers |
| Controller | `registry.controller.js` | Validates input, maps HTTP status codes, handles errors |
| Validations | `registry.validations.js` | Joi schemas for create and update payloads |
| Service | `registry.service.js` | Business logic, filter-to-query translation, stats orchestration |
| Repository | `registry.repository.js` | All Mongoose calls — the only layer that touches the database |
| Schema | `registry.schema.js` | Mongoose model and enum constants |

### Application Fields

| Field | Type | Values / Notes |
| --- | --- | --- |
| `name` | String | Required, unique |
| `lifecycleStatus` | Enum | `plan` `build` `test` `live` `deprecated` `retired` |
| `investmentLifecycle` | Enum | `invest` `maintain` `divest` |
| `criticality` | Enum | `low` `medium` `high` `critical` |
| `hostingModel` | Enum | `on-premise` `cloud-iaas` `cloud-paas` `saas` `hybrid` |
| `dataClassification` | Enum | `public` `internal` `confidential` `highly confidential` |
| `owner` | Object | `name`, `email`, `team` |
| `technology` | Object | `languages`, `frameworks`, `databases`, `integrations` |
| `businessCapability` | String | |
| `vendor` | String | For third-party applications |
| `repositoryUrl` | String | |
| `documentationUrl` | String | |
| `tags` | String[] | |
| `metadata` | Object | `version`, `lastReviewedAt`, `retirementDate` |
| `createdAt` / `updatedAt` | Date | Managed automatically by Mongoose |

### API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Health check — returns a welcome message |
| `GET` | `/api/registry` | List all applications (supports filters) |
| `GET` | `/api/registry/stats` | Counts grouped by status, investment lifecycle and criticality |
| `GET` | `/api/registry/:id` | Get a single application by ID |
| `POST` | `/api/registry` | Create a new application |
| `PUT` | `/api/registry/:id` | Update an application |
| `DELETE` | `/api/registry/:id` | Delete an application |

#### Query filters for `GET /api/registry`

| Parameter | Example |
| --- | --- |
| `lifecycleStatus` | `?lifecycleStatus=live` |
| `investmentLifecycle` | `?investmentLifecycle=divest` |
| `criticality` | `?criticality=critical` |
| `hostingModel` | `?hostingModel=saas` |
| `dataClassification` | `?dataClassification=confidential` |
| `tags` | `?tags=finance` or `?tags=finance&tags=core` |
| `search` | `?search=payments` (matches name, description, businessCapability) |

## Running Tests

```bash
npm test
```

Tests are located in `tests/unit/registry/` and cover all four layers independently using mocks — no database connection required.

| Suite | Coverage |
| --- | --- |
| `registry.validations.test.js` | Joi schema rules — required fields, enum values, formats |
| `registry.service.test.js` | Filter-to-query translation, stats shape, delegation |
| `registry.repository.test.js` | Mongoose call signatures and options |
| `registry.controller.test.js` | HTTP status codes, error mapping, request/response shape |

## Architecture Diagrams

PlantUML diagrams are in [`docs/architecture/`](docs/architecture/).

- `registry-module.puml` — component overview and request/response sequence diagrams

Render with the [PlantUML VS Code extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) (Alt+D to preview) or any PlantUML-compatible renderer.
