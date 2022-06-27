var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');

var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRouter);

module.exports = app;
