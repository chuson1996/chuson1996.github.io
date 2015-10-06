var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// set up middlewares
require('./server/middlewares/basic')(app);
require('./server/middlewares/jquery-file-upload-middleware')(app);

// your program goes here



// -----
require('./server/errorHandler')(app);


module.exports = app;
