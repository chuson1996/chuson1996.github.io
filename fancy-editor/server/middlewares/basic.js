/**
 * Created by chuso_000 on 19/9/2015.
 */
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');

var routes = require('../../routes/index');
var users = require('../../routes/users');
var express = require('express');

module.exports = function (app) {
    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '/../../public')));

    app.use('/', routes);
    app.use('/users', users);

};