require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const app = express();
const server = require('http').Server(app);
app.use(compression());
require('./startup/logging')(app);
require('./startup/ratelimit')(app);
require('./startup/routes')(app);
require('./startup/sanitization')(app);
require('./startup/db')();

module.exports = { app, server };