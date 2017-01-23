var crypto = require('crypto');
var data = require("./data.js");
var debug = require("debug")("authorizer");
var Q = require("q");
var url = require('url');

var LEN = 256;
var SALT_LEN = 64;
var ITERATIONS = 10000;
var DIGEST = 'sha256';

var auth = {};

auth.hashPassword = function(password, salt, callback) {
    var len = LEN / 2;

    if (3 === arguments.length) {
        crypto.pbkdf2(password, salt, ITERATIONS, len, DIGEST, function(err, derivedKey) {
            if (err) {
                return callback(err);
            }

            return callback(null, derivedKey.toString('hex'));
        });
    } else {
        callback = salt;
        crypto.randomBytes(SALT_LEN / 2, function(err, salt) {
            if (err) {
                return callback(err);
            }

            salt = salt.toString('hex');
            crypto.pbkdf2(password, salt, ITERATIONS, len, DIGEST, function(err, derivedKey) {
                if (err) {
                    return callback(err);
                }

                callback(null, derivedKey.toString('hex'), salt);
            });
        });
    }
};

auth.getSalt = function(callback) {
    callback(null, crypto.randomBytes(256).toString("hex"));
};

auth.createUser = function(body) {
    var deferred = Q.defer();

    auth.getSalt(function(err, salt) {
        if(err) {
            deferred.reject(false);
        } else {
            auth.hashPassword(body.password, salt, function(err, password) {
                if(err) {
                    deferred.reject(false);
                } else {
                    var user = {email: body.email, password: password, salt: salt, username: body.username};
                    data.User.findOrCreate({where:user}).then(function(response) {
                        if(response[1]) {
                            deferred.resolve(user);
                        } else {
                            deferred.reject(false);
                        }
                    }).catch(function(err) {
                        debug(err);
                        deferred.reject(err);
                    });
                }
            });
        }
    });

    return deferred.promise;
};

module.exports = auth;