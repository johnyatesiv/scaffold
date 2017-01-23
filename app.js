"use strict"

/** Core Dependencies **/
var express = require("express");
var debug = require('debug')('app');

/** Dependencies **/
var auth = require("./libs/auth.js");
var bodyParser = require("body-parser");
var crypto = require('crypto');
var data = require("./libs/data.js");
var calculations = require("./libs/calculations.js");
var fs = require("fs");
var https = require("https");
var http = require("http");
var mustacheExpress = require('mustache-express');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;

/** Globals **/
//var privateKey  = fs.readFileSync('', 'utf8');
//var certificate = fs.readFileSync('', 'utf8');
//var privateKey  = fs.readFileSync('certs/ssl.key', 'utf8');
//var certificate = fs.readFileSync('certs/ssl.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};
var app = express();
var config = require('./config/config.js');

/** Setup Functions **/

passport.use(new LocalStrategy(function(email, password, done) {
        data.User.findOne({email: email}).then(function(user) {
            auth.hashPassword(password, user.dataValues.salt, function(err, password) {
                if(!user) {
                    return done(null, false);
                } else if (!user.password != password) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            });
        }).catch(function(err) {
            return done(err);
        });
    }
));

function init() {
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('public'));

    if(config.ssl) {
        createSecureServer(app);
    } else {
        createServer(app);
    }

    app.engine('html', mustacheExpress());
    app.set('view engine', 'mustache');
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
    app.post("/login", passport.authenticate('local', { failureRedirect: '/login' }), function(req, res, next) {
        res.send(true);
        next();
    });

    app.post("/register", function(req, res, next) {
        debug(req.body);
        if(req.body.email && req.body.password && req.body.repeat_password) {
            auth.createUser(req.body).then(function(user) {
                res.redirect("/sources");
            }).catch(function(err) {
                res.render("error.html");
            });
        } else {
            res.render("error.html");
        }
    });

    app.get("/", function(req, res) {
        res.render("index.html");
    });

    app.get("/about", function(req, res) {
        res.render("about.html");
    });

    app.get("/sources", function(req, res) {
        data.Source.findAll({where: {}}).then(function(sources) {
            for(var s in sources) {
                sources[s] = sources[s].dataValues;
            }

            res.render("sources.html", {sources: sources});
        }).catch(function(err) {
            debug(err);
            res.render("error.html");
        });
    });

    app.get("/sources/:id", function(req, res, next) {
        data.Source.find({where: {id: req.params.id}}).then(function(source){
            if(source.dataValues.score == null) {
                source.dataValues.score = "No reviews yet.";
            } else {
                source.dataValues.score = source.dataValues.score+"%";
            }

            res.render("source.html", {source: source.dataValues});
            next();
        }).catch(function(err) {
            debug(err);
            res.render("error.html");
            next();
        });
    });

    app.get("/forums", function(req, res) {
        data.Forum.findAll({where: {}, include: [{model: data.Source, required: true}], options: {limit: 30}})
            .then(function(forums) {
                for(var f in forums) {
                    forums[f].dataValues.source_name = forums[f].source.dataValues.name;
                    forums[f] = forums[f].dataValues;
                }

                res.render("forums.html", {forums: forums});
            }).catch(function(err) {
                res.render("error.html");
            });
    });

    app.get("/forums/:id", function(req, res, next) {
        data.Forum.find({where: {id: req.params.id}}).then(function(forum) {
            res.render("forum.html", {forum: forum.dataValues});
            next();
        }).catch(function(err) {
            res.render("error.html");
            next();
        });
    });

    app.get("/reviews/:id", function(req, res, next) {
        data.Review.find({where: {id: req.params.id}}).then(function(review) {
            res.render("review.html", {review: review.dataValues});
            next();
        }).catch(function(err) {
            res.render("error.html");
            next();
        });
    });

    /** API **/
    app.post("/api/v1/reviews", function(req, res, next) {
        data.Review.create(req.body).then(function(response) {
            res.json({ok: true});
            next();
        }).catch(function(err) {
            res.json({ok: false});
            next();
        });
    });

    app.get("/api/v1/score/:domain", function(req, res, next) {
        data.Source.find({where: {domain: domain}}).then(function(source) {
            res.json({ok: true, score: source.dataValues.score});
            next();
        }).catch(function(err) {
            res.json({ok: false});
            next();
        });
    });

    app.get("/api/v1/ping", function(req, res, next) {
        res.json({ok: true, message:"Pong!"});
        next();
    });
}

init();

module.exports.app = app;
module.exports.express = express;