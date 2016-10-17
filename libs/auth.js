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
    next();
}

function check(req) {

}

var auth = {};

/** Single Authorization **/
auth.authenticate = authenticate;
auth.check = check;

module.exports = auth;