const express = require('express');
const routes = require('./routes/index.js');
const connectDB = require('./db.js');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const auditLogger = require('./middleware/logger');
const { setupOpenApi } = require('./openapi');

connectDB();

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mounted before the OpenAPI validator and routes so every /api call is
// audited, including ones the validator itself rejects.
app.use('/api', auditLogger);

// Setup OpenAPI validator and spec docs
setupOpenApi(app);

// Mount all routes under /api
app.use(routes);

// Catch-all for 404s and other errors
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;