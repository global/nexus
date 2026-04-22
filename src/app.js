const express = require('express');
const routes = require('./routes/index.js');


const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


module.exports = app;