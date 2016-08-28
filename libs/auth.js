var data = require("./data.js");
var debug = require("debug")("authorizer");
var Q = require("q");
var url = require('url');

/**
 * function authenticate
 *
 * This function merely confirms that a User exists on the system - it should not be
 * used to determine if the User has any permissions.
 *
 * The general response pattern will be followed, with all appropriate attributes of the
 * User and related tables being returned.
 *
 * @param req
 * @returns {*|promise}
 */

function authenticate(req, res, next) {
    var deferred = Q.defer();

    if(req.params.auth) {
        if(req.params.api) {
            if(req.params.access) {
                deferred.resolve(req.params.auth);
            } else {
                deferred.reject("please provide ACCESS token.");
            }
        } else {
            deferred.reject("Please provide API token.");
        }
    } else {
        deferred.reject("Unauthorized");
    }

    return deferred.promise;
}

var auth = {};

/** Single Authorization **/
auth.authenticate = authenticate;

module.exports = auth;