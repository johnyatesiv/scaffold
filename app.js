"use strict"

/** Core Dependencies **/
var express = require("express");
var debug = require('debug')('api');

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
var api = express();
var config = require('./config/config.js');

/** Setup Functions **/

function init() {
    api.use(bodyParser.json()); // to support JSON-encoded bodies
    api.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
    api.use(bodyParser.urlencoded({extended: false}));
    api.use(bodyParser.json());
    api.use(auth.authenticate());

    if(config.ssl) {
        createSecureServer();
    } else {
        createServer();
    }

    api.set('views', __dirname + '/views');
    api.set('view engine', 'jade');

    process.on("uncaughtException", function(e) {
        if(e.stack) {
            debug(e.stack);
        } else {
            debug(e);
        }
    });

    routes(api);
}

function createServer() {
    http.createServer(api).listen(config.settings.port, "localhost", function() {
        debug(config.settings.name+" listening without SSL on port "+config.settings.port);
    });
}

function createSecureServer() {
    https.createServer(credentials, api).listen(config.settings.port, "localhost", function() {
        debug(config.settings.name+" listening on port "+config.settings.port);
    });
}

function routes(api) {
    api.post("/login", function(req, res, next) {
        auth.user(req).then(function(response) {
            res.send(response);
            next();
        }).catch(function(err) {
            res.send({success: false, message: err});
            next();
        });
    });

    api.get('/', function(req, res) {
        res.render('home.jade');
    });
}

init();

module.exports.api = api;
module.exports.express = express;