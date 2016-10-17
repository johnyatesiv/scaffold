/** Module **/
var data = {};

var debug = require("debug")("data");
var fs = require("fs");
//var mongojs = require('mongojs');
var Q = require("q");
//var Redis = require('promise-redis')(Q.promise);
//var Sequelize = require("sequelize");

/** Globals **/
var config = require('../config/config.js');

///** Mongo **/
//createMongoConnection();
//
///** Redis **/
//createRedisConnection();
//
///** MySQL **/
//createSequelizeConnection();
//
//
///** Functions **/
///** MongoDB **/
//function createMongoConnection() {
//    if(config.mongo.host == "localhost") {
//        data.mongo = mongojs(config.mongo.host + '/' + config.mongo.database, config.collections);
//    } else {
//        data.mongo = mongojs(config.mongo.user + ':' + config.mongo.password + '@' + config.mongo.host + '/' + config.mongo.database, config.collections);
//    }
//}
//
///** MongoDB **/
//function createSequelizeConnection() {
//    data.mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password,
//        {host: config.mysql.host, dialect: "mysql", port: 3306, logging: false, define: {timestamps: false}});
//}
//
///** Redis **/
//function createRedisConnection() {
//    data.redis = Redis.createClient();
//
//    data.redis.on('ready', function() {
//        debug("Redis connected.");
//    });
//
//    data.redis.on("error", function (err) {
//        debug("Redis Error: " + err);
//    });
//}

module.exports = data;