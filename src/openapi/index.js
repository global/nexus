const path = require('node:path');
const fs = require('node:fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const specPath = path.join(__dirname, 'openapi.yaml');

/**
 * The parsed OpenAPI document, loaded once at startup.
 * 
 * This is used to serve the Swagger UI documentation and to configure the validation middleware. 
 * It is currently loaded from a YAML file, manually generated from the OpenAPI spec in `docs/openapi.yaml`. 
 * In the future, this could be generated dynamically from the Mongoose schemas and route definitions.
 *
 * @type {object}
 */
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));

/**
 * Setup the OpenAPI contract onto an Express app:
 *  - interactive documentation (Swagger UI) at `/docs`;
 *  - runtime request/response validation for every path declared in the
 *    spec's `servers` base path (currently `/api`), so malformed requests
 *    are rejected before reaching a controller, and responses that drift
 *    from the documented shape are caught rather than silently shipped.
 *
 *
 * @param {import('express').Express} app
 */
function setupOpenApi(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.use(
    OpenApiValidator.middleware({
      apiSpec: spec,
      validateRequests: true,
      validateResponses: true,
    })
  );
}

module.exports = { setupOpenApi, spec };
