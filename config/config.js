var config = {};

/** Application **/
config.settings = {};

config.settings.name = "Fourth Estate";
config.settings.port = 8000;

/** DataBase **/

config.mysql = {
    host: "127.0.0.1",
    database: "fourthestate",
    user: "root",
    password: "password"
};

module.exports = config;
