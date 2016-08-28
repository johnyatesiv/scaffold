var config = {};

/** Application **/
config.settings = {};

config.settings.name = "The Meadery";
config.settings.port = 55800;

/** DataBase **/

config.mongo = {};
config.mongo.host = "localhost";
config.mongo.database = "meadery";

module.exports = config;
