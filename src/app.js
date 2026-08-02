const express = require('express');
const routes = require('./routes/index.js');
const connectDB = require('./db.js');
const { errorHandler, notFoundHandler } = require('./middleware/error');

connectDB();

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;