const path = require('node:path');
const fs = require('node:fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const specPath = path.join(__dirname, 'openapi.yaml');

/**
 * The parsed OpenAPI document, loaded once at startup. Exported so other
 * modules (e.g. a future test suite) can inspect the contract directly.
 *
 * @type {object}
 */
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));

/**
 * Mounts the OpenAPI contract onto an Express app:
 *  - interactive documentation (Swagger UI) at `/docs`;
 *  - runtime request/response validation for every path declared in the
 *    spec's `servers` base path (currently `/api`), so malformed requests
 *    are rejected before reaching a controller, and responses that drift
 *    from the documented shape are caught rather than silently shipped.
 *
 * Must be mounted before the routes it is meant to guard.
 *
 * @param {import('express').Express} app
 */
function mountOpenApi(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.use(
    OpenApiValidator.middleware({
      apiSpec: spec,
      validateRequests: true,
      validateResponses: true,
    })
  );
}

module.exports = { mountOpenApi, spec };
