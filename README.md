# Nexus Insight

An intelligent Application Portfolio Management (APM) hub — a central registry for tracking applications across their lifecycle, investment posture, technology stack, and governance metadata, formalised by the [Nexus Insight APM Ontology](ontology/apm-ontology.ttl).

## Tech Stack

- **Runtime** — Node.js with Express 5
- **Database** — MongoDB via Mongoose 9
- **Validation** — Joi
- **Identity** — [Keycloak](https://www.keycloak.org/) (OAuth2/OIDC); the API verifies Keycloak-issued JWTs, it does not store credentials itself
- **API contract** — OpenAPI 3.0, served as interactive docs (Swagger UI) and enforced at runtime for every request/response under `/api`
- **AI access** — [Model Context Protocol](https://modelcontextprotocol.io/) server exposing read-only tools over the same service layer as the REST API, so an LLM client can answer portfolio questions in plain English
- **Testing** — Jest + Supertest
- **Evaluation** — an agentic-equivalence harness that compares an MCP-tool-using agent's answers — Claude, an open-source model, or both — against SPARQL ground truth — see [Evaluating agentic equivalence](#evaluating-agentic-equivalence)

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

### Dependency Intelligence Engine

[`src/modules/dependency-intelligence/`](src/modules/dependency-intelligence/) is the one module that isn't a 1:1 ontology-class CRUD resource — it's a read-only graph-analysis layer over the `ApplicationDependency`/`TechnologyDependency` edges the modules above already store, answering "what would be affected if this went down?" questions:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/dependency-intelligence/applications/:id/blast-radius` | Every application transitively downstream of the given one, via BFS over `ApplicationDependency` |
| `GET` | `/api/dependency-intelligence/technology-components/:id/blast-radius` | Every physical technology component transitively downstream of the given one, via BFS over `TechnologyDependency` |

Both accept an optional `?maxDepth=<n>` query param to bound the traversal, and both also run a DFS cycle check over the reachable subgraph, returning `hasCycle` (and the cycle itself, if found).

## MCP Server

`POST /mcp` exposes a [Model Context Protocol](https://modelcontextprotocol.io/) server ([`src/modules/mcp/`](src/modules/mcp/)) so an LLM client can query the portfolio in plain English instead of writing SPARQL or calling REST endpoints directly. It runs in-process inside the same Express app (Streamable HTTP transport, stateless — no session store), requires the same Bearer token and roles as the REST API (`authenticate` + `authorize('admin', 'portfolio-manager', 'viewer')`), and every call is recorded to the audit log alongside REST calls.

Each of the 34 ontology-mapped domain modules above contributes a `list_<resource>`/`get_<resource>` tool pair, and the Dependency Intelligence Engine contributes two more (`get_application_blast_radius`, `get_technology_blast_radius`) — 71 tools in total, registered in [`src/modules/mcp/tools/registry.js`](src/modules/mcp/tools/registry.js) and including one extra beyond the list/get pairs (`get_application_stats`). Every tool is a thin, read-only wrapper around the same `*.service.js` the REST controller calls — no separate business logic, no create/update/delete tools yet. `list_*` tools accept the same filters as their REST `GET` list endpoint;

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

Every call under `/api` is recorded to an `AuditLog` MongoDB collection by [`middleware/logger.js`](src/middleware/logger.js): method, path, status code, duration, caller IP, and — when the route ran `authenticate` beforehand — the identity that made the call (`userId`, `username`, `roles`; recorded as `"anonymous"` otherwise).

Request/response bodies and headers are deliberately never recorded — that would otherwise put the password from `/api/auth/login` or bearer tokens straight into the audit trail.

There is currently no endpoint to read these entries back through the API — querying them today means going straight to MongoDB.

## Ontology

The ontology itself lives in [`ontology/`](ontology/):

| File | Purpose |
| --- | --- |
| `apm-ontology.ttl` | The Nexus Insight APM Ontology (OWL/Turtle) |
| `apm-shapes.ttl` | SHACL shapes constraining the ontology's classes/properties |
| `apm-instances-sample.ttl` | A sample instance dataset used to exercise the ontology |
| `apm-competency-queries.sparql` | SPARQL competency questions answered against the sample dataset |
| `seed-sample-data.js` | Loads `apm-instances-sample.ttl`'s scenario into MongoDB — see [Seeding sample data](#seeding-sample-data) |
| `evaluate-agentic-equivalence.js` | Compares an MCP-tool-using agent against SPARQL ground truth — see [Evaluating agentic equivalence](#evaluating-agentic-equivalence) |

Every concrete class the ontology defines has a backend module and SHACL shapes constrain the classes where cardinality is unambiguous.

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

### Seeding sample data

```bash
npm run seed:sample-data              # seed once; no-op if already seeded
npm run seed:sample-data -- --reset   # delete the previous seed, then reseed
```

Runs [`ontology/seed-sample-data.js`](ontology/seed-sample-data.js), which loads `apm-instances-sample.ttl`'s scenario into MongoDB through the real REST API (not direct Mongoose inserts), so the seeded data is guaranteed to pass the same Joi/OpenAPI/Mongoose validation the live system enforces. This gives a reproducible dataset whose results should agree with the SPARQL queries run directly against the ontology — the shared basis for both the competency-question regression tests and the agentic-equivalence evaluation below. Requires MongoDB and the dev server running (`npm run mongo`, `npm run env:dev`).

### Evaluating agentic equivalence

```bash
npm run evaluate:agentic-equivalence
npm run evaluate:agentic-equivalence -- --only=CQ-1,CQ-14
npm run evaluate:agentic-equivalence -- --providers=anthropic,openai-compatible
```

Runs [`ontology/evaluate-agentic-equivalence.js`](ontology/evaluate-agentic-equivalence.js): for each of the 14 competency questions, an agent equipped with the same MCP tool surface the REST API's controllers use ([`src/modules/mcp`](src/modules/mcp/)) is given the question as a natural-language prompt, explores the portfolio via real tool calls against the live (seeded) MongoDB data, and submits its final answer through a harness-only `submit_answer` tool. That structured answer — not the agent's free-text commentary — is compared against the ground truth produced by running the equivalent SPARQL query over `apm-ontology.ttl` + `apm-instances-sample.ttl`, and results are reported per-trial and as an overall agreement rate.

This is the project's central evaluation: it tests whether an LLM agent using the MCP tool surface is *equivalent* to a deterministic SPARQL query over the same ontology, not just whether the tools work in isolation. Requires MongoDB seeded to match `apm-instances-sample.ttl` (see [Seeding sample data](#seeding-sample-data) above).

Two model providers are supported, run side by side via `--providers=` (or the `EVAL_PROVIDERS` env var) — a comma-separated list, defaulting to `anthropic` alone so existing invocations are unaffected:

| Provider | Description | Required environment |
| --- | --- | --- |
| `anthropic` | Claude, via the Messages API | `ANTHROPIC_API_KEY`; optionally `ANTHROPIC_EVAL_MODEL` (default `claude-sonnet-5`) |
| `openai-compatible` | Any open-source model behind an OpenAI-compatible `/chat/completions` endpoint with function calling — e.g. [Ollama](https://ollama.com/), vLLM, LM Studio | `OSS_EVAL_MODEL` (e.g. `llama3.1`, `qwen2.5:14b`); optionally `OSS_EVAL_BASE_URL` (default `http://localhost:11434/v1`) and `OSS_EVAL_API_KEY` |

Ground truth is computed once per competency question and shared across every provider in the run, so the printed and saved results are directly comparable model-to-model — the point being not just "does this model answer correctly" but "is a self-hosted open-source model an equivalent substitute for Claude here."

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
    ├── dependency-intelligence/ # BFS blast-radius + DFS cycle detection — no schema of its own
    │                           #   (see Dependency Intelligence Engine above)
    └── mcp/
        ├── server.js           # McpServer factory
        ├── mcp.router.js       # Express router — Streamable HTTP transport, mounted at /mcp
        └── tools/              # One list_x/get_x tools file per domain module, plus
                                 #   dependencyIntelligence.tools.js + registry.js

ontology/
├── apm-ontology.ttl                  # The Nexus Insight APM Ontology (OWL/Turtle)
├── apm-shapes.ttl                    # SHACL shapes
├── apm-instances-sample.ttl          # Sample instance dataset
├── apm-competency-queries.sparql     # SPARQL competency questions
├── validate-ttl.js                   # `npm run validate:ontology`
├── validate-competency-queries.js    # `npm run validate:competency-queries`
├── seed-sample-data.js               # `npm run seed:sample-data`
└── evaluate-agentic-equivalence.js   # `npm run evaluate:agentic-equivalence`

keycloak/
├── docker-compose.yml          # `npm run keycloak`
└── realm-export.json           # Realm, client, roles, and test users (auto-imported)
```
