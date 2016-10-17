"use strict"

/** Core Dependencies **/
var express = require("express");
var debug = require('debug')('app');

/** Dependencies **/
var auth = require("./libs/auth.js");
var bodyParser = require("body-parser");
var crypto = require('crypto');
var fs = require("fs");
var https = require("https");
var http = require("http");

/** Globals **/
//var privateKey  = fs.readFileSync('', 'utf8');
//var certificate = fs.readFileSync('', 'utf8');
//var privateKey  = fs.readFileSync('certs/ssl.key', 'utf8');
//var certificate = fs.readFileSync('certs/ssl.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};
var app = express();
var config = require('./config/config.js');

/** Setup Functions **/

function init() {
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(auth.authenticate);

    if(config.ssl) {
        createSecureServer(app);
    } else {
        createServer(app);
    }

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/public/views');

    process.on("uncaughtException", function(e) {
        if(e.stack) {
            debug(e.stack);
        } else {
            debug(e);
        }
    });

    routes(app);
}

function createServer(app) {
    http.createServer(app).listen(config.settings.port, "localhost", function() {
        debug(config.settings.name+" listening without SSL on port "+config.settings.port);
    });
}

function createSecureServer(app) {
    https.createServer(credentials, app).listen(config.settings.port, "localhost", function() {
        debug(config.settings.name+" listening on port "+config.settings.port);
    });
}

function routes(app) {
    app.post("/login", function(req, res, next) {
        auth.user(req).then(function(response) {
            res.send(response);
            next();
        }).catch(function(err) {
            res.send({success: false, message: err});
            next();
        });
    });

    app.get('/', function(req, res) {
        res.render('index.html');
    });
}

init();

module.exports.app = app;
module.exports.express = express;